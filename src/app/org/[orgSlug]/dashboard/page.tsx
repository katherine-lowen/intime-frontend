// src/app/org/[orgSlug]/dashboard/page.tsx
"use client";

import React, { use, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowUpRight,
  Users,
  Briefcase,
  BarChart3,
  UserPlus,
  PlusCircle,
  Settings2,
  Umbrella,
} from "lucide-react";

import { PlanGate } from "@/components/PlanGate";
import { useAuth } from "@/context/auth";
import { Button } from "@/components/ui/button";
import api from "@/lib/api";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { SeatBanner } from "@/components/billing/SeatBanner";

type OnboardingCounts = {
  employeesCount: number;
  invitesCount: number;
  timeOffPoliciesCount: number;
  jobsCount: number;
  hasCompanyProfile: boolean;
  subscriptionStatus?: string | null;
};

export default function OrgDashboardPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = use(params);
  const router = useRouter();

  const { activeOrg } = useAuth();
  const role = (activeOrg?.role || "").toUpperCase();
  const isEmployee = role === "EMPLOYEE";
  const isOwnerOrAdmin = role === "OWNER" || role === "ADMIN";

  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [kpis, setKpis] = useState<Record<string, number | string | null> | null>(null);
  const [onboardingCounts, setOnboardingCounts] = useState<OnboardingCounts | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res: any =
          (await api.get(`/orgs/${orgSlug}/dashboard/summary`)) ??
          (await api.get(`/dashboard/summary?orgSlug=${orgSlug}`));
        if (cancelled) return;

        if (res?._requestId) setRequestId(res._requestId);

        setKpis({
          headcount: res?.stats?.headcount ?? null,
          openRoles: res?.stats?.openRoles ?? null,
          activeCandidates: res?.stats?.activeCandidates ?? null,
          upcomingReviews: res?.stats?.upcomingReviews ?? null,
        });

        setOnboardingCounts({
          employeesCount: res?.counts?.employees ?? res?.employeesCount ?? 0,
          invitesCount:
            res?.counts?.invites ??
            res?.invitesCount ??
            res?.invitedMembersCount ??
            0,
          timeOffPoliciesCount: res?.counts?.policies ?? res?.timeOffPoliciesCount ?? 0,
          jobsCount: res?.counts?.jobs ?? res?.jobsCount ?? 0,
          hasCompanyProfile: !!(res?.org?.logoUrl || res?.org?.name),
          subscriptionStatus: res?.subscriptionStatus ?? res?.billingStatus ?? null,
        });
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load dashboard");
        setRequestId(err?.requestId || null);
      }
    }

    void load();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSlug]);

  const onboardingProgress = useMemo(() => {
    if (!onboardingCounts) return null;

    const steps = [
      { complete: onboardingCounts.hasCompanyProfile },
      { complete: onboardingCounts.employeesCount > 0 },
      {
        complete:
          onboardingCounts.invitesCount > 0 || onboardingCounts.employeesCount > 1,
      },
      { complete: onboardingCounts.timeOffPoliciesCount > 0 },
      { complete: onboardingCounts.jobsCount > 0 },
      {
        complete:
          (onboardingCounts.subscriptionStatus || "").toLowerCase() === "active" ||
          (onboardingCounts.subscriptionStatus || "").toLowerCase() === "trialing",
      },
    ];

    const total = steps.length;
    const completed = steps.filter((s) => s.complete).length;
    const percent = Math.round((completed / total) * 100);
    return { completed, total, percent };
  }, [onboardingCounts]);

  useEffect(() => {
    if (onboardingProgress && onboardingProgress.percent < 100) {
      router.replace(`/org/${orgSlug}/getting-started`);
    }
  }, [onboardingProgress, orgSlug, router]);

  const showOnboardingBanner =
    isOwnerOrAdmin &&
    onboardingProgress &&
    ((onboardingProgress.percent ?? 0) < 60 ||
      (onboardingCounts?.employeesCount ?? 0) === 0);

  return (
    <PlanGate required="STARTER" current="STARTER">
      <div className="space-y-6">
        {/* Heading */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-900 sm:text-2xl">
              Overview
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Unified view of your people, hiring, time and performance in a single
              time-aware graph.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isEmployee && (
              <>
                <Button asChild className="inline-flex items-center gap-1">
                  <Link href={`/org/${orgSlug}/hiring?createJob=1`}>
                    Create job
                    <ArrowUpRight className="h-3.5 w-3.5" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  asChild
                  className="inline-flex items-center gap-1 border-slate-200 bg-white text-slate-800 hover:bg-slate-50"
                >
                  <Link href={`/org/${orgSlug}/people/new`}>Add employee</Link>
                </Button>
              </>
            )}
          </div>
        </div>

        {showOnboardingBanner ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-amber-900">
                  Finish setup to go live
                </p>
                <p className="text-xs text-amber-800">
                  {onboardingProgress.percent}% complete ·{" "}
                  {onboardingProgress.completed} / {onboardingProgress.total} steps
                  done
                </p>
              </div>
              <Button asChild size="sm" className="bg-amber-900 text-amber-50 hover:bg-amber-800">
                <Link href={`/org/${orgSlug}/onboarding`}>Open checklist</Link>
              </Button>
            </div>
          </div>
        ) : null}

        <SeatBanner orgSlug={orgSlug} />

        {/* KPIs */}
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={Users} label="Headcount" value={kpis?.headcount ?? "—"} />
          <KpiCard icon={Briefcase} label="Open roles" value={kpis?.openRoles ?? "—"} />
          <KpiCard icon={Users} label="Active candidates" value={kpis?.activeCandidates ?? "—"} />
          <KpiCard icon={BarChart3} label="Upcoming reviews" value={kpis?.upcomingReviews ?? "—"} />
        </section>

        {error ? (
          <SupportErrorCard
            title="Unable to load dashboard"
            message={error}
            requestId={requestId}
          />
        ) : null}

        <div className="grid gap-4 lg:grid-cols-3">
          {/* Left column */}
          <div className="space-y-4 lg:col-span-2">
            <QuickActions orgSlug={orgSlug} isEmployee={isEmployee} />
            <Card title="Hiring pipeline">
              <p className="text-sm text-slate-600">
                Connect your hiring backend to see pipeline data here.
              </p>
            </Card>

            <Card title="Performance & time">
              <p className="text-sm text-slate-600">
                Performance cycles and time off data will appear once connected.
              </p>
            </Card>
          </div>

          {/* Right column */}
          <div className="space-y-4">
            <Card title="AI insights" subtitle="How Intime understands your org over time.">
              <p className="text-sm text-slate-600">
                AI insights will populate after data is available.
              </p>
            </Card>

            <Card title="What’s next" subtitle="Make the product feel alive with a few key flows.">
              <ol className="ml-4 list-decimal space-y-2 text-xs text-slate-600">
                <li>Add employees to your workspace.</li>
                <li>Create a job to start hiring.</li>
                <li>Assign a learning course to your team.</li>
                <li>Connect payroll to view spend.</li>
              </ol>
            </Card>
          </div>
        </div>
      </div>
    </PlanGate>
  );
}

type KpiCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
};

function KpiCard({ icon: Icon, label, value }: KpiCardProps) {
  return (
    <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {label}
          </p>
          <p className="mt-2 text-xl font-semibold text-slate-900">{value}</p>
        </div>
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-indigo-50">
          <Icon className="h-4 w-4 text-indigo-500" />
        </div>
      </div>
    </div>
  );
}

type CardProps = {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
};

function Card({ title, subtitle, children }: CardProps) {
  return (
    <section className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm">
      <div className="mb-3 flex items-center justify-between gap-2">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
          {subtitle && <p className="mt-0.5 text-xs text-slate-500">{subtitle}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function QuickActions({ orgSlug, isEmployee }: { orgSlug: string; isEmployee: boolean }) {
  const actions = isEmployee
    ? [
        { label: "View people directory", href: `/org/${orgSlug}/people`, icon: Users },
        { label: "Request time off", href: `/org/${orgSlug}/time-off`, icon: Umbrella },
      ]
    : [
        { label: "Add employee", href: `/org/${orgSlug}/people/new`, icon: UserPlus },
        { label: "Create job", href: `/org/${orgSlug}/hiring?createJob=1`, icon: Briefcase },
        { label: "Add candidate", href: `/org/${orgSlug}/hiring?addCandidate=1`, icon: PlusCircle },
        { label: "Invite teammate", href: `/org/${orgSlug}/settings/members`, icon: Settings2 },
        { label: "Set up time off", href: `/org/${orgSlug}/time-off/policies/new`, icon: Umbrella },
      ];

  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {actions.map((action) => {
        const Icon = action.icon;
        return (
          <Link
            key={action.label}
            href={action.href}
            className="flex items-center gap-3 rounded-lg border border-slate-200 bg-white px-3 py-3 text-sm font-medium text-slate-800 hover:bg-slate-50"
          >
            <span className="flex h-8 w-8 items-center justify-center rounded-md bg-slate-100">
              <Icon className="h-4 w-4 text-slate-700" />
            </span>
            <span>{action.label}</span>
          </Link>
        );
      })}
    </div>
  );
}

type InsightItemProps = {
  label: string;
  body: string;
};

function InsightItem({ label, body }: InsightItemProps) {
  return (
    <li className="rounded-lg border border-slate-100 bg-slate-50/70 p-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 text-[12px] text-slate-700">{body}</p>
    </li>
  );
}
