import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Purchase } from "@/domain/entities/purchase.entity";
import type { CreatePurchaseInput } from "@/domain/repositories/purchase.repository";
import { createPurchaseUseCase } from "@/domain/use-cases/create-purchase.use-case";
import { usePurchaseRepository } from "@/presentation/hooks/use-purchase-management";

export function usePurchases() {
  const repository = usePurchaseRepository();
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setPurchases(await repository.listPurchases());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las compras.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createPurchase(input: CreatePurchaseInput): Promise<boolean> {
    try {
      const created = await createPurchaseUseCase(repository, input);
      setPurchases((prev) => [created, ...prev]);
      toast.success(`Compra registrada por $${created.totalAmount.toFixed(2)}.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la compra.");
      return false;
    }
  }

  async function cancelPurchase(purchase: Purchase) {
    setCancellingId(purchase.id);
    try {
      await repository.cancelPurchase(purchase.id);
      setPurchases((prev) =>
        prev.map((p) => (p.id === purchase.id ? { ...p, status: "cancelled" } : p)),
      );
      toast.success("Compra cancelada y stock revertido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la compra.");
    } finally {
      setCancellingId(null);
    }
  }

  return { purchases, isLoading, cancellingId, createPurchase, cancelPurchase };
}
