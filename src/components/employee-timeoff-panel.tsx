// src/components/employee-timeoff-panel.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";
type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type TimeOffRequest = {
  id: string;
  orgId: string;
  employeeId: string;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  reason?: string | null;
};

type TimeOffPolicy = {
  id: string;
  name: string;
  kind: "UNLIMITED" | "FIXED" | "ACCRUAL";
  annualAllowanceDays?: number | null;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return d.toLocaleDateString();
}

function isUpcoming(req: TimeOffRequest) {
  const today = new Date();
  const end = new Date(req.endDate);
  return end >= new Date(today.toDateString());
}

// Inclusive day count between two dates, clamped to a given year
function countDaysInYearRange(
  startStr: string,
  endStr: string,
  year: number,
): number {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return 0;

  const yearStart = new Date(year, 0, 1); // Jan 1
  const yearEnd = new Date(year, 11, 31); // Dec 31

  const effectiveStart = start < yearStart ? yearStart : start;
  const effectiveEnd = end > yearEnd ? yearEnd : end;

  if (effectiveEnd < effectiveStart) return 0;

  const msPerDay = 1000 * 60 * 60 * 24;
  // +1 to make it inclusive (Mon–Wed = 3 days)
  return (
    Math.floor((effectiveEnd.getTime() - effectiveStart.getTime()) / msPerDay) +
    1
  );
}

export default function EmployeeTimeOffPanel({
  employeeId,
}: {
  employeeId: string;
}) {
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);
  const [policy, setPolicy] = useState<TimeOffPolicy | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingPolicy, setLoadingPolicy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadRequests() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<TimeOffRequest[]>(
          `/timeoff?employeeId=${employeeId}`,
        );
        // normalize possible undefined → []
        setRequests(data ?? []);
      } catch (err) {
        console.error(err);
        setError("Failed to load time off for this employee.");
        setRequests([]);
      } finally {
        setLoading(false);
      }
    }

    async function loadPolicy() {
      try {
        setLoadingPolicy(true);
        // We assume a single org-wide policy: just use the first one.
        const policies = await api.get<TimeOffPolicy[]>("/timeoff/policies");
        const normalized = policies ?? [];
        setPolicy(normalized[0] ?? null);
      } catch (err) {
        console.error(err);
        // don't overwrite a more specific error if we already have one
        setError((prev) => prev ?? "Failed to load time off policy.");
        setPolicy(null);
      } finally {
        setLoadingPolicy(false);
      }
    }

    if (employeeId) {
      void loadRequests();
      void loadPolicy();
    }
  }, [employeeId]);

  const upcoming = requests.filter(isUpcoming);
  const past = requests.filter((r) => !isUpcoming(r));

  const currentYear = new Date().getFullYear();

  // For now, we count only APPROVED PTO days
  const approvedPtoThisYear = requests
    .filter(
      (r) =>
        r.status === "APPROVED" &&
        r.type === "PTO" &&
        // overlaps this calendar year at all
        countDaysInYearRange(r.startDate, r.endDate, currentYear) > 0,
    )
    .reduce(
      (sum, r) =>
        sum + countDaysInYearRange(r.startDate, r.endDate, currentYear),
      0,
    );

  const allowance =
    policy &&
    (policy.kind === "FIXED" || policy.kind === "ACCRUAL") &&
    policy.annualAllowanceDays != null
      ? policy.annualAllowanceDays
      : null;

  const remaining =
    allowance != null ? Math.max(allowance - approvedPtoThisYear, 0) : null;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-slate-900">Time off</h2>
        {(loading || loadingPolicy) && (
          <span className="text-xs text-slate-500">Loading…</span>
        )}
      </div>

      {/* Policy + allowance summary */}
      <div className="rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-700">
        {policy ? (
          <>
            <div className="font-medium">
              {policy.name}{" "}
              <span className="text-[11px] uppercase tracking-wide text-slate-500">
                ({policy.kind === "UNLIMITED" ? "Unlimited PTO" : "Fixed PTO"})
              </span>
            </div>

            {policy.kind === "UNLIMITED" ? (
              <p className="mt-1">
                This company uses an{" "}
                <span className="font-medium">unlimited PTO policy</span>.
              </p>
            ) : allowance != null ? (
              <p className="mt-1">
                <span className="font-semibold">
                  {approvedPtoThisYear} of {allowance} days
                </span>{" "}
                used in {currentYear}
                {remaining != null && <> • {remaining} days remaining</>}
                .
              </p>
            ) : (
              <p className="mt-1">
                PTO allowance not fully configured for this policy.
              </p>
            )}
          </>
        ) : (
          <p>
            No time off policy configured yet. Set one under{" "}
            <span className="font-medium">Settings → Time off</span>.
          </p>
        )}
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      {/* Requests list */}
      {requests.length === 0 && !loading ? (
        <p className="text-sm text-slate-600">
          No time off on record for this employee.
        </p>
      ) : (
        <div className="space-y-4 text-sm">
          {upcoming.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Upcoming
              </div>
              <ul className="space-y-1">
                {upcoming.map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-md bg-slate-50 px-3 py-2"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-900">
                        {r.type} — {formatDate(r.startDate)} →{" "}
                        {formatDate(r.endDate)}
                      </div>
                      {r.reason && (
                        <div className="text-[11px] text-slate-500">
                          {r.reason}
                        </div>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {past.length > 0 && (
            <div>
              <div className="mb-1 text-xs font-semibold uppercase tracking-wide text-slate-500">
                History
              </div>
              <ul className="space-y-1">
                {past.slice(0, 5).map((r) => (
                  <li
                    key={r.id}
                    className="flex items-center justify-between rounded-md border border-slate-100 px-3 py-2"
                  >
                    <div>
                      <div className="text-xs font-medium text-slate-900">
                        {r.type} — {formatDate(r.startDate)} →{" "}
                        {formatDate(r.endDate)}
                      </div>
                      {r.reason && (
                        <div className="text-[11px] text-slate-500">
                          {r.reason}
                        </div>
                      )}
                    </div>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      {r.status}
                    </span>
                  </li>
                ))}
              </ul>
              {past.length > 5 && (
                <div className="mt-1 text-[11px] text-slate-400">
                  + {past.length - 5} more past entries
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
