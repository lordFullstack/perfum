import type {
  SetAiCredentialsInput,
  SetWompiCredentialsInput,
  SettingsRepository,
  UpdateBranchInput,
  UpdateBusinessSettingsInput,
} from "@/domain/repositories/settings.repository";
import type { AiSettings, Branch, BusinessSettings, WompiSettings } from "@/domain/entities/settings.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawBranchRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

interface RawBusinessSettingsRow {
  currency: string;
  tax_rate: number;
}

interface RawAiSettingsRow {
  provider: string | null;
  is_enabled: boolean;
  api_key_secret_id: string | null;
}

interface RawWompiSettingsRow {
  public_key: string | null;
  is_enabled: boolean;
  integrity_secret_id: string | null;
}

async function getCurrentBranchId(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("No hay sesión activa.");

  const { data, error } = await supabase.from("profiles").select("branch_id").eq("id", userId).single();
  if (error || !data) throw new Error("No se pudo determinar la sucursal del usuario.");
  return data.branch_id;
}

function mapBranch(row: RawBranchRow): Branch {
  return { id: row.id, name: row.name, phone: row.phone, address: row.address };
}

function mapSettings(row: RawBusinessSettingsRow): BusinessSettings {
  return { currency: row.currency, taxRate: Number(row.tax_rate) };
}

export class SupabaseSettingsRepository implements SettingsRepository {
  async getBranch(): Promise<Branch> {
    const branchId = await getCurrentBranchId();
    const { data, error } = await supabase
      .from("branches")
      .select("id, name, phone, address")
      .eq("id", branchId)
      .single();

    if (error || !data) throw new Error("No se pudo cargar la sucursal.");
    return mapBranch(data);
  }

  async updateBranch(input: UpdateBranchInput): Promise<Branch> {
    const branchId = await getCurrentBranchId();
    const { data, error } = await supabase
      .from("branches")
      .update({ name: input.name, phone: input.phone, address: input.address })
      .eq("id", branchId)
      .select("id, name, phone, address")
      .single();

    if (error || !data) throw new Error("No se pudo actualizar la sucursal.");
    return mapBranch(data);
  }

  async getBusinessSettings(): Promise<BusinessSettings> {
    const branchId = await getCurrentBranchId();
    const { data, error } = await supabase
      .from("business_settings")
      .select("currency, tax_rate")
      .eq("branch_id", branchId)
      .single();

    if (error || !data) throw new Error("No se pudo cargar la configuración del negocio.");
    return mapSettings(data);
  }

  async updateBusinessSettings(input: UpdateBusinessSettingsInput): Promise<BusinessSettings> {
    const { data, error } = await supabase.rpc("update_business_settings", {
      p_currency: input.currency,
      p_tax_rate: input.taxRate,
    });

    if (error || !data) throw new Error(error?.message ?? "No se pudo actualizar la configuración.");
    return mapSettings(data as RawBusinessSettingsRow);
  }

  async getAiSettings(): Promise<AiSettings> {
    const branchId = await getCurrentBranchId();
    const { data, error } = await supabase
      .from("ai_settings")
      .select("provider, is_enabled, api_key_secret_id")
      .eq("branch_id", branchId)
      .maybeSingle();

    if (error) throw new Error("No se pudo cargar la configuración de IA.");
    const row = data as RawAiSettingsRow | null;
    return {
      provider: row?.provider ?? null,
      isEnabled: row?.is_enabled ?? false,
      hasApiKey: row?.api_key_secret_id !== null && row?.api_key_secret_id !== undefined,
    };
  }

  async setAiCredentials(input: SetAiCredentialsInput): Promise<void> {
    const { error } = await supabase.rpc("set_ai_credentials", {
      p_provider: input.provider,
      p_api_key: input.apiKey ?? "",
      p_is_enabled: input.isEnabled,
    });
    if (error) throw new Error(error.message ?? "No se pudo guardar la configuración de IA.");
  }

  async getWompiSettings(): Promise<WompiSettings> {
    const branchId = await getCurrentBranchId();
    const { data, error } = await supabase
      .from("wompi_settings")
      .select("public_key, is_enabled, integrity_secret_id")
      .eq("branch_id", branchId)
      .maybeSingle();

    if (error) throw new Error("No se pudo cargar la configuración de Wompi.");
    const row = data as RawWompiSettingsRow | null;
    return {
      publicKey: row?.public_key ?? null,
      isEnabled: row?.is_enabled ?? false,
      hasIntegritySecret: row?.integrity_secret_id !== null && row?.integrity_secret_id !== undefined,
    };
  }

  async setWompiCredentials(input: SetWompiCredentialsInput): Promise<void> {
    const { error } = await supabase.rpc("set_wompi_credentials", {
      p_public_key: input.publicKey,
      p_integrity_secret: input.integritySecret ?? "",
      p_is_enabled: input.isEnabled,
    });
    if (error) throw new Error(error.message ?? "No se pudo guardar la configuración de Wompi.");
  }
}
