"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

export type TimeOffStatus =
  | "REQUESTED"
  | "APPROVED"
  | "DENIED"
  | "CANCELLED";

export type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

export type TimeOffRequestItem = {
  id: string;
  orgId: string;
  employeeId: string;
  policyId?: string | null;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  reason?: string | null;
  managerId?: string | null;
  createdAt: string;
  updatedAt: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    department?: string | null;
  };
  manager?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
  policy?: {
    id: string;
    name: string;
    kind: string;
    annualAllowanceDays?: number | null;
  } | null;
};

function formatDateRange(start: string, end: string) {
  const s = new Date(start);
  const e = new Date(end);
  const sameMonth = s.getMonth() === e.getMonth() && s.getFullYear() === e.getFullYear();
  const options: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  if (sameMonth) {
    return `${s.toLocaleDateString(undefined, options)}–${e.getDate()}`;
  }
  return `${s.toLocaleDateString(undefined, options)}–${e.toLocaleDateString(
    undefined,
    options
  )}`;
}

function statusClasses(status: TimeOffStatus) {
  switch (status) {
    case "APPROVED":
      return "border-emerald-500/40 bg-emerald-500/10 text-emerald-200";
    case "DENIED":
      return "border-rose-500/40 bg-rose-500/10 text-rose-200";
    case "CANCELLED":
      return "border-slate-600/60 bg-slate-800/80 text-slate-300";
    default:
      return "border-amber-500/40 bg-amber-500/10 text-amber-200";
  }
}

type Props = {
  items: TimeOffRequestItem[];
  showActions?: boolean; // only true for REQUESTED section
};

export default function TimeoffRequestsTable({ items, showActions }: Props) {
  const router = useRouter();
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: TimeOffStatus) {
    setError(null);
    setPendingId(id);

    try {
      const res = await fetch(`/api/timeoff/requests/${id}/status`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(text || `HTTP ${res.status}`);
      }

      // refresh server data
      startTransition(() => {
        router.refresh();
      });
    } catch (err) {
      console.error("Failed to update time off status", err);
      setError("Could not update status. Please try again.");
    } finally {
      setPendingId(null);
    }
  }

  if (items.length === 0) {
    return (
      <p className="px-1 py-2 text-xs text-slate-500">
        No requests in this bucket.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md border border-rose-500/40 bg-rose-500/10 px-3 py-2 text-xs text-rose-100">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-slate-800 bg-slate-950/40">
        <table className="min-w-full border-collapse text-xs">
          <thead className="bg-slate-950/60 text-slate-400">
            <tr>
              <th className="px-3 py-2 text-left font-normal">Employee</th>
              <th className="px-3 py-2 text-left font-normal">Dates</th>
              <th className="px-3 py-2 text-left font-normal">Type</th>
              <th className="px-3 py-2 text-left font-normal">Policy</th>
              <th className="px-3 py-2 text-left font-normal">Reason</th>
              <th className="px-3 py-2 text-left font-normal">Status</th>
              <th className="px-3 py-2 text-left font-normal">Manager</th>
              {showActions && (
                <th className="px-3 py-2 text-right font-normal">Actions</th>
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((req) => {
              const isRowPending = pendingId === req.id && isPending;
              const mgr = req.manager;

              return (
                <tr key={req.id} className="border-t border-slate-800">
                  <td className="px-3 py-2 align-top">
                    <div className="flex flex-col">
                      <span className="font-medium text-slate-100">
                        {req.employee.firstName} {req.employee.lastName}
                      </span>
                      <span className="text-[11px] text-slate-400">
                        {req.employee.department || "No dept"} ·{" "}
                        {req.employee.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-200">
                    {formatDateRange(req.startDate, req.endDate)}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-200">
                    {req.type}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-200">
                    {req.policy ? req.policy.name : "—"}
                  </td>
                  <td className="px-3 py-2 align-top text-slate-300">
                    {req.reason || "—"}
                  </td>
                  <td className="px-3 py-2 align-top">
                    <span
                      className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] ${statusClasses(
                        req.status
                      )}`}
                    >
                      {req.status}
                    </span>
                  </td>
                  <td className="px-3 py-2 align-top text-slate-300">
                    {mgr ? (
                      <>
                        {mgr.firstName} {mgr.lastName}
                      </>
                    ) : (
                      <span className="text-slate-500">—</span>
                    )}
                  </td>
                  {showActions && (
                    <td className="px-3 py-2 align-top text-right">
                      <div className="inline-flex gap-1">
                        <button
                          type="button"
                          onClick={() => updateStatus(req.id, "APPROVED")}
                          disabled={isRowPending}
                          className="rounded-full bg-emerald-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isRowPending ? "…" : "Approve"}
                        </button>
                        <button
                          type="button"
                          onClick={() => updateStatus(req.id, "DENIED")}
                          disabled={isRowPending}
                          className="rounded-full bg-rose-600 px-2 py-1 text-[11px] font-medium text-white hover:bg-rose-500 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          {isRowPending ? "…" : "Deny"}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
