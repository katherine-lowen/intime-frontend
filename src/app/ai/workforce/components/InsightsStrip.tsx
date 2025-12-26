// src/app/ai/workforce/components/InsightsStrip.tsx
"use client";

import {
  AlertTriangle,
  TrendingUp,
  PhoneCall,
  DollarSign,
  Activity,
  Users,
} from "lucide-react";

type InsightsStripProps = {
  isLoading?: boolean;
  headcount: number;
  openRoles: number;
  activeCandidates: number;
  timeOffToday: number;
  termsLast90d: number;
};

export function InsightsStrip({
  isLoading,
  headcount,
  openRoles,
  activeCandidates,
  timeOffToday,
  termsLast90d,
}: InsightsStripProps) {
  const insights = [
    {
      icon: AlertTriangle,
      title: "Retention Risk",
      value:
        termsLast90d === 0
          ? "No exits in last 90 days"
          : `${termsLast90d} exits in last 90 days`,
      bg: "bg-gradient-to-br from-[#FEF3F2] to-[#FEE2E2]",
      iconColor: "text-[#EF4444]",
    },
    {
      icon: TrendingUp,
      title: "Headcount",
      value: `${headcount} employees on roster`,
      bg: "bg-gradient-to-br from-[#F0F9FF] to-[#DBEAFE]",
      iconColor: "text-[#3B82F6]",
    },
    {
      icon: PhoneCall,
      title: "Hiring Funnel",
      value:
        openRoles === 0
          ? "No open roles right now"
          : `${openRoles} open roles, ${activeCandidates} candidates`,
      bg: "bg-gradient-to-br from-[#FEF9C3] to-[#FEF08A]",
      iconColor: "text-[#EAB308]",
    },
    {
      icon: DollarSign,
      title: "PTO Impact",
      value:
        timeOffToday === 0
          ? "No PTO impact today"
          : `${timeOffToday} people out on PTO`,
      bg: "bg-gradient-to-br from-[#FDF4FF] to-[#FAE8FF]",
      iconColor: "text-[#A855F7]",
    },
    {
      icon: Activity,
      title: "Engagement Shift",
      value: "Signals coming soon from performance + surveys",
      bg: "bg-gradient-to-br from-[#F0FDFA] to-[#CCFBF1]",
      iconColor: "text-[#14B8A6]",
    },
    {
      icon: Users,
      title: "Team Velocity",
      value: "AI is monitoring pipeline + workload patterns",
      bg: "bg-gradient-to-br from-[#F5F3FF] to-[#EDE9FE]",
      iconColor: "text-[#8B5CF6]",
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {insights.map((insight) => {
        const Icon = insight.icon;
        return (
          <div
            key={insight.title}
            className={`${insight.bg} rounded-2xl p-5 border border-[#E5E7EB] shadow-sm hover:shadow-md transition-shadow relative overflow-hidden`}
          >
            <div className="absolute top-2 right-2 text-[10px] text-[#6B7280]">
              ✨
            </div>
            <Icon className={`w-5 h-5 ${insight.iconColor} mb-3`} />
            <div className="text-[#6B7280] mb-1 text-xs font-medium">
              {insight.title}
            </div>
            <div className="text-[#111827] text-sm">
              {isLoading ? (
                <span className="inline-block h-4 w-24 rounded-md bg-white/60 animate-pulse" />
              ) : (
                insight.value
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
