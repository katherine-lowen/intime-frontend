import ReconciliationClient from "./ReconciliationClient";

export default async function ReconciliationPage({
  params,
}: {
  params: Promise<{ orgSlug: string }>;
}) {
  const { orgSlug } = await params;
  return <ReconciliationClient orgSlug={orgSlug} />;
}
