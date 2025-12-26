"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import api from "@/lib/api";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { toast } from "sonner";

type OnboardingCounts = {
  employeesCount: number;
  invitesCount: number;
  timeOffPoliciesCount: number;
  jobsCount: number;
  hasCompanyProfile: boolean;
  subscriptionStatus?: string | null;
  plan?: string | null;
};

export default function GettingStartedPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const { orgName } = useCurrentOrg();
  const [counts, setCounts] = useState<OnboardingCounts | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!orgSlug) return;
    const slug = orgSlug;
    let cancelled = false;
    async function load() {
      try {
        setError(null);
        // Try org-specific summary
        const orgLookup = await api.get<{ id?: string; data?: { id: string } }>(
          `/org/lookup?slug=${encodeURIComponent(slug)}`
        );
        const orgId = orgLookup?.id || orgLookup?.data?.id;
        let summary: any = null;
        if (orgId) {
          try {
            summary = await api.get<any>(`/orgs/${orgId}/onboarding/summary`);
          } catch {
            // fallback to dashboard summary if available
            summary = await api.get<any>("/dashboard/summary");
          }
        } else {
          summary = await api.get<any>("/dashboard/summary");
        }
        const reqId = summary?._requestId;
        if (!cancelled) {
          setRequestId(reqId || null);
          setCounts({
            employeesCount: summary?.counts?.employees ?? summary?.employeesCount ?? 0,
            invitesCount:
              summary?.counts?.invites ??
              summary?.invitedMembersCount ??
              summary?.invitesCount ??
              0,
            timeOffPoliciesCount:
              summary?.counts?.policies ?? summary?.timeOffPoliciesCount ?? 0,
            jobsCount: summary?.counts?.jobs ?? summary?.jobsCount ?? 0,
            hasCompanyProfile: !!(summary?.org?.logoUrl || summary?.org?.name),
            subscriptionStatus: summary?.subscriptionStatus ?? summary?.billingStatus ?? null,
            plan: summary?.plan ?? summary?.org?.plan ?? null,
          });
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load onboarding status");
          setRequestId(err?.requestId || null);
        }
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const steps = useMemo(() => {
    const status = counts;
    return [
      {
        id: "company",
        title: "Add company details",
        description: "Logo, name, and basics for your workspace.",
        href: `/org/${orgSlug}/settings`,
        complete: !!status?.hasCompanyProfile,
      },
      {
        id: "import",
        title: "Import employees (CSV)",
        description: "Bring your team into People in one step.",
        href: `/org/${orgSlug}/people/import`,
        complete: (status?.employeesCount ?? 0) > 0,
      },
      {
        id: "invite",
        title: "Invite your team",
        description: "Send invites so teammates can log in.",
        href: `/org/${orgSlug}/settings/members`,
        complete: (status?.invitesCount ?? 0) > 0 || (status?.employeesCount ?? 0) > 1,
      },
      {
        id: "pto",
        title: "Set up time off policy",
        description: "Create PTO rules and approvals.",
        href: `/org/${orgSlug}/time-off`,
        complete: (status?.timeOffPoliciesCount ?? 0) > 0,
      },
      {
        id: "job",
        title: "Create your first job",
        description: "Start hiring with ATS + AI.",
        href: `/org/${orgSlug}/hiring`,
        complete: (status?.jobsCount ?? 0) > 0,
      },
      {
        id: "perf",
        title: "Run your first performance cycle",
        description: "Kick off a review cycle.",
        href: `/org/${orgSlug}/performance`,
        complete: false,
      },
      {
        id: "billing",
        title: "Activate your plan",
        description: "Finish billing to go live.",
        href: `/org/${orgSlug}/settings/billing`,
        complete:
          (status?.subscriptionStatus || "").toLowerCase() === "active" ||
          (status?.subscriptionStatus || "").toLowerCase() === "trialing",
      },
    ];
  }, [counts, orgSlug]);

  const progress = useMemo(() => {
    const total = steps.length;
    const completed = steps.filter((s) => s.complete).length;
    const percent = Math.round((completed / total) * 100);
    return { total, completed, percent };
  }, [steps]);

  const nextStep = steps.find((s) => !s.complete);

  const copyChecklist = async () => {
    const lines = steps.map((s) => `- ${s.title}: ${window.location.origin}${s.href}`);
    try {
      await navigator.clipboard.writeText(lines.join("\n"));
      toast("Checklist copied");
    } catch {
      // ignore
    }
  };

  if (!orgSlug) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Organization not found.
      </div>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Getting started</p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Get {orgName || "your org"} live
          </h1>
          <p className="text-sm text-slate-600">
            Estimated time: 10–15 minutes. Complete the steps below to onboard your workspace.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={copyChecklist}>Copy onboarding checklist</Button>
          {nextStep && (
            <Button asChild variant="outline">
              <Link href={nextStep.href}>Next best action</Link>
            </Button>
          )}
        </div>
      </div>

      {error ? (
        <SupportErrorCard title="Unable to load onboarding" message={error} requestId={requestId} />
      ) : null}

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Progress</CardTitle>
            <Badge variant="outline" className="text-[11px]">
              {progress.completed} / {progress.total} complete
            </Badge>
          </div>
          <Progress value={progress.percent} className="h-2" />
          <p className="text-xs text-slate-500">{progress.percent}% done</p>
        </CardHeader>
      </Card>

      <div className="grid gap-3">
        {steps.map((step) => (
          <Card
            key={step.id}
            className={`border ${step.complete ? "border-emerald-200 bg-emerald-50" : "border-slate-200"}`}
          >
            <CardContent className="flex flex-col gap-2 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-slate-900">{step.title}</span>
                  {step.complete ? (
                    <Badge className="bg-emerald-500/20 text-emerald-800">Done</Badge>
                  ) : null}
                </div>
                <p className="text-xs text-slate-600">{step.description}</p>
              </div>
              <Button asChild variant={step.complete ? "outline" : "default"} size="sm">
                <Link href={step.href}>{step.complete ? "Review" : "Go"}</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
