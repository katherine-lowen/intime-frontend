"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { AiStudioShell } from "../AiStudioShell";
import { getPolicy, updatePolicy } from "@/lib/ai-studio-api";
import { Badge } from "@/components/ui/badge";

type Policy = {
  allowRoles?: Record<string, boolean>;
  allowDomains?: Record<string, boolean>;
  allowPII?: boolean;
  retainDays?: number | null;
  enforced?: boolean;
};

const ROLES = ["OWNER", "ADMIN", "MANAGER", "EMPLOYEE"];
const DOMAINS = ["Learning", "ATS", "Org", "Payroll", "Performance", "People"];

export default function SettingsClient({ orgSlug }: { orgSlug: string }) {
  const [policy, setPolicy] = useState<Policy | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const res = await getPolicy(orgSlug);
        if (!cancelled) setPolicy(res || {});
      } catch (err: any) {
        if (!cancelled) {
          setError(err?.message || "Unable to load policy");
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

  const toggleRole = (role: string) => {
    setPolicy((prev) => ({
      ...(prev || {}),
      allowRoles: { ...(prev?.allowRoles || {}), [role]: !(prev?.allowRoles?.[role]) },
    }));
  };

  const toggleDomain = (domain: string) => {
    setPolicy((prev) => ({
      ...(prev || {}),
      allowDomains: {
        ...(prev?.allowDomains || {}),
        [domain]: !(prev?.allowDomains?.[domain]),
      },
    }));
  };

  const save = async () => {
    if (!policy) return;
    setSaving(true);
    try {
      await updatePolicy(orgSlug, policy);
    } catch (err: any) {
      setError(err?.message || "Unable to save policy");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AiStudioShell orgSlug={orgSlug}>
      {error ? (
        <SupportErrorCard title="Policy" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading policy…
        </div>
      ) : policy ? (
        <Card className="border-slate-200">
          <CardHeader className="flex flex-row items-start justify-between">
            <div>
              <CardTitle className="text-base">Policy</CardTitle>
              <p className="text-sm text-slate-600">
                Define who can use AI Studio and where it can run.
              </p>
            </div>
            {policy.enforced ? (
              <Badge variant="outline" className="text-[10px]">
                Policy enforced org-wide
              </Badge>
            ) : null}
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Allowed roles</p>
              <div className="flex flex-wrap gap-2">
                {ROLES.map((role) => (
                  <Button
                    key={role}
                    size="sm"
                    variant={policy.allowRoles?.[role] ? "default" : "outline"}
                    onClick={() => toggleRole(role)}
                  >
                    {role}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wide text-slate-500">Allowed domains</p>
              <div className="flex flex-wrap gap-2">
                {DOMAINS.map((d) => (
                  <Button
                    key={d}
                    size="sm"
                    variant={policy.allowDomains?.[d] ? "default" : "outline"}
                    onClick={() => toggleDomain(d)}
                  >
                    {d}
                  </Button>
                ))}
              </div>
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 text-sm text-slate-700">
                <input
                  type="checkbox"
                  checked={!!policy.allowPII}
                  onChange={(e) =>
                    setPolicy((prev) => ({
                      ...(prev || {}),
                      allowPII: e.target.checked,
                    }))
                  }
                />
                Allow PII (with safeguards)
              </label>
              <span className="text-xs text-amber-600">
                Be cautious when enabling sensitive data.
              </span>
            </div>

            <div className="space-y-1">
              <label className="text-xs uppercase tracking-wide text-slate-500">
                Retention (days)
              </label>
              <input
                type="number"
                className="w-32 rounded-md border border-slate-200 px-3 py-2 text-sm"
                value={policy.retainDays ?? ""}
                onChange={(e) =>
                  setPolicy((prev) => ({
                    ...(prev || {}),
                    retainDays: e.target.value ? Number(e.target.value) : null,
                  }))
                }
              />
            </div>

            <div className="pt-2">
              <Button onClick={save} disabled={saving}>
                {saving ? "Saving…" : "Save policy"}
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="rounded-lg border border-dashed border-slate-200 bg-white p-4 text-sm text-slate-600">
          AI Studio not enabled yet.
        </div>
      )}
    </AiStudioShell>
  );
}
