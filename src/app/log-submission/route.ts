// src/app/log-submission/route.ts
import { NextResponse } from "next/server";

// Simple no-op log endpoint so build doesn't depend on Supabase
export async function POST(request: Request) {
  try {
    // You can parse and inspect the body here if you want:
    // const body = await request.json();
    // console.log("log-submission", body);

    return NextResponse.json(
      {
        ok: true,
        message: "Log received (no-op, Supabase disabled).",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("log-submission error", err);
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to handle log submission.",
      },
      { status: 500 }
    );
  }
}
