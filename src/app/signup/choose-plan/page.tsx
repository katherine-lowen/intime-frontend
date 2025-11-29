// src/app/choose-plan/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type BillingPeriod = "monthly" | "annual";
type PlanKey = "starter" | "growth" | "scale";

const API_ROUTE = "/api/stripe/create-checkout-session";

type Plan = {
  key: PlanKey;
  name: string;
  tagline: string;
  bestFor: string;
  badge?: string;
  basePriceMonthly: string;
  pepm: string;
  priceLabelMonthly: string;
  priceLabelAnnual: string;
  annualBlurb: string;
  features: string[];
};

const PLANS: Plan[] = [
  {
    key: "starter",
    name: "Starter",
    tagline: "Teams up to ~20 employees.",
    bestFor: "Early teams getting out of spreadsheets.",
    basePriceMonthly: "$79/mo",
    pepm: "$6 PEPM",
    priceLabelMonthly: "$79/mo",
    priceLabelAnnual: "$758/yr",
    annualBlurb: "Billed annually · save ~20%",
    features: [
      "Applicant Tracking (ATS)",
      "People directory",
      "Time off + calendar",
      "Onboarding checklists",
      "Basic AI features",
    ],
  },
  {
    key: "growth",
    name: "Growth",
    tagline: "20–150 employee companies.",
    bestFor: "Your core ICP — modern HR ops teams.",
    badge: "Most popular",
    basePriceMonthly: "$199/mo",
    pepm: "$10 PEPM",
    priceLabelMonthly: "$199/mo",
    priceLabelAnnual: "$1,910/yr",
    annualBlurb: "Billed annually · save ~20%",
    features: [
      "Everything in Starter",
      "Team org chart",
      "Custom PTO policies",
      "Advanced AI matching / scoring",
      "Templates for offers, onboarding, reviews",
      "Roles, permissions + integrations",
    ],
  },
  {
    key: "scale",
    name: "Scale",
    tagline: "Companies ready for full HRIS + SSO.",
    bestFor: "People teams with complex programs.",
    basePriceMonthly: "$399/mo",
    pepm: "$14 PEPM",
    priceLabelMonthly: "$399/mo",
    priceLabelAnnual: "$3,830/yr",
    annualBlurb: "Billed annually · save ~20%",
    features: [
      "Everything in Growth",
      "Performance reviews",
      "Compensation planning",
      "Advanced analytics",
      "API access & early payroll",
      "SSO (Google / Azure AD)",
    ],
  },
];

