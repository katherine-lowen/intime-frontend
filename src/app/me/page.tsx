// src/app/me/page.tsx
import api from "@/lib/api";

export const dynamic = "force-dynamic";

type MeResponse = {
  user: {
    id: string;
    email: string;
    name?: string | null;
    createdAt?: string;
  } | null;

  org: {
    id: string;
    name: string;
    plan: string | null;
    createdAt?: string;
  } | null;

  membership: {
    id: string;
    role: string;
  } | null;

  employee: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
    title?: string | null;
    department?: string | null;
  } | null;

  inferredOrgId: string | null;
};

async function fetchMe(): Promise<MeResponse> {
  // This uses api.ts, which automatically injects:
  //   x-user-email
  //   x-user-name
  //   x-org-id (fallback)
  const data = await api.get<MeResponse>("/me");

  // Guard against api.get possibly returning undefined
  return (
    data ?? {
      user: null,
      org: null,
      membership: null,
      employee: null,
      inferredOrgId: null,
    }
  );
}

export default async function MePage() {
  let me: MeResponse | null = null;

  try {
    me = await fetchMe();
  } catch (e: any) {
    console.error("Failed to load /me:", e);
  }

  const user = me?.user;
  const org = me?.org;
  const membership = me?.membership;
  const employee = me?.employee;

  return (
    <main className="p-6 space-y-6">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Your profile</h1>
          <p className="text-sm text-slate-500">
            Live identity resolved via the backend <code>/me</code> endpoint.
          </p>
        </div>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        {/* USER CARD */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Signed-in User</h2>
          <p className="mt-1 text-xs text-slate-500">
            Sourced from backend <code>/me</code> resolution.
          </p>

          {user ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">
                  {user.name ?? "Unknown"}
                </dd>
              </div>

              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Email</dt>
                <dd className="font-mono text-xs text-slate-900">
                  {user.email}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No identity detected. You may not be logged in or your headers
              aren't being sent to the API.
            </p>
          )}
        </section>

        {/* ORG CARD */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">
            Workspace / Organization
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Resolved backend organization for the current user.
          </p>

          {org ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">{org.name}</dd>
              </div>

              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Org ID</dt>
                <dd className="font-mono text-xs text-slate-900">{org.id}</dd>
              </div>

              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Plan</dt>
                <dd className="font-medium text-slate-900">
                  {org.plan ?? "free"}
                </dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No org resolved. Backend may not have linked the user yet.
            </p>
          )}
        </section>
      </div>

      {/* EMPLOYEE & membership card */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* EMPLOYEE */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Employee Record</h2>
          <p className="mt-1 text-xs text-slate-500">
            Your employee entity in the current workspace.
          </p>

          {employee ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Employee ID</dt>
                <dd className="font-mono text-xs text-slate-900">
                  {employee.id}
                </dd>
              </div>

              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Name</dt>
                <dd className="font-medium text-slate-900">
                  {employee.firstName} {employee.lastName}
                </dd>
              </div>

              {employee.department && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Department</dt>
                  <dd>{employee.department}</dd>
                </div>
              )}

              {employee.title && (
                <div className="flex justify-between gap-2">
                  <dt className="text-slate-500">Title</dt>
                  <dd>{employee.title}</dd>
                </div>
              )}
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No employee record for this workspace.
            </p>
          )}
        </section>

        {/* MEMBERSHIP */}
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Membership</h2>
          <p className="mt-1 text-xs text-slate-500">
            Link between your user + this workspace.
          </p>

          {membership ? (
            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Membership ID</dt>
                <dd className="font-mono text-xs text-slate-900">
                  {membership.id}
                </dd>
              </div>

              <div className="flex justify-between gap-2">
                <dt className="text-slate-500">Role</dt>
                <dd>{membership.role}</dd>
              </div>
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-500">
              No membership found for this org.
            </p>
          )}
        </section>
      </div>
    </main>
  );
}
