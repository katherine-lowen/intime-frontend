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

type Review = {
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

function getEmployeeName(e: Review["employee"]) {
  if (!e) return "Employee";
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  return name || e.email || "Employee";
}

async function getReviews(): Promise<Review[]> {
  try {
    // Always get the full list; filter by employeeId on the server component.
    const reviews = await api.get<Review[]>("/performance-reviews");
    // api.get might return undefined; normalize to []
    return reviews ?? [];
  } catch (err) {
    console.error("Failed to load performance reviews:", err);
    return [];
  }
}

export default async function PerformanceReviewsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const reviews = await getReviews();

  const employeeIdFilter =
    typeof searchParams?.employeeId === "string"
      ? searchParams.employeeId
      : undefined;

  const filteredReviews = employeeIdFilter
    ? reviews.filter((r) => r.employee?.id === employeeIdFilter)
    : reviews;

  const hasReviews = filteredReviews.length > 0;
  const firstEmployee = filteredReviews[0]?.employee;

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Performance / Reviews</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Performance reviews
            </h1>
            <p className="text-sm text-slate-600">
              Central log of manager reviews and self-reviews across your org.
            </p>

            {employeeIdFilter && firstEmployee && (
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                <span className="inline-flex items-center rounded-full bg-indigo-50 px-2.5 py-0.5 font-medium text-indigo-700">
                  Filtered to{" "}
                  <span className="ml-1">
                    {getEmployeeName(firstEmployee)}
                  </span>
                </span>
                <Link
                  href="/performance/reviews"
                  className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
                >
                  Clear filter
                </Link>
              </div>
            )}
          </div>

          <Link
            href="/performance/reviews/new"
            className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            + New review
          </Link>
        </header>

        {!hasReviews ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
            <p className="font-medium text-slate-700">
              {employeeIdFilter
                ? "No reviews found for this person yet."
                : "No performance reviews yet."}
            </p>
            <p className="mt-1">
              Start by logging the most recent review for someone on your team.
            </p>
            <div className="mt-4">
              <Link
                href={
                  employeeIdFilter
                    ? `/performance/reviews/new?employeeId=${encodeURIComponent(
                        employeeIdFilter,
                      )}`
                    : "/performance/reviews/new"
                }
                className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-indigo-700"
              >
                + Add first review
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
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
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredReviews.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3 text-sm">
                      {r.employee ? (
                        <Link
                          href={`/people/${r.employee.id}`}
                          className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                        >
                          {getEmployeeName(r.employee)}
                        </Link>
                      ) : (
                        <span className="font-medium text-slate-900">
                          {getEmployeeName(r.employee)}
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
                    <td className="px-4 py-3 text-sm text-slate-800">
                      {r.period || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-800">
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
                        Open
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </AuthGate>
  );
}
