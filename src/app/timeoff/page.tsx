// src/app/timeoff/page.tsx
import api from "@/lib/api";
import TimeoffRequestsTable, {
  TimeOffRequestItem,
  TimeOffStatus,
} from "@/components/timeoff-requests-table";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

async function getRequests(
  status?: TimeOffStatus
): Promise<TimeOffRequestItem[]> {
  const query = status ? `?status=${encodeURIComponent(status)}` : "";
  return api.get(`/timeoff/requests${query}`);
}

// Safe wrapper so a failing API call doesn't break the Server Component
async function safeGetRequests(
  status: TimeOffStatus
): Promise<TimeOffRequestItem[]> {
  try {
    return await getRequests(status);
  } catch (err) {
    console.error(`Failed to load time off requests for status=${status}`, err);
    return [];
  }
}

export default async function TimeOffPage() {
  const [requested, approved, denied] = await Promise.all([
    safeGetRequests("REQUESTED"),
    safeGetRequests("APPROVED"),
    safeGetRequests("DENIED"),
  ]);

  return (
    <AuthGate>
      <main className="mx-auto flex max-w-5xl flex-col gap-8 px-6 py-8">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Time off
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              See requests across the org and approve or decline them.
            </p>
          </div>
          <Link
            href="/timeoff/new"
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            New request
          </Link>
        </header>

        {/* SECTIONS */}
        <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
          {/* Awaiting */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Awaiting approval
            </h2>
            {requested.length === 0 ? (
              <p className="text-sm text-slate-500">
                No requests in this bucket.
              </p>
            ) : (
              <TimeoffRequestsTable items={requested} showActions />
            )}
          </div>

          {/* Approved */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Approved
            </h2>
            {approved.length === 0 ? (
              <p className="text-sm text-slate-500">
                No requests in this bucket.
              </p>
            ) : (
              <TimeoffRequestsTable items={approved} />
            )}
          </div>

          {/* Denied */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-700">
              Denied
            </h2>
            {denied.length === 0 ? (
              <p className="text-sm text-slate-500">
                No requests in this bucket.
              </p>
            ) : (
              <TimeoffRequestsTable items={denied} />
            )}
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
