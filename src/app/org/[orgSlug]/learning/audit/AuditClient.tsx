"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { listAudit, listCourses } from "@/lib/learning-api";
import { useAuth } from "@/context/auth";

type AuditRow = {
  id?: string;
  timestamp?: string;
  actor?: string;
  action?: string;
  entity?: string;
  details?: string;
};

export default function AuditClient({ orgSlug }: { orgSlug: string }) {
  const [rows, setRows] = useState<AuditRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState("");
  const [courses, setCourses] = useState<any[]>([]);
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowthOrAbove = plan === "GROWTH" || plan === "SCALE";

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setRequestId(null);
      try {
        const res = await listAudit(orgSlug, courseId ? { courseId } : undefined);
        if (!cancelled) setRows(res);
      } catch (err: any) {
        if (err?.response?.status === 404) {
          setError("Not enabled yet");
        } else {
          setError(err?.message || "Unable to load audit");
          setRequestId(err?.requestId || err?.response?.data?._requestId || null);
        }
      }
    }

    async function loadCourses() {
      try {
        const list = await listCourses(orgSlug);
        setCourses(list || []);
      } catch {
        // ignore
      }
    }

    void load();
    void loadCourses();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, courseId]);

  if (!isGrowthOrAbove) {
    return (
      <div className="p-6">
        <UpgradeCard orgSlug={orgSlug} plan="GROWTH" feature="Audit trail" />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Audit</p>
          <h1 className="text-2xl font-semibold text-slate-900">Learning audit trail</h1>
        </div>
        <div className="flex gap-2">
          <select
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            value={courseId}
            onChange={(e) => setCourseId(e.target.value)}
          >
            <option value="">All courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>
                {c.title || c.id}
              </option>
            ))}
          </select>
        </div>
      </div>

      {error ? (
        <SupportErrorCard title="Audit error" message={error} requestId={requestId} />
      ) : null}

      {rows.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No audit events yet.
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-xs font-medium uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-3 py-2">Time</th>
                <th className="px-3 py-2">Actor</th>
                <th className="px-3 py-2">Action</th>
                <th className="px-3 py-2">Entity</th>
                <th className="px-3 py-2">Details</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((row, idx) => (
                <tr key={row.id || idx} className="hover:bg-slate-50/70">
                  <td className="px-3 py-2 text-xs text-slate-600">{row.timestamp || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.actor || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.action || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.entity || "—"}</td>
                  <td className="px-3 py-2 text-xs text-slate-600">{row.details || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UpgradeCard({ orgSlug, plan, feature }: { orgSlug: string; plan: string; feature: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="font-semibold">{feature} is available on {plan}.</div>
      <div className="mt-1">Upgrade in billing to unlock this feature.</div>
      <Button asChild size="sm" className="mt-2 bg-amber-900 text-amber-50 hover:bg-amber-800">
        <a href={`/org/${orgSlug}/settings/billing`}>Go to billing</a>
      </Button>
    </div>
  );
}
