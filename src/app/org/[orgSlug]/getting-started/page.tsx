"use client";

import { use, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import api from "@/lib/api";

type Basics = { name: string; website?: string; headcountRange?: string; industry?: string };
type Team = { departments?: string; location?: string; managers?: string };
type Invite = { email: string; role: string };

type StepKey = "basics" | "team" | "invites";
type StepMeta = { key: StepKey; title: string; description: string; optional?: boolean };

const STEPS: StepMeta[] = [
  {
    key: "basics",
    title: "Workspace basics",
    description: "Name and brand your org so invites feel polished.",
  },
  {
    key: "team",
    title: "Team structure",
    description: "Departments and locations help unlock smart defaults.",
    optional: true,
  },
  {
    key: "invites",
    title: "Invite teammates",
    description: "Bring your team in and assign roles.",
    optional: true,
  },
];

export default function GettingStartedWizard({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = use(params);
  return <WizardClient orgSlug={orgSlug} />;
}

function WizardClient({ orgSlug }: { orgSlug: string }) {
  const router = useRouter();
  const [step, setStep] = useState<StepKey>("basics");
  const [basics, setBasics] = useState<Basics>({ name: "" });
  const [team, setTeam] = useState<Team>({});
  const [invites, setInvites] = useState<Invite[]>([]);
  const [completion, setCompletion] = useState<Record<StepKey, boolean>>({
    basics: false,
    team: false,
    invites: false,
  });
  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<StepKey | "finish" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await api.get<any>(`/orgs/${orgSlug}/onboarding`);
        if (cancelled) return;
        const saved = res || {};
        if (saved?.basics) setBasics((prev) => ({ ...prev, ...saved.basics }));
        if (saved?.team) setTeam((prev) => ({ ...prev, ...saved.team }));
        if (Array.isArray(saved?.invites)) setInvites(saved.invites);

        const basicsDone = Boolean(saved?.basics?.name);
        const teamDone =
          Boolean(saved?.team?.departments) ||
          Boolean(saved?.team?.location) ||
          Boolean(saved?.team?.managers) ||
          Boolean(saved?.teamComplete);
        const invitesDone =
          Boolean(saved?.invitesComplete) ||
          (Array.isArray(saved?.invites) && saved.invites.length > 0);

        const computedCompletion: Record<StepKey, boolean> = {
          basics: basicsDone,
          team: teamDone,
          invites: invitesDone,
        };
        setCompletion(computedCompletion);

        const firstIncomplete =
          (saved?.progress?.firstIncompleteStep as StepKey | undefined) ||
          STEPS.find((s) => !computedCompletion[s.key])?.key ||
          "invites";
        setStep(firstIncomplete);
      } catch (err: any) {
        setError(err?.message || "Unable to load onboarding");
        setRequestId(err?.requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug]);

  const completedCount = useMemo(
    () => Object.values(completion).filter(Boolean).length,
    [completion]
  );
  const currentIndex = STEPS.findIndex((s) => s.key === step);
  const percent = useMemo(() => {
    const savedPct = Math.round((completedCount / STEPS.length) * 100);
    const viewedPct = Math.round((Math.max(currentIndex, 0) / STEPS.length) * 100);
    return Math.min(100, Math.max(savedPct, viewedPct));
  }, [completedCount, currentIndex]);

  const markSaved = (key: StepKey) => {
    setCompletion((prev) => ({ ...prev, [key]: true }));
    setLastSaved(new Date());
  };

  const saveBasics = useCallback(
    async (advance = false) => {
      if (!basics.name.trim()) return;
      setSavingKey("basics");
      try {
        await api.post(`/orgs/${orgSlug}/onboarding/basics`, basics);
        markSaved("basics");
        if (advance) setStep("team");
      } catch (err: any) {
        setError(err?.message || "Unable to save basics");
        setRequestId(err?.requestId || null);
      } finally {
        setSavingKey(null);
      }
    },
    [basics, orgSlug]
  );

  const saveTeam = useCallback(
    async (advance = false) => {
      const hasContent =
        Boolean(team.departments?.trim()) ||
        Boolean(team.location?.trim()) ||
        Boolean(team.managers?.trim());
      if (!hasContent && !advance) return;
      setSavingKey("team");
      try {
        await api.post(`/orgs/${orgSlug}/onboarding/team`, team);
        markSaved("team");
        if (advance) setStep("invites");
      } catch (err: any) {
        setError(err?.message || "Unable to save team");
        setRequestId(err?.requestId || null);
      } finally {
        setSavingKey(null);
      }
    },
    [orgSlug, team]
  );

  const finishOnboarding = useCallback(async () => {
    setSavingKey("finish");
    try {
      toast.success("Welcome to Intime — you're in.");
      router.replace(`/org/${orgSlug}/home`);
    } finally {
      setSavingKey(null);
    }
  }, [orgSlug, router]);

  const saveInvites = useCallback(
    async (advanceToFinish = false) => {
      const filtered = invites.filter((i) => i.email.trim());
      setSavingKey("invites");
      try {
        await api.post(`/orgs/${orgSlug}/onboarding/invites`, { invites: filtered });
        markSaved("invites");
        if (advanceToFinish) {
          await finishOnboarding();
        }
      } catch (err: any) {
        setError(err?.message || "Unable to save invites");
        setRequestId(err?.requestId || null);
      } finally {
        setSavingKey(null);
      }
    },
    [invites, orgSlug, finishOnboarding]
  );

  const addInviteRow = () =>
    setInvites((prev) => [...prev, { email: "", role: "EMPLOYEE" }]);
  const updateInvite = (idx: number, field: keyof Invite, value: string) =>
    setInvites((prev) =>
      prev.map((inv, i) => (i === idx ? { ...inv, [field]: value } : inv))
    );

  if (!orgSlug) {
    return <SupportErrorCard title="Onboarding" message="Organization not found" />;
  }

  const currentStep = STEPS.find((s) => s.key === step) ?? STEPS[0];

  return (
    <main className="mx-auto max-w-6xl space-y-6 px-4 py-10">
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white/70 p-5 shadow-sm backdrop-blur">
        <div className="flex flex-col items-start justify-between gap-3 md:flex-row md:items-center">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-slate-500">Onboarding</p>
            <h1 className="text-2xl font-semibold text-slate-900">Finish setting up Intime</h1>
            <p className="text-sm text-slate-600">
              Three quick steps. We auto-save as you move.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-48">
              <Progress value={percent} />
              <p className="mt-1 text-right text-[11px] text-slate-500">{percent}% complete</p>
            </div>
            <Badge variant="secondary" className="rounded-full border border-slate-200 bg-slate-50 text-slate-700">
              {lastSaved
                ? `Saved ${lastSaved.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                : "Autosaves enabled"}
            </Badge>
          </div>
        </div>
      </div>

      {error ? (
        <SupportErrorCard title="Onboarding" message={error} requestId={requestId} />
      ) : null}

      <div className="grid gap-6 lg:grid-cols-3">
        <section className="space-y-4 lg:col-span-2">
          <Card className="border-slate-200">
            <CardHeader className="flex flex-col gap-2 border-b border-slate-100/80 bg-slate-50/60 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className="rounded-full">
                    Step {currentIndex + 1} of {STEPS.length}
                  </Badge>
                  {currentStep.optional ? (
                    <Badge variant="secondary" className="rounded-full bg-indigo-50 text-indigo-700">
                      Optional
                    </Badge>
                  ) : null}
                </div>
                <CardTitle className="text-lg font-semibold text-slate-900">{currentStep.title}</CardTitle>
                <p className="text-sm text-slate-600">{currentStep.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {currentIndex > 0 ? (
                  <Button variant="ghost" size="sm" onClick={() => setStep(STEPS[currentIndex - 1].key)}>
                    Back
                  </Button>
                ) : null}
                {currentStep.optional && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      markSaved(currentStep.key);
                      const next = STEPS[currentIndex + 1];
                      if (next) setStep(next.key);
                      else void finishOnboarding();
                    }}
                  >
                    Skip for now
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-5">
              {loading ? (
                <p className="text-sm text-slate-600">Loading your details…</p>
              ) : null}

              {currentStep.key === "basics" ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2 sm:col-span-2">
                    <label className="text-xs font-medium text-slate-600">Organization name</label>
                    <Input
                      value={basics.name}
                      onChange={(e) => setBasics((p) => ({ ...p, name: e.target.value }))}
                      onBlur={() => void saveBasics(false)}
                      placeholder="Intime"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Website</label>
                    <Input
                      value={basics.website || ""}
                      onChange={(e) => setBasics((p) => ({ ...p, website: e.target.value }))}
                      onBlur={() => void saveBasics(false)}
                      placeholder="https://company.com"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Headcount range</label>
                    <Input
                      value={basics.headcountRange || ""}
                      onChange={(e) => setBasics((p) => ({ ...p, headcountRange: e.target.value }))}
                      onBlur={() => void saveBasics(false)}
                      placeholder="11-50"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Industry</label>
                    <Input
                      value={basics.industry || ""}
                      onChange={(e) => setBasics((p) => ({ ...p, industry: e.target.value }))}
                      onBlur={() => void saveBasics(false)}
                      placeholder="Software"
                    />
                  </div>
                  <div className="flex items-center justify-end gap-2 sm:col-span-2">
                    <Button
                      onClick={() => void saveBasics(true)}
                      disabled={savingKey === "basics" || !basics.name.trim()}
                    >
                      Continue
                    </Button>
                  </div>
                </div>
              ) : null}

              {currentStep.key === "team" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-600">Departments</label>
                    <Textarea
                      value={team.departments || ""}
                      onChange={(e) => setTeam((p) => ({ ...p, departments: e.target.value }))}
                      onBlur={() => void saveTeam(false)}
                      placeholder="e.g. Engineering, Sales, People"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Default location</label>
                      <Input
                        value={team.location || ""}
                        onChange={(e) => setTeam((p) => ({ ...p, location: e.target.value }))}
                        onBlur={() => void saveTeam(false)}
                        placeholder="HQ city or region"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-600">Managers (optional)</label>
                      <Input
                        value={team.managers || ""}
                        onChange={(e) => setTeam((p) => ({ ...p, managers: e.target.value }))}
                        onBlur={() => void saveTeam(false)}
                        placeholder="Add names or emails"
                      />
                    </div>
                  </div>
                  <div className="flex items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        markSaved("team");
                        setStep("invites");
                      }}
                    >
                      Skip for now
                    </Button>
                    <Button onClick={() => void saveTeam(true)} disabled={savingKey === "team"}>
                      Continue
                    </Button>
                  </div>
                </div>
              ) : null}

              {currentStep.key === "invites" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Invite teammates</p>
                      <p className="text-xs text-slate-600">We&apos;ll send them a welcome email.</p>
                    </div>
                    <Button size="sm" variant="outline" onClick={addInviteRow}>
                      Add invite
                    </Button>
                  </div>
                  {invites.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-600">
                      Add a couple of teammates to kick things off.
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {invites.map((inv, idx) => (
                        <div
                          key={idx}
                          className="grid gap-2 rounded-lg border border-slate-200 bg-slate-50 p-3 sm:grid-cols-2"
                        >
                          <Input
                            placeholder="email@company.com"
                            value={inv.email}
                            onChange={(e) => updateInvite(idx, "email", e.target.value)}
                            onBlur={() => void saveInvites(false)}
                          />
                          <Input
                            placeholder="Role (OWNER/ADMIN/MANAGER/EMPLOYEE)"
                            value={inv.role}
                            onChange={(e) => updateInvite(idx, "role", e.target.value.toUpperCase())}
                            onBlur={() => void saveInvites(false)}
                          />
                        </div>
                      ))}
                    </div>
                  )}
                  <div className="flex flex-wrap items-center justify-end gap-2">
                    <Button
                      variant="ghost"
                      onClick={() => {
                        markSaved("invites");
                        void finishOnboarding();
                      }}
                    >
                      Skip for now
                    </Button>
                    <Button
                      onClick={() => void saveInvites(true)}
                      disabled={savingKey === "invites" || invites.some((i) => !i.email.trim())}
                    >
                      Finish & go to home
                    </Button>
                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <aside className="space-y-4">
          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900">Steps</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {STEPS.map((s, idx) => {
                const isCurrent = s.key === currentStep.key;
                const isComplete = completion[s.key];
                return (
                  <button
                    key={s.key}
                    className={`flex w-full items-center justify-between rounded-lg border px-3 py-3 text-left transition ${
                      isCurrent
                        ? "border-indigo-200 bg-indigo-50 text-indigo-900 shadow-sm"
                        : "border-slate-200 hover:border-indigo-200 hover:bg-slate-50"
                    }`}
                    onClick={() => setStep(s.key)}
                  >
                    <div>
                      <p className="text-sm font-medium">
                        {idx + 1}. {s.title}
                      </p>
                      <p className="text-[11px] text-slate-600">{s.description}</p>
                    </div>
                    <Badge variant={isComplete ? "default" : "outline"} className="shrink-0 rounded-full">
                      {isComplete ? "Done" : isCurrent ? "In progress" : "Pending"}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          <Card className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-sm font-semibold text-slate-900">What to expect</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-slate-600">
              <p>Autosave keeps changes, so you can move quickly.</p>
              <p>We&apos;ll direct you to Home once you finish — no dead ends.</p>
              <p>Need help? Email support@hireintime.ai anytime.</p>
            </CardContent>
          </Card>
        </aside>
      </div>
    </main>
  );
}
