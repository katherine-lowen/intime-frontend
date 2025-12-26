"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { useAuth } from "@/context/auth";
import { usePlanGuard } from "@/hooks/usePlanGuard";
import { createScorm, listScorm } from "@/lib/learning-api";

type ScormPackage = {
  id?: string;
  name?: string;
  status?: string;
  createdAt?: string;
  url?: string;
  downloadUrl?: string;
};

export default function ScormClient({ orgSlug }: { orgSlug: string }) {
  const { activeOrg } = useAuth();
  const plan = (activeOrg as any)?.plan?.toUpperCase?.() || "STARTER";
  const isScale = plan === "SCALE";
  const { handlePlanError, upgradeModal } = usePlanGuard(orgSlug);

  const [packages, setPackages] = useState<ScormPackage[]>([]);
  const [fileUrl, setFileUrl] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!isScale) return;
      setLoading(true);
      setError(null);
      try {
        const res = await listScorm(orgSlug);
        if (cancelled) return;
        setPackages(Array.isArray(res) ? res : []);
      } catch (err: any) {
        if (cancelled) return;
        setError(err?.message || "Unable to load SCORM packages");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [orgSlug, isScale]);

  const handleCreate = async () => {
    if (!fileUrl.trim()) return;
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      await createScorm(orgSlug, { fileUrl, name: name || undefined });
      const res = await listScorm(orgSlug);
      setPackages(Array.isArray(res) ? res : []);
      setFileUrl("");
      setName("");
    } catch (err: any) {
      if (!handlePlanError(err)) {
        setError(err?.message || "Unable to create SCORM package");
        setRequestId(err?.requestId || err?.response?.data?._requestId || null);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!isScale) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
        <div className="font-semibold">SCORM is available on Scale.</div>
        <p>Upgrade to export and manage SCORM packages.</p>
        <div className="flex gap-2">
          <Button asChild size="sm" className="bg-amber-900 text-amber-50 hover:bg-amber-800">
            <Link href={`/org/${orgSlug}/settings/billing`}>Upgrade to Scale</Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href={`/org/${orgSlug}/learning`}>Back to Learning</Link>
          </Button>
        </div>
        {upgradeModal}
      </div>
    );
  }

  return (
    <div className="space-y-4 p-6">
      {upgradeModal}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wide text-slate-500">Learning</p>
          <h1 className="text-2xl font-semibold text-slate-900">SCORM packages</h1>
          <p className="text-sm text-slate-600">Upload and track SCORM content for your LMS.</p>
        </div>
      </div>

      {error ? <SupportErrorCard title="SCORM" message={error} requestId={requestId} /> : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Create package</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Source file URL</span>
              <Input
                placeholder="https://..."
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
              />
            </label>
            <label className="space-y-1 text-sm text-slate-700">
              <span className="font-medium">Name (optional)</span>
              <Input
                placeholder="Safety training SCORM"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </label>
          </div>
          <div className="flex justify-end">
            <Button onClick={() => void handleCreate()} disabled={loading || !fileUrl}>
              {loading ? "Saving…" : "Create package"}
            </Button>
          </div>
          <p className="text-xs text-slate-500">
            Uploads should be hosted and reachable via the URL above. We&apos;ll ingest and process
            them into SCORM.
          </p>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Packages</CardTitle>
        </CardHeader>
        <CardContent>
          {loading && packages.length === 0 ? (
            <p className="text-sm text-slate-600">Loading packages…</p>
          ) : packages.length === 0 ? (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50/80 p-3 text-sm text-slate-600">
              No SCORM packages yet.
            </div>
          ) : (
            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-slate-50 text-xs font-medium uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Name</th>
                    <th className="px-3 py-2">Status</th>
                    <th className="px-3 py-2">Created</th>
                    <th className="px-3 py-2">Download</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {packages.map((pkg) => (
                    <tr key={pkg.id || pkg.name} className="hover:bg-slate-50">
                      <td className="px-3 py-2 text-sm text-slate-800">{pkg.name || "Package"}</td>
                      <td className="px-3 py-2 text-xs text-slate-700">{pkg.status || "PENDING"}</td>
                      <td className="px-3 py-2 text-xs text-slate-600">{pkg.createdAt || "—"}</td>
                      <td className="px-3 py-2 text-xs">
                        {pkg.url || pkg.downloadUrl ? (
                          <a
                            className="text-indigo-600 hover:underline"
                            href={(pkg.url || pkg.downloadUrl) as string}
                            target="_blank"
                            rel="noreferrer"
                          >
                            Download
                          </a>
                        ) : (
                          "—"
                        )}
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
