import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

// ---- Types ----

type ReviewRating =
  | "Needs improvement"
  | "Meets expectations"
  | "Exceeds expectations"
  | "Outstanding"
  | string
  | null
  | undefined;

type ReviewDetail = {
  id: string;
  period?: string | null;
  rating?: ReviewRating;
  createdAt?: string | null;
  managerSummary?: string | null;
  employeeSummary?: string | null;
  rawManagerFeedback?: string | null;
  rawSelfReview?: string | null;
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

// ---- Helpers ----

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

function getEmployeeName(r: ReviewDetail) {
  const e = r.employee;
  if (!e) return "Employee";
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  return name || e.email || "Employee";
}

async function getReview(id: string): Promise<ReviewDetail | null> {
  try {
    return await api.get<ReviewDetail>(`/performance-reviews/${id}`);
  } catch (err) {
    console.error("Failed to load performance review:", err);
    return null;
  }
}

// ---- Page ----

export default async function PerformanceReviewDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const review = await getReview(params.id);
  if (!review) notFound();

  const employeeName = getEmployeeName(review);

  return (
    <AuthGate>
      <main className="mx-auto max-w-4xl px-6 py-8">
        {/* HEADER */}
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">Performance / Review</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {employeeName}
            </h1>
            <p className="text-sm text-slate-600 flex items-center gap-2">
              {review.period || "Review"} · {ratingBadge(review.rating)}
              <span className="ml-2 text-xs text-slate-400">
                Created {formatDate(review.createdAt)}
              </span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {review.employee && (
              <Link
                href={`/people/${review.employee.id}`}
                className="text-xs text-slate-500 hover:text-slate-700"
              >
                ← Back to person
              </Link>
            )}
            <Link
              href="/performance/reviews"
              className="text-xs text-slate-500 hover:text-slate-700"
            >
              All reviews
            </Link>
          </div>
        </header>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
            {/* Manager summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Manager summary
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                High-level summary of performance, strengths, and focus areas.
              </p>
              <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
                {review.managerSummary || (
                  <span className="text-slate-400">No summary recorded.</span>
                )}
              </div>
            </div>

            {/* Employee self-review */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Employee self-review
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Notes or excerpts from the employee&apos;s self-review.
              </p>
              <div className="mt-3 whitespace-pre-wrap text-sm text-slate-800">
                {review.employeeSummary || (
                  <span className="text-slate-400">
                    No self-review summary recorded.
                  </span>
                )}
              </div>
            </div>

            {/* Raw manager feedback */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Raw manager feedback
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Full, unedited feedback text.
              </p>
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-800 whitespace-pre-wrap">
                {review.rawManagerFeedback?.trim() ? (
                  review.rawManagerFeedback.trim()
                ) : (
                  <span className="text-slate-400">
                    No raw manager feedback recorded.
                  </span>
                )}
              </div>
            </div>

            {/* Raw self-review */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-900">
                Raw self-review text
              </h3>
              <p className="mt-1 text-xs text-slate-500">
                Original text submitted by the employee.
              </p>
              <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-800 whitespace-pre-wrap">
                {review.rawSelfReview?.trim() ? (
                  review.rawSelfReview.trim()
                ) : (
                  <span className="text-slate-400">
                    No raw self-review text recorded.
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT SIDEBAR */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm text-sm text-slate-800">
              <h3 className="text-sm font-semibold text-slate-900">
                Review details
              </h3>

              <dl className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Employee</dt>
                  <dd className="text-right">
                    {review.employee ? (
                      <Link
                        href={`/people/${review.employee.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {employeeName}
                      </Link>
                    ) : (
                      employeeName
                    )}
                  </dd>
                </div>

                {review.employee?.title && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Title</dt>
                    <dd className="text-right text-slate-800">
                      {review.employee.title}
                    </dd>
                  </div>
                )}

                {review.employee?.department && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="text-right text-slate-800">
                      {review.employee.department}
                    </dd>
                  </div>
                )}

                {review.employee?.manager && (
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Manager</dt>
                    <dd className="text-right text-slate-800">
                      {[
                        review.employee.manager.firstName,
                        review.employee.manager.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || review.employee.manager.email}
                    </dd>
                  </div>
                )}

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Period</dt>
                  <dd className="text-right text-slate-800">
                    {review.period || "—"}
                  </dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Rating</dt>
                  <dd>{ratingBadge(review.rating)}</dd>
                </div>

                <div className="flex justify-between gap-4">
                  <dt className="text-slate-500">Created</dt>
                  <dd className="text-right text-slate-800">
                    {formatDate(review.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
