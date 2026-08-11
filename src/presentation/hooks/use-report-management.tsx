import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseReportRepository } from "@/infrastructure/supabase/repositories/supabase-report.repository";
import type { ReportRepository } from "@/domain/repositories/report.repository";

const ReportContext = createContext<ReportRepository | undefined>(undefined);

const repository = new SupabaseReportRepository();

export function ReportProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <ReportContext.Provider value={value}>{children}</ReportContext.Provider>;
}

export function useReportRepository(): ReportRepository {
  const ctx = useContext(ReportContext);
  if (!ctx) throw new Error("useReportRepository debe usarse dentro de <ReportProvider>.");
  return ctx;
}
