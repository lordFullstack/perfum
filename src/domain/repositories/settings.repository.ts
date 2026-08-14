import type { AiSettings, Branch, BusinessSettings, WompiSettings } from "@/domain/entities/settings.entity";

export interface UpdateBranchInput {
  name: string;
  phone: string | null;
  address: string | null;
}

export interface UpdateBusinessSettingsInput {
  currency: string;
  taxRate: number;
}

export interface SetAiCredentialsInput {
  provider: string;
  apiKey: string | null;
  isEnabled: boolean;
}

export interface SetWompiCredentialsInput {
  publicKey: string;
  integritySecret: string | null;
  isEnabled: boolean;
}

export interface SettingsRepository {
  getBranch(): Promise<Branch>;
  updateBranch(input: UpdateBranchInput): Promise<Branch>;
  getBusinessSettings(): Promise<BusinessSettings>;
  updateBusinessSettings(input: UpdateBusinessSettingsInput): Promise<BusinessSettings>;
  getAiSettings(): Promise<AiSettings>;
  setAiCredentials(input: SetAiCredentialsInput): Promise<void>;
  getWompiSettings(): Promise<WompiSettings>;
  setWompiCredentials(input: SetWompiCredentialsInput): Promise<void>;
}
