// src/components/ai-candidate-summary.tsx
"use client";

import { useState } from "react";

export type AiCandidateSummaryProps = {
  name: string;
  jobTitle?: string | null;
  resumeText?: string | null;
  notes?: string | null;
};

type SummaryResult = {
  summary: string;
  strengths: string[];
  risks: string[];
  recommendation: string;
};

export default function AiCandidateSummary({
  name,
  jobTitle,
  resumeText,
  notes,
}: AiCandidateSummaryProps) {
  const [expanded, setExpanded] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<SummaryResult | null>(null);

  const hasSource = !!(resumeText || notes);

  async function handleGenerate() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/ai-candidate-summary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          jobTitle,
          resumeText,
          notes,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI summary error:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = (await res.json()) as SummaryResult | { error?: string };

      if ("error" in json) {
        throw new Error(json.error || "Unknown AI error");
      }

      setResult(json as SummaryResult);
    } catch (err: any) {
      console.error("Failed to generate candidate summary", err);
      setError("Something went wrong generating the summary. Try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-1 flex items-center justify-between gap-2">
        <div>
          <div className="text-sm font-semibold text-slate-900">
            AI candidate summary
          </div>
          <p className="text-[11px] text-slate-500">
            Narrative fit summary for {name}
            {jobTitle ? ` → ${jobTitle}` : ""}.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading || !hasSource}
            className="rounded-full border border-indigo-200 bg-indigo-600 px-3 py-1 text-[11px] font-medium text-white shadow-sm disabled:cursor-not-allowed disabled:bg-slate-300"
          >
            {loading ? "Generating…" : "Generate summary"}
          </button>
          <button
            type="button"
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] text-slate-500 hover:text-slate-700"
          >
            {expanded ? "Hide" : "Show"}
          </button>
        </div>
      </div>

      {!hasSource && (
        <p className="mt-1 text-[11px] text-amber-600">
          Add resume text or notes to get a better summary.
        </p>
      )}

      {expanded && (
        <div className="mt-3 space-y-3 text-sm text-slate-700">
          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-xs text-red-700">
              {error}
            </p>
          )}

          {!error && !result && (
            <p className="text-xs text-slate-500">
              Click <span className="font-medium">Generate summary</span> to
              create a concise overview of this candidate&apos;s fit, strengths,
              and risks using their resume and notes.
            </p>
          )}

          {result && !error && (
            <>
              <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-800 whitespace-pre-wrap">
                {result.summary}
              </div>

              <div className="grid gap-3 md:grid-cols-2">
                <InsightsList
                  title="Strengths"
                  tone="positive"
                  items={result.strengths}
                />
                <InsightsList title="Risks / questions" tone="risk" items={result.risks} />
              </div>

              <div className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-xs">
                <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                  Recommended next step
                </div>
                <p className="mt-1 text-slate-800">{result.recommendation}</p>
              </div>
            </>
          )}

          {hasSource && (
            <p className="text-[11px] text-slate-400">
              Source:{" "}
              {[
                resumeText ? "pasted resume / profile" : null,
                notes ? "internal notes" : null,
              ]
                .filter(Boolean)
                .join(" + ")}
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function InsightsList({
  title,
  items,
  tone = "default",
}: {
  title: string;
  items: string[];
  tone?: "default" | "positive" | "risk";
}) {
  const borderClass =
    tone === "risk"
      ? "border-red-100 bg-red-50/40"
      : tone === "positive"
      ? "border-emerald-100 bg-emerald-50/40"
      : "border-slate-100 bg-slate-50/60";

  const bulletClass =
    tone === "risk"
      ? "bg-red-400"
      : tone === "positive"
      ? "bg-emerald-400"
      : "bg-slate-400";

  return (
    <div className={`rounded-xl border ${borderClass} p-3`}>
      <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {title}
      </div>
      <ul className="mt-2 space-y-1.5 text-xs text-slate-800">
        {items?.length ? (
          items.map((item, i) => (
            <li key={i} className="flex gap-2">
              <span
                className={`mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full ${bulletClass}`}
              />
              <span>{item}</span>
            </li>
          ))
        ) : (
          <li className="text-[11px] text-slate-400">No points yet.</li>
        )}
      </ul>
    </div>
  );
}
