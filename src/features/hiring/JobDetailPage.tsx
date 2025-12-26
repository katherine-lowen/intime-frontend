"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Loader2, Plus, Sparkles } from "lucide-react";
import {
  listJobCandidates,
  getJob,
  createCandidate,
  generateJobShortlist,
  createApplication,
  updateApplication,
  seedAtsDemo,
  listInternalMatches,
  type InternalMatch,
} from "@/lib/api-ats";
import { useBillingSummary } from "@/hooks/useBillingSummary";
import type {
  Candidate,
  Job,
  ApplicationStage,
  AiJobShortlist,
  AiShortlistItem,
} from "@/lib/ats-types";
import { markCompleted } from "@/lib/activation";
import { toast } from "sonner";
import { PlanGate } from "@/components/PlanGate";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";

const DEFAULT_STAGE: ApplicationStage = "APPLIED";
const STAGE_OPTIONS: ApplicationStage[] = [
  "APPLIED",
  "SCREEN",
  "ONSITE",
  "OFFER",
  "HIRED",
  "REJECTED",
];

type Props = {
  orgSlug: string;
  jobId: string;
};

export default function JobDetailPage({ orgSlug, jobId }: Props) {
  const { organization: billingOrg, loading: billingLoading } = useBillingSummary();
  const searchParams = useSearchParams();
  const router = useRouter();

  const [job, setJob] = useState<Job | null>(null);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shortlist, setShortlist] = useState<AiJobShortlist | null>(null);
  const [shortlistLoading, setShortlistLoading] = useState(false);
  const [shortlistError, setShortlistError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [stageUpdating, setStageUpdating] = useState<Record<string, boolean>>({});
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    linkedInUrl: "",
  });
  const [mobility, setMobility] = useState<InternalMatch[]>([]);
  const [mobilityLoading, setMobilityLoading] = useState(false);
  const [mobilityError, setMobilityError] = useState<string | null>(null);

  const fitScoreTone = (score: number) => {
    if (score >= 80) {
      return "border-emerald-500/50 bg-emerald-500/10 text-emerald-100";
    }
    if (score >= 60) {
      return "border-amber-400/60 bg-amber-400/10 text-amber-100";
    }
    return "border-rose-500/50 bg-rose-500/10 text-rose-100";
  };

  const nextActionTone = (action: AiShortlistItem["nextAction"]) => {
    switch (action) {
      case "INTERVIEW":
        return "border-indigo-400/60 bg-indigo-500/10 text-indigo-100";
      case "SCREEN":
        return "border-sky-400/60 bg-sky-500/10 text-sky-100";
      case "REJECT":
      default:
        return "border-rose-500/50 bg-rose-500/10 text-rose-100";
    }
  };

  const plan = billingOrg?.plan?.toUpperCase?.() ?? "";
  const billingStatus = billingOrg?.billingStatus ?? "";
  const aiEligible =
    billingStatus === "active" && (plan === "GROWTH" || plan === "SCALE");
  const billingInterval = billingOrg?.billingInterval === "annual" ? "annual" : "monthly";
  const upgradeHref = `/choose-plan?plan=growth&billing=${billingInterval}`;

  useEffect(() => {
    let mounted = true;
    async function fetchData() {
      try {
        setLoading(true);
        const [j, c] = await Promise.all([
          getJob(orgSlug, jobId),
          listJobCandidates(orgSlug, jobId),
        ]);
        if (!mounted) return;
        setJob(j ?? null);
        setCandidates(c);
        setError(null);
      } catch (err: any) {
        if (mounted) {
          setError(err?.message || "Unable to load job");
        setJob(null);
        setCandidates([]);
      }
    } finally {
      if (mounted) setLoading(false);
    }
  }
  void fetchData();
  return () => {
    mounted = false;
  };
 }, [jobId, orgSlug]);

  useEffect(() => {
    setShortlist(null);
    setShortlistError(null);
    setShortlistLoading(false);
  }, [jobId, orgSlug]);

  useEffect(() => {
    let cancelled = false;
    async function loadMobility() {
      if (!jobId) return;
      try {
        setMobilityLoading(true);
        setMobilityError(null);
        const res = await listInternalMatches(orgSlug, jobId);
        if (!cancelled) {
          setMobility(res || []);
        }
      } catch (err: any) {
        if (!cancelled) setMobilityError(err?.message || "Unable to load internal matches");
      } finally {
        if (!cancelled) setMobilityLoading(false);
      }
    }
    void loadMobility();
    return () => {
      cancelled = true;
    };
  }, [jobId, orgSlug]);

  useEffect(() => {
    const shouldOpen = searchParams?.get("addCandidate") === "1";
    if (shouldOpen) {
      setDialogOpen(true);
      const url = new URL(window.location.href);
      url.searchParams.delete("addCandidate");
      window.history.replaceState({}, "", url.toString());
    }
  }, [searchParams]);

  const handleAddCandidate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName.trim() || !form.email.trim()) return;
    try {
      setSaving(true);
      const candidate = await createCandidate(orgSlug, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        linkedInUrl: form.linkedInUrl || undefined,
        jobId,
      });
      await createApplication(orgSlug, jobId, { candidateId: candidate.id });
      await refreshCandidates();
      markCompleted(orgSlug, "add_candidate");
      setDialogOpen(false);
      setForm({ firstName: "", lastName: "", email: "", linkedInUrl: "" });
      toast.success("Candidate added");
    } catch (err: any) {
      toast.error(err?.message || "Unable to add candidate");
    } finally {
      setSaving(false);
    }
  };

  const handleGenerateShortlist = async (force = false) => {
    if (!jobId || shortlistLoading || candidates.length === 0 || !aiEligible) return;
    try {
      setShortlistLoading(true);
      setShortlistError(null);
      const res = await generateJobShortlist(orgSlug, { jobId, force });
      setShortlist(res);
    } catch (err: any) {
      const message = err?.message || "Unable to generate shortlist";
      setShortlistError(message);
      toast.error(message);
    } finally {
      setShortlistLoading(false);
    }
  };

  const refreshCandidates = async () => {
    try {
      const res = await listJobCandidates(orgSlug, jobId);
      setCandidates(res);
      setError(null);
    } catch (err: any) {
      setError(err?.message || "Unable to refresh candidates");
    }
  };

  const handleSeedDemoCandidates = async () => {
    try {
      setLoading(true);
      await seedAtsDemo(orgSlug, { jobId, candidateCount: 3 });
      await refreshCandidates();
      toast.success("Seeded demo candidates");
    } catch (err: any) {
      toast.error(err?.message || "Unable to seed candidates");
    } finally {
      setLoading(false);
    }
  };

  const handleStageChange = async (applicationId: string | null | undefined, stage: string) => {
    if (!applicationId) return;
    setStageUpdating((prev) => ({ ...prev, [applicationId]: true }));
    try {
      await updateApplication(orgSlug, applicationId, { stage });
      await refreshCandidates();
      toast.success("Stage updated");
    } catch (err: any) {
      toast.error(err?.message || "Unable to update stage");
    } finally {
      setStageUpdating((prev) => ({ ...prev, [applicationId]: false }));
    }
  };

  const hasCandidates = candidates.length > 0;
  const shortlistItems = shortlist?.items ?? [];
  const generatedAtLabel =
    shortlist?.generatedAt && !Number.isNaN(new Date(shortlist.generatedAt).getTime())
      ? new Date(shortlist.generatedAt).toLocaleString()
      : shortlist?.generatedAt ?? "";
  const aiTooltip =
    !aiEligible && !billingLoading
      ? "Upgrade to Growth to unlock AI hiring insights"
      : !hasCandidates
      ? "Add candidates to generate a shortlist"
      : null;
  const mobilityCTA = (match: InternalMatch) => {
    if (match.courseId) {
      return `/org/${orgSlug}/learning/courses/${match.courseId}`;
    }
    if (match.userId) {
      return `/org/${orgSlug}/people/${match.userId}`;
    }
    return `/org/${orgSlug}/people`;
  };

  if (loading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-sm text-slate-600">
        Loading job…
      </div>
    );
  }

  if (!job) {
    return (
      <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Job not found.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error && (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
          {error}
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Job</p>
          <h1 className="text-xl font-semibold text-slate-900">{job.title}</h1>
        </div>
        <Badge variant="outline" className="text-[11px]">
          {job.status || "OPEN"}
        </Badge>
      </div>

      <Card className="border-slate-200">
        <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">Internal mobility</p>
            <CardTitle className="text-base">Top internal matches</CardTitle>
            <p className="text-sm text-slate-600">Surface internal talent, explain fit and gaps.</p>
          </div>
          <Button size="sm" variant="outline" asChild>
            <Link href={`/org/${orgSlug}/people`}>People directory</Link>
          </Button>
        </CardHeader>
        <CardContent className="space-y-3">
          {mobilityLoading ? (
            <div className="text-sm text-slate-600">Loading internal matches…</div>
          ) : mobilityError ? (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
              {mobilityError}
            </div>
          ) : mobility.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              No internal matches yet. Connect People and Learning data to see matches here.
            </div>
          ) : (
            mobility.slice(0, 4).map((match) => (
              <div key={match.id} className="space-y-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-slate-900">
                      {match.name || "Internal candidate"}
                    </p>
                    <p className="text-xs text-slate-600">{match.role || "Current role not provided"}</p>
                  </div>
                  {match.fitScore != null ? (
                    <Badge
                      variant="outline"
                      className={`text-[11px] ${
                        match.fitScore >= 80
                          ? "border-emerald-400 text-emerald-700"
                          : match.fitScore >= 60
                          ? "border-amber-400 text-amber-700"
                          : "border-rose-400 text-rose-700"
                      }`}
                    >
                      Fit {Math.round(match.fitScore)}
                    </Badge>
                  ) : null}
                </div>
                {match.why ? (
                  <div className="rounded-md border border-slate-200 bg-slate-50 p-2 text-xs text-slate-700">
                    <p className="font-semibold text-slate-800">Why</p>
                    <p>{match.why}</p>
                  </div>
                ) : null}
                {match.gaps ? (
                  <div className="rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-800">
                    <p className="font-semibold text-amber-900">Gaps</p>
                    <p>{match.gaps}</p>
                  </div>
                ) : null}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" asChild>
                    <Link href={mobilityCTA(match)}>
                      {match.courseId || match.courseName ? "Assign course" : "View profile"}
                    </Link>
                  </Button>
                  <DecisionCreateDialog
                    orgSlug={orgSlug}
                    defaults={{
                      title: `Internal mobility: ${match.name || job.title}`,
                      category: "HIRING",
                      sourceType: "INTERNAL_MOBILITY",
                      sourceId: match.id,
                      related: match.actionUrl || undefined,
                      recommendationKey: match.recommendationKey || undefined,
                    }}
                  />
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="candidates">
        <TabsList>
          <TabsTrigger value="candidates">Candidates</TabsTrigger>
          <TabsTrigger value="ai">AI Shortlist</TabsTrigger>
        </TabsList>
        <TabsContent value="ai" className="space-y-4">
          <PlanGate required="GROWTH" feature="AI shortlist">
          <Card className="!border-slate-800 !bg-slate-950 text-slate-100 shadow-none">
            <CardHeader className="flex flex-col gap-3 border-b !border-slate-800 md:flex-row md:items-start md:justify-between">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wide text-slate-400">AI Shortlist</p>
                <CardTitle className="text-lg text-white">Ranked candidates for this role</CardTitle>
                <p className="text-sm text-slate-400">
                  Generate an AI-powered shortlist with fit scores, reasons, and suggested next steps.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Tooltip>
                  <TooltipTrigger asChild>
                    <span className="inline-flex">
                      <Button
                        size="sm"
                        className="gap-2 bg-indigo-500 text-white hover:bg-indigo-400"
                        onClick={() => handleGenerateShortlist(false)}
                        disabled={shortlistLoading || !hasCandidates || !aiEligible || billingLoading}
                      >
                        {shortlistLoading ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <Sparkles className="h-4 w-4" />
                        )}
                        Generate AI shortlist
                      </Button>
                    </span>
                  </TooltipTrigger>
                  {aiTooltip && <TooltipContent>{aiTooltip}</TooltipContent>}
                </Tooltip>
                {shortlist && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <span className="inline-flex">
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-slate-700 bg-slate-900 text-slate-100 hover:bg-slate-800"
                          onClick={() => handleGenerateShortlist(true)}
                          disabled={
                            shortlistLoading || !hasCandidates || !aiEligible || billingLoading
                          }
                        >
                          {shortlistLoading ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            "Regenerate"
                          )}
                        </Button>
                      </span>
                    </TooltipTrigger>
                    {aiTooltip && <TooltipContent>{aiTooltip}</TooltipContent>}
                  </Tooltip>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {!aiEligible && !billingLoading && (
                <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-800 bg-slate-900/70 px-3 py-2 text-xs text-slate-200">
                  <span>AI shortlist is available on Growth and Scale.</span>
                  <Link href={upgradeHref} className="font-semibold text-indigo-300 hover:text-indigo-200">
                    Upgrade
                  </Link>
                </div>
              )}
              {shortlistError && (
                <Alert
                  variant="destructive"
                  className="border border-red-500/40 bg-red-950 text-red-100"
                >
                  <AlertTitle>AI shortlist failed</AlertTitle>
                  <AlertDescription className="space-y-3 text-sm text-red-100">
                    <p>{shortlistError}</p>
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-red-400 bg-transparent text-red-50 hover:bg-red-900"
                      onClick={() => handleGenerateShortlist(true)}
                      disabled={
                        shortlistLoading || !hasCandidates || !aiEligible || billingLoading
                      }
                    >
                      Retry
                    </Button>
                  </AlertDescription>
                </Alert>
              )}

              {shortlistLoading && (
                <div className="grid gap-3 md:grid-cols-2">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-800 bg-slate-900/60 p-4"
                    >
                      <Skeleton className="h-4 w-24 bg-slate-800" />
                      <Skeleton className="mt-3 h-5 w-36 bg-slate-800" />
                      <Skeleton className="mt-2 h-3 w-full bg-slate-800" />
                      <Skeleton className="mt-1 h-3 w-3/4 bg-slate-800" />
                    </div>
                  ))}
                </div>
              )}

              {!shortlist && !shortlistLoading && !shortlistError && (
                <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6">
                  <p className="text-sm text-slate-200">
                    Use AI to surface the top 2–4 reasons to meet a candidate and the next action to
                    take. Generate once candidates are added to this job.
                  </p>
                </div>
              )}

              {shortlist && !shortlistLoading && (
                <div className="space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-400">
                    <span>
                      Generated {generatedAtLabel ? `on ${generatedAtLabel}` : "recently"}
                    </span>
                    <span>
                      {shortlistItems.length} candidate{shortlistItems.length === 1 ? "" : "s"} ranked
                    </span>
                  </div>

                  {shortlistItems.length === 0 ? (
                    <div className="rounded-xl border border-slate-800 bg-slate-900/60 p-6 text-sm text-slate-200">
                      No candidates returned yet. Try regenerating after adding more applicants.
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {shortlistItems.map((item, idx) => {
                        const reasons = (item.topReasons || []).filter(Boolean).slice(0, 4);
                        return (
                          <div
                            key={item.applicationId || item.candidateId || idx}
                            className="rounded-xl border border-slate-800 bg-slate-900/70 p-4"
                          >
                            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                              <div className="flex items-center gap-3">
                                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-800 text-sm font-semibold text-slate-100">
                                  #{idx + 1}
                                </div>
                                <div>
                                  <Link
                                    href={`/org/${orgSlug}/hiring/candidates/${item.candidateId}`}
                                    className="text-base font-semibold text-white hover:text-indigo-300"
                                  >
                                    {item.name}
                                  </Link>
                                  <div className="text-xs text-slate-400">
                                    {item.email || "No email provided"}
                                  </div>
                                </div>
                              </div>
                              <div className="flex flex-wrap items-center gap-2">
                                <Badge
                                  variant="outline"
                                  className={`border px-3 py-1 text-[11px] ${fitScoreTone(item.fitScore)}`}
                                >
                                  Fit score {Math.round(item.fitScore)}
                                </Badge>
                                <Badge
                                  variant="outline"
                                  className={`border px-3 py-1 text-[11px] ${nextActionTone(item.nextAction)}`}
                                >
                                  Next: {item.nextAction}
                                </Badge>
                              </div>
                            </div>

                            <div className="mt-3 space-y-2">
                              <p className="text-xs font-semibold uppercase text-slate-400">
                                Top reasons
                              </p>
                              {reasons.length > 0 ? (
                                <ul className="grid gap-2 text-sm text-slate-100 md:grid-cols-2">
                                  {reasons.map((reason, rIdx) => (
                                    <li key={`${item.candidateId}-${rIdx}`} className="flex gap-2">
                                      <span className="mt-2 h-1.5 w-1.5 rounded-full bg-slate-500" />
                                      <span className="text-sm text-slate-100">{reason}</span>
                                    </li>
                                  ))}
                                </ul>
                              ) : (
                                <p className="text-xs text-slate-500">No reasons provided.</p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
          </PlanGate>
        </TabsContent>
        <TabsContent value="candidates" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="gap-2">
                  <Plus className="h-4 w-4" />
                  Add candidate
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add candidate</DialogTitle>
                </DialogHeader>
                <form className="space-y-3" onSubmit={handleAddCandidate}>
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <Label>First name</Label>
                      <Input
                        value={form.firstName}
                        onChange={(e) => setForm((p) => ({ ...p, firstName: e.target.value }))}
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <Label>Last name</Label>
                      <Input
                        value={form.lastName}
                        onChange={(e) => setForm((p) => ({ ...p, lastName: e.target.value }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-1">
                    <Label>LinkedIn URL (optional)</Label>
                    <Input
                      value={form.linkedInUrl}
                      onChange={(e) => setForm((p) => ({ ...p, linkedInUrl: e.target.value }))}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <Button type="button" variant="ghost" onClick={() => setDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={saving}>
                      {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add"}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {candidates.length >= 2 && (
            <Card className="border-slate-200 bg-white">
              <CardContent className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Ready to shortlist?</p>
                  <p className="text-xs text-slate-600">
                    Generate an AI shortlist to rank candidates by fit.
                  </p>
                </div>
                <Button
                  size="sm"
                  className="gap-2"
                  onClick={() => handleGenerateShortlist(false)}
                  disabled={shortlistLoading || !aiEligible || billingLoading}
                >
                  <Sparkles className="h-4 w-4" />
                  Generate shortlist
                </Button>
              </CardContent>
            </Card>
          )}

          {candidates.length === 0 ? (
            <Card className="border-dashed border-slate-200 bg-slate-50">
              <CardContent className="flex flex-col gap-3 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Add your first candidate</p>
                  <p className="text-xs text-slate-600">
                    Start your pipeline to see AI shortlists and summaries.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button size="sm" onClick={() => setDialogOpen(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add candidate
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={handleSeedDemoCandidates}
                  >
                    <Sparkles className="h-4 w-4 text-indigo-500" />
                    Seed 3 demo candidates
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-2 text-left">Name</th>
                    <th className="px-4 py-2 text-left">Email</th>
                    <th className="px-4 py-2 text-left">Stage</th>
                    <th className="px-4 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {candidates.map((cand) => {
                    const fullName = [cand.firstName, cand.lastName].filter(Boolean).join(" ");
                    const stage = cand.stage || DEFAULT_STAGE;
                    return (
                      <tr key={cand.id}>
                        <td className="px-4 py-2 font-medium text-slate-900">{fullName}</td>
                        <td className="px-4 py-2 text-slate-600">{cand.email}</td>
                        <td className="px-4 py-2">
                          <Select
                            value={stage}
                            onValueChange={(val) => handleStageChange(cand.applicationId, val)}
                            disabled={!cand.applicationId || stageUpdating[cand.applicationId]}
                          >
                            <SelectTrigger className="h-8 w-[150px] text-xs">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {STAGE_OPTIONS.map((s) => (
                                <SelectItem key={s} value={s}>
                                  {s}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="px-4 py-2 text-right">
                          <Link
                            href={`/org/${orgSlug}/hiring/candidates/${cand.id}`}
                            className="text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                          >
                            View
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
