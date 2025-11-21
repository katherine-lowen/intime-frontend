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

export default async function PersonPage({
  params,
}: {
  params: { id: string };
}) {
  const [employee, events] = await Promise.all([
    getEmployee(params.id),
    getEmployeeEvents(params.id).catch(() => []),
  ]);

  const fullName = `${employee.firstName} ${employee.lastName}`;

  return (
    <main className="space-y-6 px-6 py-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-slate-50">
            {employee.firstName[0]}
            {employee.lastName[0]}
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              {fullName}
            </h1>
            <p className="text-sm text-slate-600">
              {employee.title || "Title not set"}
              {employee.department ? ` • ${employee.department}` : ""}
              {employee.location ? ` • ${employee.location}` : ""}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {employee.email && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  {employee.email}
                </span>
              )}
              {employee.manager && (
                <span className="rounded-full bg-slate-100 px-3 py-1 text-slate-700">
                  Reports to {employee.manager.firstName}{" "}
                  {employee.manager.lastName}
                </span>
              )}
              <span
                className={[
                  "inline-flex items-center rounded-full border px-3 py-1 text-[11px] font-medium",
                  statusClass(employee.status ?? null),
                ].join(" ")}
              >
                {statusLabel(employee.status ?? null)}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Timelines */}
      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            Activity timeline
          </h2>
          <EventsTimeline events={events} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-sm">
          <h2 className="mb-2 text-sm font-semibold text-slate-900">
            AI summary
          </h2>
          <AiPeopleTimeline employeeId={employee.id} />
        </div>
      </section>
    </main>
  );
}
