import OverviewClient from "./OverviewClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <OverviewClient orgSlug={orgSlug} />;
}
