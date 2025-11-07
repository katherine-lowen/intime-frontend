// src/app/settings/page.tsx
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";

export default function SettingsPage() {
  return (
    <Card className="mx-auto max-w-3xl p-4">
      <CardHeader>
        <CardTitle>Settings</CardTitle>
        <CardDescription>Organization & authentication settings.</CardDescription>
      </CardHeader>
      <CardContent>Coming soon.</CardContent>
    </Card>
  );
}

export {};
