// src/app/api/ai-suggestion-event/route.ts
import { NextResponse } from "next/server";
import api from "@/lib/api";

export async function POST(req: Request) {
  let body: any;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const { suggestion } = body || {};

  if (!suggestion || typeof suggestion !== "string" || !suggestion.trim()) {
    return NextResponse.json(
      { error: "Field 'suggestion' (non-empty string) is required" },
      { status: 400 }
    );
  }

  // Trim summary so we don't blow up any DB limits
  const summary = suggestion.trim().slice(0, 280);

  const payload = {
    summary,
    type: "task", // adjust if your backend expects a specific enum
    source: "ai-insight",
    startsAt: new Date().toISOString(), // optional, safe default
  };

  try {
    const event = await api.post<any>("/events", payload);

    return NextResponse.json(
      {
        ok: true,
        event,
      },
      { status: 201 }
    );
  } catch (err) {
    console.error("Failed to create event from AI suggestion", err);
    return NextResponse.json(
      { error: "Failed to create event from suggestion" },
      { status: 500 }
    );
  }
}
