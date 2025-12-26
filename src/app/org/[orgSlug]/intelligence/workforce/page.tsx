import WorkforceClient from "./WorkforceClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <WorkforceClient orgSlug={orgSlug} />;
}
