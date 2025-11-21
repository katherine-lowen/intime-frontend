// src/app/teams/new/page.tsx
"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Team = {
  id: string;
  orgId: string;
  name: string;
  createdAt?: string;
};

export default function NewTeamPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmed = name.trim();
    if (!trimmed) {
      setError("Team name is required.");
      return;
    }

    setSaving(true);
    try {
      await api.post<Team>("/teams", { name: trimmed });
      // After creating, go back to Teams list
      router.push("/teams");
    } catch (err) {
      console.error("Failed to create team", err);
      setError("Something went wrong while creating the team.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="p-6 space-y-6">
      <header className="space-y-1">
        <button
          type="button"
          onClick={() => router.push("/teams")}
          className="text-xs text-indigo-600 hover:underline"
        >
          ← Back to Teams
        </button>
        <h1 className="text-2xl font-semibold">Add team</h1>
        <p className="text-sm text-gray-600">
          Create a new team. Later, you can map people to this team via their
          department or a dedicated team field.
        </p>
      </header>

      <section className="rounded-lg border bg-white p-4 shadow-sm max-w-md">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1">
            <label
              htmlFor="name"
              className="text-sm font-medium text-gray-900"
            >
              Team name
            </label>
            <input
              id="name"
              name="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Product, Sales, Customer Success"
              className="w-full rounded border px-3 py-2 text-sm"
              disabled={saving}
            />
            <p className="text-xs text-gray-500">
              Use a name that matches how you think about this group internally.
            </p>
          </div>

          {error && (
            <p className="text-sm text-red-600" role="alert">
              {error}
            </p>
          )}

          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
            >
              {saving ? "Saving…" : "Create team"}
            </button>
            <button
              type="button"
              onClick={() => router.push("/teams")}
              className="text-sm text-gray-600 hover:underline"
              disabled={saving}
            >
              Cancel
            </button>
          </div>
        </form>
      </section>
    </main>
  );
}
