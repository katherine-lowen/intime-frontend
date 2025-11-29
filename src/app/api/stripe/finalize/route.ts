// src/app/api/stripe/finalize/route.ts
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function GET(req: NextRequest) {
  const sessionId = req.nextUrl.searchParams.get("session_id");

  if (!sessionId) {
    return new NextResponse("Missing session_id", { status: 400 });
  }

  try {
    // 1️⃣ Fetch the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId, {
      expand: ["customer", "subscription"],
    });

    const metadata = session.metadata || {};
    const email = session.customer_details?.email;

    if (!email) {
      return new NextResponse("Missing customer email.", { status: 500 });
    }

    // 2️⃣ Create workspace + user in backend
    const backendRes = await fetch(
      `${process.env.NEXT_PUBLIC_API_URL}/auth/create-from-stripe`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          orgId: metadata.orgId,
          plan: metadata.plan,
          billingPeriod: metadata.billingPeriod,
          stripeCustomerId: session.customer,
          stripeSubscriptionId: session.subscription,
        }),
      }
    );

    if (!backendRes.ok) {
      const text = await backendRes.text();
      console.error("Backend error:", text);
      return new NextResponse("Backend error", { status: 500 });
    }

    const data = await backendRes.json();

    // 3️⃣ Return user session to frontend
    return NextResponse.json({
      success: true,
      user: data.user,
    });
  } catch (err: any) {
    console.error("[Finalize] Stripe error:", err.message);
    return new NextResponse("Finalize error", { status: 500 });
  }
}
