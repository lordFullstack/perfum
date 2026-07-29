import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseSupplyRepository } from "@/infrastructure/supabase/repositories/supabase-supply.repository";
import type { SupplyRepository } from "@/domain/repositories/supply.repository";

const SupplyContext = createContext<SupplyRepository | undefined>(undefined);

const repository = new SupabaseSupplyRepository();

export function SupplyProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <SupplyContext.Provider value={value}>{children}</SupplyContext.Provider>;
}

export function useSupplyRepository(): SupplyRepository {
  const ctx = useContext(SupplyContext);
  if (!ctx) throw new Error("useSupplyRepository debe usarse dentro de <SupplyProvider>.");
  return ctx;
}
