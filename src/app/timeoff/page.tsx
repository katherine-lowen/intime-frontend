// src/app/timeoff/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";
import Link from "next/link";

type TimeOffPolicyKind = "UNLIMITED" | "FIXED";

type TimeOffPolicy = {
  id: string;
  orgId: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays: number | null;
  createdAt: string;
};

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
  email?: string;
  department?: string | null;
};

type PolicySummary = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays: number | null;
};

type ManagerSummary = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
};

type TimeOffRequest = {
  id: string;
  orgId: string;
  employeeId: string;
  policyId: string | null;
  type: TimeOffType;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  reason: string | null;
  managerId: string | null;
  createdAt: string;
  employee: EmployeeSummary | null;
  manager: ManagerSummary | null;
  policy: PolicySummary | null;
};

type PolicySummaryRow = {
  id: string;
  name: string;
  kind: TimeOffPolicyKind;
  annualAllowanceDays: number | null;
  employeesCount: number;
  requestsCount: number;
};

// minimal /me response
type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
  } | null;
  org: {
    id: string;
    name: string;
    plan?: string | null;
  } | null;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
  membership: {
    id: string;
    role: string;
  } | null;
  inferredOrgId: string | null;
};

// ---- helpers for summary cards ----

// inclusive day count between two ISO dates
function countDaysInclusive(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return 0;
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / msPerDay) + 1;
}

