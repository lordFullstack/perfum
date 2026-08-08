import type { ProductionOrder } from "@/domain/entities/production.entity";

export interface CreateProductionInput {
  perfumeId: string;
  recipeId: string;
  quantityToProduce: number;
  notes: string | null;
}

export interface ProductionRepository {
  listProductionOrders(): Promise<ProductionOrder[]>;
  createProduction(input: CreateProductionInput): Promise<ProductionOrder>;
  cancelProduction(productionOrderId: string): Promise<void>;
}
