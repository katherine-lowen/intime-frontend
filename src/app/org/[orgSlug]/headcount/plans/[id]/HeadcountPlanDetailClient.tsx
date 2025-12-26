"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, RefreshCw, Check, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { HeadcountPlan, HeadcountTarget, getHeadcountPlan, updateHeadcountPlanStatus, updateHeadcountTargets } from "@/lib/hiring-signals-api";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { toast } from "sonner";

type Props = {
  orgSlug: string;
  planId: string;
};

export default function HeadcountPlanDetailClient({ orgSlug, planId }: Props) {
  const router = useRouter();
  const [plan, setPlan] = useState<HeadcountPlan | null>(null);
  const [targets, setTargets] = useState<HeadcountTarget[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [statusUpdating, setStatusUpdating] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        const res = await getHeadcountPlan(orgSlug, planId);
        if (!cancelled) {
          setPlan(res);
          setTargets(res?.targets || []);
          setError(null);
        }
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load plan");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, planId]);

  const handleStatusChange = async (next: string) => {
    if (!plan) return;
    try {
      setStatusUpdating(true);
      const updated = await updateHeadcountPlanStatus(orgSlug, plan.id, next);
      setPlan(updated ?? plan);
      toast.success("Status updated");
    } catch (err: any) {
      toast.error(err?.message || "Unable to update status");
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleSaveTargets = async () => {
    if (!plan) return;
    try {
      setSaving(true);
      const updated = await updateHeadcountTargets(orgSlug, plan.id, targets);
      if (updated) {
        setPlan(updated);
        setTargets(updated.targets || []);
      }
      toast.success("Targets saved");
    } catch (err: any) {
      toast.error(err?.message || "Unable to save targets");
    } finally {
      setSaving(false);
    }
  };

  const renderStatus = (status?: string | null) => {
    const label = status?.toString().toUpperCase() ?? "DRAFT";
    const variant = label === "ACTIVE" ? "default" : label === "ARCHIVED" ? "outline" : "secondary";
    return (
      <Badge variant={variant as any} className="text-[11px]">
        {label}
      </Badge>
    );
  };

  const totalTarget = targets.reduce((sum, t) => sum + (t.targetCount ?? 0), 0);
  const totalActual = targets.reduce((sum, t) => sum + (t.actualCount ?? 0), 0);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-4 w-4 animate-spin" />
        Loading plan…
      </div>
    );
  }

  if (error) {
    return <SupportErrorCard message={error} />;
  }

  if (!plan) {
    return <SupportErrorCard message="Plan not found" />;
  }

  return (
    <div className="space-y-6">
      <header className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Headcount</p>
          <h1 className="text-2xl font-semibold text-slate-900">{plan.name || "Headcount plan"}</h1>
          <p className="text-sm text-slate-600">Targets vs actuals by department.</p>
        </div>
        <div className="flex items-center gap-3">
          {renderStatus(plan.status)}
          <Select
            value={(plan.status ?? "draft").toLowerCase()}
            onValueChange={(val) => handleStatusChange(val)}
            disabled={statusUpdating}
          >
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="archived">Archived</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Total target</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{plan.totalTarget ?? totalTarget ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Total actual</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-semibold text-slate-900">{plan.totalActual ?? totalActual ?? "—"}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-slate-500">Delta</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-semibold text-slate-900">
                {plan.totalTarget != null && plan.totalActual != null
                  ? plan.totalActual - plan.totalTarget
                  : totalActual - totalTarget}
              </p>
              <Badge variant="outline" className="text-[11px]">
                {totalActual >= totalTarget ? "At / above" : "Below"}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <RefreshCw className="h-4 w-4 text-slate-500" />
            <CardTitle className="text-base">Targets</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              Refresh
            </Button>
            <Button size="sm" onClick={handleSaveTargets} disabled={saving}>
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Save"}
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {targets.length === 0 ? (
            <div className="flex items-center gap-2 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              No targets yet.
            </div>
          ) : (
            <Table>
              <THead>
                <TR>
                  <TH>Department</TH>
                  <TH>Title / Role</TH>
                  <TH className="text-right">Target</TH>
                  <TH className="text-right">Actual</TH>
                </TR>
              </THead>
              <TBody>
                {targets.map((t, idx) => (
                  <TR key={t.id ?? idx}>
                    <TD>
                      <Input
                        value={t.department ?? ""}
                        onChange={(e) =>
                          setTargets((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, department: e.target.value } : row))
                          )
                        }
                      />
                    </TD>
                    <TD>
                      <Input
                        value={t.title ?? ""}
                        onChange={(e) =>
                          setTargets((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, title: e.target.value } : row))
                          )
                        }
                      />
                    </TD>
                    <TD className="text-right">
                      <Input
                        type="number"
                        value={t.targetCount ?? ""}
                        onChange={(e) =>
                          setTargets((prev) =>
                            prev.map((row, i) => (i === idx ? { ...row, targetCount: Number(e.target.value) || 0 } : row))
                          )
                        }
                        className="text-right"
                      />
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span>{t.actualCount ?? "—"}</span>
                        {t.actualCount != null && t.targetCount != null && t.actualCount >= t.targetCount ? (
                          <Check className="h-4 w-4 text-emerald-500" />
                        ) : null}
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          )}
          <div className="flex items-center justify-end">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setTargets((prev) => [...prev, { department: "", title: "", targetCount: 1 }])}
            >
              Add row
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
