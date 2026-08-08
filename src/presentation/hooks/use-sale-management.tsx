import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseSaleRepository } from "@/infrastructure/supabase/repositories/supabase-sale.repository";
import type { SaleRepository } from "@/domain/repositories/sale.repository";

const SaleContext = createContext<SaleRepository | undefined>(undefined);

const repository = new SupabaseSaleRepository();

export function SaleProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <SaleContext.Provider value={value}>{children}</SaleContext.Provider>;
}

export function useSaleRepository(): SaleRepository {
  const ctx = useContext(SaleContext);
  if (!ctx) throw new Error("useSaleRepository debe usarse dentro de <SaleProvider>.");
  return ctx;
}
