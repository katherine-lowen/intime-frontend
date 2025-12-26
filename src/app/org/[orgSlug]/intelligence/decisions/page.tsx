import DecisionsListClient from "./DecisionsListClient";

export default async function Page({ params }: { params: Promise<{ orgSlug: string }> }) {
  const { orgSlug } = await params;
  return <DecisionsListClient orgSlug={orgSlug} />;
}
