import DeployCheckClient from "./DeployCheckClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <DeployCheckClient orgSlug={orgSlug} />;
}
