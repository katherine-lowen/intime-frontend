import AlertsClient from "./AlertsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <AlertsClient orgSlug={orgSlug} />;
}
