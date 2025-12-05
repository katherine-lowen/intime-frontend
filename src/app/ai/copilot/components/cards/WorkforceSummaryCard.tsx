"use client";

export function WorkforceSummaryCard() {
  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-100">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-white">
          Workforce snapshot
        </h3>
        <span className="text-[10px] rounded-full bg-slate-800 px-2 py-0.5 text-slate-300">
          Demo data
        </span>
      </div>
      <div className="grid grid-cols-3 gap-3 text-[11px]">
        <div>
          <div className="text-slate-400">Headcount</div>
          <div className="text-base font-semibold text-white">48</div>
        </div>
        <div>
          <div className="text-slate-400">Locations</div>
          <div className="text-base font-semibold text-white">2</div>
        </div>
        <div>
          <div className="text-slate-400">Departments</div>
          <div className="text-base font-semibold text-white">3</div>
        </div>
      </div>
      <p className="mt-3 text-[11px] text-slate-400">
        This is a preview of how Intime will surface workforce metrics inline
        with your AI conversations.
      </p>
    </div>
  );
}
