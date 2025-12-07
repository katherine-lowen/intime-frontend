// src/app/people/[id]/performance-panel.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";

type ReviewRating =
  | "Needs improvement"
  | "Meets expectations"
  | "Exceeds expectations"
  | "Outstanding"
  | string
  | null
  | undefined;

type ReviewSummary = {
  id: string;
  period?: string | null;
  rating?: ReviewRating;
  createdAt?: string | null;
};

type Props = {
  employeeId: string;
};

function ratingBadge(rating: ReviewRating) {
  if (!rating) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-500">
        Unrated
      </span>
    );
  }

  const base =
    "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border";

  if (rating === "Needs improvement") {
    return (
      <span className={`${base} border-rose-200 bg-rose-50 text-rose-800`}>
        Needs improvement
      </span>
    );
  }
  if (rating === "Meets expectations") {
    return (
      <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>
        Meets expectations
      </span>
    );
  }
  if (rating === "Exceeds expectations") {
    return (
      <span
        className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}
      >
        Exceeds expectations
      </span>
    );
  }
  if (rating === "Outstanding") {
    return (
      <span
        className={`${base} border-indigo-200 bg-indigo-50 text-indigo-800`}
      >
        Outstanding
      </span>
    );
  }

  return (
    <span className={`${base} border-slate-200 bg-slate-50 text-slate-700`}>
      {rating}
    </span>
  );
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

export default function PerformancePanel({ employeeId }: Props) {
  const [reviews, setReviews] = useState<ReviewSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoading(true);
        setError(null);

        const data = await api.get<ReviewSummary[]>(
          `/performance-reviews?employeeId=${employeeId}`,
        );

        if (!cancelled) {
          setReviews(data ?? []);
        }
      } catch (err) {
        console.error("[PerformancePanel] failed to load reviews", err);
        if (!cancelled) {
          setError("Could not load performance reviews.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    if (employeeId) {
      load();
    }

    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Performance</h2>
          <p className="mt-1 text-xs text-slate-500">
            Recent reviews, ratings, and feedback snapshots.
          </p>
        </div>
        <Link
          href={`/performance/reviews?employeeId=${employeeId}`}
          className="text-[11px] font-medium text-indigo-600 hover:underline"
        >
          View all reviews
        </Link>
      </div>

      {loading && (
        <p className="text-xs text-slate-500">Loading performance data…</p>
      )}

      {error && !loading && (
        <p className="text-xs text-rose-600">{error}</p>
      )}

      {!loading && !error && reviews.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
          No performance reviews recorded yet for this employee.
          <div className="mt-2">
            <Link
              href={`/performance/reviews/new?employeeId=${employeeId}`}
              className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
            >
              Start first review
            </Link>
          </div>
        </div>
      )}

      {!loading && !error && reviews.length > 0 && (
        <ul className="mt-1 space-y-2 text-xs">
          {reviews.slice(0, 3).map((r) => (
            <li
              key={r.id}
              className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
            >
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-medium text-slate-900">
                    {r.period || "Review"}
                  </span>
                  {ratingBadge(r.rating)}
                </div>
                <div className="mt-0.5 text-[11px] text-slate-500">
                  Created {formatDate(r.createdAt)}
                </div>
              </div>
              <Link
                href={`/performance/reviews/${r.id}`}
                className="text-[11px] font-medium text-indigo-600 hover:underline"
              >
                Open
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
