// src/components/onboarding-checklist.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";

type OnboardingStatus = "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";

type OnboardingTaskStatus = "PENDING" | "DONE" | "SKIPPED";

type OnboardingTask = {
  id: string;
  label: string;
  status: OnboardingTaskStatus;
  dueDate?: string | null;
  completedAt?: string | null;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  onboardingStatus: OnboardingStatus;
};

type DetailResponse = {
  employee: Employee;
  tasks: OnboardingTask[];
};

export default function OnboardingChecklist({
  employee,
  initialTasks,
}: {
  employee: Employee;
  initialTasks: OnboardingTask[];
}) {
  const [tasks, setTasks] = useState<OnboardingTask[]>(initialTasks);
  const [status, setStatus] = useState<OnboardingStatus>(
    employee.onboardingStatus,
  );
  const [adding, setAdding] = useState(false);
  const [newLabel, setNewLabel] = useState("");
  const [savingTaskId, setSavingTaskId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);

  async function refresh() {
    try {
      const data = await api.get<DetailResponse>(
        `/onboarding/${employee.id}`,
      );
      setTasks(data.tasks);
      setStatus(data.employee.onboardingStatus);
    } catch (err) {
      console.error(err);
      // keep old state; just surface a soft error
      setError("Failed to refresh onboarding data.");
    }
  }

  async function handleStart() {
    try {
      setStarting(true);
      setError(null);
      await api.post(`/onboarding/${employee.id}/start`, {});
      await refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to start onboarding.");
    } finally {
      setStarting(false);
    }
  }

  async function updateTaskStatus(id: string, nextStatus: OnboardingTaskStatus) {
    try {
      setSavingTaskId(id);
      setError(null);
      await api.patch(`/onboarding/tasks/${id}`, {
        status: nextStatus,
      });
      await refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to update task.");
    } finally {
      setSavingTaskId(null);
    }
  }

  async function handleAddTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newLabel.trim()) return;
    try {
      setAdding(true);
      setError(null);
      await api.post("/onboarding/tasks", {
        employeeId: employee.id,
        label: newLabel.trim(),
      });
      setNewLabel("");
      await refresh();
    } catch (err) {
      console.error(err);
      setError("Failed to add task.");
    } finally {
      setAdding(false);
    }
  }

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const subtitle =
    [employee.title, employee.department].filter(Boolean).join(" • ") || null;

  const hasTasks = tasks.length > 0;

  return (
    <section className="space-y-4 rounded-lg border border-slate-200 bg-white/80 p-4 shadow-sm">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">
            Onboarding checklist
          </h2>
          <p className="text-xs text-slate-500">
            Track everything that needs to happen before {fullName} is fully
            onboarded.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs">
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium text-slate-700">
            Status:
            <span className="ml-1 capitalize">
              {status.toLowerCase().replace("_", " ")}
            </span>
          </span>

          {status === "NOT_STARTED" && (
            <button
              type="button"
              onClick={handleStart}
              disabled={starting}
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
            >
              {starting ? "Starting…" : "Start onboarding"}
            </button>
          )}
        </div>
      </div>

      {subtitle && (
        <p className="text-xs text-slate-500">
          {subtitle}
        </p>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {!hasTasks && status !== "NOT_STARTED" && (
        <p className="text-sm text-slate-600">
          No tasks yet. Add tasks below to track onboarding work for this hire.
        </p>
      )}

      {hasTasks && (
        <ul className="space-y-2 text-sm">
          {tasks.map((t) => {
            const isDone = t.status === "DONE";
            const isSkipped = t.status === "SKIPPED";
            const isSaving = savingTaskId === t.id;

            let statusLabel = "Pending";
            if (isDone) statusLabel = "Done";
            if (isSkipped) statusLabel = "Skipped";

            return (
              <li
                key={t.id}
                className="flex items-start justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() =>
                        updateTaskStatus(
                          t.id,
                          isDone ? "PENDING" : "DONE",
                        )
                      }
                      className={[
                        "inline-flex h-4 w-4 items-center justify-center rounded-full border text-[10px]",
                        isDone
                          ? "border-emerald-400 bg-emerald-50 text-emerald-700"
                          : "border-slate-300 bg-white text-slate-400",
                      ].join(" ")}
                    >
                      {isDone ? "✓" : ""}
                    </button>
                    <span
                      className={
                        isDone
                          ? "font-medium text-slate-700 line-through"
                          : "font-medium text-slate-900"
                      }
                    >
                      {t.label}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                    <span>{statusLabel}</span>
                    {t.dueDate && (
                      <span>
                        • Due{" "}
                        {new Date(t.dueDate).toLocaleDateString()}
                      </span>
                    )}
                    {t.completedAt && (
                      <span>
                        • Completed{" "}
                        {new Date(t.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1 text-[11px]">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() =>
                      updateTaskStatus(
                        t.id,
                        isSkipped ? "PENDING" : "SKIPPED",
                      )
                    }
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    {isSkipped ? "Unskip" : "Skip"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {/* Add task */}
      <form
        onSubmit={handleAddTask}
        className="mt-3 flex flex-wrap items-center gap-2 border-t border-slate-100 pt-3 text-sm"
      >
        <input
          type="text"
          value={newLabel}
          onChange={(e) => setNewLabel(e.target.value)}
          placeholder="Add a task (e.g. 'Set up laptop & accounts')"
          className="min-w-0 flex-1 rounded-md border border-slate-300 px-3 py-1.5 text-sm"
        />
        <button
          type="submit"
          disabled={adding || !newLabel.trim()}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {adding ? "Adding…" : "Add task"}
        </button>
      </form>
    </section>
  );
}
