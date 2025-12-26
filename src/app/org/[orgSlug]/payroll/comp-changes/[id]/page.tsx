import CompChangeDetail from "./CompChangeDetail";

export default async function CompChangeDetailPage({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;
  return <CompChangeDetail orgSlug={orgSlug} changeId={id} />;
}
