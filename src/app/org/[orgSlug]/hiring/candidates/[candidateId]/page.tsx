import CandidateDetailPage from "@/features/hiring/CandidateDetailPage";
import { Suspense } from "react";

type Props = {
  params: Promise<{ orgSlug: string; candidateId: string }>;
};

export default async function OrgCandidateDetailRoute({ params }: Props) {
  const { orgSlug, candidateId } = await params;

  return (
    <Suspense fallback={null}>
      <CandidateDetailPage orgSlug={orgSlug} candidateId={candidateId} />
    </Suspense>
  );
}
