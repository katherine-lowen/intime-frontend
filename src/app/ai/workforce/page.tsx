// src/app/ai/workforce/page.tsx
"use client";

import { AuthGate } from "@/components/dev-auth-gate";

import { Header } from "./components/Header";
import { InsightsStrip } from "./components/InsightsStrip";
import { WorkforceRadar } from "./components/WorkforceRadar";
import { InsightPanel } from "./components/InsightPanel";
import { AIActions } from "./components/AIActions";
import { PromptBar } from "./components/PromptBar";

export default function AIWorkforcePage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-b from-[#F9FAFF] to-white">
        <div className="max-w-[1400px] mx-auto px-8 py-8">
          <Header />

          <div className="mt-8">
            <InsightsStrip />
          </div>

          <div className="mt-8">
            <WorkforceRadar />
          </div>

          <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
            <InsightPanel title="Retention Intelligence" type="retention" />
            <InsightPanel title="Hiring & Talent Pipeline" type="hiring" />
            <InsightPanel title="Team Load & Capacity" type="capacity" />
            <InsightPanel
              title="Payroll & Compensation Forecast"
              type="payroll"
            />
          </div>

          <div className="mt-8">
            <AIActions />
          </div>

          <div className="mt-8 mb-12">
            <PromptBar />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
