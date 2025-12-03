"use client";

import { UserPlus, CheckCircle2, Circle } from "lucide-react";
import { motion } from "motion/react";

export type OnboardingStage = {
  label: string;
  count: number;
  color: string;
};

export type RecentOnboarding = {
  initials: string;
  name: string;
  subtitle: string;
  status: "completed" | "in_progress";
};

export type OnboardingPipelineCardProps = {
  totalActive?: number;
  stages?: OnboardingStage[];
  recent?: RecentOnboarding[];
  isLoading?: boolean;
  error?: string | null;
};

// Demo defaults (used if no props passed)
const DEFAULT_STAGES: OnboardingStage[] = [
  { label: "Pre-boarding", count: 3, color: "#F59E0B" },
  { label: "First Day", count: 2, color: "#2C6DF9" },
  { label: "First Week", count: 5, color: "#8B5CF6" },
  { label: "First Month", count: 4, color: "#22C55E" },
];

const DEFAULT_RECENT: RecentOnboarding[] = [
  {
    initials: "AK",
    name: "Alex Kim",
    subtitle: "Engineering · Day 3",
    status: "completed",
  },
  {
    initials: "SP",
    name: "Sofia Patel",
    subtitle: "Product · Day 1",
    status: "in_progress",
  },
];

export function OnboardingPipelineCard(
  props: OnboardingPipelineCardProps = {}
) {
  const {
    totalActive = DEFAULT_STAGES.reduce((sum, s) => sum + s.count, 0),
    stages = DEFAULT_STAGES,
    recent = DEFAULT_RECENT,
    isLoading,
    error,
  } = props;

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: "0 8px 24px rgba(0, 0, 0, 0.06)" }}
      transition={{ duration: 0.2 }}
      className="bg-white border border-[#E6E8EC] rounded-xl p-7 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 bg-[#F0F5FF] rounded-lg flex items-center justify-center">
            <UserPlus className="w-5 h-5 text-[#2C6DF9]" />
          </div>
          <h2 className="text-[#0F1419]">Onboarding Pipeline</h2>
        </div>
        <div className="px-3 py-1 bg-[#F0F5FF] text-[#2C6DF9] rounded-full text-sm">
          {totalActive} active
        </div>
      </div>

      {/* Loading + Error state */}
      {isLoading && (
        <div className="mb-4 rounded-md border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#6B7280]">
          Syncing onboarding pipeline…
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      {/* Pipeline Stages */}
      <div className="space-y-3 mb-6">
        {stages.map((stage, index) => (
          <div
            key={stage.label + index}
            className="flex items-center gap-3 p-3 rounded-lg border border-[#E6E8EC] bg-[#FAFBFC] hover:border-[#2C6DF9]/30 transition-colors"
          >
            <div
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: stage.color }}
            />
            <div className="flex-1">
              <span className="text-[#0F1419]">{stage.label}</span>
            </div>
            <div className="px-3 py-1 bg-white rounded-md border border-[#E6E8EC]">
              <span className="text-[#0F1419]">{stage.count}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Onboardings */}
      <div className="pt-6 border-t border-[#E6E8EC]">
        <h3 className="text-[#0F1419] mb-4">Recent</h3>
        <div className="space-y-3">
          {recent.map((item, index) => (
            <div
              key={item.name + index}
              className="flex items-center gap-3"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-[#2C6DF9] to-[#8B5CF6] rounded-full flex items-center justify-center text-white">
                {item.initials}
              </div>
              <div className="flex-1">
                <p className="text-[#0F1419]">{item.name}</p>
                <p className="text-[#5E6C84] text-sm">{item.subtitle}</p>
              </div>
              {item.status === "completed" ? (
                <CheckCircle2 className="w-5 h-5 text-[#22C55E]" />
              ) : (
                <Circle className="w-5 h-5 text-[#E6E8EC]" />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
