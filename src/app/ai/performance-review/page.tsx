// src/app/ai/performance-review/page.tsx
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";

type PerformanceReviewResponse = {
  overallSummary: string;
  strengths: string[];
  growthAreas: string[];
  ratingRecommendation: string;
  ratingRationale: string;
  goalsNextPeriod: string[];
  talkingPointsForConversation: string[];
  toneSuggestions: string[];
};

export default function AiPerformanceReviewPage() {
  const [employeeName, setEmployeeName] = useState("");
  const [roleTitle, setRoleTitle] = useState("");
  const [period, setPeriod] = useState("2025 annual");
  const [ratingScaleContext, setRatingScaleContext] = useState(
    "Standard 3-point scale: Below expectations, Meets expectations, Exceeds expectations."
  );
  const [goalsContext, setGoalsContext] = useState("");
  const [managerNotes, setManagerNotes] = useState("");
  const [selfReviewNotes, setSelfReviewNotes] = useState("");
  const [peerFeedback, setPeerFeedback] = useState("");
  const [calibrationContext, setCalibrationContext] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<PerformanceReviewResponse | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch("/api/ai-performance-review", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          employeeName,
          roleTitle,
          period,
          ratingScaleContext,
          goalsContext,
          managerNotes,
          selfReviewNotes,
          peerFeedback,
          calibrationContext,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        console.error("AI Performance Review error:", res.status, text);
        throw new Error(`HTTP ${res.status}`);
      }

      const json = (await res.json()) as
        | PerformanceReviewResponse
        | { error?: string };

      if ("error" in json) {
        throw new Error(json.error || "Unknown AI error");
      }

      setResult(json as PerformanceReviewResponse);
    } catch (err) {
      console.error("Failed to generate performance review", err);
      setError(
        "Something went wrong generating the review. Check your API key and try again."
      );
    } finally {
      setLoading(false);
    }
  }

  function handleCopy(label: string, content: string | string[]) {
    const text =
      typeof content === "string"
        ? content
        : content.map((line) => `• ${line}`).join("\n");

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
            Intime AI · Performance
          </p>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
            AI performance review assistant
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            Paste manager, self, and peer notes. Intime will draft a structured,
            balanced review you can edit and share.
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
        {/* Left: inputs */}
        <form
          onSubmit={handleSubmit}
          className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <div className="flex items-center justify-between gap-2">
            <h2 className="text-sm font-semibold text-slate-900">
              Review inputs
            </h2>
            <span className="text-[11px] text-slate-500">
              Name + manager notes recommended
            </span>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Employee name *
              </label>
              <input
                type="text"
                required
                value={employeeName}
                onChange={(e) => setEmployeeName(e.target.value)}
                placeholder="Alex Rivera"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Role title
              </label>
              <input
                type="text"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                placeholder="Senior CSM, Staff Engineer..."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Review period
              </label>
              <input
                type="text"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
                placeholder="2025 mid-year, FY25, etc."
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
              />
            </div>
            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-slate-700">
                Rating scale context
              </label>
              <input
                type="text"
                value={ratingScaleContext}
                onChange={(e) => setRatingScaleContext(e.target.value)}
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Goals / expectations context
            </label>
            <textarea
              rows={3}
              value={goalsContext}
              onChange={(e) => setGoalsContext(e.target.value)}
              placeholder="What were they actually supposed to achieve this cycle?"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Manager notes *
            </label>
            <textarea
              rows={5}
              required
              value={managerNotes}
              onChange={(e) => setManagerNotes(e.target.value)}
              placeholder="Paste your rough bullets, Slack notes, calibration doc snippets..."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Self review notes
            </label>
            <textarea
              rows={3}
              value={selfReviewNotes}
              onChange={(e) => setSelfReviewNotes(e.target.value)}
              placeholder="Paste their self review so AI can reconcile differences in perception."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Peer feedback (optional)
            </label>
            <textarea
              rows={3}
              value={peerFeedback}
              onChange={(e) => setPeerFeedback(e.target.value)}
              placeholder="Any 360 feedback, customer quotes, etc."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-slate-700">
              Calibration / comp context (optional)
            </label>
            <textarea
              rows={2}
              value={calibrationContext}
              onChange={(e) => setCalibrationContext(e.target.value)}
              placeholder="Promo / banding / equity context, if relevant."
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400"
            />
          </div>

          <div className="flex items-center justify-between pt-1">
            {error && <p className="text-xs text-red-600">{error}</p>}
            <button
              type="submit"
              disabled={loading || !employeeName || !managerNotes}
              className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-slate-300"
            >
              {loading ? "Drafting review…" : "Generate performance review"}
            </button>
          </div>
        </form>

        {/* Right: output */}
        <div className="flex flex-col gap-4">
          {!result && !loading && (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p className="font-medium">
                Your AI-generated review will appear here.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Use this as a first draft. Edit for nuance, then paste into your
                performance system or Intime reviews.
              </p>
            </div>
          )}

          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600">
              <p className="text-xs text-slate-500">
                Turning your notes into a structured review…
              </p>
            </div>
          )}

          {result && (
            <div className="space-y-4">
              <OutputCard
                title="Overall summary"
                body={result.overallSummary}
                onCopy={() =>
                  handleCopy("Overall summary", result.overallSummary)
                }
              />

              <OutputListCard
                title="Key strengths"
                items={result.strengths}
                onCopy={() => handleCopy("Key strengths", result.strengths)}
              />

              <OutputListCard
                title="Growth areas"
                items={result.growthAreas}
                onCopy={() => handleCopy("Growth areas", result.growthAreas)}
              />

              <OutputCard
                title="Rating recommendation"
                body={`${result.ratingRecommendation}\n\n${result.ratingRationale}`}
                onCopy={() =>
                  handleCopy("Rating recommendation", [
                    result.ratingRecommendation,
                    "",
                    result.ratingRationale,
                  ])
                }
              />

              <OutputListCard
                title="Goals for next period"
                items={result.goalsNextPeriod}
                onCopy={() =>
                  handleCopy("Goals for next period", result.goalsNextPeriod)
                }
              />

              <OutputListCard
                title="Talking points for the conversation"
                items={result.talkingPointsForConversation}
                onCopy={() =>
                  handleCopy(
                    "Talking points for the conversation",
                    result.talkingPointsForConversation
                  )
                }
              />

              <OutputListCard
                title="Tone & language suggestions"
                items={result.toneSuggestions}
                onCopy={() =>
                  handleCopy("Tone & language suggestions", result.toneSuggestions)
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
