// src/app/people/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeListItem = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
};

async function getEmployees(): Promise<EmployeeListItem[]> {
  return api.get<EmployeeListItem[]>("/employees");
}

function formatStatus(status?: EmployeeStatus) {
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

export default async function PeoplePage() {
  let employees: EmployeeListItem[] = [];
  let loadError: string | null = null;

  try {
    employees = await getEmployees();
  } catch (err) {
    console.error("Failed to load employees", err);
    loadError = "Failed to load employees. Please try again.";
  }

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs text-slate-400">People / Directory</p>
            <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
              People hub
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Your live directory of everyone in the organization.
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs">
            <Link
              href="/people/new"
              className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
            >
              Add employee
            </Link>
          </div>
        </header>

        {/* DIRECTORY CARD */}
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Directory
              </h2>
              <p className="text-xs text-slate-500">
                Searchable list of everyone in your org.
              </p>
            </div>
            <span className="text-[11px] text-slate-500">
              {employees.length} {employees.length === 1 ? "person" : "people"}
            </span>
          </div>

          {loadError && (
            <div className="border-b border-slate-100 bg-red-50 px-4 py-3 text-xs text-red-700">
              {loadError}
            </div>
          )}

          {employees.length === 0 && !loadError ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No employees yet. Once you add people to your org, they&apos;ll
              appear here.
            </div>
          ) : employees.length === 0 ? (
            <div className="px-4 py-6 text-sm text-slate-500">
              No employees to display.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Role</th>
                    <th className="px-4 py-2 text-left">Department</th>
                    <th className="px-4 py-2 text-left">Location</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-right">Profile</th>
                  </tr>
                </thead>
                <tbody>
                  {employees.map((emp) => {
                    const fullName = `${emp.firstName} ${emp.lastName}`;
                    return (
                      <tr
                        key={emp.id}
                        className="border-t border-slate-100 hover:bg-slate-50/70"
                      >
                        <td className="px-4 py-2">
                          <div className="font-medium text-slate-900">
                            {fullName}
                          </div>
                          <div className="text-xs text-slate-500">
                            {emp.email ?? ""}
                          </div>
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-700">
                          {emp.title ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-700">
                          {emp.department ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-700">
                          {emp.location ?? "—"}
                        </td>
                        <td className="px-4 py-2 text-xs text-slate-700">
                          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                            {formatStatus(emp.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 text-right text-xs">
                          <Link
                            href={`/people/${emp.id}`}
                            className="font-medium text-indigo-600 hover:underline"
                          >
                            Open profile →
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
