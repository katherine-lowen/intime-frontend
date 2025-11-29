// src/app/teams/[id]/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type TeamDetail = {
  id: string;
  name: string;
  employeesCount: number;
  employees: {
    id: string;
    employeeId?: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    title?: string | null;
    department?: string | null;
    location?: string | null;
    status?: EmployeeStatus | null;
    managerId?: string | null;
  }[];
};

async function getTeam(id: string): Promise<TeamDetail> {
  return api.get<TeamDetail>(`/teams/${id}`);
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
      return "Active";
  }
}

export default async function TeamPage({
  params,
}: {
  params: { id: string };
}) {
  const teamId = params.id;
  const team = await getTeam(teamId);

  return (
    <main className="mx-auto max-w-5xl px-6 py-8">
      {/* Breadcrumbs */}
      <div className="mb-4 flex items-center gap-2 text-xs text-slate-400">
        <Link href="/people" className="text-indigo-600 hover:underline">
          People
        </Link>
        <span className="text-slate-300">/</span>
        <Link href="/teams" className="text-indigo-600 hover:underline">
          Teams
        </Link>
        <span className="text-slate-300">/</span>
        <span>Team</span>
      </div>

      {/* Header */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {team.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {team.employeesCount === 1
              ? "1 person in this team."
              : `${team.employeesCount} people in this team.`}
          </p>
        </div>
        <Link
          href="/org"
          className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-xs font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
        >
          View in org chart
        </Link>
      </header>

      {/* Members table */}
      {team.employees.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-8 text-center text-sm text-slate-600">
          <p>No members yet.</p>
          <p className="mt-2">
            Assign employees to this team from their profile page in the People
            directory.
          </p>
        </section>
      ) : (
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-100 text-sm">
            <thead className="bg-slate-50/80">
              <tr className="text-xs uppercase tracking-[0.14em] text-slate-500">
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Department</th>
                <th className="px-4 py-3 text-left">Location</th>
                <th className="px-4 py-3 text-left">Status</th>
                <th className="px-4 py-3 text-right">Profile</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {team.employees.map((e) => {
                const id = e.employeeId || e.id;
                const fullName = `${e.firstName} ${e.lastName}`.trim();
                return (
                  <tr key={id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={`/people/${id}`}
                          className="text-sm font-medium text-slate-900 hover:text-indigo-600"
                        >
                          {fullName || "Unnamed"}
                        </Link>
                        {e.email && (
                          <span className="text-xs text-slate-500">
                            {e.email}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {e.title || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {e.department || "—"}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {e.location || "—"}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {statusLabel(e.status || "ACTIVE")}
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      <Link
                        href={`/people/${id}`}
                        className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        Open profile
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      )}
    </main>
  );
}
