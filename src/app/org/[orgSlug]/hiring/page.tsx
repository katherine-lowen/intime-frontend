import HiringPage from "@/features/hiring/HiringPage";
import { Suspense } from "react";

type Props = {
  params: Promise<{ orgSlug: string }>;
};

export default async function OrgHiringRoute({ params }: Props) {
  const { orgSlug } = await params;

  return (
    <Suspense fallback={null}>
      <HiringPage orgSlug={orgSlug} />
    </Suspense>
  );
}
