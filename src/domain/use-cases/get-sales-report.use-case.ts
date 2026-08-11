import type { GetSalesReportInput, ReportRepository } from "@/domain/repositories/report.repository";
import type { SalesReport } from "@/domain/entities/sales-report.entity";

export class InvalidReportRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidReportRangeError";
  }
}

export async function getSalesReportUseCase(
  repository: ReportRepository,
  input: GetSalesReportInput,
): Promise<SalesReport> {
  if (input.startDate > input.endDate) {
    throw new InvalidReportRangeError("La fecha inicial no puede ser posterior a la final.");
  }
  return repository.getSalesReport(input);
}
