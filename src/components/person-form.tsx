// components/person-form.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/api";
import { orgHref } from "@/lib/org-base";


const ORG_ID = process.env.NEXT_PUBLIC_ORG_ID || "demo-org";

export type PersonInput = {
  name: string;
  title?: string | null;
  email?: string | null;
  teamId?: string | null;
};

export default function PersonForm({
  mode,
  personId,
  initial = { name: "", title: "", email: "", teamId: "" },
}: {
  mode: "create" | "edit";
  personId?: string;
  initial?: PersonInput;
}) {
  const router = useRouter();

  // form state
  const [name, setName] = useState(initial.name || "");
  const [title, setTitle] = useState(initial.title || "");
  const [email, setEmail] = useState(initial.email || "");
  const [teamId, setTeamId] = useState(initial.teamId || "");

  // teams for dropdown
  const [teams, setTeams] = useState<Array<{ id: string; name: string }>>([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  // ux state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const list = await api.get<Array<{ id: string; name: string }>>("/teams");
        if (mounted) setTeams(list || []);
      } catch {
        // ignore; empty list keeps form usable
      } finally {
        if (mounted) setTeamsLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    if (!name.trim()) {
      setError("Name is required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        orgId: ORG_ID,
        name: name.trim(),
        title: title.trim() || undefined,
        email: email.trim() || undefined,
        teamId: teamId || undefined,
      };

      if (mode === "create") {
        await api.post("/people", payload);
      } else {
        await api.patch(`/people/${personId}`, payload);
      }

      router.push("/people");
      router.refresh();
    } catch (err: any) {
      setError(err?.message || "Save failed.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4 max-w-xl">
      <div className="grid gap-1">
        <label className="text-sm font-medium">Name *</label>
        <input
          className="rounded border px-3 py-2"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          disabled={saving}
          placeholder="Jane Doe"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium">Title</label>
        <input
          className="rounded border px-3 py-2"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={saving}
          placeholder="Product Manager"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium">Email</label>
        <input
          type="email"
          className="rounded border px-3 py-2"
          value={email || ""}
          onChange={(e) => setEmail(e.target.value)}
          disabled={saving}
          placeholder="jane@company.com"
        />
      </div>

      <div className="grid gap-1">
        <label className="text-sm font-medium">Team</label>
        <select
          className="rounded border px-3 py-2"
          value={teamId || ""}
          onChange={(e) => setTeamId(e.target.value || "")}
          disabled={saving || teamsLoading}
        >
          <option value="">{teamsLoading ? "Loading…" : "No team"}</option>
          {teams.map((t) => (
            <option key={t.id} value={t.id}>
              {t.name}
            </option>
          ))}
        </select>
        <p className="text-xs opacity-60">
          You can change this later from the person or team page.
        </p>
      </div>

      {error && (
        <div className="rounded border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <button
          type="submit"
          disabled={saving}
          className="rounded border px-3 py-2 hover:bg-gray-50 disabled:opacity-50"
        >
          {saving ? "Saving…" : mode === "create" ? "Create" : "Save Changes"}
        </button>
        <a href={orgHref("/people")}
 className="text-sm underline">
          Cancel
        </a>
      </div>
    </form>
  );
}
