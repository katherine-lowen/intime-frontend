"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type TimeoffPolicy = {
  id: string;
  name: string;
  kind: "UNLIMITED" | "FIXED" | "ACCRUAL";
  annualAllowanceDays?: number | null;
  createdAt?: string;
  updatedAt?: string;
};

type FormState = {
  id?: string;
  name: string;
  kind: TimeoffPolicy["kind"];
  annualAllowanceDays?: number | null;
};

const kindOptions: TimeoffPolicy["kind"][] = ["UNLIMITED", "FIXED", "ACCRUAL"];

async function apiDelete(path: string) {
  const anyApi = api as any;
  if (typeof anyApi.delete === "function") return anyApi.delete(path);
  if (typeof anyApi.remove === "function") return anyApi.remove(path);
  if (typeof anyApi.del === "function") return anyApi.del(path);
  if (typeof anyApi.request === "function")
    return anyApi.request({ method: "DELETE", url: path });
  throw new Error("ApiClient is missing a DELETE method (delete/remove/request).");
}

export default function TimeoffPoliciesPage() {
  const router = useRouter();

  const [policies, setPolicies] = useState<TimeoffPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formState, setFormState] = useState<FormState>({
    name: "",
    kind: "FIXED",
    annualAllowanceDays: 10,
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [role, setRole] = useState<OrgRole | null>(null);

  const isAdminOwner = useMemo(() => role === "OWNER" || role === "ADMIN", [role]);
  const isManager = useMemo(
    () => role === "OWNER" || role === "ADMIN" || role === "MANAGER",
    [role]
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const me = await getCurrentUser();
        const normalizedRole = (me?.role || "").toUpperCase() as OrgRole;
        if (!cancelled) setRole(normalizedRole);

        if (normalizedRole === "EMPLOYEE") {
          router.replace("/employee/timeoff");
          return;
        }

        setLoading(true);
        const data = await api.get<TimeoffPolicy[]>("/timeoff/policies");
        if (!cancelled) setPolicies(data ?? []);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[timeoff/policies] fetch failed", err);
          setError(err?.message || "Failed to load policies.");
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [router]);

  const resetForm = () => {
    setFormState({
      id: undefined,
      name: "",
      kind: "FIXED",
      annualAllowanceDays: 10,
    });
  };

  const openCreate = () => {
    resetForm();
    setFormOpen(true);
  };

  const openEdit = (policy: TimeoffPolicy) => {
    setFormState({
      id: policy.id,
      name: policy.name,
      kind: policy.kind,
      annualAllowanceDays: policy.annualAllowanceDays ?? null,
    });
    setFormOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOwner) return;

    if (!formState.name.trim()) {
      setError("Name is required.");
      return;
    }

    if (
      formState.kind === "FIXED" &&
      (formState.annualAllowanceDays == null ||
        Number.isNaN(formState.annualAllowanceDays))
    ) {
      setError("Annual allowance days required for fixed policies.");
      return;
    }

    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: formState.name.trim(),
        kind: formState.kind,
        annualAllowanceDays:
          formState.kind === "FIXED" ? Number(formState.annualAllowanceDays) : null,
      };

      if (formState.id) {
        await api.patch(`/timeoff/policies/${formState.id}`, payload);
      } else {
        await api.post(`/timeoff/policies`, payload);
      }

      const refreshed = await api.get<TimeoffPolicy[]>("/timeoff/policies");
      setPolicies(refreshed ?? []);
      setFormOpen(false);
      resetForm();
    } catch (err: any) {
      console.error("[timeoff/policies] save failed", err);
      setError(err?.message || "Failed to save policy.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isAdminOwner) return;

    const confirmDelete = window.confirm("Delete this policy? This cannot be undone.");
    if (!confirmDelete) return;

    setDeletingId(id);
    try {
      await apiDelete(`/timeoff/policies/${id}`);
      setPolicies((prev) => prev.filter((p) => p.id !== id));
    } catch (err: any) {
      console.error("[timeoff/policies] delete failed", err);
      setError(err?.message || "Failed to delete policy.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-4 animate-pulse">
      <div className="h-10 w-40 rounded bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Time off · Policies
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Time off policies
              </h1>
              <p className="text-sm text-slate-600">
                Manage PTO, sick leave, and other time off policies for your org.
              </p>
            </div>

            {isAdminOwner && (
              <button
                onClick={openCreate}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                type="button"
              >
                New policy
              </button>
            )}
          </div>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            renderSkeleton()
          ) : !isManager ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              You do not have access to view policies.
            </div>
          ) : (
            <div className="space-y-4">
              {policies.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
                  No time off policies yet.
                </div>
              ) : (
                <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                  <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                    <div className="col-span-4">Name</div>
                    <div className="col-span-2">Kind</div>
                    <div className="col-span-2">Annual days</div>
                    <div className="col-span-2">Updated</div>
                    <div className="col-span-2 text-right">Actions</div>
                  </div>

                  <div className="divide-y divide-slate-200">
                    {policies.map((policy) => (
                      <div
                        key={policy.id}
                        className="grid grid-cols-12 gap-3 px-4 py-3 text-sm text-slate-800"
                      >
                        <div className="col-span-4 font-medium">{policy.name}</div>
                        <div className="col-span-2">{policy.kind}</div>
                        <div className="col-span-2">
                          {policy.kind === "FIXED" ? policy.annualAllowanceDays ?? "—" : "—"}
                        </div>
                        <div className="col-span-2 text-xs text-slate-500">
                          {policy.updatedAt?.slice(0, 10) ||
                            policy.createdAt?.slice(0, 10) ||
                            "—"}
                        </div>

                        <div className="col-span-2 flex justify-end gap-2 text-xs">
                          {isAdminOwner ? (
                            <>
                              <button
                                onClick={() => openEdit(policy)}
                                className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(policy.id)}
                                disabled={deletingId === policy.id}
                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                type="button"
                              >
                                {deletingId === policy.id ? "Deleting…" : "Delete"}
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
            </div>
          )}

          {formOpen && isAdminOwner && (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {formState.id ? "Edit policy" : "New policy"}
                  </h2>
                  <p className="text-xs text-slate-600">Define the policy name and allowance.</p>
                </div>
                <button
                  onClick={() => {
                    setFormOpen(false);
                    resetForm();
                  }}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                  type="button"
                >
                  Close
                </button>
              </div>

              <form className="space-y-4" onSubmit={handleSave}>
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Name *</label>
                    <input
                      value={formState.name}
                      onChange={(e) =>
                        setFormState((prev) => ({ ...prev, name: e.target.value }))
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="Standard PTO"
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">Kind *</label>
                    <select
                      value={formState.kind}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          kind: e.target.value as TimeoffPolicy["kind"],
                        }))
                      }
                      className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      {kindOptions.map((k) => (
                        <option key={k} value={k}>
                          {k}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {formState.kind === "FIXED" && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-slate-700">
                      Annual allowance (days) *
                    </label>
                    <input
                      type="number"
                      value={formState.annualAllowanceDays ?? ""}
                      onChange={(e) =>
                        setFormState((prev) => ({
                          ...prev,
                          annualAllowanceDays: e.target.value === "" ? null : Number(e.target.value),
                        }))
                      }
                      className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      placeholder="15"
                      required
                    />
                  </div>
                )}

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setFormOpen(false);
                      resetForm();
                    }}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {saving ? "Saving…" : formState.id ? "Save changes" : "Create policy"}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
