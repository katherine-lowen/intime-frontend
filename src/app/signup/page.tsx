"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
  const apiBase = useMemo(
    () => process.env.NEXT_PUBLIC_API_URL || (typeof window !== "undefined" ? window.location.origin : ""),
    []
  );
  const [form, setForm] = useState({
    name: "",
    companyName: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch(`${apiBase}/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        setError("Signup failed. Please double-check your details.");
        return;
      }

      const data = await res.json().catch(() => null);
      const orgSlug =
        data?.org?.slug || data?.orgSlug || data?.slug || data?.org?.id || data?.orgId || "";

      if (orgSlug) {
        router.push(`/org/${orgSlug}/getting-started`);
      } else {
        router.push("/org");
      }

    } catch (err) {
      setError("We couldn’t reach the backend server. Make sure it’s running.");
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md rounded-xl border bg-white p-8 shadow"
      >
        <h1 className="mb-4 text-2xl font-semibold">Create your workspace</h1>

        <div className="space-y-4">
          <input
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Your name"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            required
            className="w-full rounded border px-3 py-2"
            placeholder="Company name"
            value={form.companyName}
            onChange={(e) => setForm({ ...form, companyName: e.target.value })}
          />
          <input
            required
            type="email"
            className="w-full rounded border px-3 py-2"
            placeholder="Email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            required
            type="password"
            className="w-full rounded border px-3 py-2"
            placeholder="Password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button
            type="submit"
            className="w-full rounded bg-blue-600 px-4 py-2 font-medium text-white"
          >
            Create workspace
          </button>
        </div>
      </form>
    </div>
  );
}
