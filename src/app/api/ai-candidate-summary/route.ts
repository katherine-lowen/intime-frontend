// src/app/api/ai-candidate-summary/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
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
- summary: 3–5 sentence narrative of the candidate and fit for the role
- strengths: bullet points of specific strengths
- risks: bullet points of concerns / gaps to probe
- recommendation: one clear recommendation (e.g. 'Move to manager screen', 'Pass', 'Keep warm for X role')
`;

    const userPrompt = `
Candidate name: ${name || "Unknown"}
Target role: ${jobTitle || "Not specified"}

Resume / profile text:
${resumeText || "No resume text provided."}

Recruiter / interviewer notes:
${notes || "No internal notes provided."}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "CandidateSummary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description:
                  "3–5 sentence narrative summary of the candidate and their fit.",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                description: "Bullet-point strengths.",
              },
              risks: {
                type: "array",
                items: { type: "string" },
                description: "Bullet-point risks / gaps / questions.",
              },
              recommendation: {
                type: "string",
                description:
                  "One clear recommendation for next step / disposition.",
              },
            },
            required: ["summary", "strengths", "risks", "recommendation"],
          },
        },
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (typeof rawContent !== "string") {
      console.error("[AI Candidate Summary] Unexpected content:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[AI Candidate Summary] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate candidate summary" },
      { status: 500 }
    );
  }
}
