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

async function getEmployee(id: string): Promise<Employee | null> {
  if (!id) return null;

  try {
    return await api.get<Employee>(`/employees/${id}`);
  } catch (err) {
    console.error(`[people/[id]] Failed to load employee ${id}`, err);
    return null;
  }
}

async function getEmployeeEvents(id: string): Promise<EventItem[]> {
  if (!id) return [];
  try {
    return await api.get<EventItem[]>(`/events?employeeId=${id}`);
  } catch (err) {
    console.error(`[people/[id]] Failed to load events for employee ${id}`, err);
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

export default async function PersonPage({
  params,
}: {
  // 👇 Next 16: params is a Promise, so we type it that way
  params: Promise<{ id: string }>;
}) {
  // 👇 unwrap the promise
  const { id } = await params;

  // If somehow still missing, bail gracefully
  if (!id) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Person not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find this person in the directory. The profile URL
            is missing an employee id.
          </p>
        </main>
      </AuthGate>
    );
  }

  const [employee, events] = await Promise.all([
    getEmployee(id),
    getEmployeeEvents(id),
  ]);

  if (!employee) {
    return (
      <AuthGate>
        <main className="mx-auto max-w-5xl px-6 py-8">
          <h1 className="text-xl font-semibold text-slate-900">
            Person not found
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            We couldn&apos;t find this person in the directory. They may have
            been removed, or there was an issue loading their record.
          </p>
        </main>
      </AuthGate>
    );
  }

  const fullName = `${employee.firstName} ${employee.lastName}`.trim();

  return (
    <AuthGate>
      <main className="px-6 py-8 mx-auto max-w-5xl space-y-8">
        {/* HERO */}
        <section className="flex flex-col gap-6 rounded-3xl border border-slate-200 bg-gradient-to-br from-slate-50 to-indigo-50 p-6 shadow-sm md:flex-row md:items-center md:justify-between">
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
                {employee.title || "No title"}{" "}
                {employee.department && <>• {employee.department}</>}{" "}
                {employee.location && <>• {employee.location}</>}
              </p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                {employee.email && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
                    {employee.email}
                  </span>
                )}
                {employee.manager && (
                  <span className="rounded-full bg-white border border-slate-200 px-3 py-1 text-xs text-slate-700">
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

          {/* Tenure card */}
          <div className="rounded-2xl bg-slate-900 text-slate-50 px-4 py-3 text-xs w-full max-w-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold">Tenure</span>
              <span className="opacity-70">Demo data</span>
            </div>
            <div className="mt-1 text-lg font-semibold">6 months</div>
            <div className="mt-2 space-y-0.5 opacity-80">
              <div>Start date: 5/28/2025</div>
              <div>
                Joined Intime:{" "}
                {employee.createdAt
                  ? new Date(employee.createdAt).toLocaleDateString()
                  : "Unknown"}
              </div>
            </div>
          </div>
        </section>

        {/* MAIN GRID */}
        <section className="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)]">
          {/* LEFT COLUMN */}
          <div className="space-y-4">
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
              </ul>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div className="space-y-4">
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
