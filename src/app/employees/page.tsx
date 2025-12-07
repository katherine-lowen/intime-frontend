// src/app/employees/page.tsx
import Link from "next/link";
import api from "@/lib/api";

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
};

type SearchParams = Record<string, string | string[] | undefined>;

function first(sp: SearchParams, key: string): string | undefined {
  const v = sp[key];
  return Array.isArray(v) ? v[0] : v;
}

async function fetchEmployees(sp: SearchParams): Promise<Employee[]> {
  const q = first(sp, "q");
  const dept = first(sp, "dept");
  const loc = first(sp, "loc");

  const params = new URLSearchParams();
  if (q) params.set("q", q);
  if (dept) params.set("dept", dept);
  if (loc) params.set("loc", loc);

  const qs = params.toString();
  const url = qs ? `/employees?${qs}` : "/employees";

  const employees = await api.get<Employee[]>(url);
  // normalize possible undefined → []
  return employees ?? [];
}

function formatStatus(status?: EmployeeStatus | null) {
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

export default async function EmployeesPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const employees = await fetchEmployees(sp);

  const q = first(sp, "q") ?? "";
  const dept = first(sp, "dept") ?? "";
  const loc = first(sp, "loc") ?? "";

  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-6 px-6 py-8">
      {/* HEADER */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Employees</h1>
          <p className="mt-1 text-sm text-slate-500">
            Search and filter everyone in the organization.
          </p>
        </div>
        <Link
          href="/people/new"
          className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
        >
          Add employee
        </Link>
      </header>

      {/* FILTERS */}
      <form className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm text-xs text-slate-700">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Search
            </label>
            <input
              name="q"
              defaultValue={q}
              placeholder="Name or email"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Department
            </label>
            <input
              name="dept"
              defaultValue={dept}
              placeholder="e.g. Sales"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-medium uppercase tracking-wide text-slate-500">
              Location
            </label>
            <input
              name="loc"
              defaultValue={loc}
              placeholder="e.g. Remote"
              className="rounded-md border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
        </div>

        <div className="mt-3 flex items-center justify-end gap-2">
          <Link
            href="/employees"
            className="text-[11px] font-medium text-slate-500 hover:text-slate-700"
          >
            Clear
          </Link>
          <button
            type="submit"
            className="inline-flex items-center rounded-full bg-slate-900 px-4 py-1.5 text-[11px] font-semibold text-slate-50 hover:bg-slate-800"
          >
            Apply filters
          </button>
        </div>
      </form>

      {/* TABLE */}
      <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        {employees.length === 0 ? (
          <div className="px-6 py-8 text-sm text-slate-500">
            No employees found. Try adjusting filters or add someone new.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-[11px] uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Title</th>
                  <th className="px-4 py-2 text-left">Department</th>
                  <th className="px-4 py-2 text-left">Location</th>
                  <th className="px-4 py-2 text-left">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white text-xs">
                {employees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2">
                      <Link
                        href={`/people/${e.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600"
                      >
                        {e.firstName} {e.lastName}
                      </Link>
                      <div className="text-[11px] text-slate-500">
                        {e.email ?? "—"}
                      </div>
                    </td>
                    <td className="px-4 py-2">{e.title ?? "—"}</td>
                    <td className="px-4 py-2">{e.department ?? "—"}</td>
                    <td className="px-4 py-2">{e.location ?? "—"}</td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-medium text-slate-700">
                        {formatStatus(e.status ?? "ACTIVE")}
                      </span>
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
