import type { Purchase, PurchaseItemDraft } from "@/domain/entities/purchase.entity";

export interface CreatePurchaseInput {
  supplierId: string;
  purchaseDate: string;
  invoiceNumber: string | null;
  items: PurchaseItemDraft[];
}

export interface PurchaseRepository {
  listPurchases(): Promise<Purchase[]>;
  createPurchase(input: CreatePurchaseInput): Promise<Purchase>;
  cancelPurchase(purchaseId: string): Promise<void>;
}
