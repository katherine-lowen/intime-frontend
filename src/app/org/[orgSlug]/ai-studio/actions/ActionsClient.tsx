"use client";

import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { AiStudioShell } from "../AiStudioShell";
import { listActions, runAction } from "@/lib/ai-studio-api";
import { usePlanGuard } from "@/hooks/usePlanGuard";

type ActionItem = {
  key: string;
  name: string;
  description?: string | null;
  domains?: string[];
  minPlan?: string | null;
  canRun?: boolean;
  policyBlocked?: boolean;
  usedIn?: string[];
};

export default function ActionsClient({ orgSlug }: { orgSlug: string }) {
  const [actions, setActions] = useState<ActionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [input, setInput] = useState<string>("{}");
  const [result, setResult] = useState<any>(null);
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await listActions(orgSlug);
        if (!cancelled) setActions((res as ActionItem[]) || []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load actions");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const handleRun = async (action: ActionItem) => {
    if (!action.canRun) return;
    setActiveKey(action.key);
    setResult(null);
    try {
      const parsed = input ? JSON.parse(input) : {};
      const res = await runAction(orgSlug, { actionKey: action.key, input: parsed });
      setResult(res);
    } catch (err: any) {
      if (handlePlanError(err)) return;
      setResult({ error: err?.message || "Failed to run action" });
    }
  };

  return (
    <AiStudioShell orgSlug={orgSlug}>
      {error ? (
        <SupportErrorCard title="AI Studio" message={error} requestId={requestId} />
      ) : null}

      {upgradeModal}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading actions…
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {actions.map((action) => (
            <Card key={action.key} className="border-slate-200">
              <CardHeader className="flex flex-row items-start justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">{action.name}</CardTitle>
                  <p className="text-sm text-slate-600">{action.description}</p>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {action.minPlan ? (
                    <Badge variant="outline" className="text-[10px] uppercase">
                      {action.minPlan}
                    </Badge>
                  ) : null}
                  <Badge
                    className={
                      action.policyBlocked
                        ? "bg-rose-100 text-rose-800"
                        : "bg-emerald-100 text-emerald-800"
                    }
                  >
                    {action.policyBlocked ? "Blocked by policy" : "Available"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {action.domains?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {action.domains.map((d) => (
                      <Badge key={d} variant="secondary" className="text-[11px]">
                        {d}
                      </Badge>
                    ))}
                  </div>
                ) : null}

                {action.canRun ? (
                  <div className="space-y-2">
                    <Textarea
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      className="font-mono text-xs"
                      rows={4}
                    />
                    <Button size="sm" onClick={() => handleRun(action)} disabled={action.policyBlocked}>
                      Run
                    </Button>
                    {activeKey === action.key && result ? (
                      <pre className="rounded-lg bg-slate-950 p-3 text-[11px] text-slate-200">
                        {JSON.stringify(result, null, 2)}
                      </pre>
                    ) : null}
                  </div>
                ) : (
                  <div className="text-xs text-slate-500">
                    Used in: {action.usedIn?.join(", ") || "Product areas"}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AiStudioShell>
  );
}
