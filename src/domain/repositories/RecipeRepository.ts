import {
  Recipe,
  CreateRecipeInput,
  RecipeCost,
  RecipeFeasibility,
  RecipeDraft,
} from '../entities/Recipe';

export interface RecipeRepository {
  getActiveByPerfumeId(perfumeId: string): Promise<Recipe | null>;
  listVersionsByPerfumeId(perfumeId: string): Promise<Recipe[]>;
  create(input: CreateRecipeInput): Promise<string>; // retorna el id de la nueva receta
  duplicate(recipeId: string): Promise<RecipeDraft>;
  getCost(recipeId: string): Promise<RecipeCost>;
  checkFeasibility(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility>;
}
