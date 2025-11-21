import { NextResponse } from "next/server";
import OpenAI from "openai";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const form = await req.formData();
  const file = form.get("resume") as File | null;

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  // Read file buffer as text
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const text = buffer.toString("utf-8");

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!,
  });

  //
  // 1. Resume Parsing
  //
  const parsedCompletion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    messages: [
      {
        role: "system",
        content:
          "Extract structured resume data. ONLY output valid JSON with keys: summary, skills (array), experience (array), rawText.",
      },
      {
        role: "user",
        content: text,
      },
    ],
  });

  let parsed: any = {};
  try {
    parsed = JSON.parse(parsedCompletion.choices[0].message.content || "{}") as any;
  } catch (err) {
    console.error("Failed to parse resume JSON", err);
    parsed = {};
  }

  //
  // 2. Fetch job for match scoring (safe types)
  //
  let job: any = null;

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/applicants?personId=${params.id}`,
      {
        headers: {
          "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
        },
      }
    );

    const applicants: any[] = await res.json();
    const applicant = applicants[0];

    if (applicant?.jobId) {
      const jobRes = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/jobs/${applicant.jobId}`,
        {
          headers: {
            "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
          },
        }
      );

      job = await jobRes.json();
    }
  } catch (err) {
    console.error("Failed to fetch job for scoring", err);
  }

  //
  // 3. Match Scoring
  //
  let score: number | null = null;
  let matchDetails: any = null;

  if (job && typeof job.description === "string" && job.description.length > 0) {
    const matchCompletion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "Score candidate fit. ONLY output JSON: { score: number(0-100), strengths: string[], gaps: string[], notes: string }",
        },
        {
          role: "user",
          content: `Job Description:\n${job.description}\n\nCandidate Resume:\n${text}`,
        },
      ],
    });

    try {
      matchDetails = JSON.parse(
        matchCompletion.choices[0].message.content || "{}"
      ) as any;

      score =
        typeof matchDetails.score === "number"
          ? matchDetails.score
          : null;
    } catch (err) {
      console.error("Failed to parse match score JSON", err);
    }
  }

  //
  // 4. Save everything to backend
  //
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/employees/${params.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
    },
    body: JSON.stringify({
      resumeText: parsed.rawText || text || "",
      skills: parsed.skills || [],
      experience: parsed.experience || [],
      summary: parsed.summary || "",
      matchScore: score,
      matchDetails: matchDetails || null,
    }),
  });

  //
  // 5. Log event
  //
  await fetch(`${process.env.NEXT_PUBLIC_API_URL}/events`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Org-Id": process.env.NEXT_PUBLIC_ORG_ID || "demo-org",
    },
    body: JSON.stringify({
      type: "RESUME_PARSED",
      source: "system",
      employeeId: params.id,
      summary: score
        ? `Resume parsed — match score ${score}`
        : "Resume uploaded and parsed",
    }),
  });

  return NextResponse.redirect(`/people/${params.id}`);
}
