import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseAuditRepository } from "@/infrastructure/supabase/repositories/supabase-audit.repository";
import type { AuditRepository } from "@/domain/repositories/audit.repository";

const AuditContext = createContext<AuditRepository | undefined>(undefined);

const repository = new SupabaseAuditRepository();

export function AuditProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <AuditContext.Provider value={value}>{children}</AuditContext.Provider>;
}

export function useAuditRepository(): AuditRepository {
  const ctx = useContext(AuditContext);
  if (!ctx) throw new Error("useAuditRepository debe usarse dentro de <AuditProvider>.");
  return ctx;
}
