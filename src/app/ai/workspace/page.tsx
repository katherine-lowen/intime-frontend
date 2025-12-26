"use client";

import { useEffect, useMemo, useState } from "react";
import { AIMessageCard } from "./components/AIMessageCard";
import { UserMessageBubble } from "./components/UserMessageBubble";
import { PremiumInput } from "./components/PremiumInput";
import { WorkforceSummaryCard } from "./components/cards/WorkforceSummaryCard";
import { PTOInsightsCard } from "./components/cards/PTOInsightsCard";
import { CandidateComparisonCard } from "./components/cards/CandidateComparisonCard";
import { PlanGate } from "@/components/PlanGate";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import api from "@/lib/api";
import { listTasks } from "@/lib/task-api";
import { unreadCount } from "@/lib/notifications-api";
import { listExpiringCerts } from "@/lib/learning-api";
import { listAnomalies } from "@/lib/payroll-api";
import { DelegationModal } from "@/components/ai/DelegationModal";
import { createDelegation } from "@/lib/delegations-api";
import { getOrgSignals, OrgSignal } from "@/lib/signals-api";

export type AIWorkspaceComponent = "workforce" | "pto" | "candidate" | "job" | "plan";

interface Message {
  id: string;
  type: "user" | "ai";
  content: string;
  component?: AIWorkspaceComponent;
}

type SignalRow = {
  key?: string;
  label: string;
  value: string | number;
  href?: string;
  trend?: string | number | null;
};

function normalizeKey(val?: string | null) {
  return (val ?? "").toString().toLowerCase().replace(/[^a-z0-9]/g, "");
}

function mergeSignals(base: SignalRow[], updates: OrgSignal[]) {
  const next = base.map((row) => {
    const match = updates.find((sig) => {
      const updateKey = normalizeKey(sig.key ?? sig.label ?? "");
      const rowKey = normalizeKey(row.key ?? row.label);
      return updateKey && updateKey === rowKey;
    });
    if (!match) return row;
    const trend = match.trend ?? match.delta ?? match.change ?? null;
    return {
      ...row,
      label: match.label ?? row.label,
      value: match.value ?? row.value ?? "—",
      trend: trend ?? row.trend,
      href: match.href ?? row.href,
    };
  });

  const unmatched = updates.filter((sig) => {
    const updateKey = normalizeKey(sig.key ?? sig.label ?? "");
    return !base.some((row) => normalizeKey(row.key ?? row.label) === updateKey);
  });

  const extras = unmatched
    .map<SignalRow>((sig) => ({
      key: (sig.key ?? sig.label ?? undefined) || undefined,
      label: (sig.label ?? sig.key ?? "Signal") as string,
      value: sig.value ?? "—",
      trend: sig.trend ?? sig.delta ?? sig.change ?? null,
      href: sig.href ?? undefined,
    }))
    .slice(0, Math.max(0, 6 - next.length));

  return [...next, ...extras].slice(0, 6);
}

function pickComponentFromReply(reply: string): AIWorkspaceComponent | undefined {
  const t = reply.toLowerCase();
  if (t.includes("headcount") || t.includes("workforce") || t.includes("org chart")) return "workforce";
  if (t.includes("pto") || t.includes("time off")) return "pto";
  if (t.includes("candidate") || t.includes("pipeline") || t.includes("interview")) return "candidate";
  return undefined;
}

