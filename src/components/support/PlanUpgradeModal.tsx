"use client";

import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function PlanUpgradeModal({
  plan,
  orgSlug,
  onClose,
}: {
  plan: string;
  orgSlug: string;
  onClose: () => void;
}) {
  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Upgrade required</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-slate-600">
          This action requires the {plan.toUpperCase()} plan. Upgrade in billing to continue.
        </p>
        <DialogFooter className="justify-end gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button asChild>
            <Link href={`/org/${orgSlug}/settings/billing`}>Go to billing</Link>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
