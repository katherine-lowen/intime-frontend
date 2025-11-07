// src/context/auth.tsx
"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";

export type Role = "admin" | "employee";

export type AuthCtx = {
  currentRole: Role;
  setRole: (r: Role) => void;
};

const AuthContext = createContext<AuthCtx | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setRole] = useState<Role>("admin"); // default; tweak as needed
  const value: AuthCtx = { currentRole, setRole };
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthCtx {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within <AuthProvider>");
  return ctx;
}
