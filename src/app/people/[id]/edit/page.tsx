// app/people/[id]/edit/page.tsx
import api from "@/lib/api";
import PersonForm, { type PersonInput } from "@/components/person-form";
import { AuthGate } from "@/components/dev-auth-gate";

type Person = {
  id: string;
  orgId: string;
  name: string;
  title?: string | null;
  email?: string | null;
  teamId?: string | null;
};

async function getPerson(id: string): Promise<Person> {
  return api.get(`/people/${id}`);
}

export default async function EditPersonPage({
  params,
}: {
  params: { id: string };
}) {
  const person = await getPerson(params.id);

  const initial: PersonInput = {
    name: person.name,
    title: person.title ?? "",
    email: person.email ?? "",
    teamId: person.teamId ?? "",
  };

  return (
    <main className="p-6 space-y-6">
      <header>
        <h1 className="text-2xl font-semibold">Edit Person</h1>
        <p className="text-sm opacity-70">Update this person’s details.</p>
      </header>
      <div className="rounded border p-6">
        <PersonForm mode="edit" personId={params.id} initial={initial} />
      </div>
    </main>
  );
}
