import ComplianceClient from "./ComplianceClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ComplianceClient orgSlug={orgSlug} />;
}
