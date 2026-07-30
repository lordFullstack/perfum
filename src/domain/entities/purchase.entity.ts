export interface Supplier {
  id: string;
  name: string;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  isActive: boolean;
}

export type PurchaseStatus = "received" | "cancelled";

export interface PurchaseItem {
  id: string;
  supplyId: string;
  supplyName: string;
  unitAbbreviation: string;
  quantity: number;
  unitCost: number;
  batchCode: string | null;
  expirationDate: string | null;
  subtotal: number;
}

export interface Purchase {
  id: string;
  supplierId: string;
  supplierName: string;
  purchaseDate: string;
  invoiceNumber: string | null;
  status: PurchaseStatus;
  totalAmount: number;
  createdAt: string;
  items: PurchaseItem[];
}

export interface PurchaseItemDraft {
  supplyId: string;
  quantity: number;
  unitCost: number;
  batchCode: string | null;
  expirationDate: string | null;
}
