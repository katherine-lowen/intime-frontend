// src/app/onboarding/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type OnboardingTask = {
  id: string;
  title: string;
  description?: string | null;
  status: "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";
  assigneeType: "EMPLOYEE" | "MANAGER" | "HR" | "OTHER";
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

type OnboardingTemplateTask = {
  id: string;
  title: string;
  description?: string | null;
  assigneeType: string;
  dueRelativeDays?: number | null;
  sortOrder?: number | null;
};

type OnboardingTemplate = {
  id: string;
  name: string;
  description?: string | null;
  department?: string | null;
  role?: string | null;
  isDefault: boolean;
  tasks: OnboardingTemplateTask[];
  createdAt: string;
};

async function getFlows(): Promise<OnboardingFlow[]> {
  return api.get<OnboardingFlow[]>("/onboarding/flows");
}

async function getTemplates(): Promise<OnboardingTemplate[]> {
  return api.get<OnboardingTemplate[]>("/onboarding/templates");
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
  });
}

function completionForFlow(flow: OnboardingFlow) {
  const total = flow.tasks?.length ?? 0;
  if (!total) return { done: 0, total: 0, percent: 0 };

  const done = flow.tasks.filter((t) => t.status === "DONE").length;
  const percent = Math.round((done / total) * 100);
  return { done, total, percent };
}

function overallCompletion(flows: OnboardingFlow[]) {
  let done = 0;
  let total = 0;
  for (const f of flows) {
    total += f.tasks?.length ?? 0;
    done += f.tasks?.filter((t) => t.status === "DONE").length ?? 0;
  }
  if (!total) return { done: 0, total: 0, percent: 0 };
  return { done, total, percent: Math.round((done / total) * 100) };
}

function upcomingStarts(flows: OnboardingFlow[], days = 7) {
  const now = new Date();
  const limit = new Date();
  limit.setDate(now.getDate() + days);

  return flows.filter((flow) => {
    const raw =
      flow.startDate ||
      flow.employee?.startDate ||
      null;

    if (!raw) return false;
    const d = new Date(raw);
    if (Number.isNaN(d.getTime())) return false;

    return d >= now && d <= limit;
  });
}

