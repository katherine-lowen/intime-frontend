"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import type { ReactNode } from "react";

export type OrgMembership = {
  orgId: string;
  orgName: string;
  orgSlug: string;
  role: "OWNER" | "ADMIN" | "MANAGER" | "EMPLOYEE";
};

export type AuthState = {
  userId: string;
  email: string;
  activeOrgId: string | null;
  orgMemberships: OrgMembership[];
  activeOrg: OrgMembership | null;
  isLoading: boolean;
  error?: string;
};

type AuthContextValue = AuthState & {
  setActiveOrg: (orgId: string) => Promise<void>;
  refetch: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

const initialState: AuthState = {
  userId: "",
  email: "",
  activeOrgId: null,
  orgMemberships: [],
  activeOrg: null,
  isLoading: true,
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>(initialState);

  const deriveActiveOrg = useCallback(
    (activeOrgId: string | null, memberships: OrgMembership[]) =>
      memberships.find((m) => m.orgId === activeOrgId) ?? null,
    []
  );

  const fetchAuth = useCallback(async () => {
    // TODO: wire real auth; placeholder keeps UI usable without demo defaults
    setState((prev) => ({
      ...prev,
      isLoading: false,
      error: prev.error,
    }));
  }, [deriveActiveOrg]);

  useEffect(() => {
    void fetchAuth();
  }, [fetchAuth]);

  const setActiveOrg = useCallback(
    async (orgId: string) => {
      // immediate client swap
      const match = state.orgMemberships.find((m) => m.orgId === orgId) ?? null;

      setState((prev) => ({
        ...prev,
        activeOrgId: orgId,
        activeOrg: match,
      }));
    },
    [state.orgMemberships]
  );

  const value: AuthContextValue = useMemo(
    () => ({
      ...state,
      setActiveOrg,
      refetch: fetchAuth,
    }),
    [state, setActiveOrg, fetchAuth]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
