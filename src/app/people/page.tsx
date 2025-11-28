// src/app/people/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

type EmployeeRow = {
  id?: string;
  employeeId?: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  location?: string | null;
  status?: EmployeeStatus;
  // plus anything else the backend sends
  [key: string]: any;
};

async function getEmployees(): Promise<EmployeeRow[]> {
  return api.get<EmployeeRow[]>("/employees");
}

function getEmployeeDisplayId(e: EmployeeRow): string | null {
  // Try a bunch of common shapes, very defensively
  const anyE = e as any;
  return (
    e.id ??
    e.employeeId ??
    anyE.employee_id ??
    anyE.employeeID ??
    null
  );
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
  const employees = await getEmployees();

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              People hub
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Your live directory of everyone in the organization.
            </p>
          </div>

          <Link
            href="/people/new"
            className="inline-flex items-center rounded-full bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            Add employee
          </Link>
        </header>

        {/* DIRECTORY */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Directory</h2>
              <p className="mt-1 text-xs text-slate-500">
                Click a row to open the full profile.
              </p>
            </div>
            <div className="text-xs text-slate-500">
              {employees.length} {employees.length === 1 ? "person" : "people"}
            </div>
          </div>

          {employees.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-xs text-slate-600">
              No employees yet. Once you add people to your org, they&apos;ll
              appear here.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Name
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Title
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Department
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Location
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Status
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                      ID (debug)
                    </th>
                    <th className="px-4 py-2" />
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {employees.map((e, idx) => {
                    const displayId = getEmployeeDisplayId(e);
                    const fullName = `${e.firstName} ${e.lastName}`.trim();
                    return (
                      <tr key={displayId ?? idx}>
                        <td className="px-4 py-2 align-middle">
                          {displayId ? (
                            <Link
                              href={`/people/${displayId}`}
                              className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                            >
                              {fullName || "Unnamed person"}
                            </Link>
                          ) : (
                            <span className="text-sm font-medium text-slate-900">
                              {fullName || "Unnamed person"}
                            </span>
                          )}
                          {e.email && (
                            <div className="text-xs text-slate-500">
                              {e.email}
                            </div>
                          )}
                        </td>
                        <td className="px-4 py-2 align-middle text-sm text-slate-700">
                          {e.title ?? "—"}
                        </td>
                        <td className="px-4 py-2 align-middle text-sm text-slate-700">
                          {e.department ?? "—"}
                        </td>
                        <td className="px-4 py-2 align-middle text-sm text-slate-700">
                          {e.location ?? "—"}
                        </td>
                        <td className="px-4 py-2 align-middle text-sm">
                          <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                            <span className="mr-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            {formatStatus(e.status)}
                          </span>
                        </td>
                        <td className="px-4 py-2 align-middle text-xs text-slate-500">
                          {displayId ?? "—"}
                        </td>
                        <td className="px-4 py-2 align-middle text-right text-xs">
                          {displayId && (
                            <Link
                              href={`/people/${displayId}`}
                              className="text-indigo-600 hover:text-indigo-500"
                            >
                              Open
                            </Link>
                          )}
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
