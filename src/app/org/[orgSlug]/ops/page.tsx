import OpsClient from "./OpsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <OpsClient orgSlug={orgSlug} />;
}
