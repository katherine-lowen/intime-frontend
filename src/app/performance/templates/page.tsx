"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { getCurrentUser } from "@/lib/auth";

type OrgRole = "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";

type QuestionType = "TEXT" | "TEXTAREA" | "RATING" | "SELECT";

type ReviewQuestion = {
  id: string;
  label: string;
  type: QuestionType;
  options?: string[];
};

type ReviewTemplate = {
  id: string;
  name: string;
  description?: string | null;
  questions: ReviewQuestion[];
};

type FormState = {
  id?: string;
  name: string;
  description: string;
  questions: ReviewQuestion[];
};

const defaultQuestion = (): ReviewQuestion => ({
  id: crypto.randomUUID(),
  label: "",
  type: "TEXT",
  options: [],
});

const questionTypes: QuestionType[] = ["TEXT", "TEXTAREA", "RATING", "SELECT"];

export default function PerformanceTemplatesPage() {
  const [role, setRole] = useState<OrgRole | null>(null);
  const [templates, setTemplates] = useState<ReviewTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [form, setForm] = useState<FormState>({
    name: "",
    description: "",
    questions: [defaultQuestion()],
  });
  const [saving, setSaving] = useState(false);

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
      const data = await api.get<ReviewTemplate[]>("/performance/templates");
      setTemplates(data ?? []);
    } catch (err: any) {
      console.error("[performance templates] fetch failed", err);
      setError(err?.message || "Failed to load templates.");
    } finally {
      setLoading(false);
    }
  }

  const openCreate = () => {
    setForm({
      id: undefined,
      name: "",
      description: "",
      questions: [defaultQuestion()],
    });
    setDialogOpen(true);
  };

  const openEdit = (tpl: ReviewTemplate) => {
    setForm({
      id: tpl.id,
      name: tpl.name,
      description: tpl.description ?? "",
      questions: tpl.questions?.length ? tpl.questions : [defaultQuestion()],
    });
    setDialogOpen(true);
  };

  const updateQuestion = (id: string, patch: Partial<ReviewQuestion>) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === id ? { ...q, ...patch } : q
      ),
    }));
  };

  const addQuestion = () => {
    setForm((prev) => ({
      ...prev,
      questions: [...prev.questions, defaultQuestion()],
    }));
  };

  const removeQuestion = (id: string) => {
    setForm((prev) => ({
      ...prev,
      questions: prev.questions.length > 1 ? prev.questions.filter((q) => q.id !== id) : prev.questions,
    }));
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
        questions: form.questions.map((q) => ({
          ...q,
          options:
            q.type === "SELECT"
              ? (q.options || []).filter(Boolean)
              : undefined,
        })),
      };
      if (form.id) {
        await api.patch(`/performance/templates/${form.id}`, payload);
      } else {
        await api.post(`/performance/templates`, payload);
      }
      setDialogOpen(false);
      await fetchTemplates();
    } catch (err: any) {
      console.error("[performance templates] save failed", err);
      setError(err?.message || "Failed to save template.");
    } finally {
      setSaving(false);
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
        <div className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Performance · Templates
              </p>
              <h1 className="text-2xl font-semibold text-slate-900">
                Review templates
              </h1>
              <p className="text-sm text-slate-600">
                Standardize review questions for your teams.
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
              You do not have access to performance templates.
            </div>
          ) : loading ? (
            renderSkeleton()
          ) : templates.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-6 text-sm text-slate-600 shadow-sm">
              No templates yet. Create your first template to standardize reviews.
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {templates.map((tpl) => (
                <div
                  key={tpl.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900">
                        {tpl.name}
                      </h3>
                      <p className="text-xs text-slate-600">
                        {tpl.description || "No description"}
                      </p>
                    </div>
                    {isManager && (
                      <button
                        onClick={() => openEdit(tpl)}
                        className="rounded-md border border-slate-200 px-2 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                        type="button"
                      >
                        Edit
                      </button>
                    )}
                  </div>
                  <div className="mt-3 text-xs text-slate-600">
                    {tpl.questions?.length || 0} questions
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Dialog */}
        {dialogOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="h-[90vh] w-full max-w-3xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-semibold text-slate-900">
                    {form.id ? "Edit template" : "New template"}
                  </h2>
                  <p className="text-xs text-slate-600">
                    Define the questions that will be used in reviews.
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
                    placeholder="Mid-year review template"
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
                    placeholder="Optional description for your template."
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-semibold text-slate-900">Questions</h3>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                    >
                      Add question
                    </button>
                  </div>

                  <div className="space-y-3">
                    {form.questions.map((q, idx) => (
                      <div
                        key={q.id}
                        className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 space-y-2"
                      >
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>Question {idx + 1}</span>
                          {form.questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => removeQuestion(q.id)}
                              className="text-rose-600 hover:underline"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-medium text-slate-700">
                            Label
                          </label>
                          <input
                            value={q.label}
                            onChange={(e) =>
                              updateQuestion(q.id, { label: e.target.value })
                            }
                            className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            placeholder="What should this person keep doing?"
                            required
                          />
                        </div>
                        <div className="grid gap-3 md:grid-cols-2">
                          <div className="space-y-1">
                            <label className="text-xs font-medium text-slate-700">
                              Type
                            </label>
                            <select
                              value={q.type}
                              onChange={(e) =>
                                updateQuestion(q.id, {
                                  type: e.target.value as QuestionType,
                                  options:
                                    e.target.value === "SELECT"
                                      ? q.options ?? []
                                      : undefined,
                                })
                              }
                              className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              {questionTypes.map((t) => (
                                <option key={t} value={t}>
                                  {t}
                                </option>
                              ))}
                            </select>
                          </div>

                          {q.type === "SELECT" && (
                            <div className="space-y-1">
                              <label className="text-xs font-medium text-slate-700">
                                Options (comma separated)
                              </label>
                              <input
                                value={(q.options || []).join(", ")}
                                onChange={(e) =>
                                  updateQuestion(q.id, {
                                    options: e.target.value
                                      .split(",")
                                      .map((v) => v.trim())
                                      .filter(Boolean),
                                  })
                                }
                                className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                                placeholder="Yes,No,Maybe"
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
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
    </AuthGate>
  );
}