export default async function OnboardingListPage() {
  let flows: OnboardingFlow[] = [];
  let templates: OnboardingTemplate[] = [];

  try {
    [flows, templates] = await Promise.all([getFlows(), getTemplates()]);
  } catch (e) {
    console.error("Failed to load onboarding data", e);
    // Let the page render with empty arrays; error messaging inline
  }

  const activeFlows = flows.filter((f) => f.status === "ACTIVE");
  const upcoming = upcomingStarts(flows);
  const overall = overallCompletion(flows);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Onboarding
            </h1>
            <p className="text-sm text-slate-600">
              New hires, their first 30–90 days, and the checklists that keep
              everyone aligned.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/onboarding/new"
              className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
            >
              ✨ New AI onboarding plan
            </Link>
            <Link
              href="/onboarding/templates"
              className="inline-flex items-center rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
            >
              📋 Manage templates
            </Link>
          </div>
        </header>

        {/* SUMMARY STRIP */}
        <section className="grid gap-4 md:grid-cols-4">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Active onboarding flows</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {activeFlows.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Employees currently in an onboarding journey.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Overall completion</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {overall.percent}%
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              {overall.total === 0
                ? "No tasks yet across flows."
                : `${overall.done} of ${overall.total} tasks completed.`}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Starting in next 7 days</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {upcoming.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Based on employee or flow start dates.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="text-xs text-slate-500">Templates</div>
            <div className="mt-1 text-2xl font-semibold text-slate-900">
              {templates.length}
            </div>
            <p className="mt-1 text-[11px] text-slate-500">
              Reusable onboarding blueprints by role and team.
            </p>
          </div>
        </section>

        {/* MAIN LAYOUT: FLOWS + SIDE PANEL */}
        <section className="grid gap-5 lg:grid-cols-[minmax(0,1.8fr)_minmax(0,1.2fr)]">
          {/* FLOWS TABLE */}
          <div className="rounded-2xl border border-slate-200 bg-white/90 shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">
                Active onboarding flows
              </h2>
              <span className="text-[11px] text-slate-500">
                {flows.length} total flows
              </span>
            </div>

            {flows.length === 0 ? (
              <div className="px-4 py-6 text-sm text-slate-500">
                No onboarding flows yet. Start by{" "}
                <Link
                  href="/onboarding/new"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  generating an AI onboarding plan
                </Link>{" "}
                or{" "}
                <Link
                  href="/onboarding/templates"
                  className="font-medium text-indigo-600 hover:underline"
                >
                  creating a template
                </Link>
                .
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                  <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                    <tr>
                      <th className="px-4 py-2 text-left">Employee</th>
                      <th className="px-4 py-2 text-left">Role</th>
                      <th className="px-4 py-2 text-left">Status</th>
                      <th className="px-4 py-2 text-left">Start</th>
                      <th className="px-4 py-2 text-left">Progress</th>
                      <th className="px-4 py-2 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {flows.map((flow) => {
                      const { done, total, percent } = completionForFlow(flow);
                      const employee = flow.employee;
                      const name = `${employee.firstName} ${employee.lastName}`;
                      const subtitleParts: string[] = [];
                      if (employee.title) subtitleParts.push(employee.title);
                      if (employee.department)
                        subtitleParts.push(employee.department);
                      const subtitle = subtitleParts.join(" • ");

                      return (
                        <tr
                          key={flow.id}
                          className="border-b last:border-b-0 hover:bg-slate-50/70"
                        >
                          <td className="px-4 py-2">
                            <div className="font-medium text-slate-900">
                              {name}
                            </div>
                            <div className="text-xs text-slate-500">
                              {subtitle || "Team member"}
                            </div>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {employee.title ?? "—"}
                          </td>
                          <td className="px-4 py-2">
                            <span
                              className={[
                                "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                                flow.status === "ACTIVE"
                                  ? "bg-emerald-50 text-emerald-700"
                                  : flow.status === "DRAFT"
                                  ? "bg-slate-100 text-slate-700"
                                  : flow.status === "COMPLETE"
                                  ? "bg-indigo-50 text-indigo-700"
                                  : "bg-slate-50 text-slate-500",
                              ].join(" ")}
                            >
                              {flow.status.toLowerCase()}
                            </span>
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-600">
                            {formatDate(
                              flow.startDate || employee.startDate || null
                            )}
                          </td>
                          <td className="px-4 py-2 text-xs text-slate-700">
                            {total === 0 ? (
                              <span className="text-slate-500">
                                No tasks yet
                              </span>
                            ) : (
                              <>
                                {done}/{total} tasks ({percent}%)
                              </>
                            )}
                          </td>
                          <td className="px-4 py-2 text-right">
                            <Link
                  href={`/onboarding/${flow.id}`}
              className="text-xs font-medium text-indigo-600 hover:underline"
            >
               View checklist →
                            </Link>

                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* SIDE PANEL: templates & quick actions */}
          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Quick actions
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Spin up onboarding from AI or reuse your best templates.
              </p>

              <div className="mt-3 space-y-2 text-xs">
                <Link
                  href="/onboarding/new"
                  className="flex items-center justify-between rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 font-medium text-indigo-700 hover:bg-indigo-100"
                >
                  <span>✨ Generate onboarding plan with AI</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/onboarding/templates"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 font-medium text-slate-700 hover:bg-slate-100"
                >
                  <span>📋 Browse onboarding templates</span>
                  <span>→</span>
                </Link>
                <Link
                  href="/onboarding/templates/new"
                  className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 font-medium text-slate-700 hover:bg-slate-50"
                >
                  <span>➕ Create new template</span>
                  <span>→</span>
                </Link>
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Recently created templates
              </h2>
              {templates.length === 0 ? (
                <p className="mt-2 text-xs text-slate-500">
                  No templates yet. Start with a standard new-hire checklist so
                  every onboarding feels consistent.
                </p>
              ) : (
                <ul className="mt-2 space-y-2 text-xs">
                  {templates.slice(0, 4).map((t) => (
                    <li
                      key={t.id}
                      className="flex items-start justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2"
                    >
                      <div>
                        <Link
                          href={`/onboarding/templates/${t.id}`}
                          className="font-medium text-slate-900 hover:underline"
                        >
                          {t.name}
                        </Link>
                        <div className="text-[11px] text-slate-500">
                          {t.department || "All departments"}
                          {t.role ? ` • ${t.role}` : ""}
                          {t.tasks?.length
                            ? ` • ${t.tasks.length} task${
                                t.tasks.length === 1 ? "" : "s"
                              }`
                            : ""}
                        </div>
                      </div>
                      {t.isDefault && (
                        <span className="mt-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">
                          Default
                        </span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
