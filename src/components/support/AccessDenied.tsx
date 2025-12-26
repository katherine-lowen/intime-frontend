"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function AccessDenied({
  orgSlug,
  message,
}: {
  orgSlug?: string | null;
  message?: string;
}) {
  return (
    <Card className="border-amber-200 bg-amber-50">
      <CardHeader>
        <CardTitle className="text-base text-amber-900">Access denied</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm text-amber-900">
        <p>{message || "You do not have permission to view this page."}</p>
        {orgSlug ? (
          <Button asChild size="sm" variant="outline" className="border-amber-200">
            <Link href={`/org/${orgSlug}/dashboard`}>Back to dashboard</Link>
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
