"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type EmployeeDocument = {
  id: string;
  title: string;
  type: string;
  status: "PENDING" | "ACKNOWLEDGED" | string;
  fileUrl?: string | null;
  createdAt?: string | null;
};

export default function EmployeeDocumentsPage() {
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useMemo(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data =
          (await api.get<EmployeeDocument[]>("/employee-documents/me")) ?? [];
        if (!cancelled) setDocs(data);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message || "We couldn’t load your documents.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const acknowledge = async (id: string) => {
    try {
      await api.post(`/employee-documents/${id}/acknowledge`);
      router.refresh();
      setDocs((prev) =>
        prev.map((d) =>
          d.id === id ? { ...d, status: "ACKNOWLEDGED" } : d
        )
      );
    } catch (err) {
      console.error("[documents] acknowledge failed", err);
      setError("Failed to acknowledge document.");
    }
  };

  const prettyType = (type?: string) => {
    if (!type) return "—";
    return type
      .toLowerCase()
      .split(/[_\s-]+/)
      .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
      .join(" ");
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  return (
    <AuthGate>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <header>
          <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-600">
            Offer letters, NDAs, onboarding paperwork, and policy
            acknowledgments.
          </p>
        </header>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-6 shadow-sm backdrop-blur">
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <p className="text-sm text-slate-600">
              No documents yet. Your documents will appear here.
            </p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-100">
              <table className="min-w-full divide-y divide-slate-100 text-sm">
                <thead className="bg-slate-50 text-xs font-semibold uppercase tracking-wide text-slate-600">
                  <tr>
                    <th className="px-4 py-2 text-left">Title</th>
                    <th className="px-4 py-2 text-left">Type</th>
                    <th className="px-4 py-2 text-left">Status</th>
                    <th className="px-4 py-2 text-left">Created</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white text-xs">
                  {docs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50">
                      <td className="px-4 py-2 font-medium text-slate-900">
                        {doc.title}
                      </td>
                      <td className="px-4 py-2 text-slate-700">
                        {prettyType(doc.type)}
                      </td>
                      <td className="px-4 py-2">
                        <span
                          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                            doc.status === "ACKNOWLEDGED"
                              ? "bg-emerald-50 text-emerald-700"
                              : "bg-amber-50 text-amber-700"
                          }`}
                        >
                          {doc.status === "ACKNOWLEDGED"
                            ? "Acknowledged"
                            : "Pending"}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-slate-600">
                        {formatDate(doc.createdAt)}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <div className="flex flex-wrap items-center justify-end gap-2">
                          {doc.fileUrl && (
                            <a
                              href={doc.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] font-semibold text-indigo-700 hover:underline"
                            >
                              View
                            </a>
                          )}
                          {doc.status !== "ACKNOWLEDGED" && (
                            <button
                              onClick={() => acknowledge(doc.id)}
                              className="text-[11px] font-semibold text-indigo-700 hover:underline"
                            >
                              Acknowledge
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </AuthGate>
  );
}
