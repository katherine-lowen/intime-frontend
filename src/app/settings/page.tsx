// src/app/settings/page.tsx
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card className="mx-auto max-w-3xl p-4">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <p className="text-sm text-neutral-500">Organization & authentication settings.</p>
      </CardHeader>
      <CardContent>Coming soon.</CardContent>
    </Card>
  );
}

export {};
