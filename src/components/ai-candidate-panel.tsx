"use client";

import * as React from "react";

type AiCandidatePanelProps = {
  candidateId: string;
  candidateName?: string | null;
};

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "error"; message: string };

export default function AiCandidatePanel({
  candidateId,
  candidateName,
}: AiCandidatePanelProps) {
  const [state, setState] = React.useState<AiState>({ status: "idle" });

  async function runAnalysis() {
    try {
      setState({ status: "loading" });

      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          scope: "candidate",
          candidateId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { title?: string; body?: string };
      const text = data.body?.trim() || "No insights returned.";

      setState({ status: "ready", text });
    } catch (err: any) {
      console.error("AI candidate insights error:", err);
      setState({
        status: "error",
        message: "Something went wrong generating insights.",
      });
    }
  }

  // Run once on mount
  React.useEffect(() => {
    void runAnalysis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  const title =
    candidateName && candidateName.length > 0
      ? `AI summary for ${candidateName}`
      : "AI candidate summary";

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-slate-400">
            Generated from this candidate&apos;s profile and activity.
          </p>
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={state.status === "loading"}
          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "loading" ? "Thinking…" : "Regenerate"}
        </button>
      </header>

      {state.status === "loading" && (
        <p className="text-xs text-slate-400 animate-pulse">
          Analyzing candidate data…
        </p>
      )}

      {state.status === "error" && (
        <p className="text-xs text-rose-400">{state.message}</p>
      )}

      {state.status === "ready" && (
        <article className="prose prose-invert max-w-none prose-p:my-1 prose-ul:my-1 prose-li:my-0.5 text-xs">
          {state.text.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </article>
      )}

      {state.status === "idle" && (
        <p className="text-xs text-slate-500">
          Click &quot;Regenerate&quot; to get a quick AI summary of this
          candidate.
        </p>
      )}
    </section>
  );
}
