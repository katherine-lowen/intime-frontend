// components/PlanGate.tsx
"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useBillingSummary } from "@/hooks/useBillingSummary";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export type Plan = "STARTER" | "GROWTH" | "SCALE";

type Props = {
  required?: Plan;
  current?: Plan | null;
  feature?: string;
  children: React.ReactNode;
};

const ORDER: Plan[] = ["STARTER", "GROWTH", "SCALE"];

function normalizePlan(value?: string | null): Plan | null {
  if (!value) return null;
  const upper = value.toUpperCase() as Plan;
  return ORDER.includes(upper) ? upper : null;
}

function labelForPlan(plan: Plan) {
  return plan.charAt(0) + plan.slice(1).toLowerCase();
}

export function PlanGate({ required, current, feature, children }: Props) {
  const router = useRouter();
  const { organization, loading, error } = useBillingSummary();
  const { orgSlug, orgName } = useCurrentOrg();

  const normalizedRequired = normalizePlan(required);
  const normalizedCurrent =
    normalizePlan(current) ?? normalizePlan(organization?.plan);

  if (!normalizedRequired || !normalizedCurrent) {
    return <>{children}</>;
  }

  if (loading && !current) {
    return <>{children}</>;
  }

  const ok =
    ORDER.indexOf(normalizedCurrent) >= ORDER.indexOf(normalizedRequired);

  if (ok) return <>{children}</>;

  const heading = feature
    ? `${feature} is locked`
    : `Upgrade to ${labelForPlan(normalizedRequired)} to unlock this`;

  const description = `Your workspace is on the ${labelForPlan(
    normalizedCurrent,
  )} plan. Upgrade${orgName ? ` ${orgName}` : ""} to access this.`;

  const handleUpgrade = () => {
    if (orgSlug) {
      router.push(`/org/${orgSlug}/settings/billing`);
    } else {
      router.push("/org");
    }
  };

  if (error) {
    return (
      <div className="space-y-3">
        <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-700">
          <div className="font-medium text-slate-900">We can&apos;t verify billing.</div>
          <p className="mt-1 text-slate-600">
            Please refresh or visit billing to continue.
          </p>
          <Button
            variant="outline"
            size="sm"
            className="mt-3 rounded-full border-slate-800 text-xs"
            onClick={handleUpgrade}
          >
            Go to billing
          </Button>
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/80 p-6 text-sm text-slate-700">
        <div className="font-medium text-slate-900">{heading}</div>
        <p className="mt-1 text-slate-600">{description}</p>
        <Button
          size="sm"
          className="mt-3 rounded-full bg-indigo-600 text-white hover:bg-indigo-500"
          onClick={handleUpgrade}
        >
          Go to billing
        </Button>
      </div>
      {children}
    </div>
  );
}
