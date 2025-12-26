import NotificationsPreferencesClient from "./PreferencesClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <NotificationsPreferencesClient orgSlug={orgSlug} />;
}
