// src/app/api/ai-onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const apiKey = process.env.OPENAI_API_KEY;
const openai = apiKey ? new OpenAI({ apiKey }) : null;

export async function POST(req: NextRequest) {
  try {
    if (!openai) {
      console.error("[AI Onboarding] Missing OPENAI_API_KEY");
      return NextResponse.json(
        {
          error:
            "AI is not configured yet. Set OPENAI_API_KEY to enable onboarding plans.",
        },
        { status: 500 },
      );
    }

    let body: any = {};
    try {
      body = await req.json();
    } catch {
      body = {};
    }

    const { notes, orgSnapshot } = body ?? {};

    const systemPrompt = `
You are "Intime AI Onboarding Assistant", a B2B SaaS HR partner.

Given:
- A short free-form description of the company and role(s)
- An optional snapshot of org structure, teams, and current headcount

You must return a JSON object with a clear 30 / 60 / 90-day onboarding plan.

Guidelines:
- Assume mid-market B2B SaaS (50–500 employees) unless orgSnapshot suggests otherwise.
- Focus on practical actions: people to meet, systems to get access to, metrics to own, shadowing, and quick wins.
- Include both manager actions and new hire actions.
- Make it usable for any role (sales, CS, product, engineering, ops) by keeping language slightly generic but still concrete.
- Always respond with a single JSON object (no markdown, no extra commentary).
`.trim();

    const userPrompt = `
Company & role notes:
${notes || "No extra notes provided."}

Org snapshot (optional, may be empty):
${
  orgSnapshot
    ? JSON.stringify(orgSnapshot, null, 2)
    : "No structured org data provided."
}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.4,
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (typeof rawContent !== "string") {
      console.error("[AI Onboarding] Unexpected content shape:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 },
      );
    }

    let plan: any;
    try {
      plan = JSON.parse(rawContent);
    } catch (e) {
      console.error("[AI Onboarding] JSON parse error:", e, rawContent);
      return NextResponse.json(
        { error: "Failed to parse onboarding plan from AI" },
        { status: 500 },
      );
    }

    // Lightweight normalization / safety net
    const fallbackPhase = {
      theme: "Ramp up",
      objectives: [],
      managerActions: [],
      newHireActions: [],
      successSignals: [],
    };

    const safePlan = {
      summary:
        typeof plan.summary === "string"
          ? plan.summary
          : "30/60/90 day onboarding plan for your new hire.",
      audience:
        typeof plan.audience === "string"
          ? plan.audience
          : "New hire in a B2B SaaS organization.",
      day_0_to_30: {
        ...fallbackPhase,
        ...(plan.day_0_to_30 || {}),
      },
      day_31_to_60: {
        ...fallbackPhase,
        ...(plan.day_31_to_60 || {}),
      },
      day_61_to_90: {
        ...fallbackPhase,
        ...(plan.day_61_to_90 || {}),
      },
      team_overview: Array.isArray(plan.team_overview)
        ? plan.team_overview
        : [],
    };

    return NextResponse.json(safePlan);
  } catch (err) {
    console.error("[AI Onboarding] Error:", err);
    return NextResponse.json(
      {
        error: "Failed to generate onboarding plan",
      },
      { status: 500 },
    );
  }
}
