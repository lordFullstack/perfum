export interface RecipeItem {
  id: string;
  supplyId: string;
  supplyName: string;
  quantity: number;
  unitId: string;
  unitAbbreviation: string;
  notes: string | null;
  sortOrder: number;
}

export interface Recipe {
  id: string;
  perfumeId: string;
  version: number;
  yieldMl: number;
  notes: string | null;
  createdAt: string;
  items: RecipeItem[];
}

export interface RecipeItemDraft {
  supplyId: string;
  quantity: number;
  unitId: string;
  notes: string | null;
  sortOrder: number;
}

export interface RecipeCostLine {
  supplyId: string;
  supplyName: string;
  quantity: number;
  unit: string;
  unitCost: number;
  subtotal: number;
}

export interface RecipeCost {
  totalCost: number;
  breakdown: RecipeCostLine[];
}

export interface FeasibilityShortfall {
  supplyId: string;
  supplyName: string;
  required: number;
  available: number;
  unit: string;
}

export interface RecipeFeasibility {
  feasible: boolean;
  shortfalls: FeasibilityShortfall[];
}
