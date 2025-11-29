// src/app/api/stripe/create-checkout-session/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripeSecretKey = process.env.STRIPE_SECRET_KEY;

if (!stripeSecretKey) {
  throw new Error("STRIPE_SECRET_KEY is not set");
}

const stripe = new Stripe(stripeSecretKey);

type Body = {
  plan: "starter" | "growth" | "scale";
  billingPeriod: "monthly" | "annual";
  email: string;
};

const priceMap: Record<string, string | undefined> = {
  "starter:monthly": process.env.NEXT_PUBLIC_STARTER_MONTHLY_PRICE_ID,
  "starter:annual": process.env.NEXT_PUBLIC_STARTER_ANNUAL_PRICE_ID,
  "growth:monthly": process.env.NEXT_PUBLIC_GROWTH_MONTHLY_PRICE_ID,
  "growth:annual": process.env.NEXT_PUBLIC_GROWTH_ANNUAL_PRICE_ID,
  "scale:monthly": process.env.NEXT_PUBLIC_SCALE_MONTHLY_PRICE_ID,
  "scale:annual": process.env.NEXT_PUBLIC_SCALE_ANNUAL_PRICE_ID,
};

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as Body;
    const key = `${body.plan}:${body.billingPeriod}`;
    const priceId = priceMap[key];

    if (!priceId) {
      return NextResponse.json(
        { error: `Unknown plan or missing price for ${key}` },
        { status: 400 }
      );
    }

    const origin = req.nextUrl.origin;

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      customer_email: body.email,
      line_items: [{ price: priceId, quantity: 1 }],
      metadata: {
        plan: body.plan,
        billingPeriod: body.billingPeriod,
        // later we can add orgId, userId, etc.
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
