"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/context/auth";
import api from "@/lib/api";
import { Loader2 } from "lucide-react";

type ReviewListItem = {
  id: string;
  title: string;
  type?: "SELF" | "MANAGER";
  status?: string;
  dueDate?: string | null;
};

export default function MyReviewsPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug ?? "demo-org";
  const { userId, isLoading } = useAuth();
  const [selfReviews, setSelfReviews] = useState<ReviewListItem[]>([]);
  const [managerReviews, setManagerReviews] = useState<ReviewListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      if (!userId) return;
      try {
        setLoading(true);
        const res = await api.get<{ self?: ReviewListItem[]; manager?: ReviewListItem[] }>(
          `/performance/reviews/my`
        );
        if (cancelled) return;
        setSelfReviews(res?.self || []);
        setManagerReviews(res?.manager || []);
        setError(null);
      } catch (err: any) {
        if (!cancelled) setError(err?.message || "Unable to load reviews");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (isLoading || loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-slate-500">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
        {error}
      </div>
    );
  }

  return (
    <main className="space-y-5">
      <header>
        <p className="text-xs uppercase tracking-wide text-slate-500">Performance</p>
        <h1 className="text-2xl font-semibold text-slate-900">My Reviews</h1>
        <p className="text-sm text-slate-600">Complete the reviews assigned to you.</p>
      </header>

      <div className="grid gap-4 md:grid-cols-2">
        <ReviewSection title="Self reviews" reviews={selfReviews} orgSlug={orgSlug} />
        <ReviewSection title="Manager reviews" reviews={managerReviews} orgSlug={orgSlug} />
      </div>
    </main>
  );
}

function ReviewSection({
  title,
  reviews,
  orgSlug,
}: {
  title: string;
  reviews: ReviewListItem[];
  orgSlug: string;
}) {
  return (
    <Card className="border-slate-200">
      <CardHeader>
        <CardTitle className="text-sm">{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm text-slate-700">
        {reviews.length === 0 && <p className="text-xs text-slate-500">No reviews assigned.</p>}
        {reviews.map((r) => (
          <Link
            key={r.id}
            href={`/org/${orgSlug}/performance/reviews/${r.id}`}
            className="flex items-center justify-between rounded-lg border border-slate-100 bg-white px-3 py-2 hover:bg-slate-50"
          >
            <div>
              <p className="font-medium text-slate-900">{r.title}</p>
              {r.dueDate && (
                <p className="text-[11px] text-slate-500">
                  Due {new Date(r.dueDate).toLocaleDateString()}
                </p>
              )}
            </div>
            {r.status && (
              <Badge variant="outline" className="text-[11px] capitalize">
                {r.status.toLowerCase()}
              </Badge>
            )}
          </Link>
        ))}
      </CardContent>
    </Card>
  );
}
