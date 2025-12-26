import ActionsClient from "./ActionsClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ActionsClient orgSlug={orgSlug} />;
}
