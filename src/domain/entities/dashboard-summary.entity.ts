export interface CashSessionSummary {
  isOpen: boolean;
  openingAmount: number;
  openedByMe: boolean;
}

export interface DashboardSummary {
  scope: "own" | "full";
  todaySalesCount: number;
  todaySalesRevenue: number;
  weekSalesRevenue: number;
  cashSession: CashSessionSummary | null;
  // Solo presentes cuando scope === "full" (dashboard.read_full)
  lowStockCount: number | null;
  pendingOnlineOrdersCount: number | null;
}
