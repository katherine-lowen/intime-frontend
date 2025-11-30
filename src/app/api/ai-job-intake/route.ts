// src/app/api/ai-job-intake/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      console.error("[AI Job Intake] Missing OPENAI_API_KEY");
      return NextResponse.json(
        {
          error:
            "AI is not configured yet. Set OPENAI_API_KEY to enable job intake generation.",
        },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({} as any));

    const {
      title,
      level,
      team,
      location,
      companyContext,
      hiringManagerNotes,
      existingDescription,
      mustHaves,
      niceToHaves,
    } = body ?? {};

    const systemPrompt = `
You are "Intime AI Job Intake", a specialist at turning messy recruiter + hiring manager notes
into a structured job intake summary for B2B SaaS roles.

Output should be:
- Clear, concise, and practical for recruiters + hiring managers
- Organized into sections (role summary, responsibilities, must-haves, nice-to-haves, screening questions, first 90 days)
- Written in neutral, inclusive language
`.trim();

    const userPrompt = `
Create a structured role profile for a B2B SaaS role.

Title: ${title || "Not specified"}
Level: ${level || "Not specified"}
Team: ${team || "Not specified"}
Location: ${location || "Not specified"}

Company context:
${companyContext || "No extra company context provided."}

Hiring manager / recruiter notes:
${hiringManagerNotes || "None provided."}

Existing job description (if any):
${existingDescription || "None provided."}

Must-have skills / experience (raw):
${mustHaves || "None provided."}

Nice-to-have skills / experience (raw):
${niceToHaves || "None provided."}

Produce a clean, structured intake profile that a recruiter can use to align with the hiring manager and build a JD + interview plan.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (typeof rawContent !== "string") {
      console.error("[AI Job Intake] Unexpected content:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    // Expected shape (for reference):
    // {
    //   roleSummary: string,
    //   scope: string[],
    //   responsibilities: string[],
    //   mustHaves: string[],
    //   niceToHaves: string[],
    //   screeningQuestions: string[],
    //   first90Days: string[]
    // }
    let parsed: any;
    try {
      parsed = JSON.parse(rawContent);
    } catch (e) {
      console.error("[AI Job Intake] Failed to parse JSON:", e, rawContent);
      return NextResponse.json(
        { error: "AI returned invalid JSON" },
        { status: 500 }
      );
    }

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[AI Job Intake] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate job intake profile" },
      { status: 500 }
    );
  }
}
