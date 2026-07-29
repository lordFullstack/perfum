import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Supply, SupplyCategory, UnitOfMeasure } from "@/domain/entities/supply.entity";
import type { AdjustStockInput, SupplyInput } from "@/domain/repositories/supply.repository";
import { listSuppliesUseCase } from "@/domain/use-cases/list-supplies.use-case";
import { createSupplyUseCase, updateSupplyUseCase } from "@/domain/use-cases/manage-supply.use-case";
import { adjustStockUseCase } from "@/domain/use-cases/adjust-stock.use-case";
import { useSupplyRepository } from "@/presentation/hooks/use-supply-management";

export function useSupplies() {
  const repository = useSupplyRepository();

  const [supplies, setSupplies] = useState<Supply[]>([]);
  const [categories, setCategories] = useState<SupplyCategory[]>([]);
  const [units, setUnits] = useState<UnitOfMeasure[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [suppliesResult, categoriesResult, unitsResult] = await Promise.all([
        listSuppliesUseCase(repository),
        repository.listCategories(),
        repository.listUnits(),
      ]);
      setSupplies(suppliesResult);
      setCategories(categoriesResult);
      setUnits(unitsResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar el inventario.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createSupply(input: SupplyInput): Promise<boolean> {
    try {
      const created = await createSupplyUseCase(repository, input);
      setSupplies((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Insumo "${created.name}" creado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el insumo.");
      return false;
    }
  }

  async function updateSupply(id: string, input: SupplyInput): Promise<boolean> {
    try {
      const updated = await updateSupplyUseCase(repository, id, input);
      setSupplies((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success(`Insumo "${updated.name}" actualizado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el insumo.");
      return false;
    }
  }

  async function deactivateSupply(supply: Supply) {
    try {
      await repository.setSupplyActive(supply.id, false);
      setSupplies((prev) => prev.filter((s) => s.id !== supply.id));
      toast.success(`Insumo "${supply.name}" desactivado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el insumo.");
    }
  }

  async function adjustStock(input: AdjustStockInput): Promise<boolean> {
    try {
      const updated = await adjustStockUseCase(repository, input);
      setSupplies((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
      toast.success("Stock actualizado.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo ajustar el stock.");
      return false;
    }
  }

  return {
    supplies,
    categories,
    units,
    isLoading,
    createSupply,
    updateSupply,
    deactivateSupply,
    adjustStock,
  };
}
