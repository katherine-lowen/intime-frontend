// src/app/api/ai-onboarding-plan/route.ts
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

type EmployeeInput = {
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

type ExistingTaskInput = {
  label: string;
  status: string;
};

type RequestBody = {
  employee?: EmployeeInput;
  tasks?: ExistingTaskInput[];
  mode?: "suggestions" | "flowTemplate";
};

export async function POST(req: Request) {
  try {
    if (!openai) {
      console.error("[AI Onboarding Plan] Missing OPENAI_API_KEY");
      return new Response(
        JSON.stringify({
          suggestions: [],
          error:
            "AI is not configured yet. Set OPENAI_API_KEY to enable onboarding suggestions.",
        }),
        {
          status: 500,
          headers: { "Content-Type": "application/json" },
        },
      );
    }

    let body: RequestBody = {};
    try {
      body = (await req.json()) as RequestBody;
    } catch {
      body = {};
    }

    const { employee, tasks = [], mode = "flowTemplate" } = body;

    const existingTasksBlock =
      tasks.length === 0
        ? "- (none yet)"
        : tasks
            .map((t, i) => `- ${i + 1}. ${t.label} [${t.status}]`)
            .join("\n");

    const persona =
      mode === "flowTemplate"
        ? "You are an HRIS assistant designing a concrete onboarding PLAN with relative due dates."
        : "You are an HRIS assistant suggesting additional onboarding tasks.";

    const instruction =
      mode === "flowTemplate"
        ? `
Return a JSON object with a single property "suggestions" which is an array of tasks.

Each task must be an object with:
- "title": short task name
- "description": one-sentence practical description
- "assigneeType": one of "EMPLOYEE", "MANAGER", "HR", "OTHER"
- "when": short phrase like "Day 1", "Week 1", "First month"
- "dueRelativeDays": integer, number of days relative to the employee's start date
  (0 = start date, positive = days after start, negative = days before)

Only output valid JSON. Do not include any explanatory text.`
        : `
Return a JSON object with a single property "suggestions" which is an array of tasks.

Each task should be an object with:
- "title": short task name
- "description": one-sentence practical description
- "assigneeType": one of "EMPLOYEE", "MANAGER", "HR", "OTHER"
- "when": short phrase like "Day 1", "Week 1", "First month"
- "dueRelativeDays": integer days relative to start date (if you can infer it; otherwise use 0–10).`;

    const prompt = `
${persona}

Employee (if known):
- Name: ${employee ? `${employee.firstName} ${employee.lastName}` : "Unknown"}
- Title: ${employee?.title ?? "Unknown"}
- Department: ${employee?.department ?? "Unknown"}

Existing tasks:
${existingTasksBlock}

${instruction}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an HRIS assistant creating onboarding suggestions in JSON only.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.3,
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // If the model returns an array directly, wrap it
      if (raw.trim().startsWith("[")) {
        try {
          parsed = { suggestions: JSON.parse(raw) };
        } catch {
          parsed = { suggestions: [] };
        }
      } else {
        parsed = { suggestions: [] };
      }
    }

    const suggestions = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : [];

    const normalized = suggestions.map((s: any) => ({
      title: String(s.title ?? "").slice(0, 200),
      description:
        typeof s.description === "string" ? s.description.slice(0, 500) : "",
      assigneeType:
        s.assigneeType === "MANAGER" ||
        s.assigneeType === "HR" ||
        s.assigneeType === "OTHER"
          ? s.assigneeType
          : "EMPLOYEE",
      when: typeof s.when === "string" ? s.when : undefined,
      dueRelativeDays:
        typeof s.dueRelativeDays === "number"
          ? Math.round(s.dueRelativeDays)
          : 0,
    }));

    return new Response(
      JSON.stringify({
        suggestions: normalized,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      },
    );
  } catch (err) {
    console.error("[AI Onboarding Plan] Error", err);
    return new Response(
      JSON.stringify({
        suggestions: [],
        error: "AI onboarding plan failed",
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      },
    );
  }
}
