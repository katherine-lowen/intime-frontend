import JobDetailPage from "@/features/hiring/JobDetailPage";
import { Suspense } from "react";

type Props = {
  params: Promise<{ orgSlug: string; jobId: string }>;
};

export default async function OrgJobDetailRoute({ params }: Props) {
  const { orgSlug, jobId } = await params;

  return (
    <Suspense fallback={null}>
      <JobDetailPage orgSlug={orgSlug} jobId={jobId} />
    </Suspense>
  );
}
