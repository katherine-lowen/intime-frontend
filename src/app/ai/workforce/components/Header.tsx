// src/app/ai/workforce/components/Header.tsx
"use client";

import { Sparkles, RefreshCw } from "lucide-react";

type HeaderProps = {
  isLoading?: boolean;
  headcount: number;
  openRoles: number;
  onRefresh?: () => void;
};

export function Header({ isLoading, headcount, openRoles, onRefresh }: HeaderProps) {
  return (
    <div className="flex items-start justify-between gap-6">
      <div>
        <h1 className="text-[#111827] flex items-center gap-3">
          AI Workforce Pulse
        </h1>
        <p className="text-[#6B7280] mt-2">
          Real-time workforce intelligence powered by Intime AI.
        </p>

        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-1 rounded-full bg-[#EEF2FF] px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E]" />
            {headcount} employees
          </span>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#ECFEFF] px-3 py-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#3B82F6]" />
            {openRoles} open roles
          </span>
        </div>
      </div>

      <div className="flex flex-col items-end gap-2">
        <button
          onClick={onRefresh}
          disabled={isLoading}
          className={`bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:opacity-90 transition-opacity shadow-sm ${
            isLoading ? "opacity-70 cursor-default" : ""
          }`}
        >
          {isLoading ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Sparkles className="w-4 h-4" />
          )}
          {isLoading ? "Refreshing..." : "Generate Full AI Summary"}
        </button>
        <span className="text-[#9CA3AF] text-xs">
          {isLoading ? "Updating from live org data…" : "Live from org data"}
        </span>
      </div>
    </div>
  );
}
