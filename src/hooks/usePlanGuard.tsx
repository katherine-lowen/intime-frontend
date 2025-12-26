"use client";

import { useState, useCallback } from "react";
import { toast } from "sonner";
import PlanUpgradeModal from "@/components/support/PlanUpgradeModal";

type Plan = "GROWTH" | "SCALE" | string;

export function usePlanGuard(orgSlug?: string | null) {
  const [upgradePlan, setUpgradePlan] = useState<Plan | null>(null);

  const handleError = useCallback(
    (err: any) => {
      if (err?.code === "PLAN_REQUIRED") {
        setUpgradePlan((err.plan as Plan) || "GROWTH");
        return true;
      }
      if (err?.code === "RATE_LIMITED") {
        toast.warning("You’re doing that too fast — try again in a moment.");
        return true;
      }
      return false;
    },
    []
  );

  const modal =
    upgradePlan && orgSlug ? (
      <PlanUpgradeModal
        plan={upgradePlan}
        orgSlug={orgSlug}
        onClose={() => setUpgradePlan(null)}
      />
    ) : null;

  return { handlePlanError: handleError, upgradeModal: modal };
}
