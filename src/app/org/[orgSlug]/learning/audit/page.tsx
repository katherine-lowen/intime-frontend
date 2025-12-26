import AuditClient from "./AuditClient";

export default async function LearningAuditPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <AuditClient orgSlug={orgSlug} />;
}
