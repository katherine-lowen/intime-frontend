// src/app/employee/tasks/page.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Task = {
  id: string;
  title: string;
  dueDate?: string | null;
  status?: "OPEN" | "COMPLETED" | string | null;
  category?: string | null; // onboarding vs general
};

type TasksResponse = {
  items: Task[];
};

export default function EmployeeTasksPage() {
  const [openTasks, setOpenTasks] = useState<Task[]>([]);
  const [completedTasks, setCompletedTasks] = useState<Task[]>([]);
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

  const markComplete = async (id: string) => {
    try {
      await api.patch(`/me/tasks/${id}`, { status: "COMPLETED" });
      await load();
    } catch (err: any) {
      console.error("[tasks] mark complete failed", err);
      setError(err?.message || "Failed to mark task complete.");
    }
  };

  return (
    <AuthGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My tasks</h1>
          <p className="text-sm text-slate-600">
            Onboarding and general tasks assigned to you.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Open</h2>
          {loading ? (
            <div className="space-y-2 mt-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : openTasks.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No open tasks.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {openTasks.map((t) => (
                <div
                  key={t.id}
                  className="flex items-center justify-between py-2 text-sm text-slate-800"
                >
                  <div>
                    <div className="font-medium text-slate-900">{t.title}</div>
                    <div className="text-xs text-slate-500">
                      {t.category || "General"}
                      {t.dueDate ? ` · Due ${t.dueDate}` : ""}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => markComplete(t.id)}
                    className="rounded-md border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-[11px] font-medium text-emerald-700 hover:bg-emerald-100"
                  >
                    Mark complete
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">Completed</h2>
          </div>
          {loading ? (
            <div className="space-y-2 mt-3">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-10 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : completedTasks.length === 0 ? (
            <p className="mt-2 text-sm text-slate-500">No completed tasks yet.</p>
          ) : (
            <div className="mt-3 divide-y divide-slate-100">
              {completedTasks.map((t) => (
                <div key={t.id} className="py-2 text-sm text-slate-800">
                  <div className="font-medium text-slate-900">{t.title}</div>
                  <div className="text-xs text-slate-500">
                    {t.category || "General"}
                    {t.dueDate ? ` · Due ${t.dueDate}` : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
