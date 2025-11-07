// src/app/users/page.tsx
import { api } from '@/lib/api';
import { revalidatePath } from 'next/cache';

type User = {
  id: string;
  email: string;
  name?: string | null;
  createdAt?: string;
};

async function getUsers(): Promise<User[]> {
  // api helper already sets cache: 'no-store' for dev
  return api.get<User[]>('/users');
}

export default async function UsersPage() {
  const users = await getUsers();

  // Server Action to create a user
  async function createUser(formData: FormData) {
    'use server';
    const email = String(formData.get('email') || '').trim();
    const name = String(formData.get('name') || '').trim() || undefined;

    // Basic guard
    if (!email) return;

    await api.post<User>('/users', { email, name });
    // Revalidate this route so the list refreshes on submit
    revalidatePath('/users');
  }

  return (
    <div className="p-6 space-y-4">
      <header>
        <h1 className="text-2xl font-semibold">Users</h1>
        <p className="text-sm opacity-70">People in this org.</p>
      </header>

      <ul className="mt-2 divide-y rounded border bg-white">
        {users.map((u) => (
          <li key={u.id} className="flex items-center justify-between p-3">
            <div>
              <div className="font-medium">{u.name || u.email}</div>
              <div className="text-xs opacity-60">{u.email}</div>
            </div>
            {u.createdAt && (
              <span className="text-xs rounded bg-neutral-100 px-2 py-1">
                {new Date(u.createdAt).toLocaleDateString()}
              </span>
            )}
          </li>
        ))}
        {users.length === 0 && (
          <li className="p-4 text-sm opacity-70">No users yet.</li>
        )}
      </ul>

      <form action={createUser} className="mt-4 flex flex-wrap gap-2">
        <input
          className="border rounded px-3 py-2 min-w-[220px]"
          name="email"
          type="email"
          placeholder="email@domain.com"
          required
        />
        <input
          className="border rounded px-3 py-2 min-w-[180px]"
          name="name"
          placeholder="Name (optional)"
        />
        <button className="rounded border px-3 py-2">Invite User</button>
      </form>
    </div>
  );
}
