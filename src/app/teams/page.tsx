// src/app/teams/page.tsx
import { get } from "@/lib/api";
import { InviteInline } from "@/components/invite-inline";

type User = { id: string; name: string; email: string };

export const dynamic = "force-dynamic"; // avoid stale caching

export default async function TeamsPage() {
  let members: User[] = [];
  try {
    const data = await get("/users");
    members = Array.isArray(data) ? data : [];
  } catch {
    members = [];
  }

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Team</h1>
          <p className="mt-1 text-sm text-neutral-600">Manage members and invites.</p>
        </div>
      </div>

      <div className="mb-6">
        <InviteInline />
      </div>

      <div className="overflow-hidden rounded-lg border bg-white">
        <table className="min-w-full divide-y">
          <thead className="bg-neutral-50">
            <tr>
              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Name</th>
              <th className="px-4 py-2 text-left text-sm font-medium text-neutral-600">Email</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {members.map((m) => (
              <tr key={m.id}>
                <td className="px-4 py-2">{m.name}</td>
                <td className="px-4 py-2">{m.email}</td>
              </tr>
            ))}
            {members.length === 0 && (
              <tr>
                <td colSpan={2} className="px-4 py-6 text-sm text-neutral-500">
                  No members yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export {};
