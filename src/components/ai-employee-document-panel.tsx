// src/components/ai-employee-document-panel.tsx
"use client";

import * as React from "react";

type AiEmployeeDocumentPanelProps = {
  documentId: string;
  documentTitle?: string | null;
};

type AiState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; text: string }
  | { status: "error"; message: string };

export default function AiEmployeeDocumentPanel({
  documentId,
  documentTitle,
}: AiEmployeeDocumentPanelProps) {
  const [state, setState] = React.useState<AiState>({ status: "idle" });

  async function runAnalysis() {
    try {
      setState({ status: "loading" });

      const res = await fetch("/api/ai-insights", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scope: "employee_document",
          documentId,
        }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as { title?: string; body?: string };
      const text = data.body?.trim() || "No insights returned.";

      setState({ status: "ready", text });
    } catch (err: any) {
      console.error("AI document insights error:", err);
      setState({
        status: "error",
        message:
          err instanceof Error ? err.message : "Failed to generate insights.",
      });
    }
  }

  React.useEffect(() => {
    // reset when the document changes; user can click to run
    setState({ status: "idle" });
  }, [documentId]);

  const title =
    documentTitle && documentTitle.length > 0
      ? `AI summary for "${documentTitle}"`
      : "AI document summary";

  return (
    <section className="space-y-3 rounded-lg border border-slate-800 bg-slate-950/40 p-4">
      <header className="flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-50">{title}</h2>
          <p className="text-xs text-slate-400">
            Generated from this document&apos;s metadata and related employee
            context.
          </p>
        </div>
        <button
          type="button"
          onClick={runAnalysis}
          disabled={state.status === "loading"}
          className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {state.status === "loading" ? "Thinking…" : "Run analysis"}
        </button>
      </header>

      {state.status === "error" && (
        <p className="text-xs text-red-400">
          Something went wrong: {state.message}
        </p>
      )}

      {state.status === "ready" && (
        <article className="space-y-1 text-xs leading-relaxed text-slate-100">
          {state.text.split("\n").map((line, idx) => (
            <p key={idx}>{line}</p>
          ))}
        </article>
      )}

      {state.status === "idle" && (
        <p className="text-xs text-slate-500">
          Click &quot;Run analysis&quot; to get a quick AI summary, plus
          heads-up on any important dates, obligations, or opportunities this
          document might represent.
        </p>
      )}
    </section>
  );
}
