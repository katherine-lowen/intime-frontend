"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";
type CycleStatus = "DRAFT" | "ACTIVE" | "CLOSED";

type ReviewCycle = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
  assignedCount?: number | null;
};

type FormState = {
  id?: string;
  name: string;
  startDate: string;
  endDate: string;
  status: CycleStatus;
};

const statusFilters: Array<{ label: string; value: CycleStatus | "ALL" }> = [
  { label: "All", value: "ALL" },
  { label: "Draft", value: "DRAFT" },
  { label: "Active", value: "ACTIVE" },
  { label: "Closed", value: "CLOSED" },
];

export default function PerformancePage() {
  const [role, setRole] = useState<OrgRole | null>(null);
  const [cycles, setCycles] = useState<ReviewCycle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<CycleStatus | "ALL">("ALL");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    startDate: "",
    endDate: "",
    status: "DRAFT",
  });
  const [saving, setSaving] = useState(false);
  const [closingId, setClosingId] = useState<string | null>(null);

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
      await fetchCycles(normalizedRole);
    }
    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isManager) {
      void fetchCycles(role);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  async function fetchCycles(currentRole: OrgRole | null = role) {
    if (currentRole === "EMPLOYEE") return;
    try {
      setLoading(true);
      setError(null);
      const query =
        statusFilter && statusFilter !== "ALL" ? `?status=${statusFilter}` : "";
      const data = await api.get<ReviewCycle[]>(`/performance/cycles${query}`);
      setCycles(data ?? []);
    } catch (err: any) {
      console.error("[performance] cycles fetch failed", err);
      setError(err?.message || "Failed to load review cycles.");
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setForm({
      id: undefined,
      name: "",
      startDate: "",
      endDate: "",
      status: "DRAFT",
    });
    setDialogOpen(true);
  };

  const openEdit = (cycle: ReviewCycle) => {
    setForm({
      id: cycle.id,
      name: cycle.name,
      startDate: cycle.startDate?.slice(0, 10) || "",
      endDate: cycle.endDate?.slice(0, 10) || "",
      status: cycle.status,
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
      if (form.id) {
        await api.patch(`/performance/cycles/${form.id}`, {
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          status: form.status,
        });
      } else {
        await api.post(`/performance/cycles`, {
          name: form.name.trim(),
          startDate: form.startDate,
          endDate: form.endDate,
          status: "DRAFT",
        });
      }
      setDialogOpen(false);
      await fetchCycles();
    } catch (err: any) {
      console.error("[performance] save failed", err);
      setError(err?.message || "Failed to save review cycle.");
    } finally {
      setSaving(false);
    }
  };

  const handleCloseCycle = async (id: string) => {
    if (!isManager) return;
    const confirmClose = window.confirm("Close this cycle? You can reopen via edit.");
    if (!confirmClose) return;
    setClosingId(id);
    try {
      await api.patch(`/performance/cycles/${id}`, { status: "CLOSED" });
      setCycles((prev) =>
        prev.map((c) => (c.id === id ? { ...c, status: "CLOSED" } : c))
      );
    } catch (err: any) {
      console.error("[performance] close failed", err);
      setError(err?.message || "Failed to close cycle.");
    } finally {
      setClosingId(null);
    }
  };

  const renderStatusChip = (status: CycleStatus) => {
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
                Performance
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Performance reviews
              </h1>
              <p className="text-sm text-slate-600">
                Set up review cycles, templates, and track progress across your team.
              </p>
            </div>
            {isManager && (
              <button
                onClick={openCreate}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                type="button"
              >
                New review cycle
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {!isManager && !loading ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have access to performance reviews.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-12">
              <div className="md:col-span-8 space-y-4">
                {/* Status filters */}
                <div className="flex flex-wrap gap-2">
                  {statusFilters.map((item) => (
                    <button
                      key={item.value}
                      onClick={() => setStatusFilter(item.value)}
                      className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        statusFilter === item.value
                          ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                          : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                      }`}
                      type="button"
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {/* Cycles table */}
                {loading ? (
                  renderSkeleton()
                ) : cycles.length === 0 ? (
                  <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
                    <div className="mb-2 font-semibold text-slate-800">
                      No review cycles yet
                    </div>
                    <p className="mb-4 text-sm text-slate-600">
                      Start your first cycle to launch performance reviews.
                    </p>
                    {isManager && (
                      <button
                        onClick={openCreate}
                        className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
                        type="button"
                      >
                        Create your first cycle
                      </button>
                    )}
                  </div>
                ) : (
                  <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                    <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                      <div className="col-span-4">Name</div>
                      <div className="col-span-4">Period</div>
                      <div className="col-span-2">Status</div>
                      <div className="col-span-2 text-right">Actions</div>
                    </div>
                    <div className="divide-y divide-slate-200">
                      {cycles.map((cycle) => (
                        <div
                          key={cycle.id}
                          className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm text-slate-800"
                        >
                          <div className="col-span-4 font-medium">
                            {cycle.name}
                            {typeof cycle.assignedCount === "number" && (
                              <div className="text-xs text-slate-500">
                                {cycle.assignedCount} assigned
                              </div>
                            )}
                          </div>
                          <div className="col-span-4 text-sm text-slate-700">
                            {cycle.startDate && cycle.endDate
                              ? `${format(new Date(cycle.startDate), "MMM d, yyyy")} – ${format(new Date(cycle.endDate), "MMM d, yyyy")}`
                              : "—"}
                          </div>
                          <div className="col-span-2">{renderStatusChip(cycle.status)}</div>
                          <div className="col-span-2 flex justify-end gap-2 text-xs">
                            <Link
                              href={`/performance/cycles/${cycle.id}`}
                              className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                            >
                              View
                            </Link>
                            {isManager && (
                              <>
                                <button
                                  onClick={() => openEdit(cycle)}
                                  className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                                  type="button"
                                >
                                  Edit
                                </button>
                                {cycle.status === "ACTIVE" && (
                                  <button
                                    onClick={() => handleCloseCycle(cycle.id)}
                                    disabled={closingId === cycle.id}
                                    className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                    type="button"
                                  >
                                    {closingId === cycle.id ? "Closing…" : "Close"}
                                  </button>
                                )}
                              </>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right column */}
              <div className="md:col-span-4 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">Review stats</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Quick snapshot of current cycles.
                  </p>
                  <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="text-[11px] uppercase text-slate-500">Active</div>
                      <div className="text-xl font-semibold text-slate-900">
                        {cycles.filter((c) => c.status === "ACTIVE").length}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="text-[11px] uppercase text-slate-500">Drafts</div>
                      <div className="text-xl font-semibold text-slate-900">
                        {cycles.filter((c) => c.status === "DRAFT").length}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="text-[11px] uppercase text-slate-500">Closed</div>
                      <div className="text-xl font-semibold text-slate-900">
                        {cycles.filter((c) => c.status === "CLOSED").length}
                      </div>
                    </div>
                    <div className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3">
                      <div className="text-[11px] uppercase text-slate-500">Total</div>
                      <div className="text-xl font-semibold text-slate-900">{cycles.length}</div>
                    </div>
                  </div>
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                  <h3 className="text-sm font-semibold text-slate-900">Templates</h3>
                  <p className="mt-1 text-xs text-slate-600">
                    Reuse your favorite review templates or create a new one.
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs">
                    <Link
                      href="/performance/templates"
                      className="rounded-md border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Browse templates
                    </Link>
                    <Link
                      href="/performance/templates/new"
                      className="rounded-md bg-slate-900 px-3 py-2 font-semibold text-white hover:bg-slate-800"
                    >
                      New template
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {form.id ? "Edit review cycle" : "New review cycle"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Define the period and status for this cycle.
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
                  <label className="text-xs font-medium text-slate-700">Name</label>
                  <input
                    value={form.name}
                    onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
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
                        setForm((prev) => ({ ...prev, startDate: e.target.value }))
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
                        setForm((prev) => ({ ...prev, endDate: e.target.value }))
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      required
                    />
                  </div>
                </div>

                {form.id && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Status</label>
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
                )}

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
                    {saving ? "Saving…" : form.id ? "Save changes" : "Create cycle"}
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
