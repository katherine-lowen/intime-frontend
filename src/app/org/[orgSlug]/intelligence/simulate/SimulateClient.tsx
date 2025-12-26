"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { simulateComp, simulateHeadcount } from "@/lib/intelligence-decision-api";
import { useAuth } from "@/context/auth";
import { usePlanGuard } from "@/hooks/usePlanGuard";

export default function SimulateClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);

  const [headcountInput, setHeadcountInput] = useState({ hires: 0, attrition: 0 });
  const [compInput, setCompInput] = useState({ raisesPct: 0, hires: 0 });
  const [result, setResult] = useState<any | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isGrowth) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="py-6">
            <h2 className="text-lg font-semibold text-amber-900">Upgrade to Growth</h2>
            <p className="mt-1 text-sm text-amber-800">
              What-If simulations are available on Growth and Scale.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  const runHeadcount = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res = await simulateHeadcount(orgSlug, headcountInput);
      setResult(res);
    } catch (err: any) {
      if (!handlePlanError(err)) {
        setError(err?.message || "Simulation failed");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    } finally {
      setLoading(false);
    }
  };

  const runComp = async () => {
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res = await simulateComp(orgSlug, compInput);
      setResult(res);
    } catch (err: any) {
      if (!handlePlanError(err)) {
        setError(err?.message || "Simulation failed");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 space-y-4">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Intelligence</p>
        <h1 className="text-2xl font-semibold text-slate-900">What-If simulations</h1>
        <p className="text-sm text-slate-600">
          Explore headcount and compensation scenarios. Assumptions are estimates; connect payroll and ATS for higher fidelity.
        </p>
      </div>

      {error ? <SupportErrorCard title="Simulation" message={error} requestId={requestId} /> : null}
      {upgradeModal}

      <Tabs defaultValue="headcount">
        <TabsList>
          <TabsTrigger value="headcount">Headcount</TabsTrigger>
          <TabsTrigger value="comp">Comp</TabsTrigger>
        </TabsList>
        <TabsContent value="headcount" className="mt-4 space-y-3">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Headcount scenario</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Planned hires</label>
                <Input
                  type="number"
                  value={headcountInput.hires}
                  onChange={(e) =>
                    setHeadcountInput((prev) => ({ ...prev, hires: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Expected attrition</label>
                <Input
                  type="number"
                  value={headcountInput.attrition}
                  onChange={(e) =>
                    setHeadcountInput((prev) => ({ ...prev, attrition: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={() => void runHeadcount()} disabled={loading}>
                  {loading ? "Running…" : "Run simulation"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="comp" className="mt-4 space-y-3">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">Compensation scenario</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Raises (%)</label>
                <Input
                  type="number"
                  value={compInput.raisesPct}
                  onChange={(e) =>
                    setCompInput((prev) => ({ ...prev, raisesPct: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">New hires</label>
                <Input
                  type="number"
                  value={compInput.hires}
                  onChange={(e) =>
                    setCompInput((prev) => ({ ...prev, hires: Number(e.target.value) }))
                  }
                />
              </div>
              <div className="sm:col-span-2">
                <Button onClick={() => void runComp()} disabled={loading}>
                  {loading ? "Running…" : "Run simulation"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-slate-700">
          {result ? (
            <pre className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-200">
              {JSON.stringify(result, null, 2)}
            </pre>
          ) : (
            <p className="text-slate-600">
              No simulation run yet. Enter inputs and run to see projected impact.
            </p>
          )}
          <p className="text-xs text-slate-500">
            Assumptions are illustrative; connect ATS, HRIS, and payroll for higher accuracy.
          </p>
        </CardContent>
      </Card>
    </main>
  );
}
