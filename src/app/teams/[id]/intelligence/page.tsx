// src/app/teams/[id]/intelligence/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import { orgHref } from "@/lib/org-base";


export const dynamic = "force-dynamic";

type Team = {
  id: string;
  orgId: string;
  name: string;
  createdAt?: string;
};

type Employee = {
  id: string;
  orgId: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  createdAt?: string;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

async function getTeams(): Promise<Team[]> {
  try {
    const data = await api.get<Team[]>("/teams");
    return data ?? [];
  } catch (err) {
    console.error("Failed to load teams", err);
    return [];
  }
}

async function getEmployees(): Promise<Employee[]> {
  try {
    const data = await api.get<Employee[]>("/employees");
    return data ?? [];
  } catch (err) {
    console.error("Failed to load employees", err);
    return [];
  }
}

export default async function TeamIntelligencePage({ params }: PageProps) {
  const { id: teamId } = await params;

  let teams: Team[] = [];
  let employees: Employee[] = [];

  try {
    [teams, employees] = await Promise.all([getTeams(), getEmployees()]);
  } catch (err) {
    // getTeams/getEmployees already log & return []
    console.error("Failed to load team intelligence data", err);
  }

  const team = teams.find((t) => t.id === teamId);

  if (!team) {
    return (
      <AuthGate>
        <main className="p-6 space-y-4">
          <Link
            href={orgHref("/teams")}
            className="text-sm text-indigo-600 hover:underline"
          >
            ← Back to Teams
          </Link>
          <h1 className="text-2xl font-semibold">Team not found</h1>
          <p className="text-sm text-gray-600">
            We couldn&apos;t find that team. It may have been removed or the
            link is invalid.
          </p>
        </main>
      </AuthGate>
    );
  }

  // Simple heuristic: employees whose department == team name
  const members = employees.filter(
    (e) => (e.department ?? "").toLowerCase() === team.name.toLowerCase()
  );

  const createdLabel = team.createdAt
    ? new Date(team.createdAt).toLocaleDateString()
    : "—";

  return (
    <AuthGate>
      <main className="p-6 space-y-6">
        {/* Header / breadcrumb */}
        <header className="flex items-center justify-between gap-4">
          <div className="space-y-1">
            <Link
              href={orgHref("/teams")}
              className="text-xs text-indigo-600 hover:underline"
            >
              ← Back to Teams
            </Link>
            <h1 className="text-2xl font-semibold">{team.name}</h1>
            <p className="text-sm text-gray-600">
              Time and people intelligence for this team.
            </p>
          </div>
          <div className="text-right text-xs text-gray-500">
            Created {createdLabel}
          </div>
        </header>

        {/* Main layout: members + simple “intelligence” summary */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
          {/* Left: team members */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold">Team members</h2>
                <div className="text-xs text-gray-500">
                  {members.length}{" "}
                  {members.length === 1 ? "person" : "people"} in this team
                </div>
              </div>

              {members.length === 0 ? (
                <p className="mt-3 text-sm text-gray-600">
                  No people currently assigned to this team. Once you start
                  using this team name as a department on people records,
                  they&apos;ll show here.
                </p>
              ) : (
                <ul className="mt-3 divide-y">
                  {members.map((m) => (
                    <li
                      key={m.id}
                      className="flex items-center justify-between gap-3 py-2 text-sm"
                    >
                      <div className="flex flex-col">
                        <Link
                          href={`/people/${m.id}`}
                          className="font-medium hover:underline"
                        >
                          {m.firstName} {m.lastName}
                        </Link>
                        <span className="text-xs text-gray-500">
                          {m.title || "Title not set"}
                        </span>
                      </div>
                      <div className="text-right text-xs text-gray-500">
                        <div>{m.email || "—"}</div>
                        <div>{m.location || ""}</div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Right: basic intelligence summary (non-AI for now) */}
          <div className="space-y-4">
            <div className="rounded-lg border bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold">Team snapshot</h2>
              <p className="mt-2 text-sm text-gray-700">
                This view helps you understand who is on{" "}
                <strong>{team.name}</strong> and how they are distributed across
                roles and locations. As you add more people and events to
                Intime, this panel can evolve into a richer time-based view of
                team health and performance.
              </p>
              <ul className="mt-3 space-y-1 text-sm text-gray-700">
                <li>
                  • <strong>{members.length}</strong>{" "}
                  {members.length === 1 ? "member" : "members"} mapped to this
                  team via their department.
                </li>
                <li>
                  • Easy next step: standardize{" "}
                  <span className="font-mono text-xs">department</span> on
                  people records to match team names.
                </li>
                <li>
                  • Future: overlay hiring, performance, and time-off events for
                  this team over time.
                </li>
              </ul>
            </div>
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
