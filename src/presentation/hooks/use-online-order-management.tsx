import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseOnlineOrderRepository } from "@/infrastructure/supabase/repositories/supabase-online-order.repository";
import type { OnlineOrderRepository } from "@/domain/repositories/online-order.repository";

const OnlineOrderContext = createContext<OnlineOrderRepository | undefined>(undefined);

const repository = new SupabaseOnlineOrderRepository();

export function OnlineOrderProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <OnlineOrderContext.Provider value={value}>{children}</OnlineOrderContext.Provider>;
}

export function useOnlineOrderRepository(): OnlineOrderRepository {
  const ctx = useContext(OnlineOrderContext);
  if (!ctx) throw new Error("useOnlineOrderRepository debe usarse dentro de <OnlineOrderProvider>.");
  return ctx;
}
