// src/components/ai-onboarding-plan.tsx
"use client";

import { useState, type FormEvent } from "react";

type AnyRecord = Record<string, any>;

type OnboardingPhase = {
  label: string;
  timeframe?: string;
  goals?: string[];
  tasks?: string[];
};

type OnboardingPlan = {
  headline: string;
  startDateHint?: string;
  phases: OnboardingPhase[];
};

type Props = {
  employee: AnyRecord;
  // optional extra context if you want to pass later
  roleContext?: string;
  events?: AnyRecord[];
};

export default function AiOnboardingPlan({ employee, roleContext, events }: Props) {
  const [plan, setPlan] = useState<OnboardingPlan | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingEvents, setCreatingEvents] = useState(false);
  const [createdCount, setCreatedCount] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fullName =
    (employee.firstName && employee.lastName
      ? `${employee.firstName} ${employee.lastName}`
      : employee.name || employee.fullName || employee.email) || "this employee";

  async function handleGenerate(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setPlan(null);
    setCreatedCount(null);

    try {
      const res = await fetch("/api/ai-onboarding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employee,
          roleContext,
          events,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as OnboardingPlan;
      setPlan(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong generating the plan");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateEvents() {
    if (!plan) return;

    const allTasks =
      plan.phases
        ?.flatMap((p) => p.tasks || [])
        .filter((t) => typeof t === "string" && t.trim().length > 0) || [];

    if (allTasks.length === 0) return;

    setCreatingEvents(true);
    setError(null);
    setCreatedCount(null);

    try {
      const promises = allTasks.map((task) =>
        fetch("/api/ai-suggestion-event", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ suggestion: task }),
        })
          .then(async (res) => {
            if (!res.ok) {
              const body = await res.json().catch(() => ({}));
              throw new Error(body.error || `HTTP ${res.status}`);
            }
          })
          .catch((err) => {
            console.error("Failed to create event for task", task, err);
          })
      );

      await Promise.all(promises);
      setCreatedCount(allTasks.length);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to create onboarding events");
    } finally {
      setCreatingEvents(false);
    }
  }

  return (
    <section className="space-y-4 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
            AI Onboarding Plan
          </p>
          <h2 className="text-sm font-semibold text-neutral-900">
            30/60/90 for {fullName}
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            Generate a structured plan for Day 1, first week, and first 90 days.
          </p>
        </div>

        <form onSubmit={handleGenerate} className="flex items-center gap-2">
          <button
            type="submit"
            disabled={loading}
            className="rounded-full border border-neutral-200 px-3 py-1 text-xs font-medium text-neutral-700 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating…" : plan ? "Regenerate plan" : "Generate plan"}
          </button>
        </form>
      </header>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {!plan && !loading && !error && (
        <p className="text-xs text-neutral-600">
          Use this to align {fullName.split(" ")[0] || "this employee"}, their
          manager, and People Ops on what great onboarding looks like for the
          first 90 days.
        </p>
      )}

      {plan && (
        <div className="space-y-4">
          {plan.headline && (
            <p className="text-sm font-medium text-neutral-800">
              {plan.headline}
            </p>
          )}
          {plan.startDateHint && (
            <p className="text-xs text-neutral-600">{plan.startDateHint}</p>
          )}

          <div className="space-y-4">
            {plan.phases?.map((phase, idx) => (
              <div
                key={idx}
                className="rounded-xl bg-neutral-50 px-4 py-3 text-xs text-neutral-800"
              >
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                      {phase.label}
                    </p>
                    {phase.timeframe && (
                      <p className="text-[11px] text-neutral-500">
                        {phase.timeframe}
                      </p>
                    )}
                  </div>
                </div>

                {phase.goals && phase.goals.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-neutral-600">
                      Goals
                    </p>
                    <ul className="mt-1 space-y-1">
                      {phase.goals.map((g, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-indigo-400" />
                          <span>{g}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {phase.tasks && phase.tasks.length > 0 && (
                  <div className="mt-2">
                    <p className="text-[11px] font-semibold text-neutral-600">
                      Tasks
                    </p>
                    <ul className="mt-1 space-y-1">
                      {phase.tasks.map((t, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="mt-[5px] h-1.5 w-1.5 shrink-0 rounded-full bg-neutral-400" />
                          <span>{t}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-2 border-t border-neutral-200 pt-3">
            <p className="text-[11px] text-neutral-500">
              You can tweak this plan with the manager before sharing it with{" "}
              {fullName.split(" ")[0] || "the employee"}.
            </p>
            <button
              type="button"
              disabled={creatingEvents}
              onClick={handleCreateEvents}
              className="rounded-full border border-neutral-200 bg-neutral-50 px-3 py-1 text-[11px] font-medium text-neutral-800 hover:bg-neutral-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {creatingEvents
                ? "Creating events…"
                : createdCount
                ? `Created ${createdCount} events ✓`
                : "Add tasks as events"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
