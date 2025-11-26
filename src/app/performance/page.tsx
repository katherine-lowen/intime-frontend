// src/app/performance/page.tsx
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

  // Fallback for any custom strings
  return (
    <span
      className={`${base} border-slate-200 bg-slate-50 text-slate-700`}
    >
      {rating}
    </span>
  );
}

export default async function PerformanceHomePage() {
  const reviews = await getReviews();

  const total = reviews.length;
  const needsImprovement = reviews.filter(
    (r) => r.rating === "Needs improvement"
  ).length;
  const meets = reviews.filter(
    (r) => r.rating === "Meets expectations"
  ).length;
  const exceeds = reviews.filter(
    (r) => r.rating === "Exceeds expectations"
  ).length;
  const outstanding = reviews.filter(
    (r) => r.rating === "Outstanding"
  ).length;

  const recent = reviews
    .slice()
    .sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    })
    .slice(0, 5);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-8 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
              Performance
            </p>
            <h1 className="mt-1 text-3xl font-semibold text-slate-900">
              Performance overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              See how reviews are trending across the org and jump into
              individual cycles.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/performance/reviews/new"
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
            >
              New review
            </Link>
            <Link
              href="/performance/reviews"
              className="inline-flex items-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              View all reviews
            </Link>
          </div>
        </header>

        {/* SUMMARY GRID */}
        <section className="grid gap-4 md:grid-cols-4">
          <SummaryCard
            label="Total reviews"
            value={total}
            helper="All-time reviews"
          />
          <SummaryCard
            label="Outstanding"
            value={outstanding}
            helper="Top performers"
          />
          <SummaryCard
            label="Exceeds expectations"
            value={exceeds}
            helper="Above the bar"
          />
          <SummaryCard
            label="Meets / below"
            value={meets + needsImprovement}
            helper={`${meets} meets · ${needsImprovement} needs improvement`}
          />
        </section>

        {/* MAIN LAYOUT */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
          {/* Recent reviews table */}
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Recent reviews
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  The latest review cycles created in Intime.
                </p>
              </div>
              <Link
                href="/performance/reviews"
                className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
              >
                View all
              </Link>
            </div>

            {recent.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
                No performance reviews yet. Start by creating your first review
                for a team member.
              </div>
            ) : (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
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
                    {recent.map((r) => (
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
                            Open
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Side panel: review cycles + notes */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Review cycles (coming soon)
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                In the next iteration, you&apos;ll be able to design recurring
                waves (mid-year, annual) and track completion by manager and
                org.
              </p>
              <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                <li>• Configure cycles by department and level</li>
                <li>• Track who&apos;s submitted vs. pending</li>
                <li>• Calibrate ratings across teams</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-xs text-slate-600">
              Use this page as the home for how performance is actually tracked
              in the org — your &quot;source of truth&quot; for reviews and,
              later, calibration and comp.
            </div>
          </div>
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
