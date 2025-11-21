// src/components/performance-panel.tsx

import QuickPerformanceReview from "@/components/quick-performance-review";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
};

export type EmployeeEvent = {
  id: string;
  type: string;
  summary?: string | null;
  startsAt?: string | null;
  createdAt?: string | null;
  rating?: number | null; // optional numeric score
};

function parseEventDate(ev: EmployeeEvent): Date | null {
  const raw = ev.startsAt || ev.createdAt;
  if (!raw) return null;
  const d = new Date(raw);
  if (isNaN(d.getTime())) return null;
  return d;
}

function formatDate(d: Date | null): string {
  if (!d) return "—";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export default function PerformancePanel({
  employee,
  events,
}: {
  employee: Employee;
  events: EmployeeEvent[];
}) {
  const performanceEvents = (events ?? []).filter((ev) =>
    ["PERFORMANCE_REVIEW", "GOAL_REVIEW", "PIP", "PROMOTION"].includes(
      ev.type.toUpperCase()
    )
  );

  const sorted = [...performanceEvents].sort((a, b) => {
    const da = parseEventDate(a)?.getTime() ?? 0;
    const db = parseEventDate(b)?.getTime() ?? 0;
    return da - db;
  });

  const lastReview = sorted[sorted.length - 1] ?? null;
  const lastReviewDate = lastReview ? parseEventDate(lastReview) : null;

  let avgRating: number | null = null;
  let trendLabel: string | null = null;
  let trendDelta: number | null = null;

  const rated = sorted.filter(
    (ev) => typeof ev.rating === "number" && ev.rating !== null
  );

  if (rated.length > 0) {
    const sum = rated.reduce((acc, ev) => acc + (ev.rating ?? 0), 0);
    avgRating = sum / rated.length;

    if (rated.length >= 2) {
      const last = rated[rated.length - 1].rating ?? 0;
      const prev = rated[rated.length - 2].rating ?? 0;
      trendDelta = last - prev;
      if (trendDelta > 0.05) trendLabel = "Improving";
      else if (trendDelta < -0.05) trendLabel = "Declining";
      else trendLabel = "Stable";
    }
  }

  let nextReviewDate: Date | null = null;
  if (lastReviewDate) {
    nextReviewDate = new Date(lastReviewDate);
    nextReviewDate.setMonth(nextReviewDate.getMonth() + 6);
  }

  const hasData = performanceEvents.length > 0;

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold tracking-tight">
            Performance &amp; Reviews
          </h2>
          <p className="text-xs text-slate-500">
            Time-aware view of {employee.firstName}&apos;s performance history.
          </p>
        </div>
        {hasData && (
          <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-slate-600">
            Time-aware
          </span>
        )}
      </header>

      {!hasData && (
        <>
          <p className="text-xs text-slate-500">
            No performance reviews recorded yet. Once you log reviews, goals, or
            promotions for this person, we&apos;ll surface time-aware insights
            here for calibration and comp decisions.
          </p>
          <div className="pt-2 border-t border-slate-100">
            <QuickPerformanceReview employeeId={employee.id} />
          </div>
        </>
      )}

      {hasData && (
        <div className="space-y-4">
          {/* High-level metrics */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="text-[10px] font-medium uppercase text-slate-500">
                Last review
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(lastReviewDate)}
              </div>
              {lastReview?.summary && (
                <p className="mt-1 line-clamp-2 text-[11px] text-slate-600">
                  {lastReview.summary}
                </p>
              )}
            </div>

            <div className="rounded-lg border border-slate-100 bg-slate-50/80 p-3">
              <div className="text-[10px] font-medium uppercase text-slate-500">
                Next review (projected)
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {formatDate(nextReviewDate)}
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Based on a 6-month cadence. Adjust later if your policy differs.
              </p>
            </div>
          </div>

          {/* Rating + trend */}
          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-medium uppercase text-slate-500">
                Avg. rating over time
              </div>
              <div className="mt-1 text-sm font-semibold text-slate-900">
                {avgRating !== null ? avgRating.toFixed(1) : "N/A"}
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Based on {rated.length} scored review
                {rated.length === 1 ? "" : "s"} (if provided).
              </p>
            </div>

            <div className="rounded-lg border border-slate-100 bg-white p-3">
              <div className="text-[10px] font-medium uppercase text-slate-500">
                Trend
              </div>
              <div className="mt-1 flex items-baseline gap-1 text-sm font-semibold text-slate-900">
                {trendLabel ?? "Not enough data"}
                {trendDelta !== null && (
                  <span className="text-[11px] font-normal text-slate-500">
                    ({trendDelta > 0 ? "+" : ""}
                    {trendDelta.toFixed(2)} vs. last review)
                  </span>
                )}
              </div>
              <p className="mt-1 text-[11px] text-slate-600">
                Use this to calibrate promotions, comp, and performance plans
                over time – not just one review.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="space-y-2">
            <div className="text-[10px] font-medium uppercase text-slate-500">
              Timeline
            </div>
            <ol className="space-y-1.5">
              {sorted
                .slice()
                .reverse()
                .map((ev) => {
                  const d = parseEventDate(ev);
                  return (
                    <li
                      key={ev.id}
                      className="flex items-start justify-between gap-3 rounded-md bg-slate-50 px-2.5 py-1.5"
                    >
                      <div className="flex-1">
                        <div className="text-[11px] font-medium text-slate-800">
                          {ev.type.replace(/_/g, " ")}
                        </div>
                        {ev.summary && (
                          <p className="mt-0.5 line-clamp-2 text-[11px] text-slate-600">
                            {ev.summary}
                          </p>
                        )}
                      </div>
                      <div className="whitespace-nowrap text-[10px] text-slate-500">
                        {formatDate(d)}
                      </div>
                    </li>
                  );
                })}
            </ol>
          </div>

          {/* Quick add form */}
          <div className="pt-2 border-t border-slate-100">
            <QuickPerformanceReview employeeId={employee.id} />
          </div>
        </div>
      )}
    </section>
  );
}
