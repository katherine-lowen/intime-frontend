"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { PlanGate, type Plan } from "@/components/PlanGate";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type OnboardingTemplate = {
  id: string;
  name: string;
  description?: string | null;
  taskCount?: number | null;
};

type FormState = {
  id?: string;
  name: string;
  description: string;
};

export default function OnboardingTemplatesPage() {
  const { orgSlug, loading: orgLoading } = useCurrentOrg();
  const [role, setRole] = useState<OrgRole | null>(null);
  const [templates, setTemplates] = useState<OnboardingTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
  });
  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

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
      await fetchTemplates();
    }
    void init();
    return () => {
      cancelled = true;
    };
  }, []);

  async function fetchTemplates() {
    try {
      setLoading(true);
      setError(null);
      const data = await api.get<OnboardingTemplate[]>("/onboarding/templates");
      setTemplates(data ?? []);
    } catch (err: any) {
      console.error("[onboarding/templates] fetch failed", err);
      setError(err?.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setForm({ id: undefined, name: "", description: "" });
    setDialogOpen(true);
  };

  const openEdit = (tpl: OnboardingTemplate) => {
    setForm({
      id: tpl.id,
      name: tpl.name,
      description: tpl.description ?? "",
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager) return;
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
      };
      if (form.id) {
        await api.patch(`/onboarding/templates/${form.id}`, payload);
      } else {
        await api.post(`/onboarding/templates`, payload);
      }
      setDialogOpen(false);
      await fetchTemplates();
    } catch (err: any) {
      console.error("[onboarding/templates] save failed", err);
      setError(err?.message || "Failed to save template.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isManager) return;
    const confirmDelete = window.confirm("Delete this template?");
    if (!confirmDelete) return;
    setDeletingId(id);
    try {
      await api.delete(`/onboarding/templates/${id}`);
      setTemplates((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error("[onboarding/templates] delete failed", err);
      setError(err?.message || "Failed to delete template.");
    } finally {
      setDeletingId(null);
    }
  };

  const renderSkeleton = () => (
    <div className="space-y-3 animate-pulse">
      <div className="h-10 w-48 rounded bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
      <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
    </div>
  );

  if (orgLoading || !orgSlug) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 text-sm text-slate-600">
        Loading…
      </div>
    );
  }

  const currentPlan = null as Plan | null;

  return (
    <AuthGate>
      <PlanGate required="GROWTH" current={currentPlan}>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Onboarding · Templates
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Onboarding templates
              </h1>
              <p className="text-sm text-slate-600">
                Create reusable onboarding checklists for new hires.
              </p>
            </div>
            {isManager && (
              <button
                onClick={openCreate}
                className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                type="button"
              >
                New template
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
              You do not have access to onboarding templates.
            </div>
          ) : loading ? (
            renderSkeleton()
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
              No onboarding templates yet. Create one to start assigning tasks.
            </div>
          ) : (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
              <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                <div className="col-span-4">Name</div>
                <div className="col-span-4">Description</div>
                <div className="col-span-2">Tasks</div>
                <div className="col-span-2 text-right">Actions</div>
              </div>
              <div className="divide-y divide-slate-200">
                {templates.map((tpl) => (
                  <div
                    key={tpl.id}
                    className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm text-slate-800"
                  >
                    <div className="col-span-4 font-medium">{tpl.name}</div>
                    <div className="col-span-4 text-slate-600">
                      {tpl.description || "—"}
                    </div>
                    <div className="col-span-2">
                      {typeof tpl.taskCount === "number" ? tpl.taskCount : "—"}
                    </div>
                    <div className="col-span-2 flex justify-end gap-2 text-xs">
                      <Link
                        href={`/onboarding/templates/${tpl.id}`}
                        className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                      >
                        Manage tasks
                      </Link>
                      {isManager && (
                        <button
                          onClick={() => openEdit(tpl)}
                          className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                          type="button"
                        >
                          Edit
                        </button>
                      )}
                      {isManager && (
                        <button
                          onClick={() => handleDelete(tpl.id)}
                          disabled={deletingId === tpl.id}
                          className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                          type="button"
                        >
                          {deletingId === tpl.id ? "Deleting…" : "Delete"}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
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
                    {form.id ? "Edit template" : "New template"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Define the template name and description.
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
                    placeholder="Sales onboarding"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Description
                  </label>
                  <textarea
                    value={form.description}
                    onChange={(e) =>
                      setForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                    rows={3}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Checklist for new sales hires."
                  />
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
                    {saving ? "Saving…" : form.id ? "Save changes" : "Create template"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PlanGate>
    </AuthGate>
  );
}
