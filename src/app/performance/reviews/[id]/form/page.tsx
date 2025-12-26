"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";

import { AuthGate } from "@/components/dev-auth-gate";
import { getReviewForm } from "@/lib/api-performance";
import type { ReviewFormPayload } from "@/lib/performance-types";
import { ReviewForm } from "@/components/performance/ReviewForm";

function getBase() {
  const inferred = (globalThis as any).__INTIME_ORG_SLUG__ as string | undefined;
  return inferred ? `/org/${inferred}` : "";
}

export default function ReviewFormPage() {
  const params = useParams() as { id?: string } | null;
  const reviewId = params?.id ?? "";

  const search = useSearchParams();
  const roleParam = ((search?.get("role") ?? "self").toUpperCase() as
    | "SELF"
    | "MANAGER");

  const [payload, setPayload] = useState<ReviewFormPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!reviewId) {
        setLoading(false);
        setPayload(null);
        setError("Missing review id.");
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await getReviewForm(reviewId, roleParam);
        if (cancelled) return;

        setPayload(data ?? null);
        if (!data) setError("Review form not found.");
      } catch (err: any) {
        console.error("[review form] load failed", err);
        if (!cancelled) setError(err?.message || "Failed to load review form.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [reviewId, roleParam]);

  const base = getBase();

  return (
    <AuthGate>
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        <Link
          href={`${base}/performance/reviews`}
          className="text-xs font-semibold text-indigo-700 hover:underline"
        >
          ← Back to reviews
        </Link>

        {loading ? (
          <div className="space-y-3">
            <div className="h-6 w-40 rounded bg-slate-100" />
            <div className="h-16 rounded bg-slate-100" />
            <div className="h-24 rounded bg-slate-100" />
          </div>
        ) : error || !payload ? (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-sm text-amber-800">
            {error ?? "Review form not found."}
          </div>
        ) : (
          <ReviewForm reviewId={reviewId} role={roleParam} payload={payload} />
        )}
      </main>
    </AuthGate>
  );
}
