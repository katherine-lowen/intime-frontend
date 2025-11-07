"use client";
import { createContext, useContext, useState, ReactNode } from "react";

export type Role = "admin" | "employee";
type Ctx = { currentRole: Role; setRole: (r: Role) => void };
const AuthContext = createContext<Ctx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentRole, setRole] = useState<Role>("admin");
  return <AuthContext.Provider value={{ currentRole, setRole }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
