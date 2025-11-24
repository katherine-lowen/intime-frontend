// src/app/people/[id]/resume/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  // ✅ Next 16 expects params as a Promise – unwrap it
  const { id } = await context.params;

  const form = await req.formData();
  const file = form.get("resume") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Read file buffer as text
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  const decoder = new TextDecoder("utf-8");
  const text = decoder.decode(bytes);

  // If no OpenAI key, just store raw text and bounce back
  if (!process.env.OPENAI_API_KEY) {
    try {
      await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
          },
          body: JSON.stringify({
            resumeText: text,
          }),
        }
      );
    } catch (err) {
      console.error("Failed to store resumeText without AI:", err);
    }

    return NextResponse.redirect(`/people/${id}`);
  }

  //
  // 1. Resume Parsing via OpenAI
  //
  let parsed: {
    summary?: string;
    skills?: string[];
    experience?: any;
    rawText?: string;
  } = {};

  try {
    const parsedCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Extract structured resume data. ONLY output valid JSON with keys: summary, skills (array of strings), experience (array or object), rawText.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    const raw = parsedCompletion.choices[0]?.message?.content?.trim() ?? "";
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { summary: raw.slice(0, 400), rawText: text };
    }
  } catch (err) {
    console.error("OpenAI resume parse error:", err);
    parsed = { summary: "Could not parse resume with AI.", rawText: text };
  }

  //
  // 2. Optional: compute a rough internal “match score” style signal
  //
  let scoreSummary = "";
  try {
    const scoringCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an internal matching AI. Based on this employee's resume text, provide a short sentence about their strongest moat-like advantages for the org. ONLY output a single sentence.",
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.4,
    });

    scoreSummary =
      scoringCompletion.choices[0]?.message?.content?.trim() ?? "";
  } catch (err) {
    console.error("OpenAI resume scoring error:", err);
  }

  //
  // 3. Save parsed resume data back to the backend
  //
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/employees/${id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
        },
        body: JSON.stringify({
          resumeText: parsed.rawText || text,
          summary: parsed.summary || null,
          skills: Array.isArray(parsed.skills) ? parsed.skills : [],
          experience: parsed.experience ?? null,
        }),
      }
    );
  } catch (err) {
    console.error("Failed to PATCH employee with parsed resume:", err);
  }

  //
  // 4. Optionally log a product event so timelines pick it up
  //
  try {
    await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/events/ingest`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
        },
        body: JSON.stringify({
          type: "RESUME_PARSED",
          source: "system",
          employeeId: id,
          summary: scoreSummary || "Resume uploaded and parsed",
          payload: {
            aiSummary: parsed.summary,
            skills: parsed.skills,
          },
        }),
      }
    );
  } catch (err) {
    console.error("Failed to create RESUME_PARSED event:", err);
  }

  // Back to the employee profile
  return NextResponse.redirect(`/people/${id}`);
}
