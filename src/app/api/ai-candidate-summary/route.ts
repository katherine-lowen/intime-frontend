// src/app/api/ai-candidate-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Gracefully handle missing env var (Vercel preview/local)
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    // 🚫 If missing key → return controlled error (not server crash)
    if (!openai) {
      console.error("[AI Candidate Summary] Missing OPENAI_API_KEY");
      return NextResponse.json(
        { error: "AI not configured on server (missing OPENAI_API_KEY)" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({} as any));
    const { name, jobTitle, resumeText, notes } = body ?? {};

    const systemPrompt = `
You are "Intime AI Candidate Assistant", helping busy recruiters and hiring managers.

Given:
- Candidate name
- Target role title
- Raw resume / profile text
- Optional recruiter notes

Return a concise JSON object with:
- summary: 3–5 sentence narrative
- strengths: bullet points of specific strengths
- risks: bullet points of concerns / gaps
- recommendation: a single next-step recommendation
`;

    const userPrompt = `
Candidate name: ${name || "Unknown"}
Target role: ${jobTitle || "Not specified"}

Resume / profile text:
${resumeText || "No resume text provided."}

Recruiter / interviewer notes:
${notes || "No internal notes provided."}
`;

    // 🧠 Updated schema (must include additionalProperties: false)
    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "CandidateSummary",
          strict: false, // avoid hard failures
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              summary: { type: "string" },
              strengths: {
                type: "array",
                items: { type: "string" },
              },
              risks: {
                type: "array",
                items: { type: "string" },
              },
              recommendation: { type: "string" },
            },
            required: ["summary", "strengths", "risks", "recommendation"],
          },
        },
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content;

    if (typeof raw !== "string") {
      console.error("[AI Candidate Summary] Unexpected content:", raw);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    const data = JSON.parse(raw);
    return NextResponse.json(data);
  } catch (err) {
    console.error("[AI Candidate Summary] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate candidate summary" },
      { status: 500 }
    );
  }
}
