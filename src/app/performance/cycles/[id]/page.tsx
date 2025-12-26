// src/app/performance/cycles/[id]/page.tsx
"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { format } from "date-fns";
import { orgHref } from "@/lib/org-base";

import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import type { PerformanceCycle } from "@/lib/performance-types";
import {
  getPerformanceCycle,
  getPerformanceCycleReviews,
  updatePerformanceCycleStatus,
} from "@/lib/api-performance";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";
// Allow any status string coming back from the API
type ReviewStatus = string;


// ✅ add explicit cycle status type so TS stops complaining
type CycleStatus = "DRAFT" | "ACTIVE" | "CLOSED";

type ReviewAnswer = {
  questionId: string;
  questionText?: string | null;
  answer?: string | null;
  rating?: number | null;
};

type ReviewSubmission = {
  submittedAt?: string | null;
  answers?: ReviewAnswer[];
};

type EmployeeReview = {
  id: string;
  employeeId?: string;
  employeeName?: string | null;
  managerName?: string | null;
  // accept whatever the API sends (still expected to be our enum-ish strings)
  status: string;
  selfReview?: ReviewSubmission | null;
  managerReview?: ReviewSubmission | null;
  templateName?: string | null;
};



type Employee = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
};

type EmployeesResponse =
  | { items: Employee[] }
  | { data: Employee[] }
  | { employees: Employee[] }
  | Employee[];

type FormState = {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
};

function formatPeriod(start?: string, end?: string) {
  if (!start || !end) return "—";
  try {
    return `${format(new Date(start), "MMM d, yyyy")} – ${format(
      new Date(end),
      "MMM d, yyyy"
    )}`;
  } catch {
    return `${start} – ${end}`;
  }
}

function normalizeEmployees(res?: EmployeesResponse): Employee[] {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray((res as any).items)) return (res as any).items;
  if (Array.isArray((res as any).data)) return (res as any).data;
  if (Array.isArray((res as any).employees)) return (res as any).employees;
  return [];
}

export default function PerformanceCycleDetailPage() {
  const params = useParams<{ id: string }>();
  const cycleId = params?.id;

  const [role, setRole] = useState<OrgRole | null>(null);
  const [cycle, setCycle] = useState<PerformanceCycle | null>(null);
  const [reviews, setReviews] = useState<EmployeeReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    startDate: "",
    endDate: "",
    status: "DRAFT",
  });
  const [saving, setSaving] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [detailReview, setDetailReview] = useState<EmployeeReview | null>(null);
  const [assignOpen, setAssignOpen] = useState(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selectedEmployeeIds, setSelectedEmployeeIds] = useState<string[]>([]);
  const [assigning, setAssigning] = useState(false);

  const isManager = useMemo(
    () => role === "OWNER" || role === "ADMIN" || role === "MANAGER",
    [role]
  );

  useEffect(() => {
    let cancelled = false;
    async function init() {
      const me = await getCurrentUser();
      const normalizedRole = (me?.role || "").toUpperCase() as OrgRole;
      if (!cancelled) setRole(normalizedRole);
      if (normalizedRole === "EMPLOYEE") {
        window.location.replace("/employee");
        return;
      }
      await Promise.all([fetchCycle(), fetchEmployees()]);
      await fetchReviews();
    }
    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cycleId]);

