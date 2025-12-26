"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  loadActivation,
  dismissActivation,
  resetActivation,
  markCompleted,
  type ActivationState,
  type ActivationStepId,
  reconcileActivation,
} from "@/lib/activation";
import { ACTIVATION_STEPS } from "@/lib/activation-steps";
import { getActivationStatus } from "@/lib/api-activation";

type Props = {
  orgSlug: string;
};

export function GettingStartedCard({ orgSlug }: Props) {
  const router = useRouter();
  const [state, setState] = useState<ActivationState>(() => loadActivation(orgSlug));
  const [statusError, setStatusError] = useState<string | null>(null);

  useEffect(() => {
    setState(loadActivation(orgSlug));
  }, [orgSlug]);

  useEffect(() => {
    let mounted = true;
    async function loadStatus() {
      try {
        const status = await getActivationStatus(orgSlug);
        if (!mounted) return;
        const reconciled = reconcileActivation(orgSlug, status);
        setState(reconciled);
        setStatusError(null);
      } catch (err: any) {
        if (!mounted) return;
        setStatusError(err?.message || "Couldn’t load progress");
      }
    }
    void loadStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orgSlug]);

  const completion = useMemo(() => {
    const total = ACTIVATION_STEPS.length;
    const done = Object.values(state.completed || {}).filter(Boolean).length;
    return { done, total, percent: Math.round((done / total) * 100) };
  }, [orgSlug, state.completed]);

  if (state.dismissed) return null;

  const handleDismiss = () => {
    const next = dismissActivation(orgSlug);
    setState(next);
  };

  const handleReset = () => {
    const next = resetActivation(orgSlug);
    setState(next);
  };

  const handleMark = (id: ActivationStepId) => {
    const next = markCompleted(orgSlug, id);
    setState(next);
  };

  if (completion.percent === 100) {
    return (
      <Card className="border-slate-800 bg-slate-950 text-slate-50">
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-200">
              Ready
            </Badge>
          <CardTitle className="text-base text-white">Workspace ready</CardTitle>
          </div>
          <button
            className="text-xs text-slate-400 hover:text-slate-200"
            onClick={handleReset}
          >
            Reset
          </button>
        </CardHeader>
        <CardContent className="text-sm text-slate-300">
          You’re all set. Keep exploring hiring, people, and AI workflows.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-slate-800 bg-slate-950 text-slate-50">
      <CardHeader className="flex flex-row items-start justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Activation</p>
          <CardTitle className="text-base text-white">Getting started</CardTitle>
          <p className="text-sm text-slate-400">
            Finish these steps to set up your workspace.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-xs text-slate-400 transition hover:text-slate-200"
        >
          Hide
        </button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>
              {completion.done} of {completion.total} completed
            </span>
            <span>{completion.percent}%</span>
          </div>
          <Progress value={completion.percent} className="h-2" />
          {statusError && (
            <p className="text-[11px] text-amber-400">Couldn’t load progress. Using local state.</p>
          )}
        </div>
        <div className="space-y-2">
          {ACTIVATION_STEPS.map((step) => {
            const done = !!state.completed?.[step.key as ActivationStepId];
            return (
              <div
                key={step.key}
                className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2"
              >
                <div className="flex items-center gap-3">
                  <Checkbox
                    checked={done}
                    onCheckedChange={() => handleMark(step.key as ActivationStepId)}
                    className="border-slate-600 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                  />
                  <div>
                    <p className="text-sm text-slate-100">{step.title}</p>
                    <p className="text-xs text-slate-400">{step.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-slate-800 text-xs text-slate-100 hover:bg-slate-700"
                  onClick={() => router.push(step.href(orgSlug))}
                >
                  Go
                </Button>
              </div>
            );
          })}
        </div>
        <div className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-2">
          <div className="text-sm text-slate-200">Next best action</div>
          <Button
            size="sm"
            className="bg-indigo-500 text-xs text-white hover:bg-indigo-400"
            onClick={() => {
              const next = ACTIVATION_STEPS.find(
                (s) => !state.completed?.[s.key as ActivationStepId]
              );
              if (next) router.push(next.href(orgSlug));
            }}
          >
            Jump
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
