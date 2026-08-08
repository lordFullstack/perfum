import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { usePerfumes } from "@/presentation/features/recipes/use-perfumes";
import { useProductions } from "@/presentation/features/production/use-productions";
import { ProductionFormDialog } from "@/presentation/features/production/production-form-dialog";
import { Badge } from "@/presentation/components/ui/badge";
import { Button } from "@/presentation/components/ui/button";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

export function ProductionPage() {
  const canCreate = usePermission("production.create");
  const canCancel = usePermission("production.cancel");

  const { perfumes } = usePerfumes();
  const { productions, isLoading, cancellingId, createProduction, cancelProduction } = useProductions();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Producción</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {productions.length} producción{productions.length !== 1 && "es"} registrada
            {productions.length !== 1 && "s"}
          </p>
        </div>
        {canCreate && <ProductionFormDialog perfumes={perfumes} onSubmit={createProduction} />}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : productions.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay producciones registradas</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Producí un perfume a partir de su receta activa para descontar insumos automáticamente.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Perfume</TableHead>
                <TableHead>Receta</TableHead>
                <TableHead>Cantidad</TableHead>
                <TableHead>Rinde</TableHead>
                <TableHead>Costo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productions.map((production) => {
                const isExpanded = expandedId === production.id;
                const isCancelling = cancellingId === production.id;

                return (
                  <Fragment key={production.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : production.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {production.perfumeName}
                      </TableCell>
                      <TableCell className="font-data text-sm text-muted-foreground">
                        v{production.recipeVersion}
                      </TableCell>
                      <TableCell className="font-data text-sm text-muted-foreground">
                        {production.quantityToProduce}
                      </TableCell>
                      <TableCell className="font-data text-sm text-muted-foreground">
                        {production.yieldTotalMl} ml
                      </TableCell>
                      <TableCell className="font-data text-sm font-medium text-foreground">
                        ${production.totalCost.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={production.status === "completed" ? "success" : "outline"}>
                          {production.status === "completed" ? "Completada" : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {canCancel && production.status === "completed" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isCancelling}
                            onClick={() => cancelProduction(production)}
                          >
                            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={8} className="bg-muted/30 py-3">
                          <div className="flex flex-col gap-1.5 pl-8">
                            {production.notes && (
                              <p className="mb-1 text-sm italic text-muted-foreground">
                                {production.notes}
                              </p>
                            )}
                            {production.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm text-muted-foreground"
                              >
                                <span className="text-foreground">
                                  {item.quantity} {item.unitAbbreviation} — {item.supplyName}
                                </span>
                                <span className="font-data">
                                  ${item.unitCost.toFixed(2)} c/u = ${item.subtotal.toFixed(2)}
                                </span>
                              </div>
                            ))}
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
    </div>
  );
}
