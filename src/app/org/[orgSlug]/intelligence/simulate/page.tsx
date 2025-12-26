import SimulateClient from "./SimulateClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <SimulateClient orgSlug={orgSlug} />;
}
