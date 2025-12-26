"use client";

import { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type OnboardingFlowDetail = {
  id: string;
  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email: string | null;
    department?: string | null;
    title?: string | null;
    manager?: { id: string; name: string } | null;
  };
  template: {
    id: string;
    name: string;
    description?: string | null;
  } | null;
  startDate: string | null;
  progressPercent: number;
  completedCount: number;
  totalTasks: number;
  tasks: OnboardingTaskInstance[];
};

type OnboardingTaskInstance = {
  id: string;
  title: string;
  description?: string | null;
  status: "OPEN" | "COMPLETED" | string;
  dueDate: string | null;
  assigneeType?: string | null;
  assigneeId?: string | null;
};

function formatDate(date?: string | null) {
  if (!date) return "—";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function statusStyles(status: string) {
  const normalized = status.toUpperCase();
  if (normalized === "COMPLETED") {
    return "border-emerald-100 bg-emerald-50 text-emerald-700";
  }
  return "border-slate-200 bg-slate-50 text-slate-700";
}

export default function OnboardingFlowPage({
  params,
}: {
  params: Promise<{ flowId: string }>;
}) {
  const { flowId } = use(params);
  const [flow, setFlow] = useState<OnboardingFlowDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const initials = useMemo(() => {
    if (!flow?.employee) return "??";
    const { firstName, lastName } = flow.employee;
    return `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "??";
  }, [flow?.employee]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await api.get<OnboardingFlowDetail>(`/onboarding/flows/${flowId}`);
        if (!cancelled) setFlow(data ?? null);
        if (!data && !cancelled) setError("We could not find this onboarding flow.");
      } catch (err: any) {
        console.error("[onboarding flow] load failed", err);
        if (!cancelled) setError(err?.message || "We could not find this onboarding flow.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (flowId) void load();
    return () => {
      cancelled = true;
    };
  }, [flowId]);

  const employeeName = flow
    ? `${flow.employee.firstName ?? ""} ${flow.employee.lastName ?? ""}`.trim()
    : "Employee";

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        <div className="text-xs text-slate-500">
          <Link href="/onboarding" className="hover:text-slate-700">
            Onboarding
          </Link>{" "}
          <span className="text-slate-300">→</span>{" "}
          <span className="text-slate-900">Flow</span>
        </div>

        {error && (
          <div className="rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {error}
          </div>
        )}

        {loading ? (
          <div className="space-y-3">
            <div className="h-12 w-64 rounded-lg bg-slate-100" />
            <div className="h-24 rounded-2xl bg-slate-100" />
            <div className="h-64 rounded-2xl bg-slate-100" />
          </div>
        ) : flow ? (
          <>
            {/* Header */}
            <section className="flex flex-col gap-2 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-sm font-semibold text-slate-700">
                  {initials}
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-slate-900">
                    Onboarding for {employeeName}
                  </h1>
                  <p className="text-sm text-slate-600">
                    {flow.employee.title || "—"}{" "}
                    {flow.employee.department ? `· ${flow.employee.department}` : ""}
                  </p>
                  {flow.template && (
                    <p className="text-xs text-slate-500">
                      Template: {flow.template.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                {flow.startDate && <span>Start date: {formatDate(flow.startDate)}</span>}
                <span>
                  Progress: {flow.completedCount}/{flow.totalTasks} tasks
                </span>
              </div>
            </section>

            {/* Progress */}
            <FlowContent flowId={flowId} flow={flow} employeeName={employeeName} />
          </>
        ) : null}
      </main>
    </AuthGate>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 text-xs">
      <span className="text-slate-500">{label}</span>
      <span className="text-slate-800">{value ?? "—"}</span>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                           CLIENT TASKS/PROGRESS UI                         */
/* -------------------------------------------------------------------------- */

function FlowContent({
  flowId,
  flow,
  employeeName,
}: {
  flowId: string;
  flow: OnboardingFlowDetail;
  employeeName: string;
}) {
  const [tasks, setTasks] = useState<OnboardingTaskInstance[]>(flow.tasks || []);
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [taskError, setTaskError] = useState<string | null>(null);

  const progress = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter(
      (t) => t.status?.toUpperCase() === "COMPLETED"
    ).length;
    const percent = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percent };
  }, [tasks]);

  const updateTaskField = async (
    taskId: string,
    payload: Partial<OnboardingTaskInstance>
  ) => {
    setTaskError(null);
    setSavingTaskId(taskId);
    const prev = tasks;
    setTasks((curr) =>
      curr.map((t) => (t.id === taskId ? { ...t, ...payload } : t))
    );
    try {
      await api.patch(`/onboarding/flows/${flowId}/tasks/${taskId}`, payload);
    } catch (err: any) {
      console.error("[onboarding task update] failed", err);
      setTaskError(err?.message || "Failed to update task.");
      setTasks(prev);
    } finally {
      setSavingTaskId(null);
    }
  };

  const toggleStatus = (task: OnboardingTaskInstance) => {
    const nextStatus =
      task.status?.toUpperCase() === "COMPLETED" ? "OPEN" : "COMPLETED";
    void updateTaskField(task.id, { status: nextStatus });
  };

  const handleDueChange = (task: OnboardingTaskInstance, value: string) => {
    const iso = value ? new Date(value).toISOString() : null;
    void updateTaskField(task.id, { dueDate: iso });
  };

  const handleAssigneeChange = (
    task: OnboardingTaskInstance,
    value: string
  ) => {
    void updateTaskField(task.id, { assigneeType: value || null });
  };

  return (
    <>
      {/* Progress */}
      <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Progress
            </p>
            <p className="text-2xl font-semibold text-slate-900">
              {progress.percent}%
            </p>
            <p className="text-xs text-slate-500">
              {progress.completed} of {progress.total} tasks completed.
            </p>
          </div>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${progress.percent}%` }}
          />
        </div>
        {taskError && (
          <p className="mt-2 text-[11px] text-rose-600">{taskError}</p>
        )}
      </section>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.2fr)]">
        {/* Tasks */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Onboarding tasks
              </h2>
              <p className="text-xs text-slate-500">
                Track each task’s status, assignee, and due date.
              </p>
            </div>
          </div>
          <div className="space-y-3">
            {tasks.map((task) => {
              const prettyStatus =
                task.status?.toUpperCase() === "COMPLETED" ? "Completed" : "Open";
              const isCompleted = task.status?.toUpperCase() === "COMPLETED";
              const due = task.dueDate ? new Date(task.dueDate) : null;
              const overdue =
                !isCompleted && due && due.getTime() < Date.now();
              const dateInputValue = due
                ? new Date(
                    Date.UTC(
                      due.getUTCFullYear(),
                      due.getUTCMonth(),
                      due.getUTCDate()
                    )
                  )
                    .toISOString()
                    .slice(0, 10)
                : "";

              return (
                <div
                  key={task.id}
                  className={`rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm ${
                    savingTaskId === task.id ? "opacity-70" : ""
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">
                        {task.title}
                      </p>
                      {task.assigneeType && (
                        <p className="text-[11px] text-slate-500">
                          Assignee: {task.assigneeType}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium ${statusStyles(
                          task.status
                        )}`}
                      >
                        {prettyStatus}
                      </span>
                      <button
                        type="button"
                        onClick={() => toggleStatus(task)}
                        disabled={savingTaskId === task.id}
                        className="text-[11px] font-medium text-indigo-600 hover:underline disabled:opacity-60"
                      >
                        {isCompleted ? "Mark as open" : "Mark as complete"}
                      </button>
                    </div>
                  </div>
                  {task.description && (
                    <p className="mt-2 text-xs text-slate-600">
                      {task.description}
                    </p>
                  )}
                  <div className="mt-3 grid gap-3 text-[11px] text-slate-600 sm:grid-cols-3">
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Due date
                      </label>
                      <input
                        type="date"
                        value={dateInputValue}
                        onChange={(e) => handleDueChange(task, e.target.value)}
                        disabled={savingTaskId === task.id}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                      />
                      {overdue && (
                        <span className="text-[11px] font-semibold text-rose-600">
                          Overdue
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
                        Assignee
                      </label>
                      <select
                        value={task.assigneeType || ""}
                        onChange={(e) => handleAssigneeChange(task, e.target.value)}
                        disabled={savingTaskId === task.id}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-xs focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100 disabled:opacity-60"
                      >
                        <option value="">Unassigned</option>
                        <option value="EMPLOYEE">Employee</option>
                        <option value="MANAGER">Manager</option>
                        <option value="OTHER">Other</option>
                      </select>
                    </div>
                    <div className="flex flex-col justify-end text-[11px] text-slate-500">
                      <div>
                        {task.dueDate
                          ? `Due ${formatDate(task.dueDate)}`
                          : "No due date"}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            {tasks.length === 0 && (
              <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-3 py-4 text-xs text-slate-500">
                No tasks for this flow.
              </div>
            )}
          </div>
        </section>

        {/* Meta */}
        <div className="space-y-4">
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">
              Employee details
            </h3>
            <dl className="mt-3 space-y-2 text-sm text-slate-700">
              <Row label="Name" value={employeeName} />
              <Row
                label="Email"
                value={
                  flow.employee.email ? (
                    <a
                      href={`mailto:${flow.employee.email}`}
                      className="text-indigo-600 hover:underline"
                    >
                      {flow.employee.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
              <Row label="Department" value={flow.employee.department || "—"} />
              <Row label="Title" value={flow.employee.title || "—"} />
              <Row
                label="Manager"
                value={
                  flow.employee.manager?.name ? (
                    flow.employee.manager.id ? (
                      <Link
                        href={`/people/${flow.employee.manager.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        {flow.employee.manager.name}
                      </Link>
                    ) : (
                      flow.employee.manager.name
                    )
                  ) : (
                    "—"
                  )
                }
              />
              <Row
                label="Profile"
                value={
                  flow.employee.id ? (
                    <Link
                      href={`/people/${flow.employee.id}`}
                      className="text-indigo-600 hover:underline"
                    >
                      View profile
                    </Link>
                  ) : (
                    "—"
                  )
                }
              />
            </dl>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <h3 className="text-sm font-semibold text-slate-900">
              Template details
            </h3>
            {flow.template ? (
              <div className="mt-2 space-y-2 text-sm text-slate-700">
                <div className="font-semibold text-slate-900">
                  {flow.template.name}
                </div>
                {flow.template.description && (
                  <p className="text-xs text-slate-600">
                    {flow.template.description}
                  </p>
                )}
                <p className="text-xs text-slate-500">
                  {tasks.length} tasks
                </p>
              </div>
            ) : (
              <p className="mt-2 text-xs text-slate-500">
                No template linked to this flow.
              </p>
            )}
          </section>
        </div>
      </div>
    </>
  );
}
