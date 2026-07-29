import { AlertTriangle } from "lucide-react";

import { isLowStock } from "@/domain/entities/supply.entity";
import { usePermission } from "@/presentation/hooks/use-permission";
import { useSupplies } from "@/presentation/features/inventory/use-supplies";
import { SupplyFormDialog } from "@/presentation/features/inventory/supply-form-dialog";
import { AdjustStockDialog } from "@/presentation/features/inventory/adjust-stock-dialog";
import { StockLevelGauge } from "@/presentation/components/shared/stock-level-gauge";
import { Badge } from "@/presentation/components/ui/badge";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

export function InventoryPage() {
  const canCreate = usePermission("inventory.create");
  const canUpdate = usePermission("inventory.update");
  const canAdjust = usePermission("inventory.adjust");
  const canReadCost = usePermission("inventory.read_cost");

  const { supplies, categories, units, isLoading, createSupply, updateSupply, adjustStock } =
    useSupplies();

  const lowStockCount = supplies.filter(isLowStock).length;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Inventario de Insumos</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {supplies.length} insumo{supplies.length !== 1 && "s"} activo
            {supplies.length !== 1 && "s"}
            {lowStockCount > 0 && (
              <span className="ml-2 inline-flex items-center gap-1 text-warning">
                <AlertTriangle className="size-3.5" />
                {lowStockCount} con stock bajo
              </span>
            )}
          </p>
        </div>
        {canCreate && (
          <SupplyFormDialog categories={categories} units={units} onSubmit={createSupply} />
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : supplies.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay insumos cargados</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Empezá creando el primero — alcohol, esencias, envases, lo que uses para fabricar tus perfumes.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Insumo</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Nivel</TableHead>
                <TableHead>Stock</TableHead>
                {canReadCost && <TableHead>Costo prom.</TableHead>}
                <TableHead>Ubicación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplies.map((supply) => {
                const low = isLowStock(supply);
                return (
                  <TableRow key={supply.id}>
                    <TableCell>
                      <p className="text-sm font-medium text-foreground">{supply.name}</p>
                      <p className="font-data text-xs text-muted-foreground">{supply.code}</p>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {supply.categoryName}
                    </TableCell>
                    <TableCell>
                      <StockLevelGauge stock={supply.stock} minStock={supply.minStock} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 font-data text-sm">
                        {supply.stock} {supply.unitAbbreviation}
                        {low && <Badge variant="warning">Bajo</Badge>}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        mín. {supply.minStock} {supply.unitAbbreviation}
                      </p>
                    </TableCell>
                    {canReadCost && (
                      <TableCell className="font-data text-sm">
                        ${supply.averageCost.toFixed(2)}
                      </TableCell>
                    )}
                    <TableCell className="text-sm text-muted-foreground">
                      {supply.location ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        {canAdjust && <AdjustStockDialog supply={supply} onAdjust={adjustStock} />}
                        {canUpdate && (
                          <SupplyFormDialog
                            categories={categories}
                            units={units}
                            supply={supply}
                            onSubmit={(input) => updateSupply(supply.id, input)}
                          />
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
