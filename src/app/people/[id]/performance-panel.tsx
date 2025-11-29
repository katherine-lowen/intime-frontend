// src/app/people/[id]/performance-panel.tsx
import api from "@/lib/api";
import Link from "next/link";

type ReviewRating =
  | "Needs improvement"
  | "Meets expectations"
  | "Exceeds expectations"
  | "Outstanding"
  | string
  | null
  | undefined;

type PerformanceReview = {
  id: string;
  period?: string | null;
  rating?: ReviewRating;
  createdAt?: string | null;
  managerSummary?: string | null;
};

function ratingBadge(rating: ReviewRating) {
  if (!rating) {
    return (
      <span className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        Unrated
      </span>
    );
  }

  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border";

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

async function getPerformanceReviews(
  employeeId: string,
): Promise<PerformanceReview[]> {
  try {
    // ✅ hits your Nest controller: @Controller('performance-reviews')
    return await api.get<PerformanceReview[]>(
      `/performance-reviews?employeeId=${encodeURIComponent(employeeId)}`,
    );
  } catch (err) {
    console.error("Failed to load performance reviews for person:", err);
    return [];
  }
}

export async function PerformancePanel({ employeeId }: { employeeId: string }) {
  const reviews = await getPerformanceReviews(employeeId);
  const hasReviews = reviews.length > 0;

  // Sort newest → oldest just in case
  const sorted = reviews
    .slice()
    .sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    });

  const latest = sorted[0];

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Performance reviews
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Recent manager reviews and ratings for this person.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/performance/reviews/new?employeeId=${encodeURIComponent(
              employeeId,
            )}`}
            className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            New review
          </Link>
          <Link
            href={`/performance/reviews?employeeId=${encodeURIComponent(
              employeeId,
            )}`}
            className="text-xs font-medium text-slate-500 hover:text-slate-700"
          >
            View all
          </Link>
        </div>
      </div>

      {!hasReviews ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-xs text-slate-600">
          No performance reviews logged yet for this person.
          <br />
          <span className="text-slate-500">
            Create a first review to start their performance history.
          </span>
        </div>
      ) : (
        <div className="space-y-3">
          {/* Latest review summary pill */}
          {latest && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
                    Latest review
                  </div>
                  <div className="mt-0.5 text-sm font-semibold text-slate-900">
                    {latest.period || "Review period"}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500">
                    Created {formatDate(latest.createdAt)}
                  </div>
                </div>
                <div className="shrink-0">{ratingBadge(latest.rating)}</div>
              </div>
              {latest.managerSummary && (
                <p className="mt-2 line-clamp-3 text-xs text-slate-700">
                  {latest.managerSummary}
                </p>
              )}
            </div>
          )}

          {/* Compact list of recent reviews */}
          <div className="space-y-1.5">
            {sorted.slice(0, 3).map((r) => (
              <div
                key={r.id}
                className="flex items-center justify-between gap-2 rounded-lg px-2 py-1.5 text-xs hover:bg-slate-50"
              >
                <div>
                  <div className="font-medium text-slate-900">
                    {r.period || "Review"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    {formatDate(r.createdAt)}
                  </div>
                </div>
                <Link
                  href={`/performance/reviews/${r.id}`}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500"
                >
                  Open
                </Link>
              </div>
            ))}
          </div>
        </div>
      )}
    </section>
  );
}
