import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseCatalogRepository } from "@/infrastructure/supabase/repositories/supabase-catalog.repository";
import type { CatalogRepository } from "@/domain/repositories/catalog.repository";

const CatalogContext = createContext<CatalogRepository | undefined>(undefined);

const repository = new SupabaseCatalogRepository();

export function CatalogProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalogRepository(): CatalogRepository {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error("useCatalogRepository debe usarse dentro de <CatalogProvider>.");
  return ctx;
}
