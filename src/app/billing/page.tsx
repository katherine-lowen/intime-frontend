// src/app/billing/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type BillingSummary = {
  orgId: string;
  plan: string | null;
  billingStatus: string | null;
  billingInterval: "month" | "year" | null;
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  stripePriceId: string | null;
  currentPeriodEnd: string | null; // ISO string
};

async function getBillingSummary(): Promise<BillingSummary | null> {
  try {
    return await api.get<BillingSummary>("/billing/summary");
  } catch (e) {
    console.error("[Billing] Failed to load summary", e);
    return null;
  }
}

function formatDate(dateStr: string | null | undefined) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function prettyPlan(plan: string | null | undefined) {
  if (!plan) return "No active plan";
  const normalized = plan.toLowerCase();

  if (normalized.includes("starter")) return "Starter";
  if (normalized.includes("growth")) return "Growth";
  if (normalized.includes("scale")) return "Scale";

  return plan;
}

function prettyInterval(interval: string | null | undefined) {
  if (!interval) return "";
  if (interval === "month") return "Monthly";
  if (interval === "year") return "Annual";
  return interval;
}

export default async function BillingPage() {
  const summary = await getBillingSummary();

  const hasSub =
    summary &&
    !!summary.stripeSubscriptionId &&
    !!summary.billingStatus &&
    summary.billingStatus !== "incomplete";

  const nextRenewal = formatDate(summary?.currentPeriodEnd ?? null);
  const intervalLabel = prettyInterval(summary?.billingInterval);
  const planLabel = prettyPlan(summary?.plan);

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
            Platform / Billing
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-50">
            Billing & subscription
          </h1>
          <p className="mt-1 max-w-xl text-sm text-slate-400">
            See your current Intime plan, billing status, and upcoming renewal.
          </p>
        </div>

        {/* Status pill */}
        {summary && (
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
              Status
            </span>
            <span
              className={[
                "mt-1 inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium",
                hasSub
                  ? "border-emerald-500/60 bg-emerald-500/10 text-emerald-200"
                  : "border-amber-500/60 bg-amber-500/10 text-amber-100",
              ].join(" ")}
            >
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-current" />
              {hasSub ? "Active subscription" : "No active subscription"}
            </span>
          </div>
        )}
      </header>

      {/* Main layout */}
      <section className="grid gap-5 md:grid-cols-[minmax(0,2fr)_minmax(0,1.4fr)]">
        {/* Left: Plan card */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                  Current plan
                </p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-lg font-semibold text-slate-50">
                    {planLabel}
                  </span>
                  {intervalLabel && (
                    <span className="rounded-full bg-slate-800 px-2 py-0.5 text-[11px] text-slate-300">
                      {intervalLabel}
                    </span>
                  )}
                </div>
              </div>

              <div className="hidden text-right text-xs text-slate-400 md:block">
                <p>Org ID</p>
                <p className="font-mono text-[11px] text-slate-500">
                  {summary?.orgId ?? "—"}
                </p>
              </div>
            </div>

            <div className="grid gap-3 text-xs text-slate-300 md:grid-cols-3">
              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Billing status
                </p>
                <p className="font-medium">
                  {summary?.billingStatus ?? "unknown"}
                </p>
                <p className="text-[11px] text-slate-500">
                  Status from your Stripe subscription.
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Renewal
                </p>
                <p className="font-medium">
                  {nextRenewal ? nextRenewal : "Not set"}
                </p>
                <p className="text-[11px] text-slate-500">
                  {intervalLabel
                    ? `Renews on this date (${intervalLabel.toLowerCase()}).`
                    : "Set after your first successful payment."}
                </p>
              </div>

              <div className="space-y-1">
                <p className="text-[10px] uppercase tracking-[0.16em] text-slate-500">
                  Stripe IDs
                </p>
                <p className="font-mono text-[11px] text-slate-400">
                  Cust: {summary?.stripeCustomerId ?? "—"}
                  <br />
                  Sub: {summary?.stripeSubscriptionId ?? "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Plan guidance */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-xs text-slate-300">
            <p className="font-medium text-slate-100">
              Need to upgrade, downgrade, or cancel?
            </p>
            <p className="mt-1 text-slate-400">
              In production, this section will link to the Stripe customer
              portal so you can manage payment methods and plan changes
              yourself. For now, you can re-run checkout with a different plan
              while you&apos;re testing.
            </p>
          </div>
        </div>

        {/* Right: Call-to-action / quick actions */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              Manage subscription
            </p>
            <h2 className="mt-2 text-sm font-semibold text-slate-50">
              Change plan or update payment method
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              While things are still in early access, you can switch tiers by
              going back through the plan selection and Stripe checkout flow.
            </p>

            <div className="mt-4 flex flex-col gap-2 text-xs">
              <Link
                href="/choose-plan"
                className="inline-flex items-center justify-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white hover:bg-indigo-500"
              >
                Change plan
              </Link>
              <p className="text-[11px] text-slate-500">
                In the future this will open a Stripe customer portal session
                for one-click billing management.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 text-[11px] text-slate-400">
            <p className="font-medium text-slate-100">Billing notes</p>
            <ul className="mt-2 list-disc space-y-1 pl-4">
              <li>
                You&apos;ll only be charged when checkout completes
                successfully on Stripe.
              </li>
              <li>
                Plan changes made mid-cycle will be reflected on your next
                invoice according to Stripe&apos;s proration rules.
              </li>
              <li>
                For YC / friends-and-family pilots, you can apply manual credits
                or coupons directly in Stripe.
              </li>
            </ul>
          </div>
        </div>
      </section>

      {!summary && (
        <p className="mt-2 text-xs text-slate-500">
          Couldn&apos;t load billing data yet. Once you&apos;ve completed a
          checkout session, refresh this page to see your subscription details.
        </p>
      )}
    </main>
  );
}
