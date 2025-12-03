// src/components/figma/ui/AIInsightsCard.tsx
"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Sparkles,
  TrendingUp,
  Calendar,
  Plus,
  ArrowUpRight,
  Activity,
  Zap,
} from "lucide-react";

type InsightResponse = {
  title: string;
  summary: string;
};

export function AIInsightCard() {
  const [insight, setInsight] = useState<InsightResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchInsight = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch("/api/ai-insights", {
        method: "POST",
      });

      if (!res.ok) {
        throw new Error(`Request failed with status ${res.status}`);
      }

      const data = (await res.json()) as InsightResponse;
      setInsight(data);
    } catch (err) {
      console.error(err);
      setError("Couldn’t refresh AI insight. Try again in a moment.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Load an initial narrative on mount
  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return (
    <div className="relative overflow-hidden rounded-[32px] shadow-ai-glow">
      {/* Ultra-premium gradient background - Navy to Indigo to Electric Blue to Violet */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-indigo-950 via-blue-950 to-violet-950" />

      {/* Cinematic overlay gradients for depth */}
      <div className="absolute inset-0 bg-gradient-to-tr from-blue-600/30 via-transparent via-transparent to-violet-600/30" />
      <div className="absolute inset-0 bg-gradient-to-bl from-cyan-500/20 via-transparent to-purple-600/20" />

      {/* Particle field background */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="particle absolute top-[10%] left-[15%] w-2 h-2 bg-blue-400/40 rounded-full blur-sm"
          style={{ animationDelay: "0s" }}
        />
        <div
          className="particle absolute top-[30%] right-[20%] w-3 h-3 bg-purple-400/30 rounded-full blur-sm"
          style={{ animationDelay: "2s" }}
        />
        <div
          className="particle absolute bottom-[25%] left-[25%] w-2 h-2 bg-cyan-400/40 rounded-full blur-sm"
          style={{ animationDelay: "4s" }}
        />
        <div
          className="particle absolute top-[60%] right-[30%] w-2 h-2 bg-violet-400/30 rounded-full blur-sm"
          style={{ animationDelay: "1s" }}
        />
        <div
          className="particle absolute bottom-[40%] right-[15%] w-3 h-3 bg-blue-400/20 rounded-full blur-sm"
          style={{ animationDelay: "3s" }}
        />
        <div
          className="particle absolute top-[45%] left-[35%] w-2 h-2 bg-purple-400/40 rounded-full blur-sm"
          style={{ animationDelay: "5s" }}
        />
      </div>

      {/* Glossy top sheen */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

      {/* Content */}
      <div className="relative px-12 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_560px] gap-12 items-start">
          {/* LEFT SIDE - Header & Stats */}
          <div className="space-y-10">
            {/* Header */}
            <div className="space-y-6">
              {/* AI Badge with holographic border */}
              <div className="inline-flex items-center gap-3 px-5 py-3 rounded-full glass-dark holographic-border group/badge hover:scale-105 transition-transform duration-500">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-blue-300 glow-pulse" />
                  <div className="absolute inset-0 bg-blue-400 blur-xl opacity-50" />
                </div>
                <span className="gradient-text-ai text-sm font-bold tracking-wide">
                  AI TIME INSIGHTS
                </span>
              </div>

              <div className="space-y-4">
                <h3 className="text-white text-5xl font-semibold tracking-tight leading-tight">
                  {insight?.title || "Early activity across your org"}
                </h3>

                {/* CLICKABLE AI NARRATIVE TEXT */}
                <button
                  type="button"
                  onClick={fetchInsight}
                  className="text-left text-slate-300 text-lg leading-relaxed max-w-2xl cursor-pointer underline-offset-4 decoration-sky-400/50 hover:decoration-sky-300 hover:text-slate-100 transition-colors"
                  title="Click to refresh this AI narrative"
                >
                  {loading && !insight
                    ? "Generating AI insight..."
                    : insight?.summary ||
                      "We've detected unusual patterns in hiring velocity and time-off clustering. Here's what you should know this week to stay ahead."}
                </button>

                {error && (
                  <p className="text-sm text-rose-300/80 max-w-md">
                    {error}
                  </p>
                )}

                {loading && insight && (
                  <p className="text-[11px] text-sky-300/80">
                    Refreshing insight…
                  </p>
                )}
              </div>
            </div>

            {/* Glass Panel Stats with Holographic Edges */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* Stat 1 - People Active */}
              <div className="glass-dark rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 group/stat holographic-border relative overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-sm font-semibold tracking-wide uppercase">
                      People Active
                    </div>
                    <div className="relative">
                      <Activity className="w-5 h-5 text-emerald-400 group-hover/stat:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-0 group-hover/stat:opacity-60 transition-opacity" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-white text-5xl font-bold tracking-tight">
                      189
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500/15 rounded-xl border border-emerald-400/30 inner-glow-ai">
                      <ArrowUpRight className="w-4 h-4 text-emerald-400" />
                      <span className="text-emerald-400 text-sm font-bold">
                        +12% this week
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat 2 - Events Logged */}
              <div className="glass-dark rounded-3xl p-8 hover:bg-white/10 transition-all duration-500 group/stat holographic-border relative overflow-hidden">
                {/* Hover glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-transparent opacity-0 group-hover/stat:opacity-100 transition-opacity duration-500" />

                <div className="relative space-y-5">
                  <div className="flex items-center justify-between">
                    <div className="text-slate-400 text-sm font-semibold tracking-wide uppercase">
                      Events Logged
                    </div>
                    <div className="relative">
                      <Zap className="w-5 h-5 text-blue-400 group-hover/stat:scale-110 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-blue-400 blur-xl opacity-0 group-hover/stat:opacity-60 transition-opacity" />
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="text-white text-5xl font-bold tracking-tight">
                      1,043
                    </div>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-500/15 rounded-xl border border-blue-400/30 inner-glow-ai">
                      <span className="text-blue-400 text-sm font-bold">
                        Across 8 teams
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT SIDE - Recommendations (still static for now) */}
          <div className="space-y-6">
            <div className="text-slate-300 text-sm font-bold tracking-wide uppercase">
              Recommended Next Steps
            </div>

            <div className="space-y-5">
              {/* Recommendation 1 */}
              <div className="glass-dark rounded-3xl p-7 hover:bg-white/10 transition-all duration-500 group/rec holographic-border relative overflow-hidden">
                {/* Animated shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer opacity-0 group-hover/rec:opacity-100" />

                <div className="relative flex items-start gap-5">
                  {/* Left side - Icon & Content */}
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="flex-shrink-0 relative">
                      <div className="p-4 bg-gradient-to-br from-blue-500/30 to-purple-500/30 text-blue-300 rounded-2xl border border-blue-400/30 inner-glow-ai group-hover/rec:scale-110 group-hover/rec:rotate-3 transition-transform duration-500">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div className="absolute inset-0 bg-blue-400 blur-2xl opacity-0 group-hover/rec:opacity-40 transition-opacity rounded-2xl" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="text-white text-base font-semibold">
                        Schedule Q4 reviews
                      </div>
                      <div className="text-slate-400 text-sm">
                        12 team members pending
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action Button */}
                  <button className="flex-shrink-0 inline-flex items-center gap-2.5 px-5 py-3 glass-dark hover:bg-white/20 text-white rounded-2xl text-sm font-semibold transition-all duration-300 border border-white/15 hover:border-white/30 inner-glow group-hover/rec:translate-x-1 holographic-border">
                    <Plus className="w-4 h-4" />
                    <span>Add as event</span>
                  </button>
                </div>
              </div>

              {/* Recommendation 2 */}
              <div className="glass-dark rounded-3xl p-7 hover:bg-white/10 transition-all duration-500 group/rec holographic-border relative overflow-hidden">
                {/* Animated shimmer on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent shimmer opacity-0 group-hover/rec:opacity-100" />

                <div className="relative flex items-start gap-5">
                  {/* Left side - Icon & Content */}
                  <div className="flex items-start gap-5 flex-1 min-w-0">
                    <div className="flex-shrink-0 relative">
                      <div className="p-4 bg-gradient-to-br from-purple-500/30 to-pink-500/30 text-purple-300 rounded-2xl border border-purple-400/30 inner-glow-ai group-hover/rec:scale-110 group-hover/rec:rotate-3 transition-transform duration-500">
                        <TrendingUp className="w-5 h-5" />
                      </div>
                      <div className="absolute inset-0 bg-purple-400 blur-2xl opacity-0 group-hover/rec:opacity-40 transition-opacity rounded-2xl" />
                    </div>
                    <div className="space-y-2 pt-2">
                      <div className="text-white text-base font-semibold">
                        Review open positions
                      </div>
                      <div className="text-slate-400 text-sm">
                        3 roles over 60 days
                      </div>
                    </div>
                  </div>

                  {/* Right side - Action Button */}
                  <button className="flex-shrink-0 inline-flex items-center gap-2.5 px-5 py-3 glass-dark hover:bg-white/20 text-white rounded-2xl text-sm font-semibold transition-all duration-300 border border-white/15 hover:border-white/30 inner-glow group-hover/rec:translate-x-1 holographic-border">
                    <Plus className="w-4 h-4" />
                    <span>Add as event</span>
                  </button>
                </div>
              </div>
            </div>

            {/* View all insights link */}
            <button
              type="button"
              onClick={fetchInsight}
              className="inline-flex items-center gap-2.5 text-sm text-slate-300 hover:text-white transition-colors font-semibold group/link mt-4"
            >
              <span>
                {loading ? "Refreshing insight…" : "Regenerate insight"}
              </span>
              <ArrowUpRight className="w-5 h-5 group-hover/link:translate-x-1 group-hover/link:-translate-y-1 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>

      {/* Bottom glow accent */}
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-400/40 via-purple-400/40 to-transparent glow-pulse" />
    </div>
  );
}
