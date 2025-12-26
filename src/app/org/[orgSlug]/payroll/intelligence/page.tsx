import AnomaliesClient from "./AnomaliesClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <AnomaliesClient orgSlug={orgSlug} />;
}
