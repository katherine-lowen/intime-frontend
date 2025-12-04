// src/app/jobs/[id]/JobAtsClient.tsx
"use client";

import { useState } from "react";
import { Header } from "./components/Header";
import { TabBar } from "./components/TabBar";
import  PipelineTab  from "./components/PipelineTab";
import { ListViewTab } from "./components/ListViewTab";
import { AIInsightsTab } from "./components/AIInsightsTab";
import { JobDetailsTab } from "./components/JobDetailsTab";
import { FiltersDrawer } from "./components/FiltersDrawer";

// Local copy of the UI type – no import from page.tsx to avoid cycles
type JobDataForUI = {
  id: string;
  title: string;
  status: string;
  department: string;
  location: string;
  createdDate: string;
  roleOverview: string;
  compensationBand: string;
  description: string;
  boardStatus: string;
};

type Props = {
  jobId: string;
  jobData: JobDataForUI;
};

export default function JobAtsClient({ jobId, jobData }: Props) {
  const [activeTab, setActiveTab] = useState<
    "pipeline" | "ai-insights" | "job-details"
  >("pipeline");
  const [viewMode, setViewMode] = useState<"board" | "list" | "triage">(
    "board",
  );
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-50">
      <Header
        jobData={jobData}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
      />

      <TabBar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        onToggleFilters={() => setFiltersOpen((open) => !open)}
      />

      <main className="mx-auto max-w-6xl px-8 py-8">
        {activeTab === "pipeline" && viewMode === "board" && (
          <PipelineTab jobId={jobId} />
        )}

        {activeTab === "pipeline" && viewMode === "list" && (
          <ListViewTab jobId={jobId} />
        )}

        {activeTab === "pipeline" && viewMode === "triage" && (
          <AIInsightsTab jobId={jobId} viewMode="triage" />
        )}

        {activeTab === "ai-insights" && (
          <AIInsightsTab jobId={jobId} viewMode="insights" />
        )}

        {activeTab === "job-details" && (
          <JobDetailsTab jobData={jobData} />
        )}
      </main>

      <FiltersDrawer
        isOpen={filtersOpen}
        onClose={() => setFiltersOpen(false)}
      />
    </div>
  );
}
