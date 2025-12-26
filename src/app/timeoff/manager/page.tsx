"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { orgHref } from "@/lib/org-base";


type TimeOffRequest = {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    department?: string | null;
    title?: string | null;
  } | null;
  type: string;
  status: string;
  startDate: string;
  endDate: string;
};

type TeamMember = {
  id: string;
  firstName: string;
  lastName: string;
  department?: string | null;
  title?: string | null;
};

function formatRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  const startStr = Number.isNaN(s.getTime()) ? start : s.toLocaleDateString(undefined, opts);
  const endStr = Number.isNaN(e.getTime()) ? end : e.toLocaleDateString(undefined, opts);
  return `${startStr} – ${endStr}`;
}

function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) {
  return aStart <= bEnd && bStart <= aEnd;
}

export default function ManagerTimeOffPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        // Assume backend scopes to manager's reports; adjust endpoint if a dedicated one exists.
        const data = await api.get<TimeOffRequest[]>("/timeoff/requests");
        if (!cancelled) setRequests(data ?? []);
      } catch (err: any) {
        console.error("[manager time off] load failed", err);
        if (!cancelled) setError(err?.message || "Failed to load team PTO.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const now = new Date();
  const oneWeek = 7 * 24 * 60 * 60 * 1000;
  const nextWeek = new Date(now.getTime() + oneWeek);
  const upcoming = useMemo(
    () =>
      requests.filter((r) => {
        const start = new Date(r.startDate).getTime();
        return !Number.isNaN(start) && start >= now.getTime();
      }),
    [requests, now]
  );

  const thisWeekCount = useMemo(
    () =>
      requests.filter((r) => {
        const s = new Date(r.startDate).getTime();
        const e = new Date(r.endDate).getTime();
        return !Number.isNaN(s) && !Number.isNaN(e) && overlaps(new Date(), nextWeek, new Date(s), new Date(e));
      }).length,
    [requests, nextWeek]
  );

  const conflicts = useMemo(() => {
    const conflictsList: { a: TimeOffRequest; b: TimeOffRequest }[] = [];
    const sorted = [...requests].sort(
      (a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
    );
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        if (!a.employee || !b.employee) continue;
        if (a.employee.id === b.employee.id) continue;
        const aStart = new Date(a.startDate);
        const aEnd = new Date(a.endDate);
        const bStart = new Date(b.startDate);
        const bEnd = new Date(b.endDate);
        if (overlaps(aStart, aEnd, bStart, bEnd)) {
          conflictsList.push({ a, b });
        }
      }
    }
    return conflictsList;
  }, [requests]);

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Time off · Manager
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Team time off overview
            </h1>
            <p className="text-sm text-slate-600">
              See upcoming PTO for your team and spot conflicts early.
            </p>
          </div>
          <Link
            href={orgHref("/timeoff")}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Manage requests
          </Link>
        </header>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <section className="grid gap-4 sm:grid-cols-3">
          <StatCard label="Total team requests" value={requests.length} />
          <StatCard label="Off this week/next" value={thisWeekCount} />
          <StatCard label="Upcoming requests" value={upcoming.length} />
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Upcoming PTO
            </h2>
            <span className="text-[11px] text-slate-500">
              Sorted by start date
            </span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-slate-600">
              No upcoming PTO for your team.
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {upcoming
                .sort(
                  (a, b) =>
                    new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
                )
                .map((req) => (
                  <div
                    key={req.id}
                    className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm text-slate-800"
                  >
                    <div className="min-w-[200px]">
                      <div className="font-semibold">
                        {req.employee
                          ? `${req.employee.firstName} ${req.employee.lastName}`
                          : "Employee"}
                      </div>
                      <div className="text-xs text-slate-500">
                        {req.employee?.title || "—"}{" "}
                        {req.employee?.department
                          ? `· ${req.employee.department}`
                          : ""}
                      </div>
                    </div>
                    <div className="text-xs text-slate-600">
                      {req.type} · {formatRange(req.startDate, req.endDate)}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                      {req.status}
                    </span>
                  </div>
                ))}
            </div>
          )}
        </section>

        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Potential conflicts
            </h2>
            <span className="text-[11px] text-slate-500">
              Overlapping PTO among teammates
            </span>
          </div>
          {loading ? (
            <div className="space-y-2">
              {[0, 1].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : conflicts.length === 0 ? (
            <p className="text-sm text-slate-600">
              No overlapping PTO detected.
            </p>
          ) : (
            <div className="space-y-3">
              {conflicts.map(({ a, b }, idx) => (
                <div
                  key={`${a.id}-${b.id}-${idx}`}
                  className="rounded-xl border border-amber-100 bg-amber-50 px-3 py-2 text-xs text-amber-800"
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-amber-900">
                      {a.employee
                        ? `${a.employee.firstName} ${a.employee.lastName}`
                        : "Employee A"}
                    </span>
                    <span className="text-amber-700">overlaps with</span>
                    <span className="font-semibold text-amber-900">
                      {b.employee
                        ? `${b.employee.firstName} ${b.employee.lastName}`
                        : "Employee B"}
                    </span>
                  </div>
                  <div className="mt-1 text-amber-700">
                    {formatRange(a.startDate, a.endDate)} · {formatRange(b.startDate, b.endDate)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm backdrop-blur">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="text-2xl font-semibold text-slate-900">{value}</p>
    </div>
  );
}
