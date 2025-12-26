"use client";

import { AuthGate } from "@/components/dev-auth-gate";
import { MetricCard } from "./components/MetricCard";
import { TalentModuleCard } from "./components/TalentModuleCard";
import { CompensationPanel } from "./components/CompensationPanel";
import { SystemDiagram } from "./components/SystemDiagram";
import { GrowthCard } from "./components/GrowthCard";
import { Users, Target, TrendingUp, CheckCircle2 } from "lucide-react";
import { orgHref } from "@/lib/org-base";


export const dynamic = "force-dynamic";

export default function TalentOverviewPage() {
  return (
    <AuthGate>
      <main className="min-h-screen bg-[#FAFBFC]">
        <div className="mx-auto max-w-[1440px] px-6 py-8 md:px-12 md:py-10">
          {/* Header */}
          <header className="mb-8 md:mb-10">
            <h1 className="mb-2 text-2xl font-semibold tracking-tight text-[#0F1419]">
              Talent overview
            </h1>
            <p className="max-w-2xl text-sm text-[#5E6C84]">
              One place to understand recruiting, headcount, performance, and
              engagement across your org.
            </p>
          </header>

          {/* Top Metrics Row */}
          <section className="mb-10 grid gap-4 md:grid-cols-4 md:gap-6">
            <MetricCard
              label="Open roles"
              value="12"
              sublabel="3 urgent"
              icon={Users}
            />
            <MetricCard
              label="Performance cycles"
              value="2"
              sublabel="1 in progress"
              icon={Target}
            />
            <MetricCard
              label="Planned headcount"
              value="48"
              sublabel="+8 this quarter"
              icon={TrendingUp}
            />
            <MetricCard
              label="Org-level goals"
              value="24"
              sublabel="18 on track"
              icon={CheckCircle2}
            />
          </section>

          {/* Core Talent Areas + Compensation Panel */}
          <section className="mb-10 grid gap-6 md:grid-cols-12">
            {/* Left: Core Talent Areas Grid */}
            <div className="md:col-span-8 grid gap-4 sm:grid-cols-2 md:gap-6">
              <TalentModuleCard
                title="Recruiting"
                description="Manage open roles, candidate pipelines, and interview processes."
                status="active"
                accentColor="#2C6DF9"
                href={orgHref("/hiring")}
   // ← ROUTE TO RECRUITING WORKSPACE
              />
              <TalentModuleCard
                title="Headcount planning"
                description="Plan team growth, budget allocations, and workforce forecasting."
                status="coming-soon"
                accentColor="#1F5EE6"
              />
              <TalentModuleCard
                title="Review cycles"
                description="Run performance reviews, calibrations, and feedback cycles."
                status="coming-soon"
                accentColor="#2C6DF9"
              />
              <TalentModuleCard
                title="1:1s"
                description="Track and schedule recurring check-ins with direct reports."
                status="coming-soon"
                accentColor="#1F5EE6"
              />
            </div>

            {/* Right: Compensation Panel */}
            <div className="md:col-span-4">
              <CompensationPanel />
            </div>
          </section>

          {/* System Connections Diagram */}
          <section className="mb-10">
            <SystemDiagram />
          </section>

          {/* Growth & Engagement */}
          <section>
            <h2 className="mb-4 text-base font-semibold text-[#0F1419] md:mb-6">
              Growth & engagement
            </h2>
            <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-6">
              <GrowthCard
                title="Goals"
                description="Set and track individual, team, and company objectives."
                status="coming-soon"
              />
              <GrowthCard
                title="Learning"
                description="Build learning paths, track certifications, and skill development."
                status="coming-soon"
              />
              <GrowthCard
                title="Surveys"
                description="Measure engagement, gather feedback, and track sentiment."
                status="coming-soon"
              />
              <GrowthCard
                title="Recognition"
                description="Celebrate wins, peer recognition, and milestone tracking."
                status="coming-soon"
              />
            </div>
          </section>
        </div>
      </main>
    </AuthGate>
  );
}
