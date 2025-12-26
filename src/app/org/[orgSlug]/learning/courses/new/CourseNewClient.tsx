"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { createCourse } from "@/lib/learning-api";

export default function CourseNewClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState("DRAFT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  const handleCreate = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res: any = await createCourse(orgSlug, {
        title,
        description,
        status,
      });
      const id = res?.id;
      router.push(`/org/${orgSlug}/learning/courses/${id}`);
    } catch (err: any) {
      setError(err?.message || "Unable to create course");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-4 p-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Create course</h1>
        <p className="text-sm text-slate-600">Publish learning content for your team.</p>
      </div>

      {error ? (
        <SupportErrorCard
          title="Unable to create course"
          message={error}
          requestId={requestId}
        />
      ) : null}

      <div className="space-y-3 rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Title</span>
          <input
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="New hire onboarding"
          />
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Description</span>
          <textarea
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What will learners gain?"
            rows={3}
          />
        </label>

        <label className="space-y-1 text-sm text-slate-700">
          <span className="font-medium">Status</span>
          <select
            className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="DRAFT">Draft</option>
            <option value="ACTIVE">Active</option>
          </select>
        </label>

        <div className="flex justify-end">
          <Button onClick={handleCreate} disabled={loading || !title}>
            {loading ? "Creating…" : "Create course"}
          </Button>
        </div>
      </div>
    </div>
  );
}
