// src/components/timeoff-requests-table.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export type TimeOffStatus =
  | "REQUESTED"
  | "APPROVED"
  | "DENIED"
  | "CANCELLED";

type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

export type TimeOffRequestItem = {
  id: string;
  type?: TimeOffType | null;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  reason?: string | null;
  employee?: {
    id: string;
    firstName?: string | null;
    lastName?: string | null;
    email?: string | null;
    department?: string | null;
  } | null;
  policy?: {
    id: string;
    name: string;
    kind: TimeOffPolicyKind;
    annualAllowanceDays?: number | null;
  } | null;
};

type Props = {
  items: TimeOffRequestItem[];
  showActions?: boolean;
};

function formatDate(value: string) {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function formatEmployee(e?: TimeOffRequestItem["employee"]) {
  if (!e) return "Employee";
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  return name || e.email || "Employee";
}

function statusBadge(status: TimeOffStatus) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border";
  switch (status) {
    case "REQUESTED":
      return (
        <span
          className={`${base} border-amber-200 bg-amber-50 text-amber-800`}
        >
          Requested
        </span>
      );
    case "APPROVED":
      return (
        <span
          className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}
        >
          Approved
        </span>
      );
    case "DENIED":
      return (
        <span
          className={`${base} border-rose-200 bg-rose-50 text-rose-800`}
        >
          Denied
        </span>
      );
    case "CANCELLED":
      return (
        <span
          className={`${base} border-slate-200 bg-slate-50 text-slate-500`}
        >
          Cancelled
        </span>
      );
    default:
      return (
        <span className={`${base} border-slate-200 bg-slate-50 text-slate-500`}>
          {status}
        </span>
      );
  }
}

export default function TimeoffRequestsTable({ items, showActions }: Props) {
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function updateStatus(id: string, status: TimeOffStatus) {
    setError(null);
    setBusyId(id);
    try {
      const baseUrl =
        process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080";
      const orgId = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

      const res = await fetch(`${baseUrl}/timeoff/requests/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": orgId,
        },
        body: JSON.stringify({
          status,
          // managerId: could be wired later if you have current user id
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Update time off status failed:", res.status, text);
        throw new Error(`Update failed: ${res.status}`);
      }

      // Refresh the server component buckets
      router.refresh();
    } catch (e: any) {
      setError(e?.message || "Failed to update request.");
    } finally {
      setBusyId(null);
    }
  }

  if (!items.length) {
    return <p className="text-sm text-slate-500">No requests in this bucket.</p>;
  }

  return (
    <div className="space-y-2">
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-[11px] text-red-700">
          {error}
        </div>
      )}
      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Employee
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Dates
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Type
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>
              <th className="px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                Policy
              </th>
              {showActions && (
                <th className="px-3 py-2 text-right text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-slate-50">
                <td className="px-3 py-3 text-sm text-slate-900">
                  <div className="flex flex-col">
                    <span className="font-medium">
                      {formatEmployee(item.employee)}
                    </span>
                    {item.employee?.department && (
                      <span className="text-[11px] text-slate-500">
                        {item.employee.department}
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-slate-700">
                  <div className="flex flex-col text-[12px]">
                    <span>{formatDate(item.startDate)}</span>
                    <span className="text-slate-400">
                      through {formatDate(item.endDate)}
                    </span>
                  </div>
                </td>
                <td className="px-3 py-3 text-sm text-slate-700">
                  <span className="text-[12px] uppercase tracking-wide text-slate-600">
                    {item.type || "PTO"}
                  </span>
                </td>
                <td className="px-3 py-3 text-sm text-slate-700">
                  {statusBadge(item.status)}
                </td>
                <td className="px-3 py-3 text-sm text-slate-700">
                  {item.policy ? (
                    <span className="text-[12px] text-slate-700">
                      {item.policy.name}
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-400">—</span>
                  )}
                </td>
                {showActions && (
                  <td className="px-3 py-3 text-right text-sm">
                    {item.status !== "REQUESTED" ? (
                      <span className="text-[11px] text-slate-400">
                        No actions
                      </span>
                    ) : (
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => updateStatus(item.id, "APPROVED")}
                          className="rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => updateStatus(item.id, "DENIED")}
                          className="rounded-full border border-rose-200 bg-rose-50 px-2.5 py-1 text-[11px] font-medium text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
