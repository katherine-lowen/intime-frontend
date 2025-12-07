// src/app/operations/reporting/page.tsx
"use client";

import { Download, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/dev-auth-gate";
import { KPICards } from "./components/KPICards";
import { HeadcountChart } from "./components/HeadcountChart";
import { CompensationSection } from "./components/CompensationSection";
import { CommissionPayouts } from "./components/CommissionPayouts";
import { HiringFunnel } from "./components/HiringFunnel";
import { AIInsightsPanel } from "./components/AIInsightsPanel";

export default function ReportingPage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-b from-[#FAFBFF] to-[#FFFFFF]">
        {/* Header */}
        <div className="bg-gradient-to-b from-[#F9FAFB] to-transparent border-b border-[#E5E7EB]">
          <div className="max-w-[1400px] mx-auto px-8 py-8">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h1 className="text-2xl font-semibold text-[#111827] mb-2">
                  Reporting &amp; Analytics
                </h1>
                <p className="text-sm text-[#6B7280]">
                  Unified insights into people, payroll, and hiring performance.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2.5 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors flex items-center gap-2 shadow-[0px_1px_3px_rgba(0,0,0,0.04)] text-sm">
                  <Download className="w-4 h-4" />
                  Export Report
                </button>
                <button className="px-4 py-2.5 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8] transition-colors flex items-center gap-2 shadow-[0px_2px_8px_rgba(59,130,246,0.2)] text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI Summary
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-[1400px] mx-auto px-8 py-8 space-y-8">
          <KPICards />
          <HeadcountChart />
          <CompensationSection />
          <CommissionPayouts />
          <HiringFunnel />
          <AIInsightsPanel />
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-white/80 backdrop-blur-lg border-t border-[#E5E7EB] shadow-[0px_-2px_12px_rgba(0,0,0,0.04)]">
          <div className="max-w-[1400px] mx-auto px-8 py-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-[#6B7280]">Enterprise Reporting Suite</p>
            <div className="flex flex-wrap gap-3">
              <button className="px-4 py-2 rounded-xl border border-[#E5E7EB] bg-white text-[#374151] hover:bg-[#F9FAFB] transition-colors text-sm">
                Export Full Report
              </button>
              <button className="px-4 py-2 rounded-xl text-[#374151] hover:bg-[#F9FAFB] transition-colors text-sm">
                Schedule Weekly Report
              </button>
              <button className="px-4 py-2 rounded-xl bg-gradient-to-b from-[#3B82F6] to-[#2563EB] text-white hover:from-[#2563EB] hover:to-[#1D4ED8] transition-colors text-sm">
                Send to Board Portal
              </button>
            </div>
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
