import type { Perfume, Recipe, RecipeItemDraft, RecipeCost, RecipeFeasibility } from "@/domain/entities/recipe.entity";

export interface PerfumeInput {
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
}

export interface CreateRecipeInput {
  perfumeId: string;
  yieldMl: number;
  notes: string | null;
  items: RecipeItemDraft[];
}

export interface PerfumeRepository {
  listPerfumes(): Promise<Perfume[]>;
  createPerfume(input: PerfumeInput): Promise<Perfume>;
  updatePerfume(id: string, input: PerfumeInput): Promise<Perfume>;
  setPerfumeActive(id: string, isActive: boolean): Promise<void>;
  uploadPerfumeImage(perfumeId: string, file: File): Promise<string>;
}

export interface RecipeRepository {
  getActiveRecipe(perfumeId: string): Promise<Recipe | null>;
  createRecipe(input: CreateRecipeInput): Promise<Recipe>;
  getRecipeCost(recipeId: string): Promise<RecipeCost>;
  checkFeasibility(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility>;
}
