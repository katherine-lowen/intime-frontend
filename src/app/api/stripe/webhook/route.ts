// src/app/api/stripe/webhook/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
const apiBase =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}
if (!webhookSecret) {
  throw new Error("STRIPE_WEBHOOK_SECRET is not set");
}

// Do NOT pin apiVersion here – let the SDK handle it
const stripe = new Stripe(stripeSecretKey as string);

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  const sig = req.headers.get("stripe-signature");
  if (!sig) {
    return new NextResponse("Missing stripe-signature header", {
      status: 400,
    });
  }

  const rawBody = await req.text();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(rawBody, sig, webhookSecret!);
  } catch (err: any) {
    console.error("[Stripe webhook] Signature error:", err?.message || err);
    return new NextResponse(`Webhook Error: ${err?.message ?? "Invalid"}`, {
      status: 400,
    });
  }

  try {
    // Data we want to send to backend
    let orgId: string | undefined;
    let stripeCustomerId: string | null = null;
    let stripeSubscriptionId: string | null = null;
    let stripePriceId: string | null = null;
    let billingInterval: "month" | "year" | null = null;
    let billingStatus: string | null = null;
    let currentPeriodEndIso: string | null = null;

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as any;

        orgId = session.metadata?.orgId;
        stripeCustomerId =
          (session.customer as string | null) ?? null;
        stripeSubscriptionId =
          (session.subscription as string | null) ?? null;

        const mode = session.mode; // "subscription" or "payment"
        if (mode === "subscription") {
          billingStatus = "active";
        }

        break;
      }

      case "customer.subscription.created":
      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object as any;

        orgId = subscription.metadata?.orgId;
        stripeCustomerId =
          (subscription.customer as string | null) ?? null;
        stripeSubscriptionId = subscription.id ?? null;

        const price = subscription.items?.data?.[0]?.price;
        if (price) {
          stripePriceId = price.id ?? null;
          billingInterval = price.recurring?.interval ?? null;
        }

        if (subscription.current_period_end) {
          currentPeriodEndIso = new Date(
            subscription.current_period_end * 1000
          ).toISOString();
        }

        billingStatus = subscription.status ?? null;
        break;
      }

      case "invoice.paid": {
        const invoice = event.data.object as any;

        const sub = invoice.subscription as string | undefined;
        const customer = invoice.customer as string | undefined;
        const line = invoice.lines?.data?.[0] as any;

        stripeCustomerId = customer ?? null;
        stripeSubscriptionId = sub ?? null;

        if (line?.price) {
          stripePriceId = line.price.id ?? null;
          billingInterval = line.price.recurring?.interval ?? null;
        }

        if (invoice.lines?.data?.[0]?.subscription_details?.metadata?.orgId) {
          orgId =
            invoice.lines.data[0].subscription_details.metadata.orgId;
        } else if (invoice.metadata?.orgId) {
          orgId = invoice.metadata.orgId;
        }

        billingStatus = "active";
        break;
      }

      default:
        // For unhandled types, just acknowledge
        return NextResponse.json({ received: true });
    }

    // If we still don't know orgId, just acknowledge
    if (!orgId) {
      console.warn(
        "[Stripe webhook] Event without orgId metadata – type:",
        event.type
      );
      return NextResponse.json({ received: true });
    }

    // Send normalized billing info to backend
    await fetch(`${apiBase}/billing/stripe-webhook`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-org-id": orgId,
      },
      body: JSON.stringify({
        stripeCustomerId,
        stripeSubscriptionId,
        stripePriceId,
        billingInterval,
        billingStatus,
        currentPeriodEnd: currentPeriodEndIso,
      }),
    });

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[Stripe webhook] handler error:", err);
    return new NextResponse("Webhook handler error", { status: 500 });
  }
}
