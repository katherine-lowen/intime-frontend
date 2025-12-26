"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { toast } from "sonner";
import api from "@/lib/api";

type InviteInfo = {
  orgName?: string;
  requiresName?: boolean;
  requiresPassword?: boolean;
};

export default function InviteAcceptPage() {
  const search = useSearchParams();
  const router = useRouter();
  const token = search?.get("token") || "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Optionally fetch invite info to show org name; skip if not needed
    let cancelled = false;
    async function load() {
      if (!token) return;
      try {
        const res = await api.get<InviteInfo>(`/invite/info?token=${encodeURIComponent(token)}`);
        if (!cancelled) setInvite(res);
      } catch {
        // ignore optional prefetch
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const handleAccept = async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError(null);
      const res = await api.post<{ redirectUrl?: string }>(`/invite/accept`, {
        token,
        name: name || undefined,
        password: password || undefined,
      });
      toast.success("Invite accepted");
      if (res?.redirectUrl) {
        router.push(res.redirectUrl);
      } else {
        setDone(true);
      }
    } catch (err: any) {
      setError(err?.message || "Invite is invalid or expired.");
      setRequestId(err?.requestId || null);
      toast.error(err?.message || "Invite is invalid or expired.");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="mx-auto max-w-xl px-4 py-12">
        <SupportErrorCard title="Invite token missing" message="Please use the invite link sent to your email." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-xl px-4 py-12">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">
            Accept invite{invite?.orgName ? ` to ${invite.orgName}` : ""}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-700">
          {error ? (
            <SupportErrorCard title="Unable to accept invite" message={error} requestId={requestId} />
          ) : null}

          {done ? (
            <p className="text-slate-600">You&apos;re all set. You can close this tab.</p>
          ) : (
            <>
              {invite?.requiresName && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Name</label>
                  <Input value={name} onChange={(e) => setName(e.target.value)} />
                </div>
              )}
              {invite?.requiresPassword && (
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600">Set a password</label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                  />
                </div>
              )}

              <Button onClick={handleAccept} disabled={loading}>
                {loading ? "Accepting…" : "Accept invite"}
              </Button>

              <p className="text-xs text-slate-500">
                If this link has expired, request a new invite from your admin.
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
