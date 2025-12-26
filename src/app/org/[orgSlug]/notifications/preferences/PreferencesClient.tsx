"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { getPreferences, updatePreferences } from "@/lib/notifications-api";

type Prefs = {
  tasks?: boolean;
  alerts?: boolean;
  learning?: boolean;
  payroll?: boolean;
};

export default function NotificationsPreferencesClient({ orgSlug }: { orgSlug: string }) {
  const [prefs, setPrefs] = useState<Prefs>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setError(null);
      setRequestId(null);
      try {
        const res = await getPreferences(orgSlug);
        if (!cancelled) setPrefs(res || {});
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load preferences");
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
  }, [orgSlug]);

  const save = async () => {
    setSaving(true);
    setError(null);
    setRequestId(null);
    try {
      await updatePreferences(orgSlug, prefs);
      alert("Preferences saved");
    } catch (err: any) {
      setError(err?.message || "Unable to save");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setSaving(false);
    }
  };

  const toggle = (key: keyof Prefs) =>
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <div className="space-y-4 p-6">
      <div>
        <p className="text-xs uppercase tracking-wide text-slate-500">Notifications</p>
        <h1 className="text-2xl font-semibold text-slate-900">Preferences</h1>
        <p className="text-sm text-slate-600">Control which updates you receive in-app.</p>
      </div>

      {error ? <SupportErrorCard title="Preferences" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Channels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {loading ? (
            <p className="text-sm text-slate-600">Loading…</p>
          ) : (
            <>
              <Toggle label="Tasks" checked={!!prefs.tasks} onChange={() => toggle("tasks")} />
              <Toggle label="Alerts" checked={!!prefs.alerts} onChange={() => toggle("alerts")} />
              <Toggle label="Learning" checked={!!prefs.learning} onChange={() => toggle("learning")} />
              <Toggle label="Payroll" checked={!!prefs.payroll} onChange={() => toggle("payroll")} />
              <p className="text-xs text-slate-500">Applies to in-app notifications.</p>
              <Button onClick={() => void save()} disabled={saving}>
                {saving ? "Saving…" : "Save"}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800">
      <span>{label}</span>
      <input
        type="checkbox"
        className="h-4 w-4 rounded border-slate-300"
        checked={checked}
        onChange={onChange}
      />
    </label>
  );
}
