import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseCashRepository } from "@/infrastructure/supabase/repositories/supabase-cash.repository";
import type { CashRepository } from "@/domain/repositories/cash.repository";

const CashContext = createContext<CashRepository | undefined>(undefined);

const repository = new SupabaseCashRepository();

export function CashProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <CashContext.Provider value={value}>{children}</CashContext.Provider>;
}

export function useCashRepository(): CashRepository {
  const ctx = useContext(CashContext);
  if (!ctx) throw new Error("useCashRepository debe usarse dentro de <CashProvider>.");
  return ctx;
}
