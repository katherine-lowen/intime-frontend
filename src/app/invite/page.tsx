"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";
import { acceptInvite } from "@/lib/api-auth-flows";
import { useAuth } from "@/context/auth";

export default function InviteAcceptPage() {
  const search = useSearchParams();
  const token = search?.get("token") || "";
  const router = useRouter();
  const { activeOrg, isLoading } = useAuth();
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    if (activeOrg && !isLoading) {
      // already signed in; attempt accept and redirect
      void handleAccept(true);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, activeOrg, isLoading]);

  const handleAccept = async (skipInputs?: boolean) => {
    if (!token) return;
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      const res = await acceptInvite(token, skipInputs ? {} : { name, password });
      const orgSlug =
        res?.org?.slug || res?.orgSlug || res?.org?.orgSlug || activeOrg?.orgSlug;
      if (orgSlug) {
        router.push(`/org/${orgSlug}/dashboard`);
      } else {
        router.push("/login");
      }
    } catch (err: any) {
      setError(err?.message || "Unable to accept invite");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <SupportErrorCard title="Invalid invite" message="Missing invite token." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Join workspace</CardTitle>
          <p className="text-sm text-slate-600">Set your details to accept the invite.</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {error ? <SupportErrorCard title="Invite" message={error} requestId={requestId} /> : null}
          {!activeOrg && (
            <>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Name</label>
                <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Set a password"
                />
              </div>
            </>
          )}
          <Button className="w-full" onClick={() => void handleAccept()} disabled={loading}>
            {loading ? "Accepting…" : "Accept invite"}
          </Button>
        </CardContent>
      </Card>
    </main>
  );
}
