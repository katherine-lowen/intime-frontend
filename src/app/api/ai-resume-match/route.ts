// src/app/api/ai-resume-match/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type AiMatchResult = {
  matchScore: number;
  summary: string;
  topStrengths: string[];
  risksOrGaps: string[];
  suggestedNextStep: string;
  resumeUrl?: string | null;
};

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

    // Debug: see what we actually got from the front end
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

    // Read resume text (works for .txt; PDFs will need a proper parser later)
    let resumeText = "";
    if (file && file.size > 0) {
      try {
        // For .txt this will be clean; for PDFs this will likely be messy binary
        resumeText = await file.text();
      } catch (err) {
        console.warn("[ai-resume-match] failed to read file text:", err);
      }
    }

    const candidateProfile = [candidateNotes, resumeText]
      .map((s) => s?.trim())
      .filter(Boolean)
      .join("\n\n");

    // If we truly have no candidate info, still return something sensible
    if (!candidateProfile) {
      const fallback: AiMatchResult = {
        matchScore: 0,
        summary:
          "There is no candidate information available to evaluate fit for this role.",
        topStrengths: [],
        risksOrGaps: [
          "No resume, notes, or candidate profile information was provided.",
        ],
        suggestedNextStep:
          "Collect the candidate's resume or notes and re-run the AI resume match.",
        resumeUrl: null,
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
      resumeUrl: null, // plug in Supabase URL here later if you want
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
