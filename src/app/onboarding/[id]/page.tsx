// src/app/onboarding/[id]/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type OnboardingTaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";
type OnboardingTaskAssignee = "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";

type OnboardingTask = {
  id: string;
  title: string;
  description?: string | null;
  status: OnboardingTaskStatus;
  assigneeType: OnboardingTaskAssignee;
  dueRelativeDays?: number | null;
  completedAt?: string | null;
};

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
  startDate?: string | null;
};

type OnboardingFlow = {
  id: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETE" | "ARCHIVED";
  startDate?: string | null;
  targetDate?: string | null;
  createdAt: string;
  employee: EmployeeLite;
  tasks: OnboardingTask[];
};

async function getFlow(id: string): Promise<OnboardingFlow | null> {
  try {
    const flow = await api.get<OnboardingFlow>(`/onboarding/flows/${id}`);
    // normalize possible undefined → null
    return flow ?? null;
  } catch (e) {
    console.error("Failed to load onboarding flow", e);
    return null;
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatRelative(d?: number | null) {
  if (d == null) return "Any time";
  if (d === 0) return "Day 1 (start date)";
  if (d === 1) return "Day 2";
  if (d === -1) return "Day before start";
  if (d < 0) return `${Math.abs(d)} days before start`;
  if (d <= 7) return `${d} days after start`;
  const weeks = Math.round(d / 7);
  return `Week ${weeks}`;
}

function assigneeLabel(a: OnboardingTaskAssignee) {
  switch (a) {
    case "EMPLOYEE":
      return "Employee";
    case "MANAGER":
      return "Manager";
    case "HR":
      return "HR / People";
    case "OTHER":
    default:
      return "Other";
  }
}

function statusChipClasses(status: OnboardingTaskStatus) {
  switch (status) {
    case "DONE":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "IN_PROGRESS":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "SKIPPED":
      return "bg-slate-50 text-slate-500 border-slate-100";
    case "PENDING":
    default:
      return "bg-amber-50 text-amber-800 border-amber-100";
  }
}

function flowStatusClasses(status: OnboardingFlow["status"]) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "DRAFT":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "COMPLETE":
      return "bg-indigo-50 text-indigo-700 border-indigo-100";
    case "ARCHIVED":
    default:
      return "bg-slate-50 text-slate-500 border-slate-100";
  }
}

