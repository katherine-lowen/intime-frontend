// src/app/employee-documents/page.tsx
import Link from "next/link";
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type EmployeeDocStatus = "SENT" | "SIGNED" | "VOID";

type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
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

async function getDocuments(): Promise<EmployeeDocument[]> {
  try {
    const docs = await api.get<EmployeeDocument[]>("/employee-documents");
    // api.get may return undefined – normalize to an empty array
    return docs ?? [];
  } catch (err) {
    console.error("Failed to load employee documents:", err);
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
  const documents = await getDocuments();

  return (
    <main className="px-6 py-8 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Documents
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            Employee documents
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Track offers, NDAs, and other employee-facing documents.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white/90 shadow-sm">
        {documents.length === 0 ? (
          <div className="px-4 py-10 text-center text-sm text-slate-500">
            No documents found yet. Once you create or send an employee document,
            it will appear here.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-t border-slate-100 text-sm">
              <thead className="bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Title</th>
                  <th className="px-4 py-2 text-left font-medium">Employee</th>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Status</th>
                  <th className="px-4 py-2 text-left font-medium">Created</th>
                  <th className="px-4 py-2 text-left font-medium">Signed</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {documents.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-2 text-sm">
                      <Link
                        href={`${(globalThis as any).__INTIME_ORG_SLUG__ ? `/org/${(globalThis as any).__INTIME_ORG_SLUG__}` : ""}/employee-documents/${doc.id}`}
                        className="font-medium text-indigo-600 hover:underline"
                      >
                        {doc.title}
                      </Link>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-700">
                      {doc.employee ? (
                        <Link
                          href={`${(globalThis as any).__INTIME_ORG_SLUG__ ? `/org/${(globalThis as any).__INTIME_ORG_SLUG__}` : ""}/people/${doc.employee.id}`}
                          className="hover:underline"
                        >
                          {formatEmployeeName(doc.employee)}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {doc.kind ?? "—"}
                    </td>
                    <td className="px-4 py-2 text-xs">
                      <span
                        className={
                          doc.status === "SIGNED"
                            ? "inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 font-medium text-emerald-700"
                            : doc.status === "VOID"
                            ? "inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700"
                            : "inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-medium text-amber-700"
                        }
                      >
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {formatDate(doc.createdAt)}
                    </td>
                    <td className="px-4 py-2 text-sm text-slate-600">
                      {formatDate(doc.signedAt)}
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
