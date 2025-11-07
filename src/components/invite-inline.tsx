"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import api from "@/lib/api"; // ✅ uses your existing api helper

export function InviteInline() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("sending");
    try {
      // ✅ works with MOCK mode or real backend
      await api.post("/teams/invite", { email });
      setStatus("sent");
      setEmail("");
    } catch {
      setStatus("error");
    }
  }

  return (
    <form onSubmit={onSubmit} className="flex gap-2">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="user@company.com"
        className="w-full rounded border px-3 py-2"
      />
      <button
        type="submit"
        disabled={status === "sending"}
        className="rounded bg-black px-3 py-2 text-white disabled:opacity-50"
      >
        {status === "sending" ? "Sending..." : "Invite"}
      </button>
      {status === "sent" && <span className="text-sm text-green-700">Sent</span>}
      {status === "error" && <span className="text-sm text-red-700">Failed</span>}
    </form>
  );
}
