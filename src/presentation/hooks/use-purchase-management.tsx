import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabasePurchaseRepository } from "@/infrastructure/supabase/repositories/supabase-purchase.repository";
import type { PurchaseRepository } from "@/domain/repositories/purchase.repository";

const PurchaseContext = createContext<PurchaseRepository | undefined>(undefined);

const repository = new SupabasePurchaseRepository();

export function PurchaseProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <PurchaseContext.Provider value={value}>{children}</PurchaseContext.Provider>;
}

export function usePurchaseRepository(): PurchaseRepository {
  const ctx = useContext(PurchaseContext);
  if (!ctx) throw new Error("usePurchaseRepository debe usarse dentro de <PurchaseProvider>.");
  return ctx;
}
