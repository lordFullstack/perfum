export interface Branch {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
}

export interface BusinessSettings {
  currency: string;
  taxRate: number;
}

export interface AiSettings {
  provider: string | null;
  isEnabled: boolean;
  hasApiKey: boolean;
}

export interface WompiSettings {
  publicKey: string | null;
  isEnabled: boolean;
  hasIntegritySecret: boolean;
}
