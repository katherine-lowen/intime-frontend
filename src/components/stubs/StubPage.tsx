"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type StubPageProps = {
  title: string;
  description: string;
  bullets?: string[];
  primaryCta?: { label: string; href: (orgSlug: string) => string };
};

export default function StubPage({ title, description, bullets = [], primaryCta }: StubPageProps) {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug ?? "demo-org";

  return (
    <main className="min-h-[60vh]">
      <Card className="border-slate-800 bg-slate-950 text-slate-100">
        <CardHeader>
          <CardTitle className="text-xl text-white">{title}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-slate-200">
          <p className="text-slate-300">{description}</p>
          {bullets.length > 0 && (
            <ul className="list-disc space-y-1 pl-5 text-slate-300">
              {bullets.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          )}
          {primaryCta && (
            <Button
              asChild
              className="bg-indigo-500 text-white hover:bg-indigo-400"
            >
              <Link href={primaryCta.href(orgSlug)}>{primaryCta.label}</Link>
            </Button>
          )}
        </CardContent>
      </Card>
    </main>
  );
}
