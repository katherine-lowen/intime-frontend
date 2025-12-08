"use client";

import { useEffect, useMemo, useState } from "react";
import { addMonths, endOfMonth, format, startOfMonth } from "date-fns";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type TimeOffCalendarEvent = {
  id: string;
  employeeId: string;
  employeeName: string;
  policyName?: string;
  startDate: string;
  endDate: string;
  status: "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";
};

type StatusFilter = "ALL" | TimeOffCalendarEvent["status"];

function enumerateDays(from: Date, to: Date) {
  const dates: string[] = [];
  const curr = new Date(from);
  while (curr <= to) {
    dates.push(format(curr, "yyyy-MM-dd"));
    curr.setDate(curr.getDate() + 1);
  }
  return dates;
}

export default function TimeoffCalendarPage() {
  const router = useRouter();
  const [role, setRole] = useState<OrgRole | null>(null);
  const [rangeStart, setRangeStart] = useState<Date>(startOfMonth(new Date()));
  const [rangeEnd, setRangeEnd] = useState<Date>(endOfMonth(new Date()));
  const [events, setEvents] = useState<TimeOffCalendarEvent[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const isManager = useMemo(
    () => role === "OWNER" || role === "ADMIN" || role === "MANAGER",
    [role]
  );
  const isEmployee = role === "EMPLOYEE";

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const params = new URLSearchParams();
      params.set("from", format(rangeStart, "yyyy-MM-dd"));
      params.set("to", format(rangeEnd, "yyyy-MM-dd"));
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      const data = await api.get<TimeOffCalendarEvent[]>(
        `/timeoff/calendar?${params.toString()}`
      );
      setEvents(data ?? []);
    } catch (err: any) {
      console.error("[timeoff/calendar] fetch failed", err);
      setError(err?.message || "Failed to load calendar.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const me = await getCurrentUser();
      const normalizedRole = (me?.role || "").toUpperCase() as OrgRole;
      if (!cancelled) setRole(normalizedRole);
      if (normalizedRole === "EMPLOYEE") {
        router.replace("/employee/timeoff");
        return;
      }
      await load();
    }
    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isEmployee) void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rangeStart, rangeEnd, statusFilter]);

  const grouped = useMemo(() => {
    const byDay: Record<string, TimeOffCalendarEvent[]> = {};
    events.forEach((event) => {
      const days = enumerateDays(new Date(event.startDate), new Date(event.endDate));
      days.forEach((day) => {
        byDay[day] = byDay[day] || [];
        byDay[day].push(event);
      });
    });
    return byDay;
  }, [events]);

  const goMonth = (delta: number) => {
    const nextStart = startOfMonth(addMonths(rangeStart, delta));
    const nextEnd = endOfMonth(nextStart);
    setRangeStart(nextStart);
    setRangeEnd(nextEnd);
  };

  const renderSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 w-48 rounded bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Time off · Calendar
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Team time off calendar
              </h1>
              <p className="text-sm text-slate-600">
                View approved and pending time off across the org.
              </p>
            </div>
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {!isManager && !loading ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have permission to view the calendar.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => goMonth(-1)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    ← Prev
                  </button>
                  <div className="text-sm font-medium text-slate-800">
                    {format(rangeStart, "LLLL yyyy")}
                  </div>
                  <button
                    type="button"
                    onClick={() => goMonth(1)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-1 text-sm text-slate-800 hover:bg-slate-50"
                  >
                    Next →
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={statusFilter}
                    onChange={(e) =>
                      setStatusFilter(e.target.value as StatusFilter)
                    }
                    className="rounded-md border border-slate-200 bg-white px-2 py-1 text-sm text-slate-800"
                  >
                    <option value="ALL">All</option>
                    <option value="APPROVED">Approved</option>
                    <option value="REQUESTED">Requested</option>
                    <option value="DENIED">Denied</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>

              {loading ? (
                renderSkeleton()
              ) : Object.keys(grouped).length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
                  No events in this range.
                </div>
              ) : (
                <div className="space-y-4">
                  {Object.keys(grouped)
                    .sort()
                    .map((day) => (
                      <div
                        key={day}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="mb-2 text-sm font-semibold text-slate-800">
                          {day}
                        </div>
                        <div className="space-y-2">
                          {grouped[day].map((evt) => (
                            <div
                              key={`${day}-${evt.id}`}
                              className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3 py-2"
                            >
                              <div>
                                <div className="text-sm font-medium text-slate-900">
                                  {evt.employeeName}
                                </div>
                                <div className="text-xs text-slate-600">
                                  {evt.policyName ?? "Time off"} · {evt.startDate} →{" "}
                                  {evt.endDate}
                                </div>
                              </div>
                              <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-700">
                                {evt.status}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
