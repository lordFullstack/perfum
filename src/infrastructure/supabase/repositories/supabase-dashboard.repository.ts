import type { DashboardRepository } from "@/domain/repositories/dashboard.repository";
import type { DashboardSummary } from "@/domain/entities/dashboard-summary.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawDashboardSummary {
  scope: "own" | "full";
  todaySalesCount: number;
  todaySalesRevenue: number;
  weekSalesRevenue: number;
  cashSession: { isOpen: boolean; openingAmount: number; openedByMe: boolean } | null;
  lowStockCount?: number;
  pendingOnlineOrdersCount?: number;
}

export class SupabaseDashboardRepository implements DashboardRepository {
  async getSummary(): Promise<DashboardSummary> {
    const { data, error } = await supabase.rpc("get_dashboard_summary");
    if (error || !data) throw new Error(error?.message ?? "No se pudo cargar el dashboard.");

    const raw = data as unknown as RawDashboardSummary;
    return {
      scope: raw.scope,
      todaySalesCount: Number(raw.todaySalesCount),
      todaySalesRevenue: Number(raw.todaySalesRevenue),
      weekSalesRevenue: Number(raw.weekSalesRevenue),
      cashSession: raw.cashSession
        ? {
            isOpen: raw.cashSession.isOpen,
            openingAmount: Number(raw.cashSession.openingAmount),
            openedByMe: raw.cashSession.openedByMe,
          }
        : null,
      lowStockCount: raw.lowStockCount !== undefined ? Number(raw.lowStockCount) : null,
      pendingOnlineOrdersCount:
        raw.pendingOnlineOrdersCount !== undefined ? Number(raw.pendingOnlineOrdersCount) : null,
    };
  }
}
