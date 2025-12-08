// src/app/employee/reviews/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type Review = {
  id: string;
  period: string;
  status: string;
  dueDate?: string | null;
};

type ReviewsResponse = {
  items: Review[];
};

export default function EmployeeReviewsPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<ReviewsResponse>("/me/reviews");
        if (!cancelled) setReviews(data?.items ?? []);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[reviews] fetch failed", err);
          setError(err?.message || "Failed to load reviews.");
          setReviews([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My reviews</h1>
          <p className="text-sm text-slate-600">
            Performance reviews and status for your current and past cycles.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <div className="col-span-6">Period</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-3">Due</div>
          </div>

          {loading ? (
            <div className="space-y-2 px-4 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : reviews.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No reviews yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {reviews.map((r) => (
                <div
                  key={r.id}
                  className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm text-slate-800"
                >
                  <div className="col-span-6 font-medium text-slate-900">{r.period}</div>
                  <div className="col-span-3 text-slate-700">{r.status}</div>
                  <div className="col-span-3 text-slate-700">
                    {r.dueDate ? new Date(r.dueDate).toLocaleDateString() : "—"}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
