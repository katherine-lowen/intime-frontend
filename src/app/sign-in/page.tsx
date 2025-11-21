// src/app/sign-in/page.tsx
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    const res = await signIn("email", {
      email,
      callbackUrl: "/dashboard",
      redirect: false,
    });
    if (res?.error) setErr(res.error);
    else setSent(true);
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-center p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-semibold">Sign in to Intime</h1>
        <p className="text-sm opacity-70">
          We’ll email you a magic link to sign in.
        </p>
      </div>

      {sent ? (
        <p className="text-sm text-gray-700">
          Check your email for a sign-in link.
        </p>
      ) : (
        <form onSubmit={onSubmit} className="space-y-3">
          <input
            type="email"
            className="w-full rounded border px-3 py-2 text-sm"
            placeholder="you@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          {err && (
            <div className="rounded border border-red-200 bg-red-50 p-2 text-sm text-red-700">
              {err}
            </div>
          )}

          <button className="w-full rounded border px-3 py-2 text-sm hover:bg-gray-50">
            Send magic link
          </button>
        </form>
      )}
    </main>
  );
}
