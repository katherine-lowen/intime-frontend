"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type BillingOrganization = {
  plan: string | null;
  billingStatus: string | null;
  slug?: string | null;
  billingInterval?: "monthly" | "annual" | null;
  stripeCustomerId?: string | null;
};

type BillingSummaryResponse = {
  organization?: BillingOrganization | null;
  plan?: string | null;
  billingStatus?: string | null;
  orgSlug?: string | null;
  billingInterval?: "monthly" | "annual" | null;
  stripeCustomerId?: string | null;
};

export function useBillingSummary() {
  const params = typeof window !== "undefined" ? new URLSearchParams(window.location.search) : null;
  const orgSlugFromUrl = params?.get("org");
  const [organization, setOrganization] = useState<BillingOrganization | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get<BillingSummaryResponse>(
          orgSlugFromUrl ? `/billing/summary?org=${encodeURIComponent(orgSlugFromUrl)}` : "/billing/summary"
        );
        if (cancelled) return;
        const orgFromResponse = res?.organization ?? null;
        const plan = orgFromResponse?.plan ?? res?.plan ?? null;
        const billingStatus = orgFromResponse?.billingStatus ?? res?.billingStatus ?? null;
        const slug = orgFromResponse?.slug ?? res?.orgSlug ?? null;
        const billingInterval = orgFromResponse?.billingInterval ?? res?.billingInterval ?? null;
        const stripeCustomerId =
          orgFromResponse?.stripeCustomerId ?? res?.stripeCustomerId ?? null;

        setOrganization({
          plan,
          billingStatus,
          slug,
          billingInterval,
          stripeCustomerId,
        });
        setError(null);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load billing summary");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return { organization, loading, error };
}
