import HeadcountPlanDetailClient from "./HeadcountPlanDetailClient";

type Props = {
  params: Promise<{ orgSlug: string; id: string }>;
};

export default async function HeadcountPlanDetailPage({ params }: Props) {
  const { orgSlug, id } = await params;
  return <HeadcountPlanDetailClient orgSlug={orgSlug} planId={id} />;
}
