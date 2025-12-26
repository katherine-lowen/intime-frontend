import NewPathClient from "./PathNewClient";

export default async function NewPathPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <NewPathClient orgSlug={orgSlug} />;
}
