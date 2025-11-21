// src/app/employee-documents/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type EmployeeDocStatus = "SENT" | "SIGNED" | "VOID";

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

type EmployeeDocument = {
  id: string;
  orgId: string;
  title: string;
  kind?: string | null;
  status: EmployeeDocStatus;
  notes?: string | null;
  signedAt?: string | null;
  createdAt?: string | null;
  employee?: EmployeeLite | null;
};

async function getEmployeeDocuments(): Promise<EmployeeDocument[]> {
  try {
    return await api.get<EmployeeDocument[]>("/employee-documents/all");
  } catch (err) {
    console.error("Failed to load employee documents", err);
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function formatEmployeeName(emp?: EmployeeLite | null) {
  if (!emp) return "—";
  const full = `${emp.firstName ?? ""} ${emp.lastName ?? ""}`.trim();
  return full || "Unnamed";
}

export default async function EmployeeDocumentsPage() {
  const docs = await getEmployeeDocuments();

  const total = docs.length;
  const signed = docs.filter((d) => d.status === "SIGNED").length;
  const pending = docs.filter((d) => d.status === "SENT").length;

  return (
    <main className="px-6 py-8 space-y-6">
      <header className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Employee documents
          </h1>
          <p className="text-sm text-slate-600">
            Central view of offers, NDAs, policy acknowledgements and other
            documents by employee.
          </p>
        </div>
      </header>

      {/* Quick stats */}
      <section className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Total documents
          </p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{total}</p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Signed
          </p>
          <p className="mt-1 text-2xl font-semibold text-emerald-600">
            {signed}
          </p>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Pending
          </p>
          <p className="mt-1 text-2xl font-semibold text-amber-600">
            {pending}
          </p>
        </div>
      </section>

      {/* Table */}
      <section className="rounded-xl border border-slate-200 bg-white/90 shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            All employee documents
          </h2>
          <p className="text-xs text-slate-500">
            Click into a document to see details and AI insights.
          </p>
        </div>

        {docs.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No documents yet. Create documents from an employee&apos;s profile
            page.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2">Title</th>
                  <th className="px-4 py-2">Employee</th>
                  <th className="px-4 py-2">Kind</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Signed</th>
                  <th className="px-4 py-2">Created</th>
                  <th className="px-4 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {docs.map((doc) => {
                  const empName = formatEmployeeName(doc.employee);
                  return (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 align-middle">
                        <div className="flex flex-col">
                          <Link
                            href={`/employee-documents/${doc.id}`}
                            className="text-sm font-medium text-slate-900 hover:underline"
                          >
                            {doc.title}
                          </Link>
                          {doc.notes && (
                            <p className="mt-0.5 line-clamp-1 text-xs text-slate-500">
                              {doc.notes}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2 align-middle">
                        {doc.employee ? (
                          <Link
                            href={`/people/${doc.employee.id}`}
                            className="text-sm text-indigo-600 hover:underline"
                          >
                            {empName}
                          </Link>
                        ) : (
                          <span className="text-sm text-slate-500">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2 align-middle text-sm text-slate-700">
                        {doc.kind || "—"}
                      </td>
                      <td className="px-4 py-2 align-middle">
                        <span
                          className={
                            doc.status === "SIGNED"
                              ? "inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700"
                              : doc.status === "VOID"
                              ? "inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700"
                              : "inline-flex rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700"
                          }
                        >
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-4 py-2 align-middle text-sm text-slate-700">
                        {formatDate(doc.signedAt)}
                      </td>
                      <td className="px-4 py-2 align-middle text-sm text-slate-700">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-4 py-2 align-middle text-right">
                        <Link
                          href={`/employee-documents/${doc.id}`}
                          className="text-xs font-medium text-indigo-600 hover:underline"
                        >
                          View details →
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
  );
}
