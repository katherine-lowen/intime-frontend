"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { createPath, listPaths } from "@/lib/learning-api";

export default function PathsClient({ orgSlug }: { orgSlug: string }) {
  const [paths, setPaths] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listPaths(orgSlug);
        if (!cancelled) setPaths(res || []);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load paths");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const create = async () => {
    setSaving(true);
    try {
      const res = await createPath(orgSlug, { title });
      setPaths((prev) => [...prev, res]);
      setTitle("");
    } catch (err: any) {
      alert(err?.message || "Unable to create path");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4 p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Learning</p>
          <h1 className="text-2xl font-semibold text-slate-900">Paths</h1>
        </div>
        <Button onClick={create} disabled={!title || saving}>
          {saving ? "Creating…" : "Create path"}
        </Button>
      </div>

      <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">New path name</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Onboarding path"
          />
        </label>
      </div>

      {error ? <SupportErrorCard title="Paths" message={error} /> : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : paths.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No paths yet.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-xl border border-slate-100 bg-white shadow-sm">
          {paths.map((p) => (
            <Link
              key={p.id}
              href={`/org/${orgSlug}/learning/paths/${p.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-slate-50"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{p.title || p.name || "Path"}</p>
                <p className="text-xs text-slate-500">
                  Courses: {p.courses?.length ?? p.coursesCount ?? "—"}
                </p>
              </div>
              <span className="text-xs font-semibold text-indigo-700">Open →</span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
