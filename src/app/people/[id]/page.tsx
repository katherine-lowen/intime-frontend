// src/app/people/[id]/page.tsx
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";
import AiPeopleTimeline from "@/components/ai-people-timeline";
import EmployeeTimeline from "@/components/employee-timeline";

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
  startDate?: string | null;
  createdAt?: string;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

type TimeOffStatus = "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";

type TimeOffRequest = {
  id: string;
  type: string;
  status: TimeOffStatus;
  startDate: string;
  endDate: string;
};

async function getEmployee(id: string): Promise<Employee | null> {
  try {
    return await api.get<Employee>(`/employees/${id}`);
  } catch (err) {
    console.error("Failed to load employee", err);
    return null;
  }
}

async function getEmployeeEvents(id: string): Promise<EventItem[]> {
  try {
    return await api.get<EventItem[]>(`/events?employeeId=${id}`);
  } catch (err) {
    console.error("Failed to load employee events", err);
    return [];
  }
}

async function getEmployeeTimeOff(id: string): Promise<TimeOffRequest[]> {
  try {
    // backend should support this filter; if not, it will just safely fail
    return await api.get<TimeOffRequest[]>(`/timeoff/requests?employeeId=${id}`);
  } catch (err) {
    console.error("Failed to load employee time off", err);
    return [];
  }
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

function computeTenure(startDate?: string | null, createdAt?: string) {
  const source = startDate ?? createdAt;
  if (!source) return null;

  const start = new Date(source);
  if (Number.isNaN(start.getTime())) return null;

  const now = new Date();
  let months =
    (now.getFullYear() - start.getFullYear()) * 12 +
    (now.getMonth() - start.getMonth());

  if (months < 0) months = 0;

  const years = Math.floor(months / 12);
  const remMonths = months % 12;

  if (years === 0) {
    return remMonths === 1 ? "1 month" : `${remMonths} months`;
  }

  if (remMonths === 0) {
    return years === 1 ? "1 year" : `${years} years`;
  }

  const yearPart = years === 1 ? "1 year" : `${years} years`;
  const monthPart = remMonths === 1 ? "1 month" : `${remMonths} months`;
  return `${yearPart} ${monthPart}`;
}

function summarizeTimeOff(requests: TimeOffRequest[]) {
  if (!requests.length) {
    return {
      upcoming: 0,
      approvedThisYear: 0,
      pending: 0,
    };
  }

  const now = new Date();
  const currentYear = now.getFullYear();

  let upcoming = 0;
  let approvedThisYear = 0;
  let pending = 0;

  for (const r of requests) {
    const start = new Date(r.startDate);
    if (r.status === "REQUESTED") {
      pending += 1;
    }
    if (r.status === "APPROVED") {
      if (start >= now) {
        upcoming += 1;
      }
      if (start.getFullYear() === currentYear) {
        approvedThisYear += 1;
      }
    }
  }

  return { upcoming, approvedThisYear, pending };
}

export default async function PersonPage({ params }: { params: { id: string } }) {
  const { id } = params;

  const [employee, events, timeoff] = await Promise.all([
    getEmployee(id),
    getEmployeeEvents(id),
    getEmployeeTimeOff(id),
  ]);

  if (!employee) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-6xl px-8 py-10">
          <h1 className="text-xl font-semibold text-slate-900">Person not found</h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find this person in the directory. They may have been removed,
            or there was an issue loading their record.
          </p>
        </main>
      </AuthGate>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const tenureLabel = computeTenure(employee.startDate, employee.createdAt);
  const timeoffSummary = summarizeTimeOff(timeoff);

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl space-y-8 px-6 py-8">
        {/* HERO */}
        <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 px-6 py-5 text-slate-50 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            {/* Avatar */}
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-700 text-lg font-semibold">
              {employee.firstName?.[0]}
              {employee.lastName?.[0]}
            </div>

            <div className="space-y-1">
              <h1 className="text-2xl font-semibold tracking-tight">
                {fullName || "Unnamed person"}
              </h1>
              <p className="text-xs text-slate-200/80">
                {employee.title || "No title"}{" "}
                {employee.department && <>· {employee.department}</>}{" "}
                {employee.location && <>· {employee.location}</>}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px]">
                {employee.email && (
                  <span className="rounded-full bg-slate-50/10 px-3 py-1 text-slate-100">
                    {employee.email}
                  </span>
                )}
                {employee.manager && (
                  <span className="rounded-full bg-slate-50/10 px-3 py-1 text-slate-100">
                    Reports to {employee.manager.firstName} {employee.manager.lastName}
                  </span>
                )}
                <span
                  className={[
                    "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium bg-slate-900/60",
                    statusClass(employee.status),
                  ].join(" ")}
                >
                  {statusLabel(employee.status)}
                </span>
              </div>
            </div>
          </div>

          {/* Tenure pill */}
          <div className="flex flex-col items-start gap-2 rounded-2xl bg-slate-950/40 px-4 py-3 text-xs text-slate-100 ring-1 ring-slate-700/60 md:items-end">
            <div className="font-semibold">Tenure</div>
            <div className="text-sm font-semibold">
              {tenureLabel ?? "New to Intime"}
            </div>
            <div className="space-y-0.5 text-[11px] text-slate-300">
              {employee.startDate && (
                <div>
                  Start date:{" "}
                  {new Date(employee.startDate).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
              {employee.createdAt && (
                <div>
                  Joined Intime:{" "}
                  {new Date(employee.createdAt).toLocaleDateString(undefined, {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* BODY LAYOUT: side menu + content */}
        <section className="grid gap-8 md:grid-cols-[220px_minmax(0,1fr)]">
          {/* LEFT: role information menu (Rippling-style) */}
          <aside className="space-y-3 rounded-2xl border border-slate-200 bg-white px-3 py-4 text-sm text-slate-800 shadow-sm">
            <div className="border-l-2 border-slate-900 pl-3 text-xs font-semibold uppercase tracking-wide text-slate-900">
              Role information
            </div>

            <nav className="mt-2 space-y-1 text-xs text-slate-700">
              <a href="#job" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Personal & job info
              </a>
              <a href="#performance" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Performance & review cycles
              </a>
              <a href="#timeoff" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Time off & PTO
              </a>
              <a href="#docs" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Documents & onboarding
              </a>
              <a href="#comp" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Compensation snapshot
              </a>
              <a href="#systems" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Systems & access
              </a>
              <a href="#timeline" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                Activity timeline
              </a>
              <a href="#ai" className="block rounded-md px-3 py-1 hover:bg-slate-50">
                AI insights
              </a>
            </nav>
          </aside>

          {/* RIGHT: content sections */}
          <div className="space-y-6">
            {/* Job + personal info */}
            <section
              id="job"
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Job & employment
                </h2>
                <dl className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Title</dt>
                    <dd className="font-medium">
                      {employee.title || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Department</dt>
                    <dd className="font-medium">
                      {employee.department || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Location</dt>
                    <dd className="font-medium">
                      {employee.location || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Employment status</dt>
                    <dd className="font-medium">
                      {statusLabel(employee.status)}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Contact & reporting
                </h2>
                <dl className="mt-3 space-y-2 text-sm text-slate-700">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Email</dt>
                    <dd className="font-medium break-all">
                      {employee.email || "Not set"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Manager</dt>
                    <dd className="font-medium">
                      {employee.manager
                        ? `${employee.manager.firstName} ${employee.manager.lastName}`
                        : "None"}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Employee ID</dt>
                    <dd className="font-medium">
                      {employee.id}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">Joined</dt>
                    <dd className="font-medium">
                      {employee.createdAt
                        ? new Date(employee.createdAt).toLocaleDateString()
                        : "Unknown"}
                    </dd>
                  </div>
                </dl>
              </div>
            </section>

            {/* Time off & PTO */}
            <section
              id="timeoff"
              className="grid gap-4 md:grid-cols-2"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Time off & PTO
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  High-level view of this person&apos;s time away from work.
                </p>
                <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-3">
                    <div className="text-[10px] text-slate-500">
                      Upcoming trips
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {timeoffSummary.upcoming}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-3">
                    <div className="text-[10px] text-slate-500">
                      Approved this year
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {timeoffSummary.approvedThisYear}
                    </div>
                  </div>
                  <div className="rounded-xl border border-slate-100 bg-slate-50 px-2 py-3">
                    <div className="text-[10px] text-slate-500">
                      Pending requests
                    </div>
                    <div className="mt-1 text-lg font-semibold text-slate-900">
                      {timeoffSummary.pending}
                    </div>
                  </div>
                </div>
                {timeoff.length === 0 && (
                  <p className="mt-3 text-xs text-slate-500">
                    No time off requests on record yet for this person.
                  </p>
                )}
              </div>

              {/* Performance snapshot */}
              <section
                id="performance"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  Performance & review cycles
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Quick view of reviews, cycles, and feedback. You&apos;ll wire this
                  to the performance module later.
                </p>
                <ul className="mt-3 space-y-1.5 text-xs text-slate-700">
                  <li>• No performance reviews logged yet.</li>
                  <li>• No active review cycles assigned.</li>
                  <li>• Feedback and calibration will appear here over time.</li>
                </ul>
              </section>
            </section>

            {/* Docs, comp, systems */}
            <section
              id="docs"
              className="grid gap-4 md:grid-cols-3"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Documents & onboarding
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Offer letters, NDAs, and onboarding paperwork will live here.
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  No employee documents attached yet.
                </p>
              </div>

              <div
                id="comp"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  Compensation snapshot
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  High-level compensation info and ranges. This will eventually
                  read from your payroll / comp connectors.
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  Compensation data not yet connected.
                </p>
              </div>

              <div
                id="systems"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  Systems & access
                </h2>
                <p className="mt-2 text-xs text-slate-500">
                  Future home for app access, devices, and security settings.
                </p>
                <p className="mt-3 text-xs text-slate-600">
                  No connected systems or devices yet.
                </p>
              </div>
            </section>

            {/* Timeline + AI insights */}
            <section
              id="timeline"
              className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]"
            >
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900">
                  Activity timeline
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Events from hiring, time off, performance, and system activity.
                </p>
                <div className="mt-4">
                  <EmployeeTimeline events={events} />
                </div>
              </div>

              <div
                id="ai"
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <h2 className="text-sm font-semibold text-slate-900">
                  AI insights
                </h2>
                <p className="mt-1 text-xs text-slate-500">
                  Narrative view of this person&apos;s role, workload, and risks.
                </p>
                <div className="mt-4">
                  <AiPeopleTimeline employeeId={employee.id} />
                </div>
              </div>
            </section>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
