import DigestClient from "./DigestClient";

export default async function DigestPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <DigestClient orgSlug={orgSlug} />;
}
