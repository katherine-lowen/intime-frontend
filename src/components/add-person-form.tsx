"use client";

import { useEffect, useState, type FormEvent } from "react";
import api from "@/lib/api";

type Team = {
  id: string;
  name: string;
};

type EmployeeStatus = "ACTIVE" | "ON_LEAVE" | "CONTRACTOR" | "ALUMNI";

const STATUS_LABELS: Record<EmployeeStatus, string> = {
  ACTIVE: "Active",
  ON_LEAVE: "On leave",
  CONTRACTOR: "Contractor",
  ALUMNI: "Alumni",
};

export default function AddPersonForm({ onDone }: { onDone?: () => void }) {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [title, setTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [location, setLocation] = useState("");
  const [startDate, setStartDate] = useState("");
  const [status, setStatus] = useState<EmployeeStatus>("ACTIVE");
  const [teamId, setTeamId] = useState<string>("");

  const [teams, setTeams] = useState<Team[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Load teams for dropdown
  useEffect(() => {
    let cancelled = false;

    async function loadTeams() {
      setLoadingTeams(true);
      try {
        const data = await api.get<Team[]>("/teams");

        // Normalize: api.get<T>() returns T | undefined in your setup
        const list: Team[] = Array.isArray(data) ? data : [];

        if (!cancelled) setTeams(list);
      } catch (err) {
        console.error("Failed to load teams in AddPersonForm", err);
      } finally {
        if (!cancelled) setLoadingTeams(false);
      }
    }

    loadTeams();
    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      await api.post("/employees", {
        firstName,
        lastName,
        email: email || undefined,
        title: title || undefined,
        department: department || undefined,
        location: location || undefined,
        startDate: startDate || undefined,
        status,
        teamId: teamId || undefined,
      });

      if (onDone) onDone();
      else if (typeof window !== "undefined") {
        window.location.href = "/people";
      }
    } catch (err) {
      console.error("Failed to create person", err);
      setError("Could not create person. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 text-sm">
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            First name
          </label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            required
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Last name
          </label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">Email</label>
        <input
          type="email"
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="name@company.com"
        />
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Title</label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Department
          </label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={department}
            onChange={(e) => setDepartment(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Location
          </label>
          <input
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">
            Start date
          </label>
          <input
            type="date"
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-medium text-slate-700">Status</label>
          <select
            className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
            value={status}
            onChange={(e) => setStatus(e.target.value as EmployeeStatus)}
          >
            {Object.entries(STATUS_LABELS).map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-medium text-slate-700">Team</label>
        <select
          className="w-full rounded border border-slate-300 px-2 py-1.5 text-sm"
          value={teamId}
          onChange={(e) => setTeamId(e.target.value)}
        >
          <option value="">
            {loadingTeams ? "Loading teams…" : "No team"}
          </option>
          {teams.map((team) => (
            <option key={team.id} value={team.id}>
              {team.name}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="text-xs text-red-600">{error}</p>}

      <button
        type="submit"
        disabled={saving}
        className="rounded-md bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-800 disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save person"}
      </button>
    </form>
  );
}
