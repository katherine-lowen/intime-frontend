// src/app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Body = {
  plan: "starter" | "growth" | "scale";
  billingPeriod: "monthly" | "annual";
  email: string;
  orgSlug?: string;
  userId?: string;
};

// Server-only env vars (recommended)
const priceMap: Record<string, string | undefined> = {
  "starter:monthly": process.env.STRIPE_PRICE_STARTER_MONTHLY,
  "starter:annual": process.env.STRIPE_PRICE_STARTER_ANNUAL,
  "growth:monthly": process.env.STRIPE_PRICE_GROWTH_MONTHLY,
  "growth:annual": process.env.STRIPE_PRICE_GROWTH_ANNUAL,
  "scale:monthly": process.env.STRIPE_PRICE_SCALE_MONTHLY,
  "scale:annual": process.env.STRIPE_PRICE_SCALE_ANNUAL,
};

function getOrgSlug(req: NextRequest, bodyOrgSlug?: string) {
  const cookieSlug = req.cookies.get("__INTIME_ORG_SLUG__")?.value;
  const referer = req.headers.get("referer") || "";
  const refererMatch = referer.match(/\/org\/([^/?]+)/);

  return (
    bodyOrgSlug?.trim() ||
    (refererMatch ? refererMatch[1] : "") ||
    cookieSlug ||
    ""
  );
}

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json(
        { error: "Missing STRIPE_SECRET_KEY" },
        { status: 500 }
      );
    }

   const stripe = new Stripe(stripeSecretKey);


    const body = (await req.json()) as Body;

    if (!body.email?.trim()) {
      return NextResponse.json({ error: "Missing email" }, { status: 400 });
    }

    const orgSlug = getOrgSlug(req, body.orgSlug);

    const key = `${body.plan}:${body.billingPeriod}`;
    const priceId = priceMap[key];
    if (!priceId) {
      return NextResponse.json(
        {
          error: `Missing price for ${key}`,
          hint:
            "Set STRIPE_PRICE_* env vars (e.g. STRIPE_PRICE_GROWTH_MONTHLY=price_...).",
        },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.email.trim(),
      client_reference_id: orgSlug || undefined,
      line_items: [{ price: priceId, quantity: 1 }],

      metadata: {
        plan: body.plan,
        billingPeriod: body.billingPeriod,
        orgSlug,
        userId: body.userId ?? "",
      },

      subscription_data: {
        metadata: {
          plan: body.plan,
          billingPeriod: body.billingPeriod,
          orgSlug,
          userId: body.userId ?? "",
        },
      },

      success_url: `${origin}/billing/result?status=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/billing/result?status=canceled`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error("[Stripe] create-checkout-session error", err);
    return NextResponse.json(
      { error: err?.message || "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
