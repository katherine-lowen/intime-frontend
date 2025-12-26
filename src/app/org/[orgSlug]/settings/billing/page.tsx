"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useBillingSummary } from "@/hooks/useBillingSummary";
import { createCheckout, openBillingPortal } from "@/lib/api-billing";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { getSeatStatus, type SeatStatus } from "@/lib/api-seats";

const STATUS_STYLES: Record<string, string> = {
  active: "border-emerald-500/40 bg-emerald-500/10 text-emerald-100",
  past_due: "border-amber-400/50 bg-amber-400/10 text-amber-100",
  canceled: "border-rose-500/40 bg-rose-500/10 text-rose-100",
  inactive: "border-slate-500/40 bg-slate-500/10 text-slate-200",
};

export default function OrgBillingPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug ?? "";
  const search = useSearchParams();
  const success = search?.get("success") === "1";
  const { organization, loading, error } = useBillingSummary();
  const [portalLoading, setPortalLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [seats, setSeats] = useState<SeatStatus | null>(null);
  const [seatError, setSeatError] = useState<string | null>(null);

  const planLabel = (organization?.plan || "starter").toLowerCase();
  const billingStatus = organization?.billingStatus || "inactive";
  const stripeCustomerId = organization?.stripeCustomerId ?? null;
  const interval = organization?.billingInterval === "annual" ? "Annual" : "Monthly";
  const statusClass = STATUS_STYLES[billingStatus] ?? STATUS_STYLES["inactive"];
  const manageDisabled = billingStatus !== "active" || !stripeCustomerId || portalLoading;

  const unavailableReason = useMemo(() => {
    if (billingStatus !== "active") return "Billing is not active yet.";
    if (!stripeCustomerId) return "No billing profile yet. Complete checkout first.";
    return null;
  }, [billingStatus, stripeCustomerId]);

  const handlePortal = async () => {
    if (!orgSlug || manageDisabled) return;
    try {
      setPortalLoading(true);
      const res = await openBillingPortal(orgSlug);
      if (!res?.url) throw new Error("Missing portal URL");
      window.location.href = res.url;
    } catch (err: any) {
      toast.error(err?.message || "Unable to open billing portal");
    } finally {
      setPortalLoading(false);
    }
  };

  useEffect(() => {
    if (!orgSlug) return;
    let cancelled = false;
    async function loadSeats() {
      try {
        const res = await getSeatStatus(orgSlug);
        if (!cancelled) {
          setSeats(res);
          setSeatError(null);
        }
      } catch (err: any) {
        if (!cancelled) setSeatError(err?.message || "Unable to load seats");
      }
    }
    void loadSeats();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const handleCheckout = async (priceId: string) => {
    if (!orgSlug) return;
    try {
      setCheckoutLoading(priceId);
      const res = await createCheckout(orgSlug, priceId);
      if (!res?.url) throw new Error("Missing checkout URL");
      window.location.href = res.url;
    } catch (err: any) {
      toast.error(err?.message || "Unable to start checkout");
    } finally {
      setCheckoutLoading(null);
    }
  };

  return (
    <main className="min-h-screen bg-slate-950 px-4 py-8 text-slate-50">
      <div className="mx-auto flex max-w-4xl flex-col gap-6">
        <header className="flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-500">
            Settings · Billing
          </p>
          <h1 className="text-2xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-slate-400">
            Manage your Intime subscription, billing status, and invoices.
          </p>
        </header>

        {error ? (
          <SupportErrorCard
            title="Unable to load billing"
            message={error}
            requestId={(organization as any)?._requestId || null}
          />
        ) : null}

        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="space-y-1">
              <CardTitle className="text-lg text-white">Current plan</CardTitle>
              {loading ? (
                <p className="text-sm text-slate-400">Loading billing summary…</p>
              ) : error ? (
                <p className="text-sm text-red-200">{error}</p>
              ) : (
                <div className="flex flex-wrap items-center gap-2 text-sm text-slate-200">
                  <span className="capitalize">{planLabel}</span>
                  <Badge variant="outline" className={`text-[11px] ${statusClass}`}>
                    {billingStatus}
                  </Badge>
                  <span className="text-xs text-slate-400">{interval} billing</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handlePortal}
                disabled={manageDisabled || loading}
                className="bg-indigo-500 text-white hover:bg-indigo-400"
              >
                {portalLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                Manage billing
              </Button>
              {billingStatus !== "active" && (
                <Button asChild variant="outline" className="border-slate-700 text-slate-100">
                  <Link href="/choose-plan">Choose plan</Link>
                </Button>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4 text-sm text-slate-200">
            {success && (
              <Alert className="border-emerald-500/50 bg-emerald-500/10 text-emerald-100">
                <AlertTitle>Payment confirmed</AlertTitle>
                <AlertDescription className="text-emerald-50">
                  Your subscription is active. You can manage billing below.
                </AlertDescription>
              </Alert>
            )}
            {unavailableReason && (
              <Alert className="border-slate-800 bg-slate-900 text-slate-200">
                <AlertTitle>Almost there</AlertTitle>
                <AlertDescription className="text-slate-300">
                  {unavailableReason}{" "}
                  {billingStatus !== "active" ? (
                    <Link
                      href="/choose-plan"
                      className="font-semibold text-indigo-300 hover:text-indigo-200"
                    >
                      Complete checkout
                    </Link>
                  ) : null}
                </AlertDescription>
              </Alert>
            )}

            {!unavailableReason && (
              <p className="text-slate-400">
                You&apos;ll be redirected to the Stripe customer portal to manage payment methods,
                invoices, and billing details.
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="border-slate-800 bg-slate-900/70">
          <CardHeader>
            <CardTitle className="text-lg text-white">Seats</CardTitle>
            <p className="text-sm text-slate-400">
              Track your seat allocation and usage.
            </p>
          </CardHeader>
          <CardContent className="text-sm text-slate-200">
            {seatError ? (
              <p className="text-amber-200">{seatError}</p>
            ) : seats ? (
              <div className="flex items-center gap-3">
                <span className="text-base font-semibold text-white">
                  {seats.seatsUsed} / {seats.seatsAllowed}
                </span>
                {seats.overLimit && (
                  <Badge className="bg-amber-500/20 text-amber-100">Over limit</Badge>
                )}
              </div>
            ) : (
              <p className="text-slate-400">Loading seats…</p>
            )}
          </CardContent>
        </Card>

        {/* Pricing grid */}
        <Card className="border-slate-800 bg-slate-900/60">
          <CardHeader>
            <CardTitle className="text-lg text-white">Choose a plan</CardTitle>
            <p className="text-sm text-slate-400">
              Upgrade to unlock AI hiring, performance automation, and premium support.
            </p>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-3">
            {PLANS.map((plan) => {
              const activePlan = plan.id.toLowerCase() === planLabel;
              return (
                <div
                  key={plan.id}
                  className={`flex flex-col gap-3 rounded-xl border p-4 ${
                    plan.id === "GROWTH"
                      ? "border-indigo-400 bg-indigo-950/30"
                      : "border-slate-800 bg-slate-950/60"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">{plan.name}</p>
                      <p className="text-xs text-slate-300">{plan.subtitle}</p>
                    </div>
                    {activePlan && (
                      <Badge className="bg-emerald-500/20 text-emerald-100">Current</Badge>
                    )}
                    {plan.badge && (
                      <Badge className="bg-indigo-500/20 text-indigo-100">{plan.badge}</Badge>
                    )}
                  </div>
                  <div className="text-2xl font-semibold text-white">{plan.price}</div>
                  <div className="text-[11px] text-slate-300 space-y-1">
                    {plan.subtext.map((line) => (
                      <div key={line}>• {line}</div>
                    ))}
                  </div>
                  <ul className="space-y-1 text-xs text-slate-200">
                    {plan.perks.map((perk) => (
                      <li key={perk}>• {perk}</li>
                    ))}
                  </ul>
                  <Button
                    disabled={checkoutLoading !== null}
                    onClick={() => handleCheckout(plan.priceId)}
                    className={`mt-auto ${
                      plan.id === "GROWTH"
                        ? "bg-indigo-500 text-white hover:bg-indigo-400"
                        : "bg-slate-800 text-white hover:bg-slate-700"
                    }`}
                    variant={activePlan ? "outline" : "default"}
                  >
                    {checkoutLoading === plan.priceId ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : null}
                    {plan.cta}
                  </Button>
                </div>
              );
            })}
          </CardContent>
          <p className="mt-3 text-xs text-slate-400">
            Need enterprise features or &gt;200 employees? Contact us
          </p>
        </Card>
      </div>
    </main>
  );
}

const PLANS = [
  {
    id: "STARTER",
    name: "Starter",
    subtitle: "For teams up to ~15–20 employees",
    price: "$79/mo",
    priceId: "price_starter",
    subtext: ["Base platform fee", "+ $6 per employee / month"],
    perks: [
      "Applicant Tracking (ATS)",
      "Basic People Directory",
      "Time Off + Calendar",
      "Onboarding checklists",
      "Basic AI features (screening, summaries)",
    ],
    cta: "I'm a Starter team",
  },
  {
    id: "GROWTH",
    name: "Growth",
    subtitle: "Best for 20–150 employee companies",
    price: "$199/mo",
    priceId: "price_growth",
    badge: "Most popular · Full AI Studio",
    subtext: ["Base platform fee", "+ $10 per employee / month"],
    perks: [
      "Everything in Starter",
      "Team org chart",
      "Custom PTO policies",
      "Advanced AI matching & scoring",
      "Full AI Studio access",
      "Templates (offers, onboarding, reviews)",
      "Roles & permissions",
      "Gmail / Outlook / Slack integrations",
    ],
    cta: "I'm a Growth team",
  },
  {
    id: "SCALE",
    name: "Scale",
    subtitle: "For full HRIS needs + SSO",
    price: "$399/mo",
    priceId: "price_scale",
    subtext: ["Base platform fee", "+ $14 per employee / month"],
    perks: [
      "Everything in Growth",
      "Performance reviews",
      "Compensation planning",
      "Advanced analytics",
      "API access",
      "Early Payroll integration",
      "SSO (Google / Azure AD)",
    ],
    cta: "I'm a Scale team",
  },
];
