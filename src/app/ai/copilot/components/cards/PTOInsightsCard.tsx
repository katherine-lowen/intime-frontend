"use client";

export function PTOInsightsCard() {
  return (
    <div className="mt-3 rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 text-xs text-slate-100">
      <h3 className="text-sm font-semibold text-white mb-2">
        PTO & time-off insights
      </h3>
      <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-300">
        <li>Average PTO balance: 8.5 days remaining.</li>
        <li>Upcoming PTO spikes in the next 30 days for Engineering.</li>
        <li>
          Recommend nudging managers to approve pending requests to avoid end-of-year
          pileups.
        </li>
      </ul>
    </div>
  );
}
