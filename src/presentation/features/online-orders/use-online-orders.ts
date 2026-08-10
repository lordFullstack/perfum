import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { OnlineOrder, OnlineOrderStatus } from "@/domain/entities/online-order.entity";
import { useOnlineOrderRepository } from "@/presentation/hooks/use-online-order-management";

export function useOnlineOrders() {
  const repository = useOnlineOrderRepository();
  const [orders, setOrders] = useState<OnlineOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setOrders(await repository.listOrders());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los pedidos.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function updateStatus(order: OnlineOrder, status: OnlineOrderStatus) {
    setUpdatingId(order.id);
    try {
      const updated = await repository.updateStatus(order.id, status);
      setOrders((prev) => prev.map((o) => (o.id === order.id ? updated : o)));
      toast.success("Pedido actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el pedido.");
    } finally {
      setUpdatingId(null);
    }
  }

  return { orders, isLoading, updatingId, updateStatus };
}
