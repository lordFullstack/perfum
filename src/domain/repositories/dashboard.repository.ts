import type { DashboardSummary } from "@/domain/entities/dashboard-summary.entity";

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}
