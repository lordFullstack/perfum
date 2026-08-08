export type ProductionStatus = "completed" | "cancelled";

export interface ProductionItem {
  id: string;
  supplyId: string;
  supplyName: string;
  unitAbbreviation: string;
  quantity: number;
  unitCost: number;
  subtotal: number;
}

export interface ProductionOrder {
  id: string;
  perfumeId: string;
  perfumeName: string;
  recipeId: string;
  recipeVersion: number;
  quantityToProduce: number;
  yieldTotalMl: number;
  totalCost: number;
  status: ProductionStatus;
  notes: string | null;
  createdAt: string;
  items: ProductionItem[];
}
