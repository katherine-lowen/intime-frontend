"use client";

import { useEffect, useMemo, useState } from "react";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/context/auth";
import UpgradeToScaleModal from "@/components/learning/UpgradeToScaleModal";
import {
  createPayBand,
  deletePayBand,
  listPayBands,
  updatePayBand,
} from "@/lib/payroll-api";

type PayBand = {
  id?: string;
  role?: string;
  level?: string;
  min?: number;
  max?: number;
  currency?: string;
};

export default function BandsClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isScale = plan === "SCALE";
  const [bands, setBands] = useState<PayBand[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [form, setForm] = useState<PayBand>({ currency: "USD" });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isScale) return;
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await listPayBands(orgSlug);
        if (!cancelled) setBands(Array.isArray(res) ? res : []);
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load pay bands");
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
  }, [orgSlug, isScale]);

  const grouped = useMemo(() => bands, [bands]);

  const saveBand = async () => {
    if (!form.role && !form.level) return;
    setSaving(true);
    setError(null);
    setRequestId(null);
    try {
      if (form.id) {
        await updatePayBand(orgSlug, form.id, form);
      } else {
        await createPayBand(orgSlug, form);
      }
      const res = await listPayBands(orgSlug);
      setBands(Array.isArray(res) ? res : []);
      setForm({ currency: "USD" });
    } catch (err: any) {
      setError(err?.message || "Unable to save pay band");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setSaving(false);
    }
  };

  if (!isScale) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="font-semibold">Pay bands are available on Scale.</div>
        <Button asChild size="sm" className="bg-amber-900 text-amber-50 hover:bg-amber-800">
          <a href={`/org/${orgSlug}/settings/billing`}>Upgrade to Scale</a>
        </Button>
        <UpgradeToScaleModal open={false} onClose={() => {}} orgSlug={orgSlug} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Payroll</p>
        <h1 className="text-2xl font-semibold text-slate-900">Pay bands</h1>
        <p className="text-sm text-slate-600">Define boundaries for approvals and anomaly checks.</p>
      </div>

      {error ? <SupportErrorCard title="Pay bands" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">{form.id ? "Edit band" : "Add band"}</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Role / title</span>
            <Input
              value={form.role || ""}
              onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
              placeholder="Engineer"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Level (optional)</span>
            <Input
              value={form.level || ""}
              onChange={(e) => setForm((f) => ({ ...f, level: e.target.value }))}
              placeholder="L3"
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Currency</span>
            <Input
              value={form.currency || ""}
              onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Min</span>
            <Input
              type="number"
              value={form.min ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, min: e.target.value === "" ? undefined : Number(e.target.value) }))}
            />
          </label>
          <label className="space-y-1 text-sm text-slate-700">
            <span className="font-medium">Max</span>
            <Input
              type="number"
              value={form.max ?? ""}
              onChange={(e) => setForm((f) => ({ ...f, max: e.target.value === "" ? undefined : Number(e.target.value) }))}
            />
          </label>
          <div className="flex items-end justify-end gap-2">
            {form.id ? (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setForm({ currency: "USD" })}
              >
                Cancel
              </Button>
            ) : null}
            <Button onClick={() => void saveBand()} disabled={saving || (!form.role && !form.level)}>
              {saving ? "Saving…" : form.id ? "Update" : "Add"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Existing bands</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : grouped.length === 0 ? (
            <p className="text-sm text-slate-600">No bands configured.</p>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Role</th>
                    <th className="px-3 py-2">Level</th>
                    <th className="px-3 py-2">Min</th>
                    <th className="px-3 py-2">Max</th>
                    <th className="px-3 py-2">Currency</th>
                    <th className="px-3 py-2">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {grouped.map((band) => (
                    <tr key={band.id || `${band.role}-${band.level}`} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-xs text-slate-700">{band.role || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{band.level || "—"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {band.min != null ? `$${band.min}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">
                        {band.max != null ? `$${band.max}` : "—"}
                      </td>
                      <td className="px-3 py-2 text-xs text-slate-700">{band.currency || "USD"}</td>
                      <td className="px-3 py-2 text-xs">
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setForm({ ...band })}
                          >
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            className="text-rose-600"
                            onClick={async () => {
                              try {
                                await deletePayBand(orgSlug, band.id || "");
                                setBands((prev) => prev.filter((b) => b.id !== band.id));
                              } catch (err: any) {
                                setError(err?.message || "Unable to delete");
                                setRequestId(err?.requestId || err?.response?.data?._requestId || null);
                              }
                            }}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
