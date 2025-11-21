// src/app/(dashboard)/candidates/page.tsx
import Link from "next/link";
import api from "@/lib/api";
import { AuthGate } from "@/components/dev-auth-gate";

export const dynamic = "force-dynamic";

type Candidate = {
  id: string;
  orgId: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  stage?: string | null;
  jobId?: string | null;
  source?: string | null;
  createdAt?: string;
};

async function getCandidates(): Promise<Candidate[]> {
  try {
    const raw = await api.get<any>("/candidates");

    // ✅ Handle both shapes:
    // - Array: [ { ...candidate } ]
    // - Paginated: { items: [ { ...candidate } ], total, page, ... }
    if (Array.isArray(raw)) {
      return raw as Candidate[];
    }
    if (raw && Array.isArray(raw.items)) {
      return raw.items as Candidate[];
    }

    console.warn("Unexpected /candidates response shape:", raw);
    return [];
  } catch (err) {
    console.error("Failed to load /candidates", err);
    return [];
  }
}

function formatDate(value?: string) {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleDateString();
}

function stageLabel(stage?: string | null) {
  if (!stage) return "New";
  const upper = stage.toUpperCase();
  switch (upper) {
    case "NEW":
    case "APPLIED":
      return "New";
    case "PHONE_SCREEN":
      return "Phone screen";
    case "INTERVIEW":
      return "Interview";
    case "OFFER":
      return "Offer";
    case "HIRED":
      return "Hired";
    case "REJECTED":
      return "Rejected";
    default:
      return stage;
  }
}

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  const total = candidates.length;
  const hiredCount = candidates.filter((c) => c.stage === "HIRED").length;
  const activePipeline = candidates.filter(
    (c) =>
      !c.stage ||
      ["NEW", "APPLIED", "PHONE_SCREEN", "INTERVIEW", "OFFER"].includes(
        c.stage.toUpperCase(),
      ),
  ).length;

  return (
    <AuthGate>
      <div className="relative">
        <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-b from-slate-50 via-white to-slate-50" />

        <main className="mx-auto max-w-6xl px-6 py-8 space-y-6">
          {/* Header */}
          <section className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Hiring · Candidates
              </p>
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Candidate pipeline
              </h1>
              <p className="mt-1 text-sm text-slate-600">
                View everyone in process across all open roles, with a quick
                sense of volume and movement.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/jobs"
                className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-900 shadow-sm hover:bg-slate-50"
              >
                View jobs
              </Link>
              <Link
                href="/candidates/new"
                className="rounded-xl bg-indigo-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-indigo-700"
              >
                + Add candidate
              </Link>
            </div>
          </section>

          {/* Snapshot */}
          <section className="grid gap-4 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Total candidates</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {total}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Across all roles in this org
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">In active pipeline</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {activePipeline}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                New, phone screens, interviews, and offers
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className="text-xs text-slate-500">Hired from Intime</div>
              <div className="mt-1 text-2xl font-semibold text-slate-900">
                {hiredCount}
              </div>
              <div className="mt-1 text-[11px] text-slate-500">
                Candidates whose stage is marked as HIRED
              </div>
            </div>
          </section>

          {/* Table */}
          <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">
                All candidates
              </h2>
              <span className="text-[11px] text-slate-500">
                {total === 0
                  ? "No candidates yet — add one to get started."
                  : `${total} total`}
              </span>
            </div>

            {total === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                No candidates in the system yet. Use{" "}
                <span className="font-medium text-slate-700">
                  “+ Add candidate”
                </span>{" "}
                or your job board to start filling your pipeline.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-[11px] uppercase tracking-wide text-slate-500">
                      <th className="px-3 py-2 font-medium">Name</th>
                      <th className="px-3 py-2 font-medium">Email</th>
                      <th className="px-3 py-2 font-medium">Stage</th>
                      <th className="px-3 py-2 font-medium">Source</th>
                      <th className="px-3 py-2 font-medium">Applied</th>
                    </tr>
                  </thead>
                  <tbody>
                    {candidates.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-slate-50 last:border-none hover:bg-slate-50/60"
                      >
                        <td className="px-3 py-2 text-sm">
                          <Link
                            href={`/candidates/${c.id}`}
                            className="font-medium text-slate-900 hover:underline"
                          >
                            {c.name || "Unnamed candidate"}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-600">
                          {c.email || "—"}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-700">
                          <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5">
                            {stageLabel(c.stage)}
                          </span>
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-600">
                          {c.source || "—"}
                        </td>
                        <td className="px-3 py-2 text-[11px] text-slate-600">
                          {formatDate(c.createdAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </AuthGate>
  );
}
