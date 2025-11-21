// src/app/timeoff/page.tsx
import api from "@/lib/api";
import TimeoffRequestsTable, {
  TimeOffRequestItem,
  TimeOffStatus,
} from "@/components/timeoff-requests-table";
import Link from "next/link";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

async function getRequests(status?: TimeOffStatus): Promise<TimeOffRequestItem[]> {
  const query = status ? `?status=${status}` : "";
  return api.get(`/timeoff/requests${query}`);
}

export default async function TimeOffPage() {
  const [requested, approved, denied] = await Promise.all([
    getRequests("REQUESTED"),
    getRequests("APPROVED"),
    getRequests("DENIED"),
  ]);

  return (
    <AuthGate>
      <main className="flex flex-col gap-6 p-6">
        <header className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-slate-50">
              Time off
            </h1>
            <p className="text-sm text-slate-400">
              See requests across the org and approve or decline them.
            </p>
          </div>
          <Link
            href="/timeoff/new"
            className="inline-flex items-center rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            New request
          </Link>
        </header>

        <section className="space-y-6">
          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              Awaiting approval
            </h2>
            <TimeoffRequestsTable items={requested} showActions />
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              Approved
            </h2>
            <TimeoffRequestsTable items={approved} />
          </div>

          <div className="space-y-2">
            <h2 className="text-sm font-semibold text-slate-200">
              Denied
            </h2>
            <TimeoffRequestsTable items={denied} />
          </div>
        </section>
      </main>
    </AuthGate>
  );
}
