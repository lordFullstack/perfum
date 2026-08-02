import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Perfume } from "@/domain/entities/recipe.entity";
import type { PerfumeInput } from "@/domain/repositories/recipe.repository";
import { createPerfumeUseCase, updatePerfumeUseCase } from "@/domain/use-cases/manage-perfume.use-case";
import { usePerfumeRepository } from "@/presentation/hooks/use-perfume-management";

export function usePerfumes() {
  const repository = usePerfumeRepository();
  const [perfumes, setPerfumes] = useState<Perfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

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

  async function updatePerfume(id: string, input: PerfumeInput): Promise<Perfume | null> {
    setSavingId(id);
    try {
      const updated = await updatePerfumeUseCase(repository, id, input);
      setPerfumes((prev) => prev.map((p) => (p.id === id ? updated : p)));
      toast.success(`Perfume "${updated.name}" actualizado.`);
      return updated;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el perfume.");
      return null;
    } finally {
      setSavingId(null);
    }
  }

  async function togglePerfumeActive(perfume: Perfume) {
    setSavingId(perfume.id);
    try {
      await repository.setPerfumeActive(perfume.id, !perfume.isActive);
      setPerfumes((prev) =>
        prev.map((p) => (p.id === perfume.id ? { ...p, isActive: !p.isActive } : p)),
      );
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cambiar el estado del perfume.");
    } finally {
      setSavingId(null);
    }
  }

  async function uploadPerfumeImage(perfumeId: string, file: File) {
    try {
      const url = await repository.uploadPerfumeImage(perfumeId, file);
      setPerfumes((prev) => prev.map((p) => (p.id === perfumeId ? { ...p, imageUrl: url } : p)));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo subir la imagen.");
    }
  }

  return {
    perfumes,
    isLoading,
    savingId,
    createPerfume,
    updatePerfume,
    togglePerfumeActive,
    uploadPerfumeImage,
    reload,
  };
}
