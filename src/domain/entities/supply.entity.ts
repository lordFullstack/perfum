export interface SupplyCategory {
  id: string;
  name: string;
}

export interface UnitOfMeasure {
  id: string;
  name: string;
  abbreviation: string;
}

export interface Supply {
  id: string;
  code: string;
  name: string;
  categoryId: string;
  categoryName: string;
  unitId: string;
  unitAbbreviation: string;
  stock: number;
  minStock: number;
  averageCost: number;
  location: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export function isLowStock(supply: Supply): boolean {
  return supply.stock <= supply.minStock;
}

export type StockMovementType =
  | "purchase_in"
  | "production_out"
  | "adjustment_in"
  | "adjustment_out"
  | "return_in"
  | "return_out";

export const INCOMING_MOVEMENT_TYPES: StockMovementType[] = [
  "purchase_in",
  "adjustment_in",
  "return_in",
];
