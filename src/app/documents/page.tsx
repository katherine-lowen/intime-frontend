// src/app/documents/page.tsx
import api from "@/lib/api";
import Link from "next/link";

export const dynamic = "force-dynamic";
export const revalidate = 0;


type EmployeeLite = {
  id: string;
  firstName: string;
  lastName: string;
  title?: string | null;
  department?: string | null;
};

type EmployeeDocument = {
  id: string;
  title: string;
  kind?: string | null;
  status: "SENT" | "SIGNED" | "VOID";
  notes?: string | null;
  signedAt?: string | null;
  createdAt?: string | null;
  employee: EmployeeLite;
};

async function getDocuments(): Promise<EmployeeDocument[]> {
  const data = await api.get<EmployeeDocument[]>("/employee-documents");

  // Guard against api.get possibly returning undefined
  return data ?? [];
}

export default async function DocumentsPage() {
  const docs = await getDocuments();

  return (
    <main className="space-y-6 p-6">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Documents
          </h1>
          <p className="text-sm text-slate-600">
            Offers, NDAs, and other employee documents across your org.
          </p>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white/80">
        <table className="min-w-full text-sm">
          <thead className="border-b bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-3 py-2 text-left">Employee</th>
              <th className="px-3 py-2 text-left">Document</th>
              <th className="px-3 py-2 text-left">Type</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Dates</th>
              <th className="px-3 py-2 text-left">Notes</th>
              <th className="px-3 py-2 text-right"></th>
            </tr>
          </thead>
          <tbody>
            {docs.length === 0 ? (
              <tr>
                <td
                  colSpan={7}
                  className="px-3 py-4 text-center text-sm text-slate-500"
                >
                  No documents yet. Add documents from each employee&apos;s
                  profile.
                </td>
              </tr>
            ) : (
              docs.map((doc) => {
                const emp = doc.employee;
                const fullName = `${emp.firstName} ${emp.lastName}`;
                const roleParts: string[] = [];
                if (emp.title) roleParts.push(emp.title);
                if (emp.department) roleParts.push(emp.department);
                const role = roleParts.join(" • ");

                const created =
                  doc.createdAt &&
                  new Date(doc.createdAt).toLocaleDateString();
                const signed =
                  doc.signedAt &&
                  new Date(doc.signedAt).toLocaleDateString();

                return (
                  <tr
                    key={doc.id}
                    className="border-b last:border-b-0 hover:bg-slate-50/70"
                  >
                    <td className="px-3 py-2">
                      <div className="font-medium text-slate-900">
                        <Link
                          href={`/people/${emp.id}`}
                          className="hover:underline"
                        >
                          {fullName}
                        </Link>
                      </div>
                      {role && (
                        <div className="text-xs text-slate-500">{role}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-sm text-slate-900">
                        {doc.title}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="text-xs text-slate-600">
                        {doc.kind ?? "—"}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className={[
                          "inline-flex rounded-full px-2 py-0.5 text-[11px] font-medium",
                          doc.status === "SIGNED"
                            ? "bg-emerald-50 text-emerald-700"
                            : doc.status === "VOID"
                            ? "bg-slate-100 text-slate-600"
                            : "bg-amber-50 text-amber-700",
                        ].join(" ")}
                      >
                        {doc.status.toLowerCase()}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600">
                      {created && <div>Created {created}</div>}
                      {signed && <div>Signed {signed}</div>}
                    </td>
                    <td className="px-3 py-2 text-xs text-slate-600 max-w-xs">
                      {doc.notes ? (
                        <p className="line-clamp-3 whitespace-pre-wrap">
                          {doc.notes}
                        </p>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="px-3 py-2 text-right text-xs">
                      <Link
                        href={`/people/${emp.id}`}
                        className="text-indigo-600 hover:underline"
                      >
                        View profile →
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
  );
}
