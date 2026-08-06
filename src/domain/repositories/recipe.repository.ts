import type {
  Recipe,
  RecipeItemDraft,
  RecipeCost,
  RecipeFeasibility,
} from "@/domain/entities/recipe.entity";

export interface CreateRecipeInput {
  perfumeId: string;
  yieldMl: number;
  notes: string | null;
  items: RecipeItemDraft[];
}

export interface RecipeRepository {
  getActiveRecipe(perfumeId: string): Promise<Recipe | null>;
  createRecipe(input: CreateRecipeInput): Promise<Recipe>;
  calculateCost(recipeId: string): Promise<RecipeCost>;
  checkFeasibility(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility>;
}
