import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { CatalogPerfume } from "@/domain/entities/catalog-perfume.entity";
import { useCatalogRepository } from "@/presentation/hooks/use-catalog-management";

export function useCatalog() {
  const repository = useCatalogRepository();
  const [perfumes, setPerfumes] = useState<CatalogPerfume[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await repository.listCatalogPerfumes();
        if (active) setPerfumes(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo cargar el catálogo.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [repository]);

  return { perfumes, isLoading };
}
