// src/app/teams/[id]/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Team = {
  id: string;
  orgId: string;
  name: string;
  memberCount?: number;
  createdAt?: string;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus | null;
  teamId?: string | null;
};

type EventItem = {
  id: string;
  type: string;
  source: string;
  summary?: string | null;
  createdAt?: string | null;
  employeeId?: string | null;
  jobId?: string | null;
};

async function getTeams(): Promise<Team[]> {
  return api.get<Team[]>("/teams");
}

async function getEmployees(): Promise<Employee[]> {
  return api.get<Employee[]>("/employees");
}

async function getEvents(): Promise<EventItem[]> {
  return api.get<EventItem[]>("/events");
}

// Next 16: params is a Promise in server components, so we await it
type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function TeamDetailPage({ params }: PageProps) {
  const { id } = await params;
  const teamId = id;

  let teams: Team[] = [];
  let employees: Employee[] = [];
  let events: EventItem[] = [];

  try {
    [teams, employees, events] = await Promise.all([
      getTeams(),
      getEmployees(),
      getEvents(),
    ]);
  } catch (err) {
    console.error("Failed to load team detail data", err);
    return (
      <main className="p-6 space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
        <p className="text-sm text-red-600">
          Something went wrong while loading this team from the API.
        </p>
      </main>
    );
  }

  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return (
      <main className="p-6 space-y-4">
        <header className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Team</h1>
            <p className="text-sm text-slate-600">
              This team could not be found.
            </p>
          </div>
          <Link
            href="/teams"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-800 hover:bg-slate-50"
          >
            ← Back to teams
          </Link>
        </header>
        <p className="text-sm text-slate-600">
          It may have been deleted or you may have followed an old link.
        </p>
      </main>
    );
  }

  const members = employees.filter((e) => e.teamId === teamId);
  const activeMembers = members.filter((m) => m.status === "ACTIVE");

  // Events for people on this team
  const teamMemberIds = new Set(members.map((m) => m.id));
  const teamEvents = events
    .filter((ev) => ev.employeeId && teamMemberIds.has(ev.employeeId))
    .sort((a, b) => {
      const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bTime - aTime;
    })
    .slice(0, 20);

  return (
    <main className="flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            {team.name}
          </h1>
          <p className="text-sm text-slate-600">
            {members.length === 0
              ? "No members assigned yet."
              : `${members.length} people • ${activeMembers.length} active`}
          </p>
          {team.createdAt && (
            <p className="text-xs text-slate-500">
              Created{" "}
              {new Date(team.createdAt).toLocaleDateString(undefined, {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <Link
            href="/teams"
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
          >
            ← All teams
          </Link>
          <Link
            href={`/teams/${team.id}/edit`}
            className="rounded-full border border-slate-200 bg-white px-3 py-1.5 text-[11px] font-medium text-slate-800 hover:bg-slate-50"
          >
            Edit team
          </Link>
          <Link
            href={`/teams/${team.id}/intelligence`}
            className="rounded-full border border-slate-200 bg-slate-900 px-3 py-1.5 text-[11px] font-medium text-white hover:bg-slate-800"
          >
            Open intelligence
          </Link>
        </div>
      </header>

      {/* Main layout: members + recent activity */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Members */}
        <section className="md:col-span-2 space-y-3 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold tracking-tight">
              Team members
            </h2>
            <Link
              href="/people"
              className="text-[11px] text-slate-500 hover:underline"
            >
              Manage people →
            </Link>
          </div>

          {members.length === 0 ? (
            <p className="text-xs text-slate-500">
              No one has been assigned to this team yet. Once you link employees
              to this team, they&apos;ll appear here with status and role.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100 rounded-lg border border-slate-100 bg-white">
              {members.map((m) => (
                <li
                  key={m.id}
                  className="flex items-center justify-between gap-3 px-3 py-2 text-xs"
                >
                  <div className="flex flex-col">
                    <Link
                      href={`/people/${m.id}`}
                      className="font-medium text-slate-900 hover:underline"
                    >
                      {m.firstName} {m.lastName}
                    </Link>
                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      {m.title && <span>{m.title}</span>}
                      {m.department && (
                        <>
                          <span>·</span>
                          <span>{m.department}</span>
                        </>
                      )}
                      {m.email && (
                        <>
                          <span>·</span>
                          <span>{m.email}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    {m.status
                      ? m.status.replace(/_/g, " ").toLowerCase()
                      : "—"}
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Recent activity */}
        <section className="space-y-3 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
          <h2 className="text-sm font-semibold tracking-tight">
            Recent activity
          </h2>

          {teamEvents.length === 0 ? (
            <p className="text-xs text-slate-500">
              No recent events for this team yet. As hires, status changes, and
              reviews happen for team members, they&apos;ll show up here.
            </p>
          ) : (
            <ul className="space-y-2 text-xs">
              {teamEvents.map((ev) => (
                <li
                  key={ev.id}
                  className="rounded-md bg-slate-50 px-2.5 py-2 flex flex-col gap-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium text-slate-800">
                      {ev.summary || ev.type}
                    </span>
                    <span className="text-[10px] text-slate-500">
                      {ev.createdAt
                        ? new Date(ev.createdAt).toLocaleDateString(
                            undefined,
                            {
                              month: "short",
                              day: "numeric",
                            },
                          )
                        : ""}
                    </span>
                  </div>
                  <div className="flex flex-wrap items-center gap-2 text-[10px] text-slate-500">
                    <span className="uppercase tracking-wide rounded-full border border-slate-200 bg-white px-2 py-0.5">
                      {ev.type}
                    </span>
                    <span>·</span>
                    <span>{ev.source}</span>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </main>
  );
}
