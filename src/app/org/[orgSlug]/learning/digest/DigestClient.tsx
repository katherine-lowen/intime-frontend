"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { digestPreview, digestRun } from "@/lib/learning-api";
import { useAuth } from "@/context/auth";

export default function DigestClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isGrowth = plan === "GROWTH" || plan === "SCALE";
  const [preview, setPreview] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isGrowth) return;
      setLoading(true);
      setError(null);
      setRequestId(null);
      try {
        const res = await digestPreview(orgSlug);
        if (!cancelled) setPreview(res || null);
      } catch (err: any) {
        if (!cancelled) {
          if (err?.response?.status === 404) {
            setError("Digest not enabled yet.");
          } else {
            setError(err?.message || "Unable to load digest preview");
            setRequestId(err?.requestId || err?.response?.data?._requestId || null);
          }
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, isGrowth]);

  if (!isGrowth) {
    return (
      <div className="p-6">
        <UpgradeCard orgSlug={orgSlug} />
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Digest</p>
          <h1 className="text-2xl font-semibold text-slate-900">Weekly digest</h1>
        </div>
        <Button
          onClick={async () => {
            try {
              await digestRun(orgSlug);
              alert("Digest triggered");
            } catch (err: any) {
              alert(err?.message || "Unable to run digest");
            }
          }}
        >
          Run digest now
        </Button>
      </div>

      {error ? (
        <SupportErrorCard title="Digest" message={error} requestId={requestId} />
      ) : null}

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm text-sm text-slate-600">
          Loading…
        </div>
      ) : preview ? (
        <div className="rounded-xl border border-slate-100 bg-white p-4 shadow-sm space-y-3 text-sm text-slate-700">
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Completions (7d)</div>
            <div className="text-lg font-semibold text-slate-900">
              {preview.completions ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Overdue</div>
            <div className="text-lg font-semibold text-slate-900">
              {preview.overdue ?? "—"}
            </div>
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-slate-500">Top learners</div>
            <ul className="mt-1 space-y-1 text-sm text-slate-700">
              {(preview.topLearners || []).map((l: any, idx: number) => (
                <li key={idx}>
                  {l.name || l.user || "Learner"} — {l.score ?? l.completions ?? "—"}
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50/80 p-4 text-sm text-slate-600">
          No preview available yet.
        </div>
      )}
    </div>
  );
}

function UpgradeCard({ orgSlug }: { orgSlug: string }) {
  return (
    <div className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
      <div className="font-semibold">Weekly digest is available on Growth.</div>
      <div className="mt-1">Upgrade in billing to unlock this feature.</div>
      <Button
        asChild
        size="sm"
        className="mt-2 bg-amber-900 text-amber-50 hover:bg-amber-800"
      >
        <a href={`/org/${orgSlug}/settings/billing`}>Go to billing</a>
      </Button>
    </div>
  );
}
