"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";
import { Loader2, FileText, Plus } from "lucide-react";
import { listMyCertificates } from "@/lib/learning-api";

type EmployeeDocument = {
  id: string;
  title: string;
  kind?: string | null;
  status?: string | null;
  createdAt?: string | null;
};

export default function EmployeeDocumentsPage() {
  const params = useParams() as { orgSlug?: string; id?: string } | null;

  const orgSlug = params?.orgSlug ?? "demo-org";
  const employeeId = params?.id ?? "";

  const [documents, setDocuments] = useState<EmployeeDocument[]>([]);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!employeeId) {
        setLoading(false);
        setDocuments([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const res = await api.get<EmployeeDocument[]>(
          `/employee-documents?employeeId=${encodeURIComponent(employeeId)}`
        );

        if (!cancelled) setDocuments(res ?? []);
      } catch (err: any) {
        console.error("Failed to load documents", err);
        if (!cancelled) setError("Failed to load documents.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  useEffect(() => {
    let cancelled = false;
    async function loadCerts() {
      try {
        const res = await listMyCertificates(orgSlug);
        if (!cancelled) setCertificates(res || []);
      } catch {
        // ignore
      }
    }
    void loadCerts();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  return (
    <AuthGate>
      <main className="space-y-6 px-6 py-8">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Employee</p>
            <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
          </div>

          <Link
            href={`/employee-documents/new?employeeId=${encodeURIComponent(employeeId)}`}
            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700"
          >
            <Plus className="h-4 w-4" />
            New document
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20 text-slate-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
      ) : error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
        ) : (
          <>
            <div className="divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm">
              {documents.length === 0 ? (
                <div className="px-4 py-3 text-sm text-slate-500">No documents yet.</div>
              ) : (
                documents.map((doc) => (
                  <div key={doc.id} className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                        <FileText className="h-4 w-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{doc.title}</div>
                        <div className="text-xs text-slate-500">
                          {doc.kind || "Document"} · {doc.status || "Unknown"}
                        </div>
                      </div>
                    </div>

                    {doc.createdAt ? (
                      <div className="text-xs text-slate-400">
                        {new Date(doc.createdAt).toLocaleDateString()}
                      </div>
                    ) : null}
                  </div>
                ))
              )}
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <h2 className="text-sm font-semibold text-slate-900">Certificates</h2>
              {certificates.length === 0 ? (
                <p className="mt-2 text-xs text-slate-600">No certificates yet.</p>
              ) : (
                <div className="mt-2 space-y-2">
                  {certificates.map((c) => (
                    <div
                      key={c.id}
                      className="flex items-center justify-between rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{c.courseTitle || "Course"}</p>
                        <p className="text-xs text-slate-500">
                          Issued: {c.issuedAt || "—"} · v{c.courseVersion ?? "—"}
                        </p>
                      </div>
                      <Link
                        className="text-xs font-semibold text-indigo-700 hover:underline"
                        href={`/org/${orgSlug}/learning/certificates/${c.id}`}
                      >
                        View
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </main>
    </AuthGate>
  );
}
