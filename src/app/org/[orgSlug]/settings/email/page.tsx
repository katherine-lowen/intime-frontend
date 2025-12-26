"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";
import { useAuth } from "@/context/auth";
import { sendTestEmail } from "@/lib/api-email";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { toast } from "sonner";

export default function EmailSettingsPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const router = useRouter();
  const { isOwner, isAdmin, orgName } = useCurrentOrg();
  const { email: userEmail } = useAuth();

  const [to, setTo] = useState("");
  const [type, setType] = useState<"invite" | "application_confirmation">("invite");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (userEmail) setTo(userEmail);
  }, [userEmail]);

  const canAccess = isOwner || isAdmin;

  const handleSend = async () => {
    if (!orgSlug || !to) return;
    try {
      setLoading(true);
      const res = await sendTestEmail(orgSlug, { to, type });
      setRequestId(res.requestId ?? null);
      setError(null);
      toast.success(`Test email sent${res.requestId ? ` (request ${res.requestId})` : ""}`);
    } catch (err: any) {
      const reqId = err?.requestId || null;
      setRequestId(reqId);
      const msg = err?.message || "Unable to send test email";
      setError(msg);
      toast.error(reqId ? `${msg} · request ${reqId}` : msg);
    } finally {
      setLoading(false);
    }
  };

  if (!canAccess) {
    return (
      <main className="mx-auto max-w-5xl px-4 py-10">
        <Card className="border-slate-200">
          <CardHeader>
            <CardTitle className="text-base">You don&apos;t have access</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Only owners and admins can manage email settings.
            <div className="mt-3">
              <Button variant="outline" onClick={() => router.push(`/org/${orgSlug}/settings`)}>
                Back to settings
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Email</h1>
        <p className="text-sm text-slate-600">
          Emails are sent via Resend. Use this page to verify deliverability.
        </p>
      </div>

      {error ? (
        <SupportErrorCard
          title="Unable to send test email"
          message={error}
          requestId={requestId}
        />
      ) : null}

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Workspace</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-700">
          <div className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-wide text-slate-500">Org</span>
            <span className="font-semibold text-slate-900">{orgName || "—"}</span>
            <span className="text-xs text-slate-500">Slug: {orgSlug}</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-base">Send test email</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Destination email</label>
            <Input
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="you@example.com"
              type="email"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-600">Template</label>
            <Select value={type} onValueChange={(val) => setType(val as any)}>
              <SelectTrigger className="w-full sm:w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="invite">Invite email</SelectItem>
                <SelectItem value="application_confirmation">Application confirmation</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button onClick={handleSend} disabled={loading || !to} className="mt-2">
            {loading ? "Sending…" : "Send test"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
