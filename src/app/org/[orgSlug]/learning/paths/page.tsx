import PathsClient from "./PathsClient";

export default async function PathsPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <PathsClient orgSlug={orgSlug} />;
}
