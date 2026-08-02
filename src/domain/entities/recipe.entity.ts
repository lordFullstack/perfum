export interface Perfume {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  imageUrl: string | null;
  isActive: boolean;
  activeRecipeId: string | null;
}

export interface RecipeItem {
  id: string;
  supplyId: string;
  supplyName: string;
  unitAbbreviation: string;
  quantity: number;
  unitId: string;
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
}

export interface RecipeCostBreakdownItem {
  supplyId: string;
  supplyName: string;
  quantity: number;
  unitAbbreviation: string;
  unitCost: number;
  subtotal: number;
}

export interface RecipeCost {
  totalCost: number;
  breakdown: RecipeCostBreakdownItem[];
}

export interface RecipeShortfall {
  supplyId: string;
  supplyName: string;
  required: number;
  available: number;
  unitAbbreviation: string;
}

export interface RecipeFeasibility {
  feasible: boolean;
  shortfalls: RecipeShortfall[];
}

export function recipeMargin(basePrice: number, totalCost: number): number {
  if (basePrice <= 0) return 0;
  return ((basePrice - totalCost) / basePrice) * 100;
}
