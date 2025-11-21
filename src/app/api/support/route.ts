// src/app/api/support/route.ts
import { NextResponse } from "next/server";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SupportPayload = {
  topic?: string;
  message?: string;
  fromName?: string;
  fromEmail?: string;
};

export async function POST(req: Request) {
  let body: SupportPayload = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const topic = body.topic?.trim();
  const message = body.message?.trim();
  const fromName = body.fromName?.trim() || "Unknown user";
  const fromEmail = body.fromEmail?.trim() || "not-provided@hireintime.ai";

  if (!topic || !message) {
    return NextResponse.json(
      { error: "Topic and message are required" },
      { status: 400 },
    );
  }

  if (!process.env.RESEND_API_KEY) {
    console.warn("RESEND_API_KEY is not set");
    return NextResponse.json(
      { error: "Email service not configured" },
      { status: 500 },
    );
  }

  try {
    await resend.emails.send({
      from: "Intime Support <support@hireintime.ai>",
      to: ["support@hireintime.ai"],

      // 🔧 FIXED: it's `replyTo`, not `reply_to`
      replyTo: fromEmail,

      subject: `[Intime] ${topic}`,
      text: [
        `New support request from Intime app`,
        ``,
        `From: ${fromName} <${fromEmail}>`,
        `Topic: ${topic}`,
        ``,
        `Message:`,
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("Error sending support email", err);
    return NextResponse.json(
      { error: "Failed to send support request" },
      { status: 500 },
    );
  }
}
