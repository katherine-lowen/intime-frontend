"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CheckCircle2, ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import api from "@/lib/api";

type OnboardingStepResponse = {
  id?: string;
  completed?: boolean;
  blocked?: boolean;
  requiredPlan?: string | null;
};

type OnboardingResponse = {
  progressPercent?: number | null;
  steps?: OnboardingStepResponse[];
  requestId?: string | null;
};

type Step = {
  id: string;
  title: string;
  description: string;
  href: string;
  optional?: boolean;
  requiredPlan?: string | null;
};

const DEFAULT_STEPS = (orgSlug: string): Step[] => [
  {
    id: "company",
    title: "Company profile",
    description: "Add logo, name, and basics.",
    href: `/org/${orgSlug}/settings/company`,
  },
  {
    id: "employees",
    title: "Add employees",
    description: "Create or import team members.",
    href: `/org/${orgSlug}/people/new`,
  },
  {
    id: "invites",
    title: "Invite teammates",
    description: "Send invites so teammates can sign in.",
    href: `/org/${orgSlug}/settings/members`,
  },
  {
    id: "course",
    title: "Create first course",
    description: "Build a training or onboarding course.",
    href: `/org/${orgSlug}/learning/courses/new`,
  },
  {
    id: "assign-course",
    title: "Assign a course",
    description: "Assign learning to your team.",
    href: `/org/${orgSlug}/learning`,
  },
  {
    id: "payroll",
    title: "Connect payroll",
    description: "Connect QuickBooks Payroll.",
    href: `/org/${orgSlug}/payroll`,
  },
  {
    id: "job",
    title: "Create first job",
    description: "Post an opening (optional).",
    href: `/org/${orgSlug}/hiring?createJob=1`,
    optional: true,
  },
];

type Props = {
  orgSlug: string;
};

export default function OnboardingClient({ orgSlug }: Props) {
  const [data, setData] = useState<OnboardingResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await api.get<OnboardingResponse>(`/orgs/${orgSlug}/onboarding`);
        if (cancelled) return;
        setData(res || null);
        setRequestId((res as any)?._requestId ?? res?.requestId ?? null);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load onboarding status");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const steps = useMemo(() => DEFAULT_STEPS(orgSlug), [orgSlug]);

  const stepState = (id: string) => {
    const found = data?.steps?.find((s) => s.id === id);
    return {
      completed: !!found?.completed,
      blocked: !!found?.blocked,
      requiredPlan: found?.requiredPlan ?? null,
    };
  };

  const progress = useMemo(() => {
    if (typeof data?.progressPercent === "number") {
      return {
        percent: Math.round(data.progressPercent),
        total: steps.length,
        completed: Math.round((data.progressPercent / 100) * steps.length),
      };
    }
    const completed = steps.filter((s) => stepState(s.id).completed).length;
    const percent = Math.round((completed / steps.length) * 100);
    return { percent, completed, total: steps.length };
  }, [data?.progressPercent, steps]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Onboarding
          </p>
          <h1 className="text-2xl font-semibold text-slate-900">
            Finish setting up Intime
          </h1>
          <p className="text-sm text-slate-600">
            Complete the checklist to activate your workspace.
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/org/${orgSlug}/dashboard`}>
            Back to dashboard
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </Button>
      </header>

      <Card className="border-slate-200">
        <CardContent className="space-y-3 pt-6">
          <div className="flex items-center justify-between text-sm text-slate-600">
            <span>
              {progress.completed} of {progress.total} completed
            </span>
            <span className="font-semibold text-slate-900">{progress.percent}%</span>
          </div>
          <Progress value={progress.percent} className="h-2" />
        </CardContent>
      </Card>

      {error ? (
        <SupportErrorCard
          title="Onboarding status unavailable"
          message={error}
          requestId={requestId}
        />
      ) : null}

      <div className="grid gap-4 md:grid-cols-2">
        {steps.map((step) => {
          const state = stepState(step.id);
          const completed = state.completed;
          const blocked = state.blocked;
          return (
            <Card
              key={step.id}
              className="border-slate-200 bg-white shadow-sm"
            >
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{step.title}</CardTitle>
                  <p className="text-sm text-slate-600">{step.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {step.optional ? (
                    <Badge variant="outline" className="text-[10px]">
                      Optional
                    </Badge>
                  ) : null}
                  {completed ? (
                    <Badge className="flex items-center gap-1 bg-emerald-100 text-emerald-800">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Completed
                    </Badge>
                  ) : null}
                  {state.requiredPlan ? (
                    <Badge variant="outline" className="text-[10px]">
                      {state.requiredPlan} plan
                    </Badge>
                  ) : null}
                </div>
              </CardHeader>
              <CardContent className="flex items-center justify-between">
                <div className="text-sm text-slate-500">
                  {blocked
                    ? "Upgrade to continue"
                    : completed
                      ? "Done"
                      : "Tap to complete this step."}
                </div>
                <Button
                  asChild
                  size="sm"
                  disabled={completed || blocked}
                  variant={completed ? "secondary" : "default"}
                >
                  <Link href={step.href}>
                    {completed ? "Done" : "Open"}
                  </Link>
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </main>
  );
}
