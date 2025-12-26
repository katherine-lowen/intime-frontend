"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  initialStatus?: string;
  initialCategory?: string;
  initialQuery?: string;
  onChange: (vals: { status?: string; category?: string; q?: string }) => void;
};

export function DecisionFilters({ initialStatus, initialCategory, initialQuery, onChange }: Props) {
  const [status, setStatus] = useState(initialStatus || "");
  const [category, setCategory] = useState(initialCategory || "");
  const [q, setQ] = useState(initialQuery || "");

  return (
    <div className="flex flex-wrap items-center gap-2">
      <select
        value={status}
        onChange={(e) => {
          setStatus(e.target.value);
          onChange({ status: e.target.value || undefined, category, q });
        }}
        className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800"
      >
        <option value="">All statuses</option>
        <option value="OPEN">Open</option>
        <option value="ACCEPTED">Accepted</option>
        <option value="REJECTED">Rejected</option>
        <option value="DEFERRED">Deferred</option>
      </select>
      <Input
        placeholder="Category"
        value={category}
        className="w-32"
        onChange={(e) => {
          setCategory(e.target.value);
          onChange({ status, category: e.target.value || undefined, q });
        }}
      />
      <Input
        placeholder="Search"
        value={q}
        className="w-48"
        onChange={(e) => setQ(e.target.value)}
      />
      <Button
        size="sm"
        onClick={() => onChange({ status: status || undefined, category: category || undefined, q: q || undefined })}
      >
        Apply
      </Button>
    </div>
  );
}
