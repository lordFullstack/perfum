import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { SalesReport } from "@/domain/entities/sales-report.entity";
import { getSalesReportUseCase } from "@/domain/use-cases/get-sales-report.use-case";
import { useReportRepository } from "@/presentation/hooks/use-report-management";

function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function firstDayOfMonth(): string {
  const now = new Date();
  return isoDate(new Date(now.getFullYear(), now.getMonth(), 1));
}

function today(): string {
  return isoDate(new Date());
}

export function useSalesReport() {
  const repository = useReportRepository();
  const [startDate, setStartDate] = useState(firstDayOfMonth());
  const [endDate, setEndDate] = useState(today());
  const [report, setReport] = useState<SalesReport | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      setReport(await getSalesReportUseCase(repository, { startDate, endDate }));
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo generar el reporte.");
    } finally {
      setIsLoading(false);
    }
  }, [repository, startDate, endDate]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { report, isLoading, startDate, endDate, setStartDate, setEndDate, reload };
}
