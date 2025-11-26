// src/app/performance/reviews/[id]/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import Link from "next/link";

export const dynamic = "force-dynamic";

type Review = {
  id: string;
  period?: string | null;
  rating?: string | null;
  managerSummary?: string | null;
  employeeSummary?: string | null;
  rawManagerFeedback?: string | null;
  rawSelfReview?: string | null;
  createdAt?: string;
  updatedAt?: string;
  employee?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    title?: string | null;
    department?: string | null;
    manager?: {
      id: string;
      firstName?: string | null;
      lastName?: string | null;
      email?: string | null;
      title?: string | null;
    } | null;
  } | null;
};

async function getReview(id: string): Promise<Review | null> {
  try {
    return await api.get<Review>(`/performance/reviews/${id}`);
  } catch (err) {
    console.error("Failed to load performance review", err);
    return null;
  }
}

function formatDate(value?: string) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function getEmployeeName(r: Review) {
  const e = r.employee;
  if (!e) return "Employee";
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  return name || e.email || "Employee";
}

export default async function PerformanceReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const review = await getReview(params.id);

  if (!review) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            Review not found or no longer available.
          </div>
          <div className="mt-3 text-xs">
            <Link href="/performance/reviews" className="text-indigo-600 hover:underline">
              Back to reviews
            </Link>
          </div>
        </main>
      </AuthGate>
    );
  }

  return (
    <AuthGate>
      <main className="mx-auto max-w-4xl px-6 py-8 space-y-6">
        {/* Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Link href="/performance" className="hover:text-slate-700">
            Performance
          </Link>
          <span>/</span>
          <Link href="/performance/reviews" className="hover:text-slate-700">
            Reviews
          </Link>
          <span>/</span>
          <span className="text-slate-700">
            {review.period || "Review"}
          </span>
        </div>

        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">
              {getEmployeeName(review)}
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              {review.period || "Performance review"} ·{" "}
              {formatDate(review.createdAt)}
            </p>
          </div>
          {review.rating && (
            <div className="rounded-full border border-indigo-100 bg-indigo-50 px-4 py-1 text-sm font-medium text-indigo-700">
              Rating: {review.rating}
            </div>
          )}
        </header>

        {/* Employee / Manager cards */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm md:col-span-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Employee
            </h2>
            <div className="mt-2">
              {review.employee ? (
                <>
                  <Link
                    href={`/people/${review.employee.id}`}
                    className="text-sm font-medium text-indigo-600 hover:underline"
                  >
                    {getEmployeeName(review)}
                  </Link>
                  <p className="text-xs text-slate-500">
                    {review.employee.title || "—"}
                    {review.employee.department
                      ? ` · ${review.employee.department}`
                      : ""}
                  </p>
                  {review.employee.email && (
                    <p className="mt-1 text-xs text-slate-500">
                      {review.employee.email}
                    </p>
                  )}
                </>
              ) : (
                <p className="text-sm text-slate-500">No employee details.</p>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Manager
            </h2>
            {review.employee?.manager ? (
              <>
                <p className="mt-2 text-sm text-slate-800">
                  {[
                    review.employee.manager.firstName,
                    review.employee.manager.lastName,
                  ]
                    .filter(Boolean)
                    .join(" ") || review.employee.manager.email}
                </p>
                <p className="text-xs text-slate-500">
                  {review.employee.manager.title || "—"}
                </p>
                {review.employee.manager.email && (
                  <p className="mt-1 text-xs text-slate-500">
                    {review.employee.manager.email}
                  </p>
                )}
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No manager recorded.
              </p>
            )}

            <div className="mt-4 border-t border-slate-100 pt-3 text-xs text-slate-500">
              <p>Created: {formatDate(review.createdAt) || "—"}</p>
              <p>Last updated: {formatDate(review.updatedAt) || "—"}</p>
            </div>
          </div>
        </section>

        {/* Summaries */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Manager summary
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
              {review.managerSummary || "No summary provided."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Employee summary
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
              {review.employeeSummary || "No summary provided."}
            </p>
          </div>
        </section>

        {/* Raw notes */}
        <section className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Manager notes (raw)
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
              {review.rawManagerFeedback || "No raw notes captured."}
            </p>
          </div>
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Self-review notes (raw)
            </h2>
            <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
              {review.rawSelfReview || "No raw notes captured."}
            </p>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
