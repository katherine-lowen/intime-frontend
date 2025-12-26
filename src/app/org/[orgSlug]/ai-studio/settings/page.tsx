import SettingsClient from "./SettingsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <SettingsClient orgSlug={orgSlug} />;
}