export default function ChoosePlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialBilling =
    (searchParams?.get("billing") as BillingPeriod) || "monthly";
  const initialPlan =
    (searchParams?.get("plan") as PlanKey) || ("growth" as PlanKey);

  const [billing, setBilling] = useState<BillingPeriod>(initialBilling);
  const [selectedPlan, setSelectedPlan] = useState<PlanKey>(initialPlan);
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = PLANS.find((p) => p.key === selectedPlan)!;

  async function handleCheckout(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (!email.trim()) {
      setError("Enter your work email to continue.");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch(API_ROUTE, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          plan: selectedPlan,
          billingPeriod: billing,
          email: email.trim(),
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Checkout session creation failed:", res.status, text);
        throw new Error("Unable to start checkout.");
      }

      const data = (await res.json()) as { url: string };
      window.location.href = data.url;
    } catch (err: any) {
      console.error("[ChoosePlan] checkout error", err);
      setError(err?.message || "Something went wrong starting checkout.");
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-4 pb-10 pt-16 lg:px-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-6">
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Intime · HR Platform
            </div>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
              Choose your Intime plan
            </h1>
            <p className="mt-2 max-w-xl text-sm text-slate-400">
              Start with any tier. You can upgrade or downgrade at any time.
              Pricing is a base platform fee plus per-employee-per-month (PEPM).
            </p>

            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-slate-900/80 p-1 text-xs text-slate-200 ring-1 ring-slate-800">
              <button
                type="button"
                onClick={() => setBilling("monthly")}
                className={`rounded-full px-3 py-1 transition ${
                  billing === "monthly"
                    ? "bg-slate-50 text-slate-900 shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Monthly
              </button>
              <button
                type="button"
                onClick={() => setBilling("annual")}
                className={`inline-flex items-center gap-1 rounded-full px-3 py-1 transition ${
                  billing === "annual"
                    ? "bg-indigo-500 text-white shadow-sm"
                    : "text-slate-300 hover:text-white"
                }`}
              >
                Annual
                <span className="rounded-full bg-slate-900/60 px-1.5 py-0.5 text-[10px] font-semibold">
                  Save ~20%
                </span>
              </button>
            </div>
          </div>

          <div className="text-xs text-slate-400">
            <div className="text-right">
              Already have an account?{" "}
              <button
                className="font-medium text-indigo-400 hover:text-indigo-300"
                onClick={() => router.push("/login")}
              >
                Log in
              </button>
            </div>
            <p className="mt-2 max-w-xs text-right text-[11px] text-slate-500">
              You’ll pick exact employee counts and payment details securely in
              Stripe. You can cancel anytime.
            </p>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <section className="mt-10 space-y-8">
          {/* Plan cards */}
          <div className="grid gap-5 md:grid-cols-3">
            {PLANS.map((p) => {
              const isSelected = p.key === selectedPlan;
              const priceLabel =
                billing === "monthly"
                  ? p.priceLabelMonthly
                  : p.priceLabelAnnual;
              const subline =
                billing === "monthly"
                  ? `Base platform + ${p.pepm}`
                  : p.annualBlurb;

              return (
                <button
                  key={p.key}
                  type="button"
                  onClick={() => setSelectedPlan(p.key)}
                  className={[
                    "group flex flex-col rounded-2xl border px-4 py-5 text-left transition",
                    isSelected
                      ? "border-indigo-500 bg-slate-900/80 shadow-lg shadow-indigo-500/20"
                      : "border-slate-800 bg-slate-950/60 hover:border-slate-600 hover:bg-slate-900/70",
                  ].join(" ")}
                >
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <div>
                      <h2 className="text-sm font-semibold text-white">
                        {p.name}
                      </h2>
                      <p className="mt-0.5 text-[11px] text-slate-400">
                        {p.tagline}
                      </p>
                    </div>
                    {p.badge && (
                      <span className="rounded-full bg-indigo-500/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-indigo-300">
                        {p.badge}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 space-y-0.5">
                    <div className="text-lg font-semibold text-white">
                      {priceLabel}
                    </div>
                    <div className="text-[11px] text-slate-400">{subline}</div>
                  </div>

                  <div className="mt-4 border-t border-slate-800 pt-3">
                    <p className="mb-2 text-[11px] font-medium uppercase tracking-[0.16em] text-slate-500">
                      What&apos;s included
                    </p>
                    <ul className="space-y-1.5 text-[11px] text-slate-200">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <span className="mt-[3px] inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="mt-5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>{p.bestFor}</span>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs font-medium",
                        isSelected
                          ? "bg-indigo-500 text-white"
                          : "bg-slate-800 text-slate-100 group-hover:bg-slate-700",
                      ].join(" ")}
                    >
                      {isSelected ? "Selected" : "Select plan"}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Create workspace (full-width, more integrated) */}
          <section className="rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 px-5 py-5 md:px-7 md:py-6">
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-md">
                <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-semibold text-slate-200 ring-1 ring-slate-700">
                  <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Step 2 · Create your workspace
                </div>
                <h2 className="mt-3 text-lg font-semibold text-white">
                  You&apos;re almost set up.
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  Enter your work email and confirm your subscription in
                  Stripe. We&apos;ll create your Intime workspace automatically
                  once payment succeeds.
                </p>

                <div className="mt-3 text-[11px] text-slate-500">
                  <p>On the next screen you can:</p>
                  <ul className="mt-1 list-disc space-y-0.5 pl-4">
                    <li>Confirm your plan and billing frequency</li>
                    <li>Set the number of employees you&apos;re paying for</li>
                    <li>Update payment details or cancel anytime</li>
                  </ul>
                </div>
              </div>

              <form
                onSubmit={handleCheckout}
                className="w-full max-w-sm space-y-3"
              >
                <div>
                  <label className="block text-[11px] font-medium uppercase tracking-[0.16em] text-slate-400">
                    Work email
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
                    className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-950/80 px-3 py-2 text-sm text-slate-50 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-2 text-[11px] text-slate-300">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-slate-100">
                      Selected plan:
                    </span>
                    <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-slate-300">
                      {billing === "annual" ? "Annual" : "Monthly"}
                    </span>
                  </div>
                  <div className="mt-1 text-[11px] text-slate-300">
                    {plan.name} ·{" "}
                    {billing === "annual"
                      ? plan.priceLabelAnnual
                      : plan.priceLabelMonthly}
                  </div>
                </div>

                {error && (
                  <div className="rounded-md border border-rose-500/60 bg-rose-950/40 px-3 py-2 text-[11px] text-rose-100">
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/30 transition hover:bg-indigo-400 disabled:cursor-wait disabled:opacity-70"
                >
                  {submitting ? "Redirecting to Stripe…" : "Continue to secure checkout"}
                </button>

                <p className="text-[10px] text-slate-500">
                  You&apos;ll only be charged after confirming payment on
                  Stripe. You can manage or cancel your subscription at any
                  time.
                </p>
              </form>
            </div>
          </section>
        </section>
      </div>
    </main>
  );
}
