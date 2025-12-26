"use client";

import { useEffect, useState } from "react";
import api from "@/lib/api";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";

export function SetupChecklistCard() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await api.get("/me/setup-checklist");
        setData(res);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return null;
  if (!data) return null;
  if (data.allDone) return null;

  const steps = data.steps;

  const items = [
    { id: "employees", label: "Add your first team member", href: "/people" },
    { id: "jobs", label: "Post your first job", href: "/jobs/new" },
    { id: "ptoPolicies", label: "Create PTO policy", href: "/timeoff/policies" },
    { id: "invites", label: "Invite teammates", href: "/settings/members" },
  ];

  return (
    <Card className="border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="mb-2 text-sm font-semibold">Welcome to Intime 👋</h3>
      <p className="mb-4 text-xs text-slate-500">
        Complete these steps to set up your workspace.
      </p>

      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item.id} className="flex items-center gap-3">
            <Checkbox checked={steps[item.id].done} disabled />
            <a
              href={item.href}
              className={`text-sm ${
                steps[item.id].done
                  ? "text-slate-400 line-through"
                  : "text-slate-700 hover:underline"
              }`}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>

      <div className="mt-4 flex justify-end">
        <Button
          size="sm"
          variant="outline"
          onClick={() => window.location.reload()}
        >
          Refresh
        </Button>
      </div>
    </Card>
  );
}
