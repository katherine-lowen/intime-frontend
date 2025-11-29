// src/app/timeoff/calendar/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";

type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type EmployeeSummary = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string | null;
};

type PolicySummary = {
  id: string;
  name: string;
};

type TimeOffRequest = {
  id: string;
  employeeId: string;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  employee: EmployeeSummary | null;
  policy: PolicySummary | null;
};

type CalendarDay = {
  date: Date;
  label: string;
  key: string; // yyyy-mm-dd
  inCurrentMonth: boolean;
};

// ---------- date helpers ----------

// format local date into yyyy-mm-dd for stable keys
function toLocalKey(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function buildMonthGrid(year: number, monthIndex: number): CalendarDay[] {
  // monthIndex is 0-based
  const firstOfMonth = new Date(year, monthIndex, 1);
  const startWeekday = firstOfMonth.getDay(); // 0 = Sun
  const startDate = new Date(year, monthIndex, 1 - startWeekday);

  const days: CalendarDay[] = [];
  for (let i = 0; i < 42; i++) {
    const d = new Date(startDate);
    d.setDate(startDate.getDate() + i);
    const inCurrentMonth = d.getMonth() === monthIndex;
    days.push({
      date: d,
      label: String(d.getDate()),
      key: toLocalKey(d),
      inCurrentMonth,
    });
  }
  return days;
}

// expand each PTO request into per-day buckets
function bucketRequestsByDay(requests: TimeOffRequest[]) {
  const map: Record<string, TimeOffRequest[]> = {};

  for (const r of requests) {
    const start = new Date(r.startDate);
    const end = new Date(r.endDate);
    if (
      Number.isNaN(start.getTime()) ||
      Number.isNaN(end.getTime()) ||
      end < start
    ) {
      continue;
    }

    const current = new Date(start);
    while (current <= end) {
      const key = toLocalKey(current);
      if (!map[key]) map[key] = [];
      map[key].push(r);
      current.setDate(current.getDate() + 1);
    }
  }

  return map;
}

// ---------- main page ----------

export default function TimeOffCalendarPage() {
  const today = new Date();
  const [visibleYear, setVisibleYear] = useState(today.getFullYear());
  const [visibleMonth, setVisibleMonth] = useState(today.getMonth()); // 0 = Jan
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // simple filter: show all vs approved-only
  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED_ONLY">(
    "ALL"
  );

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<TimeOffRequest[]>("/timeoff/requests");
        if (!cancelled) {
          setRequests(data);
        }
      } catch (e: any) {
        console.error("[TimeOffCalendarPage] failed to load requests", e);
        if (!cancelled) {
          setError("Failed to load time off requests.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredRequests = useMemo(() => {
    if (statusFilter === "APPROVED_ONLY") {
      return requests.filter((r) => r.status === "APPROVED");
    }
    return requests;
  }, [requests, statusFilter]);

  const dayBuckets = useMemo(
    () => bucketRequestsByDay(filteredRequests),
    [filteredRequests]
  );

  const days = useMemo(
    () => buildMonthGrid(visibleYear, visibleMonth),
    [visibleYear, visibleMonth]
  );

  const monthLabel = useMemo(() => {
    return new Date(visibleYear, visibleMonth, 1).toLocaleString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [visibleYear, visibleMonth]);

  function goPrevMonth() {
    setVisibleMonth((prev) => {
      if (prev === 0) {
        setVisibleYear((y) => y - 1);
        return 11;
      }
      return prev - 1;
    });
  }

  function goNextMonth() {
    setVisibleMonth((prev) => {
      if (prev === 11) {
        setVisibleYear((y) => y + 1);
        return 0;
      }
      return prev + 1;
    });
  }

  const totalVisibleDaysWithPto = days.filter(
    (d) => dayBuckets[d.key]?.length
  ).length;

  return (
    <main className="p-6 space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Time off calendar
          </h1>
          <p className="text-sm text-slate-500">
            See who&apos;s out and when, across your organization.
          </p>
        </div>

        <div className="flex flex-col items-start gap-2 text-xs md:flex-row md:items-center md:gap-3">
          <div className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-slate-50">
            <span className="mr-2 inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            {totalVisibleDaysWithPto} days with time off this month
          </div>

          <div className="flex items-center gap-2">
            <label className="text-[11px] font-medium text-slate-600">
              Filter
            </label>
            <select
              className="rounded-full border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              value={statusFilter}
              onChange={(e) =>
                setStatusFilter(e.target.value as "ALL" | "APPROVED_ONLY")
              }
            >
              <option value="ALL">All requests</option>
              <option value="APPROVED_ONLY">Approved only</option>
            </select>
          </div>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Month nav + legend */}
      <section className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-100 pb-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={goPrevMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              ‹
            </button>
            <div>
              <div className="text-sm font-semibold text-slate-900">
                {monthLabel}
              </div>
              <div className="text-[11px] text-slate-500">
                Sunday–Saturday view · click a day to see details
              </div>
            </div>
            <button
              type="button"
              onClick={goNextMonth}
              className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-600 hover:bg-slate-50"
            >
              ›
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-emerald-700">
              <span className="h-2 w-2 rounded-full bg-emerald-500" />
              Approved
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-amber-700">
              <span className="h-2 w-2 rounded-full bg-amber-500" />
              Requested
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-slate-50 px-2 py-0.5 text-slate-600">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              Other statuses
            </span>
          </div>
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 gap-1 text-xs">
          {/* weekday header */}
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
            <div
              key={w}
              className="px-2 py-1 text-center text-[11px] font-medium uppercase tracking-wide text-slate-400"
            >
              {w}
            </div>
          ))}

          {days.map((day) => {
            const dayRequests = dayBuckets[day.key] || [];

            const hasApproved = dayRequests.some(
              (r) => r.status === "APPROVED"
            );
            const hasRequested = dayRequests.some(
              (r) => r.status === "REQUESTED"
            );

            const borderClass = day.inCurrentMonth
              ? "border-slate-200"
              : "border-slate-100";
            const bgClass = day.inCurrentMonth
              ? "bg-white"
              : "bg-slate-50";

            return (
              <DayCell
                key={day.key}
                day={day}
                requests={dayRequests}
                borderClass={borderClass}
                bgClass={bgClass}
                hasApproved={hasApproved}
                hasRequested={hasRequested}
              />
            );
          })}
        </div>
      </section>
    </main>
  );
}

