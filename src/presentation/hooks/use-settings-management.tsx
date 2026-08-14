import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseSettingsRepository } from "@/infrastructure/supabase/repositories/supabase-settings.repository";
import type { SettingsRepository } from "@/domain/repositories/settings.repository";

const SettingsContext = createContext<SettingsRepository | undefined>(undefined);

const repository = new SupabaseSettingsRepository();

export function SettingsProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettingsRepository(): SettingsRepository {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettingsRepository debe usarse dentro de <SettingsProvider>.");
  return ctx;
}
