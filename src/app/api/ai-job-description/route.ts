// src/app/api/ai-jd/route.ts
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
      department,
      team,
      location,
      employmentType,
      companyContext,
      responsibilities,
      requirements,
      notes,
    } = body ?? {};

    const systemPrompt = `
You are "Intime AI JD Writer", a specialist in clear, practical B2B SaaS job descriptions.

Write JDs that:
- Are concise and recruiter-friendly
- Use neutral, inclusive language
- Separate responsibilities vs. requirements vs. nice-to-haves
- Include a short "What you'll do" and "What you'll bring" section
- Include a brief "How success is measured in the first 6–12 months" section when possible
`;

    const userPrompt = `
Role title: ${title || "Not specified"}
Level/seniority: ${level || "Not specified"}
Department: ${department || "Not specified"}
Team: ${team || "Not specified"}
Location: ${location || "Not specified"}
Employment type: ${employmentType || "Full-time"}

Company context (product, stage, customers):
${companyContext || "No extra company context provided."}

Seed responsibilities (optional):
${responsibilities || "None provided."}

Seed requirements / must-haves (optional):
${requirements || "None provided."}

Extra notes from hiring manager / recruiter:
${notes || "None provided."}

Write a polished job description for a modern B2B SaaS company. 
Use clear headings and bullet points. Tailor the scope, expectations, and examples to this role.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "JobDescription",
          strict: true,
          schema: {
            type: "object",
            properties: {
              text: {
                type: "string",
                description:
                  "Full job description in markdown, ready to paste into an ATS.",
              },
            },
            required: ["text"],
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
      console.error("[AI JD] Unexpected content:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[AI JD] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate job description" },
      { status: 500 }
    );
  }
}
