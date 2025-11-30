// src/app/api/ai-insights/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import api from "@/lib/api";

// Graceful OpenAI client (no crash if key is missing)
const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

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
    }
  | {
      scope: "employee_document";
      documentId: string;
    }
  | {
      scope: "dashboard";
    }
  // allow "empty" / unknown to fall back to org-level stats
  | Record<string, unknown>;

// What the frontend expects
type AiInsights = {
  summary: string;
  suggestions: string[];
};

async function buildContext(body: Body): Promise<{ title: string; json: any }> {
  const orgId = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

  // ----- JOB INSIGHTS -----
  if (body && (body as any).scope === "job" && "jobId" in body) {
    const jobId = (body as any).jobId as string;
    const job = await api.get<any>(`/jobs/${jobId}`);
    const events = await api.get<any>(`/events?jobId=${jobId}`);
    return {
      title: `AI insights for job: ${job.title}`,
      json: { orgId, job, events },
    };
  }

  // ----- EMPLOYEE INSIGHTS -----
  if (body && (body as any).scope === "employee" && "employeeId" in body) {
    const employeeId = (body as any).employeeId as string;
    const employee = await api.get<any>(`/employees/${employeeId}`);
    const events = await api.get<any>(`/events?employeeId=${employeeId}`);
    return {
      title: `AI insights for employee: ${employee.firstName} ${employee.lastName}`,
      json: { orgId, employee, events },
    };
  }

  // ----- CANDIDATE INSIGHTS -----
  if (body && (body as any).scope === "candidate" && "candidateId" in body) {
    const candidateId = (body as any).candidateId as string;
    const candidate = await api.get<any>(`/candidates/${candidateId}`);

    // We can also pull the related job if it exists
    let job: any = null;
    if (candidate.jobId) {
      try {
        job = await api.get<any>(`/jobs/${candidate.jobId}`);
      } catch {
        job = null;
      }
    }

    return {
      title: `AI insights for candidate: ${candidate.name}`,
      json: { orgId, candidate, job },
    };
  }

  // ----- EMPLOYEE DOCUMENT INSIGHTS -----
  if (
    body &&
    (body as any).scope === "employee_document" &&
    "documentId" in body
  ) {
    const documentId = (body as any).documentId as string;
    const document = await api.get<any>(`/employee-documents/${documentId}`);
    const employee = document.employee ?? null;

    return {
      title: `AI insights for document: ${document.title}`,
      json: {
        orgId,
        document,
        employee,
      },
    };
  }

  // ----- DASHBOARD / ORG INSIGHTS (DEFAULT) -----
  // For scope "dashboard" or any unknown/empty body, use /stats as context.
  try {
    const stats = await api.get<any>("/stats");
    return {
      title: "AI insights for your organization",
      json: { orgId, stats },
    };
  } catch {
    return {
      title: "AI insights for your organization",
      json: { orgId },
    };
  }
}

function buildFallbackInsights(title: string): AiInsights {
  return {
    summary: `${title}. AI is not fully configured, so this is a static summary. Overall, focus on time-to-hire, manager workload, and uneven distribution of PTO usage to find operational moats.`,
    suggestions: [
      "Identify roles where time-to-hire is consistently faster and document what those hiring managers do differently.",
      "Look for employees who regularly step into cross-functional work and consider formalizing that into their role or career path.",
      "Surface teams that rarely take PTO and proactively nudge managers to schedule coverage and encourage time off.",
      "Tag candidates with unusual but relevant backgrounds (bootcamps, career switchers, side projects) as potential 'moat' hires, even if they don't match every bullet.",
      "Use your events, documents, and career moves as a time-series to spot patterns around quarter-end crunch, recurring bottlenecks, and hidden champions.",
    ],
  };
}

export async function POST(req: NextRequest) {
  let body: Body = {} as Body;

  // Safely parse JSON body – frontend might send an empty body
  try {
    body = (await req.json()) as Body;
  } catch {
    body = {} as Body;
  }

  const { title, json } = await buildContext(body);

  // If no OpenAI API key, return a static-but-useful answer
  if (!openai) {
    console.error("[AI Insights] Missing OPENAI_API_KEY");
    return NextResponse.json(buildFallbackInsights(title), { status: 200 });
  }

  try {
    const prompt = `
You are an expert HR and recruiting strategist.

You are helping a founder understand where their organization has hidden "moats" in people and process.
You will get JSON context about their org (jobs, employees, candidates, documents, stats, events).

1. Read the JSON carefully and infer:
   - Time-based signals (seasonality, crunch periods, slow vs fast hires).
   - Hidden talent signals (non-traditional backgrounds, internal mobility, "glue" people).
   - Risk signals (burnout, manager overload, underused teams, stalled roles).
   - For documents, highlight key obligations, unusual clauses, or patterns vs other templates.

2. Respond with a JSON object with this shape:

{
  "summary": "Short, 2–3 sentence plain-English summary.",
  "suggestions": [
    "Concrete, moat-style action 1",
    "Concrete, moat-style action 2",
    "Concrete, moat-style action 3",
    "Optional action 4",
    "Optional action 5"
  ]
}

Here is the org context JSON:
${JSON.stringify(json)}
    `.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You are a precise HR strategy AI that ALWAYS returns valid JSON with keys: summary (string) and suggestions (string[]).",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.4,
    });

    const raw = completion.choices[0]?.message?.content ?? "";

    let parsed: any = null;
    try {
      parsed = raw ? JSON.parse(raw) : null;
    } catch {
      parsed = null;
    }

    let summary = "";
    let suggestions: string[] = [];

    if (parsed && typeof parsed === "object") {
      if (typeof parsed.summary === "string") {
        summary = parsed.summary;
      }
      if (Array.isArray(parsed.suggestions)) {
        suggestions = parsed.suggestions
          .map((s) => String(s).trim())
          .filter(Boolean);
      }
    }

    // If the model didn't give clean JSON, fall back to best-effort
    if (!summary) {
      summary =
        raw.slice(0, 400) ||
        "AI could not generate structured insights. Use static suggestions instead.";
    }

    if (!suggestions.length) {
      suggestions = buildFallbackInsights(title).suggestions;
    }

    const payload: AiInsights = {
      summary,
      suggestions,
    };

    return NextResponse.json(payload);
  } catch (err) {
    console.error("AI insights error:", err);
    // On error, still return fallback insights so the UI doesn't break
    return NextResponse.json(buildFallbackInsights(title), { status: 200 });
  }
}
