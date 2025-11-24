// src/app/people/[id]/page.tsx
import api from "@/lib/api";
import EventsTimeline from "@/components/events-timeline";
import AiPeopleTimeline from "@/components/ai-people-timeline";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus | null;
  manager?: { id: string; firstName: string; lastName: string } | null;
  createdAt?: string;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

async function getEmployee(id: string): Promise<Employee> {
  return api.get<Employee>(`/employees/${id}`);
}

async function getEmployeeEvents(id: string): Promise<EventItem[]> {
  return api.get<EventItem[]>(`/events?employeeId=${id}`);
}

function statusLabel(status?: EmployeeStatus | null) {
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
      return "Unknown";
  }
}

function statusClass(status?: EmployeeStatus | null) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "ON_LEAVE":
      return "bg-amber-50 text-amber-700 border-amber-200";
    case "CONTRACTOR":
      return "bg-sky-50 text-sky-700 border-sky-200";
    case "ALUMNI":
      return "bg-slate-50 text-slate-600 border-slate-200";
    default:
      return "bg-slate-50 text-slate-500 border-slate-200";
  }
}

function computeTenure(createdAt?: string) {
  if (!createdAt) return null;
  const start = new Date(createdAt);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  const years = now.getFullYear() - start.getFullYear();
  const months = now.getMonth() - start.getMonth() + years * 12;
  if (months < 1) return "Less than 1 month";

  const y = Math.floor(months / 12);
  const m = months % 12;

  if (y > 0 && m > 0) return `${y} yr${y > 1 ? "s" : ""} ${m} mo`;
  if (y > 0) return `${y} yr${y > 1 ? "s" : ""}`;
  return `${m} mo`;
}

export default async function PersonPage({ params }: { params: { id: string } }) {
  const [employee, events] = await Promise.all([
    getEmployee(params.id),
    getEmployeeEvents(params.id).catch(() => []),
  ]);

  const fullName = `${employee.firstName} ${employee.lastName}`;
  const tenure = computeTenure(employee.createdAt);
  const eventsCount = events.length;

  return (
    <AuthGate>
      <main className="px-6 py-8 space-y-8 lg:px-8">
        {/* ======================== */}
        {/*       HERO SECTION       */}
        {/* ======================== */}
        <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white shadow">
              {employee.firstName[0]}
              {employee.lastName[0]}
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-slate-900">
                {fullName}
              </h1>
              <p className="text-sm text-slate-600">
                {employee.title || "No title"} •{" "}
                {employee.department || "No department"}
                {employee.location ? ` • ${employee.location}` : ""}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {/* Email */}
                {employee.email && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    {employee.email}
                  </span>
                )}

                {/* Manager */}
                {employee.manager && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    Reports to {employee.manager.firstName}{" "}
                    {employee.manager.lastName}
                  </span>
                )}

                {/* Status */}
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium",
                    statusClass(employee.status),
                  ].join(" ")}
                >
                  {statusLabel(employee.status)}
                </span>

                {/* Tenure */}
                {tenure && (
                  <span className="inline-flex items-center rounded-full bg-slate-900/80 px-3 py-1 text-[11px] font-medium text-slate-50">
                    Tenure: {tenure}
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Hero right meta */}
          <div className="flex flex-col items-start gap-2 text-xs text-slate-600 md:items-end">
            <div className="rounded-full bg-white/70 px-3 py-1 shadow-sm">
              <span className="font-medium text-slate-800">
                People profile
              </span>{" "}
              ·{" "}
              <span className="text-slate-500">
                {eventsCount} event{eventsCount === 1 ? "" : "s"} in Intime
              </span>
            </div>
            <p className="max-w-xs text-right text-[11px] text-slate-500 hidden md:block">
              This page will become the source of truth for this person:
              compensation, time off, performance, and their time-aware history
              across Intime.
            </p>
          </div>
        </section>

        {/* ======================== */}
        {/*  MAIN TWO-COLUMN LAYOUT  */}
        {/* ======================== */}
        <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* LEFT SIDEBAR */}
          <div className="space-y-6">
            {/* Job details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Job details
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-medium">Title: </span>
                  {employee.title || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Department: </span>
                  {employee.department || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Location: </span>
                  {employee.location || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Employee status: </span>
                  {statusLabel(employee.status)}
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Contact
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-medium">Email: </span>
                  {employee.email || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Manager: </span>
                  {employee.manager
                    ? `${employee.manager.firstName} ${employee.manager.lastName}`
                    : "None"}
                </li>
              </ul>
            </div>

            {/* Org details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Org details
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-medium">Employee ID: </span>
                  {employee.id}
                </li>
                <li>
                  <span className="font-medium">Joined: </span>
                  {employee.createdAt
                    ? new Date(employee.createdAt).toLocaleDateString()
                    : "Unknown"}
                </li>
                <li>
                  <span className="font-medium">Tenure: </span>
                  {tenure ?? "Unknown"}
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE — SUMMARY PANELS + TIMELINES */}
          <div className="space-y-6">
            {/* SUMMARY PANELS GRID */}
            <section className="grid gap-4 md:grid-cols-2">
              {/* Time & PTO */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Time & PTO
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  High-level view of this person&apos;s time away from work.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Assigned policy</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                      Not connected yet
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Upcoming time off</span>
                    <span className="text-slate-700">0 days scheduled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Last approved request</span>
                    <span className="text-slate-400">No history yet</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  As you approve PTO and leave in Intime, this panel will show
                  balance, upcoming days, and trends over time.
                </p>
              </div>

              {/* Compensation */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Compensation
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  Summary of how this employee is paid.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Base compensation</span>
                    <span className="text-slate-700">Not set</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Pay type</span>
                    <span className="text-slate-700">Salary / hourly</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Effective date</span>
                    <span className="text-slate-400">Not recorded</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  Later, this will link to your HRIS or payroll system so
                  Intime can overlay compensation trends with time and
                  performance.
                </p>
              </div>

              {/* Hiring & onboarding */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Hiring & onboarding
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  How this person joined the company and their onboarding state.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Source</span>
                    <span className="text-slate-700">Not linked to ATS yet</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Role hired for</span>
                    <span className="text-slate-700">
                      {employee.title || "Not set"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Onboarding status</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] text-slate-700">
                      Coming soon
                    </span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  In the full Intime workflow, this panel will pull directly
                  from Jobs, Candidates, and Onboarding to give you the complete
                  hiring story for this person.
                </p>
              </div>

              {/* Performance snapshot */}
              <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Performance snapshot
                </h2>
                <p className="mt-1 text-xs text-slate-600">
                  A quick view into reviews, goals, and manager feedback.
                </p>
                <div className="mt-3 space-y-1.5 text-xs text-slate-500">
                  <div className="flex items-center justify-between">
                    <span>Last review</span>
                    <span className="text-slate-400">Not recorded</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Next planned review</span>
                    <span className="text-slate-400">Not scheduled</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Goals</span>
                    <span className="text-slate-700">No goals added yet</span>
                  </div>
                </div>
                <p className="mt-3 text-[11px] text-slate-500">
                  As you log performance reviews and goals, Intime will use this
                  panel to surface patterns, risks, and growth areas over time.
                </p>
              </div>
            </section>

            {/* Activity timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Activity timeline
              </h2>
              <EventsTimeline events={events} />
            </div>

            {/* AI summary */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                AI insights
              </h2>
              <AiPeopleTimeline employeeId={employee.id} />
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
