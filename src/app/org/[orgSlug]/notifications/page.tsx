import NotificationsClient from "./NotificationsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <NotificationsClient orgSlug={orgSlug} />;
}
