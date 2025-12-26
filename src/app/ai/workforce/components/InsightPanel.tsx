// src/app/ai/workforce/components/InsightPanel.tsx
"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Sparkles } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { HiringFunnelStage, TeamCapacity } from "../useWorkforceOverview";

const retentionData = [
  { month: "Jan", score: 82 },
  { month: "Feb", score: 79 },
  { month: "Mar", score: 75 },
  { month: "Apr", score: 71 },
  { month: "May", score: 68 },
  { month: "Jun", score: 65 },
];

const payrollData = [
  { month: "Jan", amount: 482 },
  { month: "Feb", amount: 498 },
  { month: "Mar", amount: 512 },
  { month: "Apr", amount: 526 },
  { month: "May", amount: 548 },
  { month: "Jun", amount: 612 },
];

interface InsightPanelProps {
  title: string;
  type: "retention" | "hiring" | "capacity" | "payroll";
  isLoading?: boolean;
  summary?: string | null;
  hiringFunnel?: HiringFunnelStage[];
  teamCapacity?: TeamCapacity[];
  openRoles?: number;
}

export function InsightPanel({
  title,
  type,
  isLoading,
  summary,
  hiringFunnel,
  teamCapacity,
  openRoles,
}: InsightPanelProps) {
  const [isExpanded, setIsExpanded] = useState(true);

  const renderSummary = () => {
    const content =
      summary && summary.trim().length > 0
        ? summary
        : (() => {
            switch (type) {
              case "retention":
                return "AI detected a downward engagement trend in key teams over the last 90 days. Recommend targeted 1:1s with at-risk employees and a review of workload and recognition.";
              case "hiring":
                return "AI is monitoring your funnel for drop-offs and time-to-fill. Focus on stages with the highest candidate loss and long cycle times.";
              case "capacity":
                return "AI is tracking team load to flag overload and underutilization. Consider rebalance opportunities before pushing major new initiatives.";
              case "payroll":
                return "Payroll forecasting will unlock once payroll (Gusto, QuickBooks, etc.) is connected so we can model burn, hiring plans, and budget variance.";
            }
          })();

    const bgByType: Record<typeof type, string> = {
      retention: "from-[#F9FAFB] to-[#F3F4F6]",
      hiring: "from-[#FEF9C3] to-[#FEF08A]",
      capacity: "from-[#FEF3F2] to-[#FEE2E2]",
      payroll: "from-[#FDF4FF] to-[#FAE8FF]",
    };

    const borderByType: Record<typeof type, string> = {
      retention: "border-[#E5E7EB]",
      hiring: "border-[#FDE047]",
      capacity: "border-[#FEE2E2]",
      payroll: "border-[#F3E8FF]",
    };

    return (
      <div
        className={`mt-4 p-4 bg-gradient-to-br ${bgByType[type]} rounded-xl border ${borderByType[type]}`}
      >
        <p className="text-[#6B7280] text-sm">
          <span className="text-[#111827] font-medium">AI summary: </span>
          {content}
        </p>
      </div>
    );
  };

  const renderChartWithLoading = (chart: React.ReactNode) => (
    <div className="relative">
      {isLoading && (
        <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-xl">
          <div className="h-8 w-24 rounded-full bg-[#E5E7EB] animate-pulse" />
        </div>
      )}
      {chart}
    </div>
  );

  const getContent = () => {
    switch (type) {
      case "retention":
        return (
          <>
            {renderChartWithLoading(
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={retentionData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <YAxis
                    domain={[0, 100]}
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="score"
                    stroke="#EF4444"
                    strokeWidth={2}
                    dot={{ fill: "#EF4444" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between p-3 bg-[#FEF3F2] rounded-lg border border-[#FEE2E2]">
                <div>
                  <div className="text-[#6B7280] text-sm">Sarah Chen</div>
                  <div className="text-[#EF4444] text-xs">
                    Engagement score: 42/100
                  </div>
                </div>
                <div className="px-2 py-1 bg-[#EF4444] text-white rounded text-[11px]">
                  HIGH RISK
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-[#FEF3F2] rounded-lg border border-[#FEE2E2]">
                <div>
                  <div className="text-[#6B7280] text-sm">Marcus Liu</div>
                  <div className="text-[#EF4444] text-xs">
                    Engagement score: 38/100
                  </div>
                </div>
                <div className="px-2 py-1 bg-[#EF4444] text-white rounded text-[11px]">
                  HIGH RISK
                </div>
              </div>
            </div>
            {renderSummary()}
          </>
        );

      case "hiring": {
        // normalize so it's always an array
        const funnelSource = hiringFunnel ?? [];
        const funnel =
          funnelSource.length > 0
            ? funnelSource
            : [{ stage: "No data", count: 0 }];

        const totalCandidates = funnel.reduce(
          (sum, stage) => sum + (stage.count ?? 0),
          0
        );

        const maxStage =
          funnelSource.length > 0
            ? funnelSource.reduce((max, stage) =>
                (stage.count ?? 0) > (max.count ?? 0) ? stage : max
              )
            : null;

        const busiestStage = maxStage?.stage ?? "No data";

        const openRolesLabel =
          typeof openRoles === "number"
            ? `${openRoles} ${openRoles === 1 ? "role" : "roles"}`
            : "Add roles";

        return (
          <>
            {renderChartWithLoading(
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={funnel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="stage"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip />
                  <Bar
                    dataKey="count"
                    fill="#6366F1"
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 grid grid-cols-3 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF] text-xs">Pipeline Volume</div>
                <div className="text-[#111827] text-sm">
                  {totalCandidates} candidates
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF] text-xs">Busiest Stage</div>
                <div className="text-[#111827] text-sm">{busiestStage}</div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF] text-xs">Open Roles</div>
                <div className="text-[#111827] text-sm">{openRolesLabel}</div>
              </div>
            </div>
            {renderSummary()}
          </>
        );
      }

      case "capacity": {
        const capacity = (teamCapacity ?? []).map((t) => {
          const load = t.loadPercent ?? 0;
          return {
            team: t.team || "Unassigned",
            load,
            color:
              load > 85
                ? "#EF4444"
                : load < 70
                ? "#10B981"
                : "#6366F1",
          };
        });

        const hottest =
          capacity.length > 0
            ? capacity.reduce((max, entry) =>
                entry.load > max.load ? entry : max
              )
            : null;

        return (
          <>
            {renderChartWithLoading(
              capacity.length ? (
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={capacity} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                    <XAxis
                      type="number"
                      domain={[0, 100]}
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    />
                    <YAxis
                      dataKey="team"
                      type="category"
                      tick={{ fill: "#9CA3AF", fontSize: 11 }}
                    />
                    <Tooltip />
                    <Bar dataKey="load" radius={[0, 8, 8, 0]}>
                      {capacity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-[180px] flex items-center justify-center rounded-xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB] text-sm text-[#6B7280]">
                  No team capacity data yet — add employees with departments to
                  see this view.
                </div>
              )
            )}
            <div className="mt-4 flex gap-2">
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="w-3 h-3 rounded-full bg-[#EF4444]" />
                <span className="text-[#6B7280] text-xs">
                  Overloaded ({">"}85%)
                </span>
              </div>
              <div className="flex items-center gap-2 px-3 py-2 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                <span className="text-[#6B7280] text-xs">
                  Available ({"<"}70%)
                </span>
              </div>
            </div>
            <div className="mt-3 text-sm text-[#374151]">
              {hottest
                ? `${hottest.team} is at ${hottest.load}% of modeled capacity. Consider rebalancing work from over-loaded teams to lower-load groups.`
                : "No team load data yet. Add team assignments to start monitoring utilization."}
            </div>
            {renderSummary()}
          </>
        );
      }

      case "payroll":
        return (
          <>
            {renderChartWithLoading(
              <ResponsiveContainer width="100%" height={180}>
                <LineChart data={payrollData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
                  <XAxis
                    dataKey="month"
                    tick={{ fill: "#9CA3AF", fontSize: 11 }}
                  />
                  <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="amount"
                    stroke="#8B5CF6"
                    strokeWidth={2}
                    dot={{ fill: "#8B5CF6" }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
            <div className="mt-4 grid grid-cols-2 gap-3">
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF] text-xs">Current Monthly</div>
                <div className="text-[#111827] text-sm">
                  Connect payroll to populate
                </div>
              </div>
              <div className="p-3 bg-white rounded-lg border border-[#E5E7EB]">
                <div className="text-[#9CA3AF] text-xs">Forecast</div>
                <div className="text-[#8B5CF6] text-sm">
                  Available after integration
                </div>
              </div>
            </div>
            {renderSummary()}
          </>
        );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-[#E5E7EB] shadow-sm overflow-hidden">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full p-6 flex items-center justify-between hover:bg-[#F9FAFB] transition-colors"
      >
        <div className="flex items-center gap-3">
          <span className="text-[10px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-2 py-1 rounded flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            AI INSIGHT
          </span>
          <h3 className="text-[#111827]">{title}</h3>
        </div>
        {isExpanded ? (
          <ChevronUp className="w-5 h-5 text-[#6B7280]" />
        ) : (
          <ChevronDown className="w-5 h-5 text-[#6B7280]" />
        )}
      </button>

      {isExpanded && <div className="px-6 pb-6">{getContent()}</div>}
    </div>
  );
}
