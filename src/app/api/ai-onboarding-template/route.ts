import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type AiTemplateRequest = {
  role?: string;
  department?: string;
  seniority?: string;
  focus?: string;
  dayRange?: string; // e.g. "30 days", "60 days"
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as AiTemplateRequest;

    const {
      role = "New hire",
      department = "General",
      seniority = "Mid-level",
      focus = "standard onboarding",
      dayRange = "30 days",
    } = body;

    const prompt = `
You are an HR / People ops specialist. Create a concise onboarding TEMPLATE (not person-specific)
for a new ${seniority} ${role} in the ${department} team over ${dayRange}.

Return STRICT JSON ONLY in this shape:

{
  "name": string,
  "description": string,
  "tasks": [
    {
      "title": string,
      "description": string,
      "assigneeType": "EMPLOYEE" | "MANAGER" | "HR",
      "dueRelativeDays": number // days from start date (0 = day 1)
    }
  ]
}

Keep:
- 8–15 tasks total
- Titles short and actionable
- Descriptions 1–2 sentences
- dueRelativeDays between 0 and 30
- Mix assigneeType between EMPLOYEE, MANAGER, and HR.
`;

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
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      return NextResponse.json(
        { error: "No content from AI" },
        { status: 500 }
      );
    }

    let parsed: {
      name: string;
      description: string;
      tasks: {
        title: string;
        description?: string;
        assigneeType?: "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";
        dueRelativeDays?: number | null;
      }[];
    };

    try {
      parsed = JSON.parse(content);
    } catch (e) {
      console.error("Failed to parse AI JSON:", content);
      return NextResponse.json(
        { error: "Failed to parse AI response" },
        { status: 500 }
      );
    }

    // Basic sanity defaults
    if (!Array.isArray(parsed.tasks)) {
      parsed.tasks = [];
    }

    parsed.tasks = parsed.tasks.map((t, index) => ({
      title: t.title ?? `Task ${index + 1}`,
      description: t.description ?? "",
      assigneeType: t.assigneeType ?? "EMPLOYEE",
      dueRelativeDays:
        typeof t.dueRelativeDays === "number" ? t.dueRelativeDays : null,
    }));

    return NextResponse.json(parsed, { status: 200 });
  } catch (err) {
    console.error("AI onboarding-template error:", err);
    return NextResponse.json(
      { error: "Failed to generate onboarding template" },
      { status: 500 }
    );
  }
}
