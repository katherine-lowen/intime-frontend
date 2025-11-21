// src/app/api/ai-onboarding-plan/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AnyRecord = Record<string, any>;

type OnboardingPlan = {
  headline: string;
  startDateHint?: string;
  phases: {
    label: string;
    timeframe?: string;
    goals?: string[];
    tasks?: string[];
  }[];
};

type RequestBody = {
  employee: AnyRecord;
  roleContext?: string;
  events?: AnyRecord[];
};

export async function POST(req: Request) {
  if (!process.env.OPENAI_API_KEY) {
    return NextResponse.json(
      { error: "Missing OPENAI_API_KEY in environment" },
      { status: 500 }
    );
  }

  let body: RequestBody;
  try {
    body = (await req.json()) as RequestBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { employee, roleContext, events } = body || {};

  if (!employee) {
    return NextResponse.json(
      { error: "Field 'employee' is required" },
      { status: 400 }
    );
  }

  const prompt = `
You are an HR business partner at a mid-market B2B SaaS company.

You will receive:
- An employee record as JSON (name, title, department, status, manager, start date, etc.)
- Optional role / team context
- Optional prior events (onboarding actions already taken)

Your job is to create a clear, pragmatic onboarding plan for this employee with:
- Day 1 checklist
- First week (Days 2–5)
- First 30 days
- Days 31–60
- Days 61–90

Focus on:
- What the EMPLOYEE should do
- What their MANAGER should do
- What HR / People Ops should do
- Meetings, docs to review, tools to get access to, people to meet, early wins

Return ONLY a JSON object in this exact shape:

{
  "headline": "short 1-sentence summary of the onboarding focus",
  "startDateHint": "if possible, a short suggestion about ideal start day / ramp expectations",
  "phases": [
    {
      "label": "Day 1",
      "timeframe": "First day",
      "goals": ["goal", "goal"],
      "tasks": ["Employee: ...", "Manager: ...", "People Ops: ..."]
    }
  ]
}

Make sure tasks are concrete, not fluffy. Assume this is a modern remote-friendly company.

Employee JSON:
${JSON.stringify(employee, null, 2)}

Role context (optional):
${roleContext || "None provided"}

Existing events (optional, may be empty):
${JSON.stringify((events || []).slice(0, 40), null, 2)}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      response_format: { type: "json_object" },
      temperature: 0.4,
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
    const parsed = JSON.parse(content) as OnboardingPlan;

    return NextResponse.json(
      {
        headline: parsed.headline ?? "",
        startDateHint: parsed.startDateHint ?? "",
        phases: Array.isArray(parsed.phases) ? parsed.phases : [],
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("AI onboarding plan error", err);
    return NextResponse.json(
      { error: "Failed to generate onboarding plan" },
      { status: 500 }
    );
  }
}
