// src/app/onboarding/templates/new/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import { API_BASE_URL } from "@/lib/api";
import { logSubmission } from "@/lib/submissions";

type AssigneeType = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

type AiSuggestion = {
  title: string;
  description?: string;
  assigneeType?: AssigneeType;
  when?: string;
  dueRelativeDays?: number;
};

type TaskRow = {
  id: string;
  title: string;
  description?: string;
  assigneeType: AssigneeType;
  dueRelativeDays: number;
  when?: string;
};

const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID ?? "demo-org";

export default function NewOnboardingTemplatePage() {
  const router = useRouter();

  // Template meta
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [roleHint, setRoleHint] = useState("");
  const [departmentHint, setDepartmentHint] = useState("");

  // Tasks
  const [tasks, setTasks] = useState<TaskRow[]>([]);

  // State
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleTaskChange(id: string, patch: Partial<TaskRow>) {
    setTasks((current) =>
      current.map((t) => (t.id === id ? { ...t, ...patch } : t)),
    );
  }

  function handleAddTask() {
    setTasks((current) => [
      ...current,
      {
        id: `manual-${Date.now()}-${current.length}`,
        title: "",
        description: "",
        assigneeType: "EMPLOYEE",
        dueRelativeDays: 0,
      },
    ]);
  }

  function handleRemoveTask(id: string) {
    setTasks((current) => current.filter((t) => t.id !== id));
  }

  function formatWhen(t: TaskRow) {
    if (t.when) return t.when;
    const d = t.dueRelativeDays;
    if (d === 0) return "Day 1";
    if (d === 1) return "Day 2";
    if (d === -1) return "Day before start";
    if (d < 0) return `${Math.abs(d)} days before start`;
    if (d <= 7) return `${d} days after start`;
    const weeks = Math.round(d / 7);
    return `Week ${weeks}`;
  }

  async function handleGenerateWithAI() {
    setAiError(null);

    if (!roleHint.trim() && !departmentHint.trim()) {
      setAiError("Add at least a role or department so AI has context.");
      return;
    }

    try {
      setAiLoading(true);

      const res = await fetch("/api/ai-onboarding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "template",
          employee: {
            firstName: "New hire",
            lastName: "",
            title: roleHint || undefined,
            department: departmentHint || undefined,
          },
          tasks: [],
        }),
      });

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const data = (await res.json()) as { suggestions?: AiSuggestion[] };
      const suggestions = data.suggestions ?? [];

      if (!suggestions.length) {
        setAiError("AI did not return any tasks. Try again.");
        return;
      }

      const mapped: TaskRow[] = suggestions.map((s, index) => ({
        id: `ai-${Date.now()}-${index}`,
        title: s.title || `Task ${index + 1}`,
        description: s.description ?? "",
        assigneeType: (s.assigneeType as AssigneeType) ?? "EMPLOYEE",
        dueRelativeDays:
          typeof s.dueRelativeDays === "number" ? s.dueRelativeDays : 0,
        when: s.when,
      }));

      setTasks(mapped);
    } catch (e) {
      console.error(e);
      setAiError("Something went wrong generating the AI plan.");
    } finally {
      setAiLoading(false);
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Template name is required.");
      return;
    }

    if (tasks.length === 0) {
      setError("Add or generate at least one task.");
      return;
    }

    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      roleHint: roleHint.trim() || null,
      departmentHint: departmentHint.trim() || null,
      tasks: tasks.map((t) => ({
        title: t.title.trim(),
        description: t.description?.trim() || null,
        assigneeType: t.assigneeType,
        dueRelativeDays: t.dueRelativeDays,
      })),
    };

    // 🔹 Log attempt to Obsession
    await logSubmission({
      action: "create_onboarding_template",
      status: "ATTEMPTED",
      payload,
    });

    try {
      setSubmitting(true);

      const res = await fetch(`${API_BASE_URL}/onboarding/templates`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-org-id": ORG_ID,
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const text = await res.text().catch(() => "");
        throw new Error(`HTTP ${res.status} ${text}`);
      }

      const created = (await res.json()) as { id?: string };

      // 🔹 Log success
      await logSubmission({
        action: "create_onboarding_template",
        status: "SUCCESS",
        payload,
      });

      if (created?.id) {
        router.push(`/onboarding/templates`);
      } else {
        router.push("/onboarding/templates");
      }
    } catch (e: any) {
      const message = e?.message || "Failed to create onboarding template.";
      console.error(e);
      setError(message);

      // 🔹 Log failure
      await logSubmission({
        action: "create_onboarding_template",
        status: "FAILED",
        payload,
        error: message,
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <button
              type="button"
              onClick={() => router.push("/onboarding/templates")}
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to templates
            </button>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              New onboarding template
            </h1>
            <p className="text-sm text-slate-600">
              Design a reusable 30–90 day plan for a role or department, then
              apply it to new hires.
            </p>
          </div>
        </header>

        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]"
        >
          {/* LEFT: configuration */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
            {error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Template name
              </label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Senior AE – US, Engineering – Senior IC, etc."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Description (optional)
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="When to use this template, what it covers, any nuances for managers."
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Role / title hint
                </label>
                <input
                  value={roleHint}
                  onChange={(e) => setRoleHint(e.target.value)}
                  placeholder="Senior AE, Staff Engineer, CS Manager..."
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Department hint
                </label>
                <input
                  value={departmentHint}
                  onChange={(e) => setDepartmentHint(e.target.value)}
                  placeholder="Sales, Engineering, CS..."
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Plan generation
                  </h2>
                  <p className="text-xs text-slate-500">
                    Use AI to propose a role-specific 30–90 day plan, then
                    refine the tasks.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={aiLoading}
                  className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {aiLoading ? "Generating…" : "Generate with AI"}
                </button>
              </div>

              {aiError && (
                <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
                  {aiError}
                </div>
              )}
            </div>

            <div className="pt-2">
              <button
                type="button"
                onClick={handleAddTask}
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                + Add manual task
              </button>
            </div>

            <div className="border-t border-slate-100 pt-4 text-[11px] text-slate-500">
              Apply this template from{" "}
              <span className="font-semibold">Onboarding → New flow</span> for
              specific hires.
            </div>
          </section>

          {/* RIGHT: task editor / preview */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-950/95 p-5 text-xs text-slate-100 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Template tasks
                </h2>
                <p className="text-[11px] text-slate-400">
                  Define the key milestones and owners across the first 30–90
                  days.
                </p>
              </div>
              <div className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-200">
                {tasks.length} tasks
              </div>
            </div>

            {aiLoading && (
              <div className="space-y-3">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-2xl border border-slate-800 bg-slate-900/70 p-3"
                  >
                    <div className="mt-1 h-6 w-6 rounded-full bg-slate-800" />
                    <div className="flex-1 space-y-2">
                      <div className="h-3 w-40 rounded bg-slate-800" />
                      <div className="h-3 w-64 rounded bg-slate-900" />
                      <div className="h-3 w-32 rounded bg-slate-900" />
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!aiLoading && tasks.length === 0 && (
              <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900/60 p-4 text-[11px] text-slate-300">
                <p className="font-medium text-slate-100">
                  No tasks yet — generate a plan with AI or add tasks manually.
                </p>
                <p className="mt-1">
                  Think in terms of milestones: Day 1, Week 1, Month 1, end of
                  90 days. What should the hire see, do, and ship?
                </p>
              </div>
            )}

            {!aiLoading && tasks.length > 0 && (
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="flex gap-3 rounded-2xl border border-slate-800 bg-gradient-to-r from-slate-900 to-slate-950 p-3"
                  >
                    {/* Timeline dot / line */}
                    <div className="flex flex-col items-center">
                      <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-500 text-[11px] font-semibold text-white">
                        {index + 1}
                      </div>
                      {index < tasks.length - 1 && (
                        <div className="mt-1 h-full w-px flex-1 bg-slate-800" />
                      )}
                    </div>

                    {/* Card content */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) =>
                            handleTaskChange(task.id, {
                              title: e.target.value,
                            })
                          }
                          className="w-full flex-1 rounded-md border border-slate-700 bg-slate-900 px-2 py-1.5 text-xs font-medium text-slate-50 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-100">
                          {formatWhen(task)}
                        </span>
                      </div>

                      <textarea
                        rows={2}
                        value={task.description ?? ""}
                        onChange={(e) =>
                          handleTaskChange(task.id, {
                            description: e.target.value,
                          })
                        }
                        placeholder="Optional description"
                        className="w-full rounded-md border border-slate-800 bg-slate-950 px-2 py-1.5 text-[11px] text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />

                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-[11px]">
                          <span className="text-slate-400">Assignee</span>
                          <select
                            value={task.assigneeType}
                            onChange={(e) =>
                              handleTaskChange(task.id, {
                                assigneeType: e.target
                                  .value as AssigneeType,
                              })
                            }
                            className="rounded-full border border-slate-700 bg-slate-950 px-2 py-0.5 text-[11px] text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          >
                            <option value="EMPLOYEE">Employee</option>
                            <option value="MANAGER">Manager</option>
                            <option value="HR">HR / People</option>
                            <option value="OTHER">Other</option>
                          </select>
                        </div>

                        <div className="flex items-center gap-2 text-[11px] text-slate-300">
                          <span>Relative due</span>
                          <input
                            type="number"
                            value={task.dueRelativeDays}
                            onChange={(e) =>
                              handleTaskChange(task.id, {
                                dueRelativeDays: Number(
                                  e.target.value || 0,
                                ),
                              })
                            }
                            className="w-16 rounded-md border border-slate-700 bg-slate-950 px-2 py-1 text-[11px] text-slate-100 shadow-sm focus:border-indigo-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                          <span className="text-slate-500">
                            days from start
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Remove */}
                    <button
                      type="button"
                      onClick={() => handleRemoveTask(task.id)}
                      className="mt-1 text-[11px] text-slate-500 hover:text-red-400"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-slate-800 pt-4 flex items-center justify-between gap-3 text-[11px]">
              <p className="text-slate-400">
                Templates are reusable — assign them to new hires from the
                Onboarding workspace.
              </p>
              <button
                type="submit"
                disabled={submitting || tasks.length === 0 || !name.trim()}
                className="rounded-full bg-indigo-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create template"}
              </button>
            </div>
          </section>
        </form>
      </main>
    </AuthGate>
  );
}
