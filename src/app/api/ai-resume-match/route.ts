import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in environment" },
      { status: 500 }
    );
  }

  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { jobDescription, candidateNotes } = body || {};

  if (!jobDescription || !candidateNotes) {
    return NextResponse.json(
      {
        error:
          "Both jobDescription and candidateNotes are required in the request body",
      },
      { status: 400 }
    );
  }

  const prompt = `
You are a senior B2B SaaS hiring manager and revenue-focused recruiter.

You will receive:
- A job description
- Candidate notes or a resume-style summary

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
${candidateNotes}
`;

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
    const parsed = JSON.parse(content);

    return NextResponse.json(
      {
        matchScore: parsed.matchScore ?? 0,
        summary: parsed.summary ?? "",
        topStrengths: parsed.topStrengths ?? [],
        risksOrGaps: parsed.risksOrGaps ?? [],
        suggestedNextStep: parsed.suggestedNextStep ?? "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("AI resume match error", err);
    return NextResponse.json(
      { error: "Failed to generate resume match" },
      { status: 500 }
    );
  }
}
