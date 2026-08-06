import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabasePerfumeRepository } from "@/infrastructure/supabase/repositories/supabase-perfume.repository";
import type { PerfumeRepository } from "@/domain/repositories/perfume.repository";

const PerfumeContext = createContext<PerfumeRepository | undefined>(undefined);

const repository = new SupabasePerfumeRepository();

export function PerfumeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <PerfumeContext.Provider value={value}>{children}</PerfumeContext.Provider>;
}

export function usePerfumeRepository(): PerfumeRepository {
  const ctx = useContext(PerfumeContext);
  if (!ctx) throw new Error("usePerfumeRepository debe usarse dentro de <PerfumeProvider>.");
  return ctx;
}
