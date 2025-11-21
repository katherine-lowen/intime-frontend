// src/app/ai/ai-job-intake/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type JobIntakeResponse = {
  roleSummary: string;
  scope: string[];
  responsibilities: string[];
  mustHaves: string[];
  niceToHaves: string[];
  screeningQuestions: string[];
  first90Days: string[];
};

export default function AiJobIntakePage() {
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("");
  const [team, setTeam] = useState("");
  const [location, setLocation] = useState("");
  const [companyContext, setCompanyContext] = useState("");
  const [hiringManagerNotes, setHiringManagerNotes] = useState("");
  const [existingDescription, setExistingDescription] = useState("");
  const [mustHaves, setMustHaves] = useState("");
  const [niceToHaves, setNiceToHaves] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<JobIntakeResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-job-intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          level,
          team,
          location,
          companyContext,
          hiringManagerNotes,
          existingDescription,
          mustHaves,
          niceToHaves,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI Job Intake error:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = (await res.json()) as JobIntakeResponse | { error?: string };

      if ("error" in json) {
        throw new Error(json.error || "Unknown AI error");
      }

      setResult(json as JobIntakeResponse);
    } catch (err) {
      console.error("Failed to generate job intake profile", err);
      setError("Something went wrong generating the intake summary. Try again.");
    } finally {
      setLoading(false);
    }
  }

  function handleCopySection(label: string, content: string | string[]) {
    const text =
      typeof content === "string" ? content : content.map((x) => `• ${x}`).join("\n");
    const header = `### ${label}\n\n`;
    navigator.clipboard
      .writeText(header + text)
      .catch((err) => console.error("Copy failed", err));
  }

  return (
    <main className="mx-auto max-w-6xl px-6 py-8 space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Intime AI · Hiring
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            AI job intake assistant
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Paste messy notes and early thoughts. Intime turns them into a
            structured role profile with must-haves, nice-to-haves, and
            screening questions.
          </p>
        </div>
        <Link
          href="/ai"
          className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 shadow-sm hover:bg-slate-50"
        >
          ← Back to AI Studio
        </Link>
      </div>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)]">
        {/* Left: intake form */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Intake details
            </h2>
            <span className="text-[11px] text-slate-500">
              Role title is required
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
                placeholder="Senior Account Executive"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
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
                placeholder="Mid-level, Senior, Manager..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Team
              </label>
              <input
                type="text"
                value={team}
                onChange={(e) => setTeam(e.target.value)}
                placeholder="Sales, CS, Product, Eng..."
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
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Company / product context
              </label>
              <input
                type="text"
                value={companyContext}
                onChange={(e) => setCompanyContext(e.target.value)}
                placeholder="Series B Azure SaaS, mid-market IT buyers..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Hiring manager notes
            </label>
            <textarea
              rows={4}
              value={hiringManagerNotes}
              onChange={(e) => setHiringManagerNotes(e.target.value)}
              placeholder="Dump Slack notes or rough bullets here. What hurts today? What will this person actually own?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Existing job description (optional)
            </label>
            <textarea
              rows={3}
              value={existingDescription}
              onChange={(e) => setExistingDescription(e.target.value)}
              placeholder="Paste any old JD or competitor JD you want to use as a reference."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Must-haves (raw)
              </label>
              <textarea
                rows={3}
                value={mustHaves}
                onChange={(e) => setMustHaves(e.target.value)}
                placeholder="Hard requirements, separated by new lines or commas."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Nice-to-haves (raw)
              </label>
              <textarea
                rows={3}
                value={niceToHaves}
                onChange={(e) => setNiceToHaves(e.target.value)}
                placeholder="Nice extras, separated by new lines or commas."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !title}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Summarizing intake…" : "Generate intake summary"}
            </button>
          </div>
        </form>

        {/* Right: structured output */}
        <div className="flex flex-col gap-4">
          {!result && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium">
                Your structured job intake will appear here.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use this view to align with the hiring manager, then push the
                output into Intime jobs, AI JD generator, and interview plans.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p className="text-xs text-slate-500">
                Turning your notes into a clean intake profile…
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              {/* Role summary */}
              <OutputCard
                title="Role summary"
                body={result.roleSummary}
                onCopy={() =>
                  handleCopySection("Role summary", result.roleSummary)
                }
              />

              <OutputListCard
                title="Scope & boundaries"
                items={result.scope}
                onCopy={() => handleCopySection("Scope & boundaries", result.scope)}
              />

              <OutputListCard
                title="Key responsibilities"
                items={result.responsibilities}
                onCopy={() =>
                  handleCopySection("Key responsibilities", result.responsibilities)
                }
              />

              <OutputListCard
                title="Must-have requirements"
                items={result.mustHaves}
                onCopy={() =>
                  handleCopySection("Must-have requirements", result.mustHaves)
                }
              />

              <OutputListCard
                title="Nice-to-haves"
                items={result.niceToHaves}
                onCopy={() =>
                  handleCopySection("Nice-to-haves", result.niceToHaves)
                }
              />

              <OutputListCard
                title="Screening questions"
                items={result.screeningQuestions}
                onCopy={() =>
                  handleCopySection(
                    "Screening questions",
                    result.screeningQuestions
                  )
                }
              />

              <OutputListCard
                title="First 90 days: what success looks like"
                items={result.first90Days}
                onCopy={() =>
                  handleCopySection("First 90 days", result.first90Days)
                }
              />
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

function OutputCard({
  title,
  body,
  onCopy,
}: {
  title: string;
  body: string;
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
        >
          Copy
        </button>
      </div>
      <p className="text-sm text-slate-800 whitespace-pre-wrap">{body}</p>
    </div>
  );
}

function OutputListCard({
  title,
  items,
  onCopy,
}: {
  title: string;
  items: string[];
  onCopy: () => void;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-center justify-between gap-2">
        <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
        <button
          type="button"
          onClick={onCopy}
          className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:bg-slate-100"
        >
          Copy
        </button>
      </div>
      {items?.length ? (
        <ul className="space-y-1.5 text-sm text-slate-800">
          {items.map((item, i) => (
            <li
              key={i}
              className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-xs"
            >
              {item}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-slate-400">No items returned.</p>
      )}
    </div>
  );
}
