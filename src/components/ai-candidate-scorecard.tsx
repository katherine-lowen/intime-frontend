"use client";

import * as React from "react";

type MoatItem = {
  title: string;
  description: string;
  relevance: string;
  example?: string | null;
  source: string;
};

type Scorecard = {
  summary: string;
  detailedAnalysis: string;
  strengths: string[];
  risks: string[];
  skillsMatched: string[];
  skillsMissing: string[];
  cultureIndicators: string[];
  teamFit: string[];
  trajectorySignals: string[];
  moats: MoatItem[];
  recommendation: string;
};

type Props = {
  candidateId: string;
  candidateName?: string | null;
};

type State =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "ready"; data: Scorecard }
  | { status: "error"; message: string };

function badgeClass(rec: string) {
  const normalized = rec.toLowerCase();
  if (normalized.includes("strong")) {
    return "bg-emerald-500/15 text-emerald-300 border-emerald-500/40";
  }
  if (normalized.includes("weak")) {
    return "bg-rose-500/15 text-rose-300 border-rose-500/40";
  }
  return "bg-amber-500/15 text-amber-300 border-amber-500/40";
}

export default function AiCandidateScorecard({
  candidateId,
  candidateName,
}: Props) {
  const [state, setState] = React.useState<State>({ status: "idle" });
  const [activeTab, setActiveTab] = React.useState<
    "overview" | "strengths" | "risks" | "skills" | "moats"
  >("overview");

  const title =
    candidateName && candidateName.length > 0
      ? `AI scorecard for ${candidateName}`
      : "AI candidate scorecard";

  async function loadScorecard() {
    try {
      setState({ status: "loading" });

      const res = await fetch("/api/ai-candidate-scorecard", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ candidateId }),
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status}`);
      }

      const data = (await res.json()) as Scorecard;
      setState({ status: "ready", data });
    } catch (err) {
      console.error("Scorecard error", err);
      setState({
        status: "error",
        message: "Could not generate scorecard. Please try again.",
      });
    }
  }

  React.useEffect(() => {
    void loadScorecard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [candidateId]);

  return (
    <section className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3">
      <header className="flex items-start justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-slate-400">
            Deep-dive AI evaluation including strengths, risks, skills, and
            hidden “moat” advantages.
          </p>
        </div>

        <div className="flex flex-col items-end gap-2">
          {state.status === "ready" && (
            <span
              className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide ${badgeClass(
                state.data.recommendation
              )}`}
            >
              {state.data.recommendation}
            </span>
          )}

          <button
            type="button"
            onClick={loadScorecard}
            disabled={state.status === "loading"}
            className="inline-flex items-center rounded-md border border-slate-700 bg-slate-900 px-2.5 py-1 text-[11px] font-medium text-slate-100 hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {state.status === "loading" ? "Analyzing…" : "Regenerate"}
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="flex gap-2 text-[11px]">
        {[
          ["overview", "Overview"],
          ["strengths", "Strengths"],
          ["risks", "Risks"],
          ["skills", "Skills"],
          ["moats", "Moats"],
        ].map(([key, label]) => (
          <button
            key={key}
            type="button"
            onClick={() =>
              setActiveTab(key as typeof activeTab)
            }
            className={`rounded-full px-2.5 py-1 ${
              activeTab === key
                ? "bg-slate-800 text-slate-100"
                : "bg-slate-900 text-slate-400 hover:bg-slate-800"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="min-h-[120px] text-xs text-slate-100">
        {state.status === "loading" && (
          <p className="animate-pulse text-slate-400">
            Reading resume, notes, and job context…
          </p>
        )}

        {state.status === "error" && (
          <p className="text-rose-400">{state.message}</p>
        )}

        {state.status === "ready" && (
          <>
            {activeTab === "overview" && (
              <div className="space-y-2">
                <p className="text-slate-200 whitespace-pre-wrap">
                  {state.data.summary}
                </p>
                <div className="max-h-52 overflow-y-auto border-t border-slate-800 pt-2 text-slate-300 whitespace-pre-wrap">
                  {state.data.detailedAnalysis}
                </div>
              </div>
            )}

            {activeTab === "strengths" && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-slate-300">
                  Strengths
                </h3>
                {state.data.strengths.length === 0 ? (
                  <p className="text-slate-400">No strengths identified.</p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {state.data.strengths.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                <h3 className="mt-3 text-[11px] font-semibold text-slate-300">
                  Trajectory signals
                </h3>
                {state.data.trajectorySignals.length === 0 ? (
                  <p className="text-slate-400">
                    No clear trajectory signals surfaced.
                  </p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {state.data.trajectorySignals.map((s, i) => (
                      <li key={i}>{s}</li>
                    ))}
                  </ul>
                )}

                <h3 className="mt-3 text-[11px] font-semibold text-slate-300">
                  Culture & team fit
                </h3>
                {state.data.cultureIndicators.length === 0 &&
                state.data.teamFit.length === 0 ? (
                  <p className="text-slate-400">
                    No explicit culture or team signals yet.
                  </p>
                ) : (
                  <>
                    {state.data.cultureIndicators.length > 0 && (
                      <ul className="list-disc pl-4 space-y-1">
                        {state.data.cultureIndicators.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    )}
                    {state.data.teamFit.length > 0 && (
                      <ul className="mt-1 list-disc pl-4 space-y-1">
                        {state.data.teamFit.map((c, i) => (
                          <li key={i}>{c}</li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}

            {activeTab === "risks" && (
              <div className="space-y-2">
                <h3 className="text-[11px] font-semibold text-slate-300">
                  Risks & concerns
                </h3>
                {state.data.risks.length === 0 ? (
                  <p className="text-slate-400">
                    No major risks highlighted. Still use human judgment.
                  </p>
                ) : (
                  <ul className="list-disc pl-4 space-y-1">
                    {state.data.risks.map((r, i) => (
                      <li key={i}>{r}</li>
                    ))}
                  </ul>
                )}
              </div>
            )}

            {activeTab === "skills" && (
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div>
                  <h3 className="text-[11px] font-semibold text-emerald-300">
                    Skills aligned to this role
                  </h3>
                  {state.data.skillsMatched.length === 0 ? (
                    <p className="text-slate-400">
                      No explicit skills alignment surfaced.
                    </p>
                  ) : (
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      {state.data.skillsMatched.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
                <div>
                  <h3 className="text-[11px] font-semibold text-amber-300">
                    Potential gaps or missing skills
                  </h3>
                  {state.data.skillsMissing.length === 0 ? (
                    <p className="text-slate-400">
                      No obvious gaps flagged. Confirm against your scorecard.
                    </p>
                  ) : (
                    <ul className="mt-1 list-disc pl-4 space-y-1">
                      {state.data.skillsMissing.map((s, i) => (
                        <li key={i}>{s}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            )}

            {activeTab === "moats" && (
              <div className="space-y-2">
                <p className="text-slate-300">
                  These are the non-obvious or strategic advantages — the things
                  a great recruiter would flag as &quot;this person might be
                  perfect for X idea or Y initiative.&quot;
                </p>

                {state.data.moats.length === 0 ? (
                  <p className="text-slate-400">
                    No explicit moats detected yet. You can still add manual
                    moat notes in the panel below.
                  </p>
                ) : (
                  <ul className="space-y-2">
                    {state.data.moats.map((m, i) => (
                      <li
                        key={i}
                        className="rounded-md border border-slate-800 bg-slate-900/70 p-2.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h3 className="text-[11px] font-semibold text-slate-100">
                            {m.title}
                          </h3>
                          <span className="text-[10px] uppercase tracking-wide text-slate-500">
                            {m.source}
                          </span>
                        </div>
                        <p className="mt-1 text-[11px] text-slate-200">
                          {m.description}
                        </p>
                        <p className="mt-1 text-[11px] text-slate-400">
                          <span className="font-semibold">How to use it: </span>
                          {m.relevance}
                        </p>
                        {m.example && (
                          <p className="mt-1 text-[11px] text-slate-500">
                            <span className="font-semibold">Example: </span>
                            {m.example}
                          </p>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </>
        )}

        {state.status === "idle" && (
          <p className="text-slate-400">
            Click &quot;Regenerate&quot; to generate a detailed AI scorecard.
          </p>
        )}
      </div>
    </section>
  );
}
