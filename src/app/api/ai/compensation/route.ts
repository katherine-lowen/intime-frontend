// src/app/api/ai/compensation/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type CompensationBody = {
  title?: string;
  location?: string;
  department?: string;
  description?: string;
};

export async function POST(req: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: "OpenAI API key is not configured." },
      { status: 500 },
    );
  }

  let body: CompensationBody;
  try {
    body = (await req.json()) as CompensationBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400 },
    );
  }

  const { title, location, department, description } = body;

  if (!title && !description) {
    return NextResponse.json(
      { error: "Provide at least a title or description." },
      { status: 400 },
    );
  }

  const prompt = `
You are an HR compensation analyst. Based on the role details, suggest a realistic **annual base salary range**.

Return ONLY strict JSON with this shape:

{
  "min": number,        // lower bound of base salary
  "max": number,        // upper bound of base salary
  "currency": "USD",    // ISO currency code
  "rationale": string   // 1–2 sentence explanation
}

Role details:
- Title: ${title || "N/A"}
- Department: ${department || "N/A"}
- Location: ${location || "N/A"}
- Description: ${description || "N/A"}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: process.env.OPENAI_MODEL ?? "gpt-4.1-mini",
      temperature: 0.2,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content:
            "You are a precise compensation analyst. Always return valid, parseable JSON and nothing else.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const rawContent =
      completion.choices[0]?.message?.content?.trim() || "{}";

    let payload: {
      min?: number;
      max?: number;
      currency?: string;
      rationale?: string;
    };

    try {
      payload = JSON.parse(rawContent);
    } catch {
      // Fallback: if the model returns something slightly noisy, try to salvage numbers
      payload = {
        min: undefined,
        max: undefined,
        currency: "USD",
        rationale: rawContent.slice(0, 300),
      };
    }

    const min =
      typeof payload.min === "number" && isFinite(payload.min)
        ? payload.min
        : undefined;
    const max =
      typeof payload.max === "number" && isFinite(payload.max)
        ? payload.max
        : undefined;
    const currency =
      typeof payload.currency === "string" && payload.currency
        ? payload.currency.toUpperCase()
        : "USD";
    const rationale =
      typeof payload.rationale === "string" && payload.rationale
        ? payload.rationale
        : "Range generated from AI based on role, location, and description.";

    return NextResponse.json({
      min,
      max,
      currency,
      rationale,
    });
  } catch (err) {
    console.error("[AI_COMPENSATION] error", err);
    return NextResponse.json(
      {
        error: "Failed to generate compensation range.",
      },
      { status: 500 },
    );
  }
}