export default async function OnboardingFlowPage({
  params,
}: {
  params: { id: string };
}) {
  const flow = await getFlow(params.id);

  if (!flow) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-4xl px-6 py-10">
          <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
            We couldn&apos;t find that onboarding flow. It may have been deleted.
          </div>
          <div className="mt-4">
            <Link
              href="/onboarding"
              className="text-sm font-medium text-indigo-600 hover:underline"
            >
              ← Back to Onboarding
            </Link>
          </div>
        </main>
      </AuthGate>
    );
  }

  const employee = flow.employee;
  const totalTasks = flow.tasks.length;
  const doneTasks = flow.tasks.filter((t) => t.status === "DONE").length;
  const percent =
    totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div className="space-y-1">
            <Link
              href="/onboarding"
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to Onboarding
            </Link>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Onboarding plan for {employee.firstName} {employee.lastName}
            </h1>
            <p className="text-sm text-slate-600">
              Guided 30–90 day checklist for this new hire.
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span>
                Role:{" "}
                <span className="font-medium text-slate-800">
                  {employee.title ?? "—"}
                </span>
              </span>
              <span>•</span>
              <span>
                Department:{" "}
                <span className="font-medium text-slate-800">
                  {employee.department ?? "—"}
                </span>
              </span>
              <span>•</span>
              <span>
                Start date:{" "}
                <span className="font-medium text-slate-800">
                  {formatDate(employee.startDate ?? flow.startDate ?? null)}
                </span>
              </span>
            </div>
          </div>

          <div className="space-y-2 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-xs shadow-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Flow status</span>
              <span
                className={[
                  "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium capitalize",
                  flowStatusClasses(flow.status),
                ].join(" ")}
              >
                {flow.status.toLowerCase()}
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Progress</span>
              <span className="font-semibold text-slate-900">
                {percent}% ({doneTasks}/{totalTasks || 0} tasks)
              </span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-slate-500">Target completion</span>
              <span className="font-medium text-slate-900">
                {formatDate(flow.targetDate ?? null)}
              </span>
            </div>
          </div>
        </header>

        {/* CONTENT GRID */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
          {/* LEFT: TIMELINE OF TASKS */}
          <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
            <div className="mb-3 flex items-center justify-between gap-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Checklist
              </h2>
              <span className="text-[11px] text-slate-500">
                Tasks are grouped by relative timing from start date.
              </span>
            </div>

            {flow.tasks.length === 0 ? (
              <p className="text-sm text-slate-500">
                No tasks yet on this flow. You can add tasks from the AI
                onboarding planner.
              </p>
            ) : (
              <div className="space-y-4">
                {flow.tasks
                  .slice()
                  .sort((a, b) => {
                    const aDays = a.dueRelativeDays ?? 0;
                    const bDays = b.dueRelativeDays ?? 0;
                    if (aDays !== bDays) return aDays - bDays;
                    return a.title.localeCompare(b.title);
                  })
                  .map((task, idx, all) => {
                    const relLabel = formatRelative(task.dueRelativeDays);
                    const isLast = idx === all.length - 1;
                    return (
                      <div
                        key={task.id}
                        className="flex gap-3 rounded-2xl border border-slate-100 bg-slate-50/70 p-3"
                      >
                        {/* TIMELINE DOT */}
                        <div className="flex flex-col items-center">
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-[11px] font-semibold text:white text-white">
                            {idx + 1}
                          </div>
                          {!isLast && (
                            <div className="mt-1 h-full w-px flex-1 bg-slate-200" />
                          )}
                        </div>

                        {/* CARD CONTENT */}
                        <div className="flex-1 space-y-2">
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <div>
                              <div className="text-sm font-medium text-slate-900">
                                {task.title}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                {relLabel}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1 text-[11px]">
                              <span
                                className={[
                                  "inline-flex items-center rounded-full border px-2 py-0.5 font-medium",
                                  statusChipClasses(task.status),
                                ].join(" ")}
                              >
                                {task.status.toLowerCase()}
                              </span>
                              <span className="text-slate-500">
                                Owner:{" "}
                                <span className="font-medium text-slate-800">
                                  {assigneeLabel(task.assigneeType)}
                                </span>
                              </span>
                            </div>
                          </div>

                          {task.description && (
                            <p className="text-xs text-slate-600">
                              {task.description}
                            </p>
                          )}

                          {task.completedAt && (
                            <p className="text-[11px] text-emerald-700">
                              Completed {formatDate(task.completedAt)}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
              </div>
            )}
          </div>

          {/* RIGHT: META / SUMMARY */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Summary
              </h2>
              <div className="mt-3 space-y-2 text-xs text-slate-600">
                <div className="flex items-center justify-between">
                  <span>Created</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(flow.createdAt)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Start date</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(flow.startDate ?? employee.startDate ?? null)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Target date</span>
                  <span className="font-medium text-slate-900">
                    {formatDate(flow.targetDate ?? null)}
                  </span>
                </div>
                <div className="flex items	center justify-between">
                  <span>Total tasks</span>
                  <span className="font-medium text-slate-900">
                    {totalTasks}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Completed</span>
                  <span className="font-medium text-slate-900">
                    {doneTasks}/{totalTasks || 0} ({percent}%)
                  </span>
                </div>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-xs text-slate-600 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                How this works
              </h2>
              <p className="mt-2">
                This flow was created from your AI onboarding planner and/or
                templates. Tasks are anchored to the employee&apos;s start date
                using{" "}
                <span className="font-semibold text-slate-900">
                  relative days
                </span>{" "}
                (e.g. Day 1, Week 2, 30 days after start).
              </p>
              <p className="mt-2">
                Future iterations can add checkboxes for managers to update
                status directly from this view.
              </p>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