export default function AIWorkspacePage() {
  const { orgId, orgSlug, orgName } = useCurrentOrg();
  const slug = orgSlug ?? "";

  const baseSignals = useMemo<SignalRow[]>(
    () => [
      { key: "headcount", label: "Headcount", value: "—", href: `/org/${slug}/people` },
      { key: "openRoles", label: "Open roles", value: "—", href: `/org/${slug}/hiring` },
      { key: "tasks", label: "Open tasks", value: "—", href: `/org/${slug}/tasks` },
      { key: "notifications", label: "Unread notifications", value: "—", href: `/org/${slug}/notifications` },
      { key: "expiringCerts", label: "Expiring certs", value: "—", href: `/org/${slug}/learning/compliance` },
      { key: "anomalies", label: "Payroll anomalies", value: "—", href: `/org/${slug}/payroll/intelligence` },
    ],
    [slug]
  );

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      type: "ai",
      content:
        "Hello! I'm your **AI Workspace**. I can help you analyze your workforce, evaluate candidates, draft job descriptions, track PTO, and generate strategic plans.\n\nWhat would you like to explore today?",
    },
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [preset, setPreset] = useState<string | undefined>(undefined);
  const [signals, setSignals] = useState<SignalRow[]>(baseSignals);

  useEffect(() => {
    setSignals(baseSignals);
  }, [baseSignals]);

  const effectiveOrgName = useMemo(() => orgName ?? orgSlug ?? "your organization", [orgName, orgSlug]);

  const renderMessageComponent = (component?: AIWorkspaceComponent) => {
    switch (component) {
      case "workforce":
        return <WorkforceSummaryCard />;
      case "pto":
        return <PTOInsightsCard />;
      case "candidate":
        return <CandidateComparisonCard />;
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!slug) return;
    let cancelled = false;
    async function loadSignals() {
      try {
        const [apiSignals, tasks, notifs, certs, anomalies] = await Promise.allSettled([
          getOrgSignals(slug),
          listTasks(slug, { status: "OPEN" }),
          unreadCount(slug),
          listExpiringCerts(slug),
          listAnomalies(slug),
        ]);
        if (cancelled) return;

        const fetchedSignals = apiSignals.status === "fulfilled" ? apiSignals.value : [];
        const fallbackSignals: OrgSignal[] = [];

        if (tasks.status === "fulfilled" && Array.isArray(tasks.value)) {
          fallbackSignals.push({ key: "tasks", label: "Open tasks", value: tasks.value.length });
        }
        if (notifs.status === "fulfilled" && typeof notifs.value === "number") {
          fallbackSignals.push({ key: "notifications", label: "Unread notifications", value: notifs.value });
        }
        if (certs.status === "fulfilled" && Array.isArray(certs.value)) {
          fallbackSignals.push({ key: "expiringCerts", label: "Expiring certs", value: certs.value.length });
        }
        if (anomalies.status === "fulfilled" && Array.isArray(anomalies.value)) {
          fallbackSignals.push({ key: "anomalies", label: "Payroll anomalies", value: anomalies.value.length });
        }

        const merged = mergeSignals(baseSignals, fetchedSignals);
        const withFallback = mergeSignals(merged, fallbackSignals);
        setSignals(withFallback);
      } catch {
        if (!cancelled) setSignals((prev) => prev);
      }
    }
    void loadSignals();
    return () => {
      cancelled = true;
    };
  }, [slug, baseSignals]);

  const handleSendMessage = async (content: string) => {
    if (!content.trim() || isLoading) return;

    const id = Date.now().toString();
    const userMessage: Message = { id, type: "user", content };
    setMessages((prev) => [...prev, userMessage]);
    setIsLoading(true);

    try {
      const body = {
        message: content,
        orgSlug,
        orgId,
        orgContext: {
          orgId,
          orgSlug,
          orgName: effectiveOrgName,
        },
      };
      const res = orgId
        ? ((await api.post(`/orgs/${orgId}/ai/workspace/chat`, body)) as any)
        : ((await api.post("/api/ai/workspace", body)) as any);

      const data = (res?.data ?? {}) as { reply?: string; component?: AIWorkspaceComponent };
      const reply =
        data.reply ??
        "I received your message, but the AI service didn’t return a response. Please try again.";

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "ai",
        content: reply,
        component: data.component ?? pickComponentFromReply(reply),
      };
      setMessages((prev) => [...prev, aiMessage]);
    } catch (err: any) {
      const status = err?.response?.status;
      const msg =
        status === 404
          ? "⚠️ AI Workspace endpoint isn’t live yet. Implement `POST /orgs/:orgId/ai/workspace/chat` on the backend."
          : status === 401 || status === 403
          ? "⚠️ You don’t have access to AI Workspace in this organization."
          : "⚠️ I couldn’t reach the AI service. Please check your backend and try again shortly.";
      setMessages((prev) => [...prev, { id: (Date.now() + 1).toString(), type: "ai", content: msg }]);
    } finally {
      setIsLoading(false);
    }
  };

  const signalLookup = useMemo(() => {
    const map = new Map<string, SignalRow>();
    signals.forEach((row) => {
      map.set(normalizeKey(row.key ?? row.label), row);
    });
    return map;
  }, [signals]);

  const signalValue = (key: string) => {
    const row = signalLookup.get(normalizeKey(key));
    const val = row?.value;
    if (val === undefined || val === null || val === "—") return null;
    return val;
  };

  const quickActions = useMemo(
    () => {
      const headcount = signalValue("headcount");
      const openRoles = signalValue("openRoles");
      const tasks = signalValue("tasks");
      const expiring = signalValue("expiringCerts");
      const anomalies = signalValue("anomalies");

      const workforcePrompt = `Give me an executive workforce summary${
        headcount ? ` for ${headcount} people` : ""
      }${openRoles ? ` with ${openRoles} open roles` : ""}. Highlight risks, attrition, and hiring needs.`;

      const jdPrompt = `Draft a sharp job description for the highest-priority open role${
        openRoles ? ` across ${openRoles} open roles` : ""
      }, including responsibilities, requirements, and a 30/60/90 expectation.`;

      const taskPrompt = `Triage my org with the top 5 actions${
        tasks ? ` from ${tasks} open tasks` : ""
      }${anomalies ? ` and ${anomalies} payroll anomalies` : ""}. Include owners and due dates.`;

      const compliancePrompt = `Check learning compliance${
        expiring ? ` with ${expiring} expiring certifications` : ""
      } and list who needs reminders or reassignment.`;

      const compareCandidatesPrompt =
        "Compare the leading candidates in our hiring pipeline and explain who should advance, with rationale.";

      const onboardingPrompt =
        "Create a 30-60-90 plan for a new manager, with clear outcomes, stakeholders, and metrics.";

      return [
        { label: "Summarize workforce", hint: "Headcount, risks, priorities", prompt: workforcePrompt },
        { label: "Draft a JD", hint: "Role scope & 30/60/90", prompt: jdPrompt },
        { label: "Compare candidates", hint: "Pipeline clarity", prompt: compareCandidatesPrompt },
        { label: "Compliance pulse", hint: "Expiring certs", prompt: compliancePrompt },
        { label: "Task triage", hint: "Top 5 actions", prompt: taskPrompt },
        { label: "Generate 30-60-90", hint: "New hire ramp", prompt: onboardingPrompt },
      ];
    },
    [signalLookup]
  );

  const delegationPresets = [
    { title: "Daily hiring health", scope: "Hiring", cadence: "Daily", policy: "Check pipeline drop-offs and flag top risks." },
    { title: "Weekly learning compliance", scope: "Learning", cadence: "Weekly", policy: "Find overdue assignments and notify owners." },
    { title: "Payroll variance scan", scope: "Payroll", cadence: "Weekly", policy: "Detect anomalies in pay changes and alert finance." },
  ];
  const [delegationModal, setDelegationModal] = useState<{ open: boolean; preset?: any }>({
    open: false,
  });

  const recentUser = messages.filter((m) => m.type === "user").slice(-3).reverse();

  if (!slug) {
    return (
      <PlanGate>
        <div className="min-h-screen bg-[#0a0a0f] px-6 py-10 text-slate-100">
          <div className="mx-auto max-w-3xl rounded-2xl border border-white/10 bg-white/5 p-6 text-center shadow-lg shadow-black/30">
            <h1 className="text-xl font-semibold text-white">Select an organization</h1>
            <p className="mt-2 text-sm text-white/70">
              Choose an organization to use AI Workspace.
            </p>
          </div>
        </div>
      </PlanGate>
    );
  }

  return (
    <PlanGate>
      <div className="min-h-screen bg-[#0a0a0f] text-slate-100">
        <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-6 lg:flex-row">
          {/* Main */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-gradient-to-r from-white/5 to-white/0 px-4 py-3 shadow-lg shadow-indigo-900/20">
              <div>
                <p className="text-xs uppercase tracking-wide text-white/50">AI Workspace</p>
                <h1 className="text-xl font-semibold text-white">Executive command center</h1>
                <p className="text-sm text-white/60">Ask about headcount, hiring, PTO, payroll, learning.</p>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/70">
                <span className="rounded-full border border-white/15 bg-white/5 px-3 py-1">
                  Org: {orgName || orgSlug || "Select org"}
                </span>
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/30">
              <div className="border-b border-white/5 bg-gradient-to-r from-indigo-900/30 to-transparent px-5 py-3">
                <div className="flex items-center justify-between text-sm text-white/70">
                  <span>Conversation</span>
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-indigo-100">
                    Live
                  </span>
                </div>
              </div>
              <div className="flex max-h-[calc(100vh-280px)] flex-col overflow-hidden">
                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-6">
                  {messages.map((msg) =>
                    msg.type === "user" ? (
                      <UserMessageBubble key={msg.id} content={msg.content} />
                    ) : (
                      <AIMessageCard key={msg.id} content={msg.content}>
                        {renderMessageComponent(msg.component)}
                      </AIMessageCard>
                    )
                  )}
                  {isLoading && <AIMessageCard content="Thinking about your workspace…" />}
                  <div className="pb-10" />
                </div>
                <div className="border-t border-white/10 bg-[#0c0c12] px-4 py-3">
                  <PremiumInput onSend={handleSendMessage} preset={preset} />
                </div>
              </div>
            </div>
          </div>

          {/* Right rail */}
          <div className="w-full space-y-4 lg:w-[340px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/30">
              <div className="px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Org signals</p>
                <p className="text-sm font-semibold text-white">Live snapshot</p>
              </div>
              <div className="space-y-2 px-4 pb-4">
                {signals.map((row) => {
                  const trendText =
                    row.trend == null
                      ? null
                      : typeof row.trend === "number"
                      ? `${row.trend > 0 ? "+" : ""}${row.trend}`
                      : row.trend;
                  const trendPositive =
                    typeof row.trend === "number"
                      ? row.trend >= 0
                      : trendText?.toString().trim().startsWith("+");
                  const content = (
                    <div className="flex items-center justify-between gap-3 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white/80 hover:border-indigo-400/40 hover:bg-indigo-900/30">
                      <span className="text-xs uppercase tracking-wide text-white/60">{row.label}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">{row.value ?? "—"}</span>
                        {trendText ? (
                          <span
                            className={`text-[11px] ${
                              trendPositive ? "text-emerald-300" : "text-rose-300"
                            }`}
                          >
                            {trendText}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  );

                  return row.href ? (
                    <a key={row.label} href={row.href} className="block">
                      {content}
                    </a>
                  ) : (
                    <div key={row.label}>{content}</div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/30">
              <div className="px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Quick actions</p>
                <p className="text-sm font-semibold text-white">Jumpstart a prompt</p>
              </div>
              <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                {quickActions.map((action) => (
                  <button
                    key={action.label}
                    onClick={() => setPreset(action.prompt)}
                    className="rounded-xl border border-white/10 bg-white/5 px-3 py-3 text-left text-xs text-white/80 transition hover:-translate-y-0.5 hover:border-indigo-400/40 hover:bg-indigo-900/30 hover:text-white"
                  >
                    <div className="text-sm font-semibold text-white">{action.label}</div>
                    <div className="text-[11px] text-white/60">{action.hint}</div>
                  </button>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/30">
              <div className="px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-white/50">Delegations</p>
                <p className="text-sm font-semibold text-white">Automate this</p>
              </div>
              <div className="space-y-2 px-4 pb-4">
                {delegationPresets.map((d) => (
                  <button
                    key={d.title}
                    onClick={() => setDelegationModal({ open: true, preset: d })}
                    className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/80 hover:border-indigo-400/40 hover:bg-indigo-900/30"
                  >
                    <div className="text-sm font-semibold text-white">{d.title}</div>
                    <div className="text-[11px] text-white/60">
                      {d.scope} · {d.cadence}
                    </div>
                    <div className="text-[11px] text-white/60">{d.policy}</div>
                  </button>
                ))}
              </div>
            </div>

            {recentUser.length ? (
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] shadow-lg shadow-black/30">
                <div className="px-4 py-3">
                  <p className="text-xs uppercase tracking-wide text-white/50">Recent prompts</p>
                </div>
                <div className="space-y-2 px-4 pb-4">
                  {recentUser.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => setPreset(m.content)}
                      className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-left text-xs text-white/80 hover:border-indigo-400/40 hover:bg-indigo-900/30"
                    >
                      {m.content}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <DelegationModal
        orgSlug={slug}
        open={delegationModal.open}
        onClose={() => setDelegationModal({ open: false })}
        initial={
          delegationModal.preset
            ? {
                title: delegationModal.preset.title,
                scope: delegationModal.preset.scope,
                cadence: delegationModal.preset.cadence,
                policy: delegationModal.preset.policy,
              }
            : undefined
        }
        onSave={async (data) => {
          await createDelegation(slug, data);
        }}
      />
    </PlanGate>
  );
}
