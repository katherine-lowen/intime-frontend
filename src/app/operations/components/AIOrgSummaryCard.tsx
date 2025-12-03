"use client";

import {
  Sparkles,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { motion } from "motion/react";

type InsightKind = "positive" | "action" | "risk";

export type AIOrgInsight = {
  kind: InsightKind;
  title: string;
  text: string;
  metric?: string;
  sparkline?: number[] | null;
};

export type AIOrgSummaryCardProps = {
  updatedLabel?: string;
  headline?: string;
  body?: string[];
  footnote?: string;
  insights?: AIOrgInsight[];
  isLoading?: boolean;
  error?: string | null;
};

// Default demo data (used only if no props are passed)
const DEFAULT_INSIGHTS: AIOrgInsight[] = [
  {
    kind: "positive",
    title: "Growth on Track",
    text: "Headcount growth is on track with Q4 targets.",
    metric: "+12 hires",
    sparkline: [65, 68, 72, 75, 78, 82, 87],
  },
  {
    kind: "action",
    title: "Action Required",
    text: "7 performance reviews are due this week.",
    metric: "7 pending",
    sparkline: null,
  },
  {
    kind: "positive",
    title: "Onboarding Success",
    text: "Onboarding completion rate improved by 12%.",
    metric: "+12%",
    sparkline: [58, 62, 65, 71, 76, 82, 88],
  },
];

const DEFAULT_HEADLINE =
  "Your organization is performing well this week.";
const DEFAULT_BODY: string[] = [
  "Headcount is stable with 12 new hires in the pipeline across Engineering and Product.",
  "Team coverage is healthy across most departments (87% overall), though Design may need extra attention next week due to planned leave.",
];
const DEFAULT_FOOTNOTE =
  "📊 Key metrics trending positively — onboarding completion up 12% and employee sentiment remains strong.";

type InsightStyle = {
  color: string;
  bgColor: string;
  icon: LucideIcon;
};

const INSIGHT_STYLES: Record<InsightKind, InsightStyle> = {
  positive: {
    color: "#68D391",
    bgColor: "#F0FDF4",
    icon: CheckCircle2,
  },
  action: {
    color: "#F6C853",
    bgColor: "#FFFBEB",
    icon: AlertCircle,
  },
  risk: {
    color: "#F97373",
    bgColor: "#FEF2F2",
    icon: AlertCircle,
  },
};

export function AIOrgSummaryCard({
  updatedLabel = "Updated 2h ago",
  headline = DEFAULT_HEADLINE,
  body = DEFAULT_BODY,
  footnote = DEFAULT_FOOTNOTE,
  insights = DEFAULT_INSIGHTS,
  isLoading,
  error,
}: AIOrgSummaryCardProps) {
  const hasInsights = insights && insights.length > 0;

  return (
    <motion.div
      whileHover={{
        y: -2,
        boxShadow: "0 12px 32px rgba(122, 92, 250, 0.15)",
      }}
      transition={{ duration: 0.2 }}
      className="relative overflow-hidden bg-white border border-[#E9D5FF] rounded-xl shadow-[0_2px_8px_rgba(122,92,250,0.08)]"
    >
      {/* Ambient glows */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-[#7A5CFA]/10 via-[#A78BFA]/5 to-transparent rounded-full blur-3xl" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-[#A78BFA]/10 to-transparent rounded-full blur-2xl" />

      {/* Subtle decorative effects */}
      <div className="absolute top-8 right-12 text-xl opacity-10">✨</div>
      <div className="absolute bottom-16 right-8 text-lg opacity-10">⚡</div>

      {/* Header */}
      <div className="relative bg-gradient-to-r from-[#F5F3FF] via-[#FAE8FF] to-[#F5F3FF] border-b border-[#E9D5FF] px-7 py-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-br from-[#7A5CFA] to-[#A78BFA] rounded-xl blur-md opacity-60" />
              <div className="relative w-10 h-10 bg-gradient-to-br from-[#7A5CFA] to-[#A78BFA] rounded-xl flex items-center justify-center shadow-lg">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
            </div>

            <div>
              <h2 className="text-[#0F1419] flex items-center gap-2">
                AI Org Summary
                <Zap className="w-4 h-4 text-[#7A5CFA]" />
              </h2>
              <p className="text-[#5E6C84] text-sm">
                Powered by Intime Intelligence
              </p>
            </div>
          </div>

          <div className="px-3 py-1.5 bg-white/80 backdrop-blur-sm text-[#7A5CFA] rounded-full border border-[#E9D5FF] shadow-sm">
            {updatedLabel}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="relative p-7">
        {/* Loading / error states */}
        {isLoading && (
          <div className="mb-7 p-6 rounded-2xl border border-dashed border-[#E9D5FF] bg-[#F9FAFB] text-sm text-[#5E6C84]">
            Generating latest organization summary…
          </div>
        )}

        {error && !isLoading && (
          <div className="mb-7 p-4 rounded-2xl border border-rose-200 bg-rose-50 text-sm text-rose-700 flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {/* Executive Summary */}
        {!error && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-7 p-6 bg-gradient-to-br from-[#F5F3FF] via-white to-[#FAE8FF] rounded-2xl border border-[#E9D5FF] relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 opacity-5">
              <svg width="120" height="120" viewBox="0 0 120 120">
                {[10, 30, 50, 70].flatMap((y) =>
                  [10, 30, 50, 70].map((x, i) => (
                    <circle
                      key={`${x}-${y}-${i}`}
                      cx={x}
                      cy={y}
                      r="2"
                      fill="#7A5CFA"
                    />
                  ))
                )}
              </svg>
            </div>

            <div className="relative">
              <div className="flex items-start gap-2 mb-3">
                <Sparkles className="w-5 h-5 text-[#7A5CFA] mt-0.5" />
                <h3 className="text-[#0F1419]">Executive Summary</h3>
              </div>

              <div className="space-y-3 text-[#0F1419] leading-relaxed">
                {headline && (
                  <p>
                    <strong>{headline}</strong>
                  </p>
                )}

                {body.map((paragraph, idx) => (
                  <p key={idx}>{paragraph}</p>
                ))}

                {footnote && (
                  <p className="text-[#5E6C84]">{footnote}</p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Insights */}
        {!error && hasInsights && (
          <div className="space-y-3 mb-7">
            <h3 className="text-[#0F1419] flex items-center gap-2">
              Key Insights
              <span className="px-2 py-0.5 bg-[#F5F3FF] text-[#7A5CFA] rounded-full text-xs">
                AI-powered
              </span>
            </h3>

            <div className="space-y-3">
              {insights.map((insight, index) => {
                const style = INSIGHT_STYLES[insight.kind];
                const Icon = style.icon;

                return (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2 + index * 0.1 }}
                    className="group relative flex items-center gap-4 p-4 rounded-xl border border-[#E6E8EC] bg-white hover:border-[#7A5CFA]/30 hover:shadow-md transition-all"
                  >
                    {/* Icon */}
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center border flex-shrink-0"
                      style={{
                        backgroundColor: style.bgColor,
                        borderColor: style.color + "40",
                      }}
                    >
                      <Icon
                        className="w-5 h-5"
                        style={{ color: style.color }}
                      />
                    </div>

                    {/* Text */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-[#0F1419]">
                          {insight.title}
                        </span>
                        {insight.metric && (
                          <span
                            className="px-2 py-0.5 rounded text-xs"
                            style={{
                              backgroundColor: style.bgColor,
                              color: style.color,
                            }}
                          >
                            {insight.metric}
                          </span>
                        )}
                      </div>
                      <p className="text-[#5E6C84] text-sm">
                        {insight.text}
                      </p>
                    </div>

                    {/* Sparkline */}
                    {insight.sparkline && (
                      <div className="hidden lg:block">
                        <svg
                          width="80"
                          height="32"
                          viewBox="0 0 80 32"
                          className="opacity-60"
                        >
                          <path
                            d={`M ${insight.sparkline
                              .map(
                                (val, i) =>
                                  `${i * 13},${32 - (val / 100) * 32}`
                              )
                              .join(" L ")}`}
                            fill="none"
                            stroke={style.color}
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                          {insight.sparkline.map((val, i) => (
                            <circle
                              key={i}
                              cx={i * 13}
                              cy={32 - (val / 100) * 32}
                              r="2"
                              fill={style.color}
                            />
                          ))}
                        </svg>
                      </div>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        {!error && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="w-full px-6 py-4 bg-gradient-to-r from-[#7A5CFA] via-[#8B5CF6] to-[#A78BFA] text-white rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2 relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
            <Sparkles className="w-5 h-5 relative z-10" />
            <span className="relative z-10">Get Detailed Analysis</span>
            <motion.div
              className="absolute top-1 right-4 text-xs"
              animate={{ y: [0, -4, 0], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              ✨
            </motion.div>
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
