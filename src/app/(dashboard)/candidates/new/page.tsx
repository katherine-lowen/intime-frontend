// src/app/(dashboard)/candidates/new/page.tsx
"use client";

import { useEffect, useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";

type Job = {
  id: string;
  title: string;
  department?: string | null;
};

async function fetchJobsForSelect(): Promise<Job[]> {
  try {
    const res = await api.get<any>("/jobs");

    // Support either array or { items: [] }
    if (Array.isArray(res)) return res as Job[];
    if (res && Array.isArray(res.items)) return res.items as Job[];
    return [];
  } catch (err) {
    console.error("Failed to load jobs for candidate form", err);
    return [];
  }
}

export default function NewCandidatePage() {
  const router = useRouter();

  const [jobs, setJobs] = useState<Job[]>([]);
  const [loadingJobs, setLoadingJobs] = useState(true);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [jobId, setJobId] = useState("");
  const [stage, setStage] = useState<string>("NEW");
  const [source, setSource] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoadingJobs(true);
      const data = await fetchJobsForSelect();
      if (!cancelled) {
        setJobs(data);
        setLoadingJobs(false);
      }
    }

    load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim() || null,
        jobId: jobId || null,
        stage: stage || null,
        source: source.trim() || null,
      };

      const created = await api.post<any>("/candidates", payload);

      if (created?.id) {
        router.push(`/candidates/${created.id}`);
      } else {
        router.push("/candidates");
      }
    } catch (err: any) {
      console.error("Failed to create candidate", err);
      setError(err?.message ?? "Failed to create candidate");
      setSaving(false);
    }
  }

  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

      <main className="mx-auto max-w-3xl px-6 py-6 space-y-6">
        {/* Header */}
        <section className="flex items-center justify-between gap-3">
          <div>
            <div className="mb-1 text-xs uppercase tracking-wide text-slate-500">
              Hiring · New candidate
            </div>
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Add a candidate
            </h1>
            <p className="mt-1 text-sm text-slate-600">
              Capture the basics now – you can enrich their profile with notes,
              resume text, and feedback later.
            </p>
          </div>

          <button
            type="button"
            onClick={() => router.push("/candidates")}
            className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
          >
            ← Back to candidates
          </button>
        </section>

        {/* Form */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {error}
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Full name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Doe"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Email (optional)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Role / requisition
                </label>
                <select
                  value={jobId}
                  onChange={(e) => setJobId(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="">
                    {loadingJobs ? "Loading roles…" : "Unassigned"}
                  </option>
                  {!loadingJobs &&
                    jobs.map((job) => (
                      <option key={job.id} value={job.id}>
                        {job.title}
                        {job.department ? ` — ${job.department}` : ""}
                      </option>
                    ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">
                  Stage
                </label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
                >
                  <option value="NEW">New</option>
                  <option value="PHONE_SCREEN">Phone screen</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="HIRED">Hired</option>
                  <option value="REJECTED">Rejected</option>
                </select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-medium text-slate-700">
                Source (optional)
              </label>
              <input
                type="text"
                value={source}
                onChange={(e) => setSource(e.target.value)}
                placeholder="LinkedIn, referral, agency, inbound…"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => router.push("/candidates")}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving || !name.trim()}
                className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {saving ? "Saving…" : "Create candidate"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
