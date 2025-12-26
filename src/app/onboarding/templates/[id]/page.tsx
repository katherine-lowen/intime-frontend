"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";
import { PlanGate, type Plan } from "@/components/PlanGate";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { orgHref } from "@/lib/org-base";

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

  const { orgSlug, loading: orgLoading } = useCurrentOrg();
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

      let data: OnboardingTemplate | null =
        (await api.get<OnboardingTemplate>(
          `/onboarding/templates/${templateId}`
        )) ?? null;

      if (!data) {
        const list = await api.get<OnboardingTemplate[]>(
          "/onboarding/templates"
        );
        data = (list || []).find((t) => t.id === templateId) ?? null;
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
      await api.delete(`/onboarding/task-templates/${id}`);
      setTasks((prev) => prev.filter((t) => t.id !== id));
    } catch (err: any) {
      console.error("[onboarding/template] delete task failed", err);
      setError(err?.message || "Failed to delete task.");
    } finally {
      setDeletingId(null);
    }
  };

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
          <div className="mx-auto max-w-5xl px-6 py-8 space-y-6">
            <Link
              href={orgHref("/onboarding/templates")}
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
              <div className="space-y-3 animate-pulse">
                <div className="h-10 w-48 rounded bg-slate-100" />
                <div className="h-24 rounded-2xl border border-slate-200 bg-slate-100" />
              </div>
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
                          <div className="col-span-4 font-medium">
                            {task.title}
                          </div>
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
                                  {deletingId === task.id
                                    ? "Deleting…"
                                    : "Delete"}
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
        </div>
      </PlanGate>
    </AuthGate>
  );
}
