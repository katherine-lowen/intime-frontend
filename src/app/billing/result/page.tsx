"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight } from "lucide-react";
import { API_BASE_URL } from "@/lib/api";

type Search = {
  [key: string]: string | string[] | undefined;
};

function getStringParam(
  searchParams: Search,
  key: string,
  defaultValue = ""
): string {
  const v = searchParams[key];
  if (Array.isArray(v)) return v[0] ?? defaultValue;
  return v ?? defaultValue;
}

export const dynamic = "force-dynamic";

export default function BillingResultPage({
  searchParams,
}: {
  searchParams: Search;
}) {
  const router = useRouter();
  const status = getStringParam(searchParams, "status", "success"); // "success" | "cancel"
  const plan = getStringParam(searchParams, "plan", "growth");
  const billing = getStringParam(searchParams, "billing", "monthly"); // "monthly" | "annual"
  const sessionId = getStringParam(searchParams, "session_id", "");

  const isSuccess = status === "success";
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const planLabel =
    plan === "starter" ? "Starter" : plan === "scale" ? "Scale" : "Growth";

  const billingLabel = billing === "annual" ? "Annual" : "Monthly";

  const fallbackOrgSlug = useMemo(() => {
    if (typeof document === "undefined") return "";
    const match = document.cookie.match(/__INTIME_ORG_SLUG__=([^;]+)/);
    return match ? decodeURIComponent(match[1]) : "";
  }, []);

  useEffect(() => {
    if (!isSuccess || !sessionId) return;

    const token =
      process.env.NEXT_PUBLIC_BILLING_SYNC_TOKEN ||
      process.env.BILLING_SYNC_TOKEN;

    const finalizeAndPoll = async () => {
      setProcessing(true);
      setError(null);
      try {
        if (token) {
          // nudge backend finalize (webhook should also handle this)
          await fetch(`${API_BASE_URL}/billing/stripe/finalize`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "x-billing-token": token,
            },
            body: JSON.stringify({ sessionId }),
          }).catch(() => undefined);
        }

        const started = Date.now();
        const poll = async () => {
          try {
            const res = await fetch(`${API_BASE_URL}/billing/summary`, {
              credentials: "include",
            });
            if (!res.ok) throw new Error("Failed to fetch billing summary");
            const data = await res.json();
            if (data?.billingStatus === "active") {
              const slug =
                data?.orgSlug || data?.org?.slug || fallbackOrgSlug || "demo-org";
              router.push(`/org/${slug}/dashboard`);
              return true;
            }
          } catch (err) {
            // swallow and retry until timeout
          }
          return false;
        };

        let done = await poll();
        while (!done && Date.now() - started < 30000) {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          done = await poll();
        }
        if (!done) {
          setError("Billing is still activating. Please refresh in a moment.");
          setProcessing(false);
        }
      } catch (err: any) {
        console.error("[billing result] finalize/poll failed", err);
        setError(err?.message || "Unable to confirm billing right now.");
        setProcessing(false);
      }
    };

    void finalizeAndPoll();
  }, [billing, fallbackOrgSlug, isSuccess, plan, router, sessionId]);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <header className="mb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500">
            Intime · Billing
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            {isSuccess ? "You’re all set 🎉" : "Checkout cancelled"}
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-slate-400">
            {isSuccess
              ? "We’ve received your subscription details from Stripe. We’re activating your workspace now."
              : "Your card wasn’t charged. You can pick a different plan or try again at any time."}
          </p>
        </header>

        {/* Content */}
        <div className="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
          {/* Left: status card */}
          <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-5 shadow-xl shadow-black/40">
            <div className="flex items-start gap-3">
              <div className="mt-1 flex h-9 w-9 items-center justify-center rounded-full bg-slate-900">
                {isSuccess ? (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                ) : (
                  <XCircle className="h-5 w-5 text-amber-400" />
                )}
              </div>
              <div className="space-y-1">
                <h2 className="text-sm font-semibold text-slate-50">
                  {isSuccess ? "Subscription confirmed" : "Checkout not completed"}
                </h2>
                <p className="text-xs text-slate-400">
                  {isSuccess ? (
                    <>We’re finalizing your subscription and workspace setup.</>
                  ) : (
                    <>
                      No changes were made to your account. You can restart the
                      checkout flow or head back to your workspace overview.
                    </>
                  )}
                </p>
              </div>
            </div>

            {/* Plan summary */}
            <div className="mt-5 rounded-xl border border-slate-800 bg-slate-950/60 p-4 text-xs">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500">
                    Selected plan
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-50">
                    Intime HR Platform · {planLabel}
                  </p>
                  <p className="text-[11px] text-slate-400">Billing: {billingLabel}</p>
                </div>
                {isSuccess && (
                  <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-3 py-1 text-[11px] font-medium text-emerald-300">
                    Activating…
                  </span>
                )}
              </div>
            </div>
          </section>

          {/* Right: next actions */}
          <section className="flex flex-col justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/70 p-5">
            <div>
              <h2 className="text-sm font-semibold text-slate-50">
                {isSuccess ? "Next up: finish your workspace" : "What would you like to do?"}
              </h2>
              <p className="mt-2 text-xs text-slate-400">
                {isSuccess ? (
                  <>We’ll redirect you once your subscription is active.</>
                ) : (
                  <>
                    You can restart checkout with a different plan, or go back to your
                    dashboard without making any changes.
                  </>
                )}
              </p>
            </div>

            <div className="space-y-3 text-sm">
              {isSuccess ? (
                <>
                  <button
                    type="button"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:opacity-70"
                    disabled
                  >
                    {processing ? "Activating…" : "Finishing setup…"}
                    <ArrowRight className="h-4 w-4" />
                  </button>
                  <Link
                    href="/choose-plan"
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Change plan or billing cadence
                  </Link>
                </>
              ) : (
                <>
                  <Link
                    href="/choose-plan"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-indigo-500 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400"
                  >
                    Back to plan selection
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href="/dashboard"
                    className="inline-flex w-full items-center justify-center rounded-full border border-slate-700 bg-slate-900 px-4 py-2 text-xs font-medium text-slate-200 hover:bg-slate-800"
                  >
                    Return to dashboard
                  </Link>
                </>
              )}
            </div>

            <p className="mt-1 text-[11px] text-slate-500">
              {error && <span className="block text-amber-300">{error}</span>}
              Need help with billing? Reach out to{" "}
              <a
                href="mailto:founders@hireintime.ai"
                className="text-slate-300 underline decoration-slate-600 underline-offset-2 hover:text-white"
              >
                founders@hireintime.ai
              </a>
              .
            </p>
          </section>
        </div>
      </div>
    </main>
  );
}
