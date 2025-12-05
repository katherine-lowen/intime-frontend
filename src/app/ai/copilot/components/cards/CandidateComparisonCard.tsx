"use client";

export function CandidateComparisonCard() {
  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-100">
      <h3 className="text-sm font-semibold text-white mb-2">
        Candidate comparison (demo)
      </h3>
      <div className="grid grid-cols-2 gap-3 text-[11px]">
        <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2">
          <div className="font-semibold text-white mb-1">Candidate A</div>
          <p className="text-slate-300">Stronger SaaS experience, better role fit.</p>
        </div>
        <div className="rounded-lg bg-slate-900/50 border border-slate-800/80 p-2">
          <div className="font-semibold text-white mb-1">Candidate B</div>
          <p className="text-slate-300">
            Stronger infra background, but weaker on GTM collaboration.
          </p>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        Intime can generate these summaries directly from resumes, scorecards,
        and interview notes.
      </p>
    </div>
  );
}
