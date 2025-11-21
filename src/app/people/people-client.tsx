// src/app/people/people-client.tsx
"use client";

import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

// Local type definitions instead of importing from ./page
type Person = {
  id: string;
  name: string;
  title?: string | null;
  email?: string | null;
  createdAt?: string;
};

type Team = {
  id: string;
  name: string;
};

type Props = {
  people: Person[];
  teams: Team[];
  initialSearch: string;
  initialTeamId: string;
  totalCount: number;
};

export default function PeopleClient({
  people,
  teams,
  initialSearch,
  initialTeamId,
  totalCount,
}: Props) {
  const hasAnyPeople = totalCount > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">People</h1>
          <p className="text-sm opacity-70">
            All employees and contractors in your org.
          </p>
        </div>
        <div className="flex gap-2">
          <Link
            href="/people/new"
            className="rounded border px-3 py-2 text-sm hover:bg-gray-50"
          >
            + Add Person
          </Link>
        </div>
      </header>

      {/* Filters */}
      <section className="rounded border bg-white p-4 shadow-sm">
        {/* This form does a simple GET, which updates searchParams on the server */}
        <form className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex flex-1 flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="q">
              Search
            </label>
            <input
              id="q"
              name="q"
              defaultValue={initialSearch}
              placeholder="Search by name, title, or email…"
              className="rounded border px-3 py-2 text-sm"
            />
          </div>

          <div className="flex w-full flex-col gap-1 sm:w-64">
            <label className="text-sm font-medium" htmlFor="teamId">
              Team
            </label>
            <select
              id="teamId"
              name="teamId"
              defaultValue={initialTeamId}
              className="rounded border px-3 py-2 text-sm"
            >
              <option value="">All teams</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="mt-1 rounded border px-3 py-2 text-sm hover:bg-gray-50 sm:mt-0"
          >
            Apply
          </button>
        </form>
      </section>

      {/* List / empty state */}
      {people.length === 0 ? (
        <section className="rounded border bg-white p-8 text-center text-sm text-gray-600">
          <p className="font-medium">No people match this view.</p>
          {hasAnyPeople ? (
            <p className="mt-1">
              Try clearing the filters or{" "}
              <Link href="/people/new" className="underline">
                adding a new person
              </Link>
              .
            </p>
          ) : (
            <p className="mt-1">
              Get started by{" "}
              <Link href="/people/new" className="underline">
                adding your first person
              </Link>
              .
            </p>
          )}
        </section>
      ) : (
        <section className="rounded border bg-white shadow-sm">
          <div className="grid grid-cols-4 gap-4 border-b bg-gray-50 px-4 py-2 text-xs font-medium uppercase tracking-wide text-gray-500">
            <div>Name</div>
            <div>Title</div>
            <div>Email</div>
            <div className="text-right">Created</div>
          </div>
          <ul className="divide-y">
            {people.map((p) => (
              <li
                key={p.id}
                className="grid grid-cols-4 gap-4 px-4 py-3 text-sm"
              >
                <div className="flex flex-col">
                  <Link
                    href={`/people/${p.id}`}
                    className="font-medium hover:underline"
                  >
                    {p.name}
                  </Link>
                </div>
                <div className="truncate">{p.title || "—"}</div>
                <div className="truncate text-gray-600">
                  {p.email || "—"}
                </div>
                <div className="text-right text-xs text-gray-500">
                  {p.createdAt
                    ? new Date(p.createdAt).toLocaleDateString()
                    : "—"}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
