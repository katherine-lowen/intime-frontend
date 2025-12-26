import MemoryClient from "./MemoryClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <MemoryClient orgSlug={orgSlug} />;
}
