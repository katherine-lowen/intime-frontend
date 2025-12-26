"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import api from "@/lib/api";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DocCategory = "Offer" | "ID" | "Contract" | "Misc";

export default function UploadDocumentPage() {
  const router = useRouter();
  const { orgId, orgSlug } = useCurrentOrg();

  const [category, setCategory] = useState<DocCategory>("Misc");
  const [file, setFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onUpload() {
    if (!orgId || !file) return;

    setSubmitting(true);
    setErr(null);

    try {
      // 1) presigned upload URL (backend enforces OWNER/ADMIN)
      const up = (await api.post(`/orgs/${orgId}/documents/upload-url`, {
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        category,
      })) as any;

      const uploadUrl: string | undefined = up?.data?.uploadUrl;
      const fileKey: string | undefined = up?.data?.fileKey;

      if (!uploadUrl || !fileKey) throw new Error("Upload URL not returned by server");

      // 2) PUT file to R2/S3
      const putRes = await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type || "application/octet-stream" },
      });

      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

      // 3) create document record (backend enforces OWNER/ADMIN)
      await (api.post(`/orgs/${orgId}/documents`, {
        fileKey,
        fileName: file.name,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        category,
      }) as any);

      router.replace(`/org/${orgSlug}/documents`);
    } catch (e: any) {
      // If you're not allowed, this will likely be 403. Show a friendly message.
      const msg = e?.response?.status === 403
        ? "You don’t have permission to upload documents. Ask an admin."
        : (e?.message ?? "Upload failed");
      setErr(msg);
      setSubmitting(false);
    }
  }

  return (
    <main className="space-y-4 max-w-2xl">
      <div>
        <h1 className="text-lg font-semibold text-slate-900">Upload document</h1>
        <p className="text-sm text-slate-600">
          Upload a file to your organization’s document library.
        </p>
        <div className="mt-1 text-xs text-slate-500">
          Access is enforced by the server (owner/admin).
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">File details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {err && (
            <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {err}
            </div>
          )}

          <div className="space-y-1">
            <div className="text-xs text-slate-500">Category</div>
            <select
              className="w-full rounded-md border px-3 py-2 text-sm"
              value={category}
              onChange={(e) => setCategory(e.target.value as DocCategory)}
              disabled={submitting}
            >
              <option value="Offer">Offer</option>
              <option value="ID">ID</option>
              <option value="Contract">Contract</option>
              <option value="Misc">Misc</option>
            </select>
          </div>

          <div className="space-y-1">
            <div className="text-xs text-slate-500">File</div>
            <input
              type="file"
              className="w-full text-sm"
              disabled={submitting}
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            />
            {file && (
              <div className="text-xs text-slate-600">
                Selected: <span className="font-medium">{file.name}</span> (
                {Math.round(file.size / 1024)} KB)
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button disabled={!file || submitting} onClick={onUpload}>
              {submitting ? "Uploading…" : "Upload"}
            </Button>
            <Button variant="outline" disabled={submitting} asChild>
              <Link href={`/org/${orgSlug}/documents`}>Cancel</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