export default function TimeOffPage() {
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [policySummary, setPolicySummary] = useState<PolicySummaryRow[]>([]);
  const [requests, setRequests] = useState<TimeOffRequest[]>([]);

  const [loading, setLoading] = useState(true);
  const [savingPolicy, setSavingPolicy] = useState(false);
  const [savingRequest, setSavingRequest] = useState(false);
  const [updatingStatusId, setUpdatingStatusId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // /me
  const [me, setMe] = useState<MeResponse | null>(null);
  const [meLoading, setMeLoading] = useState(true);

  // form state – new policy
  const [policyName, setPolicyName] = useState("");
  const [policyKind, setPolicyKind] =
    useState<TimeOffPolicyKind>("UNLIMITED");
  const [policyAllowance, setPolicyAllowance] = useState<string>("15");

  // form state – new request
  const [reqEmployeeId, setReqEmployeeId] = useState("");
  const [reqPolicyId, setReqPolicyId] = useState<string | "">("");
  const [reqType, setReqType] = useState<TimeOffType>("PTO");
  const [reqStartDate, setReqStartDate] = useState("");
  const [reqEndDate, setReqEndDate] = useState("");
  const [reqReason, setReqReason] = useState("");

  // load policies + requests
  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [pol, summary, reqs] = await Promise.all([
          api.get<TimeOffPolicy[]>("/timeoff/policies"),
          api.get<PolicySummaryRow[]>("/timeoff/policies/summary"),
          api.get<TimeOffRequest[]>("/timeoff/requests"),
        ]);

        if (!cancelled) {
          setPolicies(pol ?? []);
          setPolicySummary(summary ?? []);
          setRequests(reqs ?? []);
        }
      } catch (e: any) {
        console.error("[TimeOffPage] failed to load", e);
        if (!cancelled) setError("Failed to load time off data.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  // load /me so we know who "I" am (and their employee id)
  useEffect(() => {
    let cancelled = false;

    async function loadMe() {
      try {
        const data = await api.get<MeResponse>("/me");
        const normalized = data ?? null;

        if (!cancelled) {
          setMe(normalized);
          if (!reqEmployeeId && normalized?.employee?.id) {
            setReqEmployeeId(normalized.employee.id);
          }
        }
      } catch (e) {
        console.error("[TimeOffPage] failed to load /me", e);
      } finally {
        if (!cancelled) setMeLoading(false);
      }
    }

    loadMe();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function handleCreatePolicy(e: FormEvent) {
    e.preventDefault();
    if (!policyName.trim()) return;

    setSavingPolicy(true);
    setError(null);

    try {
      const allowanceNumber =
        policyKind === "FIXED" ? Number(policyAllowance || "0") : null;

      await api.post<TimeOffPolicy>("/timeoff/policies", {
        name: policyName.trim(),
        kind: policyKind,
        annualAllowanceDays: allowanceNumber,
      });

      // refresh lists
      const [pol, summary] = await Promise.all([
        api.get<TimeOffPolicy[]>("/timeoff/policies"),
        api.get<PolicySummaryRow[]>("/timeoff/policies/summary"),
      ]);

      setPolicies(pol ?? []);
      setPolicySummary(summary ?? []);

      // reset form
      setPolicyName("");
      setPolicyKind("UNLIMITED");
      setPolicyAllowance("15");
    } catch (e: any) {
      console.error("[TimeOffPage] failed to create policy", e);
      setError("Failed to create policy.");
    } finally {
      setSavingPolicy(false);
    }
  }

  async function handleCreateRequest(e: FormEvent) {
    e.preventDefault();
    if (!reqEmployeeId.trim() || !reqStartDate || !reqEndDate) return;

    setSavingRequest(true);
    setError(null);

    try {
      await api.post<TimeOffRequest>("/timeoff/requests", {
        employeeId: reqEmployeeId.trim(),
        policyId: reqPolicyId || null,
        type: reqType,
        startDate: new Date(reqStartDate).toISOString(),
        endDate: new Date(reqEndDate).toISOString(),
        reason: reqReason.trim() || null,
      });

      const refreshed = await api.get<TimeOffRequest[]>("/timeoff/requests");
      setRequests(refreshed ?? []);

      // reset form (but keep employeeId so "me" stays selected)
      setReqPolicyId("");
      setReqType("PTO");
      setReqStartDate("");
      setReqEndDate("");
      setReqReason("");
    } catch (e: any) {
      console.error("[TimeOffPage] failed to create request", e);
      setError("Failed to submit time off request.");
    } finally {
      setSavingRequest(false);
    }
  }

  async function handleUpdateStatus(id: string, status: TimeOffStatus) {
    setUpdatingStatusId(id);
    setError(null);

    try {
      const managerId = me?.employee?.id ?? null;

      await api.patch(`/timeoff/requests/${id}/status`, {
        status,
        managerId,
      });

      const refreshed = await api.get<TimeOffRequest[]>("/timeoff/requests");
      setRequests(refreshed ?? []);
    } catch (e: any) {
      console.error("[TimeOffPage] failed to update status", e);
      setError("Failed to update request status.");
    } finally {
      setUpdatingStatusId(null);
    }
  }

  const currentEmployeeName = me?.employee
    ? `${me.employee.firstName} ${me.employee.lastName}`
    : null;

  // ---- derived metrics for top cards ----
  const totalPolicies = policySummary.length;
  const totalEmployeesOnPolicies = policySummary.reduce(
    (sum, p) => sum + (p.employeesCount || 0),
    0
  );
  const pendingRequests = requests.filter(
    (r) => r.status === "REQUESTED"
  ).length;

  const approvedThisYear = (() => {
    const now = new Date();
    const year = now.getFullYear();
    return requests
      .filter(
        (r) =>
          r.status === "APPROVED" &&
          new Date(r.startDate).getFullYear() === year
      )
      .reduce(
        (sum, r) => sum + countDaysInclusive(r.startDate, r.endDate),
        0
      );
  })();

  return (
    <main className="p-6 space-y-6">
      {/* Header + summary cards */}
      <header className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Time off</h1>
          <p className="text-sm text-slate-500">
            Manage PTO policies and track requests across your organization.
          </p>
        </div>

        {/* Calendar button */}
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href="/timeoff/calendar"
            className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-50 hover:bg-slate-800"
          >
            View time off calendar
          </Link>
        </div>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* POLICIES + NEW POLICY FORM */}
      <section className="grid gap-4 md:grid-cols-[2fr,1.3fr]">
        {/* Policies table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Time off policies
              </h2>
              <p className="text-xs text-slate-500">
                High-level view of each policy, who&apos;s assigned, and usage.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Policy</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Allowance</th>
                  <th className="py-2 pr-4 text-right">Employees</th>
                  <th className="py-2 pr-2 text-right">Requests</th>
                </tr>
              </thead>
              <tbody>
                {loading && policySummary.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-xs text-slate-400"
                    >
                      Loading policies…
                    </td>
                  </tr>
                )}

                {!loading && policySummary.length === 0 && (
                  <tr>
                    <td
                      colSpan={5}
                      className="py-6 text-center text-xs text-slate-400"
                    >
                      No policies yet. Create your first PTO policy on the
                      right.
                    </td>
                  </tr>
                )}

                {policySummary.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-50 last:border-0"
                  >
                    <td className="py-2 pr-4 text-sm text-slate-900">
                      {p.name}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-600">
                      {p.kind === "UNLIMITED" ? "Unlimited" : "Fixed"}
                    </td>
                    <td className="py-2 pr-4 text-xs text-slate-600">
                      {p.kind === "UNLIMITED"
                        ? "N/A"
                        : p.annualAllowanceDays != null
                        ? `${p.annualAllowanceDays} days / year`
                        : "—"}
                    </td>
                    <td className="py-2 pr-4 text-right text-xs text-slate-700">
                      {p.employeesCount}
                    </td>
                    <td className="py-2 pr-2 text-right text-xs text-slate-700">
                      {p.requestsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* New policy form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">New policy</h2>
          <p className="mt-1 text-xs text-slate-500">
            Create an unlimited or fixed allowance policy for your org.
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleCreatePolicy}>
            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Policy name
              </label>
              <input
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="e.g. US Full-time PTO"
                value={policyName}
                onChange={(e) => setPolicyName(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Policy type
              </label>
              <select
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={policyKind}
                onChange={(e) =>
                  setPolicyKind(e.target.value as TimeOffPolicyKind)
                }
              >
                <option value="UNLIMITED">Unlimited PTO</option>
                <option value="FIXED">Fixed annual allowance</option>
              </select>
            </div>

            {policyKind === "FIXED" && (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Days per year
                </label>
                <input
                  type="number"
                  min={0}
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={policyAllowance}
                  onChange={(e) => setPolicyAllowance(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={savingPolicy || !policyName.trim()}
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {savingPolicy ? "Saving…" : "Create policy"}
            </button>
          </form>
        </div>
      </section>

      {/* REQUESTS + NEW REQUEST FORM */}
      <section className="grid gap-4 md:grid-cols-[2fr,1.3fr]">
        {/* Requests table */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-800">
                Recent time off requests
              </h2>
              <p className="text-xs text-slate-500">
                Track who&apos;s out and approve or deny requests.
              </p>
            </div>
          </div>

          <div className="mt-4 overflow-x-auto">
            <table className="min-w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                  <th className="py-2 pr-4">Employee</th>
                  <th className="py-2 pr-4">Dates</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Policy</th>
                  <th className="py-2 pr-4">Status</th>
                  <th className="py-2 pr-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading && requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-xs text-slate-400"
                    >
                      Loading requests…
                    </td>
                  </tr>
                )}

                {!loading && requests.length === 0 && (
                  <tr>
                    <td
                      colSpan={6}
                      className="py-6 text-center text-xs text-slate-400"
                    >
                      No requests yet. Submit a request on the right.
                    </td>
                  </tr>
                )}

                {requests.map((r) => {
                  const start = new Date(r.startDate);
                  const end = new Date(r.endDate);
                  const dateRange =
                    start.toDateString() === end.toDateString()
                      ? start.toLocaleDateString()
                      : `${start.toLocaleDateString()} → ${end.toLocaleDateString()}`;

                  const employeeName = r.employee
                    ? `${r.employee.firstName} ${r.employee.lastName}`
                    : `#${r.employeeId.slice(0, 6)}`;

                  let statusColor =
                    "bg-slate-100 text-slate-700 border-slate-200";
                  if (r.status === "APPROVED")
                    statusColor =
                      "bg-green-50 text-green-700 border-green-200";
                  if (r.status === "DENIED")
                    statusColor = "bg-red-50 text-red-700 border-red-200";
                  if (r.status === "REQUESTED")
                    statusColor =
                      "bg-amber-50 text-amber-700 border-amber-200";

                  const isUpdating = updatingStatusId === r.id;

                  return (
                    <tr
                      key={r.id}
                      className="border-b border-slate-50 last:border-0"
                    >
                      <td className="py-2 pr-4 text-sm text-slate-900">
                        {employeeName}
                        {r.employee?.department && (
                          <span className="ml-1 text-[11px] text-slate-500">
                            · {r.employee.department}
                          </span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs text-slate-600">
                        {dateRange}
                      </td>
                      <td className="py-2 pr-4 text-xs text-slate-600">
                        {r.type}
                      </td>
                      <td className="py-2 pr-4 text-xs text-slate-600">
                        {r.policy?.name ?? "—"}
                      </td>
                      <td className="py-2 pr-4">
                        <span
                          className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusColor}`}
                        >
                          {r.status.toLowerCase()}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {r.status === "REQUESTED" ? (
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateStatus(r.id, "APPROVED")
                              }
                              className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-emerald-500 disabled:bg-emerald-300"
                            >
                              {isUpdating ? "Saving…" : "Approve"}
                            </button>
                            <button
                              type="button"
                              disabled={isUpdating}
                              onClick={() =>
                                handleUpdateStatus(r.id, "DENIED")
                              }
                              className="rounded-md bg-red-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-red-500 disabled:bg-red-300"
                            >
                              {isUpdating ? "Saving…" : "Deny"}
                            </button>
                          </div>
                        ) : (
                          <span className="text-[11px] text-slate-400">
                            —
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* New request form */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-800">
            Submit time off
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Requests are scoped to the current workspace and identity.
          </p>

          <form className="mt-4 space-y-3" onSubmit={handleCreateRequest}>
            {/* If we know the current employee, show that instead of a raw input */}
            {currentEmployeeName && reqEmployeeId ? (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Employee
                </label>
                <div className="flex items-center justify-between rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5">
                  <div className="flex flex-col">
                    <span className="text-sm text-slate-900">
                      {currentEmployeeName}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      ID: {reqEmployeeId}
                    </span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Employee ID
                </label>
                <input
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="emp_..."
                  value={reqEmployeeId}
                  onChange={(e) => setReqEmployeeId(e.target.value)}
                />
                {meLoading ? (
                  <p className="text-[11px] text-slate-400">
                    Detecting your employee record…
                  </p>
                ) : (
                  <p className="text-[11px] text-slate-400">
                    No employee record found for this user yet. Using manual ID.
                  </p>
                )}
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Start date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={reqStartDate}
                  onChange={(e) => setReqStartDate(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  End date
                </label>
                <input
                  type="date"
                  className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  value={reqEndDate}
                  onChange={(e) => setReqEndDate(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Policy (optional)
              </label>
              <select
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={reqPolicyId}
                onChange={(e) => setReqPolicyId(e.target.value)}
              >
                <option value="">No specific policy</option>
                {policies.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Time off type
              </label>
              <select
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                value={reqType}
                onChange={(e) => setReqType(e.target.value as TimeOffType)}
              >
                <option value="PTO">PTO</option>
                <option value="SICK">Sick</option>
                <option value="PERSONAL">Personal</option>
                <option value="UNPAID">Unpaid</option>
                <option value="JURY_DUTY">Jury duty</option>
                <option value="PARENTAL_LEAVE">Parental leave</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Reason (optional)
              </label>
              <textarea
                rows={3}
                className="w-full rounded-md border border-slate-200 bg-slate-50 px-2 py-1.5 text-sm text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Optional context for manager"
                value={reqReason}
                onChange={(e) => setReqReason(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={
                savingRequest ||
                !reqEmployeeId.trim() ||
                !reqStartDate ||
                !reqEndDate
              }
              className="inline-flex w-full items-center justify-center rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:bg-slate-400"
            >
              {savingRequest ? "Submitting…" : "Submit request"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
