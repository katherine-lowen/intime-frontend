// src/app/people/[id]/page.tsx
import api from "@/lib/api";
import EventsTimeline from "@/components/events-timeline";
import AiPeopleTimeline from "@/components/ai-people-timeline";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import PayrollCompCard from "@/components/payroll-comp-card";
import EmployeeTimeoffPolicyCard from "@/components/employee-timeoff-policy-card";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type PayType = "SALARY" | "HOURLY" | "CONTRACTOR";
type PaySchedule =
  | "WEEKLY"
  | "BIWEEKLY"
  | "SEMI_MONTHLY"
  | "MONTHLY"
  | "OTHER";
type PayrollProvider =
  | "NONE"
  | "GUSTO"
  | "ADP"
  | "RIPPLING"
  | "DEEL"
  | "OTHER";

type Employee = {
  employeeId: string; // canonical ID we use everywhere
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
  startDate?: string | Date | null;

  manager?: {
    employeeId: string;
    firstName: string;
    lastName: string;
  } | null;

  // Payroll / comp
  payType?: PayType | null;
  basePayCents?: number | null;
  payCurrency?: string | null;
  paySchedule?: PaySchedule | null;
  payrollProvider?: PayrollProvider | null;
  payrollExternalId?: string | null;
};

// Shape returned from /employees list
type EmployeeListItem = {
  employeeId?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
  startDate?: string | null;
  manager?: {
    employeeId?: string;
    id?: string;
    firstName: string;
    lastName: string;
  } | null;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

type OnboardingTaskStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "SKIPPED";

type OnboardingTask = {
  id: string;
  status: OnboardingTaskStatus;
};

type OnboardingFlowStatus = "DRAFT" | "ACTIVE" | "COMPLETE" | "ARCHIVED";

type OnboardingFlow = {
  id: string;
  employeeId: string;
  status: OnboardingFlowStatus;
  startDate?: string | null;
  targetDate?: string | null;
  createdAt: string;
  tasks: OnboardingTask[];
};

type EmployeeReviewLite = {
  id: string;
  period?: string | null;
  rating?: string | null;
  createdAt?: string | null;
};

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";

type TimeOffType =
  | "PTO"
  | "SICK"
  | "PERSONAL"
  | "UNPAID"
  | "JURY_DUTY"
  | "PARENTAL_LEAVE";

type TimeOffRequestLite = {
  id: string;
  type?: TimeOffType | null;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
  createdAt?: string | null;
  policy?: {
    id: string;
    name: string;
  } | null;
  employee?: {
    id: string;
  } | null;
};

// -------- API helpers --------

// Try the single-employee endpoint first
async function tryGetEmployeeDetail(id: string): Promise<Employee | null> {
  try {
    const e = await api.get<any>(`/employees/${id}`);
    return {
      employeeId: e.employeeId ?? id,
      firstName: e.firstName,
      lastName: e.lastName,
      email: e.email ?? null,
      title: e.title ?? null,
      department: e.department ?? null,
      location: e.location ?? null,
      status: e.status,
      startDate:
        typeof e.startDate === "string"
          ? e.startDate
          : e.startDate ?? null,
      manager: e.manager
        ? {
            employeeId: e.manager.employeeId ?? e.manager.id ?? "",
            firstName: e.manager.firstName,
            lastName: e.manager.lastName,
          }
        : null,
      payType: e.payType ?? null,
      basePayCents: e.basePayCents ?? null,
      payCurrency: e.payCurrency ?? null,
      paySchedule: e.paySchedule ?? null,
      payrollProvider: e.payrollProvider ?? null,
      payrollExternalId: e.payrollExternalId ?? null,
    };
  } catch (err) {
    console.warn("GET /employees/:id failed, will fall back to list", err);
    return null;
  }
}

// Fall back to the list endpoint if detail endpoint fails
async function tryResolveEmployeeFromList(id: string): Promise<Employee | null> {
  try {
    const list = await api.get<EmployeeListItem[]>("/employees");

    const match = list.find(
      (e) => e.employeeId === id || e.id === id
    );
    if (!match) return null;

    return {
      employeeId: match.employeeId ?? match.id ?? id,
      firstName: match.firstName,
      lastName: match.lastName,
      email: match.email ?? null,
      title: match.title ?? null,
      department: match.department ?? null,
      location: match.location ?? null,
      status: match.status,
      startDate: match.startDate ?? null,
      manager: match.manager
        ? {
            employeeId: match.manager.employeeId ?? match.manager.id ?? "",
            firstName: match.manager.firstName,
            lastName: match.manager.lastName,
          }
        : null,
      // list doesn’t return payroll fields, so default them
      payType: null,
      basePayCents: null,
      payCurrency: "USD",
      paySchedule: null,
      payrollProvider: "NONE",
      payrollExternalId: null,
    };
  } catch (err) {
    console.error("Fallback /employees list failed", err);
    return null;
  }
}

// Unified resolver: detail endpoint first, then list
async function getEmployeeById(id: string): Promise<Employee | null> {
  const fromDetail = await tryGetEmployeeDetail(id);
  if (fromDetail) return fromDetail;

  const fromList = await tryResolveEmployeeFromList(id);
  return fromList;
}

async function getEmployeeEvents(employeeId: string): Promise<EventItem[]> {
  try {
    return await api.get<EventItem[]>(`/events?employeeId=${employeeId}`);
  } catch (err) {
    console.error("Failed to load events for employee", employeeId, err);
    return [];
  }
}

async function getOnboardingFlows(): Promise<OnboardingFlow[]> {
  try {
    return await api.get<OnboardingFlow[]>("/onboarding/flows");
  } catch (err) {
    console.warn(
      "[people/[id]] /onboarding/flows not available yet, returning []"
    );
    return [];
  }
}

async function getEmployeeReviews(
  employeeId: string
): Promise<EmployeeReviewLite[]> {
  try {
    return await api.get<EmployeeReviewLite[]>(
      `/performance-reviews?employeeId=${employeeId}`
    );
  } catch (err) {
    console.error("Failed to load performance reviews for employee", err);
    return [];
  }
}

async function getEmployeeTimeOffRequests(
  employeeId: string
): Promise<TimeOffRequestLite[]> {
  try {
    const all = await api.get<TimeOffRequestLite[]>("/timeoff/requests");
    return (all as any[]).filter(
      (r) => r.employee && r.employee.id === employeeId
    );
  } catch (err) {
    console.error("Failed to load time off requests for employee", err);
    return [];
  }
}

// -------- Formatting / calculation helpers --------

function formatStatus(status?: EmployeeStatus) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ON_LEAVE":
      return "On leave";
    case "CONTRACTOR":
      return "Contractor";
    case "ALUMNI":
      return "Alumni";
    default:
      return "Active";
  }
}

