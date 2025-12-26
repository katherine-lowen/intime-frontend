"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { API_BASE_URL } from "@/lib/api";
import { toast } from "sonner";

type ExportType = "employees" | "jobs" | "candidates";

export default function DataExportsPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const router = useRouter();
  const { orgId, isOwner, isAdmin, loading } = useCurrentOrg();
  const canView = isOwner || isAdmin;

  const [activeOnly, setActiveOnly] = useState(true);
  const [since, setSince] = useState<string>("");
  const [downloading, setDownloading] = useState<ExportType | null>(null);

  const queryParams = useMemo(() => {
    const qs = new URLSearchParams();
    if (activeOnly) qs.set("status", "active");
    if (since) qs.set("since", since);
    return qs.toString();
  }, [activeOnly, since]);

  const handleDownload = async (type: ExportType) => {
    if (!orgId || !orgSlug) {
      toast.error("Organization not found");
      return;
    }
    setDownloading(type);
    try {
      const path = `/orgs/${orgId}/exports/${type}` + (queryParams ? `?${queryParams}` : "");
      const res = await fetch(`${API_BASE_URL}${path}`, {
        method: "GET",
        credentials: "include",
        headers: {
          "x-org-id": orgSlug,
          Accept: "text/csv",
        },
      });
      const requestId = res.headers.get("x-request-id");
      if (!res.ok) {
        const text = await res.text();
        const message = text || `Unable to download ${type}`;
        toast.error(`${message}${requestId ? ` (req ${requestId})` : ""}`);
        return;
      }
      const blob = await res.blob();
      const disposition = res.headers.get("content-disposition");
      let filename = `${type}.csv`;
      if (disposition) {
        const match = disposition.match(/filename="?([^\";]+)"?/i);
        if (match?.[1]) filename = match[1];
      }
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      toast.success(`Download started for ${filename}`);
    } catch (err: any) {
      const message = err?.message || `Unable to download ${type}`;
      const requestId = err?.requestId;
      toast.error(`${message}${requestId ? ` (req ${requestId})` : ""}`);
    } finally {
      setDownloading(null);
    }
  };

  if (loading) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-600">
          Loading organization…
        </div>
      </main>
    );
  }

  if (!canView) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-10">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">You don&apos;t have access</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm text-slate-600">
            Only workspace owners and admins can export data.
            <Button variant="outline" onClick={() => router.push(`/org/${orgSlug}/settings`)}>
              Back to settings
            </Button>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-4xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Data exports</h1>
        <p className="text-sm text-slate-600">Download your org data as CSV.</p>
      </div>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Filters</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4 text-sm text-slate-700">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={activeOnly}
              onCheckedChange={(v) => setActiveOnly(Boolean(v))}
              id="active-only"
            />
            <span>Active only</span>
          </label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="space-y-1">
              <label htmlFor="since" className="text-xs uppercase tracking-wide text-slate-500">
                Since date
              </label>
              <Input
                id="since"
                type="date"
                value={since}
                onChange={(e) => setSince(e.target.value)}
                className="w-52"
              />
            </div>
            <p className="text-xs text-slate-500">
              Optional: limit export to rows updated after this date.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <ExportCard
          title="Employees CSV"
          description="Directory data including basic fields and status."
          onDownload={() => handleDownload("employees")}
          loading={downloading === "employees"}
        />
        <ExportCard
          title="Jobs CSV"
          description="Open and closed roles with metadata."
          onDownload={() => handleDownload("jobs")}
          loading={downloading === "jobs"}
        />
        <ExportCard
          title="Candidates CSV"
          description="Candidates and applications across jobs."
          onDownload={() => handleDownload("candidates")}
          loading={downloading === "candidates"}
        />
      </div>
    </main>
  );
}

function ExportCard({
  title,
  description,
  onDownload,
  loading,
}: {
  title: string;
  description: string;
  onDownload: () => void;
  loading: boolean;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex items-center justify-between gap-3 text-sm text-slate-600">
        <p className="max-w-xs">{description}</p>
        <Button onClick={onDownload} disabled={loading}>
          {loading ? "Preparing…" : "Download"}
        </Button>
      </CardContent>
    </Card>
  );
}
