// src/app/api/ai-onboarding-template/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const {
      roleTitle,
      department,
      seniority,
      location,
      companyTone,
    }: {
      roleTitle?: string;
      department?: string;
      seniority?: string;
      location?: string;
      companyTone?: string;
    } = body || {};

    const prompt = `
You are an expert People Ops leader designing onboarding templates.

Generate a 30-day onboarding TEMPLATE (not person-specific) for a new hire.

Context:
- Role title: ${roleTitle || "Software Engineer"}
- Department: ${department || "Engineering"}
- Seniority: ${seniority || "Mid-level"}
- Location: ${location || "Remote / hybrid"}
- Company tone: ${companyTone || "modern SaaS, friendly, fast-moving"}

Return a JSON object with a single key "tasks", which is an array of 15–20 task objects.

Each task object MUST have:
- "title": short label for the task
- "description": 1–2 sentence description
- "assigneeType": one of ["EMPLOYEE", "MANAGER", "HR", "OTHER"]
- "dueRelativeDays": an integer number of days relative to day 0 (start date).
  - Use negative values for pre-start tasks (e.g., -3 means 3 days before start).
  - Use values between 0 and 30 for the first month.

The JSON MUST be valid and contain ONLY this shape, no extra keys or commentary:
{
  "tasks": [
    {
      "title": "...",
      "description": "...",
      "assigneeType": "EMPLOYEE",
      "dueRelativeDays": 0
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You respond ONLY with valid JSON that matches the requested schema.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";
    let parsed: any;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("[ai-onboarding-template] JSON parse error", err, raw);
      return NextResponse.json(
        { error: "Failed to parse AI response", tasks: [] },
        { status: 500 }
      );
    }

    const tasksRaw = Array.isArray(parsed.tasks) ? parsed.tasks : [];

    const allowedAssignees = ["EMPLOYEE", "MANAGER", "HR", "OTHER"] as const;

    const tasks = tasksRaw
      .map((t: any) => {
        const title = String(t.title ?? "").trim();
        if (!title) return null;

        const description =
          t.description === undefined || t.description === null
            ? null
            : String(t.description);

        const assigneeRaw = String(t.assigneeType ?? "EMPLOYEE").toUpperCase();
        const assigneeType = allowedAssignees.includes(
          assigneeRaw as (typeof allowedAssignees)[number]
        )
          ? assigneeRaw
          : "EMPLOYEE";

        let dueRelativeDays: number | null = null;
        if (
          typeof t.dueRelativeDays === "number" &&
          Number.isFinite(t.dueRelativeDays)
        ) {
          dueRelativeDays = Math.round(t.dueRelativeDays);
        }

        return {
          title,
          description,
          assigneeType,
          dueRelativeDays,
        };
      })
      .filter(Boolean);

    return NextResponse.json({ tasks }, { status: 200 });
  } catch (err) {
    console.error("[ai-onboarding-template] Error", err);
    return NextResponse.json(
      { error: "Unexpected error from AI template generator" },
      { status: 500 }
    );
  }
}
