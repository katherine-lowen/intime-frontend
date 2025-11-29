// src/app/people/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type Employee = {
  employeeId?: string;
  id?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus | null;
};

async function getEmployees(): Promise<Employee[]> {
  return api.get<Employee[]>("/employees");
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

function statusBadgeClasses(status?: EmployeeStatus | null) {
  switch (status) {
    case "ACTIVE":
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
    case "ON_LEAVE":
      return "bg-amber-50 text-amber-700 border-amber-100";
    case "CONTRACTOR":
      return "bg-sky-50 text-sky-700 border-sky-100";
    case "ALUMNI":
      return "bg-slate-100 text-slate-600 border-slate-200";
    default:
      return "bg-emerald-50 text-emerald-700 border-emerald-100";
  }
}

export default async function PeoplePage() {
  let employees: Employee[] = [];
  let loadError: string | null = null;

  try {
    employees = await getEmployees();
  } catch (err) {
    console.error("[PeoplePage] Failed to load /employees", err);
    loadError = "We couldn’t load your people data just now.";
  }

  // Derive simple filter values
  const departments = Array.from(
    new Set(
      employees
        .map((e) => (e.department || "").trim())
        .filter((d) => d.length > 0),
    ),
  ).sort();

  const totalActive = employees.filter(
    (e) => (e.status || "ACTIVE") === "ACTIVE",
  ).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-8">
      {/* Optional error banner */}
      {loadError && (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-xs text-amber-800">
          {loadError} We&apos;re showing an empty directory instead.
        </div>
      )}

      {/* Header row */}
      <header className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="text-xs text-slate-400">People</div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Everyone in your Intime workspace, across teams and locations.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2 text-xs">
          <div className="flex items-center gap-3 text-slate-500">
            <span>
              <span className="font-semibold text-slate-900">
                {employees.length}
              </span>{" "}
              total
            </span>
            <span className="h-4 w-px bg-slate-200" />
            <span>
              <span className="font-semibold text-emerald-700">
                {totalActive}
              </span>{" "}
              active
            </span>
          </div>
          <Link
            href="/people/new"
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-2 text-xs font-medium text-white shadow-sm hover:bg-slate-800"
          >
            New employee
          </Link>
        </div>
      </header>

      {/* Filters + search (static for now, frontend-only) */}
      <section className="mb-4 flex flex-wrap items-center gap-3 text-xs">
        <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-slate-500">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span>Active headcount</span>
          <span className="font-semibold text-slate-900">{totalActive}</span>
        </div>

        {departments.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 text-[11px] text-slate-500">
            <span className="uppercase tracking-[0.16em] text-slate-400">
              Departments
            </span>
            {departments.map((dept) => (
              <span
                key={dept}
                className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700"
              >
                {dept}
              </span>
            ))}
          </div>
        )}
      </section>

      {/* Directory table / grid */}
      {employees.length === 0 ? (
        <section className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center text-sm text-slate-600">
          <p>No employees yet.</p>
          <p className="mt-2">
            Get started by{" "}
            <Link
              href="/people/new"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              creating your first employee
            </Link>
            .
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
              {employees.map((e) => {
                const id = e.employeeId || e.id || "";
                const fullName = `${e.firstName} ${e.lastName}`.trim();
                return (
                  <tr key={id || fullName || e.email || Math.random()}>
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <Link
                          href={id ? `/people/${id}` : "#"}
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
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${statusBadgeClasses(
                          e.status || "ACTIVE",
                        )}`}
                      >
                        {statusLabel(e.status || "ACTIVE")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right text-xs">
                      {id ? (
                        <Link
                          href={`/people/${id}`}
                          className="rounded-full border border-slate-200 px-3 py-1 text-xs font-medium text-slate-700 hover:border-indigo-200 hover:bg-indigo-50 hover:text-indigo-700"
                        >
                          Open profile
                        </Link>
                      ) : (
                        <span className="text-[11px] text-slate-400">
                          No profile id
                        </span>
                      )}
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
