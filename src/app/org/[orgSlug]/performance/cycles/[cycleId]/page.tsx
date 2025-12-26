"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/lib/api";
import { useAuth } from "@/context/auth";
import Unauthorized from "@/components/unauthorized";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { fetchEmployeesForOrg } from "@/lib/api-employees";
import { toast } from "sonner";
import { PlanGate } from "@/components/PlanGate";

type Cycle = {
  id: string;
  name: string;
  startDate?: string | null;
  endDate?: string | null;
  status?: string | null;
  description?: string | null;
};

type CycleProgress = {
  assigned?: number;
  submitted?: number;
};

type Employee = {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
};

export default function CycleDetailPage() {
  const router = useRouter();
  const params = useParams() as { orgSlug?: string; cycleId?: string } | null;
  const cycleId = useMemo(() => params?.cycleId ?? "", [params]);
  const orgSlug = useMemo(() => params?.orgSlug ?? "", [params]);
  const { activeOrg, isLoading: authLoading } = useAuth();
  const role = activeOrg?.role;

  const [cycle, setCycle] = useState<Cycle | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [progress, setProgress] = useState<CycleProgress | null>(null);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!cycleId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const [c, prog] = await Promise.all([
          api.get<Cycle>(`/performance/cycles/${cycleId}`),
          api.get<CycleProgress>(`/performance/cycles/${cycleId}/progress`),
        ]);
        if (!cancelled) {
          setCycle(c ?? null);
          setProgress(prog ?? null);
          if (!c) setError("Cycle not found.");
        }
      } catch (err) {
        console.error("Failed to load cycle", err);
        if (!cancelled) setError("Unable to load cycle right now.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [cycleId]);

  const isEmployee = (role || "").toUpperCase() === "EMPLOYEE";

  if (authLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (!role || isEmployee) {
    return <Unauthorized roleLabel="owners, admins, or managers" fallbackHref="/org" />;
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error || !cycle) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        {error ?? "Cycle not found."}
      </div>
    );
  }

  return (
    <PlanGate required="GROWTH" feature="Performance cycles">
      <div className="px-6 py-8 space-y-6">
        <button
          onClick={() => router.push(`/org/${orgSlug}/performance/cycles`)}
          className="text-xs font-semibold text-indigo-700 hover:underline"
          type="button"
        >
          ← Back to cycles
        </button>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-xs uppercase tracking-wide text-slate-500">Performance · Cycle</p>
          <h1 className="text-2xl font-semibold text-slate-900">{cycle.name}</h1>
          <p className="text-sm text-slate-600">
            {cycle.startDate && cycle.endDate
              ? `${new Date(cycle.startDate).toLocaleDateString()} – ${new Date(
                  cycle.endDate
                ).toLocaleDateString()}`
              : "Period not set"}
          </p>

          {cycle.status && (
            <div className="mt-2 inline-flex rounded-full bg-slate-100 px-3 py-1 text-[11px] font-semibold text-slate-700">
              {cycle.status}
            </div>
          )}
        </div>

        {progress && (
          <Card className="border-slate-200">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-sm">Progress</CardTitle>
              <div className="text-xs text-slate-500">
                {progress.submitted ?? 0}/{progress.assigned ?? 0} submitted
              </div>
            </CardHeader>
            <CardContent className="text-sm text-slate-600">
              Track assigned vs. submitted reviews for this cycle.
            </CardContent>
          </Card>
        )}

        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-sm">Assign reviews</CardTitle>
            <Button size="sm" onClick={handleLoadEmployees}>
              Load employees
            </Button>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            {employees.length === 0 ? (
              <p className="text-xs text-slate-500">
                Load employees and select who should receive reviews.
              </p>
            ) : (
              <div className="space-y-2">
                {employees.map((emp) => {
                  const fullName = [emp.firstName, emp.lastName].filter(Boolean).join(" ");
                  return (
                    <label
                      key={emp.id}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2"
                    >
                      <div>
                        <p className="font-medium text-slate-900">{fullName}</p>
                        <p className="text-[11px] text-slate-500">{emp.email}</p>
                      </div>
                      <Checkbox
                        checked={!!selected[emp.id]}
                        onCheckedChange={(val) =>
                          setSelected((prev) => ({ ...prev, [emp.id]: !!val }))
                        }
                      />
                    </label>
                  );
                })}
              </div>
            )}
            <div className="flex justify-end">
              <Button size="sm" disabled={employees.length === 0} onClick={handleAssign}>
                Assign selected
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PlanGate>
  );

  async function handleLoadEmployees() {
    try {
      const list = await fetchEmployeesForOrg(orgSlug);
      setEmployees(list as any);
    } catch (err: any) {
      toast.error(err?.message || "Unable to load employees");
    }
  }

  async function handleAssign() {
    const ids = Object.entries(selected)
      .filter(([, v]) => v)
      .map(([id]) => id);
    if (!ids.length) return;
    try {
      await api.post(`/performance/cycles/${cycleId}/assign`, { employeeIds: ids });
      toast.success("Assigned reviewers");
    } catch (err: any) {
      toast.error(err?.message || "Unable to assign");
    }
  }
}
