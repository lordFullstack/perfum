import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Supplier } from "@/domain/entities/purchase.entity";
import type { SupplierInput } from "@/domain/repositories/supplier.repository";
import { createSupplierUseCase, updateSupplierUseCase } from "@/domain/use-cases/manage-supplier.use-case";
import { useSupplierRepository } from "@/presentation/hooks/use-supplier-management";

export function useSuppliers() {
  const repository = useSupplierRepository();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setSuppliers(await repository.listSuppliers());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los proveedores.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createSupplier(input: SupplierInput): Promise<boolean> {
    try {
      const created = await createSupplierUseCase(repository, input);
      setSuppliers((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Proveedor "${created.name}" creado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el proveedor.");
      return false;
    }
  }

  async function updateSupplier(id: string, input: SupplierInput): Promise<boolean> {
    try {
      const updated = await updateSupplierUseCase(repository, id, input);
      setSuppliers((prev) => prev.map((s) => (s.id === id ? updated : s)));
      toast.success(`Proveedor "${updated.name}" actualizado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el proveedor.");
      return false;
    }
  }

  async function deactivateSupplier(supplier: Supplier) {
    try {
      await repository.setSupplierActive(supplier.id, false);
      setSuppliers((prev) => prev.filter((s) => s.id !== supplier.id));
      toast.success(`Proveedor "${supplier.name}" desactivado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el proveedor.");
    }
  }

  return { suppliers, isLoading, createSupplier, updateSupplier, deactivateSupplier };
}
