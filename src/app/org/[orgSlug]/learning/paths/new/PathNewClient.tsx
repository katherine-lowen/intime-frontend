"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { createPath } from "@/lib/learning-api";
import { useRouter } from "next/navigation";

export default function PathNewClient({ orgSlug }: { orgSlug: string }) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res = await createPath(orgSlug, { title, description });
      router.push(`/org/${orgSlug}/learning/paths/${res.id}`);
    } catch (err: any) {
      setError(err?.message || "Unable to create path");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Learning</p>
        <h1 className="text-2xl font-semibold text-slate-900">Create path</h1>
        <p className="text-sm text-slate-600">Bundle courses into a path.</p>
      </div>

      {error ? <SupportErrorCard title="Path" message={error} requestId={requestId} /> : null}

      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Title</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Onboarding path"
          />
        </label>
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Description</span>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
          />
        </label>
        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={!title || loading}>
            {loading ? "Creating…" : "Create path"}
          </Button>
        </div>
      </div>
    </div>
  );
}
