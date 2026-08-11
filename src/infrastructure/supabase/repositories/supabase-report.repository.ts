import type { GetSalesReportInput, ReportRepository } from "@/domain/repositories/report.repository";
import type { SalesReport } from "@/domain/entities/sales-report.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawSalesReport {
  scope: "own" | "all";
  startDate: string;
  endDate: string;
  salesCount: number;
  salesRevenue: number;
  salesByDay: { day: string; sales_count: number; revenue: number }[];
  topPerfumes: { perfume_id: string; name: string; quantity: number; revenue: number }[];
  purchasesCost?: number;
  productionCost?: number;
  grossMargin?: number;
  cashIncome?: number;
  cashExpense?: number;
}

function mapReport(raw: RawSalesReport): SalesReport {
  return {
    scope: raw.scope,
    startDate: raw.startDate,
    endDate: raw.endDate,
    salesCount: Number(raw.salesCount),
    salesRevenue: Number(raw.salesRevenue),
    salesByDay: (raw.salesByDay ?? []).map((d) => ({
      day: d.day,
      salesCount: Number(d.sales_count),
      revenue: Number(d.revenue),
    })),
    topPerfumes: (raw.topPerfumes ?? []).map((p) => ({
      perfumeId: p.perfume_id,
      name: p.name,
      quantity: Number(p.quantity),
      revenue: Number(p.revenue),
    })),
    purchasesCost: raw.purchasesCost !== undefined ? Number(raw.purchasesCost) : null,
    productionCost: raw.productionCost !== undefined ? Number(raw.productionCost) : null,
    grossMargin: raw.grossMargin !== undefined ? Number(raw.grossMargin) : null,
    cashIncome: raw.cashIncome !== undefined ? Number(raw.cashIncome) : null,
    cashExpense: raw.cashExpense !== undefined ? Number(raw.cashExpense) : null,
  };
}

export class SupabaseReportRepository implements ReportRepository {
  async getSalesReport(input: GetSalesReportInput): Promise<SalesReport> {
    const { data, error } = await supabase.rpc("get_sales_report", {
      p_start_date: input.startDate,
      p_end_date: input.endDate,
    });

    if (error || !data) throw new Error(error?.message ?? "No se pudo generar el reporte.");
    return mapReport(data as unknown as RawSalesReport);
  }
}
