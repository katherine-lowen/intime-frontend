// src/app/api/ai-job-intake/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
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
`;

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
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "JobIntakeProfile",
          strict: true,
          schema: {
            type: "object",
            properties: {
              roleSummary: {
                type: "string",
                description:
                  "2–3 sentence summary of the role and why it exists.",
              },
              scope: {
                type: "array",
                items: { type: "string" },
                description:
                  "Bullets describing scope and boundaries of the role.",
              },
              responsibilities: {
                type: "array",
                items: { type: "string" },
                description: "Key responsibilities / core work.",
              },
              mustHaves: {
                type: "array",
                items: { type: "string" },
                description: "True must-have requirements.",
              },
              niceToHaves: {
                type: "array",
                items: { type: "string" },
                description: "Nice-to-have experience / skills.",
              },
              screeningQuestions: {
                type: "array",
                items: { type: "string" },
                description:
                  "3–7 structured application or phone screen questions.",
              },
              first90Days: {
                type: "array",
                items: { type: "string" },
                description: "How success is measured in the first 90 days.",
              },
            },
            required: [
              "roleSummary",
              "scope",
              "responsibilities",
              "mustHaves",
              "niceToHaves",
              "screeningQuestions",
              "first90Days",
            ],
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
      console.error("[AI Job Intake] Unexpected content:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[AI Job Intake] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate job intake profile" },
      { status: 500 }
    );
  }
}
