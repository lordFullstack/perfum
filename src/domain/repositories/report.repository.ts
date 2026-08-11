import type { SalesReport } from "@/domain/entities/sales-report.entity";

export interface GetSalesReportInput {
  startDate: string;
  endDate: string;
}

export interface ReportRepository {
  getSalesReport(input: GetSalesReportInput): Promise<SalesReport>;
}
