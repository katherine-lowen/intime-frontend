// src/app/api/public-apply/route.ts
import { NextResponse } from "next/server";
import api from "@/lib/api";

type Body = {
  jobId: string;
  name: string;
  email: string;
  phone?: string | null;
  linkedinUrl?: string | null;
  resumeText?: string | null;
  source?: string | null;
};

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as Body;

    if (!body.jobId || !body.name?.trim() || !body.email?.trim()) {
      return NextResponse.json(
        { error: "jobId, name and email are required" },
        { status: 400 }
      );
    }

    const payload = {
      jobId: body.jobId,
      name: body.name.trim(),
      email: body.email.trim(),
      phone: body.phone?.trim() || null,
      linkedinUrl: body.linkedinUrl?.trim() || null,
      resumeText: body.resumeText ?? null,
      stage: "NEW",
      source: body.source ?? "public_job_board",
      notes: null,
    };

    // This uses your existing backend /candidates endpoint
    const created = await api.post("/candidates", payload);

    return NextResponse.json(created, { status: 201 });
  } catch (err) {
    console.error("public-apply error:", err);
    return NextResponse.json(
      { error: "Failed to submit application" },
      { status: 500 }
    );
  }
}
