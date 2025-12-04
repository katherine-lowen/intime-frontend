// src/app/payroll/compensation-intelligence/page.tsx
"use client";

import React from "react";
import { FileDown, Sparkles } from "lucide-react";
import { AuthGate } from "@/components/dev-auth-gate";
import { KPICard } from "./components/KPICard";
import { SalaryDistributionChart } from "./components/SalaryDistributionChart";
import { DepartmentTable } from "./components/DepartmentTable";
import { PayEquityPanel } from "./components/PayEquityPanel";
import { EmployeeRiskCard } from "./components/EmployeeRiskCard";
import { ComingSoonFeatures } from "./components/ComingSoonFeatures";

export default function CompensationIntelligencePage() {
  return (
    <AuthGate>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-slate-50 to-indigo-50/30">
        <div className="max-w-[1600px] mx-auto px-8 py-10">
          {/* Breadcrumb */}
          <div className="mb-4 text-xs text-slate-500 flex items-center gap-2">
            <span>Platform</span>
            <span className="text-slate-300">→</span>
            <span>Payroll</span>
            <span className="text-slate-300">→</span>
            <span className="text-slate-700 font-medium">
              Compensation intelligence
            </span>
          </div>

          {/* Header */}
          <div className="mb-10">
            <div className="flex items-start justify-between mb-2 gap-4">
              <div>
                <h1 className="text-3xl font-semibold tracking-tight text-slate-900 mb-2">
                  Compensation Intelligence
                </h1>
                <p className="text-sm text-slate-600 max-w-xl">
                  Insights into salary fairness, market competitiveness, and pay
                  equity across your organization.
                </p>
              </div>
              <div className="flex gap-3">
                <button className="px-4 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2 text-sm text-slate-700 shadow-sm">
                  <FileDown className="w-4 h-4" />
                  Export report
                </button>
                <button className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white transition-colors flex items-center gap-2 shadow-sm text-sm">
                  <Sparkles className="w-4 h-4" />
                  AI summary
                </button>
              </div>
            </div>
            <div className="h-px bg-gradient-to-r from-slate-200 via-slate-200 to-transparent mt-6" />
          </div>

          {/* KPI Overview Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <KPICard
              icon="briefcase"
              label="Median Org Salary"
              value="$112,400"
              trend={null}
            />
            <KPICard
              icon="trending-up"
              label="Market Competitiveness"
              value="87%"
              trend={{ value: "+3%", type: "positive" }}
            />
            <KPICard
              icon="scale"
              label="Pay Equity Score"
              value="72%"
              trend={{ value: "-2%", type: "warning" }}
            />
            <KPICard
              icon="alert-circle"
              label="At-Risk Employees"
              value="4"
              trend={{ value: "+1", type: "negative" }}
            />
            <KPICard
              icon="sparkles"
              label="Promotion Candidates (AI)"
              value="9"
              trend={null}
            />
          </div>

          {/* Salary Distribution Chart */}
          <div className="mb-8">
            <SalaryDistributionChart />
          </div>

          {/* Department Benchmarks Table */}
          <div className="mb-8">
            <DepartmentTable />
          </div>

          {/* Pay Equity Analysis Panel */}
          <div className="mb-8">
            <PayEquityPanel />
          </div>

          {/* Individual Risk & Recommendations */}
          <div className="mb-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl border border-slate-200/60 shadow-sm p-8">
              <div className="mb-6">
                <h2 className="text-lg font-semibold text-slate-900 mb-1">
                  Employees at Risk of Undercompensation
                </h2>
                <p className="text-sm text-slate-600">
                  AI-detected compensation gaps relative to market benchmarks.
                </p>
              </div>
              <div className="space-y-4">
                <EmployeeRiskCard
                  name="Sarah Chen"
                  role="Senior Software Engineer"
                  department="Engineering"
                  salary={138000}
                  marketMin={145000}
                  marketMax={175000}
                  recommendation="At risk of churn — compensation ~11% below market"
                  suggestedRaise={8000}
                  riskLevel="high"
                />
                <EmployeeRiskCard
                  name="Marcus Williams"
                  role="Product Manager"
                  department="Product"
                  salary={142000}
                  marketMin={148000}
                  marketMax={185000}
                  recommendation="Slightly below market — consider adjustment during next cycle"
                  suggestedRaise={6000}
                  riskLevel="medium"
                />
                <EmployeeRiskCard
                  name="Emily Rodriguez"
                  role="Sales Director"
                  department="Sales"
                  salary={156000}
                  marketMin={160000}
                  marketMax={195000}
                  recommendation="Minor gap detected — monitor competitive landscape"
                  suggestedRaise={4000}
                  riskLevel="medium"
                />
                <EmployeeRiskCard
                  name="James Park"
                  role="Data Scientist"
                  department="Engineering"
                  salary={122000}
                  marketMin={135000}
                  marketMax={165000}
                  recommendation="Significant gap — immediate review recommended"
                  suggestedRaise={13000}
                  riskLevel="high"
                />
              </div>
            </div>
          </div>

          {/* Coming Soon Features */}
          <ComingSoonFeatures />
        </div>
      </div>
    </AuthGate>
  );
}
