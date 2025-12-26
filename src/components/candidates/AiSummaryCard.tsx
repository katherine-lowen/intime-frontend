"use client";

import { Sparkles } from "lucide-react";

type ParsedResume = {
  fullName: string | null;
  email: string | null;
  phone: string | null;
  location: string | null;
  yearsOfExperience: number | null;
  currentTitle: string | null;
  currentCompany: string | null;
  skills: string[];
  seniority:
    | "Junior"
    | "Mid"
    | "Senior"
    | "Lead"
    | "Director"
    | "VP"
    | "CLevel"
    | null;
  summary: string | null;
} | null;

export function AiSummaryCard({
  name,
  parsed,
}: {
  name: string;
  parsed: ParsedResume;
}) {
  if (!parsed) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 p-5 shadow-sm">
        <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
          <Sparkles className="h-4 w-4" />
          AI Candidate Profile
        </div>
        <p className="text-sm text-slate-600">
          We don&apos;t have an AI summary for this candidate yet. Resume parsing will run soon.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white/80 p-5 shadow-sm backdrop-blur">
      <div className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-indigo-600">
        <Sparkles className="h-4 w-4" />
        AI Candidate Profile
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <h2 className="text-xl font-semibold text-slate-900">{name}</h2>
        {parsed.seniority && (
          <span className="inline-flex items-center rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700">
            {parsed.seniority}
          </span>
        )}
      </div>

      {parsed.summary && (
        <p className="mt-3 text-sm leading-relaxed text-slate-700">
          {parsed.summary}
        </p>
      )}

      <div className="mt-4 space-y-2 text-sm text-slate-700">
        {(parsed.currentTitle || parsed.currentCompany) && (
          <div className="text-xs text-slate-600">
            Current:{" "}
            <span className="font-medium text-slate-900">
              {parsed.currentTitle || "—"} {parsed.currentCompany ? `@ ${parsed.currentCompany}` : ""}
            </span>
          </div>
        )}
        {parsed.yearsOfExperience != null && (
          <div className="text-xs text-slate-600">
            ~{parsed.yearsOfExperience} years of experience
          </div>
        )}
      </div>
    </div>
  );
}
