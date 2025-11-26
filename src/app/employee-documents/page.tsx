// src/app/employee-documents/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type EmployeeDocumentStatus = "SENT" | "SIGNED" | "VOID";

type Employee = {
  id: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  title?: string | null;
  department?: string | null;
};

type EmployeeDocument = {
  id: string;
  title: string;
  kind?: string | null;
  status: EmployeeDocumentStatus;
  notes?: string | null;
  signedAt?: string | null;
  createdAt?: string;
  employee?: Employee | null;
};

async function getDocuments(): Promise<EmployeeDocument[]> {
  try {
    return await api.get<EmployeeDocument[]>("/employee-documents");
  } catch (err) {
    console.error("Failed to load employee documents:", err);
    return [];
  }
}

function formatDate(value?: string | null) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleDateString();
}

function getEmployeeName(e?: Employee | null) {
  if (!e) return "Employee";
  const name = [e.firstName, e.lastName].filter(Boolean).join(" ");
  return name || e.email || "Employee";
}

function statusBadge(status: EmployeeDocumentStatus) {
  const base =
    "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border";
  switch (status) {
    case "SENT":
      return (
        <span
          className={`${base} border-amber-200 bg-amber-50 text-amber-800`}
        >
          Sent
        </span>
      );
    case "SIGNED":
      return (
        <span
          className={`${base} border-emerald-200 bg-emerald-50 text-emerald-800`}
        >
          Signed
        </span>
      );
    case "VOID":
      return (
        <span
          className={`${base} border-slate-200 bg-slate-50 text-slate-500`}
        >
          Void
        </span>
      );
    default:
      return (
        <span className={`${base} border-slate-200 bg-slate-50 text-slate-500`}>
          {status}
        </span>
      );
  }
}

export default async function EmployeeDocumentsPage() {
  const docs = await getDocuments();

  const sent = docs.filter((d) => d.status === "SENT");
  const signed = docs.filter((d) => d.status === "SIGNED");
  const voided = docs.filter((d) => d.status === "VOID");

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
        {/* HEADER */}
        <header className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Documents
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Track offer letters, contracts, and HR paperwork across your org.
            </p>
          </div>
          <Link
            href="/employee-documents/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            New document
          </Link>
        </header>

        {/* SUMMARY STRIP */}
        <section className="grid gap-4 sm:grid-cols-3">
          <DocStatCard
            label="Sent"
            value={sent.length}
            helper="Waiting to be signed"
          />
          <DocStatCard
            label="Signed"
            value={signed.length}
            helper="Completed documents"
          />
          <DocStatCard
            label="Voided"
            value={voided.length}
            helper="No longer active"
          />
        </section>

        {/* BUCKETS */}
        <section className="space-y-6">
          <DocBucket
            title="Awaiting signature"
            helper="Documents that are out for review or signature."
            empty="No documents are currently awaiting signature."
            items={sent}
          />
          <DocBucket
            title="Signed"
            helper="Completed documents that have been signed."
            empty="No signed documents yet."
            items={signed}
          />
          <DocBucket
            title="Voided"
            helper="Documents that have been cancelled or replaced."
            empty="No voided documents."
            items={voided}
          />
        </section>
      </main>
    </AuthGate>
  );
}

function DocStatCard({
  label,
  value,
  helper,
}: {
  label: string;
  value: number;
  helper: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="text-xs font-medium text-slate-500">{label}</div>
      <div className="mt-1 text-2xl font-semibold text-slate-900">
        {value}
      </div>
      <p className="mt-1 text-[11px] text-slate-500">{helper}</p>
    </div>
  );
}

function DocBucket({
  title,
  helper,
  empty,
  items,
}: {
  title: string;
  helper: string;
  empty: string;
  items: EmployeeDocument[];
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        <p className="text-xs text-slate-500">{helper}</p>
      </div>

      {items.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-4 text-sm text-slate-500">
          {empty}
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Document
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Employee
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Type
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Status
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Created
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-600">
                  Signed
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 bg-white">
              {items.map((d) => (
                <tr key={d.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 text-sm">
                    <div className="flex flex-col">
                      <Link
                        href={`/employee-documents/${d.id}`}
                        className="font-medium text-slate-900 hover:text-indigo-600 hover:underline"
                      >
                        {d.title}
                      </Link>
                      {d.notes && (
                        <span className="text-xs text-slate-500 line-clamp-1">
                          {d.notes}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-800">
                    {getEmployeeName(d.employee)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {d.kind || "—"}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {statusBadge(d.status)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatDate(d.createdAt)}
                  </td>
                  <td className="px-4 py-3 text-sm text-slate-700">
                    {formatDate(d.signedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
