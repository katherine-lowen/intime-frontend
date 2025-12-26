"use client";

import { useEffect, useMemo, useState } from "react";
import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

type Category = { id: string; name: string };
type DocumentItem = {
  id: string;
  title: string;
  categoryId: string;
  url?: string | null;
};

export default function AdminDocumentsPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // modals
  const [createCatOpen, setCreateCatOpen] = useState(false);
  const [renameCatOpen, setRenameCatOpen] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);
  const [newCatName, setNewCatName] = useState("");
  const [renameCatName, setRenameCatName] = useState("");
  const [uploadTitle, setUploadTitle] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadCategoryId, setUploadCategoryId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [catRes, docRes] = await Promise.all([
          api.get<Category[]>("/documents/categories"),
          api.get<DocumentItem[]>("/documents"),
        ]);
        if (cancelled) return;
        setCategories(catRes ?? []);
        setDocuments(docRes ?? []);
        setSelectedCategory(catRes?.[0]?.id ?? null);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Failed to load documents.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredDocs = useMemo(() => {
    if (!selectedCategory) return documents;
    return documents.filter((d) => d.categoryId === selectedCategory);
  }, [documents, selectedCategory]);

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setSaving(true);
    try {
      const created = await api.post<Category>("/documents/categories", {
        name: newCatName.trim(),
      });
      setCategories((prev) => [...prev, ...(created ? [created] : [])]);
      if (created?.id) setSelectedCategory(created.id);
      setNewCatName("");
      setCreateCatOpen(false);
    } catch (err) {
      console.error("[documents] create category failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleRenameCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCategory || !renameCatName.trim()) return;
    setSaving(true);
    try {
      await api.patch(`/documents/categories/${selectedCategory}`, {
        name: renameCatName.trim(),
      });
      setCategories((prev) =>
        prev.map((c) =>
          c.id === selectedCategory ? { ...c, name: renameCatName.trim() } : c
        )
      );
      setRenameCatName("");
      setRenameCatOpen(false);
    } catch (err) {
      console.error("[documents] rename category failed", err);
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadTitle.trim() || !uploadFile) return;
    const catId = uploadCategoryId || selectedCategory;
    const formData = new FormData();
    formData.append("title", uploadTitle.trim());
    if (catId) formData.append("categoryId", catId);
    formData.append("file", uploadFile);
    setSaving(true);
    try {
      const created = await api.post<DocumentItem>("/documents", formData as any);
      setDocuments((prev) => [...prev, ...(created ? [created] : [])]);
      setUploadTitle("");
      setUploadFile(null);
      setUploadCategoryId(null);
      setUploadOpen(false);
    } catch (err) {
      console.error("[documents] upload failed", err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthGate>
      <main className="mx-auto max-w-6xl px-6 py-8">
        <header className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Admin · Documents
            </p>
            <h1 className="text-2xl font-semibold text-slate-900">
              Document library
            </h1>
            <p className="text-sm text-slate-600">
              Manage categories and upload documents for your org.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCreateCatOpen(true)}
              className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
            >
              + Category
            </button>
            <button
              onClick={() => setUploadOpen(true)}
              className="rounded-md bg-indigo-600 px-3 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
            >
              Upload document
            </button>
          </div>
        </header>

        {error && (
          <div className="mb-4 rounded-md border border-amber-200 bg-amber-50 px-4 py-2 text-xs text-amber-800">
            {error}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-[240px_1fr]">
          {/* Sidebar */}
          <aside className="rounded-2xl border border-slate-200 bg-white/90 p-4 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                Categories
              </h2>
              <button
                onClick={() => setCreateCatOpen(true)}
                className="text-[11px] font-semibold text-indigo-700 hover:underline"
              >
                Add
              </button>
            </div>
            <div className="space-y-2 text-sm">
              {loading ? (
                <div className="space-y-2">
                  {[0, 1, 2].map((i) => (
                    <div key={i} className="h-9 rounded-lg bg-slate-100" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-xs text-slate-500">
                  No categories yet. Add one to get started.
                </p>
              ) : (
                categories.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => {
                      setSelectedCategory(cat.id);
                      setRenameCatName(cat.name);
                    }}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-2 text-left ${
                      selectedCategory === cat.id
                        ? "border-indigo-200 bg-indigo-50 text-indigo-700"
                        : "border-slate-200 bg-white text-slate-700 hover:border-indigo-100 hover:bg-slate-50"
                    }`}
                  >
                    <span>{cat.name}</span>
                    {selectedCategory === cat.id && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setRenameCatOpen(true);
                        }}
                        className="text-[11px] font-semibold text-slate-500 hover:text-slate-700"
                      >
                        Rename
                      </button>
                    )}
                  </button>
                ))
              )}
            </div>
          </aside>

          {/* Content */}
          <section className="rounded-2xl border border-slate-200 bg-white/90 p-5 shadow-sm backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Documents
                </h2>
                <p className="text-xs text-slate-500">
                  {selectedCategory
                    ? `Showing documents in ${
                        categories.find((c) => c.id === selectedCategory)?.name || ""
                      }`
                    : "Select a category to filter documents."}
                </p>
              </div>
              <button
                onClick={() => setUploadOpen(true)}
                className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Upload
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="h-12 rounded-lg bg-slate-100" />
                ))}
              </div>
            ) : filteredDocs.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-sm text-slate-600">
                No documents yet in this category.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between py-3 text-sm text-slate-800"
                  >
                    <div>
                      <div className="font-semibold">{doc.title}</div>
                      <div className="text-xs text-slate-500">
                        {categories.find((c) => c.id === doc.categoryId)?.name || "—"}
                      </div>
                    </div>
                    {doc.url && (
                      <a
                        href={doc.url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[11px] font-semibold text-indigo-700 hover:underline"
                      >
                        View
                      </a>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Modals */}
        {createCatOpen && (
          <ModalShell onClose={() => setCreateCatOpen(false)} title="Create category">
            <form className="space-y-3" onSubmit={handleCreateCategory}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Name</label>
                <input
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Policies"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setCreateCatOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Create"}
                </button>
              </div>
            </form>
          </ModalShell>
        )}

        {renameCatOpen && selectedCategory && (
          <ModalShell onClose={() => setRenameCatOpen(false)} title="Rename category">
            <form className="space-y-3" onSubmit={handleRenameCategory}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">New name</label>
                <input
                  value={renameCatName}
                  onChange={(e) => setRenameCatName(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Policies"
                />
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setRenameCatOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Rename"}
                </button>
              </div>
            </form>
          </ModalShell>
        )}

        {uploadOpen && (
          <ModalShell onClose={() => setUploadOpen(false)} title="Upload document">
            <form className="space-y-3" onSubmit={handleUpload}>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Title</label>
                <input
                  value={uploadTitle}
                  onChange={(e) => setUploadTitle(e.target.value)}
                  className="w-full rounded-md border border-slate-200 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  placeholder="Employee handbook"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Category</label>
                <select
                  value={uploadCategoryId || selectedCategory || ""}
                  onChange={(e) => setUploadCategoryId(e.target.value)}
                  className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="">Select category</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  File
                </label>
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-xs text-slate-500">
                  <input
                    type="file"
                    onChange={(e) => setUploadFile(e.target.files?.[0] ?? null)}
                  />
                  <p className="mt-2">
                    {uploadFile ? uploadFile.name : "Upload or drop a file"}
                  </p>
                </div>
              </div>
              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setUploadOpen(false)}
                  className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-md bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:opacity-60"
                >
                  {saving ? "Uploading…" : "Upload"}
                </button>
              </div>
            </form>
          </ModalShell>
        )}
      </main>
    </AuthGate>
  );
}

function ModalShell({
  title,
  children,
  onClose,
}: {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-slate-500 hover:text-slate-700"
          >
            Close
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
