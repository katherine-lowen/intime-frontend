// src/app/ai/workforce/page.tsx
"use client";

import { AuthGate } from "@/components/dev-auth-gate";

import { Header } from "./components/Header";
import { InsightsStrip } from "./components/InsightsStrip";
import { WorkforceRadar } from "./components/WorkforceRadar";
import { InsightPanel } from "./components/InsightPanel";
import { AIActions } from "./components/AIActions";
import { PromptBar } from "./components/PromptBar";
import { useWorkforceOverview } from "./useWorkforceOverview";

export default function AIWorkforcePage() {
  const { data, isLoading, error, refetch } = useWorkforceOverview();

  const headcount = data?.headcount ?? 0;
  const openRoles = data?.openRoles ?? 0;
  const activeCandidates = data?.activeCandidates ?? 0;
  const timeOffToday = data?.timeOffToday ?? 0;
  const termsLast90d = data?.termsLast90d ?? 0;
  const radar = data?.radar ?? null;
  const aiSummary = data?.aiSummary ?? null;
  const hiringFunnel = data?.hiringFunnel ?? [];
  const teamCapacity = data?.teamCapacity ?? [];

  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-b from-[#F9FAFF] to-white">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <Header
            isLoading={isLoading}
            headcount={headcount}
            openRoles={openRoles}
            onRefresh={refetch}
          />

          {error && (
            <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              Something went wrong loading workforce data. Please refresh or try
              again later.
            </div>
          )}

          <div className="mt-8">
            <InsightsStrip
              isLoading={isLoading}
              headcount={headcount}
              openRoles={openRoles}
              activeCandidates={activeCandidates}
              timeOffToday={timeOffToday}
              termsLast90d={termsLast90d}
            />
          </div>

          <div className="mt-8">
            <WorkforceRadar isLoading={isLoading} radar={radar} />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightPanel
              title="Retention Intelligence"
              type="retention"
              isLoading={isLoading}
              summary={aiSummary}
            />
            <InsightPanel
              title="Hiring & Talent Pipeline"
              type="hiring"
              isLoading={isLoading}
              summary={aiSummary}
              hiringFunnel={hiringFunnel}
              openRoles={openRoles}
            />
            <InsightPanel
              title="Team Load & Capacity"
              type="capacity"
              isLoading={isLoading}
              summary={aiSummary}
              teamCapacity={teamCapacity}
            />
            <InsightPanel
              title="Payroll & Compensation Forecast"
              type="payroll"
              isLoading={isLoading}
              summary={aiSummary}
            />
          </div>

          <div className="mt-8">
            <AIActions
              headcount={headcount}
              openRoles={openRoles}
              activeCandidates={activeCandidates}
              timeOffToday={timeOffToday}
              termsLast90d={termsLast90d}
            />
          </div>

          <div className="mt-8 mb-12">
            <PromptBar
              context={{
                headcount,
                openRoles,
                activeCandidates,
                timeOffToday,
                termsLast90d,
              }}
            />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
