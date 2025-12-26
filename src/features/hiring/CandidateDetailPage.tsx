"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2 } from "lucide-react";
import type { Candidate, AiCandidateSummary } from "@/lib/ats-types";
import { generateCandidateSummary, getCandidate } from "@/lib/api-ats";
import { useBillingSummary } from "@/hooks/useBillingSummary";
import { markCompleted } from "@/lib/activation";
import { toast } from "sonner";
import { PlanGate } from "@/components/PlanGate";

type Props = {
  orgSlug: string;
  candidateId: string;
};

export default function CandidateDetailPage({ orgSlug, candidateId }: Props) {
  const { organization: billingOrg, loading: billingLoading } = useBillingSummary();

  const [candidate, setCandidate] = useState<Candidate | null>(null);
  const [loading, setLoading] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [summary, setSummary] = useState<AiCandidateSummary | null>(null);
  const [summaryError, setSummaryError] = useState<string | null>(null);
  const [candidateError, setCandidateError] = useState<string | null>(null);
  const plan = billingOrg?.plan?.toUpperCase?.() ?? "";
  const billingStatus = billingOrg?.billingStatus ?? "";
  const aiEligible =
    billingStatus === "active" && (plan === "GROWTH" || plan === "SCALE");
  const billingInterval = billingOrg?.billingInterval === "annual" ? "annual" : "monthly";
  const upgradeHref = `/choose-plan?plan=growth&billing=${billingInterval}`;

  useEffect(() => {
    let mounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await getCandidate(orgSlug, candidateId);
        if (!mounted) return;
        setCandidate(res);
        setCandidateError(null);
      } catch (err: any) {
        if (mounted) {
          setCandidate(null);
          setCandidateError(err?.message || "Unable to load candidate");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }
    void load();
    return () => {
      mounted = false;
    };
  }, [candidateId, orgSlug]);

  const fullName = candidate
    ? [candidate.firstName, candidate.lastName].filter(Boolean).join(" ")
    : "Candidate";

  const handleSummary = async (force = false) => {
    if (!candidateId || !aiEligible) return;
    try {
      setAiLoading(true);
      const res = await generateCandidateSummary(orgSlug, { candidateId, jobId: null, force });
      setSummary(res);
      setSummaryError(null);
      markCompleted(orgSlug, "generate_ai_summary");
    } catch (err: any) {
      toast.error(err?.message || "Unable to generate summary");
      setSummaryError(err?.message || "Unable to generate summary");
    } finally {
      setAiLoading(false);
    }
  };

  if (!loading && !candidate) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        {candidateError || "Candidate not found."}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Candidate</p>
            <CardTitle className="text-xl">
              {loading ? <Skeleton className="h-5 w-32" /> : fullName}
            </CardTitle>
            <p className="text-sm text-slate-500">
              {loading ? <Skeleton className="mt-1 h-4 w-40" /> : candidate?.email || "No email"}
            </p>
          </div>
          {!loading && candidate?.stage && (
            <Badge variant="outline" className="text-[11px]">
              {candidate.stage}
            </Badge>
          )}
        </CardHeader>
      </Card>

      {candidateError && (
        <Alert variant="destructive">
          <AlertTitle>Unable to load candidate</AlertTitle>
          <AlertDescription>{candidateError}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-semibold text-slate-900">Resume</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-slate-600">
            Placeholder for resume preview. Attachments and parsing coming soon.
          </p>
        </CardContent>
      </Card>

      <PlanGate required="GROWTH" feature="AI summaries">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-900">AI Summary</CardTitle>
            <div className="flex items-center gap-2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleSummary(false)}
                      disabled={aiLoading || !aiEligible || billingLoading || !candidate}
                    >
                      {aiLoading ? "Generating…" : "Generate"}
                    </Button>
                  </span>
                </TooltipTrigger>
                {!aiEligible && !billingLoading && (
                  <TooltipContent>
                    Upgrade to Growth to unlock AI hiring insights
                  </TooltipContent>
                )}
              </Tooltip>
              {summary && (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleSummary(true)}
                        disabled={aiLoading || !aiEligible || billingLoading || !candidate}
                      >
                        Regenerate
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {!aiEligible && !billingLoading && (
                    <TooltipContent>
                      Upgrade to Growth to unlock AI hiring insights
                    </TooltipContent>
                  )}
                </Tooltip>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            {!aiEligible && !billingLoading && (
              <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-600">
                <span>AI is available on Growth and Scale.</span>
                <Link
                  href={upgradeHref}
                  className="text-indigo-600 hover:text-indigo-700 font-semibold"
                >
                  Upgrade
                </Link>
              </div>
            )}
            {!summary && !aiLoading && !summaryError && (
              <div className="rounded-lg border border-slate-200 bg-white px-3 py-3">
                <p className="text-sm font-semibold text-slate-900">Generate an AI summary</p>
                <p className="text-xs text-slate-600">
                  Get tailored highlights, risks, and interview questions to guide your next steps.
                </p>
                <div className="mt-2">
                  <Button
                    size="sm"
                    onClick={() => handleSummary(false)}
                    disabled={!aiEligible || aiLoading || billingLoading || !candidate}
                    className="gap-2"
                  >
                    {aiLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                    Generate summary
                  </Button>
                </div>
              </div>
            )}
            {summaryError && (
              <Alert variant="destructive">
                <AlertTitle>AI summary failed</AlertTitle>
                <AlertDescription>
                  {summaryError}
                  <div className="mt-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSummary(true)}
                      disabled={!aiEligible || aiLoading || billingLoading || !candidate}
                    >
                      Retry
                    </Button>
                  </div>
                </AlertDescription>
              </Alert>
            )}

            {!summary && !aiLoading && !summaryError && (
              <p className="text-sm text-slate-600">
                AI-generated highlights, risks, and interview questions will appear here.
              </p>
            )}

            {aiLoading && (
              <div className="space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-3/4" />
                <Skeleton className="h-3 w-2/3" />
              </div>
            )}

            {summary && !aiLoading && (
              <>
                {summary.fitScore != null && (
                  <Badge variant="outline" className="text-[11px]">
                    Fit score: {summary.fitScore}
                  </Badge>
                )}
                {summary.highlights && summary.highlights.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600">Highlights</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {summary.highlights.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.risks && summary.risks.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600">Risks</p>
                    <ul className="mt-1 list-disc space-y-1 pl-4">
                      {summary.risks.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ul>
                  </div>
                )}
                {summary.interviewQuestions && summary.interviewQuestions.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600">
                      Interview questions
                    </p>
                    <ol className="mt-1 list-decimal space-y-1 pl-4">
                      {summary.interviewQuestions.map((h, idx) => (
                        <li key={idx}>{h}</li>
                      ))}
                    </ol>
                  </div>
                )}
                {summary.rationale && (
                  <div>
                    <p className="text-xs font-semibold uppercase text-slate-600">Rationale</p>
                    <p className="mt-1 text-sm text-slate-700">{summary.rationale}</p>
                  </div>
                )}
                {!summary.highlights?.length &&
                  !summary.risks?.length &&
                  !summary.interviewQuestions?.length &&
                  !summary.rationale && (
                    <p className="text-xs text-slate-500">
                      No AI details returned for this candidate yet.
                    </p>
                  )}
              </>
            )}
          </CardContent>
        </Card>
      </PlanGate>
    </div>
  );
}
