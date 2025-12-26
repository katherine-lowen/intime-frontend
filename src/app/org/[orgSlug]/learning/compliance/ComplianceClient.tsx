"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { AlertTriangle, CheckCircle2, ClipboardList, Flame, Loader2, ShieldAlert } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import {
  getComplianceRisk,
  listExpiringCerts,
  listOverdueCerts,
  listAttestations,
  generateComplianceTasks,
} from "@/lib/learning-api";
import { DecisionCreateDialog } from "@/components/intelligence/DecisionCreateDialog";
import { toast } from "sonner";

type Risk = {
  id: string;
  title?: string | null;
  summary?: string | null;
  severity?: string | null;
  score?: number | null;
  actionUrl?: string | null;
  employeeId?: string | null;
  employeeName?: string | null;
  courseId?: string | null;
  courseName?: string | null;
  recommendationKey?: string | null;
};

type ItemRow = {
  id: string;
  employee?: string | null;
  course?: string | null;
  expiresAt?: string | null;
  dueDate?: string | null;
  status?: string | null;
  risk?: number | null;
  actionUrl?: string | null;
};

export default function ComplianceClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);

  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [topRisks, setTopRisks] = useState<Risk[]>([]);
  const [expiring, setExpiring] = useState<ItemRow[]>([]);
  const [overdue, setOverdue] = useState<ItemRow[]>([]);
  const [attestations, setAttestations] = useState<ItemRow[]>([]);
  const [tab, setTab] = useState<"expiring" | "overdue" | "attestations">("expiring");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [decisionDefaults, setDecisionDefaults] = useState<any | null>(null);

  useEffect(() => {
    if (!isGrowth) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const [risk, exp, ov, att] = await Promise.all([
          getComplianceRisk(orgSlug),
          listExpiringCerts(orgSlug),
          listOverdueCerts(orgSlug),
          listAttestations(orgSlug),
        ]);
        if (cancelled) return;
        setRiskScore(typeof risk?.riskScore === "number" ? risk.riskScore : risk?.score ?? null);
        const risks = Array.isArray(risk?.risks)
          ? (risk.risks as any[])
          : Array.isArray(risk?.data)
          ? (risk.data as any[])
          : [];
        setTopRisks(
          risks
            .slice(0, 3)
            .map((r, idx) => ({
              id: r?.id ?? `risk-${idx}`,
              title: r?.title ?? r?.summary ?? "Compliance risk",
              summary: r?.summary ?? r?.description ?? null,
              severity: r?.severity ?? r?.level ?? null,
              score: r?.score ?? r?.riskScore ?? null,
              actionUrl: r?.actionUrl ?? r?.href ?? null,
              employeeId: r?.employeeId ?? null,
              employeeName: r?.employeeName ?? r?.employee ?? null,
              courseId: r?.courseId ?? null,
              courseName: r?.courseName ?? r?.course ?? null,
              recommendationKey: r?.recommendationKey ?? null,
            }))
        );
        setExpiring(((exp as any[]) || []).map(toRow));
        setOverdue(((ov as any[]) || []).map(toRow));
        setAttestations(((att as any[]) || []).map(toRow));
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load compliance");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, isGrowth]);

  const toRow = (row: any): ItemRow => ({
    id: row?.id ?? row?.assignmentId ?? row?.certId ?? Math.random().toString(36).slice(2),
    employee: row?.employeeName ?? row?.employee ?? row?.user ?? null,
    course: row?.courseName ?? row?.course ?? row?.learningItem ?? null,
    expiresAt: row?.expiresAt ?? null,
    dueDate: row?.dueDate ?? row?.due ?? null,
    status: row?.status ?? null,
    risk: typeof row?.riskScore === "number" ? row.riskScore : null,
    actionUrl: row?.href ?? row?.actionUrl ?? null,
  });

  const riskBadge = useMemo(() => {
    if (riskScore == null) return { label: "Unknown", tone: "bg-slate-100 text-slate-800" };
    if (riskScore >= 80) return { label: "High risk", tone: "bg-rose-100 text-rose-800" };
    if (riskScore >= 50) return { label: "Medium", tone: "bg-amber-100 text-amber-800" };
    return { label: "Low", tone: "bg-emerald-100 text-emerald-800" };
  }, [riskScore]);

  const generateTasks = async () => {
    try {
      await generateComplianceTasks(orgSlug);
      toast.success("Tasks generated from compliance risk");
      window.dispatchEvent(new Event("tasks:updated"));
    } catch (err: any) {
      if (!handlePlanError(err)) {
        toast.error(err?.message || "Unable to generate tasks");
      }
    }
  };

  if (!isGrowth) {
    return (
      <div className="space-y-3">
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
          Compliance risk is available on Growth and Scale. Upgrade to unlock risk scoring and automation.
        </div>
        {upgradeModal}
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {upgradeModal}
      {error ? <SupportErrorCard title="Compliance" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200 bg-gradient-to-r from-rose-50 to-white">
        <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-wide text-rose-500">Compliance risk</p>
            <CardTitle className="text-xl text-slate-900">Executives can see risk in seconds</CardTitle>
            <p className="text-sm text-slate-600">Risk score and the top signals to act on now.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`rounded-full px-3 py-2 text-sm font-semibold ${riskBadge.tone}`}>
              Risk {riskScore != null ? riskScore : "—"} ({riskBadge.label})
            </div>
            <Button variant="outline" size="sm" onClick={() => void generateTasks()}>
              Generate tasks
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-3">
          {topRisks.length === 0 ? (
            <div className="col-span-3 rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
              No high risks detected yet.
            </div>
          ) : (
            topRisks.map((risk) => (
              <div
                key={risk.id}
                className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <ShieldAlert className="h-4 w-4 text-rose-500" />
                  {risk.title}
                </div>
                {risk.summary ? <p className="mt-2 text-sm text-slate-600">{risk.summary}</p> : null}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
                  {risk.severity ? (
                    <Badge variant="secondary" className="text-[11px]">
                      {risk.severity}
                    </Badge>
                  ) : null}
                  {risk.courseName ? <span>{risk.courseName}</span> : null}
                  {risk.employeeName ? <span>{risk.employeeName}</span> : null}
                </div>
                <div className="mt-3 flex flex-wrap gap-2">
                  {risk.actionUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={risk.actionUrl}>Open</Link>
                    </Button>
                  ) : null}
                  <Button
                    size="sm"
                    onClick={() =>
                      setDecisionDefaults({
                        title: risk.title,
                        category: "COMPLIANCE",
                        sourceType: "COMPLIANCE_RISK",
                        sourceId: risk.id,
                        related: risk.actionUrl,
                        recommendationKey: risk.recommendationKey,
                      })
                    }
                  >
                    Create decision
                  </Button>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      <Tabs value={tab} onValueChange={(v) => setTab(v as any)}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="expiring">Expiring soon</TabsTrigger>
            <TabsTrigger value="overdue">Overdue</TabsTrigger>
            <TabsTrigger value="attestations">Attestations</TabsTrigger>
          </TabsList>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Flame className="h-4 w-4 text-rose-500" />
            Act on these before they become incidents.
          </div>
        </div>

        <TabsContent value="expiring">
          <RiskTable
            rows={expiring}
            empty="No expiring certifications."
            orgSlug={orgSlug}
            onDecision={(row) =>
              setDecisionDefaults({
                title: `Expiring: ${row.course || "Certification"}`,
                category: "COMPLIANCE",
                sourceType: "CERT_EXPIRING",
                sourceId: row.id,
                related: row.actionUrl,
              })
            }
          />
        </TabsContent>
        <TabsContent value="overdue">
          <RiskTable
            rows={overdue}
            empty="No overdue certifications."
            orgSlug={orgSlug}
            highlight
            onDecision={(row) =>
              setDecisionDefaults({
                title: `Overdue: ${row.course || "Certification"}`,
                category: "COMPLIANCE",
                sourceType: "CERT_OVERDUE",
                sourceId: row.id,
                related: row.actionUrl,
              })
            }
          />
        </TabsContent>
        <TabsContent value="attestations">
          <RiskTable
            rows={attestations}
            empty="No pending attestations."
            orgSlug={orgSlug}
            onDecision={(row) =>
              setDecisionDefaults({
                title: `Attestation: ${row.course || "Compliance"}`,
                category: "COMPLIANCE",
                sourceType: "ATTESTATION",
                sourceId: row.id,
                related: row.actionUrl,
              })
            }
          />
        </TabsContent>
      </Tabs>

      {decisionDefaults ? (
        <DecisionCreateDialog
          hideTrigger
          open
          defaults={decisionDefaults}
          orgSlug={orgSlug}
          onOpenChange={(open) => !open && setDecisionDefaults(null)}
          onCreated={() => setDecisionDefaults(null)}
        />
      ) : null}

      {loading ? (
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading compliance…
        </div>
      ) : null}
    </div>
  );
}

function RiskTable({
  rows,
  empty,
  orgSlug,
  highlight,
  onDecision,
}: {
  rows: ItemRow[];
  empty: string;
  orgSlug: string;
  highlight?: boolean;
  onDecision: (row: ItemRow) => void;
}) {
  if (!rows.length) {
    return (
      <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
        {empty}
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-3 py-2">Employee</th>
            <th className="px-3 py-2">Course</th>
            <th className="px-3 py-2">Due / Expires</th>
            <th className="px-3 py-2">Status</th>
            <th className="px-3 py-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {rows.map((row) => (
            <tr key={row.id} className="hover:bg-slate-50">
              <td className="px-3 py-2 text-xs text-slate-700">{row.employee || "—"}</td>
              <td className="px-3 py-2 text-xs text-slate-700">{row.course || "—"}</td>
              <td className="px-3 py-2 text-xs text-slate-600">{row.dueDate || row.expiresAt || "—"}</td>
              <td className="px-3 py-2 text-xs text-slate-600">
                {row.status ? (
                  <Badge variant={highlight ? "destructive" : "secondary"} className="text-[11px]">
                    {row.status}
                  </Badge>
                ) : (
                  "—"
                )}
              </td>
              <td className="px-3 py-2 text-xs">
                <div className="flex justify-end gap-2">
                  {row.actionUrl ? (
                    <Button size="sm" variant="outline" asChild>
                      <Link href={row.actionUrl}>Open</Link>
                    </Button>
                  ) : null}
                  <Button size="sm" variant="ghost" onClick={() => onDecision(row)}>
                    Create decision
                  </Button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
