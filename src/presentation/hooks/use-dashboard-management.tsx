import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseDashboardRepository } from "@/infrastructure/supabase/repositories/supabase-dashboard.repository";
import type { DashboardRepository } from "@/domain/repositories/dashboard.repository";

const DashboardContext = createContext<DashboardRepository | undefined>(undefined);

const repository = new SupabaseDashboardRepository();

export function DashboardProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <DashboardContext.Provider value={value}>{children}</DashboardContext.Provider>;
}

export function useDashboardRepository(): DashboardRepository {
  const ctx = useContext(DashboardContext);
  if (!ctx) throw new Error("useDashboardRepository debe usarse dentro de <DashboardProvider>.");
  return ctx;
}
