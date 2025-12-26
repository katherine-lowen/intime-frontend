"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type EmployeeTask = {
  id: string;
  title: string;
  description?: string | null;
  status: "OPEN" | "COMPLETED" | string;
  dueDate?: string | null;
  category?: string | null;
  source?: string | null;
};

type MeResponse = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
};

export default function EmployeeOnboardingPage() {
  const [me, setMe] = useState<MeResponse | null>(null);
  const [tasks, setTasks] = useState<EmployeeTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [meRes, openTasks, completedTasks] = await Promise.all([
          api.get<MeResponse>("/me"),
          api.get<EmployeeTask[]>("/me/tasks?status=OPEN"),
          api.get<EmployeeTask[]>("/me/tasks?status=COMPLETED"),
        ]);
        if (cancelled) return;
        setMe(meRes ?? null);
        const allTasks = [...(openTasks ?? []), ...(completedTasks ?? [])];
        setTasks(allTasks);
      } catch (err: any) {
        if (cancelled) return;
        console.error("[employee onboarding] load failed", err);
        setError(err?.message || "Failed to load onboarding tasks.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const onboardingTasks = useMemo(
    () =>
      tasks.filter(
        (t) =>
          t.category?.toUpperCase() === "ONBOARDING" ||
          t.source?.toUpperCase() === "ONBOARDING"
      ),
    [tasks]
  );

  const progress = useMemo(() => {
    const total = onboardingTasks.length;
    const completed = onboardingTasks.filter(
      (t) => t.status?.toUpperCase() === "COMPLETED"
    ).length;
    const percent = total === 0 ? 0 : Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [onboardingTasks]);

  const toggleTask = async (task: EmployeeTask) => {
    const nextStatus =
      task.status?.toUpperCase() === "COMPLETED" ? "OPEN" : "COMPLETED";
    setSaveError(null);
    setSavingId(task.id);
    const prev = tasks;
    setTasks((curr) =>
      curr.map((t) =>
        t.id === task.id ? { ...t, status: nextStatus } : t
      )
    );
    try {
      await api.patch(`/me/tasks/${task.id}`, { status: nextStatus });
    } catch (err: any) {
      console.error("[employee onboarding] toggle failed", err);
      setSaveError(err?.message || "Could not update task.");
      setTasks(prev);
    } finally {
      setSavingId(null);
    }
  };

  const sortedTasks = useMemo(() => {
    return [...onboardingTasks].sort((a, b) => {
      const aTime = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
      const bTime = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
      return aTime - bTime;
    });
  }, [onboardingTasks]);

  const firstName = me?.firstName || "";

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-4xl flex-col gap-5 px-6 py-8">
        {/* Hero / welcome */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-white to-slate-50 p-6 shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">
            Welcome to your first week{firstName ? `, ${firstName}` : ""}.
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            This checklist shows all of your onboarding tasks. Complete them to
            get set up with your team, tools, and benefits.
          </p>
          {/* TODO: wire AI onboarding summary when backend endpoint is ready */}
        </section>

        {/* Progress */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Onboarding progress
              </p>
              <p className="text-2xl font-semibold text-slate-900">
                {progress.percent}% complete
              </p>
              <p className="text-xs text-slate-500">
                {progress.completed} of {progress.total} tasks completed
              </p>
            </div>
          </div>
          <div className="mt-3 h-2 w-full rounded-full bg-slate-100">
            <div
              className="h-2 rounded-full bg-indigo-500 transition-all"
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          {saveError && (
            <p className="mt-2 text-[11px] text-rose-600">{saveError}</p>
          )}
        </section>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        {/* Tasks timeline */}
        <section className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Your onboarding tasks
            </h2>
            <Link
              href="/employee/tasks"
              className="text-[11px] font-medium text-indigo-600 hover:underline"
            >
              View all tasks →
            </Link>
          </div>

          {loading ? (
            <div className="mt-4 space-y-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-16 rounded-xl bg-slate-100" />
              ))}
            </div>
          ) : sortedTasks.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              You have no onboarding tasks right now.
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {sortedTasks.map((task, idx) => {
                const isCompleted = task.status?.toUpperCase() === "COMPLETED";
                const dueLabel = task.dueDate
                  ? `Due ${new Date(task.dueDate).toLocaleDateString()}`
                  : "No due date";

                return (
                  <div key={task.id} className="flex gap-3">
                    {/* timeline spine */}
                    <div className="flex flex-col items-center">
                      <div
                        className={`h-3 w-3 rounded-full border-2 ${
                          isCompleted
                            ? "border-emerald-500 bg-emerald-100"
                            : "border-slate-300 bg-white"
                        }`}
                      />
                      {idx !== sortedTasks.length - 1 && (
                        <div className="mt-1 h-full w-px flex-1 bg-slate-200" />
                      )}
                    </div>

                    {/* Task card */}
                    <div className="flex-1 rounded-xl border border-slate-200 bg-slate-50/70 px-3 py-2">
                      <div className="flex items-center justify-between gap-2">
                        <h3 className="text-sm font-medium text-slate-900">
                          {task.title}
                        </h3>
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                            isCompleted
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-slate-100 text-slate-700"
                          }`}
                        >
                          {isCompleted ? "Completed" : "To do"}
                        </span>
                      </div>
                      <div className="mt-1 text-xs text-slate-500">
                        {dueLabel}
                      </div>
                      {task.description && (
                        <p className="mt-1 text-xs text-slate-600">
                          {task.description}
                        </p>
                      )}
                      <button
                        type="button"
                        onClick={() => toggleTask(task)}
                        disabled={savingId === task.id}
                        className="mt-2 inline-flex items-center rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-60"
                      >
                        {isCompleted ? "Mark as not done" : "Mark as done"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
