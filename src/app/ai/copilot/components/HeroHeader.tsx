"use client";

import { Sparkles } from "lucide-react";

export function HeroHeader() {
  return (
    <header className="border-b border-slate-800/60 bg-[#05050a]/95 backdrop-blur">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-8 py-6 md:flex-row md:items-center md:justify-between">
        {/* Left: title + copy */}
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/40 bg-indigo-500/10 px-3 py-1 text-[11px] font-medium text-indigo-200">
            <Sparkles className="h-3 w-3" />
            <span>AI Workspace</span>
            <span className="rounded-full bg-slate-900/60 px-2 py-0.5 text-[10px] text-slate-300">
              Intime Labs
            </span>
          </div>

          <h1 className="text-2xl font-semibold tracking-tight text-slate-50">
            Ask Intime about your people, roles, and time.
          </h1>

          <p className="max-w-xl text-sm text-slate-400">
            Analyze your workforce, evaluate candidates, draft JDs, and explore
            PTO or headcount scenarios — all in one AI-first workspace.
          </p>
        </div>

        {/* Right: small summary pill */}
        <div className="flex flex-col items-start gap-2 text-xs text-slate-300 md:items-end">
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 px-4 py-3">
            <div className="flex items-center justify-between gap-6">
              <div>
                <div className="text-[11px] uppercase tracking-wide text-slate-500">
                  Demo workspace
                </div>
                <div className="mt-1 text-sm font-medium text-slate-100">
                  Intime org · 48 employees
                </div>
              </div>
              <div className="h-2 w-24 overflow-hidden rounded-full bg-slate-800">
                <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-indigo-400 to-sky-400" />
              </div>
            </div>
            <p className="mt-2 text-[11px] text-slate-500">
              Future: live data from jobs, people, time-off, and payroll.
            </p>
          </div>
        </div>
      </div>
    </header>
  );
}
