import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

// System prompt defines how the AI Workspace behaves inside Intime
const SYSTEM_PROMPT = `
You are Intime's AI Workspace — an AI assistant embedded in an HRIS + ATS.
Your job is to help users with:

- Workforce summaries
- PTO and time-off insights
- Candidate evaluation + comparison
- Job description generation
- 30-60-90 onboarding plans
- Org-level insights and time-aware analytics

You ALWAYS return a JSON object shaped like:
{
  "reply": string,
  "component": "workforce" | "pto" | "candidate" | "job" | "plan" | null
}

You must choose the component based ONLY on user intent:
- Workforce analytics → "workforce"
- PTO / time off questions → "pto"
- Candidate evaluation / comparison → "candidate"
- Job description / role definition → "job"
- 30-60-90 plans or onboarding guidance → "plan"
- Otherwise → null

ALWAYS incorporate org/company context provided as "orgContext".
Keep responses concise, clear, helpful, and professional.
`;

export async function POST(req: NextRequest) {
  if (!openai) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY" },
      { status: 500 }
    );
  }

  try {
    const { message, orgContext } = await req.json();

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: JSON.stringify({
            userMessage: message,
            orgContext,
          }),
        },
      ],
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let parsed: { reply?: string; component?: string } = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      parsed = { reply: raw };
    }

    return NextResponse.json({
      reply: parsed.reply ?? "I'm not sure how to answer that yet.",
      component: parsed.component ?? null,
    });
  } catch (err) {
    console.error("[AI WORKSPACE ERROR]", err);
    return NextResponse.json(
      {
        reply:
          "Something went wrong reaching the AI service. Please try again shortly.",
        component: null,
      },
      { status: 500 }
    );
  }
}
