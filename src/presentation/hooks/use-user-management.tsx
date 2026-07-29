import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseUserManagementRepository } from "@/infrastructure/supabase/repositories/supabase-user-management.repository";
import type { UserManagementRepository } from "@/domain/repositories/user-management.repository";

const UserManagementContext = createContext<UserManagementRepository | undefined>(undefined);

const repository = new SupabaseUserManagementRepository();

export function UserManagementProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return (
    <UserManagementContext.Provider value={value}>{children}</UserManagementContext.Provider>
  );
}

export function useUserManagementRepository(): UserManagementRepository {
  const ctx = useContext(UserManagementContext);
  if (!ctx) {
    throw new Error("useUserManagementRepository debe usarse dentro de <UserManagementProvider>.");
  }
  return ctx;
}
