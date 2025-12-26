import ActivityClient from "./ActivityClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ActivityClient orgSlug={orgSlug} />;
}
