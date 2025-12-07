// src/components/employee-documents-panel.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import api from "@/lib/api";

type EmployeeDocumentStatus = "SENT" | "SIGNED" | "VOID";

type EmployeeDocument = {
  id: string;
  title: string;
  kind?: string | null;
  status: EmployeeDocumentStatus;
  notes?: string | null;
  signedAt?: string | null;
  createdAt?: string | null;
};

export default function EmployeeDocumentsPanel({
  employeeId,
}: {
  employeeId: string;
}) {
  const [items, setItems] = useState<EmployeeDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [kind, setKind] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.get<EmployeeDocument[]>(
        `/employee-documents?employeeId=${employeeId}`,
      );
      // normalize possible undefined → []
      setItems(data ?? []);
    } catch (err) {
      console.error(err);
      setError("Failed to load documents.");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, [employeeId]);

  async function handleCreate(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      setSaving(true);
      setError(null);
      await api.post("/employee-documents", {
        employeeId,
        title: title.trim(),
        kind: kind.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      setTitle("");
      setKind("");
      setNotes("");
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to create document.");
    } finally {
      setSaving(false);
    }
  }

  async function updateStatus(id: string, status: EmployeeDocumentStatus) {
    try {
      setUpdatingId(id);
      setError(null);
      await api.patch(`/employee-documents/${id}`, { status });
      await load();
    } catch (err) {
      console.error(err);
      setError("Failed to update document.");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <section className="space-y-4 rounded-xl border border-slate-200 bg-white/70 p-4 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold">Documents</h2>
        <p className="text-xs text-slate-500">
          Track offer letters, NDAs, and other key docs.
        </p>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
          {error}
        </div>
      )}

      {/* New doc form */}
      <form
        onSubmit={handleCreate}
        className="space-y-2 rounded-md border border-slate-200 bg-slate-50/50 p-3 text-sm"
      >
        <div className="grid gap-2 sm:grid-cols-2">
          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Title
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Offer Letter"
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-slate-700">
              Type (optional)
            </label>
            <input
              type="text"
              value={kind}
              onChange={(e) => setKind(e.target.value)}
              placeholder="Offer, NDA, Handbook…"
              className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-sm"
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Notes or link (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-1.5 text-xs"
            rows={2}
            placeholder="Paste a link to the signed PDF or add notes."
          />
        </div>

        <button
          type="submit"
          disabled={saving}
          className="inline-flex items-center rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-indigo-700 disabled:opacity-60"
        >
          {saving ? "Adding…" : "Add document"}
        </button>
      </form>

      {/* Existing docs */}
      {loading ? (
        <p className="text-sm text-slate-600">Loading…</p>
      ) : items.length === 0 ? (
        <p className="text-sm text-slate-600">
          No documents yet. Add an offer, NDA, or other document above.
        </p>
      ) : (
        <div className="space-y-2 text-sm">
          {items.map((doc) => (
            <div
              key={doc.id}
              className="flex items-start justify-between rounded-md border border-slate-200 bg-white px-3 py-2"
            >
              <div className="space-y-1">
                <div className="font-medium text-slate-900">
                  {doc.title}
                </div>
                <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                  {doc.kind && <span>{doc.kind}</span>}
                  <span>• {doc.status.toLowerCase()}</span>
                  {doc.signedAt && (
                    <span>
                      • Signed{" "}
                      {new Date(doc.signedAt).toLocaleDateString()}
                    </span>
                  )}
                  {doc.createdAt && (
                    <span>
                      • Created{" "}
                      {new Date(doc.createdAt).toLocaleDateString()}
                    </span>
                  )}
                </div>
                {doc.notes && (
                  <p className="text-xs text-slate-600 whitespace-pre-wrap">
                    {doc.notes}
                  </p>
                )}
              </div>

              <div className="flex flex-col items-end gap-1 text-[11px]">
                <button
                  type="button"
                  disabled={updatingId === doc.id}
                  onClick={() =>
                    updateStatus(
                      doc.id,
                      doc.status === "SIGNED" ? "SENT" : "SIGNED",
                    )
                  }
                  className="rounded-md bg-emerald-600 px-2 py-0.5 text-[11px] font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {doc.status === "SIGNED"
                    ? "Mark as unsigned"
                    : "Mark as signed"}
                </button>

                {doc.status !== "VOID" && (
                  <button
                    type="button"
                    disabled={updatingId === doc.id}
                    onClick={() => updateStatus(doc.id, "VOID")}
                    className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-[11px] font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-60"
                  >
                    Void
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
