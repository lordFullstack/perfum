import { useEffect, useState } from "react";
import { toast } from "sonner";

import type { DashboardSummary } from "@/domain/entities/dashboard-summary.entity";
import { useDashboardRepository } from "@/presentation/hooks/use-dashboard-management";

export function useDashboard() {
  const repository = useDashboardRepository();
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await repository.getSummary();
        if (active) setSummary(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "No se pudo cargar el dashboard.");
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [repository]);

  return { summary, isLoading };
}
