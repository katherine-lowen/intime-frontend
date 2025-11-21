import { NextResponse } from "next/server";

export const runtime = "edge";

type PeopleEvent = {
  date: string;
  type: string;
  summary: string;
};

type PeopleIntelligencePayload = {
  employeeName?: string;
  roleTitle?: string;
  teamName?: string;
  managerName?: string;
  lastReviewText?: string;
  recentFeedback?: string;
  notes?: string;
  events?: PeopleEvent[];
};

export async function POST(req: Request) {
  try {
    const body: PeopleIntelligencePayload = await req.json();

    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing OPENAI_API_KEY" },
        { status: 500 }
      );
    }

    const completion = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "gpt-4.1",
          temperature: 0.2,
          messages: [
            {
              role: "system",
              content:
                "You are Intime’s employee intelligence engine. You turn lifecycle events, reviews, and feedback into a structured view of an employee's strengths, risks, and trajectory.",
            },
            {
              role: "user",
              content: `
Employee: ${body.employeeName || ""}
Role: ${body.roleTitle || ""}
Team: ${body.teamName || ""}
Manager: ${body.managerName || ""}

Last review:
${body.lastReviewText || ""}

Recent feedback:
${body.recentFeedback || ""}

Internal notes:
${body.notes || ""}

Key events:
${(body.events || [])
  .map(
    (e) =>
      `- ${e.date} [${e.type}]: ${e.summary}`
  )
  .join("\n")}

Return a JSON object ONLY with:
{
  "aiSummary": string,
  "strengths": string[],
  "growthAreas": string[],
  "recentHighlights": string[],
  "recentRisks": string[],
  "recommendedActionsForManager": string[],
  "recommendedActionsForEmployee": string[],
  "potentialNextRoles": string[],
  "riskSignal": "LOW" | "MEDIUM" | "HIGH",
  "engagementSignal": "LOW" | "MEDIUM" | "HIGH",
  "trajectorySignal": "IMPROVING" | "STEADY" | "DECLINING"
}
No markdown, no commentary, just valid JSON.
            `,
            },
          ],
        }),
      }
    );

    const data = await completion.json();

    if (!completion.ok) {
      return NextResponse.json(
        { error: data.error?.message || "AI processing failed" },
        { status: completion.status }
      );
    }

    let parsed;
    try {
      const content = data.choices?.[0]?.message?.content;
      parsed = typeof content === "string" ? JSON.parse(content) : content;
    } catch {
      return NextResponse.json(
        { error: "AI response was not valid JSON", raw: data },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, data: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: "Server error", detail: `${err}` },
      { status: 500 }
    );
  }
}
