// src/app/api/ai-resume-match/add-to-pipeline/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";
const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      jobId,
      candidateName,
      candidateEmail,
      resumeUrl,
      matchScore,
      summary,
      strengths,
      risks,
    } = body;

    if (!jobId || !candidateName) {
      return NextResponse.json(
        { error: "jobId and candidateName are required" },
        { status: 400 },
      );
    }

    // Call your NestJS backend ATS endpoint
    const backendRes = await fetch(
      `${API_URL}/orgs/${ORG_ID}/jobs/${jobId}/candidates/ai-match`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          // include auth header / API key here if needed
        },
        body: JSON.stringify({
          name: candidateName,
          email: candidateEmail || null,
          resumeUrl,
          matchScore,
          summary,
          strengths,
          risks,
          source: "INTIME_AI_RESUME_MATCH",
        }),
      },
    );

    const backendJson = await backendRes.json();

    if (!backendRes.ok) {
      console.error(
        "[ai-resume-match/add-to-pipeline] backend error:",
        backendRes.status,
        backendJson,
      );
      return NextResponse.json(
        { error: backendJson?.message || "Backend error" },
        { status: 502 },
      );
    }

    return NextResponse.json({
      success: true,
      candidate: backendJson,
    });
  } catch (err: any) {
    console.error("[ai-resume-match/add-to-pipeline] error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
