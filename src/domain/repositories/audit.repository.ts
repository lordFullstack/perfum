import type { AuditLogEntry } from "@/domain/entities/audit-log-entry.entity";

export interface AuditLogFilters {
  tableName: string | null;
  limit: number;
  offset: number;
}

export interface AuditRepository {
  listEntries(filters: AuditLogFilters): Promise<AuditLogEntry[]>;
  listAuditedTables(): Promise<string[]>;
}
