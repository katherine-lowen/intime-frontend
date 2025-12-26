import LearningClient from "./LearningClient";

export default async function LearningPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;

  return <LearningClient orgSlug={orgSlug} />;
}
