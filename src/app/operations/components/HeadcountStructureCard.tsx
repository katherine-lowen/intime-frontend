"use client";

import { Users, TrendingUp, Building2 } from "lucide-react";
import { motion } from "motion/react";

export type HeadcountStructureCardProps = {
  totalEmployees?: number;
  growthCount?: number;
  growthPercent?: number;
  fullTimeCount?: number;
  contractorCount?: number;
  departmentCount?: number;
  updatedLabel?: string;
  isLoading?: boolean;
  error?: string | null;
};

// Demo defaults (used when no props passed)
const DEFAULT_DATA: Required<
  Omit<HeadcountStructureCardProps, "isLoading" | "error">
> = {
  totalEmployees: 247,
  growthCount: 12,
  growthPercent: 5.1,
  fullTimeCount: 234,
  contractorCount: 13,
  departmentCount: 8,
  updatedLabel: "Last 30 days",
};

export function HeadcountStructureCard(
  props: HeadcountStructureCardProps = {}
) {
  const {
    totalEmployees = DEFAULT_DATA.totalEmployees,
    growthCount = DEFAULT_DATA.growthCount,
    growthPercent = DEFAULT_DATA.growthPercent,
    fullTimeCount = DEFAULT_DATA.fullTimeCount,
    contractorCount = DEFAULT_DATA.contractorCount,
    departmentCount = DEFAULT_DATA.departmentCount,
    updatedLabel = DEFAULT_DATA.updatedLabel,
    isLoading,
    error,
  } = props;

  const netGrowthIsPositive = growthCount >= 0;

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
            <Users className="w-5 h-5 text-[#2C6DF9]" />
          </div>
          <div>
            <h2 className="text-[#0F1419]">Headcount &amp; Structure</h2>
            <p className="text-xs text-[#6B7280]">{updatedLabel}</p>
          </div>
        </div>
      </div>

      {/* Error / loading states */}
      {isLoading && (
        <div className="mb-4 rounded-md border border-dashed border-[#E5E7EB] bg-[#F9FAFB] px-3 py-2 text-xs text-[#6B7280]">
          Updating headcount snapshot…
        </div>
      )}

      {error && !isLoading && (
        <div className="mb-4 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
          {error}
        </div>
      )}

      <div className="space-y-6">
        {/* Main Headcount */}
        <div>
          <div className="flex items-baseline gap-2 mb-1">
            <span className="text-[40px] leading-none text-[#0F1419]">
              {totalEmployees.toLocaleString()}
            </span>
            <span
              className={`flex items-center gap-1 text-sm ${
                netGrowthIsPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              <TrendingUp className="w-4 h-4" />
              <span>
                {netGrowthIsPositive ? "+" : ""}
                {growthCount}
              </span>
            </span>
          </div>
          <p className="text-[#5E6C84] text-sm">Total employees</p>
        </div>

        {/* Structure Breakdown */}
        <div className="space-y-3">
          <div className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#2C6DF9] rounded-full" />
              <span className="text-[#0F1419] text-sm">Full-time</span>
            </div>
            <span className="text-[#0F1419] text-sm">
              {fullTimeCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 bg-[#8B5CF6] rounded-full" />
              <span className="text-[#0F1419] text-sm">Contractors</span>
            </div>
            <span className="text-[#0F1419] text-sm">
              {contractorCount.toLocaleString()}
            </span>
          </div>

          <div className="flex items-center justify-between p-3 bg-[#FAFBFC] rounded-lg border border-[#E6E8EC]">
            <div className="flex items-center gap-3">
              <Building2 className="w-4 h-4 text-[#5E6C84]" />
              <span className="text-[#0F1419] text-sm">Departments</span>
            </div>
            <span className="text-[#0F1419] text-sm">
              {departmentCount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Growth Trend */}
        <div className="pt-4 border-t border-[#E6E8EC]">
          <div className="flex items-center justify-between">
            <span className="text-[#5E6C84] text-sm">30-day growth</span>
            <span
              className={`text-sm font-medium ${
                netGrowthIsPositive ? "text-[#22C55E]" : "text-[#EF4444]"
              }`}
            >
              {netGrowthIsPositive ? "+" : ""}
              {growthPercent.toFixed(1)}%
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
