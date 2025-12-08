// src/app/employee/documents/page.tsx
"use client";

import { useEffect, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type EmployeeDocument = {
  id: string;
  name: string;
  category: "OFFER" | "POLICY" | "OTHER";
  createdAt: string;
  downloadUrl: string;
};

type DocsResponse = {
  items: EmployeeDocument[];
};

export default function EmployeeDocumentsPage() {
  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const data = await api.get<DocsResponse>("/me/documents");
        if (!cancelled) setDocs(data?.items ?? []);
      } catch (err: any) {
        if (!cancelled) {
          console.error("[docs] fetch failed", err);
          setError(err?.message || "Failed to load documents.");
          setDocs([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGate>
      <div className="space-y-6">
        <div>
          <h1 className="text-xl font-semibold text-slate-900">My documents</h1>
          <p className="text-sm text-slate-600">
            Personal documents shared with you. These links are scoped to your account.
          </p>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-12 gap-4 border-b border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
            <div className="col-span-5">Name</div>
            <div className="col-span-3">Category</div>
            <div className="col-span-3">Created</div>
            <div className="col-span-1 text-right">View</div>
          </div>

          {loading ? (
            <div className="space-y-2 px-4 py-4">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-slate-500">
              No documents yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="grid grid-cols-12 items-center gap-4 px-4 py-3 text-sm text-slate-800"
                >
                  <div className="col-span-5 font-medium text-slate-900">
                    {doc.name}
                  </div>
                  <div className="col-span-3 text-slate-700">{doc.category}</div>
                  <div className="col-span-3 text-slate-700">
                    {new Date(doc.createdAt).toLocaleDateString()}
                  </div>
                  <div className="col-span-1 text-right">
                    <a
                      href={doc.downloadUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-indigo-700 hover:underline"
                    >
                      View
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </AuthGate>
  );
}
