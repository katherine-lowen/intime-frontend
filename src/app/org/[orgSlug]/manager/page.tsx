import ManagerHomeClient from "./ManagerHomeClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ManagerHomeClient orgSlug={orgSlug} />;
}
