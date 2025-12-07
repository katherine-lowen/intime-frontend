// src/app/timeoff/calendar/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import api from "@/lib/api";
import CalendarMonth, {
  type CalendarEvent,
} from "@/components/calendar-month";

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
  startDate: string; // ISO date
  endDate: string; // ISO date
  employee: EmployeeSummary | null;
  policy: PolicySummary | null;
};

export default function TimeOffCalendarPage() {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [statusFilter, setStatusFilter] = useState<"ALL" | "APPROVED_ONLY">(
    "ALL",
  );

  // day drawer state
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedRequests, setSelectedRequests] = useState<TimeOffRequest[]>([]);
  const [mutatingId, setMutatingId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await api.get<TimeOffRequest[]>("/timeoff/requests");
        if (!cancelled) {
          // normalize in case API returns undefined / 204
          setRequests(data ?? []);
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

  // Map backend requests → calendar events (with meta = full request)
  const events: CalendarEvent[] = useMemo(
    () =>
      filteredRequests.map((r) => {
        const name = r.employee
          ? `${r.employee.firstName} ${r.employee.lastName}`
          : `Employee ${r.employeeId.slice(0, 6)}`;

        return {
          id: r.id,
          title: `${name} · ${r.type.toLowerCase()}`,
          start: r.startDate,
          end: r.endDate,
          status: r.status,
          kind: r.type,
          meta: r,
        };
      }),
    [filteredRequests],
  );

  function handleDayClick(date: Date, eventsForDay: CalendarEvent[]) {
    const reqs: TimeOffRequest[] = [];

    for (const e of eventsForDay) {
      if (e.meta) {
        reqs.push(e.meta as TimeOffRequest);
      } else {
        const fallback = filteredRequests.find((r) => r.id === e.id);
        if (fallback) reqs.push(fallback);
      }
    }

    setSelectedDay(date);
    setSelectedRequests(reqs);
    setActionError(null);
  }

  function closeDrawer() {
    setSelectedDay(null);
    setSelectedRequests([]);
    setActionError(null);
  }

  async function updateStatus(
    req: TimeOffRequest,
    newStatus: TimeOffStatus,
  ): Promise<void> {
    if (req.status === newStatus) return;

    setMutatingId(req.id);
    setActionError(null);

    try {
      const updated = await api.patch<TimeOffRequest>(
        `/timeoff/requests/${req.id}/status`,
        { status: newStatus },
      );

      // If backend ever returns 204/no body, bail out defensively
      if (!updated) {
        console.warn(
          "[TimeOffCalendarPage] updateStatus returned no body; skipping state update",
        );
        return;
      }

      // Update global list
      setRequests((prev) =>
        prev.map((r) => (r.id === req.id ? updated : r)),
      );

      // Update currently selected day view
      setSelectedRequests((prev) =>
        prev.map((r) => (r.id === req.id ? updated : r)),
      );
    } catch (e: any) {
      console.error("[TimeOffCalendarPage] failed to update status", e);
      setActionError("Failed to update request status. Please try again.");
    } finally {
      setMutatingId(null);
    }
  }

  return (
    <main className="space-y-6 p-6">
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
            {filteredRequests.length} time off requests shown
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

      {loading ? (
        <div className="rounded-xl border border-slate-200 bg-white px-4 py-6 text-sm text-slate-500 shadow-sm">
          Loading time off calendar…
        </div>
      ) : (
        <CalendarMonth
          initialMonth={new Date()}
          events={events}
          onDayClick={handleDayClick}
        />
      )}

      {/* Side drawer for selected day */}
      {selectedDay && (
        <div className="fixed inset-0 z-40 flex items-start justify-end bg-black/20">
          <div className="h-full w-full max-w-md border-l border-slate-200 bg-white shadow-xl">
            <div className="flex items-start justify-between border-b border-slate-100 px-4 py-3">
              <div>
                <div className="text-xs font-medium uppercase tracking-wide text-slate-400">
                  Day details
                </div>
                <div className="text-sm font-semibold text-slate-900">
                  {selectedDay.toLocaleDateString(undefined, {
                    weekday: "long",
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              </div>
              <button
                type="button"
                onClick={closeDrawer}
                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-slate-200 text-slate-500 hover:bg-slate-50"
              >
                ✕
              </button>
            </div>

            <div className="flex flex-1 flex-col gap-3 overflow-y-auto px-4 py-3 text-sm">
              {actionError && (
                <div className="rounded-lg border border-red-200 bg-red-50 px-2 py-1 text-xs text-red-700">
                  {actionError}
                </div>
              )}

              {selectedRequests.length === 0 ? (
                <div className="mt-4 text-xs text-slate-500">
                  No one is out on this day (based on current filters).
                </div>
              ) : (
                selectedRequests.map((r) => {
                  const name = r.employee
                    ? `${r.employee.firstName} ${r.employee.lastName}`
                    : `Employee ${r.employeeId.slice(0, 6)}`;

                  const statusBadge =
                    r.status === "APPROVED"
                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                      : r.status === "REQUESTED"
                      ? "bg-amber-50 text-amber-700 border-amber-200"
                      : r.status === "DENIED"
                      ? "bg-rose-50 text-rose-700 border-rose-200"
                      : "bg-slate-50 text-slate-600 border-slate-200";

                  return (
                    <div
                      key={r.id}
                      className="rounded-xl border border-slate-200 bg-slate-50/60 p-3"
                    >
                      <div className="mb-1 flex items-center justify-between gap-2">
                        <div className="font-medium text-slate-900">
                          {name}
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusBadge}`}
                        >
                          {r.status.toLowerCase()}
                        </span>
                      </div>

                      <div className="text-xs text-slate-600">
                        <div className="flex flex-wrap gap-1">
                          <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
                            {r.type.toLowerCase()}
                          </span>
                          {r.policy && (
                            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] text-slate-700">
                              {r.policy.name}
                            </span>
                          )}
                        </div>
                        <div className="mt-1 text-[11px] text-slate-500">
                          {new Date(r.startDate).toLocaleDateString()} –{" "}
                          {new Date(r.endDate).toLocaleDateString()}
                        </div>
                      </div>

                      <div className="mt-2 flex flex-wrap gap-2">
                        <button
                          type="button"
                          onClick={() => updateStatus(r, "APPROVED")}
                          disabled={
                            mutatingId === r.id || r.status === "APPROVED"
                          }
                          className="inline-flex items-center rounded-full bg-emerald-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(r, "DENIED")}
                          disabled={
                            mutatingId === r.id || r.status === "DENIED"
                          }
                          className="inline-flex items-center rounded-full bg-rose-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-rose-700 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Deny
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(r, "CANCELLED")}
                          disabled={
                            mutatingId === r.id || r.status === "CANCELLED"
                          }
                          className="inline-flex items-center rounded-full border border-slate-300 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
