"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type EmployeeDocument = {
  id: string;
  title: string;
  type: string;
  status?: string | null;
  fileUrl?: string | null;
  createdAt?: string | null;
};

const DOC_TYPES = ["OFFER_LETTER", "NDA", "POLICY", "ONBOARDING", "OTHER"] as const;

async function apiDelete(path: string) {
  const anyApi = api as any;
  if (typeof anyApi.delete === "function") return anyApi.delete(path);
  if (typeof anyApi.remove === "function") return anyApi.remove(path);
  if (typeof anyApi.del === "function") return anyApi.del(path);
  if (typeof anyApi.request === "function")
    return anyApi.request({ method: "DELETE", url: path });
  throw new Error("ApiClient is missing a DELETE method (delete/remove/request).");
}

export default function EmployeeDocumentsAdminPage() {
  // ✅ params can be null — extract safely
  const params = useParams() as { id?: string } | null;
  const employeeId = params?.id ?? "";

  const [docs, setDocs] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<string>("OFFER_LETTER");
  const [fileUrl, setFileUrl] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      if (!employeeId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data =
          (await api.get<EmployeeDocument[]>(
            `/employee-documents?employeeId=${encodeURIComponent(employeeId)}`
          )) ?? [];
        if (!cancelled) setDocs(Array.isArray(data) ? data : []);
      } catch (err: any) {
        if (!cancelled)
          setError(err?.message || "Failed to load employee documents.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
  }, [employeeId]);

  const prettyType = (val?: string) =>
    val
      ? val
          .toLowerCase()
          .split(/[_\s-]+/)
          .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
          .join(" ")
      : "—";

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "—";
    return d.toLocaleDateString();
  };

  const addDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId || !title.trim() || !fileUrl.trim()) return;

    setSaving(true);
    try {
      const created = await api.post<EmployeeDocument>("/employee-documents", {
        employeeId,
        title: title.trim(),
        type,
        fileUrl: fileUrl.trim(),
      });

      setDocs((prev) => [...prev, ...(created ? [created] : [])]);
      setTitle("");
      setType("OFFER_LETTER");
      setFileUrl("");
      setModalOpen(false);
    } catch (err: any) {
      console.error("[employee docs] add failed", err);
      setError(err?.message || "Failed to add document.");
    } finally {
      setSaving(false);
    }
  };

  const deleteDoc = async (id: string) => {
    try {
      await apiDelete(`/employee-documents/${id}`);
      setDocs((prev) => prev.filter((d) => d.id !== id));
    } catch (err) {
      console.error("[employee docs] delete failed", err);
      setError("Failed to delete document.");
    }
  };

  return (
    <AuthGate>
      <main className="mx-auto max-w-5xl px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Documents</h1>
            <p className="text-sm text-slate-600">
              Upload or manage documents for this employee.
            </p>
          </div>
          <button
            onClick={() => setModalOpen(true)}
            className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
          >
            Add document
          </button>
        </div>

        {error && (
          <div className="rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <div key={i} className="h-12 rounded-lg bg-slate-100" />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
              No documents yet for this employee.
            </div>
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
                        <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700">
                          {doc.status || "—"}
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
                          <button
                            onClick={() => deleteDoc(doc.id)}
                            className="text-[11px] font-semibold text-rose-600 hover:underline"
                          >
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {modalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
            <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-semibold text-slate-900">
                  Add document
                </h3>
                <button
                  onClick={() => setModalOpen(false)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-700"
                >
                  Close
                </button>
              </div>

              <form className="space-y-3" onSubmit={addDocument}>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Title
                  </label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="NDA 2024"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    Type
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    {DOC_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {prettyType(t)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-medium text-slate-700">
                    File URL
                  </label>
                  <input
                    value={fileUrl}
                    onChange={(e) => setFileUrl(e.target.value)}
                    className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    placeholder="https://files.example.com/document.pdf"
                  />
                </div>

                <div className="flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setModalOpen(false)}
                    className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                  >
                    {saving ? "Saving…" : "Add"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </AuthGate>
  );
}
