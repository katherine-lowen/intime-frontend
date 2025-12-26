import LearnClient from "./LearnClient";

export default async function LearnPage({
  params,
}: {
  params: Promise<{ orgSlug: string; courseId: string }>;
}) {
  const { orgSlug, courseId } = await params;

  return <LearnClient orgSlug={orgSlug} courseId={courseId} />;
}
