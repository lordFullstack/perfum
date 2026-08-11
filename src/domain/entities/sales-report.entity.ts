export type ReportScope = "own" | "all";

export interface SalesByDayEntry {
  day: string;
  salesCount: number;
  revenue: number;
}

export interface TopPerfumeEntry {
  perfumeId: string;
  name: string;
  quantity: number;
  revenue: number;
}

export interface SalesReport {
  scope: ReportScope;
  startDate: string;
  endDate: string;
  salesCount: number;
  salesRevenue: number;
  salesByDay: SalesByDayEntry[];
  topPerfumes: TopPerfumeEntry[];
  // Solo presentes cuando scope === "all" (reports.read_financial)
  purchasesCost: number | null;
  productionCost: number | null;
  grossMargin: number | null;
  cashIncome: number | null;
  cashExpense: number | null;
}
