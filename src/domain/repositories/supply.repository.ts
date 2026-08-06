import type {
  Supply,
  SupplyCategory,
  UnitOfMeasure,
  StockMovementType,
} from "@/domain/entities/supply.entity";

export interface SupplyInput {
  code: string;
  name: string;
  categoryId: string;
  unitId: string;
  minStock: number;
  location: string | null;
}

export interface AdjustStockInput {
  supplyId: string;
  quantity: number;
  movementType: StockMovementType;
  unitCost: number | null;
  notes: string | null;
}

export interface SupplyRepository {
  listSupplies(): Promise<Supply[]>;
  listCategories(): Promise<SupplyCategory[]>;
  listUnits(): Promise<UnitOfMeasure[]>;
  createSupply(input: SupplyInput): Promise<Supply>;
  updateSupply(id: string, input: SupplyInput): Promise<Supply>;
  setSupplyActive(id: string, isActive: boolean): Promise<void>;
  adjustStock(input: AdjustStockInput): Promise<Supply>;
}
