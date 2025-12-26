// src/app/employee/tasks/page.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status?: "OPEN" | "COMPLETED" | string | null;
  category?: string | null; // onboarding vs general
  source?: string | null;
};

type TasksResponse = {
  items: Task[];
};

export default function EmployeeTasksPage() {
  const [openTasks, setOpenTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
  const [statusFilter, setStatusFilter] = useState<"OPEN" | "COMPLETED">("OPEN");
  const [segmentFilter, setSegmentFilter] = useState<"ALL" | "ONBOARDING" | "OTHER">("ALL");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    try {
      setLoading(true);
      setError(null);
      const [openRes, doneRes] = await Promise.all([
        api.get<TasksResponse>("/me/tasks?status=OPEN"),
        api.get<TasksResponse>("/me/tasks?status=COMPLETED"),
      ]);
      setOpenTasks(openRes?.items ?? []);
      setCompletedTasks(doneRes?.items ?? []);
    } catch (err: any) {
      console.error("[tasks] fetch failed", err);
      setError(err?.message || "Failed to load tasks.");
      setOpenTasks([]);
      setCompletedTasks([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  const onboardingOpen = openTasks.filter((t) =>
    (t.source || t.category || "").toUpperCase().includes("ONBOARDING")
  );
  const onboardingCompleted = completedTasks.filter((t) =>
    (t.source || t.category || "").toUpperCase().includes("ONBOARDING")
  );

  const filteredTasks = useMemo(() => {
    const base = statusFilter === "OPEN" ? openTasks : completedTasks;
    if (segmentFilter === "ALL") return base;
    const isOnboarding = segmentFilter === "ONBOARDING";
    return base.filter((t) => {
      const tag = (t.source || t.category || "").toUpperCase();
      const matches = tag.includes("ONBOARDING");
      return isOnboarding ? matches : !matches;
    });
  }, [statusFilter, openTasks, completedTasks, segmentFilter]);

  const markComplete = async (id: string) => {
    try {
      await api.patch(`/me/tasks/${id}`, { status: "COMPLETED" });
      await load();
    } catch (err: any) {
      console.error("[tasks] mark complete failed", err);
      setError(err?.message || "Failed to mark task complete.");
    }
  };

  const renderBadge = (task: Task) => {
    const tag = (task.source || task.category || "").toUpperCase();
    if (tag.includes("ONBOARDING")) {
      return (
        <span className="ml-2 inline-flex items-center rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-indigo-700">
          Onboarding
        </span>
      );
    }
    return null;
  };

  return (
    <AuthGate>
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">My tasks</h1>
          <p className="text-sm text-slate-600">
            Onboarding and general tasks assigned to you.
          </p>
          {onboardingOpen.length > 0 && (
            <p className="text-xs text-slate-500">
              Welcome! Let&apos;s complete your onboarding. You have {onboardingOpen.length} onboarding tasks and{" "}
              {openTasks.length - onboardingOpen.length} other tasks.
            </p>
          )}
          {onboardingOpen.length > 0 && (
            <Link
              href="/employee/onboarding"
              className="inline-flex items-center text-[11px] font-medium text-indigo-600 hover:underline"
            >
              View onboarding checklist →
            </Link>
          )}
          {onboardingOpen.length + onboardingCompleted.length > 0 && (
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>
                Onboarding progress: {onboardingCompleted.length}/
                {onboardingOpen.length + onboardingCompleted.length}
              </span>
              <div className="h-2 w-32 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-500"
                  style={{
                    width: `${Math.round(
                      (onboardingCompleted.length /
                        Math.max(onboardingOpen.length + onboardingCompleted.length, 1)) *
                        100
                    )}%`,
                  }}
                />
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Tasks</h2>
            <div className="flex items-center gap-2">
              {(["OPEN", "COMPLETED"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => setStatusFilter(status)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    statusFilter === status
                      ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {status === "OPEN" ? "Open" : "Completed"}
                </button>
              ))}
              {(["ALL", "ONBOARDING", "OTHER"] as const).map((seg) => (
                <button
                  key={seg}
                  type="button"
                  onClick={() => setSegmentFilter(seg)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                    segmentFilter === seg
                      ? "border-slate-300 bg-slate-100 text-slate-800"
                      : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {seg === "ALL" ? "All" : seg === "ONBOARDING" ? "Onboarding" : "Other"}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : filteredTasks.length === 0 ? (
            <p className="text-sm text-slate-500">
              {statusFilter === "OPEN" ? "No open tasks." : "No completed tasks yet."}
            </p>
          ) : (
            <div className="divide-y divide-slate-100">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 text-sm text-slate-800"
                >
                  <div>
                    <div className="font-medium text-slate-900 flex items-center">
                      {t.title}
                      {renderBadge(t)}
                    </div>
                    <div className="text-xs text-slate-500">
                      {(t.category || "General") +
                        (t.dueDate ? ` · Due ${t.dueDate}` : "")}
                    </div>
                  </div>
                  {statusFilter === "OPEN" && (
                    <button
                      type="button"
                      onClick={() => markComplete(t.id)}
                      className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                    >
                      Mark complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
