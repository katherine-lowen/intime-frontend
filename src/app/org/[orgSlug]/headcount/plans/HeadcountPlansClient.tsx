"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Loader2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { listHeadcountPlans, HeadcountPlan } from "@/lib/hiring-signals-api";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

type Props = {
  orgSlug: string;
};

export default function HeadcountPlansClient({ orgSlug }: Props) {
  const [plans, setPlans] = useState<HeadcountPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await listHeadcountPlans(orgSlug);
        if (!cancelled) {
          setPlans(res);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load plans");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const renderStatus = (status?: string | null) => {
    const label = status?.toString().toUpperCase() ?? "DRAFT";
    const variant = label === "ACTIVE" ? "default" : label === "ARCHIVED" ? "outline" : "secondary";
    return (
      <Badge variant={variant as any} className="text-[11px]">
        {label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Headcount</p>
          <h1 className="text-2xl font-semibold text-slate-900">Headcount plans</h1>
          <p className="text-sm text-slate-600">Track targets vs actuals across departments.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/hiring/cockpit`}>Hiring cockpit</Link>
          </Button>
          <Button disabled className="gap-2">
            <PlusCircle className="h-4 w-4" />
            New plan
          </Button>
        </div>
      </header>

      {error ? <SupportErrorCard message={error} /> : null}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Plans</CardTitle>
          <p className="text-xs text-slate-500">Draft, activate, and monitor headcount.</p>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading plans…
            </div>
          ) : plans.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              No plans yet. Create a plan to compare targets to current headcount.
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Name</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Target</TH>
                  <TH className="text-right">Actual</TH>
                </TR>
              </THead>
              <TBody>
                {plans.map((plan) => (
                  <TR key={plan.id} className="cursor-pointer hover:bg-slate-50">
                    <TD>
                      <Link href={`/org/${orgSlug}/headcount/plans/${plan.id}`} className="font-medium text-slate-900">
                        {plan.name || "Headcount plan"}
                      </Link>
                    </TD>
                    <TD>{renderStatus(plan.status)}</TD>
                    <TD className="text-right">{plan.totalTarget ?? "—"}</TD>
                    <TD className="text-right">{plan.totalActual ?? "—"}</TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
