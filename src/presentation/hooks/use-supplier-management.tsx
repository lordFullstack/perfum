import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseSupplierRepository } from "@/infrastructure/supabase/repositories/supabase-supplier.repository";
import type { SupplierRepository } from "@/domain/repositories/supplier.repository";

const SupplierContext = createContext<SupplierRepository | undefined>(undefined);

const repository = new SupabaseSupplierRepository();

export function SupplierProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <SupplierContext.Provider value={value}>{children}</SupplierContext.Provider>;
}

export function useSupplierRepository(): SupplierRepository {
  const ctx = useContext(SupplierContext);
  if (!ctx) throw new Error("useSupplierRepository debe usarse dentro de <SupplierProvider>.");
  return ctx;
}
