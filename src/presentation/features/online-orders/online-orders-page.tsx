import { Fragment, useState } from "react";
import { ChevronDown, ChevronRight, Loader2, Mail, Phone } from "lucide-react";

import type { OnlineOrderStatus } from "@/domain/entities/online-order.entity";
import { usePermission } from "@/presentation/hooks/use-permission";
import { useOnlineOrders } from "@/presentation/features/online-orders/use-online-orders";
import { Badge } from "@/presentation/components/ui/badge";
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

const STATUS_LABELS: Record<OnlineOrderStatus, string> = {
  pending: "Pendiente",
  contacted: "Contactado",
  fulfilled: "Concretado",
  cancelled: "Cancelado",
};

const STATUS_BADGE: Record<OnlineOrderStatus, "warning" | "outline" | "success" | "destructive"> = {
  pending: "warning",
  contacted: "outline",
  fulfilled: "success",
  cancelled: "destructive",
};

export function OnlineOrdersPage() {
  const canUpdate = usePermission("online_orders.update");
  const { orders, isLoading, updatingId, updateStatus } = useOnlineOrders();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Pedidos online</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} pedido{orders.length !== 1 && "s"} recibido{orders.length !== 1 && "s"} desde
          el catálogo
        </p>
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : orders.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no llegaron pedidos</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Acá vas a ver los pedidos que los clientes envíen desde el catálogo online.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead>Cliente</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => {
                const isExpanded = expandedId === order.id;
                const isUpdating = updatingId === order.id;

                return (
                  <Fragment key={order.id}>
                    <TableRow
                      className="cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : order.id)}
                    >
                      <TableCell>
                        {isExpanded ? (
                          <ChevronDown className="size-4 text-muted-foreground" />
                        ) : (
                          <ChevronRight className="size-4 text-muted-foreground" />
                        )}
                      </TableCell>
                      <TableCell className="text-sm font-medium text-foreground">
                        {order.customerName}
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1.5">
                            <Phone className="size-3" /> {order.customerPhone}
                          </span>
                          {order.customerEmail && (
                            <span className="flex items-center gap-1.5">
                              <Mail className="size-3" /> {order.customerEmail}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-data text-sm font-medium text-foreground">
                        ${order.total.toFixed(2)}
                      </TableCell>
                      <TableCell onClick={(e) => e.stopPropagation()}>
                        {canUpdate ? (
                          <div className="flex items-center gap-2">
                            {isUpdating && <Loader2 className="size-3.5 animate-spin" />}
                            <Select
                              value={order.status}
                              onValueChange={(v) => updateStatus(order, v as OnlineOrderStatus)}
                              disabled={isUpdating}
                            >
                              <SelectTrigger className="h-8 w-36">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {Object.entries(STATUS_LABELS).map(([value, label]) => (
                                  <SelectItem key={value} value={value}>
                                    {label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                        ) : (
                          <Badge variant={STATUS_BADGE[order.status]}>
                            {STATUS_LABELS[order.status]}
                          </Badge>
                        )}
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className="hover:bg-transparent">
                        <TableCell colSpan={5} className="bg-muted/30 py-3">
                          <div className="flex flex-col gap-1.5 pl-8">
                            {order.notes && (
                              <p className="mb-1 text-sm italic text-muted-foreground">{order.notes}</p>
                            )}
                            {order.items.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center justify-between text-sm text-muted-foreground"
                              >
                                <span className="text-foreground">
                                  {item.quantity} × {item.perfumeName}
                                </span>
                                <span className="font-data">
                                  ${item.unitPrice.toFixed(2)} c/u = ${item.subtotal.toFixed(2)}
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