async function fetchCycle() {
  if (!cycleId) {
    setError("Missing cycle id.");
    setLoading(false);
    return;
  }

  try {
    setLoading(true);
    setError(null);

    const data = await getPerformanceCycle(cycleId);

    if (!data) {
      setCycle(null);
      setError("Review cycle not found.");
      return;
    }

    const status: CycleStatus =
      data.status === "DRAFT" || data.status === "ACTIVE" || data.status === "CLOSED"
        ? (data.status as CycleStatus)
        : "DRAFT";

    setCycle(data);
    setForm({
      id: data.id,
      name: data.name,
      startDate: data.startDate?.slice(0, 10) || "",
      endDate: data.endDate?.slice(0, 10) || "",
      status,
    });
  } catch (err: any) {
    console.error("[performance cycle] fetch failed", err);
    setError(err?.message || "Failed to load review cycle.");
  } finally {
    setLoading(false);
  }
}

  async function fetchReviews() {
    if (!cycleId) return;
    try {
      setError(null);
      const data = await getPerformanceCycleReviews(cycleId);
      setReviews(data ?? []);
    } catch (err: any) {
      console.error("[performance cycle] reviews fetch failed", err);
      setError(err?.message || "Failed to load reviews.");
    }
  }

  async function fetchEmployees() {
    try {
      const data = await api.get<EmployeesResponse>(
        "/employees?page=1&pageSize=100"
      );
      setEmployees(normalizeEmployees(data));
    } catch (err) {
      console.error("[performance cycle] employees fetch failed", err);
    }
  }

  const openEdit = () => {
    if (!cycle) return;
    setForm({
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.startDate?.slice(0, 10) || "",
      endDate: cycle.endDate?.slice(0, 10) || "",
      status: cycle.status as CycleStatus,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    if (!form.name.trim() || !form.startDate || !form.endDate) {
      setError("Name and dates are required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await api.patch(`/performance/cycles/${cycleId}`, {
        name: form.name.trim(),
        startDate: form.startDate,
        endDate: form.endDate,
        status: form.status,
      });
      setDialogOpen(false);
      await fetchCycle();
    } catch (err: any) {
      console.error("[performance cycle] save failed", err);
      setError(err?.message || "Failed to save review cycle.");
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (next: CycleStatus) => {
    if (!isManager || !cycleId) return;
    setStatusUpdating(true);
    try {
      await updatePerformanceCycleStatus(cycleId, next);
      setCycle((prev: PerformanceCycle | null) => (prev ? { ...prev, status: next } : prev));
    } catch (err: any) {
      console.error("[performance cycle] status update failed", err);
      setError(err?.message || "Failed to update status.");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleAssign = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || !cycleId) return;
    if (selectedEmployeeIds.length === 0) return;
    setAssigning(true);
    try {
      await api.post(`/performance/cycles/${cycleId}/assign`, {
        employeeIds: selectedEmployeeIds,
      });
      setAssignOpen(false);
      setSelectedEmployeeIds([]);
      await fetchReviews();
    } catch (err: any) {
      console.error("[performance cycle] assign failed", err);
      setError(err?.message || "Failed to assign employees.");
    } finally {
      setAssigning(false);
    }
  };

  const renderStatusChip = (status: PerformanceCycle["status"]) => {
    const color =
      status === "ACTIVE"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "CLOSED"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-amber-50 text-amber-700 border-amber-200";
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${color}`}
      >
        {status}
      </span>
    );
  };

  const renderReviewStatus = (status: ReviewStatus) => {
    const color =
      status === "COMPLETE"
        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
        : status === "NOT_STARTED"
        ? "bg-slate-100 text-slate-700 border-slate-200"
        : "bg-indigo-50 text-indigo-700 border-indigo-200";
    return (
      <span
        className={`inline-flex items-center rounded-full border px-2 py-1 text-[11px] font-semibold ${color}`}
      >
        {status.replace("_", " ")}
      </span>
    );
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
        <div className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur">
          <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-6 py-4">
            <div>
              <div className="text-xs uppercase tracking-wide text-slate-500">
                Performance · Review cycle
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl font-semibold text-slate-900">
                  {cycle?.name || "Review cycle"}
                </h1>
                {cycle && renderStatusChip(cycle.status)}
              </div>
              <div className="text-sm text-slate-600">
                {cycle ? formatPeriod(cycle.startDate, cycle.endDate) : "—"}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                <span>
                  Completion: {cycle?.submittedCount ?? 0} of{" "}
                  {cycle?.totalReviews ?? 0} reviews (
                  {cycle?.completionPercent ?? 0}%)
                </span>
                <span>
                  Reminders:{" "}
                  {cycle?.reminderEnabled
                    ? `Enabled · ${
                        cycle?.reminderDaysBeforeEnd ?? 0
                      } days before end`
                    : "Disabled"}
                </span>
              </div>
            </div>
            {isManager && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={openEdit}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  type="button"
                >
                  Edit cycle
                </button>
                {cycle?.status === "DRAFT" && (
                  <button
                    onClick={() => handleStatusChange("ACTIVE")}
                    disabled={statusUpdating}
                    className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 disabled:opacity-60"
                    type="button"
                  >
                    {statusUpdating ? "Updating…" : "Activate cycle"}
                  </button>
                )}
                {cycle?.status === "ACTIVE" && (
                  <button
                    onClick={() => handleStatusChange("CLOSED")}
                    disabled={statusUpdating}
                    className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                    type="button"
                  >
                    {statusUpdating ? "Updating…" : "Close cycle"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <Link
            href={orgHref("/performance")}
            className="text-xs font-semibold text-indigo-700 hover:underline"
          >
            ← Back to performance
          </Link>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            renderSkeleton()
          ) : !isManager ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have access to this review cycle.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                    <div className="col-span-3">Employee</div>
                    <div className="col-span-3">Manager</div>
                    <div className="col-span-3">Status</div>
                    <div className="col-span-2 text-center">Self review</div>
                    <div className="col-span-1 text-right">Open</div>
                  </div>
                  {reviews.length === 0 ? (
                    <div className="px-4 py-6 text-sm text-slate-600">
                      No reviews assigned yet.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-200">
                      {reviews.map((rev) => (
                        <div
                          key={rev.id}
                          className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm text-slate-800"
                        >
                          <div className="col-span-3 font-medium">
                            {rev.employeeName ?? rev.employeeId}
                          </div>
                          <div className="col-span-3">
                            {rev.managerName ?? "—"}
                          </div>
                          <div className="col-span-3">
                            {renderReviewStatus(rev.status)}
                          </div>
                          <div className="col-span-2 text-center">
                            {rev.selfReview ? (
                              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                                Submitted
                              </span>
                            ) : (
                              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                                Pending
                              </span>
                            )}
                          </div>
                          <div className="col-span-1 text-right">
                            <button
                              onClick={() => setDetailReview(rev)}
                              className="rounded-md border border-slate-200 px-2 py-1 text-xs text-slate-700 hover:bg-slate-50"
                              type="button"
                            >
                              Open
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="md:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Assign employees
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Add people to this review cycle.
                  </p>
                  <button
                    onClick={() => setAssignOpen(true)}
                    className="mt-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                    type="button"
                  >
                    Assign employees
                  </button>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Templates
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Link or update templates used in this cycle.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Link
                      href={orgHref("/performance/templates")}
                      className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Browse templates
                    </Link>
                    <Link
                      href={orgHref("/performance/templates/new")}
                      className="rounded-md bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800"
                    >
                      New template
                    </Link>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Reminders
                  </h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Reviewers who have not submitted by this point will receive
                    reminder notifications (once hooked up).
                  </p>
                  <div className="mt-2 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-700">
                    {cycle?.reminderEnabled ? (
                      <>
                        <div className="font-semibold text-slate-900">
                          Enabled
                        </div>
                          <div>
                            {cycle.reminderDaysBeforeEnd ?? 0} days before end
                            date.
                          </div>
                      </>
                    ) : (
                      <div>Disabled</div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Edit dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Edit review cycle
                  </h2>
                  <p className="text-xs text-slate-600">
                    Update the period and status for this cycle.
                  </p>
                </div>
                <button
                  onClick={() => setDialogOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  type="button"
                >
                  Close
                </button>
              </div>

              <form className="mt-4 space-y-4" onSubmit={handleSave}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Name
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Mid-year review"
                    required
                  />
                </div>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Period start
                    </label>
                    <input
                      type="date"
                      value={form.startDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          startDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Period end
                    </label>
                    <input
                      type="date"
                      value={form.endDate}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          endDate: e.target.value,
                        }))
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Status
                  </label>
                  <select
                    value={form.status}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        status: e.target.value as CycleStatus,
                      }))
                    }
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="ACTIVE">Active</option>
                    <option value="CLOSED">Closed</option>
                  </select>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setDialogOpen(false)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Save changes"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Review detail side panel */}
        {detailReview && (
          <div className="fixed inset-0 z-40 flex justify-end bg-black/40">
            <div className="h-full w-full max-w-xl overflow-y-auto border-l border-slate-200 bg-white shadow-2xl">
              <div className="sticky top-0 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-slate-500">
                    Review detail
                  </div>
                  <div className="text-sm font-semibold text-slate-900">
                    {detailReview.employeeName ?? detailReview.employeeId}
                  </div>
                  <div className="text-xs text-slate-600">
                    Manager: {detailReview.managerName ?? "—"}
                  </div>
                </div>
                <button
                  onClick={() => setDetailReview(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  type="button"
                >
                  Close
                </button>
              </div>

              <div className="space-y-4 p-4">
                <div className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3">
                  <div className="text-xs text-slate-600">Status</div>
                  <div className="mt-1">
                    {renderReviewStatus(detailReview.status)}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      Self review
                    </div>
                    {detailReview.selfReview ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        Not submitted
                      </span>
                    )}
                  </div>
                  {detailReview.selfReview?.answers?.length ? (
                    <div className="space-y-3 text-sm text-slate-800">
                      {detailReview.selfReview.answers.map((ans) => (
                        <div
                          key={ans.questionId}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <div className="text-xs font-semibold text-slate-700">
                            {ans.questionText || "Question"}
                          </div>
                          <div className="mt-1 text-sm text-slate-800">
                            {ans.answer ?? "No response"}
                          </div>
                          {typeof ans.rating === "number" && (
                            <div className="text-[11px] text-slate-500">
                              Rating: {ans.rating}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">
                      No self review submitted.
                    </div>
                  )}
                </div>

                <div className="rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <div className="text-sm font-semibold text-slate-900">
                      Manager review
                    </div>
                    {detailReview.managerReview ? (
                      <span className="rounded-full bg-emerald-50 px-2 py-1 text-[11px] font-semibold text-emerald-700">
                        Submitted
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-1 text-[11px] font-semibold text-slate-600">
                        Not submitted
                      </span>
                    )}
                  </div>
                  {detailReview.managerReview?.answers?.length ? (
                    <div className="space-y-3 text-sm text-slate-800">
                      {detailReview.managerReview.answers.map((ans) => (
                        <div
                          key={ans.questionId}
                          className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                        >
                          <div className="text-xs font-semibold text-slate-700">
                            {ans.questionText || "Question"}
                          </div>
                          <div className="mt-1 text-sm text-slate-800">
                            {ans.answer ?? "No response"}
                          </div>
                          {typeof ans.rating === "number" && (
                            <div className="text-[11px] text-slate-500">
                              Rating: {ans.rating}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-600">
                      No manager review submitted.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Assign dialog */}
        {assignOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    Assign employees
                  </h2>
                  <p className="text-xs text-slate-600">
                    Add employees to this review cycle.
                  </p>
                </div>
                <button
                  onClick={() => setAssignOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  type="button"
                >
                  Close
                </button>
              </div>

              <form className="mt-4 space-y-4" onSubmit={handleAssign}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Employees
                  </label>
                  <select
                    multiple
                    value={selectedEmployeeIds}
                    onChange={(e) => {
                      const opts = Array.from(e.target.selectedOptions).map(
                        (opt) => opt.value
                      );
                      setSelectedEmployeeIds(opts);
                    }}
                    className="h-40 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {employees.map((emp) => (
                      <option key={emp.id} value={emp.id}>
                        {`${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim() ||
                          emp.email ||
                          emp.id}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-slate-500">
                    Hold Cmd/Ctrl to select multiple employees.
                  </p>
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setAssignOpen(false)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={assigning || selectedEmployeeIds.length === 0}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {assigning ? "Assigning…" : "Assign"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AuthGate>
  );
}
