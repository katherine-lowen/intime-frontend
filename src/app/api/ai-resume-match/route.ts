// src/app/api/ai-resume-match/route.ts
import { NextResponse, type NextRequest } from "next/server";
import { Buffer } from "node:buffer";
import OpenAI from "openai";
import { createSupabaseServerClient } from "@/lib/supabase-server";
import type { SupabaseClient } from "@supabase/supabase-js";

export const runtime = "nodejs"; // needed for Buffer + pdf parsing

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

async function extractPdfText(buffer: Buffer): Promise<string> {
  // dynamic import avoids TS + CJS default-export issues
  const pdfModule = await import("pdf-parse");
  const pdf: any = (pdfModule as any).default || pdfModule;
  const parsed = await pdf(buffer);
  return parsed.text || "";
}

async function uploadToSupabase(
  supabase: SupabaseClient,
  file: File,
): Promise<{ url: string | null; buffer: Buffer | null }> {
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const ext = file.name.split(".").pop()?.toLowerCase() || "bin";
  const path = `uploads/${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("resumes")
    .upload(path, buffer, {
      contentType: file.type || "application/octet-stream",
      upsert: false,
    });

  if (error) {
    console.error("[ai-resume-match] Supabase upload error:", error);
    return { url: null, buffer: null };
  }

  const { data } = supabase.storage.from("resumes").getPublicUrl(path);
  return { url: data.publicUrl, buffer: ext === "pdf" ? buffer : null };
}

export async function POST(req: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in environment" },
      { status: 500 },
    );
  }

  // Expect multipart/form-data so we can support file upload
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json(
      { error: "Expected multipart/form-data" },
      { status: 400 },
    );
  }

  const jobDescription = form.get("jobDescription") as string | null;
  const notes = form.get("candidateNotes") as string | null;
  const file = form.get("file") as File | null;

  if (!jobDescription) {
    return NextResponse.json(
      { error: "Missing jobDescription" },
      { status: 400 },
    );
  }

  if (!notes && !file) {
    return NextResponse.json(
      {
        error:
          "Provide either candidateNotes text or upload a resume file.",
      },
      { status: 400 },
    );
  }

  const supabase = createSupabaseServerClient();

  let uploadedUrl: string | null = null;
  let extractedText = "";

  if (file) {
    try {
      const { url, buffer } = await uploadToSupabase(supabase, file);
      uploadedUrl = url;

      if (buffer) {
        // PDF → text
        extractedText = await extractPdfText(buffer);
      } else if (file.type.startsWith("text/")) {
        // Plain text resume
        const ab = await file.arrayBuffer();
        extractedText = Buffer.from(ab).toString("utf8");
      }
    } catch (err) {
      console.error("[ai-resume-match] failed to handle file:", err);
    }
  }

  const candidateNotes = notes || extractedText;

  const prompt = `
You are a senior B2B SaaS hiring manager and revenue-focused recruiter.

You will receive:
- A job description
- Candidate notes or a resume-style summary (auto-extracted if a PDF was uploaded)

Your task:
1. Evaluate how well this candidate fits the role.
2. Focus on skills, scope of experience, stage of company, domain fit, and leadership/ownership.
3. Be pragmatic. Don't be fluffy.

Return ONLY valid JSON with this exact shape:

{
  "matchScore": 0-100,
  "summary": "one short paragraph explaining the match",
  "topStrengths": ["bullet", "bullet", "bullet"],
  "risksOrGaps": ["bullet", "bullet"],
  "suggestedNextStep": "clear recommendation like 'move to onsite', 'keep as backup', etc."
}

Job Description:
${jobDescription}

Candidate Notes:
${candidateNotes || "(no visible notes or text extracted from resume)"}
`.trim();

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.3,
      messages: [
        {
          role: "system",
          content:
            "You are a precise, no-BS hiring manager. You always respond with a single valid JSON object as instructed.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const content = completion.choices[0]?.message?.content ?? "{}";

    let parsed: any;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("[ai-resume-match] failed to parse JSON:", content);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    return NextResponse.json(
      {
        matchScore:
          typeof parsed.matchScore === "number" ? parsed.matchScore : 0,
        summary: typeof parsed.summary === "string" ? parsed.summary : "",
        topStrengths: Array.isArray(parsed.topStrengths)
          ? parsed.topStrengths
          : [],
        risksOrGaps: Array.isArray(parsed.risksOrGaps)
          ? parsed.risksOrGaps
          : [],
        suggestedNextStep:
          typeof parsed.suggestedNextStep === "string"
            ? parsed.suggestedNextStep
            : "",
        resumeUrl: uploadedUrl,
      },
      { status: 200 },
    );
  } catch (err) {
    console.error("AI resume match error", err);
    return NextResponse.json(
      { error: "Failed to generate resume match" },
      { status: 500 },
    );
  }
}
