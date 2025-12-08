"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type TimeoffRequest = {
  id: string;
  employeeId: string;
  employeeName?: string | null;
  policyName?: string | null;
  startDate: string;
  endDate: string;
  status: "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";
  createdAt?: string;
};

type StatusFilter = "ALL" | TimeoffRequest["status"];

export default function TimeoffRequestsPage() {
  const router = useRouter();
  const [role, setRole] = useState<OrgRole | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requests, setRequests] = useState<TimeoffRequest[]>([]);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [actioningId, setActioningId] = useState<string | null>(null);

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
      if (statusFilter !== "ALL") params.set("status", statusFilter);
      if (dateFrom) params.set("from", dateFrom);
      if (dateTo) params.set("to", dateTo);
      const data = await api.get<TimeoffRequest[]>(
        `/timeoff/requests${params.toString() ? `?${params.toString()}` : ""}`
      );
      setRequests(data ?? []);
    } catch (err: any) {
      console.error("[timeoff/requests] fetch failed", err);
      setError(err?.message || "Failed to load time off requests.");
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
    if (!isEmployee) {
      void load();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const handleDecision = async (id: string, action: "approve" | "deny") => {
    if (!isManager) return;
    setActioningId(id);
    try {
      await api.patch(`/timeoff/requests/${id}/${action}`);
      setRequests((prev) =>
        prev.map((r) =>
          r.id === id
            ? { ...r, status: action === "approve" ? "APPROVED" : "DENIED" }
            : r
        )
      );
    } catch (err: any) {
      console.error("[timeoff/requests] action failed", err);
      setError(err?.message || `Failed to ${action} request.`);
    } finally {
      setActioningId(null);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
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
                Time off · Requests
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Time off approvals
              </h1>
              <p className="text-sm text-slate-600">
                Review and approve pending requests across your org.
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
              You do not have permission to view approvals.
            </div>
          ) : (
            <>
              {/* Filters */}
              <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
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
                    <option value="REQUESTED">Requested</option>
                    <option value="APPROVED">Approved</option>
                    <option value="DENIED">Denied</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-800"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <label className="text-xs font-medium text-slate-700">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="rounded-md border border-slate-200 px-2 py-1 text-sm text-slate-800"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => load()}
                  className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                >
                  Apply
                </button>
              </div>

              {loading ? (
                renderSkeleton()
              ) : requests.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
                  No requests for this filter.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                    <div className="col-span-3">Employee</div>
                    <div className="col-span-2">Policy</div>
                    <div className="col-span-3">Dates</div>
                    <div className="col-span-2">Status</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>
                  <div className="divide-y divide-slate-200">
                    {requests.map((req) => (
                      <div
                        key={req.id}
                        className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-slate-800"
                      >
                        <div className="col-span-3 font-medium">
                          {req.employeeName ?? req.employeeId}
                        </div>
                        <div className="col-span-2">{req.policyName ?? "—"}</div>
                        <div className="col-span-3">
                          {req.startDate} → {req.endDate}
                        </div>
                        <div className="col-span-2">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700">
                            {req.status}
                          </span>
                        </div>
                        <div className="col-span-2 flex justify-end gap-2 text-xs">
                          {req.status === "REQUESTED" && isManager ? (
                            <>
                              <button
                                onClick={() => handleDecision(req.id, "approve")}
                                disabled={actioningId === req.id}
                                className="rounded-md border border-emerald-200 bg-emerald-50 px-2 py-1 text-emerald-700 hover:bg-emerald-100 disabled:opacity-60"
                                type="button"
                              >
                                {actioningId === req.id ? "Updating…" : "Approve"}
                              </button>
                              <button
                                onClick={() => handleDecision(req.id, "deny")}
                                disabled={actioningId === req.id}
                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                type="button"
                              >
                                Deny
                              </button>
                            </>
                          ) : (
                            <span className="text-slate-400">—</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
