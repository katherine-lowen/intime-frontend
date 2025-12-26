import DecisionDetailClient from "./DecisionDetailClient";

export default async function Page({
  params,
}: {
  params: Promise<{ orgSlug: string; id: string }>;
}) {
  const { orgSlug, id } = await params;
  return <DecisionDetailClient orgSlug={orgSlug} id={id} />;
}
