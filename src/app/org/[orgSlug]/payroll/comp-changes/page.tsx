import CompChangesClient from "./CompChangesClient";

export default async function CompChangesPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <CompChangesClient orgSlug={orgSlug} />;
}
