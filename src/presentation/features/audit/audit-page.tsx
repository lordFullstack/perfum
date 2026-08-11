import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

import type { AuditLogEntry } from "@/domain/entities/audit-log-entry.entity";
import { useAuditLog } from "@/presentation/features/audit/use-audit-log";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

const ACTION_LABELS: Record<string, string> = {
  INSERT: "Creación",
  UPDATE: "Modificación",
  DELETE: "Eliminación",
};

const ACTION_BADGE: Record<string, "success" | "outline" | "destructive"> = {
  INSERT: "success",
  UPDATE: "outline",
  DELETE: "destructive",
};

const TABLE_LABELS: Record<string, string> = {
  perfumes: "Perfumes",
  recipes: "Recetas",
  supplies: "Insumos",
  suppliers: "Proveedores",
  customers: "Clientes",
  purchases: "Compras",
  sales: "Ventas",
  production_orders: "Producción",
  cash_sessions: "Caja",
  profiles: "Usuarios",
};

function changedFields(entry: AuditLogEntry): string[] {
  if (entry.action !== "UPDATE" || !entry.oldData || !entry.newData) return [];
  const keys = new Set([...Object.keys(entry.oldData), ...Object.keys(entry.newData)]);
  const changed: string[] = [];
  keys.forEach((key) => {
    if (key === "updated_at" || key === "created_at") return;
    if (JSON.stringify(entry.oldData?.[key]) !== JSON.stringify(entry.newData?.[key])) {
      changed.push(key);
    }
  });
  return changed;
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return "—";
  if (typeof value === "boolean") return value ? "sí" : "no";
  return String(value);
}

export function AuditPage() {
  const { entries, tables, tableFilter, setTableFilter, isLoading, isLoadingMore, hasMore, loadMore } =
    useAuditLog();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Auditoría</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Registro de quién creó, modificó o eliminó cada dato del sistema
        </p>
      </div>

      <Select
        value={tableFilter ?? "__all__"}
        onValueChange={(v) => setTableFilter(v === "__all__" ? null : v)}
      >
        <SelectTrigger className="w-56">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__all__">Todos los módulos</SelectItem>
          {tables.map((t) => (
            <SelectItem key={t} value={t}>
              {TABLE_LABELS[t] ?? t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>
      ) : entries.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Sin movimientos registrados</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Acá vas a ver cada alta, edición o baja realizada en el sistema.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Cuándo</TableHead>
                <TableHead>Módulo</TableHead>
                <TableHead>Acción</TableHead>
                <TableHead>Quién</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => {
                const isExpanded = expandedId === entry.id;
                const fields = changedFields(entry);
                const detailData = entry.action === "DELETE" ? entry.oldData : entry.newData;

                return (
                  <Fragment key={entry.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="font-data text-xs text-muted-foreground">
                        {new Date(entry.changedAt).toLocaleString()}
                      </TableCell>
                      <TableCell className="text-sm text-foreground">
                        {TABLE_LABELS[entry.tableName] ?? entry.tableName}
                      </TableCell>
                      <TableCell>
                        <Badge variant={ACTION_BADGE[entry.action]}>{ACTION_LABELS[entry.action]}</Badge>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {entry.changedByName ?? "Sistema"}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="bg-muted/30 py-3">
                          <div className="flex flex-col gap-1.5 pl-8">
                            {entry.action === "UPDATE" ? (
                              fields.length === 0 ? (
                                <p className="text-sm text-muted-foreground">Sin cambios en los campos.</p>
                              ) : (
                                fields.map((field) => (
                                  <div key={field} className="flex flex-wrap items-center gap-2 text-sm">
                                    <span className="font-data text-muted-foreground">{field}:</span>
                                    <span className="text-destructive line-through">
                                      {formatValue(entry.oldData?.[field])}
                                    </span>
                                    <span className="text-muted-foreground">→</span>
                                    <span className="text-success">{formatValue(entry.newData?.[field])}</span>
                                  </div>
                                ))
                              )
                            ) : (
                              detailData && (
                                <div className="flex flex-col gap-1">
                                  {Object.entries(detailData)
                                    .filter(([key]) => key !== "id" && key !== "branch_id")
                                    .slice(0, 8)
                                    .map(([key, value]) => (
                                      <div key={key} className="flex gap-2 text-sm">
                                        <span className="font-data text-muted-foreground">{key}:</span>
                                        <span className="text-foreground">{formatValue(value)}</span>
                                      </div>
                                    ))}
                                </div>
                              )
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {hasMore && !isLoading && entries.length > 0 && (
        <Button variant="outline" onClick={loadMore} disabled={isLoadingMore} className="self-center">
          {isLoadingMore && <Loader2 className="size-4 animate-spin" />}
          Cargar más
        </Button>
      )}
    </div>
  );
}
