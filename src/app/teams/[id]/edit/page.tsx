// app/teams/[id]/edit/page.tsx
import api from "@/lib/api";
import TeamMembersClient from "./team-members-client";
import { AuthGate } from "@/components/dev-auth-gate";

type Team = { id: string; orgId: string; name: string };
type Person = { id: string; name: string; email?: string | null; teamId?: string | null };

async function getTeam(id: string): Promise<Team> {
  return api.get(`/teams/${id}`);
}

async function getPeople(): Promise<Person[]> {
  return api.get("/people"); // we'll filter client-side
}

export default async function EditTeamPage({ params }: { params: { id: string } }) {
  const [team, people] = await Promise.all([getTeam(params.id), getPeople()]);

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Edit Team</h1>
        <p className="text-sm opacity-70">Manage team details and membership.</p>
      </header>

      <section className="rounded border p-6 space-y-2">
        <div className="text-sm opacity-70">Team ID</div>
        <div className="font-mono text-sm">{team.id}</div>
        <div className="text-sm opacity-70">Name</div>
        <div className="text-base font-medium">{team.name}</div>
      </section>

      <section className="rounded border p-6">
        <TeamMembersClient teamId={team.id} people={people} />
      </section>
    </main>
  );
}
