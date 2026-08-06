import { useState, Fragment } from "react";
import { ChevronDown, ChevronRight, Loader2 } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { useSuppliers } from "@/presentation/features/suppliers/use-suppliers";
import { useSupplies } from "@/presentation/features/inventory/use-supplies";
import { usePurchases } from "@/presentation/features/purchases/use-purchases";
import { PurchaseFormDialog } from "@/presentation/features/purchases/purchase-form-dialog";
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

export function PurchasesPage() {
  const canCreate = usePermission("purchases.create");
  const canCancel = usePermission("purchases.cancel");

  const { suppliers } = useSuppliers();
  const { supplies } = useSupplies();
  const { purchases, isLoading, cancellingId, createPurchase, cancelPurchase } = usePurchases();

  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Compras</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {purchases.length} compra{purchases.length !== 1 && "s"} registrada
            {purchases.length !== 1 && "s"}
          </p>
        </div>
        {canCreate && (
          <PurchaseFormDialog suppliers={suppliers} supplies={supplies} onSubmit={createPurchase} />
        )}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : purchases.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay compras registradas</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Registrá una compra para cargar stock de insumos con su costo real.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Proveedor</TableHead>
                <TableHead>Fecha</TableHead>
                <TableHead>Factura</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => {
                const isExpanded = expandedId === purchase.id;
                const isCancelling = cancellingId === purchase.id;

                return (
                  <Fragment key={purchase.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : purchase.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {purchase.supplierName}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {purchase.purchaseDate}
                      </TableCell>
                      <TableCell className="font-data text-sm text-muted-foreground">
                        {purchase.invoiceNumber ?? "—"}
                      </TableCell>
                      <TableCell className="font-data text-sm font-medium text-foreground">
                        ${purchase.totalAmount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <Badge variant={purchase.status === "received" ? "success" : "outline"}>
                          {purchase.status === "received" ? "Recibida" : "Cancelada"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right" onClick={(e) => e.stopPropagation()}>
                        {canCancel && purchase.status === "received" && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive"
                            disabled={isCancelling}
                            onClick={() => cancelPurchase(purchase)}
                          >
                            {isCancelling && <Loader2 className="size-3.5 animate-spin" />}
                            Cancelar
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={7} className="bg-muted/30 py-3">
                          <div className="flex flex-col gap-1.5 pl-8">
                            {purchase.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm text-muted-foreground"
                              >
                                <span className="text-foreground">
                                  {item.quantity} {item.unitAbbreviation} — {item.supplyName}
                                  {item.batchCode && (
                                    <span className="ml-2 font-data text-xs text-muted-foreground">
                                      lote {item.batchCode}
                                    </span>
                                  )}
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
