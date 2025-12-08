"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type OnboardingTemplate = {
  id: string;
  name: string;
  description?: string | null;
};

type OnboardingTaskTemplate = {
  id: string;
  title: string;
  description?: string | null;
  dueInDays?: number | null;
};

type FormState = {
  id?: string;
  title: string;
  description: string;
  dueInDays?: number | null;
};

export default function OnboardingTemplateDetailPage() {
  const params = useParams<{ id: string }>();
  const templateId = params?.id;

  const [role, setRole] = useState<OrgRole | null>(null);
  const [template, setTemplate] = useState<OnboardingTemplate | null>(null);
  const [tasks, setTasks] = useState<OnboardingTaskTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    title: "",
    description: "",
    dueInDays: 0,
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
      await fetchTemplate();
      await fetchTasks();
    }
    void init();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [templateId]);

  async function fetchTemplate() {
    if (!templateId) {
      setError("Missing template id.");
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      let data = await api.get<OnboardingTemplate>(`/onboarding/templates/${templateId}`);
      if (!data) {
        const list = await api.get<OnboardingTemplate[]>("/onboarding/templates");
        data = (list || []).find((t) => t.id === templateId) as OnboardingTemplate | undefined;
      }
      if (data) {
        setTemplate(data);
      } else {
        setError("Template not found.");
      }
    } catch (err: any) {
      console.error("[onboarding/template] fetch failed", err);
      setError(err?.message || "Failed to load template.");
    } finally {
      setLoading(false);
    }
  }

  async function fetchTasks() {
    if (!templateId) return;
    try {
      const data = await api.get<OnboardingTaskTemplate[]>(
        `/onboarding/templates/${templateId}/tasks`
      );
      setTasks(data ?? []);
    } catch (err: any) {
      console.error("[onboarding/template] tasks fetch failed", err);
      setError(err?.message || "Failed to load tasks.");
    }
  }

  const openCreate = () => {
    setForm({ id: undefined, title: "", description: "", dueInDays: 0 });
    setDialogOpen(true);
  };

  const openEdit = (task: OnboardingTaskTemplate) => {
    setForm({
      id: task.id,
      title: task.title,
      description: task.description ?? "",
      dueInDays: task.dueInDays ?? 0,
    });
    setDialogOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isManager || !templateId) return;
    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        dueInDays:
          form.dueInDays === undefined || form.dueInDays === null
            ? null
            : Number(form.dueInDays),
      };
      if (form.id) {
        await api.patch(`/onboarding/task-templates/${form.id}`, payload);
      } else {
        await api.post(`/onboarding/templates/${templateId}/tasks`, payload);
      }
      setDialogOpen(false);
      await fetchTasks();
    } catch (err: any) {
      console.error("[onboarding/template] save task failed", err);
      setError(err?.message || "Failed to save task.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!isManager) return;
    const confirmDelete = window.confirm("Delete this task?");
    if (!confirmDelete) return;
    setDeletingId(id);
    try {
      await api.del(`/onboarding/task-templates/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error("[onboarding/template] delete task failed", err);
      setError(err?.message || "Failed to delete task.");
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

  return (
    <AuthGate>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
          <Link
            href="/onboarding/templates"
            className="text-xs font-semibold text-indigo-700 hover:underline"
          >
            ← Back to templates
          </Link>

          {error && (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
              {error}
            </div>
          )}

          {loading ? (
            renderSkeleton()
          ) : !template ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              Template not found.
            </div>
          ) : (
            <>
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-xs uppercase tracking-wide text-slate-500">
                    Onboarding · Template
                  </p>
                  <h1 className="text-2xl font-semibold text-slate-900">
                    {template.name}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {template.description || "No description provided."}
                  </p>
                </div>
                {isManager && (
                  <button
                    onClick={openCreate}
                    className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
                    type="button"
                  >
                    Add task
                  </button>
                )}
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="grid grid-cols-12 gap-3 border-b border-slate-200 bg-slate-50 px-4 py-3 text-xs font-semibold uppercase text-slate-600">
                  <div className="col-span-4">Title</div>
                  <div className="col-span-5">Description</div>
                  <div className="col-span-2">Due (days)</div>
                  <div className="col-span-1 text-right">Actions</div>
                </div>
                {tasks.length === 0 ? (
                  <div className="px-4 py-6 text-sm text-slate-600">
                    No tasks yet. Add tasks to this template.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-200">
                    {tasks.map((task) => (
                      <div
                        key={task.id}
                        className="grid grid-cols-12 items-center gap-3 px-4 py-3 text-sm text-slate-800"
                      >
                        <div className="col-span-4 font-medium">{task.title}</div>
                        <div className="col-span-5 text-slate-600">
                          {task.description || "—"}
                        </div>
                        <div className="col-span-2">
                          {task.dueInDays ?? "—"}
                        </div>
                        <div className="col-span-1 flex justify-end gap-2 text-xs">
                          {isManager && (
                            <>
                              <button
                                onClick={() => openEdit(task)}
                                className="rounded-md border border-slate-200 px-2 py-1 text-slate-700 hover:bg-slate-50"
                                type="button"
                              >
                                Edit
                              </button>
                              <button
                                onClick={() => handleDelete(task.id)}
                                disabled={deletingId === task.id}
                                className="rounded-md border border-rose-200 bg-rose-50 px-2 py-1 text-rose-700 hover:bg-rose-100 disabled:opacity-60"
                                type="button"
                              >
                                {deletingId === task.id ? "Deleting…" : "Delete"}
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>

        {/* Dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {form.id ? "Edit task" : "Add task"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Define the onboarding task details.
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
                  <label className="text-xs font-medium text-slate-700">Title</label>
                  <input
                    value={form.title}
                    onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="Complete HR paperwork"
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
                    placeholder="Upload required documents, sign forms, etc."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Due (days after start)
                  </label>
                  <input
                    type="number"
                    value={form.dueInDays ?? ""}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        dueInDays: e.target.value === "" ? null : Number(e.target.value),
                      }))
                    }
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="3"
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
                    {saving ? "Saving…" : form.id ? "Save changes" : "Add task"}
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
