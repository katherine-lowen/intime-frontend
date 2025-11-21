// src/app/api/ai-people-timeline/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AnyRecord = Record<string, any>;

type PeopleTimelineRequest = {
  person: AnyRecord;
  events: AnyRecord[];
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in environment" },
      { status: 500 }
    );
  }

  let body: PeopleTimelineRequest;
  try {
    body = (await req.json()) as PeopleTimelineRequest;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { person, events } = body || {};

  if (!person) {
    return NextResponse.json(
      { error: "Field 'person' is required" },
      { status: 400 }
    );
  }

  const safeEvents = Array.isArray(events) ? events : [];

  const prompt = `
You are an HR business partner and people-ops advisor.

You will receive:
- A single employee record ("person") as JSON
- A list of events related to that person as JSON (onboarding, team changes, performance notes, 1:1s, promotions, warnings, kudos, PTO, etc.)

Your job is to:
1. Build a CLEAR, chronological timeline of their journey at the company.
2. Summarize their impact, strengths, and any patterns (e.g. engagement, performance, risk).
3. Flag potential risks (attrition, burnout, performance issues) without being dramatic.
4. Suggest concrete, practical actions for their manager THIS QUARTER.

Assume this is a mid-market B2B SaaS org.

Return ONLY a JSON object with this exact shape:

{
  "headline": "short 1-sentence view on this person (e.g. 'High-impact IC, at moderate risk of burnout')",
  "tenureSummary": "1-3 sentence summary of their time at the company so far",
  "timeline": [
    {
      "date": "YYYY-MM-DD or descriptive (e.g. 'Q1 2024')",
      "label": "short label for the event",
      "description": "1-2 sentence explanation of what happened and why it matters"
    }
  ],
  "sentiment": "Low | Medium | High", 
  "riskScore": 0-100,
  "riskFactors": ["bullet", "bullet"],
  "strengths": ["bullet", "bullet", "bullet"],
  "recommendedActionsThisQuarter": ["bullet", "bullet", "bullet"],
  "managerNotesSummary": "1-2 sentence suggestion on how a manager should communicate with and support this person"
}

If data is sparse, be honest and keep things conservative.

Person JSON:
${JSON.stringify(person, null, 2)}

Events JSON:
${JSON.stringify(safeEvents.slice(0, 80), null, 2)}
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
            "You are a pragmatic, non-fluffy HR business partner. You always respond with a single valid JSON object as specified.",
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
        headline: parsed.headline ?? "",
        tenureSummary: parsed.tenureSummary ?? "",
        timeline: Array.isArray(parsed.timeline) ? parsed.timeline : [],
        sentiment: parsed.sentiment ?? "",
        riskScore:
          typeof parsed.riskScore === "number" ? parsed.riskScore : null,
        riskFactors: parsed.riskFactors ?? [],
        strengths: parsed.strengths ?? [],
        recommendedActionsThisQuarter:
          parsed.recommendedActionsThisQuarter ?? [],
        managerNotesSummary: parsed.managerNotesSummary ?? "",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("AI people timeline error", err);
    return NextResponse.json(
      { error: "Failed to generate people timeline" },
      { status: 500 }
    );
  }
}
