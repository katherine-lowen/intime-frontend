import DecisionNarrativeClient from "./DecisionNarrativeClient";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function DecisionNarrativePage({ params }: Props) {
  const { orgSlug } = await params;
  return <DecisionNarrativeClient orgSlug={orgSlug} />;
}
