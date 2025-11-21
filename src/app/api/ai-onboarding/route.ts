// src/app/api/ai-onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));
    const { notes, orgSnapshot } = body ?? {};

    const systemPrompt = `
You are "Intime AI Onboarding Assistant", a B2B SaaS HR partner.

Given:
- A short free-form description of the company and role(s)
- An optional snapshot of org structure, teams, and current headcount

You must return a **JSON object** with a clear 30 / 60 / 90-day onboarding plan.

Guidelines:
- Assume mid-market B2B SaaS (50–500 employees) unless orgSnapshot suggests otherwise.
- Focus on **practical actions**: people to meet, systems to get access to, metrics to own, shadowing, and quick wins.
- Include both manager actions and new hire actions.
- Make it usable for *any* role (sales, CS, product, engineering, ops) by keeping language slightly generic but still concrete.
`;

    const userPrompt = `
Company & role notes:
${notes || "No extra notes provided."}

Org snapshot (optional, may be empty):
${orgSnapshot ? JSON.stringify(orgSnapshot, null, 2) : "No structured org data provided."}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "OnboardingPlan",
          strict: true,
          schema: {
            type: "object",
            properties: {
              summary: {
                type: "string",
                description:
                  "Short narrative summary of the onboarding approach for this company / role.",
              },
              audience: {
                type: "string",
                description:
                  "One sentence on who this plan is for (e.g. 'New AE hire in a 120-person B2B SaaS org').",
              },
              day_0_to_30: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  managerActions: { type: "array", items: { type: "string" } },
                  newHireActions: { type: "array", items: { type: "string" } },
                  successSignals: { type: "array", items: { type: "string" } },
                },
                required: [
                  "theme",
                  "objectives",
                  "managerActions",
                  "newHireActions",
                  "successSignals",
                ],
              },
              day_31_to_60: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  managerActions: { type: "array", items: { type: "string" } },
                  newHireActions: { type: "array", items: { type: "string" } },
                  successSignals: { type: "array", items: { type: "string" } },
                },
                required: [
                  "theme",
                  "objectives",
                  "managerActions",
                  "newHireActions",
                  "successSignals",
                ],
              },
              day_61_to_90: {
                type: "object",
                properties: {
                  theme: { type: "string" },
                  objectives: { type: "array", items: { type: "string" } },
                  managerActions: { type: "array", items: { type: "string" } },
                  newHireActions: { type: "array", items: { type: "string" } },
                  successSignals: { type: "array", items: { type: "string" } },
                },
                required: [
                  "theme",
                  "objectives",
                  "managerActions",
                  "newHireActions",
                  "successSignals",
                ],
              },
              team_overview: {
                type: "array",
                description:
                  "Short blurbs for the key teams / collaborators this hire will work with.",
                items: {
                  type: "object",
                  properties: {
                    name: { type: "string" },
                    howWeWorkTogether: { type: "string" },
                    keyContacts: {
                      type: "array",
                      items: { type: "string" },
                    },
                  },
                  required: ["name", "howWeWorkTogether"],
                },
              },
            },
            required: [
              "summary",
              "audience",
              "day_0_to_30",
              "day_31_to_60",
              "day_61_to_90",
            ],
          },
        },
      },
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const rawContent = completion.choices[0]?.message?.content;

    if (typeof rawContent !== "string") {
      // Should not happen with response_format: json_schema, but guard anyway
      console.error("[AI Onboarding] Unexpected content shape:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 },
      );
    }

    const plan = JSON.parse(rawContent);

    return NextResponse.json(plan);
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
