// src/app/api/stripe/finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

type Body = {
  sessionId: string;
};

export async function POST(req: NextRequest) {
  try {
    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error("[Stripe finalize] Missing STRIPE_SECRET_KEY");
      return NextResponse.json(
        { error: "Stripe is not configured on this server" },
        { status: 500 }
      );
    }

    const stripe = new Stripe(stripeSecretKey);

    const { sessionId } = (await req.json()) as Body;
    if (!sessionId) {
      return NextResponse.json(
        { error: "Missing sessionId" },
        { status: 400 }
      );
    }

    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // You can forward this to your backend later if you want:
    // await fetch(`${process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080"}/billing/finalize`, { ... })

    return NextResponse.json({ session });
  } catch (err: any) {
    console.error("[Stripe finalize] error", err);
    return NextResponse.json(
      { error: err?.message || "Failed to finalize checkout" },
      { status: 500 }
    );
  }
}
