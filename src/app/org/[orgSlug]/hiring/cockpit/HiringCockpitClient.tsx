"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Briefcase, Sparkles, ChevronRight, Loader2, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { listHiringSignals, HiringSignal } from "@/lib/hiring-signals-api";
import { createJob } from "@/lib/api-ats";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { getConfidenceSummary } from "@/lib/confidence-summary-api";
import { ConfidencePill } from "@/components/intelligence/ConfidencePill";

type Props = {
  orgSlug: string;
};

export default function HiringCockpitClient({ orgSlug }: Props) {
  const router = useRouter();
  const [signals, setSignals] = useState<HiringSignal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [confirmSignal, setConfirmSignal] = useState<HiringSignal | null>(null);
  const [creating, setCreating] = useState(false);
  const [decisionDefaults, setDecisionDefaults] = useState<any | null>(null);
  const [confidenceMap, setConfidenceMap] = useState<Record<string, { confidence?: number | null; delta?: number | null }>>(
    {}
  );

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await listHiringSignals(orgSlug);
        if (!cancelled) {
          setSignals(res);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load hiring signals");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  useEffect(() => {
    const keys = Array.from(
      new Set(
        signals
          .map((s) => s.recommendationKey)
          .filter(Boolean)
          .map((k: any) => String(k))
      )
    );
    if (!keys.length) {
      setConfidenceMap({});
      return;
    }
    let cancelled = false;
    async function loadConfidence() {
      try {
        const entries = await Promise.all(
          keys.map(async (key) => {
            try {
              const res = await getConfidenceSummary(orgSlug, key);
              return [key, res] as const;
            } catch {
              return [key, null] as const;
            }
          })
        );
        if (!cancelled) {
          const map: Record<string, { confidence?: number | null; delta?: number | null }> = {};
          entries.forEach(([k, v]) => {
            if (v) map[k] = v;
          });
          setConfidenceMap(map);
        }
      } catch {
        if (!cancelled) setConfidenceMap({});
      }
    }
    void loadConfidence();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, signals]);

  const grouped = useMemo(() => {
    const map = new Map<string, HiringSignal[]>();
    signals.forEach((sig) => {
      const dept = sig.department || "General";
      if (!map.has(dept)) map.set(dept, []);
      map.get(dept)!.push(sig);
    });
    return Array.from(map.entries());
  }, [signals]);

  const handleCreateJob = async () => {
    if (!confirmSignal) return;
    try {
      setCreating(true);
      const payload = {
        title: confirmSignal.suggestedRole || confirmSignal.title || "New role",
        department: confirmSignal.department || undefined,
        location: confirmSignal.suggestedLocation || undefined,
      };
      const job = await createJob(orgSlug, payload);
      toast.success("Job created");
      setConfirmSignal(null);
      if (job?.id) {
        router.push(`/org/${orgSlug}/hiring/jobs/${job.id}`);
      }
    } catch (err: any) {
      toast.error(err?.message || "Unable to create job");
    } finally {
      setCreating(false);
    }
  };

  const renderSignalRow = (signal: HiringSignal) => {
    return (
      <div
        key={signal.id}
        className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm transition hover:border-slate-300"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-sm font-semibold text-slate-900">{signal.title || "Hiring signal"}</p>
              {signal.category ? (
                <Badge variant="secondary" className="text-[11px]">
                  {signal.category}
                </Badge>
              ) : null}
              {signal.priority ? (
                <Badge variant="outline" className="text-[11px]">
                  Priority {signal.priority}
                </Badge>
              ) : null}
              {signal.recommendationKey && confidenceMap[signal.recommendationKey] ? (
                <ConfidencePill
                  confidence={confidenceMap[signal.recommendationKey]?.confidence ?? null}
                  delta={confidenceMap[signal.recommendationKey]?.delta ?? null}
                />
              ) : null}
            </div>
            {signal.summary ? (
              <p className="text-sm text-slate-600">{signal.summary}</p>
            ) : null}
            {signal.department ? (
              <p className="text-xs text-slate-500">Dept: {signal.department}</p>
            ) : null}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() =>
                setDecisionDefaults({
                  title: signal.title || "Hiring signal",
                  category: signal.category || "HIRING",
                  sourceType: "HIRING_SIGNAL",
                  sourceId: signal.id,
                  related: signal.department ? [signal.department] : undefined,
                  recommendationKey: signal.recommendationKey,
                })
              }
            >
              Create decision
            </Button>
            <Button size="sm" onClick={() => setConfirmSignal(signal)} className="gap-2">
              <PlusCircle className="h-4 w-4" />
              Create job
            </Button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Hiring</p>
          <h1 className="text-2xl font-semibold text-slate-900">Hiring cockpit</h1>
          <p className="text-sm text-slate-600">Signals that keep you on plan, with one-click actions.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" asChild>
            <Link href={`/org/${orgSlug}/hiring`}>Jobs</Link>
          </Button>
          <Button asChild>
            <Link href={`/org/${orgSlug}/headcount/plans`}>Headcount plans</Link>
          </Button>
        </div>
      </header>

      {error ? <SupportErrorCard message={error} /> : null}

      <Card>
        <CardHeader className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-500" />
            <CardTitle className="text-base">Hiring signals</CardTitle>
          </div>
          <p className="text-xs text-slate-500">Grounded in workforce, PTO, and headcount plans.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading signals…
            </div>
          ) : grouped.length === 0 ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-6 text-center text-sm text-slate-600">
              No signals yet. Stay tuned as we ingest workforce and pipeline data.
            </div>
          ) : (
            grouped.map(([dept, rows]) => (
              <div key={dept} className="space-y-2">
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-800">
                  <Briefcase className="h-4 w-4 text-slate-500" />
                  {dept}
                </div>
                <div className="space-y-2">{rows.map(renderSignalRow)}</div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <AlertDialog open={Boolean(confirmSignal)} onOpenChange={(open) => !open && setConfirmSignal(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Create a job from this signal?</AlertDialogTitle>
            <AlertDialogDescription>
              We’ll create a new job using this insight{confirmSignal?.department ? ` in ${confirmSignal.department}` : ""}.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={creating}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleCreateJob} disabled={creating}>
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create job"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {decisionDefaults ? (
        <DecisionCreateDialog
          hideTrigger
          open={Boolean(decisionDefaults)}
          defaults={decisionDefaults}
          orgSlug={orgSlug}
          onOpenChange={(open) => !open && setDecisionDefaults(null)}
          onCreated={(decisionId) => {
            setDecisionDefaults(null);
            if (decisionId) router.push(`/org/${orgSlug}/intelligence/decisions/${decisionId}`);
          }}
        />
      ) : null}
    </div>
  );
}
