import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Sale } from "@/domain/entities/sale.entity";
import type { CreateSaleInput } from "@/domain/repositories/sale.repository";
import { createSaleUseCase } from "@/domain/use-cases/create-sale.use-case";
import { useSaleRepository } from "@/presentation/hooks/use-sale-management";

export function useSales() {
  const repository = useSaleRepository();
  const [sales, setSales] = useState<Sale[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setSales(await repository.listSales());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las ventas.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createSale(input: CreateSaleInput): Promise<boolean> {
    try {
      const created = await createSaleUseCase(repository, input);
      setSales((prev) => [created, ...prev]);
      toast.success(`Venta registrada — total $${created.total.toFixed(2)}.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la venta.");
      return false;
    }
  }

  async function cancelSale(sale: Sale) {
    setCancellingId(sale.id);
    try {
      await repository.cancelSale(sale.id);
      setSales((prev) => prev.map((s) => (s.id === sale.id ? { ...s, status: "cancelled" } : s)));
      toast.success("Venta cancelada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la venta.");
    } finally {
      setCancellingId(null);
    }
  }

  return { sales, isLoading, cancellingId, createSale, cancelSale };
}
