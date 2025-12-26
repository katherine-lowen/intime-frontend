// components/add-team-form.tsx
"use client";

import { useState, type FormEvent } from "react";
import api from "@/lib/api";
import { orgHref } from "@/lib/org-base";


const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export default function AddTeamForm({ onDone }: { onDone?: () => void }) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setOk(false);
    if (!name.trim()) {
      setError("Team name is required.");
      return;
    }

    setSaving(true);
    try {
      await api.post("/teams", { orgId: ORG_ID, name: name.trim() });
      setOk(true);
      setName("");
      onDone?.();
    } catch (err: any) {
      setError(err?.message || "Failed to create team.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
      <div className="grid gap-1">
        <label className="text-sm font-medium">Team name *</label>
        <input
          className="rounded border px-3 py-2"
          placeholder="Design"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={saving}
          required
        />
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {ok && (
        <div className="rounded border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Team created.
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? "Saving…" : "Save"}
        </button>
        <a href={orgHref("/teams")} className="text-sm underline">
          Cancel
        </a>
      </div>
    </form>
  );
}
