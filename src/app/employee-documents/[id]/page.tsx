// src/app/employee-documents/[id]/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import AiEmployeeDocumentPanel from "@/components/ai-employee-document-panel";

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

async function getEmployeeDocument(id: string): Promise<EmployeeDocument | null> {
  try {
    return await api.get<EmployeeDocument>(`/employee-documents/${id}`);
  } catch (err) {
    console.error("Failed to load employee document", err);
    return null;
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

export default async function EmployeeDocumentDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const doc = await getEmployeeDocument(params.id);

  if (!doc) {
    return (
      <main className="px-6 py-8">
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800">
          Document not found or no longer available.
        </div>
      </main>
    );
  }

  const employeeName = formatEmployeeName(doc.employee);

  return (
    <main className="px-6 py-8 space-y-6">
      <header className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Employee document
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            {doc.title}
          </h1>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-slate-600">
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
            {doc.kind && (
              <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 font-medium text-slate-700">
                {doc.kind}
              </span>
            )}
          </div>
        </div>
        <div className="flex flex-col items-start gap-2 text-xs text-slate-600 md:items-end">
          {doc.employee && (
            <div>
              <p className="text-[11px] uppercase tracking-wide text-slate-500">
                Employee
              </p>
              <Link
                href={`/people/${doc.employee.id}`}
                className="text-sm font-medium text-indigo-600 hover:underline"
              >
                {employeeName}
              </Link>
              {(doc.employee.title || doc.employee.department) && (
                <p className="text-xs text-slate-500">
                  {doc.employee.title}
                  {doc.employee.title && doc.employee.department && " · "}
                  {doc.employee.department}
                </p>
              )}
            </div>
          )}
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">
              Timestamps
            </p>
            <p className="text-xs text-slate-600">
              Created: {formatDate(doc.createdAt)}
            </p>
            <p className="text-xs text-slate-600">
              Signed: {formatDate(doc.signedAt)}
            </p>
          </div>
        </div>
      </header>

      <section className="grid gap-6 md:grid-cols-[minmax(0,2fr)_minmax(0,1.5fr)]">
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 bg-white/90 p-4 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">
              Document notes
            </h2>
            {doc.notes ? (
              <p className="mt-2 whitespace-pre-wrap text-sm text-slate-700">
                {doc.notes}
              </p>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No notes saved yet. You can use this field to store context
                about how this document is used (e.g. “Offer template v3 – East
                Coast sales hires”).
              </p>
            )}
          </div>
        </div>

        <div>
          <AiEmployeeDocumentPanel
            documentId={doc.id}
            documentTitle={doc.title}
          />
        </div>
      </section>
    </main>
  );
}
