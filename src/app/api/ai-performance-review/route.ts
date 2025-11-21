// src/app/api/ai-performance-review/route.ts
import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({} as any));

    const {
      employeeName,
      roleTitle,
      period,
      managerNotes,
      selfReviewNotes,
      peerFeedback,
      goalsContext,
      calibrationContext,
      ratingScaleContext,
    } = body ?? {};

    const systemPrompt = `
You are "Intime AI Performance Review", a B2B SaaS-focused HR assistant.

Your job: turn messy manager + self + peer feedback into a structured written review that:
- Is clear, specific, and balanced (strengths + growth)
- Uses inclusive, non-legalistic language
- Feels like something a thoughtful manager would actually say
- Maps to a typical 3–5 point rating scale (e.g. Below / Meets / Exceeds)

You output JSON ONLY (no markdown), following the provided schema.
`;

    const userPrompt = `
Create a structured performance review for:

Employee: ${employeeName || "Not specified"}
Role: ${roleTitle || "Not specified"}
Review period: ${period || "Not specified"}

Rating scale context:
${ratingScaleContext || "Standard 3–5 point performance rating scale."}

Goals / expectations context:
${goalsContext || "No explicit goals provided."}

Manager feedback (raw notes):
${managerNotes || "None provided."}

Self review notes:
${selfReviewNotes || "None provided."}

Peer feedback:
${peerFeedback || "None provided."}

Calibration / comp context (if any):
${calibrationContext || "None provided."}

Return a structured review that would help a manager finalize their written review and talking points.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "PerformanceReviewSummary",
          strict: true,
          schema: {
            type: "object",
            properties: {
              overallSummary: {
                type: "string",
                description:
                  "2–3 paragraph narrative summary of performance this period.",
              },
              strengths: {
                type: "array",
                items: { type: "string" },
                description: "Bulleted strengths, behavior- and impact-based.",
              },
              growthAreas: {
                type: "array",
                items: { type: "string" },
                description:
                  "Bulleted development areas, framed constructively with direction.",
              },
              ratingRecommendation: {
                type: "string",
                description:
                  "Recommended rating label, e.g. 'Exceeds expectations', 'Meets expectations'.",
              },
              ratingRationale: {
                type: "string",
                description:
                  "Short explanation of why this rating fits, referencing concrete examples.",
              },
              goalsNextPeriod: {
                type: "array",
                items: { type: "string" },
                description:
                  "3–6 SMART-ish goals or focus areas for the next review period.",
              },
              talkingPointsForConversation: {
                type: "array",
                items: { type: "string" },
                description:
                  "Bullets a manager can use in the live review conversation.",
              },
              toneSuggestions: {
                type: "array",
                items: { type: "string" },
                description:
                  "Tips for adjusting tone based on company culture or sensitivity.",
              },
            },
            required: [
              "overallSummary",
              "strengths",
              "growthAreas",
              "ratingRecommendation",
              "ratingRationale",
              "goalsNextPeriod",
              "talkingPointsForConversation",
              "toneSuggestions",
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
      console.error("[AI Performance Review] Unexpected content:", rawContent);
      return NextResponse.json(
        { error: "Unexpected AI response format" },
        { status: 500 }
      );
    }

    const parsed = JSON.parse(rawContent);
    return NextResponse.json(parsed);
  } catch (err) {
    console.error("[AI Performance Review] Error:", err);
    return NextResponse.json(
      { error: "Failed to generate performance review" },
      { status: 500 }
    );
  }
}
