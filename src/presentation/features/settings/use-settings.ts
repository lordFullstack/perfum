import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { AiSettings, Branch, BusinessSettings, WompiSettings } from "@/domain/entities/settings.entity";
import type {
  SetAiCredentialsInput,
  SetWompiCredentialsInput,
  UpdateBranchInput,
  UpdateBusinessSettingsInput,
} from "@/domain/repositories/settings.repository";
import { useSettingsRepository } from "@/presentation/hooks/use-settings-management";

export function useSettings() {
  const repository = useSettingsRepository();

  const [branch, setBranch] = useState<Branch | null>(null);
  const [business, setBusiness] = useState<BusinessSettings | null>(null);
  const [ai, setAi] = useState<AiSettings | null>(null);
  const [wompi, setWompi] = useState<WompiSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [branchData, businessData, aiData, wompiData] = await Promise.all([
        repository.getBranch(),
        repository.getBusinessSettings(),
        repository.getAiSettings(),
        repository.getWompiSettings(),
      ]);
      setBranch(branchData);
      setBusiness(businessData);
      setAi(aiData);
      setWompi(wompiData);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la configuración.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function updateBranch(input: UpdateBranchInput): Promise<boolean> {
    try {
      setBranch(await repository.updateBranch(input));
      toast.success("Datos de la sucursal actualizados.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la sucursal.");
      return false;
    }
  }

  async function updateBusiness(input: UpdateBusinessSettingsInput): Promise<boolean> {
    try {
      setBusiness(await repository.updateBusinessSettings(input));
      toast.success("Parámetros del negocio actualizados.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar la configuración.");
      return false;
    }
  }

  async function updateAi(input: SetAiCredentialsInput): Promise<boolean> {
    try {
      await repository.setAiCredentials(input);
      setAi(await repository.getAiSettings());
      toast.success("Configuración de IA guardada.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la configuración de IA.");
      return false;
    }
  }

  async function updateWompi(input: SetWompiCredentialsInput): Promise<boolean> {
    try {
      await repository.setWompiCredentials(input);
      setWompi(await repository.getWompiSettings());
      toast.success("Configuración de Wompi guardada.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la configuración de Wompi.");
      return false;
    }
  }

  return { branch, business, ai, wompi, isLoading, updateBranch, updateBusiness, updateAi, updateWompi };
}
