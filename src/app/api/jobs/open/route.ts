// src/app/api/jobs/open/route.ts
import { NextRequest, NextResponse } from "next/server";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8080";

export async function GET(_req: NextRequest) {
  try {
    const res = await fetch(`${API_URL}/careers/jobs`, {
      // add auth headers here if your backend requires them
      next: { revalidate: 30 },
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("[jobs/open] backend error:", res.status, text);
      return NextResponse.json(
        { error: "Failed to load jobs" },
        { status: 500 },
      );
    }

    const data = await res.json();
    // normalize shape a bit
    const jobs = (data as any[]).map((j) => ({
      id: j.id,
      title: j.title,
      location: j.location ?? null,
      department: j.department ?? null,
    }));

    return NextResponse.json({ jobs });
  } catch (err: any) {
    console.error("[jobs/open] error:", err);
    return NextResponse.json(
      { error: err?.message || "Unexpected error" },
      { status: 500 },
    );
  }
}
