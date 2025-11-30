// src/app/api/ai-onboarding-template/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type AiTemplateRequest = {
  role?: string;
  department?: string;
  seniority?: string;
  focus?: string;
  dayRange?: string; // e.g. "30 days", "60 days"
};

type AssigneeType = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

type TemplateTask = {
  title: string;
  description?: string;
  assigneeType?: AssigneeType;
  dueRelativeDays?: number | null;
};

type TemplateResponse = {
  name: string;
  description: string;
  tasks: TemplateTask[];
};

export async function POST(req: Request) {
  try {
    if (!openai) {
      console.error("[AI Onboarding Template] Missing OPENAI_API_KEY");
      return NextResponse.json(
        {
          error:
            "AI is not configured yet. Set OPENAI_API_KEY to enable onboarding templates.",
        },
        { status: 500 },
      );
    }

    let body: AiTemplateRequest = {};
    try {
      body = (await req.json()) as AiTemplateRequest;
    } catch {
      body = {};
    }

    const {
      role = "New hire",
      department = "General",
      seniority = "Mid-level",
      focus = "standard onboarding",
      dayRange = "30 days",
    } = body;

    const prompt = `
You are an HR / People ops specialist. Create a concise onboarding TEMPLATE (not person-specific)
for a new ${seniority} ${role} in the ${department} team over ${dayRange}, focused on ${focus}.

Return STRICT JSON ONLY in this shape:

{
  "name": string,
  "description": string,
  "tasks": [
    {
      "title": string,
      "description": string,
      "assigneeType": "EMPLOYEE" | "MANAGER" | "HR",
      "dueRelativeDays": number
    }
  ]
}

Constraints:
- 8–15 tasks total
- Titles short and actionable
- Descriptions 1–2 sentences
- dueRelativeDays between 0 and 30 (0 = start date / day 1)
- Mix assigneeType between EMPLOYEE, MANAGER, and HR.
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You output HR onboarding templates as strict JSON only. No markdown, no prose.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      console.error("[AI Onboarding Template] Empty content from model");
      return NextResponse.json(
        { error: "No content from AI" },
        { status: 500 },
      );
    }

    let parsed: TemplateResponse;
    try {
      parsed = JSON.parse(content) as TemplateResponse;
    } catch (e) {
      console.error("[AI Onboarding Template] Failed to parse AI JSON:", content);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 },
      );
    }

    if (!Array.isArray(parsed.tasks)) {
      parsed.tasks = [];
    }

    // Normalize tasks a bit so the frontend never explodes
    parsed.tasks = parsed.tasks.map((t, index) => {
      const due =
        typeof t.dueRelativeDays === "number" ? Math.round(t.dueRelativeDays) : 0;

      let assignee: AssigneeType =
        t.assigneeType === "MANAGER" ||
        t.assigneeType === "HR" ||
        t.assigneeType === "OTHER"
          ? t.assigneeType
          : "EMPLOYEE";

      return {
        title: t.title ?? `Task ${index + 1}`,
        description: t.description ?? "",
        assigneeType: assignee,
        dueRelativeDays: Math.min(Math.max(due, 0), 30),
      };
    });

    // Basic guard for name/description
    parsed.name =
      parsed.name ||
      `${seniority} ${role} onboarding (${dayRange.replace(" days", "-day plan")})`;
    parsed.description =
      parsed.description ||
      `Onboarding template for a ${seniority} ${role} in ${department} over ${dayRange}.`;

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("[AI Onboarding Template] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate onboarding template" },
      { status: 500 },
    );
  }
}
