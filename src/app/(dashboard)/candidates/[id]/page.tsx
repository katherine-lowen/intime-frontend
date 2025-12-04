// src/app/(dashboard)/candidates/[id]/page.tsx
import api from "@/lib/api";
import Link from "next/link";
import CandidateNotesPanel from "@/components/candidate-notes-panel";
import AiCandidatePanel from "@/components/ai-candidate-panel";
import AiCandidateScorecard from "@/components/ai-candidate-scorecard";
import CandidateMoatsPanel from "@/components/candidate-moats-panel";

export const dynamic = "force-dynamic";

type CandidateNote = {
  id: string;
  text: string;
  authorName?: string | null;
  createdAt?: string;
};

type CandidateJob = {
  id: string;
  title: string;
  department?: string | null;
  description?: string | null;
};

type Candidate = {
  id: string;
  name: string;
  email?: string | null;
  phone?: string | null;
  stage?: string | null;
  source?: string | null;
  linkedinUrl?: string | null;
  resumeText?: string | null;
  createdAt?: string;
  job?: CandidateJob | null;
  // some APIs may also return a top-level jobId
  jobId?: string | null;

  candidateNotes?: CandidateNote[]; // from Prisma include
};

async function getCandidate(id: string): Promise<Candidate> {
  return api.get(`/candidates/${id}`);
}

type PageProps = {
  params: { id: string };
};

export default async function CandidateDetailPage({ params }: PageProps) {
  const candidate = await getCandidate(params.id);
  const notes = candidate.candidateNotes ?? [];

  // Be defensive about how the job might be linked
  const effectiveJobId =
    candidate.job?.id ?? candidate.jobId ?? (candidate as any).jobId ?? "";

  return (
    <main className="flex flex-col gap-6 p-6">
      {/* Header */}
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">{candidate.name}</h1>
          <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400">
            {candidate.email && (
              <a
                href={`mailto:${candidate.email}`}
                className="underline-offset-2 hover:underline"
              >
                {candidate.email}
              </a>
            )}
            {candidate.phone && (
              <>
                <span className="opacity-40">•</span>
                <span>{candidate.phone}</span>
              </>
            )}
            {candidate.stage && (
              <>
                <span className="opacity-40">•</span>
                <span className="rounded-full border border-slate-700 px-2 py-0.5 text-[11px] uppercase tracking-wide">
                  {candidate.stage}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 text-xs">
          {effectiveJobId && candidate.job && (
            <Link
              href={`/jobs/${effectiveJobId}`}
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              View job • {candidate.job.title}
            </Link>
          )}
          {candidate.linkedinUrl && (
            <a
              href={candidate.linkedinUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-md border border-slate-700 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-100 hover:bg-slate-800"
            >
              Open LinkedIn
            </a>
          )}
        </div>
      </header>

      <section className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left / main column */}
        <div className="space-y-4 lg:col-span-2">
          {/* Basic profile / about */}
          <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-3">
            <h2 className="text-sm font-semibold">Profile</h2>
            <dl className="grid grid-cols-1 gap-y-2 gap-x-6 text-xs sm:grid-cols-2">
              <div>
                <dt className="text-slate-500">Email</dt>
                <dd className="text-slate-100">
                  {candidate.email ?? "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Phone</dt>
                <dd className="text-slate-100">
                  {candidate.phone ?? "Not provided"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Source</dt>
                <dd className="text-slate-100">
                  {candidate.source ?? "Unknown"}
                </dd>
              </div>
              <div>
                <dt className="text-slate-500">Applied for</dt>
                <dd className="text-slate-100">
                  {candidate.job?.title ?? "No job linked"}
                </dd>
              </div>
            </dl>
          </div>

          {/* Resume text (if you have it) */}
          {candidate.resumeText && (
            <div className="rounded-lg border border-slate-800 bg-slate-950/40 p-4 space-y-2">
              <h2 className="text-sm font-semibold">Resume snapshot</h2>
              <p className="max-h-64 overflow-y-auto text-xs leading-relaxed text-slate-100 whitespace-pre-wrap">
                {candidate.resumeText}
              </p>
            </div>
          )}
        </div>

        {/* Right column: AI + moats + notes */}
        <div className="space-y-4">
          <AiCandidateScorecard
            candidateId={candidate.id}
            candidateName={candidate.name}
          />
          <AiCandidatePanel
            candidateId={candidate.id}
            candidateName={candidate.name}
          />
          <CandidateMoatsPanel
            candidateId={candidate.id}
            initialNotes={notes}
          />
          <CandidateNotesPanel
            candidateId={candidate.id}
            initialNotes={notes}
          />
        </div>
      </section>
    </main>
  );
}
