// src/app/onboarding/new/page.tsx
"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import { logSubmission } from "@/lib/submissions";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

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

export default function NewOnboardingFlowPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [employeeId, setEmployeeId] = useState(
    searchParams?.get("employeeId") ?? "",
  );

  const [startDate, setStartDate] = useState("");
  const [targetDate, setTargetDate] = useState("");

  const [tasks, setTasks] = useState<TaskRow[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch employees list
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        setLoadingEmployees(true);
        const data = await api.get<Employee[]>("/employees");
        if (!cancelled) setEmployees(data);
      } catch (e) {
        if (!cancelled) setError("Failed to load employees.");
      } finally {
        if (!cancelled) setLoadingEmployees(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const selectedEmployee = useMemo(
    () => employees.find((e) => e.id === employeeId) ?? null,
    [employees, employeeId],
  );

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

    if (!selectedEmployee) {
      setAiError("Select an employee so AI can tailor the plan.");
      return;
    }

    try {
      setAiLoading(true);

      const res = await fetch("/api/ai-onboarding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mode: "flowTemplate",
          employee: {
            firstName: selectedEmployee.firstName,
            lastName: selectedEmployee.lastName,
            title: selectedEmployee.title,
            department: selectedEmployee.department,
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

    if (!employeeId) {
      setError("Select an employee to create an onboarding flow.");
      return;
    }

    if (tasks.length === 0) {
      setError("Generate or add at least one task.");
      return;
    }

    const payload = {
      employeeId,
      startDate: startDate || null,
      targetDate: targetDate || null,
      tasks: tasks.map((t) => ({
        title: t.title.trim(),
        description: t.description?.trim() || undefined,
        assigneeType: t.assigneeType,
        dueRelativeDays: t.dueRelativeDays,
      })),
    };

    setSubmitting(true);

    // 🔹 Log ATTEMPTED
    await logSubmission({
      action: "create_onboarding_flow",
      payload,
      status: "ATTEMPTED",
    });

    try {
      const created = await api.post<{ id: string }>(
        "/onboarding/flows",
        payload,
      );

      // 🔹 Log SUCCESS
      await logSubmission({
        action: "create_onboarding_flow",
        payload: { ...payload, flowId: created.id },
        status: "SUCCESS",
      });

      router.push(`/onboarding/${created.id}`);
    } catch (e: any) {
      console.error(e);
      const message = e?.message || "Failed to create onboarding flow.";
      setError(message);

      // 🔹 Log FAILED
      await logSubmission({
        action: "create_onboarding_flow",
        payload,
        status: "FAILED",
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
            <Link
              href="/onboarding"
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to Onboarding
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Create onboarding flow
            </h1>
            <p className="text-sm text-slate-600">
              Use AI to draft a 30–90 day onboarding plan, then refine it.
            </p>
          </div>

          {selectedEmployee && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <div className="font-semibold">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </div>
              <div>
                {selectedEmployee.title ?? "—"}
                {selectedEmployee.department
                  ? ` • ${selectedEmployee.department}`
                  : ""}
              </div>
            </div>
          )}
        </header>

        {/* CONTENT GRID */}
        <form
          onSubmit={handleSubmit}
          className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1.6fr)]"
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
                Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                disabled={loadingEmployees}
              >
                <option value="">
                  {loadingEmployees ? "Loading employees…" : "Select employee"}
                </option>
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.firstName} {e.lastName}
                    {e.title ? ` • ${e.title}` : ""}
                    {e.department ? ` (${e.department})` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Start date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-medium text-slate-700">
                  Target date
                </label>
                <input
                  type="date"
                  value={targetDate}
                  onChange={(e) => setTargetDate(e.target.value)}
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
                    Use AI to draft tasks, then tweak anything before saving.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleGenerateWithAI}
                  disabled={aiLoading || !employeeId}
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

              <p className="text-[11px] text-slate-500">
                AI uses the employee&apos;s role and department to propose a
                structured 30–90 day onboarding journey.
              </p>
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
              Once you&apos;re happy with the plan on the right, click{" "}
              <span className="font-semibold">Create onboarding flow</span> to
              save it.
            </div>
          </section>

          {/* RIGHT: hybrid timeline/cards preview */}
          <section className="space-y-4 rounded-2xl border border-slate-200 bg-slate-950/95 p-5 text-xs text-slate-100 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-50">
                  Onboarding plan preview
                </h2>
                <p className="text-[11px] text-slate-400">
                  Timeline-style overview with cards for each key step.
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
                  No tasks yet — generate a plan with AI.
                </p>
                <p className="mt-1">
                  You&apos;ll see a hybrid view here: a vertical timeline of
                  key moments (Day 1, Week 1, Month 1) with a card for each
                  task showing who owns it and when it should happen.
                </p>
                <p className="mt-2 text-slate-400">
                  Start by selecting an employee and clicking{" "}
                  <span className="font-semibold">Generate with AI</span> on
                  the left.
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
                Tasks are saved as a reusable onboarding flow for this employee.
              </p>
              <button
                type="submit"
                disabled={submitting || !employeeId || tasks.length === 0}
                className="rounded-full bg-indigo-500 px-4 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create onboarding flow"}
              </button>
            </div>
          </section>
        </form>
      </main>
    </AuthGate>
  );
}
