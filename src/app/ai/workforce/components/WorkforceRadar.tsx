// src/app/ai/workforce/components/WorkforceRadar.tsx
"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { RadarScores } from "../useWorkforceOverview";

type WorkforceRadarProps = {
  isLoading?: boolean;
  radar: RadarScores | null;
};

export function WorkforceRadar({ isLoading, radar }: WorkforceRadarProps) {
  const baseData = [
    { subject: "Retention Risk", value: 65, fullMark: 100 },
    { subject: "Workload Balance", value: 78, fullMark: 100 },
    { subject: "Engagement Levels", value: 58, fullMark: 100 },
    { subject: "Hiring Velocity", value: 82, fullMark: 100 },
    { subject: "Payroll Efficiency", value: 91, fullMark: 100 },
  ];

  const data = radar
    ? [
        {
          subject: "Retention Risk",
          value: Math.max(0, Math.min(100, radar.retentionRisk)),
          fullMark: 100,
        },
        {
          subject: "Workload Balance",
          value: Math.max(0, Math.min(100, radar.teamCapacity)),
          fullMark: 100,
        },
        {
          subject: "Engagement Levels",
          value: Math.max(0, Math.min(100, radar.talentHealth)),
          fullMark: 100,
        },
        {
          subject: "Hiring Velocity",
          value: Math.max(0, Math.min(100, radar.hiringVelocity)),
          fullMark: 100,
        },
        {
          subject: "Payroll Efficiency",
          value: Math.max(0, Math.min(100, radar.payrollHealth)),
          fullMark: 100,
        },
      ]
    : baseData;

  return (
    <div className="bg-white rounded-2xl p-8 border border-[#E5E7EB] shadow-sm">
      <div className="flex items-center gap-2 mb-6">
        <span className="text-[10px] bg-gradient-to-r from-[#6366F1] to-[#8B5CF6] text-white px-2 py-1 rounded">
          AI INSIGHT
        </span>
        <h2 className="text-[#111827]">Workforce Risk Radar</h2>
      </div>

      <div className="relative">
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/60 backdrop-blur-[1px] rounded-2xl">
            <div className="h-8 w-24 rounded-full bg-[#E5E7EB] animate-pulse" />
          </div>
        )}

        <ResponsiveContainer width="100%" height={400}>
          <RadarChart data={data}>
            <PolarGrid stroke="#E5E7EB" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fill: "#6B7280", fontSize: 12 }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, 100]}
              tick={{ fill: "#9CA3AF", fontSize: 10 }}
            />
            <Radar
              name="Workforce Health"
              dataKey="value"
              stroke="#8B5CF6"
              fill="url(#radarGradient)"
              fillOpacity={0.6}
              strokeWidth={2}
            />
            <defs>
              <linearGradient id="radarGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8B5CF6" stopOpacity={0.8} />
                <stop offset="100%" stopColor="#6366F1" stopOpacity={0.3} />
              </linearGradient>
            </defs>
          </RadarChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-6 p-4 bg-gradient-to-br from-[#F9FAFB] to-[#F3F4F6] rounded-xl border border-[#E5E7EB]">
        <p className="text-[#6B7280] text-sm">
          <span className="text-[#111827] font-medium">Top risks today:</span>{" "}
          Intime is monitoring retention, workload, hiring velocity, and payroll
          for early warning signals across your org.
        </p>
      </div>
    </div>
  );
}
