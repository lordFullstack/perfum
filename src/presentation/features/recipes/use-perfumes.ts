import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Perfume } from "@/domain/entities/perfume.entity";
import type { PerfumeInput } from "@/domain/repositories/perfume.repository";
import { createPerfumeUseCase, updatePerfumeUseCase } from "@/domain/use-cases/manage-perfume.use-case";
import { usePerfumeRepository } from "@/presentation/hooks/use-perfume-management";

export function usePerfumes() {
  const repository = usePerfumeRepository();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setPerfumes(await repository.listPerfumes());
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudieron cargar los perfumes.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createPerfume(input: PerfumeInput): Promise<Perfume | null> {
    try {
      const created = await createPerfumeUseCase(repository, input);
      setPerfumes((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      toast.success(`Perfume "${created.name}" creado.`);
      return created;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el perfume.");
      return null;
    }
  }

  async function updatePerfume(id: string, input: PerfumeInput): Promise<boolean> {
    try {
      const updated = await updatePerfumeUseCase(repository, id, input);
      setPerfumes((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(`Perfume "${updated.name}" actualizado.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfume.");
      return false;
    }
  }

  async function deactivatePerfume(perfume: Perfume) {
    try {
      await repository.setPerfumeActive(perfume.id, false);
      setPerfumes((prev) => prev.filter((p) => p.id !== perfume.id));
      toast.success(`Perfume "${perfume.name}" desactivado.`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo desactivar el perfume.");
    }
  }

  async function uploadImage(perfume: Perfume, file: File) {
    try {
      const url = await repository.uploadImage(perfume.id, file);
      setPerfumes((prev) => prev.map((p) => (p.id === perfume.id ? { ...p, imageUrl: url } : p)));
      toast.success("Imagen actualizada.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    }
  }

  return { perfumes, isLoading, createPerfume, updatePerfume, deactivatePerfume, uploadImage };
}
