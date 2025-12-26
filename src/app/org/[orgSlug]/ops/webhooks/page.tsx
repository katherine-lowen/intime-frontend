import WebhooksClient from "./WebhooksClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <WebhooksClient orgSlug={orgSlug} />;
}
