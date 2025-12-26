"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { confirmPasswordReset } from "@/lib/api-auth-flows";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

export default function ResetPasswordConfirmPage() {
  const search = useSearchParams();
  const token = search?.get("token") || "";
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError("Missing reset token");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      await confirmPasswordReset(token, password);
      setSuccess(true);
    } catch (err: any) {
      setError(err?.message || "Unable to reset password");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <main className="mx-auto max-w-md px-4 py-10">
        <SupportErrorCard title="Reset password" message="Missing reset token." />
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Set a new password</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? <SupportErrorCard title="Reset password" message={error} requestId={requestId} /> : null}
          {!success ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">New password</label>
                <Input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Confirm password</label>
                <Input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Saving…" : "Reset password"}
              </Button>
            </form>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <p>Password updated. You can now log in.</p>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Go to login
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
