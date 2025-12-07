// src/app/dashboard/page.tsx
import { AuthGate } from "@/components/dev-auth-gate";

import { HeroPanel } from "@/components/figma/ui/HeroPanel";
import { KPICards } from "@/components/figma/ui/KPICards";
import { WorkspacesGrid } from "@/components/figma/ui/WorkspacesGrid";
import { TimelineActivity } from "@/components/figma/ui/TimelineActivity";
import { AIInsightCard } from "@/components/figma/ui/AIInsightsCard";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <AuthGate>
    
{/* TEMP FIX MESSAGE */}
  <div className="w-full flex justify-center pt-4">
    <div className="rounded-lg bg-amber-500/20 border border-amber-400 px-4 py-2 text-xs text-amber-200">
      ⚠️ Dashboard is loading through a temporary workaround — if anything breaks, just refresh. You're good 😊
    </div>
  </div>

      {/* Atmosphere background layer */}
      <div className="atmosphere-layer" />

      {/* Main surface canvas */}
      <div className="relative min-h-screen surface-layer">
        <div className="mx-auto max-w-6xl px-4 py-8 md:px-8 lg:px-10 lg:py-12 xl:max-w-7xl 2xl:max-w-[1440px] 2xl:px-16 2xl:py-16">
          {/* Main grid */}
          <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,2.4fr)_minmax(0,1fr)] xl:gap-10 2xl:gap-12">
            {/* Left column – hero, KPIs, workspaces */}
            <div className="space-y-8 xl:space-y-10 2xl:space-y-12">
              <HeroPanel />
              <KPICards />
              <WorkspacesGrid />
            </div>

            {/* Right column – timeline / recent activity */}
            <div className="xl:self-start">
              <div className="xl:sticky xl:top-6">
                <TimelineActivity />
              </div>
            </div>
          </div>

          {/* AI Time Insights centerpiece */}
          <div className="mt-10 2xl:mt-16">
            <AIInsightCard />
          </div>
        </div>
      </div>
    </AuthGate>
  );
}
