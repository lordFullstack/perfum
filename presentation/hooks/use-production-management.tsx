import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseProductionRepository } from "@/infrastructure/supabase/repositories/supabase-production.repository";
import type { ProductionRepository } from "@/domain/repositories/production.repository";

const ProductionContext = createContext<ProductionRepository | undefined>(undefined);

const repository = new SupabaseProductionRepository();

export function ProductionProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <ProductionContext.Provider value={value}>{children}</ProductionContext.Provider>;
}

export function useProductionRepository(): ProductionRepository {
  const ctx = useContext(ProductionContext);
  if (!ctx) throw new Error("useProductionRepository debe usarse dentro de <ProductionProvider>.");
  return ctx;
}
