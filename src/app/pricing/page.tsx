// src/app/pricing/page.tsx
"use client";

import Link from "next/link";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type PlanId = "FREE" | "GROWTH" | "SCALE";

const plans: {
  id: PlanId;
  name: string;
  tagline: string;
  price: string;
  priceDetail: string;
  perEmployee: string;
  highlight?: boolean;
  badge?: string;
  features: string[];
  ctaLabel: string;
}[] = [
  {
    id: "FREE", // maps to Starter plan in marketing copy
    name: "Starter",
    tagline: "For teams up to ~15–20 employees",
    price: "$79/mo",
    priceDetail: "Base platform fee",
    perEmployee: "+ $6 per employee / month",
    features: [
      "Applicant Tracking (ATS)",
      "Basic People Directory",
      "Time Off + Calendar",
      "Onboarding checklists",
      "Basic AI features (screening, summaries)",
    ],
    ctaLabel: "I'm a Starter team",
  },
  {
    id: "GROWTH",
    name: "Growth",
    tagline: "Best for 20–150 employee companies",
    price: "$199/mo",
    priceDetail: "Base platform fee",
    perEmployee: "+ $10 per employee / month",
    highlight: true,
    badge: "Most popular • Full AI Studio",
    features: [
      "Everything in Starter",
      "Team org chart",
      "Custom PTO policies",
      "Advanced AI matching & scoring",
      "Full AI Studio access",
      "Templates (offers, onboarding, reviews)",
      "Roles & permissions",
      "Gmail / Outlook / Slack integrations",
    ],
    ctaLabel: "I'm a Growth team",
  },
  {
    id: "SCALE",
    name: "Scale",
    tagline: "For full HRIS needs + SSO",
    price: "$399/mo",
    priceDetail: "Base platform fee",
    perEmployee: "+ $14 per employee / month",
    features: [
      "Everything in Growth",
      "Performance reviews",
      "Compensation planning",
      "Advanced analytics",
      "API access",
      "Early payroll integration",
      "SSO (Google / Azure AD)",
    ],
    ctaLabel: "I'm a Scale team",
  },
];

export default function PricingPage() {
  const { orgName, loading } = useCurrentOrg();
  const currentPlanId = null;

  return (
    <div className="mx-auto max-w-6xl px-6 py-10 space-y-10">
      {/* Hero */}
      <section className="space-y-4 text-center">
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
          Simple, transparent plans for modern teams
        </h1>
        <p className="mx-auto max-w-2xl text-sm text-slate-500">
          Intime grows with you — start with core ATS + HR, then unlock
          onboarding, performance, and AI as you scale.
        </p>
        {orgName && !loading && (
          <p className="text-xs text-slate-500">
            You&apos;re viewing plans for{" "}
            <span className="font-medium">{orgName}</span>.
          </p>
        )}
      </section>

      {/* AI studio banner */}
      <section className="mx-auto max-w-3xl rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-2 text-center text-xs font-medium text-emerald-800">
        Intime AI Studio is included on all paid plans — fully unlocked on
        Growth &amp; Scale.
      </section>

      {/* Plans */}
      <section className="grid gap-6 md:grid-cols-3">
        {plans.map((plan) => {
          const isCurrent = currentPlanId === plan.id;

          return (
            <Card
              key={plan.id}
              className={`flex flex-col border-slate-200 bg-white/80 p-6 shadow-sm ${
                plan.highlight ? "border-slate-900 shadow-md" : ""
              }`}
            >
              {/* Top badge row */}
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    {plan.name}
                  </h2>
                  <p className="text-xs text-slate-500">{plan.tagline}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {plan.badge && (
                    <span className="rounded-full bg-slate-900 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-white">
                      {plan.badge}
                    </span>
                  )}
                  {isCurrent && (
                    <span className="rounded-full bg-emerald-50 px-3 py-1 text-[10px] font-medium uppercase tracking-wide text-emerald-700">
                      Current plan
                    </span>
                  )}
                </div>
              </div>

              {/* Pricing */}
              <div className="mb-4 space-y-1">
                <div className="text-xl font-semibold text-slate-900">
                  {plan.price}
                </div>
                <p className="text-xs text-slate-500">{plan.priceDetail}</p>
                <p className="text-xs text-slate-500">{plan.perEmployee}</p>
              </div>

              {/* Features */}
              <ul className="mb-6 space-y-2 text-xs text-slate-600">
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-2">
                    <span className="mt-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    <span>{feature}</span>
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <div className="mt-auto">
                <Button
                  className="w-full"
                  variant={plan.highlight ? "default" : "outline"}
                >
                  {plan.ctaLabel}
                </Button>
              </div>
            </Card>
          );
        })}
      </section>

      {/* Bottom note */}
      <section className="border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
        Need enterprise features or &gt;200 employees?{" "}
        <Link
          href="/contact"
          className="font-medium text-slate-600 underline-offset-2 hover:underline"
        >
          Contact us
        </Link>
        .
      </section>
    </div>
  );
}
