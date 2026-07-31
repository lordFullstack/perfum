export interface RecipeItem {
  id: string;
  supplyId: string;
  supplyName?: string;
  quantity: number;
  unitId: string;
  unitAbbreviation?: string; // viene del join con units_of_measure, solo para display
  notes: string | null;
  sortOrder: number;
}

export interface Recipe {
  id: string;
  branchId: string;
  perfumeId: string;
  version: number;
  isActive: boolean;
  yieldMl: number;
  notes: string | null;
  createdBy: string | null;
  createdAt: string;
  items: RecipeItem[];
}

export interface RecipeItemInput {
  supplyId: string;
  quantity: number;
  unitId: string;
  notes?: string | null;
  sortOrder?: number;
}

export interface CreateRecipeInput {
  perfumeId: string;
  yieldMl: number;
  notes?: string | null;
  items: RecipeItemInput[];
}

export interface RecipeCostBreakdownItem {
  supplyId: string;
  supplyName: string;
  quantity: number;
  unit: string; // abreviatura, ej. "ml"
  unitCost: number;
  subtotal: number;
}

export interface RecipeCost {
  totalCost: number;
  breakdown: RecipeCostBreakdownItem[];
}

export interface RecipeFeasibilityShortfall {
  supplyId: string;
  supplyName: string;
  required: number;
  available: number;
  unit: string;
}

export interface RecipeFeasibility {
  feasible: boolean;
  shortfalls: RecipeFeasibilityShortfall[];
}

export interface RecipeDraft {
  perfumeId: string;
  yieldMl: number;
  notes: string | null;
  items: RecipeItemInput[];
}
