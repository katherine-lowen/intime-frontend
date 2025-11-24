// src/app/people/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI" | string;

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  title?: string | null;
  department?: string | null;
  status?: EmployeeStatus | null;
};

async function getEmployees(): Promise<Employee[]> {
  try {
    return await api.get<Employee[]>("/employees");
  } catch (err) {
    console.error("Failed to load employees", err);
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

export default async function PeoplePage() {
  const employees = await getEmployees();

  return (
    <AuthGate>
      <main className="mx-auto max-w-5xl space-y-6 px-6 py-8">
        {/* Header */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              People
            </h1>
            <p className="text-sm text-slate-600">
              Directory of everyone in your organization.
            </p>
          </div>
          <Link
            href="/people/new"
            className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90"
          >
            Add person
          </Link>
        </header>

        {/* Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white/80 shadow-sm">
          <table className="min-w-full text-sm">
            <thead className="border-b bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-2 text-left">Name</th>
                <th className="px-4 py-2 text-left">Title</th>
                <th className="px-4 py-2 text-left">Department</th>
                <th className="px-4 py-2 text-left">Status</th>
                <th className="px-4 py-2 text-right"></th>
              </tr>
            </thead>
            <tbody>
              {employees.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-6 text-center text-sm text-slate-500"
                  >
                    No people yet. Add your first teammate to get started.
                  </td>
                </tr>
              ) : (
                employees.map((e) => {
                  const fullName = `${e.firstName} ${e.lastName}`.trim();
                  return (
                    <tr
                      key={e.id}
                      className="border-b last:border-b-0 hover:bg-slate-50/70"
                    >
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-xs font-semibold text-white">
                            {(e.firstName?.[0] ?? "").toUpperCase()}
                            {(e.lastName?.[0] ?? "").toUpperCase()}
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">
                              {fullName || "Unnamed person"}
                            </div>
                            {e.email && (
                              <div className="text-xs text-slate-500">
                                {e.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-slate-700">
                          {e.title || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="text-xs text-slate-700">
                          {e.department || "—"}
                        </span>
                      </td>
                      <td className="px-4 py-2">
                        <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-medium text-slate-700">
                          {statusLabel(e.status)}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Link
                          href={`/people/${e.id}`}
                          className="text-xs font-medium text-indigo-600 hover:underline"
                        >
                          Open profile →
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </section>
      </main>
    </AuthGate>
  );
}