function formatOnboardingStatus(status: OnboardingFlowStatus) {
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

function computeProgress(tasks: OnboardingTask[] | undefined) {
  if (!tasks || tasks.length === 0) {
    return { done: 0, total: 0, percent: 0 };
  }
  const total = tasks.length;
  const done = tasks.filter((t) => t.status === "DONE").length;
  const percent = total > 0 ? Math.round((done / total) * 100) : 0;
  return { done, total, percent };
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

// Inclusive day count between two ISO dates
function countDaysInclusive(startIso: string, endIso: string): number {
  const start = new Date(startIso);
  const end = new Date(endIso);
  if (
    Number.isNaN(start.getTime()) ||
    Number.isNaN(end.getTime()) ||
    end < start
  ) {
    return 0;
  }
  const msPerDay = 24 * 60 * 60 * 1000;
  const diff = end.getTime() - start.getTime();
  return Math.floor(diff / msPerDay) + 1;
}

// Approved PTO days in the current calendar year
function computePtoUsedThisYear(requests: TimeOffRequestLite[]): number {
  const now = new Date();
  const year = now.getFullYear();

  return requests
    .filter(
      (r) =>
        r.status === "APPROVED" &&
        (r.type === "PTO" || !r.type) &&
        new Date(r.startDate).getFullYear() === year
    )
    .reduce((sum, r) => sum + countDaysInclusive(r.startDate, r.endDate), 0);
}

export const dynamic = "force-dynamic";

export default async function PersonPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: employeeIdFromUrl } = await params;

  if (
    !employeeIdFromUrl ||
    employeeIdFromUrl === "undefined" ||
    employeeIdFromUrl.trim() === ""
  ) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900">
            No employee selected
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            This page needs a valid employee ID in the URL. Go back to the
            People hub and open someone from the list.
          </p>
          <div className="mt-4">
            <Link
              href="/people"
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              ← Back to People hub
            </Link>
          </div>
        </main>
      </AuthGate>
    );
  }

  // 1️⃣ Try detail endpoint, then list fallback
  const employee = await getEmployeeById(employeeIdFromUrl);

  if (!employee) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-3xl px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Employee not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find an employee for this ID in the current
            workspace.
          </p>
          <div className="mt-4">
            <Link
              href="/people"
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
            >
              ← Back to People hub
            </Link>
          </div>
        </main>
      </AuthGate>
    );
  }

  const employeeId = employee.employeeId;

  const [events, flows, reviews, timeOffRequests] = await Promise.all([
    getEmployeeEvents(employeeId),
    getOnboardingFlows(),
    getEmployeeReviews(employeeId),
    getEmployeeTimeOffRequests(employeeId),
  ]);

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const subtitleParts: string[] = [];
  if (employee.title) subtitleParts.push(employee.title);
  if (employee.department) subtitleParts.push(employee.department);
  if (employee.location) subtitleParts.push(employee.location);
  const subtitle = subtitleParts.join(" • ");

  const employeeFlows = flows.filter((f) => f.employeeId === employeeId);
  const currentFlow =
    employeeFlows
      .filter((f) => f.status !== "ARCHIVED")
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0] ?? null;

  const progress = computeProgress(currentFlow?.tasks);
  const start =
    currentFlow?.startDate &&
    new Date(currentFlow.startDate).toLocaleDateString();
  const target =
    currentFlow?.targetDate &&
    new Date(currentFlow.targetDate).toLocaleDateString();

  const latestReviews = reviews
    .slice()
    .sort((a, b) => {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    })
    .slice(0, 3);

  const sortedTimeOff = timeOffRequests
    .slice()
    .sort((a, b) => {
      const da = a.startDate ? Date.parse(a.startDate) : 0;
      const db = b.startDate ? Date.parse(b.startDate) : 0;
      return db - da;
    })
    .slice(0, 3);

  const usedPtoDaysThisYear = computePtoUsedThisYear(timeOffRequests);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Link href="/people" className="text-indigo-600 hover:underline">
                People
              </Link>
              <span className="text-slate-300">/</span>
              <span>Profile</span>
            </div>

            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              {fullName}
            </h1>
            <p className="text-sm text-slate-600">
              {subtitle || "Team member"}
            </p>

            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
              <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 font-medium text-emerald-700">
                <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                {formatStatus(employee.status)}
              </span>
              {employee.manager && (
                <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                  Manager:{" "}
                  <span className="ml-1">
                    {employee.manager.firstName} {employee.manager.lastName}
                  </span>
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-2 text-xs">
            {/* Performance CTAs */}
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Link
                href={`/performance/reviews/new?employeeId=${employeeId}`}
                className="inline-flex items-center gap-1 rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                New review
              </Link>
              <Link
                href={`/performance/reviews?employeeId=${employeeId}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                View reviews
              </Link>
            </div>

            {/* Onboarding CTAs */}
            <Link
              href={`/onboarding/new?employeeId=${employeeId}`}
              className="inline-flex items-center gap-1 rounded-full bg-slate-900 px-3 py-1.5 text-[11px] font-semibold text-slate-50 hover:bg-slate-800"
            >
              Start onboarding
            </Link>
            {currentFlow && (
              <Link
                href={`/onboarding/${currentFlow.id}`}
                className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
              >
                Open onboarding flow
              </Link>
            )}
          </div>
        </header>

        {/* MAIN GRID */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1.3fr)]">
          {/* LEFT: Events + Performance */}
          <div className="space-y-4">
            {/* Activity timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Activity timeline
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                Key events for {employee.firstName} inside Intime.
              </p>
              <div className="mt-4">
                <EventsTimeline events={events as any[]} />
              </div>
            </div>

            {/* Performance reviews */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-center justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Performance reviews
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Recent review cycles tied to this employee.
                  </p>
                </div>
                <Link
                  href={`/performance/reviews/new?employeeId=${employeeId}`}
                  className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500"
                >
                  New review
                </Link>
              </div>

              {latestReviews.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                  No performance reviews have been recorded yet. Create the
                  first review for {fullName || "this employee"}.
                </div>
              ) : (
                <ul className="space-y-2 text-sm">
                  {latestReviews.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="truncate text-sm font-medium text-slate-900">
                          {r.period || "Review"}
                        </div>
                        <div className="text-xs text-slate-500">
                          {r.rating || "No rating"} ·{" "}
                          {formatDate(r.createdAt)}
                        </div>
                      </div>
                      <Link
                        href={`/performance/reviews/${r.id}`}
                        className="text-xs font-medium text-indigo-600 hover:text-indigo-500"
                      >
                        Open
                      </Link>
                    </li>
                  ))}
                </ul>
              )}

              {reviews.length > 3 && (
                <div className="mt-3 text-right text-[11px]">
                  <Link
                    href={`/performance/reviews?employeeId=${employeeId}`}
                    className="text-indigo-600 hover:text-indigo-500"
                  >
                    View all reviews →
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: AI + Onboarding + Time off + PTO policy + Payroll + Profile */}
          <div className="space-y-4">
            {/* AI insights */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                AI-powered insights
              </h2>
              <p className="mt-1 text-xs text-slate-500">
                A narrative view of this person&apos;s history, highlights, and
                risks.
              </p>
              <div className="mt-4">
                <AiPeopleTimeline employeeId={employeeId} />
              </div>
            </div>

            {/* Onboarding card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Onboarding
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Track this employee&apos;s onboarding journey, tasks, and
                    key dates.
                  </p>
                </div>
                <Link
                  href="/onboarding"
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  View all flows
                </Link>
              </div>

              <div className="mt-4 space-y-3 text-xs">
                {!currentFlow ? (
                  <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-slate-600">
                    No onboarding flow has been started for this employee yet.
                    <div className="mt-2">
                      <Link
                        href={`/onboarding/new?employeeId=${employeeId}`}
                        className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
                      >
                        Start onboarding plan
                      </Link>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                          {formatOnboardingStatus(currentFlow.status)}
                        </span>
                        {start && (
                          <span className="text-[11px] text-slate-500">
                            Start: {start}
                          </span>
                        )}
                        {target && (
                          <span className="text-[11px] text-slate-500">
                            Target: {target}
                          </span>
                        )}
                      </div>

                      <span className="text-[11px] text-slate-500">
                        {progress.total === 0
                          ? "No tasks yet"
                          : `${progress.done}/${progress.total} tasks (${progress.percent}%)`}
                      </span>
                    </div>

                    {progress.total > 0 && (
                      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                        <div
                          className="h-full rounded-full bg-indigo-500 transition-all"
                          style={{ width: `${progress.percent}%` }}
                        />
                      </div>
                    )}

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <Link
                        href={`/onboarding/${currentFlow.id}`}
                        className="inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-50"
                      >
                        Open onboarding flow
                      </Link>
                      <Link
                        href={`/onboarding/new?employeeId=${employeeId}`}
                        className="inline-flex items-center rounded-full bg-slate-900 px-3 py-1 text-[11px] font-semibold text-slate-50 hover:bg-slate-800"
                      >
                        Regenerate onboarding plan
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Time off card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="mb-3 flex items-start justify-between gap-2">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Time off
                  </h2>
                  <p className="mt-1 text-xs text-slate-500">
                    Recent and upcoming time away for this employee.
                  </p>
                  <p className="mt-1 text-[11px] text-slate-500">
                    {usedPtoDaysThisYear > 0
                      ? `Used ${usedPtoDaysThisYear} PTO ${
                          usedPtoDaysThisYear === 1 ? "day" : "days"
                        } this year.`
                      : "No approved PTO days yet this year."}
                  </p>
                </div>
                <Link
                  href="/timeoff"
                  className="text-[11px] font-medium text-indigo-600 hover:underline"
                >
                  Open time off
                </Link>
              </div>

              {sortedTimeOff.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-3 text-xs text-slate-600">
                  No time off requests recorded for this employee yet.
                  <div className="mt-2">
                    <Link
                      href={`/timeoff/new?employeeId=${employeeId}`}
                      className="inline-flex items-center rounded-full bg-indigo-600 px-3 py-1.5 text-[11px] font-semibold text-white hover:bg-indigo-700"
                    >
                      New time off request
                    </Link>
                  </div>
                </div>
              ) : (
                <ul className="space-y-2 text-xs">
                  {sortedTimeOff.map((r) => (
                    <li
                      key={r.id}
                      className="flex items-center justify-between gap-3 rounded-xl bg-slate-50 px-3 py-2"
                    >
                      <div className="min-w-0">
                        <div className="text-[11px] font-medium text-slate-900">
                          {r.type || "PTO"} · {formatDate(r.startDate)} –{" "}
                          {formatDate(r.endDate)}
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {r.status === "REQUESTED"
                            ? "Requested"
                            : r.status === "APPROVED"
                            ? "Approved"
                            : r.status === "DENIED"
                            ? "Denied"
                            : "Cancelled"}
                          {r.policy?.name ? ` · ${r.policy.name}` : ""}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* PTO policy assignment */}
            <EmployeeTimeoffPolicyCard employeeId={employeeId} />

            {/* Payroll / comp card */}
            <PayrollCompCard
              employeeId={employeeId}
              initial={{
                payType: employee.payType ?? null,
                basePayCents: employee.basePayCents ?? null,
                payCurrency: employee.payCurrency ?? "USD",
                paySchedule: employee.paySchedule ?? null,
                payrollProvider: employee.payrollProvider ?? "NONE",
                payrollExternalId: employee.payrollExternalId ?? null,
              }}
            />

            {/* Basic contact card */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-xs text-slate-700 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">
                Profile details
              </h2>
              <div className="mt-3 space-y-1.5">
                <div>
                  <span className="text-[11px] text-slate-500">Email</span>
                  <div>{employee.email ?? "—"}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">
                    Department
                  </span>
                  <div>{employee.department ?? "—"}</div>
                </div>
                <div>
                  <span className="text-[11px] text-slate-500">Location</span>
                  <div>{employee.location ?? "—"}</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
