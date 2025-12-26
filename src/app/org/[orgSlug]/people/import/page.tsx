"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { useAuth } from "@/context/auth";
import { previewEmployeeImport, commitEmployeeImport, type ImportPreview } from "@/lib/api-employee-import";
import { SeatBanner } from "@/components/billing/SeatBanner";
import { toast } from "sonner";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

type RowFilter = "all" | "error" | "skipped";

export default function PeopleImportPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const router = useRouter();
  const { isOwner, isAdmin } = useCurrentOrg();
  const { email } = useAuth();

  const [csvText, setCsvText] = useState("");
  const [fileName, setFileName] = useState<string | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [filter, setFilter] = useState<RowFilter>("all");
  const [commitResult, setCommitResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [seatError, setSeatError] = useState<{ seatsUsed?: number; seatsAllowed?: number } | null>(null);
  const [sendInvites, setSendInvites] = useState(false);
  const [inviteOnlyNew, setInviteOnlyNew] = useState(true);
  const [defaultRole, setDefaultRole] = useState<"EMPLOYEE" | "MANAGER">("EMPLOYEE");

  const canAccess = isOwner || isAdmin;

  const filteredRows = useMemo(() => {
    if (!preview?.rows) return [];
    return preview.rows.filter((row) => {
      if (filter === "error") return row.status === "error";
      if (filter === "skipped") return row.status === "skipped";
      return true;
    });
  }, [filter, preview]);

  const handleFile = async (file: File | null) => {
    if (!file) return;
    setFileName(file.name);
    const text = await file.text();
    setCsvText(text);
  };

  const handleDownloadSample = () => {
    const sample = `firstName,lastName,email,startDate\nJane,Doe,jane@example.com,2024-05-01\nJohn,Smith,john@example.com,2024-05-15`;
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "employee-import-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePreview = async () => {
    if (!orgSlug || !csvText.trim()) return;
    try {
      setLoading(true);
      setError(null);
      setSeatError(null);
      const res = await previewEmployeeImport(orgSlug, csvText);
      setPreview(res);
      setRequestId((res as any)?._requestId || null);
      toast.success("Preview ready");
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "SEAT_LIMIT_REACHED") {
        setSeatError({
          seatsAllowed: err?.response?.data?.seatsAllowed,
          seatsUsed: err?.response?.data?.seatsUsed,
        });
      }
      setError(err?.message || "Unable to preview import");
      setRequestId(err?.requestId || null);
      toast.error(err?.message || "Unable to preview import");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!orgSlug || !csvText.trim()) return;
    try {
      setLoading(true);
      setSeatError(null);
      const res = await commitEmployeeImport(orgSlug, csvText, {
        sendInvites,
        inviteOnlyNew,
        defaultRole,
      });
      setCommitResult(res);
      toast.success("Import completed");
    } catch (err: any) {
      const code = err?.response?.data?.code;
      if (code === "SEAT_LIMIT_REACHED") {
        setSeatError({
          seatsAllowed: err?.response?.data?.seatsAllowed,
          seatsUsed: err?.response?.data?.seatsUsed,
        });
      }
      const msg = err?.message || "Unable to import employees";
      setError(msg);
      setRequestId(err?.requestId || null);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  if (!orgSlug) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Organization not found.
      </div>
    );
  }

  if (!canAccess) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">You don&apos;t have access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Only workspace owners and admins can import employees.
            <div className="mt-3">
              <Button variant="outline" onClick={() => router.push(`/org/${orgSlug}/people`)}>
                Back to People
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">People</p>
        <h1 className="text-2xl font-semibold text-slate-900">Import employees</h1>
        <p className="text-sm text-slate-600">
          Paste or upload a CSV to bulk import employees. We&apos;ll preview before importing.
        </p>
      </div>

      <SeatBanner orgSlug={orgSlug} />

      {error ? (
        <SupportErrorCard
          title="Import error"
          message={error}
          requestId={requestId}
        />
      ) : null}

      {seatError && (
        <Alert className="border-amber-200 bg-amber-50 text-amber-900">
          <AlertTitle>Seat limit reached</AlertTitle>
          <AlertDescription>
            You have {seatError.seatsUsed ?? "—"} / {seatError.seatsAllowed ?? "—"} seats. Upgrade to add more.
            <div className="mt-2">
              <Button asChild size="sm">
                <Link href={`/org/${orgSlug}/settings/billing`}>Upgrade</Link>
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      )}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Upload or paste CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="flex flex-wrap gap-3">
            <Input
              type="file"
              accept=".csv,text/csv"
              onChange={(e) => handleFile(e.target.files?.[0] || null)}
              className="w-full max-w-xs"
            />
            <Button variant="outline" onClick={handleDownloadSample}>
              Download sample CSV
            </Button>
            {fileName && <Badge variant="outline">{fileName}</Badge>}
          </div>
          <Textarea
            rows={8}
            value={csvText}
            onChange={(e) => setCsvText(e.target.value)}
            placeholder="Paste CSV here..."
          />
          <div className="flex flex-wrap gap-2">
            <Button onClick={handlePreview} disabled={loading || !csvText.trim()}>
              {loading ? "Working..." : "Preview"}
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                setCsvText("");
                setPreview(null);
                setCommitResult(null);
                setError(null);
              }}
            >
              Reset
            </Button>
          </div>
        </CardContent>
      </Card>

      {preview && (
        <Card className="border-slate-200">
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-3">
              <CardTitle className="text-base">Preview</CardTitle>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                <Badge variant="outline" className="text-[11px]">
                  Parsed: {preview.parsedCount}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  Valid: {preview.validCount}
                </Badge>
                <Badge variant="outline" className="text-[11px]">
                  Invalid: {preview.invalidCount}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Tabs value={filter} onValueChange={(v) => setFilter(v as RowFilter)}>
              <TabsList>
                <TabsTrigger value="all">All</TabsTrigger>
                <TabsTrigger value="error">Errors</TabsTrigger>
                <TabsTrigger value="skipped">Skipped</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="grid gap-3 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
              <div className="flex items-center gap-2">
                <Checkbox
                  id="sendInvites"
                  checked={sendInvites}
                  onCheckedChange={(v) => setSendInvites(!!v)}
                />
                <label htmlFor="sendInvites" className="text-sm font-semibold">
                  Invite employees after import
                </label>
              </div>
              {sendInvites && (
                <div className="grid gap-2 sm:grid-cols-2">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="inviteOnlyNew"
                      checked={inviteOnlyNew}
                      onCheckedChange={(v) => setInviteOnlyNew(!!v)}
                    />
                    <label htmlFor="inviteOnlyNew" className="text-sm">
                      Invite only newly created employees
                    </label>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600">Default role</label>
                    <Select value={defaultRole} onValueChange={(v) => setDefaultRole(v as any)}>
                      <SelectTrigger className="w-full sm:w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="EMPLOYEE">Employee</SelectItem>
                        <SelectItem value="MANAGER">Manager</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm text-slate-800">
                <thead className="text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-2 py-2 text-left">Row</th>
                    <th className="px-2 py-2 text-left">Data</th>
                    <th className="px-2 py-2 text-left">Status</th>
                    <th className="px-2 py-2 text-left">Errors</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRows.map((row) => (
                    <tr key={row.rowNumber} className={row.status === "error" ? "bg-rose-50" : row.status === "skipped" ? "bg-amber-50" : ""}>
                      <td className="px-2 py-2 text-slate-700">{row.rowNumber}</td>
                      <td className="px-2 py-2 text-slate-700">
                        <div className="flex flex-wrap gap-2 text-xs">
                          {Object.entries(row.data).map(([k, v]) => (
                            <span key={k} className="rounded-md bg-slate-100 px-2 py-1">
                              <strong>{k}:</strong> {v}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-2 py-2 text-slate-700">
                        <Badge
                          variant="outline"
                          className={
                            row.status === "error"
                              ? "border-rose-300 bg-rose-100 text-rose-800"
                              : row.status === "skipped"
                              ? "border-amber-300 bg-amber-100 text-amber-800"
                              : "border-emerald-300 bg-emerald-100 text-emerald-800"
                          }
                        >
                          {row.status}
                        </Badge>
                      </td>
                      <td className="px-2 py-2 text-slate-700">
                        {row.errors?.length ? (
                          <ul className="list-disc pl-4 text-xs text-rose-700">
                            {row.errors.map((err, idx) => (
                              <li key={idx}>{err}</li>
                            ))}
                          </ul>
                        ) : (
                          <span className="text-xs text-slate-500">—</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Button
                onClick={handleCommit}
                disabled={loading || preview.validCount === 0}
              >
                {loading ? "Importing…" : `Import ${preview.validCount} employees`}
              </Button>
              <p className="text-xs text-slate-500">
                Invalid rows will be skipped.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {commitResult && (
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">Import results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-slate-700">
            <p>Import completed.</p>
            {commitResult?.invitedCount != null && (
              <p className="text-xs text-slate-600">
                Invited {commitResult.invitedCount} people.
              </p>
            )}
            {commitResult?.inviteErrors?.length ? (
              <details className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
                <summary className="cursor-pointer font-semibold">Invite errors</summary>
                <ul className="mt-2 list-disc space-y-1 pl-4">
                  {commitResult.inviteErrors.map((err: string, idx: number) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </details>
            ) : null}
            <pre className="rounded-lg bg-slate-100 p-3 text-xs text-slate-800 overflow-auto">
              {JSON.stringify(commitResult, null, 2)}
            </pre>
          </CardContent>
        </Card>
      )}
    </main>
  );
}
