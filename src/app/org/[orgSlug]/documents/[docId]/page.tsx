"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DocumentDetail = {
  id: string;
  orgId: string;
  category?: string | null;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
  ownerEmployeeId?: string | null;
};

export default function DocumentDetailPage() {
  const router = useRouter();
  const params = useParams<{ docId: string }>();
  const docId = params?.docId;

  const { orgId, orgSlug } = useCurrentOrg();

  const [doc, setDoc] = useState<DocumentDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [downloading, setDownloading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!orgId || !docId) return;
      setLoading(true);
      setErr(null);

      try {
        const res = (await api.get(`/orgs/${orgId}/documents/${docId}`)) as any;
        if (!mounted) return;
        setDoc((res?.data ?? null) as DocumentDetail | null);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load document");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [orgId, docId]);

  async function download() {
    if (!orgId || !docId) return;
    setDownloading(true);

    try {
      const res = (await api.get(`/orgs/${orgId}/documents/${docId}/download-url`)) as any;
      const url: string | undefined = res?.data?.url;
      if (!url) throw new Error("No download URL returned");
      window.open(url, "_blank", "noopener,noreferrer");
    } catch (e: any) {
      setErr(e?.message ?? "Download failed");
    } finally {
      setDownloading(false);
    }
  }

  return (
    <main className="space-y-4 max-w-3xl">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Document</h1>
          <div className="text-xs text-slate-500">
            <Link className="hover:underline" href={`/org/${orgSlug}/documents`}>
              ← Back to Documents
            </Link>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.back()}>
            Back
          </Button>
          <Button onClick={download} disabled={loading || downloading || !doc}>
            {downloading ? "Preparing…" : "Download"}
          </Button>
        </div>
      </div>

      {err && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {err}
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Details</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-600">Loading…</div>
          ) : !doc ? (
            <div className="text-sm text-slate-600">Not found.</div>
          ) : (
            <div className="grid gap-2 text-sm">
              <div>
                <span className="text-slate-500">File: </span>
                <span className="font-medium text-slate-900">{doc.fileName}</span>
              </div>
              <div>
                <span className="text-slate-500">Category: </span>
                <span className="text-slate-900">{doc.category ?? "Misc"}</span>
              </div>
              <div>
                <span className="text-slate-500">Type: </span>
                <span className="text-slate-900">{doc.mimeType}</span>
              </div>
              <div>
                <span className="text-slate-500">Size: </span>
                <span className="text-slate-900">{Math.round(doc.size / 1024)} KB</span>
              </div>
              <div>
                <span className="text-slate-500">Uploaded: </span>
                <span className="text-slate-900">{new Date(doc.createdAt).toLocaleString()}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
