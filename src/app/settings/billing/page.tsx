// src/app/settings/billing/page.tsx
import api from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";

type BillingSummary = {
  organization: {
    id: string;
    name: string;
    slug: string;
    plan: string | null;
    stripeCustomerId: string | null;
    stripeSubscriptionId: string | null;
    stripePriceId: string | null;
    billingInterval: "monthly" | "annual" | null;
    billingStatus: string | null;
    currentPeriodEnd: string | null;
    createdAt: string;
    updatedAt: string;
  } | null;
};

async function getBillingSummary(): Promise<BillingSummary> {
  return api.get<BillingSummary>("/billing/summary");
}

const PLAN_COPY: Record<
  string,
  {
    label: string;
    tagline: string;
    priceMonthly: string;
    priceAnnual: string;
  }
> = {
  starter: {
    label: "Starter",
    tagline: "Teams up to ~20 employees.",
    priceMonthly: "$79/mo + $6 PEPM",
    priceAnnual: "$759/yr + $6 PEPM",
  },
  growth: {
    label: "Growth",
    tagline: "20–150 employee companies.",
    priceMonthly: "$199/mo + $10 PEPM",
    priceAnnual: "$1,910/yr + $10 PEPM",
  },
  scale: {
    label: "Scale",
    tagline: "Full HRIS + SSO for larger orgs.",
    priceMonthly: "$399/mo + $14 PEPM",
    priceAnnual: "$3,830/yr + $14 PEPM",
  },
};

function formatDate(iso: string | null) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default async function BillingSettingsPage() {
  const data = await getBillingSummary();
  const org = data.organization;

  const planKey = org?.plan?.toLowerCase?.() ?? "starter";
  const planMeta = PLAN_COPY[planKey] ?? PLAN_COPY["starter"];

  const interval = org?.billingInterval ?? "monthly";
  const status = org?.billingStatus ?? "inactive";
  const nextRenewal = formatDate(org?.currentPeriodEnd ?? null);

  const niceInterval =
    interval === "annual"
      ? "Billed annually"
      : interval === "monthly"
      ? "Billed monthly"
      : "Billing not configured";

  const statusBadgeLabel =
    status === "active"
      ? "Active"
      : status === "past_due"
      ? "Past due"
      : status === "canceled"
      ? "Canceled"
      : "Inactive";

  const statusBadgeClass =
    status === "active"
      ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/40"
      : status === "past_due"
      ? "bg-amber-500/10 text-amber-300 border-amber-500/40"
      : status === "canceled"
      ? "bg-rose-500/10 text-rose-300 border-rose-500/40"
      : "bg-slate-500/10 text-slate-300 border-slate-500/40";

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50 px-4 py-8">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        {/* Header */}
        <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
              Settings · Billing & subscription
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
              Billing & subscription
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Manage your Intime plan, billing details, and renewal settings.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              href="/choose-plan"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Change plan
            </Link>
            {/* Later: swap this to a real Stripe customer-portal link */}
            <button
              type="button"
              className="inline-flex items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-100 opacity-60"
              disabled
            >
              Manage payment method (coming soon)
            </button>
          </div>
        </header>

        {/* Layout: subscription card + details */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
          {/* Current plan */}
          <section className="rounded-3xl border border-slate-800 bg-slate-900/60 p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current plan
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <h2 className="text-lg font-semibold text-slate-50">
                    {planMeta.label}
                  </h2>
                  <span
                    className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${statusBadgeClass}`}
                  >
                    {statusBadgeLabel}
                  </span>
                </div>
                <p className="mt-1 text-xs text-slate-400">
                  {planMeta.tagline}
                </p>
              </div>

              {org?.name && (
                <div className="rounded-2xl border border-slate-700 bg-slate-950 px-3 py-2 text-right">
                  <p className="text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    Workspace
                  </p>
                  <p className="text-xs font-medium text-slate-100">
                    {org.name}
                  </p>
                  {org.slug && (
                    <p className="text-[11px] text-slate-500">
                      {org.slug}.intime.app
                    </p>
                  )}
                </div>
              )}
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Pricing
                </p>
                <p className="mt-2 text-sm text-slate-50">
                  {interval === "annual"
                    ? planMeta.priceAnnual
                    : planMeta.priceMonthly}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {niceInterval}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Next renewal
                </p>
                <p className="mt-2 text-sm text-slate-50">
                  {nextRenewal ?? "Not scheduled"}
                </p>
                <p className="mt-1 text-[11px] text-slate-400">
                  {status === "active"
                    ? "We’ll renew automatically on this date."
                    : "We’ll show your renewal date here once billing is active."}
                </p>
              </div>

              <div className="rounded-2xl border border-slate-800 bg-slate-950/60 p-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Subscription IDs
                </p>
                <p className="mt-2 text-[11px] font-mono text-slate-300">
                  {org?.stripeSubscriptionId ?? "—"}
                </p>
                <p className="mt-1 text-[11px] text-slate-500">
                  Shown for debugging & support only.
                </p>
              </div>
            </div>
          </section>

          {/* Activity / explainer */}
          <aside className="space-y-4">
            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                How billing works
              </p>
              <ul className="mt-3 space-y-2 text-xs text-slate-300">
                <li>
                  • Pricing is a base platform fee plus per-employee-per-month
                  (PEPM) charge.
                </li>
                <li>
                  • You can switch between Starter, Growth, and Scale at any
                  time — we’ll prorate changes automatically.
                </li>
                <li>
                  • Annual billing gives you an effective discount vs paying
                  month-to-month.
                </li>
              </ul>
            </div>

            <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-5 text-xs text-slate-400">
              <p className="font-medium text-slate-200 mb-1">
                Need help with billing?
              </p>
              <p>
                Reach out to{" "}
                <a
                  href="mailto:support@hireintime.ai"
                  className="text-indigo-400 hover:text-indigo-300"
                >
                  support@hireintime.ai
                </a>{" "}
                if you need invoices, vendor docs, or help switching plans.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
