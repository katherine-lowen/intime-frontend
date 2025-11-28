// src/app/performance/reviews/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type SearchParams = Record<string, string | string[] | undefined>;

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

type PerformanceReview = {
  id: string;
  orgId: string;
  employeeId: string;
  period?: string | null;
  rating?: string | null;
  managerSummary?: string | null;
  employeeSummary?: string | null;
  createdAt: string;
  employee: EmployeeLite;
};

function first(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

async function getReviews(employeeId?: string): Promise<PerformanceReview[]> {
  let url = "/performance-reviews";
  if (employeeId) {
    const params = new URLSearchParams();
    params.set("employeeId", employeeId);
    url = `/performance-reviews?${params.toString()}`;
  }
  return api.get<PerformanceReview[]>(url);
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function withinLastDays(dateStr: string, days: number) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days);
  return d >= cutoff && d <= now;
}

function thisQuarter(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return false;
  const now = new Date();
  const q = Math.floor(now.getMonth() / 3);
  const qStart = new Date(now.getFullYear(), q * 3, 1);
  const qEnd = new Date(now.getFullYear(), q * 3 + 3, 0, 23, 59, 59, 999);
  return d >= qStart && d <= qEnd;
}

export default async function PerformanceReviewsPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const employeeId = first(sp, "employeeId");

  let reviews: PerformanceReview[] = [];
  try {
    reviews = await getReviews(employeeId);
  } catch (e) {
    console.error("Failed to load performance reviews", e);
  }

  const total = reviews.length;
  const last30 = reviews.filter((r) => withinLastDays(r.createdAt, 30)).length;

  const employeesThisQuarter = new Set(
    reviews
      .filter((r) => thisQuarter(r.createdAt))
      .map((r) => r.employeeId)
  ).size;

  const isFilteredToEmployee = !!employeeId;

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Performance reviews
            </h1>
            <p className="text-sm text-slate-600">
              Central view of reviews across your org, by cycle, rating, and
              employee.
            </p>
            {isFilteredToEmployee && (
              <p className="mt-1 text-xs text-indigo-700">
                Showing reviews for a specific employee (from their profile).
              </p>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href={
                employeeId
                  ? `/performance/reviews/new?employeeId=${employeeId}`
                  : "/performance/reviews/new"
              }
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              ➕ New performance review
            </Link>
          </div>
        </header>

        {/* FILTER STRIP WHEN COMING FROM PROFILE */}
        {isFilteredToEmployee && (
          <section className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
            Filtered by employeeId:{" "}
            <span className="font-mono text-slate-800">{employeeId}</span>
            <span className="mx-1 text-slate-400">·</span>
            <Link
              href="/performance/reviews"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Clear filter
            </Link>
          </section>
        )}

        {/* SUMMARY STRIP */}
        <section className="grid gap-4 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total reviews</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {total}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {isFilteredToEmployee
                ? "Reviews for this employee."
                : "All-time performance reviews logged in Intime."}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Last 30 days</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {last30}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Reviews completed in the last month.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">
              Employees reviewed this quarter
            </div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {employeesThisQuarter}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Unique employees with at least one review in the current quarter.
            </p>
          </div>
        </section>

        {/* TABLE */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">
              Recent reviews
            </h2>
            <span className="text-[11px] text-slate-500">
              {total} total review{total === 1 ? "" : "s"}
            </span>
          </div>

          {reviews.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No performance reviews logged yet. Start by{" "}
              <Link
                href={
                  employeeId
                    ? `/performance/reviews/new?employeeId=${employeeId}`
                    : "/performance/reviews/new"
                }
                className="font-medium text-indigo-600 hover:underline"
              >
                creating a review
              </Link>{" "}
              {isFilteredToEmployee
                ? "for this employee."
                : "for one of your employees."}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Employee</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Period</th>
                    <th className="px-4 py-2 text-left">Rating</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-left">Manager summary</th>
                  </tr>
                </thead>
                <tbody>
                  {reviews
                    .slice()
                    .sort(
                      (a, b) =>
                        new Date(b.createdAt).getTime() -
                        new Date(a.createdAt).getTime()
                    )
                    .map((r) => {
                      const employee = r.employee;
                      const name = `${employee.firstName} ${employee.lastName}`;
                      const subtitleParts: string[] = [];
                      if (employee.title) subtitleParts.push(employee.title);
                      if (employee.department)
                        subtitleParts.push(employee.department);
                      const subtitle = subtitleParts.join(" • ");
                      const summary =
                        r.managerSummary ||
                        r.employeeSummary ||
                        "No summary captured.";

                      return (
                        <tr
                          key={r.id}
                          className="border-b last:border-b-0 hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-2 align-top">
                            <div className="font-medium text-slate-900">
                              {name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {subtitle || "Team member"}
                            </div>
                          </td>
                          <td className="px-4 py-2 align-top text-xs text-slate-600">
                            {employee.title ?? "—"}
                          </td>
                          <td className="px-4 py-2 align-top text-xs text-slate-600">
                            {r.period ?? "—"}
                          </td>
                          <td className="px-4 py-2 align-top text-xs text-slate-700">
                            {r.rating ?? "—"}
                          </td>
                          <td className="px-4 py-2 align-top text-xs text-slate-600">
                            {formatDate(r.createdAt)}
                          </td>
                          <td className="px-4 py-2 align-top text-xs text-slate-600">
                            <p className="line-clamp-3 max-w-xs">
                              {summary}
                            </p>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
