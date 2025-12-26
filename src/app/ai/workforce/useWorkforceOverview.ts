// src/app/ai/workforce/useWorkforceOverview.ts
"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";

export type RadarScores = {
  talentHealth: number;
  retentionRisk: number;
  teamCapacity: number;
  hiringVelocity: number;
  payrollHealth: number;
};

export type HiringFunnelStage = {
  stage: string;
  count: number;
};

export type TeamCapacity = {
  team: string;
  headcount: number;
  loadPercent: number;
};

export type WorkforceOverview = {
  headcount: number;
  hiresLast30d: number;
  termsLast90d: number;
  openRoles: number;
  activeCandidates: number;
  timeOffToday: number;
  avgTenureMonths: number;
  radar: RadarScores;
  aiSummary: string;
  hiringFunnel: HiringFunnelStage[];
  teamCapacity: TeamCapacity[];
};

export function useWorkforceOverview() {
  const [data, setData] = useState<WorkforceOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = (await api.get<WorkforceOverview>(
        "/ai/workforce/overview"
      ))!;
      console.log("Workforce overview data", res);
      setData(res);
    } catch (err: any) {
      console.error("Failed to load workforce overview", err);
      setError(err?.message ?? "Failed to load workforce overview");
      setData(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  return { data, isLoading, error, refetch: fetchData };
}
