// src/app/performance/reviews/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import Link from "next/link";

export const dynamic = "force-dynamic";

type ReviewRating =
  | "Needs improvement"
  | "Meets expectations"
  | "Exceeds expectations"
  | "Outstanding"
  | string
  | null
  | undefined;

type ReviewListItem = {
  id: string;
  period?: string | null;
  rating?: ReviewRating;
  createdAt?: string | null;
  employee?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    title?: string | null;
    department?: string | null;
  } | null;
};

async function getReviews(): Promise<ReviewListItem[]> {
  try {
    return await api.get<ReviewListItem[]>("/performance/reviews");
  } catch (err) {
    console.error("Failed to load performance reviews:", err);
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function getEmployeeName(r: ReviewListItem) {
  const e = r.employee;
  if (!e) return "Employee";
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  return name || e.email || "Employee";
}

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
      <span
        className={`${base} border-rose-200 bg-rose-50 text-rose-800`}
      >
        Needs improvement
      </span>
    );
  }

  if (rating === "Meets expectations") {
    return (
      <span
        className={`${base} border-slate-200 bg-slate-50 text-slate-700`}
      >
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

  // Fallback for any custom rating strings
  return (
    <span
      className={`${base} border-slate-200 bg-slate-50 text-slate-700`}
    >
      {rating}
    </span>
  );
}

export default async function PerformanceReviewsPage() {
  const reviews = await getReviews();

  const total = reviews.length;
  const needsImprovement = reviews.filter(
    (r) => r.rating === "Needs improvement"
  );
  const meets = reviews.filter(
    (r) => r.rating === "Meets expectations"
  );
  const exceeds = reviews.filter(
    (r) => r.rating === "Exceeds expectations"
  );
  const outstanding = reviews.filter(
    (r) => r.rating === "Outstanding"
  );
  const unrated = reviews.filter((r) => !r.rating);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Performance reviews
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View completed reviews, spot patterns, and jump into individual
              cycles.
            </p>
          </div>
          <Link
            href="/performance/reviews/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            New review
          </Link>
        </header>

        {/* SUMMARY STATS */}
        <section className="grid gap-4 sm:grid-cols-4">
          <SummaryCard
            label="Total reviews"
            value={total}
            helper="All-time"
          />
          <SummaryCard
            label="Outstanding"
            value={outstanding.length}
            helper="Top performers"
          />
          <SummaryCard
            label="Exceeds expectations"
            value={exceeds.length}
            helper="Above the bar"
          />
          <SummaryCard
            label="Needs improvement"
            value={needsImprovement.length}
            helper="Coaching needed"
          />
        </section>

        {/* BUCKETS */}
        <section className="space-y-6">
          <ReviewBucket
            title="Outstanding"
            helper="Employees with the highest performance rating."
            empty="No outstanding reviews yet."
            items={outstanding}
          />
          <ReviewBucket
            title="Exceeds expectations"
            helper="Consistently strong performance above expectations."
            empty="No reviews in this bucket yet."
            items={exceeds}
          />
          <ReviewBucket
            title="Meets expectations"
            helper="Solid, reliable performance at the expected level."
            empty="No reviews in this bucket yet."
            items={meets}
          />
          <ReviewBucket
            title="Needs improvement"
            helper="Performance areas that may require support or coaching."
            empty="No reviews flagged as needing improvement."
            items={needsImprovement}
          />
          <ReviewBucket
            title="Unrated"
            helper="Reviews without a formal rating, but with notes or summaries."
            empty="No unrated reviews."
            items={unrated}
          />
        </section>
      </main>
    </AuthGate>
  );
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

function ReviewBucket({
  title,
  helper,
  empty,
  items,
}: {
  title: string;
  helper: string;
  empty: string;
  items: ReviewListItem[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{helper}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
          {empty}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Period
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Rating
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Created
                </th>
                <th className="px-4 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">
                    {r.employee ? (
                      <Link
                        href={`/people/${r.employee.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {getEmployeeName(r)}
                      </Link>
                    ) : (
                      <span className="font-medium text-slate-900">
                        {getEmployeeName(r)}
                      </span>
                    )}
                    {r.employee?.title && (
                      <div className="text-xs text-slate-500">
                        {r.employee.title}
                        {r.employee.department
                          ? ` · ${r.employee.department}`
                          : ""}
                      </div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {r.period || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {ratingBadge(r.rating)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatDate(r.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-right text-sm">
                    <Link
                      href={`/performance/reviews/${r.id}`}
                      className="text-xs font-medium text-indigo-600 hover:text-indigo-500 hover:underline"
                    >
                      Open review
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
