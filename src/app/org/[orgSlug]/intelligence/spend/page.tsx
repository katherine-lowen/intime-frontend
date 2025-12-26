import SpendClient from "./SpendClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <SpendClient orgSlug={orgSlug} />;
}
