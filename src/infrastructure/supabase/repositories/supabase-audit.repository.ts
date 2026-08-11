import type { AuditLogFilters, AuditRepository } from "@/domain/repositories/audit.repository";
import type { AuditAction, AuditLogEntry } from "@/domain/entities/audit-log-entry.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawAuditLogRow {
  id: string;
  table_name: string;
  record_id: string | null;
  action: string;
  old_data: Record<string, unknown> | null;
  new_data: Record<string, unknown> | null;
  changed_by: string | null;
  changed_at: string;
  profiles: { full_name: string } | null;
}

// Mismo listado de tablas a las que se les agregó el trigger de auditoría (ver migración).
// Se mantiene acá para el filtro, no se consulta a la base porque una tabla sin
// movimientos todavía no tendría filas en audit_log pero igual debe poder filtrarse.
const AUDITED_TABLES = [
  "perfumes",
  "recipes",
  "supplies",
  "suppliers",
  "customers",
  "purchases",
  "sales",
  "production_orders",
  "cash_sessions",
  "profiles",
];

function mapRow(row: RawAuditLogRow): AuditLogEntry {
  return {
    id: row.id,
    tableName: row.table_name,
    recordId: row.record_id,
    action: row.action as AuditAction,
    oldData: row.old_data,
    newData: row.new_data,
    changedBy: row.changed_by,
    changedByName: row.profiles?.full_name ?? null,
    changedAt: row.changed_at,
  };
}

export class SupabaseAuditRepository implements AuditRepository {
  async listEntries(filters: AuditLogFilters): Promise<AuditLogEntry[]> {
    let query = supabase
      .from("audit_log")
      .select<
        string,
        RawAuditLogRow
      >("id, table_name, record_id, action, old_data, new_data, changed_by, changed_at, profiles:changed_by ( full_name )")
      .order("changed_at", { ascending: false })
      .range(filters.offset, filters.offset + filters.limit - 1);

    if (filters.tableName) {
      query = query.eq("table_name", filters.tableName);
    }

    const { data, error } = await query;
    if (error) throw new Error("No se pudo cargar el registro de auditoría.");
    return (data ?? []).map(mapRow);
  }

  async listAuditedTables(): Promise<string[]> {
    return AUDITED_TABLES;
  }
}
