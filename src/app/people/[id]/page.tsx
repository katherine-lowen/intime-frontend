// src/app/people/[id]/page.tsx
import api from "@/lib/api";
import EventsTimeline from "@/components/events-timeline";
import AiPeopleTimeline from "@/components/ai-people-timeline";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus;
  manager?: { id: string; firstName: string; lastName: string } | null;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

type OnboardingFlowStatus = "DRAFT" | "ACTIVE" | "COMPLETE" | "ARCHIVED";

type OnboardingTaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";

type OnboardingTask = {
  id: string;
  title: string;
  status: OnboardingTaskStatus;
};

type OnboardingFlow = {
  id: string;
  status: OnboardingFlowStatus;
  startDate?: string | null;
  targetDate?: string | null;
  employee: Employee;
  tasks: OnboardingTask[];
};

async function getEmployee(id: string): Promise<Employee> {
  return api.get<Employee>(`/employees/${id}`);
}

async function getEmployeeEvents(id: string): Promise<EventItem[]> {
  return api.get<EventItem[]>(`/events?employeeId=${id}`);
}

async function getEmployeeOnboardingFlow(
  employeeId: string,
): Promise<OnboardingFlow | null> {
  // Simple approach: fetch all flows and find the one for this employee
  const flows = await api.get<OnboardingFlow[]>("/onboarding/flows");
  return flows.find((f) => f.employee?.id === employeeId) ?? null;
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function flowStatusLabel(status: OnboardingFlowStatus) {
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

function flowStatusClasses(status: OnboardingFlowStatus) {
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

export default async function PersonPage({
  params,
}: {
  params: { id: string };
}) {
  const { id } = params;

  const [employee, events, flow] = await Promise.all([
    getEmployee(id),
    getEmployeeEvents(id),
    getEmployeeOnboardingFlow(id),
  ]);

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const subtitleParts: string[] = [];
  if (employee.title) subtitleParts.push(employee.title);
  if (employee.department) subtitleParts.push(employee.department);
  const subtitle = subtitleParts.join(" • ");

  let onboardingProgress: { done: number; total: number; percent: number } = {
    done: 0,
    total: 0,
    percent: 0,
  };

  if (flow) {
    const total = flow.tasks.length;
    const done = flow.tasks.filter((t) => t.status === "DONE").length;
    onboardingProgress = {
      done,
      total,
      percent: total > 0 ? Math.round((done / total) * 100) : 0,
    };
  }

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link
              href="/people"
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to Directory
            </Link>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {fullName}
            </h1>
            <p className="text-sm text-slate-600">
              {subtitle || "Team member"}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-500">
              {employee.status && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                  {employee.status.toLowerCase().replace("_", " ")}
                </span>
              )}
              {employee.manager && (
                <span>
                  Manager:{" "}
                  <Link
                    href={`/people/${employee.manager.id}`}
                    className="text-indigo-600 hover:underline"
                  >
                    {employee.manager.firstName} {employee.manager.lastName}
                  </Link>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            {employee.email && (
              <div className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] text-slate-700">
                {employee.email}
              </div>
            )}
            <Link
              href={`/onboarding/new?employeeId=${employee.id}`}
              className="inline-flex items-center rounded-full border border-slate-200 bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 shadow-sm hover:bg-black"
            >
              Start onboarding
            </Link>
          </div>
        </header>

        <div className="grid gap-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)]">
          {/* Left: events + AI timeline */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Timeline
              </h2>
              <p className="text-xs text-slate-500">
                Key events, changes, and activity for this employee.
              </p>
              <div className="mt-3">
                <EventsTimeline events={events as any[]} />
              </div>
            </div>

             <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 text-xs shadow-sm">
              <AiPeopleTimeline employeeId={employee.id} />
            </div>

          </section>

          {/* Right: onboarding panel + quick info */}
          <section className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white/95 p-4 shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Onboarding
                  </h2>
                  <p className="text-xs text-slate-500">
                    First 30–90 days view for this employee.
                  </p>
                </div>
                {flow && (
                  <span
                    className={[
                      "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-semibold",
                      flowStatusClasses(flow.status),
                    ].join(" ")}
                  >
                    {flowStatusLabel(flow.status)}
                  </span>
                )}
              </div>

              {!flow ? (
                <div className="mt-4 rounded-lg border border-dashed border-slate-200 bg-slate-50/80 px-3 py-3 text-xs text-slate-600">
                  <p>
                    No onboarding flow exists yet for {fullName}. Start one to
                    keep their first weeks structured.
                  </p>
                  <Link
                    href={`/onboarding/new?employeeId=${employee.id}`}
                    className="mt-2 inline-flex items-center text-[11px] font-medium text-indigo-600 hover:underline"
                  >
                    Start onboarding flow →
                  </Link>
                </div>
              ) : (
                <div className="mt-4 space-y-3 text-xs text-slate-600">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <div className="text-[11px] font-medium text-slate-600">
                        Progress
                      </div>
                      <div className="text-xs text-slate-700">
                        {onboardingProgress.done}/{onboardingProgress.total}{" "}
                        tasks ({onboardingProgress.percent}%)
                      </div>
                    </div>
                    <div className="h-1.5 w-32 overflow-hidden rounded-full bg-slate-100">
                      <div
                        className="h-full rounded-full bg-indigo-500 transition-all"
                        style={{ width: `${onboardingProgress.percent}%` }}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <div className="text-[11px] font-medium text-slate-600">
                        Start date
                      </div>
                      <div className="text-xs text-slate-700">
                        {formatDate(flow.startDate)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[11px] font-medium text-slate-600">
                        Target date
                      </div>
                      <div className="text-xs text-slate-700">
                        {formatDate(flow.targetDate)}
                      </div>
                    </div>
                  </div>

                  <Link
                    href={`/onboarding/${flow.id}`}
                    className="mt-2 inline-flex items-center text-[11px] font-medium text-indigo-600 hover:underline"
                  >
                    Open onboarding checklist →
                  </Link>
                </div>
              )}
            </div>

            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 p-4 text-[11px] text-slate-600">
              <div className="font-semibold text-slate-900">People data</div>
              <ul className="mt-1 list-disc space-y-1 pl-4">
                <li>Connect this profile to payroll and time off policies.</li>
                <li>
                  Use events and reviews to highlight promotion readiness and
                  risk.
                </li>
                <li>
                  Soon: link onboarding, reviews, and goals for full lifecycle
                  insights.
                </li>
              </ul>
            </div>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
