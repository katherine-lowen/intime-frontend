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
  startDate?: string | null;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string;
};

const MOCK_EMPLOYEE: Employee = {
  id: "demo-employee",
  firstName: "Katherine",
  lastName: "Soroka",
  email: "katherine@hireintime.ai",
  title: "Head of People & Talent",
  department: "People Operations",
  location: "Remote, US",
  status: "ACTIVE",
  manager: {
    id: "demo-manager",
    firstName: "Steven",
    lastName: "Meoni",
  },
  createdAt: new Date().toISOString(),
  startDate: new Date(
    new Date().getTime() - 180 * 24 * 60 * 60 * 1000
  ).toISOString(), // ~6 months ago
};

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

function formatDate(date?: string | null) {
  if (!date) return "Unknown";
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return "Unknown";
  return d.toLocaleDateString();
}

function computeTenure(startDate?: string | null) {
  if (!startDate) return "Not set";
  const start = new Date(startDate);
  if (Number.isNaN(start.getTime())) return "Not set";

  const now = new Date();
  const diffMs = now.getTime() - start.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 30) return `${diffDays} day${diffDays === 1 ? "" : "s"}`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12)
    return `${diffMonths} month${diffMonths === 1 ? "" : "s"}`;
  const diffYears = Math.floor(diffMonths / 12);
  return `${diffYears} yr${diffYears === 1 ? "" : "s"}`;
}

async function getEmployeeOrMock(id: string): Promise<Employee> {
  try {
    const emp = await api.get<Employee>(`/employees/${id}`);
    if (emp) return emp;
  } catch (err) {
    console.error("Failed to load employee, using mock", err);
  }
  return MOCK_EMPLOYEE;
}

async function getEmployeeEventsSafe(id: string): Promise<EventItem[]> {
  try {
    return await api.get<EventItem[]>(`/events?employeeId=${id}`);
  } catch (err) {
    console.error("Failed to load employee events", err);
    return [];
  }
}

export default async function PersonPage({
  params,
}: {
  params: { id: string };
}) {
  const employee = await getEmployeeOrMock(params.id);
  const events = await getEmployeeEventsSafe(employee.id);

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();
  const initials =
    (employee.firstName?.[0] ?? "").toUpperCase() +
    (employee.lastName?.[0] ?? "").toUpperCase();

  return (
    <AuthGate>
      <main className="px-8 py-8 space-y-8">
        {/* HERO */}
        <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-xl font-semibold text-white shadow">
              {initials || "?"}
            </div>

            <div className="space-y-1">
              <h1 className="text-3xl font-semibold text-slate-900">
                {fullName || "Unnamed person"}
              </h1>
              <p className="text-sm text-slate-600">
                {employee.title || "No title"} •{" "}
                {employee.department || "No department"}
                {employee.location ? ` • ${employee.location}` : ""}
              </p>

              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs">
                {employee.email && (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                    {employee.email}
                  </span>
                )}

                {employee.manager && (
                  <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-slate-700">
                    Reports to {employee.manager.firstName}{" "}
                    {employee.manager.lastName}
                  </span>
                )}

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

          <div className="space-y-2 rounded-2xl bg-slate-900/90 px-4 py-3 text-xs text-slate-100 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-100">Tenure</span>
              <span className="text-slate-300">
                {computeTenure(employee.startDate)}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Start date</span>
              <span>{formatDate(employee.startDate)}</span>
            </div>
            <div className="flex items-center justify-between text-slate-300">
              <span>Joined Intime</span>
              <span>{formatDate(employee.createdAt ?? null)}</span>
            </div>
          </div>
        </section>

        {/* MAIN LAYOUT */}
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
                  {formatDate(employee.createdAt ?? null)}
                </li>
              </ul>
            </div>
          </div>

          {/* RIGHT SIDE — TIMELINES */}
          <div className="space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-3 text-sm font-semibold text-slate-900">
                Activity timeline
              </h2>
              <EventsTimeline events={events} />
            </div>

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
