// src/app/api/support/route.ts
import { NextRequest, NextResponse } from "next/server";
import { Resend } from "resend";

type SupportPayload = {
  topic?: string;
  message?: string;
  fromName?: string;
  fromEmail?: string;
};

function getResend() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    // Important: don't throw here – just log and return null
    console.warn(
      "[support] RESEND_API_KEY is not set. Support emails will be skipped."
    );
    return null;
  }
  return new Resend(apiKey);
}

export async function POST(req: NextRequest) {
  let body: SupportPayload = {};

  try {
    body = (await req.json()) as SupportPayload;
  } catch {
    // If body is not valid JSON, keep defaults
    body = {};
  }

  const topic = body.topic?.trim() || "General support";
  const message = body.message?.trim() || "(no message provided)";
  const fromName = body.fromName?.trim() || "Unknown user";
  const fromEmail = body.fromEmail?.trim() || "unknown@example.com";

  const resend = getResend();

  // If email isn't configured, just log and pretend it worked
  if (!resend) {
    console.log("[support] Skipping email send because RESEND_API_KEY is missing", {
      topic,
      fromName,
      fromEmail,
    });

    return NextResponse.json(
      {
        ok: true,
        emailSent: false,
        message: "Support captured locally; email delivery not configured.",
      },
      { status: 200 }
    );
  }

  try {
    await resend.emails.send({
      from: "Intime Support <support@hireintime.ai>",
      to: "support@hireintime.ai",
      subject: `[Intime] ${topic}`,
      text: [
        `New support request from Intime app`,
        "",
        `From: ${fromName} <${fromEmail}>`,
        `Topic: ${topic}`,
        "",
        `Message:`,
        message,
      ].join("\n"),
    });

    return NextResponse.json({ ok: true, emailSent: true });
  } catch (err) {
    console.error("Error sending support email", err);
    // Still respond 200 so the UI isn't totally blocked
    return NextResponse.json(
      {
        ok: false,
        emailSent: false,
        error: "Failed to send support request email",
      },
      { status: 200 }
    );
  }
}
