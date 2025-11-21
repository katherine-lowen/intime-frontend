// src/app/people/page.tsx
import Link from "next/link";
import api from "@/lib/api";
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
  team?: { id: string; name: string } | null;
  createdAt?: string;
};

type Team = {
  id: string;
  name: string;
};

async function getEmployees(): Promise<Employee[]> {
  return api.get<Employee[]>("/employees");
}

async function getTeamsSafe(): Promise<Team[]> {
  try {
    return await api.get<Team[]>("/teams");
  } catch (err) {
    console.error("Failed to load teams (non-fatal for People page)", err);
    return [];
  }
}

function getInitials(firstName?: string | null, lastName?: string | null) {
  const f = firstName?.[0] ?? "";
  const l = lastName?.[0] ?? "";
  const res = `${f}${l}`.trim();
  return res || "??";
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

export default async function PeoplePage({
  searchParams,
}: {
  searchParams?: Record<string, string | string[] | undefined>;
}) {
  const [employees, teams] = await Promise.all([
    getEmployees(),
    getTeamsSafe(),
  ]);

  const q =
    typeof searchParams?.q === "string" ? searchParams.q.trim() : "";
  const statusFilter =
    typeof searchParams?.status === "string"
      ? (searchParams.status as EmployeeStatus | "ALL")
      : "ALL";
  const teamFilter =
    typeof searchParams?.teamId === "string" ? searchParams.teamId : "ALL";
  const deptFilter =
    typeof searchParams?.department === "string"
      ? searchParams.department
      : "ALL";
  const sort =
    typeof searchParams?.sort === "string" ? searchParams.sort : "name";

  // Build filter option sets
  const departments = Array.from(
    new Set(
      employees
        .map((e) => e.department)
        .filter((d): d is string => !!d && d.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  const locations = Array.from(
    new Set(
      employees
        .map((e) => e.location)
        .filter((l): l is string => !!l && l.trim().length > 0),
    ),
  ).sort((a, b) => a.localeCompare(b));

  // Filter employees
  let filtered = employees;

  if (q) {
    const lower = q.toLowerCase();
    filtered = filtered.filter((e) => {
      const fullName = `${e.firstName} ${e.lastName}`.toLowerCase();
      return (
        fullName.includes(lower) ||
        (e.email ?? "").toLowerCase().includes(lower) ||
        (e.title ?? "").toLowerCase().includes(lower) ||
        (e.department ?? "").toLowerCase().includes(lower)
      );
    });
  }

  if (statusFilter !== "ALL") {
    filtered = filtered.filter((e) => e.status === statusFilter);
  }

  if (teamFilter !== "ALL") {
    filtered = filtered.filter((e) => e.team?.id === teamFilter);
  }

  if (deptFilter !== "ALL") {
    filtered = filtered.filter((e) => e.department === deptFilter);
  }

  // Sorting
  filtered = [...filtered].sort((a, b) => {
    if (sort === "recent") {
      const da = a.createdAt ? Date.parse(a.createdAt) : 0;
      const db = b.createdAt ? Date.parse(b.createdAt) : 0;
      return db - da;
    }

    // default: name
    const nameA = `${a.lastName ?? ""} ${a.firstName ?? ""}`.toLowerCase();
    const nameB = `${b.lastName ?? ""} ${b.firstName ?? ""}`.toLowerCase();
    return nameA.localeCompare(nameB);
  });

  const total = employees.length;
  const activeCount = employees.filter((e) => e.status === "ACTIVE").length;

  return (
    <main className="space-y-6">
      {/* Header */}
      <section className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            People
          </h1>
          <p className="text-sm text-slate-600">
            Directory of everyone in your organization — powered by Intime HRIS.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="chip bg-slate-900 text-slate-50">
            {activeCount} active
          </span>
          <span className="chip">{total} total</span>
          <Link href="/people/new" className="btn-primary">
            Add employee
          </Link>
        </div>
      </section>

      {/* Filters / search bar */}
      <section className="card px-4 py-3">
        <form className="flex flex-wrap items-end gap-3" method="GET">
          {/* Search */}
          <div className="flex-1 min-w-[220px] space-y-1">
            <label className="field-label" htmlFor="search">
              Search
            </label>
            <input
              id="search"
              name="q"
              defaultValue={q}
              placeholder="Search by name, email, title, or department"
              className="field-input"
              type="text"
            />
          </div>

          {/* Status */}
          <div className="w-[150px] space-y-1">
            <label className="field-label" htmlFor="status">
              Status
            </label>
            <select
              id="status"
              name="status"
              defaultValue={statusFilter}
              className="field-input"
            >
              <option value="ALL">All</option>
              <option value="ACTIVE">Active</option>
              <option value="ON_LEAVE">On leave</option>
              <option value="CONTRACTOR">Contractors</option>
              <option value="ALUMNI">Alumni</option>
            </select>
          </div>

          {/* Team */}
          <div className="w-[180px] space-y-1">
            <label className="field-label" htmlFor="teamId">
              Team
            </label>
            <select
              id="teamId"
              name="teamId"
              defaultValue={teamFilter}
              className="field-input"
            >
              <option value="ALL">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          {/* Department */}
          <div className="w-[180px] space-y-1">
            <label className="field-label" htmlFor="department">
              Department
            </label>
            <select
              id="department"
              name="department"
              defaultValue={deptFilter}
              className="field-input"
            >
              <option value="ALL">All departments</option>
              {departments.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div className="w-[160px] space-y-1">
            <label className="field-label" htmlFor="sort">
              Sort by
            </label>
            <select
              id="sort"
              name="sort"
              defaultValue={sort}
              className="field-input"
            >
              <option value="name">Name (A–Z)</option>
              <option value="recent">Recently added</option>
            </select>
          </div>

          {/* Submit */}
          <div className="space-y-1">
            <span className="field-label opacity-0">Apply</span>
            <button type="submit" className="btn-ghost">
              Apply
            </button>
          </div>
        </form>
      </section>

      {/* Table */}
      <section className="card px-4 py-4">
        <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
          <span>
            Showing{" "}
            <span className="font-medium text-slate-700">
              {filtered.length}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">{total}</span>{" "}
            employees
          </span>
        </div>

        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-500">
            No people match your filters yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-xs text-slate-500">
                  <th className="py-2 pr-4 font-medium">Person</th>
                  <th className="py-2 pr-4 font-medium">Role</th>
                  <th className="py-2 pr-4 font-medium">Department</th>
                  <th className="py-2 pr-4 font-medium">Team</th>
                  <th className="py-2 pr-4 font-medium">Location</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 pr-0 font-medium"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr
                    key={e.id}
                    className="border-b border-slate-100 last:border-0 hover:bg-slate-50/60"
                  >
                    {/* Person */}
                    <td className="py-2 pr-4 align-top">
                      <Link
                        href={`/people/${e.id}`}
                        className="flex items-center gap-3"
                      >
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-slate-50">
                          {getInitials(e.firstName, e.lastName)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium text-slate-900">
                            {e.firstName} {e.lastName}
                          </span>
                          {e.email && (
                            <span className="text-xs text-slate-500">
                              {e.email}
                            </span>
                          )}
                        </div>
                      </Link>
                    </td>

                    {/* Role */}
                    <td className="py-2 pr-4 align-top text-xs text-slate-700">
                      {e.title ?? "—"}
                    </td>

                    {/* Department */}
                    <td className="py-2 pr-4 align-top text-xs text-slate-700">
                      {e.department ?? "—"}
                    </td>

                    {/* Team */}
                    <td className="py-2 pr-4 align-top text-xs text-slate-700">
                      {e.team?.name ?? "—"}
                    </td>

                    {/* Location */}
                    <td className="py-2 pr-4 align-top text-xs text-slate-700">
                      {e.location ?? "—"}
                    </td>

                    {/* Status */}
                    <td className="py-2 pr-4 align-top text-xs">
                      <span
                        className={[
                          "inline-flex items-center rounded-full border px-2 py-0.5 text-[11px] font-medium",
                          statusClass(e.status ?? null),
                        ].join(" ")}
                      >
                        {statusLabel(e.status ?? null)}
                      </span>
                    </td>

                    {/* Chevron / view */}
                    <td className="py-2 pr-0 align-top text-right text-xs">
                      <Link
                        href={`/people/${e.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
