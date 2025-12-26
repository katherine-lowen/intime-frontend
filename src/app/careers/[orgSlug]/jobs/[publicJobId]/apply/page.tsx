"use client";

import { useEffect, useState, FormEvent } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { API_BASE_URL } from "@/lib/api";
import { Loader2 } from "lucide-react";

type PublicJob = {
  id: string;
  title: string;
  location?: string | null;
  description?: string | null;
};

export default function PublicApplyPage() {
  const params = useParams<{ orgSlug: string; publicJobId: string }>();
  const orgSlug = params?.orgSlug || "";
  const publicJobId = params?.publicJobId || "";

  const [job, setJob] = useState<PublicJob | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [coverNote, setCoverNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`${API_BASE_URL}/careers/jobs/${publicJobId}`, {
          headers: { "x-org-id": orgSlug },
          cache: "no-store",
        });
        if (!res.ok) {
          throw new Error("Not found");
        }
        const data = (await res.json()) as PublicJob;
        if (!cancelled) {
          setJob(data);
          setError(null);
        }
      } catch (err) {
        if (!cancelled) setError("We couldn’t load this role right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    if (orgSlug && publicJobId) {
      void load();
    }
    return () => {
      cancelled = true;
    };
  }, [orgSlug, publicJobId]);

  const ready = !!name.trim() && (!!resumeUrl.trim() || !!resumeFile);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitting || !ready) return;
    setSubmitError(null);
    try {
      setSubmitting(true);
      const formData = new FormData();
      formData.append("name", name.trim());
      if (email.trim()) formData.append("email", email.trim());
      if (resumeUrl.trim()) formData.append("resumeUrl", resumeUrl.trim());
      if (resumeFile) formData.append("resumeFile", resumeFile);
      if (coverNote.trim()) formData.append("coverNote", coverNote.trim());

      const res = await fetch(`${API_BASE_URL}/careers/jobs/${publicJobId}/apply`, {
        method: "POST",
        headers: { "x-org-id": orgSlug },
        body: formData,
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("Apply failed", text);
        throw new Error("Apply failed");
      }

      setSubmitted(true);
    } catch (err) {
      setSubmitError("Something went wrong submitting your application. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-700 shadow-sm">
          Loading role…
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="max-w-md rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
          <h1 className="text-lg font-semibold text-slate-900">Trouble loading this role</h1>
          <p className="mt-2 text-sm text-slate-600">
            {error ?? "This role may have been closed or is temporarily unavailable."}
          </p>
          <Link
            href={`/careers/${orgSlug}/jobs`}
            className="mt-4 inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            ← Back to roles
          </Link>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-slate-50">
        <main className="mx-auto max-w-2xl px-6 py-12 space-y-6">
          <Link
            href={`/careers/${orgSlug}/jobs`}
            className="text-sm text-slate-600 hover:text-indigo-600"
          >
            ← Back to roles
          </Link>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
              Application received
            </p>
            <h1 className="mt-2 text-lg font-semibold text-slate-900">
              Thanks for applying to {job.title}
            </h1>
            <p className="mt-2 text-sm text-slate-700">
              The team will review your application and reach out if there&apos;s a fit.
              You can close this window now.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <main className="mx-auto max-w-3xl px-6 py-12 space-y-6">
        <Link
          href={`/careers/${orgSlug}/jobs/${job.id}`}
          className="text-sm text-slate-600 hover:text-indigo-600"
        >
          ← Back to role
        </Link>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wide text-slate-500">Apply</p>
            <h1 className="text-2xl font-semibold text-slate-900">{job.title}</h1>
            <p className="text-sm text-slate-600">
              {job.location || "Location flexible"}
            </p>
          </div>

          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Name</label>
              <input
                type="text"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Email</label>
              <input
                type="email"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Resume URL</label>
              <input
                type="url"
                placeholder="Link to your resume"
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                value={resumeUrl}
                onChange={(e) => setResumeUrl(e.target.value)}
              />
              <p className="text-[11px] text-slate-500">Or upload a file below.</p>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Resume file</label>
              <input
                type="file"
                accept=".pdf,.doc,.docx"
                className="w-full text-sm text-slate-700"
                onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-800">Cover note (optional)</label>
              <textarea
                className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-indigo-500 focus:outline-none"
                rows={4}
                value={coverNote}
                onChange={(e) => setCoverNote(e.target.value)}
                placeholder="Share anything you'd like the team to know."
              />
            </div>

            {submitError && (
              <p className="text-sm text-rose-600">{submitError}</p>
            )}

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={!ready || submitting}
                className="inline-flex items-center justify-center rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:bg-slate-400"
              >
                {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit application
              </button>
              <Link
                href={`/careers/${orgSlug}/jobs`}
                className="inline-flex items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50"
              >
                Cancel
              </Link>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
