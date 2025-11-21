// src/app/api/ai-insights/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import api from "@/lib/api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type Body =
  | {
      scope: "job";
      jobId: string;
    }
  | {
      scope: "employee";
      employeeId: string;
    }
  | {
      scope: "candidate";
      candidateId: string;
    };

async function buildContext(body: Body) {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

  if (body.scope === "job") {
    const job = await api.get<any>(`/jobs/${body.jobId}`);
    const events = await api.get<any>(`/events?jobId=${body.jobId}`);
    return {
      title: `AI insights for job: ${job.title}`,
      json: { orgId, job, events },
    };
  }

  if (body.scope === "employee") {
    const employee = await api.get<any>(`/employees/${body.employeeId}`);
    const events = await api.get<any>(`/events?employeeId=${body.employeeId}`);
    const reviews = await api.get<any>(
      `/performance-reviews?employeeId=${body.employeeId}`,
    );
    return {
      title: `AI insights for ${employee.firstName} ${employee.lastName}`,
      json: { orgId, employee, events, reviews },
    };
  }

  // ✅ New: candidate scope
  if (body.scope === "candidate") {
    const candidate = await api.get<any>(`/candidates/${body.candidateId}`);
    // assuming backend includes answers + notes; if not, you can
    // add separate endpoints later and include them here.
    return {
      title: `AI insights for candidate: ${candidate.name}`,
      json: { orgId, candidate },
    };
  }

  throw new Error("Unsupported scope");
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    const { title, json } = await buildContext(body);

    const systemPrompt =
      "You are an expert people-ops and recruiting assistant. " +
      "Given raw HR / ATS data as JSON, you produce a short, practical summary " +
      "for managers and recruiters. Be concrete and concise.";

    const userPrompt = `
You are given JSON data from an HR system.

Return:
- A 2–3 sentence summary.
- 3–5 bullet recommendations (if relevant).

Focus on signal, not fluff.

JSON data:
${JSON.stringify(json, null, 2)}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
    });

    const content = completion.choices[0].message.content ?? "";

    return NextResponse.json({
      title,
      body: content,
    });
  } catch (err: any) {
    console.error("AI insights error:", err);
    return NextResponse.json(
      { error: "Failed to generate insights" },
      { status: 500 },
    );
  }
}
