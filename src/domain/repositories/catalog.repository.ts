import type { CatalogPerfume } from "@/domain/entities/catalog-perfume.entity";
import type { OnlineOrder, OnlineOrderItemDraft } from "@/domain/entities/online-order.entity";

export interface SubmitOnlineOrderInput {
  customerName: string;
  customerPhone: string;
  customerEmail: string | null;
  notes: string | null;
  items: OnlineOrderItemDraft[];
}

export interface CatalogRepository {
  listCatalogPerfumes(): Promise<CatalogPerfume[]>;
  submitOrder(input: SubmitOnlineOrderInput): Promise<OnlineOrder>;
}
