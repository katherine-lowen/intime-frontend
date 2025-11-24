// src/app/people/[id]/page.tsx
import api from "@/lib/api";
import EventsTimeline from "@/components/events-timeline";
import AiPeopleTimeline from "@/components/ai-people-timeline";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

// -------------------------------
// Types
// -------------------------------
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

type TimeOffRequestItem = {
  id: string;
  employeeId: string;
  type: string;
  status: "REQUESTED" | "APPROVED" | "DENIED" | "CANCELLED";
  startDate: string;
  endDate: string;
  createdAt?: string;
};

// -------------------------------
// Fetch functions
// -------------------------------
async function getEmployee(id: string): Promise<Employee> {
  return api.get<Employee>(`/employees/${id}`);
}

async function getEmployeeEvents(id: string): Promise<EventItem[]> {
  return api.get<EventItem[]>(`/events?employeeId=${id}`);
}

async function getEmployeeTimeoff(id: string): Promise<TimeOffRequestItem[]> {
  try {
    return await api.get<TimeOffRequestItem[]>(
      `/timeoff/requests?employeeId=${id}`
    );
  } catch (err) {
    console.error("Failed to load employee time off", err);
    return [];
  }
}

// -------------------------------
// Helpers
// -------------------------------
function statusLabel(status?: EmployeeStatus | null) {
  switch (status) {
    case "ACTIVE":
      return "Active";
    case "ON_LEAVE":
      return "On Leave";
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

function fmt(date?: string) {
  return date ? new Date(date).toLocaleDateString() : "—";
}

// -------------------------------
// Component
// -------------------------------
export default async function PersonPage({
  params,
}: {
  params: { id: string };
}) {
  const [employee, events, timeoff] = await Promise.all([
    getEmployee(params.id),
    getEmployeeEvents(params.id).catch(() => []),
    getEmployeeTimeoff(params.id),
  ]);

  const fullName = `${employee.firstName} ${employee.lastName}`;

  // PTO logic
  const approved = timeoff.filter((r) => r.status === "APPROVED");
  const upcoming = approved.filter(
    (r) => new Date(r.startDate).getTime() >= Date.now()
  );
  const nextUpcoming = upcoming.sort(
    (a, b) =>
      new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
  )[0];

  const lastTaken = approved
    .filter((r) => new Date(r.endDate).getTime() < Date.now())
    .sort(
      (a, b) =>
        new Date(b.endDate).getTime() - new Date(a.endDate).getTime()
    )[0];

  const tenureMonths = employee.createdAt
    ? Math.floor(
        (Date.now() - new Date(employee.createdAt).getTime()) /
          (1000 * 60 * 60 * 24 * 30)
      )
    : null;

  return (
    <AuthGate>
      <main className="px-8 py-8 space-y-8">
        {/* ================================= */}
        {/* HERO */}
        {/* ================================= */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4">
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

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {employee.email && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    {employee.email}
                  </span>
                )}

                {employee.manager && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    Reports to{" "}
                    {employee.manager.firstName}{" "}
                    {employee.manager.lastName}
                  </span>
                )}

                <span
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium ${statusClass(
                    employee.status
                  )}`}
                >
                  {statusLabel(employee.status)}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* ================================= */}
        {/* TWO-COLUMN LAYOUT */}
        {/* ================================= */}
        <section className="grid gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* LEFT SIDEBAR */}
          <div className="space-y-6">
            {/* Job details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Job details
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-medium">Title:</span>{" "}
                  {employee.title || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Department:</span>{" "}
                  {employee.department || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Location:</span>{" "}
                  {employee.location || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Status:</span>{" "}
                  {statusLabel(employee.status)}
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Contact
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-medium">Email:</span>{" "}
                  {employee.email || "Not set"}
                </li>
                <li>
                  <span className="font-medium">Manager:</span>{" "}
                  {employee.manager
                    ? `${employee.manager.firstName} ${employee.manager.lastName}`
                    : "None"}
                </li>
              </ul>
            </div>

            {/* Org details */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Org details
              </h2>
              <ul className="space-y-2 text-sm text-slate-700">
                <li>
                  <span className="font-medium">Employee ID:</span>{" "}
                  {employee.id}
                </li>
                <li>
                  <span className="font-medium">Joined:</span>{" "}
                  {fmt(employee.createdAt)}
                </li>
                <li>
                  <span className="font-medium">Tenure:</span>{" "}
                  {tenureMonths !== null ? `${tenureMonths} months` : "—"}
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-6">
            {/* GRID OF SUMMARY CARDS */}
            <section className="grid gap-4 md:grid-cols-2">
              {/* TIME & PTO */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">
                  Time & PTO
                </h2>

                <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                  <li className="flex justify-between">
                    <span className="text-slate-500">Upcoming PTO</span>
                    <span className="font-medium">
                      {nextUpcoming
                        ? `${fmt(nextUpcoming.startDate)} → ${fmt(
                            nextUpcoming.endDate
                          )}`
                        : "None"}
                    </span>
                  </li>

                  <li className="flex justify-between">
                    <span className="text-slate-500">Last PTO taken</span>
                    <span className="font-medium">
                      {lastTaken
                        ? `${fmt(lastTaken.startDate)} → ${fmt(
                            lastTaken.endDate
                          )}`
                        : "Never"}
                    </span>
                  </li>

                  <li className="flex justify-between">
                    <span className="text-slate-500">Total requests</span>
                    <span className="font-medium">{timeoff.length}</span>
                  </li>

                  <li className="flex justify-between">
                    <span className="text-slate-500">Approved</span>
                    <span className="font-medium">{approved.length}</span>
                  </li>
                </ul>
              </div>

              {/* COMPENSATION */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">
                  Compensation
                </h2>

                <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                  <li className="flex justify-between">
                    <span className="text-slate-500">Base pay</span>
                    <span className="font-medium">Not set</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Pay type</span>
                    <span className="font-medium">Salary / Hourly</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Effective date</span>
                    <span className="text-slate-400">—</span>
                  </li>
                </ul>
              </div>

              {/* HIRING & ONBOARDING */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">
                  Hiring & onboarding
                </h2>

                <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                  <li className="flex justify-between">
                    <span className="text-slate-500">Source</span>
                    <span className="font-medium">Not linked</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Role hired into</span>
                    <span className="font-medium">
                      {employee.title || "Not set"}
                    </span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Onboarding</span>
                    <span className="rounded-full bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                      Coming soon
                    </span>
                  </li>
                </ul>
              </div>

              {/* PERFORMANCE */}
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <h2 className="text-sm font-semibold text-slate-900 mb-1">
                  Performance snapshot
                </h2>

                <ul className="space-y-1.5 text-xs text-slate-700 mt-2">
                  <li className="flex justify-between">
                    <span className="text-slate-500">Last review</span>
                    <span className="text-slate-400">Not recorded</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Next review</span>
                    <span className="text-slate-400">Not scheduled</span>
                  </li>
                  <li className="flex justify-between">
                    <span className="text-slate-500">Goals</span>
                    <span className="font-medium">No goals</span>
                  </li>
                </ul>
              </div>
            </section>

            {/* ACTIVITY TIMELINE */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Activity timeline
              </h2>
              <EventsTimeline events={events} />
            </div>

            {/* AI INSIGHTS */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
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
