"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { requestPasswordReset } from "@/lib/api-auth-flows";
import { SupportErrorCard } from "@/components/support/SupportErrorCard";

export default function ResetPasswordRequestPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setRequestId(null);
    try {
      await requestPasswordReset(email);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.message || "Unable to send reset email");
      setRequestId(err?.requestId || err?.response?.data?._requestId || null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="mx-auto max-w-md px-4 py-10">
      <Card className="border-slate-200">
        <CardHeader>
          <CardTitle className="text-lg">Reset your password</CardTitle>
          <p className="text-sm text-slate-600">We’ll send a reset link if the email exists.</p>
        </CardHeader>
        <CardContent>
          {error ? <SupportErrorCard title="Reset password" message={error} requestId={requestId} /> : null}
          {!submitted ? (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-medium text-slate-700">Email</label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="you@example.com"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? "Sending…" : "Send reset link"}
              </Button>
            </form>
          ) : (
            <div className="space-y-2 text-sm text-slate-700">
              <p>Check your email for a reset link. If it doesn&apos;t arrive, try again in a few minutes.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
