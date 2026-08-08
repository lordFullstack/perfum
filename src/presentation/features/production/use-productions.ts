import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ProductionOrder } from "@/domain/entities/production.entity";
import type { CreateProductionInput } from "@/domain/repositories/production.repository";
import { createProductionUseCase } from "@/domain/use-cases/create-production.use-case";
import { useProductionRepository } from "@/presentation/hooks/use-production-management";

export function useProductions() {
  const repository = useProductionRepository();
  const [productions, setProductions] = useState<ProductionOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setProductions(await repository.listProductionOrders());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar las producciones.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createProduction(input: CreateProductionInput): Promise<boolean> {
    try {
      const created = await createProductionUseCase(repository, input);
      setProductions((prev) => [created, ...prev]);
      toast.success(`Producción registrada — costo total $${created.totalCost.toFixed(2)}.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar la producción.");
      return false;
    }
  }

  async function cancelProduction(production: ProductionOrder) {
    setCancellingId(production.id);
    try {
      await repository.cancelProduction(production.id);
      setProductions((prev) =>
        prev.map((p) => (p.id === production.id ? { ...p, status: "cancelled" } : p)),
      );
      toast.success("Producción cancelada y stock revertido.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cancelar la producción.");
    } finally {
      setCancellingId(null);
    }
  }

  return { productions, isLoading, cancellingId, createProduction, cancelProduction };
}
