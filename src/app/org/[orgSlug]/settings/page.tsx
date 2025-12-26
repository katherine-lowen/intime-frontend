"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useCurrentOrg } from "@/hooks/useCurrentOrg";

export default function OrgSettingsIndexPage() {
  const params = useParams<{ orgSlug: string }>();
  const orgSlug = params?.orgSlug;
  const { isOwner, isAdmin } = useCurrentOrg();

  if (!orgSlug) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        Organization not found.
      </div>
    );
  }

  const cards = [
    {
      title: "Members",
      description: "Manage who has access to your workspace.",
      href: `/org/${orgSlug}/settings/members`,
      visible: true,
    },
    {
      title: "Billing",
      description: "Update plan, payment methods, and invoices.",
      href: `/org/${orgSlug}/settings/billing`,
      visible: isOwner,
    },
    {
      title: "Audit log",
      description: "Review recent activity for compliance and security.",
      href: `/org/${orgSlug}/settings/audit-log`,
      visible: isOwner || isAdmin,
    },
    {
      title: "Data exports",
      description: "Download employees, jobs, and candidates as CSV.",
      href: `/org/${orgSlug}/settings/data`,
      visible: isOwner || isAdmin,
    },
    {
      title: "Support",
      description: "Get help and share diagnostics with our team.",
      href: `/org/${orgSlug}/settings/support`,
      visible: true,
    },
  ].filter((card) => card.visible);

  return (
    <main className="mx-auto max-w-5xl px-4 py-10 space-y-6">
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-wide text-slate-500">Settings</p>
        <h1 className="text-2xl font-semibold text-slate-900">Workspace settings</h1>
        <p className="text-sm text-slate-600">
          Configure your organization, members, and billing.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {cards.map((card) => (
          <Card key={card.title} className="border-slate-200">
            <CardHeader>
              <CardTitle className="text-base">{card.title}</CardTitle>
            </CardHeader>
            <CardContent className="flex items-center justify-between gap-3 text-sm text-slate-600">
              <p className="max-w-xs">{card.description}</p>
              <Button asChild size="sm">
                <Link href={card.href}>Open</Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </main>
  );
}
