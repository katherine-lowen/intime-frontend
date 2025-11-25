// src/app/onboarding/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

type OnboardingTaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";
type OnboardingFlowStatus = "DRAFT" | "ACTIVE" | "COMPLETE" | "ARCHIVED";

type OnboardingTask = {
  id: string;
  title: string;
  description?: string | null;
  status: OnboardingTaskStatus;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

type OnboardingFlow = {
  id: string;
  status: OnboardingFlowStatus;
  startDate?: string | null;
  targetDate?: string | null;
  createdAt?: string;
  employee: Employee;
  tasks: OnboardingTask[];
};

async function getOnboardingFlows(): Promise<OnboardingFlow[]> {
  // Backend: GET /onboarding/flows
  return api.get<OnboardingFlow[]>("/onboarding/flows");
}

function taskProgress(tasks: OnboardingTask[] | undefined) {
  if (!tasks || tasks.length === 0) return { done: 0, total: 0, percent: 0 };
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const percent = Math.round((done / total) * 100);
  return { done, total, percent };
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function statusLabel(status: OnboardingFlowStatus) {
  switch (status) {
    case "DRAFT":
      return "Draft";
    case "ACTIVE":
      return "In progress";
    case "COMPLETE":
      return "Completed";
    case "ARCHIVED":
      return "Archived";
    default:
      return status;
  }
}

function statusBadgeClasses(status: OnboardingFlowStatus) {
  switch (status) {
    case "DRAFT":
      return "bg-slate-100 text-slate-700";
    case "ACTIVE":
      return "bg-emerald-100 text-emerald-700";
    case "COMPLETE":
      return "bg-indigo-100 text-indigo-700";
    case "ARCHIVED":
      return "bg-slate-100 text-slate-500";
  }
}

export const dynamic = "force-dynamic";

export default async function OnboardingListPage() {
  const flows = await getOnboardingFlows();

  // Sort by startDate (desc), then createdAt
  const sorted = [...flows].sort((a, b) => {
    const aStart = a.startDate ? new Date(a.startDate).getTime() : 0;
    const bStart = b.startDate ? new Date(b.startDate).getTime() : 0;
    if (aStart !== bStart) return bStart - aStart;
    const aCreated = a.createdAt ? new Date(a.createdAt).getTime() : 0;
    const bCreated = b.createdAt ? new Date(b.createdAt).getTime() : 0;
    return bCreated - aCreated;
  });

  const totalFlows = sorted.length;
  const activeFlows = sorted.filter((f) => f.status === "ACTIVE").length;
  const completedFlows = sorted.filter((f) => f.status === "COMPLETE").length;
  const totalTasks = sorted.reduce((sum, f) => sum + f.tasks.length, 0);
  const totalTasksDone = sorted.reduce(
    (sum, f) => sum + f.tasks.filter((t) => t.status === "DONE").length,
    0,
  );

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Onboarding
            </h1>
            <p className="text-sm text-slate-600">
              Track new hires, their first 30–90 days, and checklist progress.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="inline-flex items-center rounded-full bg-slate-100 px-3 py-1 font-medium text-slate-700">
              Onboarding workspace
            </span>
          </div>
        </header>

        {/* TOP SUMMARY STRIP */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Active flows</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {activeFlows}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              New hires currently going through onboarding.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Completed flows</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {completedFlows}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Onboarding journeys marked complete.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Tasks completed</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {totalTasksDone}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Across all onboarding flows in Intime.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Total flows</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {totalFlows}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Includes draft, active, and archived onboarding flows.
            </p>
          </div>
        </section>

        {/* TABLE */}
        <section className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2 text-left">Employee</th>
                <th className="px-3 py-2 text-left">Role</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Progress</th>
                <th className="px-3 py-2 text-left">Dates</th>
                <th className="px-3 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {sorted.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-6 text-center text-sm text-slate-500"
                  >
                    No onboarding flows yet. Start one from a new hire&apos;s
                    profile.
                  </td>
                </tr>
              ) : (
                sorted.map((flow) => {
                  const { done, total, percent } = taskProgress(flow.tasks);
                  const e = flow.employee;

                  return (
                    <tr
                      key={flow.id}
                      className="border-b last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-3 py-3 align-top">
                        <div className="font-medium text-slate-900">
                          {e.firstName} {e.lastName}
                        </div>
                        {e.email && (
                          <div className="text-xs text-slate-500">
                            {e.email}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <div className="text-xs text-slate-700">
                          {e.title ?? "—"}
                        </div>
                        {e.department && (
                          <div className="text-[11px] text-slate-500">
                            {e.department}
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top">
                        <span
                          className={[
                            "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                            statusBadgeClasses(flow.status),
                          ].join(" ")}
                        >
                          {statusLabel(flow.status)}
                        </span>
                      </td>
                      <td className="px-3 py-3 align-top">
                        {total === 0 ? (
                          <span className="text-xs text-slate-500">
                            No tasks yet
                          </span>
                        ) : (
                          <div className="flex flex-col gap-1">
                            <span className="text-xs text-slate-700">
                              {done}/{total} tasks ({percent}%)
                            </span>
                            <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                              <div
                                className="h-full rounded-full bg-indigo-500 transition-all"
                                style={{ width: `${percent}%` }}
                              />
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="px-3 py-3 align-top text-xs text-slate-600">
                        <div>
                          <span className="text-slate-400">Start:</span>{" "}
                          {formatDate(flow.startDate)}
                        </div>
                        <div>
                          <span className="text-slate-400">Target:</span>{" "}
                          {formatDate(flow.targetDate)}
                        </div>
                      </td>
                      <td className="px-3 py-3 align-top text-right">
                        <Link
                          href={`/onboarding/${flow.id}`}
                          className="text-xs font-medium text-indigo-600 hover:underline"
                        >
                          View checklist →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </main>
    </AuthGate>
  );
}
