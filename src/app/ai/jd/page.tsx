// src/app/ai/jd/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type JdResponse = {
  text: string;
};

export default function AiJdGeneratorPage() {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [department, setDepartment] = useState("");
  const [team, setTeam] = useState("");
  const [location, setLocation] = useState("");
  const [employmentType, setEmploymentType] = useState("Full-time");
  const [companyContext, setCompanyContext] = useState("");
  const [responsibilities, setResponsibilities] = useState("");
  const [requirements, setRequirements] = useState("");
  const [notes, setNotes] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JdResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-jd", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          level,
          department,
          team,
          location,
          employmentType,
          companyContext,
          responsibilities,
          requirements,
          notes,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI JD error:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = (await res.json()) as JdResponse | { error?: string };

      if ("error" in json) {
        throw new Error(json.error || "Unknown AI error");
      }

      setResult(json as JdResponse);
    } catch (err: any) {
      console.error("Failed to generate JD", err);
      setError("Something went wrong generating the JD. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopy() {
    if (!result?.text) return;
    navigator.clipboard
      .writeText(result.text)
      .catch((err) => console.error("Copy failed", err));
  }

  return (
    <main className="mx-auto max-w-5xl px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Intime AI · Roles
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            AI job description generator
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Start from a title and a few notes. Intime will draft a clean, B2B
            SaaS-ready job description you can paste directly into your ATS.
          </p>
        </div>
        <Link
          href="/ai"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          ← Back to AI Studio
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1.7fr)]">
        {/* Left: form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Role details
            </h2>
            <span className="text-[11px] text-slate-500">
              Required fields marked with *
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Role title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Senior Product Marketing Manager"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none ring-0 focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Level / seniority
              </label>
              <input
                type="text"
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                placeholder="Senior IC, Manager, Director..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Department
              </label>
              <input
                type="text"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Marketing, Engineering, Sales..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Team / pod
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Product Marketing, RevOps, Core Platform..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Location
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Remote (US), Miami, London..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Employment type
              </label>
              <input
                type="text"
                value={employmentType}
                onChange={(e) => setEmploymentType(e.target.value)}
                placeholder="Full-time, Contract, Internship..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Company & product context
            </label>
            <textarea
              rows={3}
              value={companyContext}
              onChange={(e) => setCompanyContext(e.target.value)}
              placeholder="Stage, product, customer type, GTM motion. E.g. 'Series B B2B SaaS company in the Azure ecosystem, selling into mid market IT leaders...'"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Seed responsibilities (optional)
            </label>
            <textarea
              rows={3}
              value={responsibilities}
              onChange={(e) => setResponsibilities(e.target.value)}
              placeholder="Bullets or rough notes about what this person will own."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Seed requirements / must-haves (optional)
            </label>
            <textarea
              rows={3}
              value={requirements}
              onChange={(e) => setRequirements(e.target.value)}
              placeholder="Experience, skills, tools, domains that really matter."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Extra notes (optional)
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any nuance from the hiring manager (must sit near sales, backfill vs. net-new, etc.)."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {error && (
              <p className="text-xs text-red-600">{error}</p>
            )}
            <div className="flex flex-1 justify-end gap-2">
              <button
                type="submit"
                disabled={loading || !title}
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
              >
                {loading ? "Generating JD…" : "Generate JD"}
              </button>
            </div>
          </div>
        </form>

        {/* Right: output */}
        <div className="flex flex-col rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="mb-2 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">
                Generated job description
              </h2>
              <p className="text-[11px] text-slate-500">
                Preview and copy into Intime jobs or your external ATS.
              </p>
            </div>
            <button
              type="button"
              onClick={handleCopy}
              disabled={!result?.text}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 shadow-sm hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-400"
            >
              Copy to clipboard
            </button>
          </div>

          <div className="mt-2 flex-1 rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
            {loading && (
              <p className="text-xs text-slate-500">
                Drafting a JD that fits{" "}
                <span className="font-medium">{title || "this role"}</span>…
              </p>
            )}

            {!loading && !result && !error && (
              <p className="text-xs text-slate-500">
                Fill out the role details and click{" "}
                <span className="font-medium">Generate JD</span> to see a
                polished description here.
              </p>
            )}

            {!loading && result?.text && (
              <pre className="max-h-[540px] whitespace-pre-wrap text-sm text-slate-800">
                {result.text}
              </pre>
            )}
          </div>
        </div>
      </section>
    </main>
  );
}
