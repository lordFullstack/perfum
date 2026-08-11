import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { AuditLogEntry } from "@/domain/entities/audit-log-entry.entity";
import { useAuditRepository } from "@/presentation/hooks/use-audit-management";

const PAGE_SIZE = 50;

export function useAuditLog() {
  const repository = useAuditRepository();
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [tables, setTables] = useState<string[]>([]);
  const [tableFilter, setTableFilter] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    repository.listAuditedTables().then(setTables);
  }, [repository]);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await repository.listEntries({ tableName: tableFilter, limit: PAGE_SIZE, offset: 0 });
      setEntries(data);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el registro de auditoría.");
    } finally {
      setIsLoading(false);
    }
  }, [repository, tableFilter]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function loadMore() {
    setIsLoadingMore(true);
    try {
      const data = await repository.listEntries({
        tableName: tableFilter,
        limit: PAGE_SIZE,
        offset: entries.length,
      });
      setEntries((prev) => [...prev, ...data]);
      setHasMore(data.length === PAGE_SIZE);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar más movimientos.");
    } finally {
      setIsLoadingMore(false);
    }
  }

  return { entries, tables, tableFilter, setTableFilter, isLoading, isLoadingMore, hasMore, loadMore };
}
