// src/app/people/new/page.tsx
"use client";

import { useEffect, useState, useTransition, FormEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Team = {
  id: string;
  name: string;
};

export default function NewPersonPage() {
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [saving, startTransition] = useTransition();

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [teamId, setTeamId] = useState("");

  // Load teams for the dropdown
  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      try {
        const data = await api.get<Team[]>("/teams");
        if (!cancelled) {
          setTeams(data);
        }
      } catch (err) {
        console.error("Failed to load teams", err);
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    }

    loadTeams();
    return () => {
      cancelled = true;
    };
  }, []);

  // When user picks a team, default department to that team name
  useEffect(() => {
    if (!teamId) return;
    const t = teams.find((t) => t.id === teamId);
    if (t && !department) {
      setDepartment(t.name);
    }
  }, [teamId, teams, department]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError("First name and last name are required.");
      return;
    }

    startTransition(async () => {
      try {
        const body = {
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || undefined,
          title: title.trim() || undefined,
          // For now, department drives "team membership" (teams controller counts by department)
          department: department.trim() || undefined,
          // make sure backend gets an explicit value
          teamId: teamId || null,
          status: "ACTIVE" as const,
        };

        await api.post("/employees", body);
        router.push("/people");
      } catch (err) {
        console.error("Failed to create employee", err);
        setError("Something went wrong while saving. Please try again.");
      }
    });
  }

  return (
    <AuthGate>
      <main className="p-6 max-w-xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl font-semibold">Add Person</h1>
            <p className="text-sm opacity-70">
              Create a new employee or contractor in Intime.
            </p>
          </div>
          <Link
            href="/people"
            className="text-sm text-gray-600 hover:underline"
          >
            ← Back to People
          </Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">
                First name
              </label>
              <input
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="w-full rounded border px-2 py-1.5"
                required
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium">
                Last name
              </label>
              <input
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="w-full rounded border px-2 py-1.5"
                required
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              className="w-full rounded border px-2 py-1.5"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Senior Engineer, HR Manager…"
              className="w-full rounded border px-2 py-1.5"
            />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block text-xs font-medium">Team</label>
              <select
                value={teamId}
                onChange={(e) => setTeamId(e.target.value)}
                className="w-full rounded border px-2 py-1.5"
                disabled={loadingTeams}
              >
                <option value="">No team</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </select>
              <p className="mt-1 text-[11px] text-gray-500">
                For now, team membership is inferred from department = team name.
              </p>
            </div>

            <div>
              <label className="mb-1 block text-xs font-medium">
                Department
              </label>
              <input
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                placeholder="Engineering, Sales, People Ops…"
                className="w-full rounded border px-2 py-1.5"
              />
            </div>
          </div>

          {error && (
            <p className="rounded bg-red-50 px-2 py-1 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={saving}
              className="rounded bg-black px-4 py-2 text-sm font-medium text-white hover:bg-black/90 disabled:opacity-50"
            >
              {saving ? "Saving…" : "Create person"}
            </button>
          </div>
        </form>
      </main>
    </AuthGate>
  );
}
