"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DocCategory = "Offer" | "ID" | "Contract" | "Misc" | string;

type DocumentRow = {
  id: string;
  orgId: string;
  ownerEmployeeId?: string | null;
  uploadedByUserId?: string | null;
  category: DocCategory;
  fileKey: string;
  fileName: string;
  mimeType: string;
  size: number;
  createdAt: string;
};

export default function DocumentsPage() {
  const { orgSlug, orgId, orgName } = useCurrentOrg();

  const [docs, setDocs] = useState<DocumentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    async function run() {
      if (!orgId) return;
      setLoading(true);
      setErr(null);

      try {
        const res = (await api.get(`/orgs/${orgId}/documents`)) as any;
        if (!mounted) return;
        setDocs((res?.data ?? []) as DocumentRow[]);
      } catch (e: any) {
        if (!mounted) return;
        setErr(e?.message ?? "Failed to load documents");
      } finally {
        if (mounted) setLoading(false);
      }
    }

    run();
    return () => {
      mounted = false;
    };
  }, [orgId]);

  const totalDocs = docs.length;

  const uploadedThisMonth = useMemo(() => {
    const now = new Date();
    const m = now.getMonth();
    const y = now.getFullYear();
    return docs.filter((d) => {
      const dt = new Date(d.createdAt);
      return dt.getMonth() === m && dt.getFullYear() === y;
    }).length;
  }, [docs]);

  return (
    <main className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-lg font-semibold text-slate-900">Documents</h1>
          <p className="text-sm text-slate-600">
            Store offer letters, IDs, and contracts for{" "}
            <span className="font-medium">{orgName ?? "your organization"}</span>.
          </p>
        </div>

        {/* Always show; backend enforces permissions */}
        <Button asChild type="button">
  <Link href={`/org/${orgSlug}/documents/upload`} prefetch={false}>
    Upload
  </Link>
</Button>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Total documents</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{totalDocs}</CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Uploaded this month</CardTitle>
          </CardHeader>
          <CardContent className="text-2xl font-semibold">{uploadedThisMonth}</CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">All documents</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-sm text-slate-600">Loading…</div>
          ) : err ? (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
              <div className="mt-2">
                <Button variant="outline" onClick={() => window.location.reload()}>
                  Retry
                </Button>
              </div>
            </div>
          ) : docs.length === 0 ? (
            <div className="rounded-lg border border-dashed p-8 text-center">
              <div className="text-sm font-medium text-slate-900">No documents yet</div>
              <div className="mt-1 text-xs text-slate-600">
                Upload your first document to start building your company file cabinet.
              </div>
              <div className="mt-4">
                <Button asChild>
                  <Link href={`/org/${orgSlug}/documents/upload`}>Upload a document</Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs text-slate-500">
                  <tr>
                    <th className="py-2 pr-3">File</th>
                    <th className="py-2 pr-3">Category</th>
                    <th className="py-2 pr-3">Uploaded</th>
                    <th className="py-2 pr-3"></th>
                  </tr>
                </thead>
                <tbody>
                  {docs.map((d) => (
                    <tr key={d.id} className="border-t">
                      <td className="py-2 pr-3 font-medium text-slate-900">
                        <Link className="hover:underline" href={`/org/${orgSlug}/documents/${d.id}`}>
                          {d.fileName}
                        </Link>
                      </td>
                      <td className="py-2 pr-3 text-slate-700">{d.category ?? "Misc"}</td>
                      <td className="py-2 pr-3 text-slate-600">
                        {new Date(d.createdAt).toLocaleString()}
                      </td>
                      <td className="py-2 pr-0 text-right">
                        <Button variant="outline" size="sm" asChild>
                          <Link href={`/org/${orgSlug}/documents/${d.id}`}>Open</Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
