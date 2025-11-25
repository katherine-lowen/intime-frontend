// src/components/onboarding-checklist.tsx
"use client";

import { useState } from "react";
import api from "@/lib/api";

type ChecklistStatus = "PENDING" | "DONE" | "SKIPPED";

export type ChecklistTask = {
  id: string;
  label: string;
  status: ChecklistStatus;
  dueDate?: string | null;
  completedAt?: string | null;
};

export type ChecklistEmployee = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  onboardingStatus: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
};

type AiSuggestion = {
  title: string;
  description?: string;
  assigneeType?: "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";
  when?: string;
};

export default function OnboardingChecklist({
  employee,
  initialTasks,
}: {
  employee: ChecklistEmployee;
  initialTasks: ChecklistTask[];
}) {
  const [tasks, setTasks] = useState<ChecklistTask[]>(initialTasks);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState<string | null>(null);
  const [aiSuggestions, setAiSuggestions] = useState<AiSuggestion[]>([]);

  const fullName = `${employee.firstName} ${employee.lastName}`;

  const completed = tasks.filter((t) => t.status === "DONE").length;
  const total = tasks.length;
  const percent = total > 0 ? Math.round((completed / total) * 100) : 0;

  async function toggleTask(task: ChecklistTask) {
    if (task.status === "SKIPPED") return; // leave skipped alone

    const nextStatus: ChecklistStatus =
      task.status === "DONE" ? "PENDING" : "DONE";

    // optimistic update
    setUpdatingId(task.id);
    setTasks((current) =>
      current.map((t) =>
        t.id === task.id ? { ...t, status: nextStatus } : t,
      ),
    );

    try {
      await api.patch(`/onboarding/tasks/${task.id}`, {
        status: nextStatus === "PENDING" ? "PENDING" : "DONE",
      });
    } catch (e) {
      // revert on error
      setTasks((current) =>
        current.map((t) =>
          t.id === task.id ? { ...t, status: task.status } : t,
        ),
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleAskAi() {
    setAiError(null);
    setAiLoading(true);
    setAiSuggestions([]);

    try {
      const res = await fetch("/api/ai/onboarding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee: {
            id: employee.id,
            firstName: employee.firstName,
            lastName: employee.lastName,
            title: employee.title,
            department: employee.department,
          },
          tasks: tasks.map((t) => ({
            id: t.id,
            label: t.label,
            status: t.status,
          })),
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { suggestions?: AiSuggestion[] };
      setAiSuggestions(data.suggestions ?? []);
    } catch (e) {
      console.error(e);
      setAiError("AI could not generate suggestions right now.");
    } finally {
      setAiLoading(false);
    }
  }

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.2fr)]">
      {/* LEFT: checklist */}
      <section className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">
              Onboarding checklist
            </h2>
            <p className="text-xs text-slate-500">
              Track each step in {fullName}&apos;s onboarding journey.
            </p>
          </div>
          <div className="flex flex-col items-end gap-1 text-right">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">
                {completed}/{total} completed
              </span>
              <span className="inline-flex items-center rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                {percent}%
              </span>
            </div>
            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
              <div
                className="h-full rounded-full bg-indigo-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
          </div>
        </div>

        <div className="mt-4 space-y-2">
          {tasks.length === 0 ? (
            <p className="text-xs text-slate-500">
              No tasks yet. You can define tasks when creating a flow.
            </p>
          ) : (
            tasks.map((task) => {
              const isDone = task.status === "DONE";
              const isSkipped = task.status === "SKIPPED";

              return (
                <button
                  key={task.id}
                  type="button"
                  onClick={() => toggleTask(task)}
                  className={[
                    "group flex w-full items-start justify-between gap-3 rounded-xl border px-3 py-2 text-left text-xs transition",
                    isDone
                      ? "border-emerald-200 bg-emerald-50/70"
                      : isSkipped
                      ? "border-slate-200 bg-slate-50/60 opacity-70"
                      : "border-slate-200 bg-white hover:border-indigo-200 hover:bg-indigo-50/40",
                    updatingId === task.id && "opacity-60",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                  disabled={updatingId === task.id}
                >
                  <div className="flex items-start gap-2">
                    <div
                      className={[
                        "mt-0.5 flex h-4 w-4 items-center justify-center rounded border text-[10px] font-semibold",
                        isDone
                          ? "border-emerald-500 bg-emerald-500 text-white"
                          : "border-slate-300 bg-white text-slate-400 group-hover:border-indigo-400 group-hover:text-indigo-500",
                      ].join(" ")}
                    >
                      {isDone ? "✓" : ""}
                    </div>
                    <div>
                      <div
                        className={[
                          "font-medium",
                          isDone ? "text-emerald-900" : "text-slate-900",
                          isSkipped && "line-through text-slate-500",
                        ]
                          .filter(Boolean)
                          .join(" ")}
                      >
                        {task.label}
                      </div>
                      {task.dueDate && (
                        <div className="mt-0.5 text-[11px] text-slate-500">
                          Due {task.dueDate}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-end gap-1 text-[11px] text-slate-500">
                    {task.status === "SKIPPED" && (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">
                        Skipped
                      </span>
                    )}
                    {task.completedAt && (
                      <span className="text-[10px] text-slate-400">
                        Completed{" "}
                        {new Date(task.completedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
              );
            })
          )}
        </div>

        <p className="mt-3 text-[11px] text-slate-400">
          Click a task to mark it complete. Skipped tasks remain as reference.
        </p>
      </section>

      {/* RIGHT: AI + context */}
      <section className="space-y-3">
        <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 text-xs shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                AI onboarding suggestions
              </h2>
              <p className="text-xs text-slate-500">
                Ask AI to suggest additional tasks tailored to this role.
              </p>
            </div>
            <button
              type="button"
              onClick={handleAskAi}
              disabled={aiLoading}
              className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {aiLoading ? "Thinking…" : "Ask AI"}
            </button>
          </div>

          {aiError && (
            <div className="mt-3 rounded-md border border-red-200 bg-red-50 px-2 py-2 text-[11px] text-red-700">
              {aiError}
            </div>
          )}

          {aiSuggestions.length === 0 && !aiError && !aiLoading && (
            <p className="mt-3 text-[11px] text-slate-500">
              AI will propose 3–6 concrete onboarding steps you might want to
              add, like extra manager check-ins or role-specific training.
            </p>
          )}

          {aiSuggestions.length > 0 && (
            <div className="mt-3 space-y-2">
              {aiSuggestions.map((s, idx) => (
                <div
                  key={`${s.title}-${idx}`}
                  className="rounded-lg border border-slate-200 bg-slate-50/80 px-3 py-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="font-semibold text-slate-900">
                      {s.title}
                    </div>
                    {s.assigneeType && (
                      <span className="rounded-full bg-slate-900 px-2 py-0.5 text-[10px] font-semibold text-slate-50">
                        {s.assigneeType.toLowerCase()}
                      </span>
                    )}
                  </div>
                  {s.description && (
                    <p className="mt-1 text-[11px] text-slate-600">
                      {s.description}
                    </p>
                  )}
                  {s.when && (
                    <p className="mt-1 text-[11px] text-slate-500">
                      Timing: {s.when}
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}

          <p className="mt-3 text-[10px] text-slate-400">
            AI suggestions are not auto-added yet — you can use them for
            inspiration as you refine your onboarding templates.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-[11px] text-slate-600">
          <div className="font-semibold text-slate-900">
            Where this is going
          </div>
          <ul className="mt-1 list-disc space-y-1 pl-4">
            <li>
              Auto-generate onboarding flows by role, team, and location.
            </li>
            <li>
              Connect tasks to documents, time off, and performance milestones.
            </li>
            <li>
              Surface at-risk onboarding journeys before they become churn.
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
}
