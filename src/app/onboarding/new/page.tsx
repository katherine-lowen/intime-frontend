// src/app/onboarding/new/page.tsx
"use client";

import { useEffect, useMemo, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

type TaskAssigneeType = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

type TaskRow = {
  id: string;
  title: string;
  description?: string;
  assigneeType: TaskAssigneeType;
  dueRelativeDays: number;
};

type CreateFlowBody = {
  employeeId: string;
  startDate?: string | null;
  targetDate?: string | null;
  tasks: {
    title: string;
    description?: string;
    assigneeType?: TaskAssigneeType;
    dueRelativeDays?: number;
  }[];
};

function makeDefaultTasks(): TaskRow[] {
  return [
    {
      id: "t-1",
      title: "Sign offer letter & HR docs",
      description: "Collect signed paperwork and policy acks.",
      assigneeType: "EMPLOYEE",
      dueRelativeDays: 0,
    },
    {
      id: "t-2",
      title: "Manager 1:1 and team intro",
      description: "Schedule first 1:1 and team intro meeting.",
      assigneeType: "MANAGER",
      dueRelativeDays: 1,
    },
    {
      id: "t-3",
      title: "Systems & access set-up",
      description: "Grant access to tools, email, and core systems.",
      assigneeType: "HR",
      dueRelativeDays: -2,
    },
    {
      id: "t-4",
      title: "First-week goals",
      description: "Define clear expectations for week 1.",
      assigneeType: "MANAGER",
      dueRelativeDays: 3,
    },
  ];
}

export default function NewOnboardingFlowPage() {
  const router = useRouter();
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [employeeId, setEmployeeId] = useState("");
  const [startDate, setStartDate] = useState<string>("");
  const [targetDate, setTargetDate] = useState<string>("");
  const [tasks, setTasks] = useState<TaskRow[]>(() => makeDefaultTasks());

  // Load employees for dropdown
  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoadingEmployees(true);
        const data = await api.get<Employee[]>("/employees");
        if (!cancelled) {
          setEmployees(data);
        }
      } catch (e) {
        if (!cancelled) {
          setError("Failed to load employees");
        }
      } finally {
        if (!cancelled) {
          setLoadingEmployees(false);
        }
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
        id: `t-${current.length + 1}-${Date.now()}`,
        title: "",
        assigneeType: "EMPLOYEE",
        dueRelativeDays: 0,
      },
    ]);
  }

  function handleRemoveTask(id: string) {
    setTasks((current) => current.filter((t) => t.id !== id));
  }

  function handleUseDefaults() {
    setTasks(makeDefaultTasks());
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!employeeId) {
      setError("Select an employee to start onboarding.");
      return;
    }

    const body: CreateFlowBody = {
      employeeId,
      startDate: startDate || null,
      targetDate: targetDate || null,
      tasks: tasks
        .filter((t) => t.title.trim().length > 0)
        .map((t) => ({
          title: t.title.trim(),
          description: t.description?.trim() || undefined,
          assigneeType: t.assigneeType,
          dueRelativeDays: Number.isNaN(t.dueRelativeDays)
            ? undefined
            : t.dueRelativeDays,
        })),
    };

    try {
      setSubmitting(true);
      const created = await api.post<{ id: string }>("/onboarding/flows", body);
      router.push(`/onboarding/${created.id}`);
    } catch (e) {
      console.error(e);
      setError("Something went wrong creating the onboarding flow.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-4xl flex-col gap-6 px-6 py-8">
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/onboarding"
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to Onboarding
            </Link>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              Start onboarding
            </h1>
            <p className="text-sm text-slate-600">
              Create a structured onboarding flow for a new hire.
            </p>
          </div>

          {selectedEmployee && (
            <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-700">
              <div className="font-semibold">
                {selectedEmployee.firstName} {selectedEmployee.lastName}
              </div>
              <div>
                {selectedEmployee.title ?? "—"}{" "}
                {selectedEmployee.department
                  ? `• ${selectedEmployee.department}`
                  : ""}
              </div>
            </div>
          )}
        </header>

        <form
          onSubmit={handleSubmit}
          className="space-y-6 rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm"
        >
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </div>
          )}

          {/* Employee & dates */}
          <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
            <div className="space-y-2">
              <label className="text-xs font-medium text-slate-700">
                Employee
              </label>
              <select
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
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
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Tasks editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Tasks
                </h2>
                <p className="text-xs text-slate-500">
                  Define the key steps for this onboarding flow.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={handleUseDefaults}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
                >
                  Use recommended template
                </button>
                <button
                  type="button"
                  onClick={handleAddTask}
                  className="rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-indigo-700"
                >
                  + Add task
                </button>
              </div>
            </div>

            <div className="space-y-3">
              {tasks.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No tasks yet. Click &ldquo;Add task&rdquo; to get started.
                </p>
              ) : (
                tasks.map((task, index) => (
                  <div
                    key={task.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/70 p-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                            Task {index + 1}
                          </span>
                        </div>
                        <input
                          type="text"
                          value={task.title}
                          onChange={(e) =>
                            handleTaskChange(task.id, {
                              title: e.target.value,
                            })
                          }
                          placeholder="Task title"
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <textarea
                          value={task.description ?? ""}
                          onChange={(e) =>
                            handleTaskChange(task.id, {
                              description: e.target.value,
                            })
                          }
                          placeholder="Optional description"
                          rows={2}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <div className="flex flex-wrap items-center gap-3">
                          <div className="space-y-1">
                            <div className="text-[11px] font-medium text-slate-600">
                              Assignee
                            </div>
                            <select
                              value={task.assigneeType}
                              onChange={(e) =>
                                handleTaskChange(task.id, {
                                  assigneeType: e
                                    .target.value as TaskAssigneeType,
                                })
                              }
                              className="rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                            >
                              <option value="EMPLOYEE">Employee</option>
                              <option value="MANAGER">Manager</option>
                              <option value="HR">HR / People</option>
                              <option value="OTHER">Other</option>
                            </select>
                          </div>

                          <div className="space-y-1">
                            <div className="text-[11px] font-medium text-slate-600">
                              Due relative to start date
                            </div>
                            <div className="flex items-center gap-1 text-xs">
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
                                className="w-20 rounded-md border border-slate-200 bg-white px-2 py-1.5 text-xs text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <span className="text-[11px] text-slate-500">
                                days from start (negative = before)
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleRemoveTask(task.id)}
                        className="mt-1 text-[11px] text-slate-400 hover:text-red-500"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
            <p className="text-[11px] text-slate-500">
              You can always edit tasks from the onboarding checklist later.
            </p>
            <div className="flex items-center gap-2">
              <Link
                href="/onboarding"
                className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={submitting}
                className="rounded-full bg-indigo-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {submitting ? "Creating…" : "Create flow"}
              </button>
            </div>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
