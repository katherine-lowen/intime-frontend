"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { DecisionStatusPill } from "@/components/intelligence/DecisionStatusPill";
import { OutcomeForm } from "@/components/intelligence/OutcomeForm";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { addDecisionOutcome, ackDecision, getDecision, type Decision, type DecisionOutcome } from "@/lib/decisions-api";
import { getConfidence, listConfidenceTrends, type ConfidenceEntry } from "@/lib/confidence-api";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import {
  dismissOutcomeSuggestion,
  generateOutcomeSuggestion,
  getOutcomeSuggestion,
  type OutcomeSuggestion,
} from "@/lib/decision-outcome-suggestions-api";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, Loader2, Wand2 } from "lucide-react";

export default function DecisionDetailClient({ orgSlug, id }: { orgSlug: string; id: string }) {
  const { role } = useCurrentOrg();
  const canAck = role === "OWNER" || role === "ADMIN";
  const canOutcome = canAck || role === "MANAGER";
  const [decision, setDecision] = useState<Decision | null>(null);
  const [outcomes, setOutcomes] = useState<DecisionOutcome[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [confidence, setConfidence] = useState<number | null>(null);
  const [confidenceTrend, setConfidenceTrend] = useState<ConfidenceEntry[]>([]);
  const [confidenceKey, setConfidenceKey] = useState<string | undefined>(undefined);
  const [suggestion, setSuggestion] = useState<OutcomeSuggestion | null>(null);
  const [suggestLoading, setSuggestLoading] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await getDecision(orgSlug, id);
        if (!cancelled) {
          setDecision(res || null);
          setOutcomes((res as any)?.outcomes || []);
          const key = (res as any)?.recommendationKey;
          if (key) setConfidenceKey(key);
        }
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load decision");
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
  }, [orgSlug, id]);

  const handleAck = async (action: "ACCEPT" | "REJECT" | "DEFER") => {
    if (!canAck) return;
    setPending(true);
    try {
      await ackDecision(orgSlug, id, action);
      const refreshed = await getDecision(orgSlug, id);
      setDecision(refreshed || null);
      setOutcomes((refreshed as any)?.outcomes || []);
    } finally {
      setPending(false);
    }
  };

  const handleOutcome = async (note: string, key?: string) => {
    await addDecisionOutcome(orgSlug, id, { note, recommendationKey: key });
    const refreshed = await getDecision(orgSlug, id);
    setDecision(refreshed || null);
    setOutcomes((refreshed as any)?.outcomes || []);
    if (key) setConfidenceKey(key);
    setSuggestion(null);
  };

  useEffect(() => {
    if (!confidenceKey) return;
    const key: string = confidenceKey;
    let cancelled = false;
    async function loadConfidence() {
      try {
        const [c, trends] = await Promise.all([
          getConfidence(orgSlug, key),
          listConfidenceTrends(orgSlug, key, 5),
        ]);
        if (cancelled) return;
        setConfidence((c as any)?.confidence ?? (c as any)?.data?.confidence ?? null);
        const tdata = Array.isArray((trends as any)?.data) ? (trends as any).data : [];
        setConfidenceTrend(tdata);
      } catch {
        if (!cancelled) {
          setConfidence(null);
          setConfidenceTrend([]);
        }
      }
    }
    void loadConfidence();
    return () => {
      cancelled = true;
    };
  }, [confidenceKey, orgSlug]);

  useEffect(() => {
    let cancelled = false;
    async function loadSuggestion() {
      try {
        const res = await getOutcomeSuggestion(orgSlug, id);
        if (!cancelled) setSuggestion(res);
      } catch {
        if (!cancelled) setSuggestion(null);
      }
    }
    void loadSuggestion();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, id]);

  const handleGenerateSuggestion = async () => {
    if (!canOutcome) return;
    setSuggestLoading(true);
    setSuggestError(null);
    try {
      const res = await generateOutcomeSuggestion(orgSlug, id);
      setSuggestion(res);
    } catch (err: any) {
      setSuggestError(err?.message || "Unable to generate suggestion");
    } finally {
      setSuggestLoading(false);
    }
  };

  const handleDismissSuggestion = async () => {
    try {
      await dismissOutcomeSuggestion(orgSlug, id);
    } catch {
      // ignore
    }
    setSuggestion(null);
  };

  const handleAcceptSuggestion = async () => {
    if (!suggestion) return;
    const statusNote = suggestion.suggestedOutcomeStatus
      ? `Suggested outcome: ${suggestion.suggestedOutcomeStatus}`
      : "Suggested outcome accepted";
    const evidenceText =
      suggestion.evidence && suggestion.evidence.length
        ? "\n\nEvidence:\n" +
          suggestion.evidence
            .map((ev, idx) => `${idx + 1}. ${ev.title || ev.summary || ev.href || "Evidence"}`)
            .join("\n")
        : "";
    const note = `${statusNote}${evidenceText}`;
    await handleOutcome(note, suggestion.recommendationKey || confidenceKey);
  };

  if (loading) return <div className="p-6 text-sm text-slate-600">Loading…</div>;
  if (error || !decision) {
    return <SupportErrorCard title="Decision" message={error || "Not found"} requestId={requestId} />;
  }

  return (
    <div className="space-y-4 p-6">
      <Link href={`/org/${orgSlug}/intelligence/decisions`} className="text-sm text-indigo-600 hover:underline">
        ← Back to decisions
      </Link>
      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Decision</p>
            <CardTitle className="text-xl">{decision.title}</CardTitle>
            <p className="text-sm text-slate-600">{decision.rationale || "No rationale provided."}</p>
          </div>
          <DecisionStatusPill status={decision.status} />
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          <div className="flex flex-wrap gap-3 text-xs text-slate-600">
            <span className="rounded-full bg-slate-100 px-2 py-1">Category: {decision.category || "—"}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">Source: {decision.sourceType || "—"}</span>
            <span className="rounded-full bg-slate-100 px-2 py-1">Created: {decision.createdAt || "—"}</span>
            {decision.recommendationKey ? (
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-indigo-800">
                Key: {decision.recommendationKey}
              </span>
            ) : null}
          </div>
          {canAck ? (
            <div className="flex flex-wrap gap-2">
              <Button size="sm" onClick={() => void handleAck("ACCEPT")} disabled={pending}>
                Accept
              </Button>
              <Button size="sm" variant="outline" onClick={() => void handleAck("REJECT")} disabled={pending}>
                Reject
              </Button>
              <Button size="sm" variant="ghost" onClick={() => void handleAck("DEFER")} disabled={pending}>
                Defer
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <CardTitle className="text-base">Suggested outcome</CardTitle>
          <div className="flex items-center gap-2">
            {suggestion?.confidence != null ? (
              <Badge variant="secondary" className="text-[11px]">
                Confidence {Math.round(suggestion.confidence)}%
              </Badge>
            ) : null}
            {canOutcome ? (
              <Button size="sm" variant="outline" onClick={() => void handleGenerateSuggestion()} disabled={suggestLoading}>
                {suggestLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
                Generate suggestion
              </Button>
            ) : null}
          </div>
        </CardHeader>
        <CardContent className="space-y-3 text-sm text-slate-700">
          {suggestError ? <p className="text-rose-600">{suggestError}</p> : null}
          {!suggestion && !suggestLoading ? (
            <p className="text-slate-600">No suggestion yet.</p>
          ) : null}
          {suggestion ? (
            <div className="space-y-2 rounded-lg border border-slate-200 bg-slate-50 p-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                {suggestion.suggestedOutcomeStatus || "Suggested outcome"}
              </div>
              {suggestion.note ? <p className="text-sm text-slate-700">{suggestion.note}</p> : null}
              {suggestion.evidence && suggestion.evidence.length ? (
                <div className="space-y-1 text-sm">
                  <p className="text-xs uppercase tracking-wide text-slate-500">Evidence</p>
                  <ul className="space-y-1">
                    {suggestion.evidence.map((ev, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-slate-700">
                        <span className="mt-0.5 text-xs text-slate-500">{idx + 1}.</span>
                        {ev.href ? (
                          <Link href={ev.href} className="text-indigo-600 hover:underline">
                            {ev.title || ev.summary || ev.href}
                          </Link>
                        ) : (
                          <span>{ev.title || ev.summary || "Evidence"}</span>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
              <div className="flex flex-wrap gap-2">
                {canAck ? (
                  <Button size="sm" onClick={() => void handleAcceptSuggestion()}>
                    Accept suggestion
                  </Button>
                ) : null}
                {canOutcome ? (
                  <Button size="sm" variant="ghost" onClick={() => void handleDismissSuggestion()}>
                    Dismiss
                  </Button>
                ) : null}
              </div>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Outcomes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {outcomes.length === 0 ? (
            <p className="text-sm text-slate-600">No outcomes yet.</p>
          ) : (
            <div className="space-y-2">
              {outcomes.map((o, idx) => (
                <div key={o.id || idx} className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-800">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{o.author || "—"}</span>
                    <span>{o.createdAt || "—"}</span>
                  </div>
                  <p className="mt-1">{o.note}</p>
                </div>
              ))}
            </div>
          )}
          {canOutcome ? <OutcomeForm onSubmit={handleOutcome} /> : null}
        </CardContent>
      </Card>

      {confidenceKey ? (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Confidence</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-wide text-slate-500">Key</span>
              <span className="rounded-full bg-indigo-100 px-2 py-1 text-xs font-semibold text-indigo-800">
                {confidenceKey}
              </span>
            </div>
            <div className="text-xl font-semibold text-slate-900">
              {confidence != null ? `${Math.round(confidence)}%` : "—"}
            </div>
            {confidenceTrend.length ? (
              <div className="space-y-2">
                {confidenceTrend.map((t, idx) => (
                  <div key={idx} className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs">
                    <span className="text-slate-600">{t.date || "—"}</span>
                    <span className="text-slate-800 font-semibold">
                      {t.before ?? "—"} → {t.after ?? "—"}
                    </span>
                    <div className="flex-1 ml-3 h-2 rounded-full bg-slate-200 overflow-hidden">
                      <div
                        className="h-full bg-indigo-500"
                        style={{ width: `${Math.max(0, Math.min(100, t.after ?? 0))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-600">No trend data yet.</p>
            )}
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
