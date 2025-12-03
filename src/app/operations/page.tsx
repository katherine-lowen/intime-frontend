// src/app/operations/page.tsx
"use client";

import { useEffect, useState } from "react";

import { AuthGate } from "@/components/dev-auth-gate";
import api from "@/lib/api";

import { HeadcountStructureCard } from "./components/HeadcountStructureCard";
import { HROperationsPulseCard } from "./components/HROperationsPulseCard";
import { TimeOffPTOCard } from "./components/TimeOffPTOCard";
import { OnboardingPipelineCard } from "./components/OnboardingPipelineCard";
import { PublicHolidaysCard } from "./components/PublicHolidaysCard";
import { BirthdaysCard, type BirthdayItem } from "./components/BirthdaysCard";
import { TeamLoadCoverageCard } from "./components/TeamLoadCoverageCard";
import { AIOrgSummaryCard } from "./components/AIOrgSummaryCard";

export default function OperationsPage() {
  const [birthdays, setBirthdays] = useState<BirthdayItem[] | null>(null);
  const [birthdaysError, setBirthdaysError] = useState<string | null>(null);
  const [birthdaysLoading, setBirthdaysLoading] = useState<boolean>(false);

  useEffect(() => {
    let cancelled = false;

    async function loadBirthdays() {
      setBirthdaysLoading(true);
      setBirthdaysError(null);

      try {
        // adjust the path if you expose it differently on the backend
        const data = await api.get<BirthdayItem[]>("/analytics/upcoming-birthdays");
        if (!cancelled) {
          setBirthdays(data);
        }
      } catch (err) {
        console.error("Failed to load upcoming birthdays", err);
        if (!cancelled) {
          setBirthdaysError("Failed to load birthdays");
        }
      } finally {
        if (!cancelled) {
          setBirthdaysLoading(false);
        }
      }
    }

    loadBirthdays();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <AuthGate>
      <div className="min-h-screen bg-[#FAFBFC]">
        {/* Header */}
        <header className="border-b border-[#E6E8EC] bg-white">
          <div className="mx-auto max-w-[1400px] px-8 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-lg font-semibold text-[#0F1419]">
                  Operations Overview
                </h1>
                <p className="text-sm text-[#5E6C84]">
                  Real-time insights into your organization
                </p>
              </div>

              <div className="flex items-center gap-3">
                <button className="rounded-lg border border-transparent px-4 py-2 text-sm text-[#5E6C84] transition-colors hover:bg-[#F4F5F7]">
                  Export
                </button>
                <button className="rounded-lg bg-[#2C6DF9] px-4 py-2 text-sm text-white shadow-sm transition-colors hover:bg-[#1F5EE6]">
                  Settings
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="mx-auto max-w-[1400px] px-8 py-8">
          <div className="grid grid-cols-12 gap-6">
            {/* Row 1: Headcount & HR Pulse */}
            <div className="col-span-12 lg:col-span-5">
              <HeadcountStructureCard />
            </div>
            <div className="col-span-12 lg:col-span-7">
              <HROperationsPulseCard />
            </div>

            {/* Row 2: Time Off & Onboarding */}
            <div className="col-span-12 lg:col-span-6">
              <TimeOffPTOCard />
            </div>
            <div className="col-span-12 lg:col-span-6">
              <OnboardingPipelineCard />
            </div>

            {/* Row 3: Holidays & Birthdays */}
            <div className="col-span-12 lg:col-span-6">
              <PublicHolidaysCard />
            </div>
            <div className="col-span-12 lg:col-span-6">
              {birthdaysLoading && (
                <div className="mb-3 text-sm text-slate-500">
                  Loading birthdays…
                </div>
              )}
              {birthdaysError && (
                <div className="mb-3 text-sm text-red-500">
                  {birthdaysError}
                </div>
              )}
              <BirthdaysCard birthdays={birthdays ?? undefined} />
            </div>

            {/* Row 4: Team Load & AI Summary */}
            <div className="col-span-12 lg:col-span-5">
              <TeamLoadCoverageCard />
            </div>
            <div className="col-span-12 lg:col-span-7">
              <AIOrgSummaryCard />
            </div>
          </div>
        </main>
      </div>
    </AuthGate>
  );
}
