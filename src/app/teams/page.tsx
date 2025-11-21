// src/app/teams/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

type Team = {
  id: string;
  orgId: string;
  name: string;
  memberCount?: number;
  createdAt?: string;
};

async function getTeams(): Promise<Team[]> {
  return api.get("/teams");
}

export default async function TeamsPage() {
  const teams = await getTeams();

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Teams</h1>
          <p className="text-sm opacity-70">Groups of people in your org.</p>
        </div>
        <Link
          href="/teams/new"
          className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
        >
          Add Team
        </Link>
      </header>

      {teams.length === 0 ? (
        <div className="rounded border p-6 text-sm text-gray-600">
          No teams yet. Click{" "}
          <span className="font-medium">Add Team</span> to create your first
          one.
        </div>
      ) : (
        <ul className="divide-y rounded border">
          {teams.map((t) => (
            <li
              key={t.id}
              className="grid grid-cols-3 gap-4 p-4 text-sm items-center"
            >
              {/* Name + actions */}
              <div className="flex flex-col gap-1">
                <Link
                  href={`/teams/${t.id}/edit`}
                  className="font-medium hover:underline"
                >
                  {t.name}
                </Link>
                <Link
                  href={`/teams/${t.id}/intelligence`}
                  className="text-xs text-indigo-600 hover:underline"
                >
                  Open intelligence →
                </Link>
              </div>

              {/* Members */}
              <div>{t.memberCount ?? "—"} members</div>

              {/* Created date */}
              <div className="text-right opacity-70">
                {t.createdAt
                  ? new Date(t.createdAt).toLocaleDateString()
                  : "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
