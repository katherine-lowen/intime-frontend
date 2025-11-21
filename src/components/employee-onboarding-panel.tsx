// src/components/employee-onboarding-panel.tsx
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

type OnboardingTask = {
  id: string;
  title: string;
  status?: string | null; // e.g. "PENDING" | "COMPLETED"
  dueDate?: string | null;
  completedAt?: string | null;
  ownerLabel?: string | null; // e.g. "Manager", "HR", "IT"
};

type OnboardingSummary = {
  employeeId: string;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETE" | string;
  tasks: OnboardingTask[];
};

type Props = {
  employeeId: string;
};

export default function EmployeeOnboardingPanel({ employeeId }: Props) {
  const [data, setData] = useState<OnboardingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await api.get<OnboardingSummary>(
          `/onboarding/${employeeId}`,
        );
        if (!cancelled) setData(res);
      } catch (err) {
        console.error("Failed to load onboarding for employee", err);
        if (!cancelled) setError("Failed to load onboarding");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const status = data?.status ?? "NOT_STARTED";
  const tasks = data?.tasks ?? [];

  const completedCount = tasks.filter(
    (t) => !!t.completedAt || t.status === "COMPLETED",
  ).length;
  const totalCount = tasks.length;
  const hasTasks = totalCount > 0;

  function statusLabel() {
    switch (status) {
      case "NOT_STARTED":
        return "Not started";
      case "IN_PROGRESS":
        return "In progress";
      case "COMPLETE":
        return "Complete";
      default:
        return status;
    }
  }

  function statusBadgeClasses() {
    switch (status) {
      case "COMPLETE":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";
      case "IN_PROGRESS":
        return "bg-indigo-50 text-indigo-700 border-indigo-200";
      case "NOT_STARTED":
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  }

  return (
    <section className="card px-4 py-4">
      <div className="mb-2 flex items-center justify-between gap-2">
        <div>
          <h2 className="section-title">Onboarding</h2>
          <p className="text-[11px] text-slate-500">
            Track this hire from offer accepted through day 1.
          </p>
        </div>

        <div
          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-medium ${statusBadgeClasses()}`}
        >
          {statusLabel()}
          {hasTasks && (
            <span className="ml-1 text-[10px] opacity-80">
              · {completedCount}/{totalCount} tasks
            </span>
          )}
        </div>
      </div>

      {loading ? (
        <p className="text-xs text-slate-500">Loading onboarding…</p>
      ) : error ? (
        <p className="text-xs text-red-600">{error}</p>
      ) : !hasTasks ? (
        <p className="text-xs text-slate-500">
          Onboarding hasn&apos;t been started for this employee yet.
        </p>
      ) : (
        <ul className="mt-2 space-y-2 text-xs">
          {tasks.map((t) => {
            const isDone =
              !!t.completedAt || t.status === "COMPLETED";

            const dueLabel = t.dueDate
              ? new Date(t.dueDate).toLocaleDateString()
              : null;

            return (
              <li
                key={t.id}
                className="flex items-start justify-between gap-2 rounded-md border border-slate-100 bg-slate-50/80 px-2.5 py-2"
              >
                <div className="flex items-start gap-2">
                  <div className="mt-0.5 h-3 w-3 flex-shrink-0 rounded-full border border-slate-400 bg-white text-[9px] text-center leading-3">
                    {isDone ? "✓" : ""}
                  </div>
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-800">
                      {t.title}
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {t.ownerLabel && (
                        <span>{t.ownerLabel}</span>
                      )}
                      {dueLabel && (
                        <span>Due {dueLabel}</span>
                      )}
                      {isDone && (
                        <span className="text-emerald-600">
                          Completed
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
