import BandsClient from "./BandsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <BandsClient orgSlug={orgSlug} />;
}
