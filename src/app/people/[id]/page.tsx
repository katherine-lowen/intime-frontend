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

export default async function PersonPage({ params }: { params: { id: string } }) {
  const [employee, events] = await Promise.all([
    getEmployee(params.id),
    getEmployeeEvents(params.id).catch(() => []),
  ]);

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <AuthGate>
      <main className="px-8 py-8 space-y-8">

        {/* ======================== */}
        {/*       HERO SECTION       */}
        {/* ======================== */}
        <section className="rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 shadow-sm flex flex-col md:flex-row md:items-center md:justify-between gap-6">
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
                {employee.title || "No title"} • {employee.department || "No department"}
                {employee.location ? ` • ${employee.location}` : ""}
              </p>

              <div className="flex flex-wrap items-center gap-2 mt-2">
                {/* Email */}
                {employee.email && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    {employee.email}
                  </span>
                )}

                {/* Manager */}
                {employee.manager && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    Reports to {employee.manager.firstName} {employee.manager.lastName}
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
              </div>
            </div>
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
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
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
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
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
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
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
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE — TIMELINES */}
          <div className="space-y-6">
            {/* Activity timeline */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900 mb-3">
                Activity timeline
              </h2>
              <EventsTimeline events={events} />
            </div>

            {/* AI summary */}
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
