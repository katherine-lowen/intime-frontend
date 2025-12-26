// src/app/api/stripe/finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function callBackendFinalize(payload: any) {
  const baseUrl =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL;

  // ✅ SERVER-ONLY token (do NOT use NEXT_PUBLIC_* here)
  const token = process.env.BILLING_SYNC_TOKEN;

  if (!baseUrl) {
    return { ok: false, error: "Missing BACKEND_URL (or NEXT_PUBLIC_API_BASE_URL)" };
  }
  if (!token) {
    return { ok: false, error: "Missing BILLING_SYNC_TOKEN" };
  }

  const res = await fetch(`${baseUrl}/billing/stripe/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Billing-Token": token,
    },
    body: JSON.stringify(payload),
  });

  const text = await res.text();
  if (!res.ok) {
    return {
      ok: false,
      error: `Backend finalize failed (${res.status})`,
      detail: text,
    };
  }

  try {
    return { ok: true, data: JSON.parse(text) };
  } catch {
    return { ok: true, data: text };
  }
}

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json(
        { ok: false, error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

    const { sessionId } = (await req.json()) as { sessionId?: string };
    if (!sessionId) {
      return NextResponse.json(
        { ok: false, error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const stripe = new Stripe(stripeKey);

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    const backend = await callBackendFinalize({
      sessionId: session.id,
      customerId: session.customer,
      subscriptionId: session.subscription,
      metadata: session.metadata,
      clientReferenceId: session.client_reference_id,
      customerEmail: session.customer_details?.email || session.customer_email,
    });

    if (!backend.ok) {
      return NextResponse.json(
        { ok: false, error: backend.error, detail: (backend as any).detail },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, result: backend.data });
  } catch (err: any) {
    console.error("[Stripe finalize] error", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Finalize error" },
      { status: 500 }
    );
  }
}
