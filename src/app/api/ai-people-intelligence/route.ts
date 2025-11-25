// src/app/api/ai/onboarding-plan/route.ts
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type RequestBody = {
  employee: {
    firstName: string;
    lastName: string;
    title?: string | null;
    department?: string | null;
  };
  tasks: { label: string; status: string }[];
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as RequestBody;

    const { employee, tasks } = body;

    const prompt = `
You are designing a practical onboarding plan.

Employee:
- Name: ${employee.firstName} ${employee.lastName}
- Title: ${employee.title ?? "Unknown"}
- Department: ${employee.department ?? "Unknown"}

Existing tasks:
${tasks
  .map((t, i) => `- ${i + 1}. ${t.label} [${t.status}]`)
  .join("\n") || "- (none yet)"}

Suggest 3–6 additional onboarding tasks tailored to this role.

For each task, return a JSON object with:
- title: short task name
- description: one-sentence practical description
- assigneeType: one of EMPLOYEE, MANAGER, HR, OTHER
- when: short phrase like "Week 1", "Day 3", "First month", etc.

Respond ONLY with a JSON array, no extra text.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        {
          role: "system",
          content:
            "You are an HRIS assistant creating onboarding suggestions in JSON.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
    });

    const raw = completion.choices[0]?.message?.content ?? "{}";

    let parsed: any = {};
    try {
      parsed = JSON.parse(raw);
    } catch {
      // Fallback: try to interpret as array directly
      if (raw.trim().startsWith("[")) {
        parsed = { suggestions: JSON.parse(raw) };
      } else {
        parsed = { suggestions: [] };
      }
    }

    const suggestions = Array.isArray(parsed)
      ? parsed
      : Array.isArray(parsed.suggestions)
      ? parsed.suggestions
      : [];

    return new Response(
      JSON.stringify({
        suggestions,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  } catch (e) {
    console.error("AI onboarding plan error", e);
    return new Response(
      JSON.stringify({
        suggestions: [],
        error: "AI onboarding plan failed",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    );
  }
}
