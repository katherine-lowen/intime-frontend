import DelegationsClient from "./DelegationsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <DelegationsClient orgSlug={orgSlug} />;
}
