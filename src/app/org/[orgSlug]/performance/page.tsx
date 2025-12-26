"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getActivationStatus } from "@/lib/api-activation";
import { PlanGate } from "@/components/PlanGate";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export default function OrgPerformancePage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const { role, loading: orgLoading } = useCurrentOrg();
  const [cycles, setCycles] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

  useEffect(() => {
    if (!orgSlug) return;
    const slug = orgSlug;
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const status = await getActivationStatus(slug);
        const val = (status as any)?.counts?.performanceCycles ?? 0;
        if (mounted) setCycles(typeof val === "number" ? val : 0);
      } catch {
        if (mounted) setCycles(0);
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [orgSlug]);

  const content = orgSlug ? (
    <main className="space-y-5">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Performance</p>
          <h1 className="text-2xl font-semibold text-slate-900">Performance</h1>
          <p className="text-sm text-slate-600">
            Calibrate talent with reviews, check-ins, and goals over time.
          </p>
        </div>
        {!isEmployee && (
          <Button asChild>
            <Link href={`/org/${orgSlug}/performance/cycles/new`}>Start a cycle</Link>
          </Button>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Performance cycles</CardTitle>
            <Badge variant="outline" className="text-[11px]">
              {loading ? "…" : cycles}
            </Badge>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Track review cycles and completion.
          </CardContent>
        </Card>
      </div>

      {cycles === 0 ? (
        <Card className="border-dashed border-slate-200">
          <CardContent className="flex flex-col gap-3 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-semibold text-slate-900">Start your first cycle</p>
              <p className="text-xs text-slate-600">Kick off a performance cycle to begin reviews.</p>
            </div>
            {isEmployee ? (
              <p className="text-xs text-slate-500">Ask an admin to start a cycle.</p>
            ) : (
              <Button size="sm" asChild>
                <Link href={`/org/${orgSlug}/performance/cycles/new`}>Start a cycle</Link>
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-sm">Recent cycles</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Connect your performance backend to show active cycles.
          </CardContent>
        </Card>
      )}
    </main>
  ) : (
    <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
      Organization not found.
    </div>
  );

  return orgLoading && !orgSlug ? (
    <div className="flex min-h-screen items-center justify-center text-slate-500">
      Loading organization…
    </div>
  ) : (
    <PlanGate required="GROWTH" feature="Performance">
      {content}
    </PlanGate>
  );
}
