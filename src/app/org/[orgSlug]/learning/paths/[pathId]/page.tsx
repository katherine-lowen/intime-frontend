import PathClient from "./PathClient";

export default async function PathPage({
  params,
}: {
  params: Promise<{ orgSlug: string; pathId: string }>;
}) {
  const { orgSlug, pathId } = await params;
  return <PathClient orgSlug={orgSlug} pathId={pathId} />;
}
