// src/app/api/ai-candidate-scorecard/route.ts
import { NextResponse } from "next/server";
import OpenAI from "openai";
import api from "@/lib/api";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type MoatNote = {
  id: string;
  text: string;
  authorName?: string | null;
  createdAt?: string;
};

type CandidateResponse = {
  id: string;
  name: string;
  email?: string | null;
  stage?: string | null;
  source?: string | null;
  resumeText?: string | null;
  resumeParsed?: any;
  createdAt?: string;
  job?: {
    id: string;
    title: string;
    department?: string | null;
    description?: string | null;
  } | null;
  candidateNotes?: MoatNote[];
};

type Scorecard = {
  summary: string;
  detailedAnalysis: string;
  strengths: string[];
  risks: string[];
  skillsMatched: string[];
  skillsMissing: string[];
  cultureIndicators: string[];
  teamFit: string[];
  trajectorySignals: string[];
  moats: {
    title: string;
    description: string;
    relevance: string;
    example?: string | null;
    source: "AI" | "HUMAN_NOTE" | "RESUME_INFERENCE" | string;
  }[];
  recommendation: "Strong Fit" | "Neutral" | "Weak Fit" | string;
};

function splitNotes(notes: MoatNote[] = []) {
  const moatPattern = /^\[(AI-)?MOAT\]/i;
  const moats: MoatNote[] = [];
  const regular: MoatNote[] = [];

  for (const n of notes) {
    if (moatPattern.test(n.text ?? "")) moats.push(n);
    else regular.push(n);
  }

  return { moats, regular };
}

export async function POST(req: Request) {
  try {
    const { candidateId } = (await req.json()) as { candidateId?: string };

    if (!candidateId) {
      return NextResponse.json(
        { error: "candidateId is required" },
        { status: 400 }
      );
    }

    const candidate = (await api.get(
      `/candidates/${candidateId}`
    )) as CandidateResponse;

    const { moats: moatNotes, regular: regularNotes } = splitNotes(
      candidate.candidateNotes ?? []
    );

    const payload = {
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        stage: candidate.stage,
        source: candidate.source,
        resumeText: candidate.resumeText,
        resumeParsed: candidate.resumeParsed,
        createdAt: candidate.createdAt,
      },
      job: candidate.job ?? null,
      notes: {
        moatNotes,
        regularNotes,
      },
    };

    const systemPrompt = `
You are an exceptional senior recruiter and people-ops strategist.
You read structured JSON about a candidate and job, and return a DETAILED scorecard as JSON.
You MUST look for unconventional or non-obvious value (called "moats") that a great recruiter would notice.

Think about:
- Transferable experience
- Unusual combinations of skills
- Trajectory & growth signals
- Ownership / founder energy
- Cognitive diversity & different ways of thinking
- Culture-add (not just culture fit)
- Signals from human moat notes (fields marked as moat notes)
`.trim();

    const userPrompt = `
You will receive a single JSON object with:
- candidate
- job
- notes.moatNotes: manually created recruiter moats (trust these as human intuition)
- notes.regularNotes: normal internal notes

TASK:
Return a single JSON object with this exact shape:

{
  "summary": string,
  "detailedAnalysis": string,
  "strengths": string[],
  "risks": string[],
  "skillsMatched": string[],
  "skillsMissing": string[],
  "cultureIndicators": string[],
  "teamFit": string[],
  "trajectorySignals": string[],
  "moats": [
    {
      "title": string,
      "description": string,
      "relevance": string,
      "example": string | null,
      "source": "AI" | "HUMAN_NOTE" | "RESUME_INFERENCE"
    }
  ],
  "recommendation": "Strong Fit" | "Neutral" | "Weak Fit"
}

DEFINITIONS:
- summary: 2–3 sentences high-level overview.
- detailedAnalysis: multi-paragraph narrative (3–6 paragraphs).
- strengths: concrete, evidence-backed positives.
- risks: concrete, evidence-backed risks or concerns.
- skillsMatched: skills clearly aligned to the job (from resume, notes, moat notes).
- skillsMissing: skills that appear missing or underdeveloped.
- cultureIndicators: signals about how they might affect team culture.
- teamFit: how they'd complement the current team (based on their pattern).
- trajectorySignals: promotions, self-directed learning, entrepreneurial patterns, etc.
- moats: non-obvious or strategic advantages. Include moats derived from:
  - human moat notes (source = "HUMAN_NOTE")
  - your own inference from resume/experience (source = "RESUME_INFERENCE")
  - your own reasoning that connects the candidate to potential company initiatives (source = "AI").

For moats, always think:
"FYI: this person has X, which could be useful for Y."

Input JSON:
${JSON.stringify(payload, null, 2)}
`.trim();

    const completion = await openai.chat.completions.create({
      model: "gpt-4.1-mini",
      response_format: { type: "json_object" },
      temperature: 0.25,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
    });

    const content = completion.choices[0].message.content ?? "{}";
    const parsed = JSON.parse(content) as Scorecard;

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI candidate scorecard error:", err);
    return NextResponse.json(
      { error: "Failed to generate scorecard" },
      { status: 500 }
    );
  }
}
