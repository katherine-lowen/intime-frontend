// src/app/ai/workforce/components/AIActions.tsx
"use client";

import {
  Calendar,
  Target,
  DollarSign,
  Scale,
  CheckCircle2,
  Users,
} from "lucide-react";
import { useState, useMemo } from "react";

type AIActionsProps = {
  headcount: number;
  openRoles: number;
  activeCandidates: number;
  timeOffToday: number;
  termsLast90d: number;
};

export function AIActions({
  headcount,
  openRoles,
  activeCandidates,
  timeOffToday,
  termsLast90d,
}: AIActionsProps) {
  const [completed, setCompleted] = useState<number[]>([]);

  // 👉 Build AI-style action items from real data
  const actions = useMemo(() => {
    const items: {
      icon: any;
      text: string;
      priority: "High" | "Medium" | "Low";
      color: string;
    }[] = [];

    // === RETENTION =====================================================
    if (termsLast90d > 0) {
      items.push({
        icon: Calendar,
        text: `Review exit reasons — ${termsLast90d} departures in last 90 days`,
        priority: "High",
        color: "bg-[#EF4444]",
      });

      items.push({
        icon: Users,
        text: "Schedule stay interviews for at-risk employees",
        priority: "High",
        color: "bg-[#EF4444]",
      });
    } else {
      items.push({
        icon: Users,
        text: "No recent turnover — consider reinforcing recognition programs",
        priority: "Low",
        color: "bg-[#10B981]",
      });
    }

    // === HIRING =========================================================
    if (openRoles > 0) {
      items.push({
        icon: Target,
        text: `${openRoles} open roles — optimize phone screens + candidate flow`,
        priority: "High",
        color: "bg-[#EF4444]",
      });

      if (activeCandidates === 0) {
        items.push({
          icon: Target,
          text: "No active candidates — refresh job postings + sourcing channels",
          priority: "High",
          color: "bg-[#EF4444]",
        });
      } else {
        items.push({
          icon: Target,
          text: `${activeCandidates} candidates active — review funnel bottlenecks`,
          priority: "Medium",
          color: "bg-[#F59E0B]",
        });
      }
    }

    // === WORKLOAD ======================================================
    if (timeOffToday > 0) {
      items.push({
        icon: Calendar,
        text: `${timeOffToday} employees out today — rebalance workloads where needed`,
        priority: "Medium",
        color: "bg-[#F59E0B]",
      });
    }

    // === PAYROLL =======================================================
    items.push({
      icon: DollarSign,
      text: "Run a quick payroll check for outliers before next cycle",
      priority: "Low",
      color: "bg-[#10B981]",
    });

    // Fallback if nothing generated (rare)
    if (items.length === 0) {
      items.push({
        icon: Scale,
        text: "No immediate risks — maintain hiring rhythm + engagement touchpoints",
        priority: "Low",
        color: "bg-[#10B981]",
      });
    }

    return items;
  }, [headcount, openRoles, activeCandidates, timeOffToday, termsLast90d]);

  const toggleAction = (index: number) => {
    setCompleted((prev) =>
      prev.includes(index)
        ? prev.filter((i) => i !== index)
        : [...prev, index]
    );
  };

  return (
    <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-[10px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-2 py-1 rounded">
          AI RECOMMENDED
        </span>
        <h2 className="text-[#111827]">AI Actions You Can Take Today</h2>
      </div>

      <div className="space-y-3">
        {actions.map((action, index) => {
          const Icon = action.icon;
          const isCompleted = completed.includes(index);

          return (
            <div
              key={index}
              className={`flex items-center gap-4 p-4 rounded-xl border transition-all ${
                isCompleted
                  ? "bg-[#F0FDF4] border-[#86EFAC]"
                  : "bg-[#F9FAFB] border-[#E5E7EB] hover:border-[#D1D5DB]"
              }`}
            >
              <button
                onClick={() => toggleAction(index)}
                className={`flex-shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                  isCompleted
                    ? "bg-[#10B981] border-[#10B981]"
                    : "bg-white border-[#D1D5DB] hover:border-[#9CA3AF]"
                }`}
              >
                {isCompleted && (
                  <CheckCircle2 className="w-4 h-4 text-white" />
                )}
              </button>

              <Icon
                className={`w-5 h-5 flex-shrink-0 ${
                  isCompleted ? "text-[#10B981]" : "text-[#6B7280]"
                }`}
              />

              <span
                className={`flex-1 ${
                  isCompleted
                    ? "line-through text-[#9CA3AF]"
                    : "text-[#111827]"
                }`}
              >
                {action.text}
              </span>

              <span
                className={`${action.color} text-white px-3 py-1 rounded-full text-[11px] flex-shrink-0`}
              >
                {action.priority}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