type DayCellProps = {
  day: CalendarDay;
  requests: TimeOffRequest[];
  borderClass: string;
  bgClass: string;
  hasApproved: boolean;
  hasRequested: boolean;
};

function DayCell({
  day,
  requests,
  borderClass,
  bgClass,
  hasApproved,
  hasRequested,
}: DayCellProps) {
  const total = requests.length;

  // up to 2 people names as chips
  const topPeople = requests.slice(0, 2);
  const extraCount =
    total > 2 ? total - 2 : 0;

  // badge color priority
  let badgeClass =
    "bg-slate-100 text-slate-700 border-slate-200";
  if (hasApproved) {
    badgeClass = "bg-emerald-50 text-emerald-700 border-emerald-200";
  } else if (hasRequested) {
    badgeClass = "bg-amber-50 text-amber-700 border-amber-200";
  }

  return (
    <div
      className={`group flex min-h-[88px] flex-col rounded-xl border ${borderClass} ${bgClass} p-1.5 text-[11px]`}
    >
      <div className="flex items-center justify-between">
        <span
          className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[11px] font-medium ${
            day.inCurrentMonth
              ? "text-slate-900"
              : "text-slate-400"
          }`}
        >
          {day.label}
        </span>

        {total > 0 && (
          <span
            className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-medium ${badgeClass}`}
          >
            {total} out
          </span>
        )}
      </div>

      {total === 0 ? (
        <div className="mt-2 flex-1 text-[10px] text-slate-300">
          —
        </div>
      ) : (
        <div className="mt-1 flex-1 space-y-0.5">
          {topPeople.map((r) => {
            const name = r.employee
              ? `${r.employee.firstName} ${r.employee.lastName}`
              : `#${r.employeeId.slice(0, 6)}`;
            return (
              <div
                key={r.id}
                className="truncate rounded-md bg-slate-900/5 px-1.5 py-0.5 text-[10px] text-slate-700"
              >
                {name}
                <span className="ml-1 text-[9px] uppercase tracking-wide text-slate-400">
                  · {r.type.toLowerCase()}
                </span>
              </div>
            );
          })}
          {extraCount > 0 && (
            <div className="text-[10px] text-slate-500">
              +{extraCount} more
            </div>
          )}
        </div>
      )}
    </div>
  );
}
