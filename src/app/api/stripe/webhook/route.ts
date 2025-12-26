import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function finalizeInBackend(payload: {
  sessionId: string;
  customerId?: string | null;
  subscriptionId?: string | null;
  metadata?: Record<string, any> | null;
  clientReferenceId?: string | null;
  customerEmail?: string | null;
}) {
  const url =
    process.env.BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_BASE_URL ||
    process.env.NEXT_PUBLIC_API_URL;
  const token =
    process.env.BILLING_SYNC_TOKEN || process.env.NEXT_PUBLIC_BILLING_SYNC_TOKEN; // ✅ must match backend check

  if (!url || !token) return;

  await fetch(`${url}/billing/stripe/finalize`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-billing-token": token,
    },
    body: JSON.stringify(payload),
  });
}

export async function POST(req: NextRequest) {
  try {
    const secretKey = process.env.STRIPE_SECRET_KEY;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!secretKey || !webhookSecret) {
      return NextResponse.json(
        { error: "Stripe webhook not configured" },
        { status: 500 }
      );
    }

    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return NextResponse.json(
        { error: "Missing stripe-signature" },
        { status: 400 }
      );
    }

    const rawBody = await req.text();

    const stripe = new Stripe(secretKey);
    const event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);

    // ✅ Only handle the one event that "activates" the org
    if (event.type === "checkout.session.completed") {
      const session = event.data.object as Stripe.Checkout.Session;

      await finalizeInBackend({
        sessionId: session.id,
        customerId: (session.customer as string) ?? null,
        subscriptionId: (session.subscription as string) ?? null,
        metadata: session.metadata ?? null,
        clientReferenceId: session.client_reference_id ?? null,
        customerEmail: session.customer_details?.email || session.customer_email || null,
      });
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error("[Stripe webhook] error", err);
    // return 400 so Stripe can retry if signature/event parsing failed
    return NextResponse.json(
      { error: err?.message || "Webhook error" },
      { status: 400 }
    );
  }
}
