// src/app/api/ai-resume-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { createClient } from "@supabase/supabase-js";
import mammoth from "mammoth";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// Supabase server client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

type AiMatchResult = {
  matchScore: number;
  summary: string;
  topStrengths: string[];
  risksOrGaps: string[];
  suggestedNextStep: string;
  resumeUrl?: string | null;
};

// --- helper: robust text extraction for PDF/DOCX/TXT ------------------------

export const runtime = "nodejs";

async function extractResumeText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const ext = (file.name.split(".").pop() || "").toLowerCase();
  const mime = file.type;

  // PDF
  if (mime === "application/pdf" || ext === "pdf") {
    try {
      const pdfModule = await import("pdf-parse");
      // pdf-parse is CommonJS; support both .default and function export
      const parser = (pdfModule as any).default || (pdfModule as any);
      const data = await parser(buffer);
      return (data && (data as any).text) || "";
    } catch (err) {
      console.warn(
        "[ai-resume-match] pdf-parse failed, falling back to utf8:",
        err,
      );
      return buffer.toString("utf8");
    }
  }

  // DOCX
  if (
    mime ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    ext === "docx"
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer });
      return result.value || "";
    } catch (err) {
      console.warn(
        "[ai-resume-match] mammoth failed, falling back to utf8:",
        err,
      );
      return buffer.toString("utf8");
    }
  }

  // Plain text or unknown: best-effort UTF-8
  try {
    return buffer.toString("utf8");
  } catch {
    return "";
  }
}

// ---------------------------------------------------------------------------

export async function POST(req: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 },
    );
  }

  try {
    const formData = await req.formData();

    const jobDescription =
      (formData.get("jobDescription") as string | null) ?? "";
    const candidateNotes =
      (formData.get("candidateNotes") as string | null) ?? "";
    const file = formData.get("file") as File | null;

    console.log("[ai-resume-match] fields:", {
      jobDescriptionLength: jobDescription.length,
      candidateNotesLength: candidateNotes.length,
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
    });

    if (!jobDescription.trim()) {
      return NextResponse.json(
        { error: "jobDescription is required" },
        { status: 400 },
      );
    }

    // ---- Supabase upload (if file present) + text extraction ----
    let resumeText = "";
    let resumeUrl: string | null = null;

    if (file && file.size > 0) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        const ext = file.name.split(".").pop() || "bin";
        const path = `resumes/${Date.now()}-${Math.random()
          .toString(36)
          .slice(2)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from("resumes") // make sure this bucket exists
          .upload(path, buffer, {
            contentType: file.type || "application/octet-stream",
            upsert: false,
          });

        if (uploadError) {
          console.error(
            "[ai-resume-match] Supabase upload error:",
            uploadError,
          );
        } else {
          const { data: publicData } = supabase.storage
            .from("resumes")
            .getPublicUrl(path);

          resumeUrl = publicData.publicUrl;
        }

        // 🎯 Robust parsing for pdf/docx/txt
        resumeText = await extractResumeText(file);
      } catch (err) {
        console.warn(
          "[ai-resume-match] failed to upload/read file:",
          err,
        );
      }
    }

    const candidateProfile = [candidateNotes, resumeText]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join("\n\n");

    if (!candidateProfile) {
      const fallback: AiMatchResult = {
        matchScore: 0,
        summary:
          "There is no candidate information available to evaluate the candidate's fit for this role.",
        topStrengths: [],
        risksOrGaps: [
          "No resume, notes, or candidate profile information was provided.",
        ],
        suggestedNextStep:
          "Collect the candidate's resume or notes and re-run the AI resume match.",
        resumeUrl,
      };
      return NextResponse.json(fallback);
    }

    const systemPrompt = `
You are an AI recruiting assistant. Given a job description and a candidate profile (resume text + recruiter notes), you must:

- Estimate a match score between 0 and 100
- Summarize overall fit in 3–6 sentences
- List 3–6 top strengths, specific and role-relevant
- List 3–6 risks or gaps, specific and actionable
- Suggest one clear next step

Return ONLY valid JSON with the shape:
{
  "matchScore": number,
  "summary": string,
  "topStrengths": string[],
  "risksOrGaps": string[],
  "suggestedNextStep": string
}
`;

    const userPrompt = `
JOB DESCRIPTION:
${jobDescription}

---

CANDIDATE PROFILE (RESUME + NOTES):
${candidateProfile}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt.trim() },
        { role: "user", content: userPrompt.trim() },
      ],
      temperature: 0.2,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: Partial<AiMatchResult> = {};
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("[ai-resume-match] JSON parse error:", err, raw);
    }

    const result: AiMatchResult = {
      matchScore:
        typeof parsed.matchScore === "number" ? parsed.matchScore : 0,
      summary: parsed.summary || "No summary was returned by the model.",
      topStrengths: Array.isArray(parsed.topStrengths)
        ? parsed.topStrengths
        : [],
      risksOrGaps: Array.isArray(parsed.risksOrGaps)
        ? parsed.risksOrGaps
        : [],
      suggestedNextStep:
        parsed.suggestedNextStep ||
        "No suggested next step was returned by the model.",
      resumeUrl,
    };

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("[ai-resume-match] unexpected error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
