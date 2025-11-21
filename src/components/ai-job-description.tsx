// src/components/ai-job-description.tsx
"use client";

import { useState, type FormEvent } from "react";

type JDResponse = {
  jobDescription: string;
};

export default function AiJobDescription() {
  const [title, setTitle] = useState("");
  const [seniority, setSeniority] = useState("");
  const [team, setTeam] = useState("");
  const [location, setLocation] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [companyContext, setCompanyContext] = useState("");

  const [result, setResult] = useState<JDResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);
    setCopied(false);

    try {
      const res = await fetch("/api/ai-job-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          seniority,
          team,
          location,
          responsibilities,
          requirements,
          companyContext,
        }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `HTTP ${res.status}`);
      }

      const json = (await res.json()) as JDResponse;
      setResult(json);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  async function handleCopy() {
    if (!result?.jobDescription) return;
    try {
      await navigator.clipboard.writeText(result.jobDescription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Copy failed", err);
    }
  }

  const disabled = loading || !title.trim();

  return (
    <div className="space-y-6">
      <header className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          AI Job Description Generator
        </h1>
        <p className="text-sm text-neutral-600">
          Start with a title and a few notes. Intime&apos;s AI will draft a
          clean, recruiter-ready job description you can tweak and share.
        </p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="grid gap-6 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm md:grid-cols-2"
      >
        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-800">
            Role title *
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. Senior Product Marketing Manager"
          />

          <label className="mt-3 block text-sm font-medium text-neutral-800">
            Seniority
          </label>
          <input
            value={seniority}
            onChange={(e) => setSeniority(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. Senior, Manager, Lead, IC5"
          />

          <label className="mt-3 block text-sm font-medium text-neutral-800">
            Team / department
          </label>
          <input
            value={team}
            onChange={(e) => setTeam(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. Marketing, Product, Revenue Operations"
          />

          <label className="mt-3 block text-sm font-medium text-neutral-800">
            Location / remote policy
          </label>
          <input
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="e.g. Remote US, Hybrid Miami, Onsite Chicago"
          />
        </div>

        <div className="space-y-3">
          <label className="block text-sm font-medium text-neutral-800">
            Key responsibilities (bullet-style notes)
          </label>
          <textarea
            value={responsibilities}
            onChange={(e) => setResponsibilities(e.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="- Own GTM strategy for new features&#10;- Partner with sales on launches&#10;- Build messaging and positioning..."
          />

          <label className="block text-sm font-medium text-neutral-800">
            Requirements / must-haves
          </label>
          <textarea
            value={requirements}
            onChange={(e) => setRequirements(e.target.value)}
            className="min-h-[120px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="- 5+ years in B2B SaaS marketing&#10;- Experience owning product launches&#10;- Strong cross-functional communication..."
          />

          <label className="block text-sm font-medium text-neutral-800">
            Company context (optional)
          </label>
          <textarea
            value={companyContext}
            onChange={(e) => setCompanyContext(e.target.value)}
            className="min-h-[80px] w-full rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm outline-none ring-0 transition focus:border-indigo-500 focus:bg-white focus:ring-2 focus:ring-indigo-100"
            placeholder="Stage, customers, product focus, what makes this role unique..."
          />
        </div>

        <div className="md:col-span-2 flex items-center justify-between gap-3">
          <p className="text-xs text-neutral-500">
            We&apos;ll use this context once to generate a JD. You can edit it
            before posting to your ATS or careers page.
          </p>
          <button
            type="submit"
            disabled={disabled}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? "Generating…" : "Generate job description →"}
          </button>
        </div>
      </form>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {result?.jobDescription && (
        <section className="space-y-3 rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-neutral-500">
                Generated job description
              </p>
              <p className="text-sm text-neutral-700">
                Review, tweak, then paste into your ATS or send for approval.
              </p>
          </div>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-1.5 text-xs font-medium text-neutral-800 shadow-sm hover:bg-neutral-100"
            >
              {copied ? "Copied ✓" : "Copy to clipboard"}
            </button>
          </div>
          <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-xl bg-neutral-50 px-4 py-3 text-sm text-neutral-800">
            {result.jobDescription}
          </pre>
        </section>
      )}
    </div>
  );
}
