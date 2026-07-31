import { RecipeRepository } from '../../repositories/RecipeRepository';
import { RecipeCost } from '../../entities/Recipe';

export class GetRecipeCost {
  constructor(private readonly repo: RecipeRepository) {}

  async execute(recipeId: string): Promise<RecipeCost> {
    return this.repo.getCost(recipeId);
  }
}
