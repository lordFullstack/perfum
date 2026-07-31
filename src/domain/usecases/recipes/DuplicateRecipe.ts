import { RecipeRepository } from '../../repositories/RecipeRepository';
import { RecipeDraft } from '../../entities/Recipe';

export class DuplicateRecipe {
  constructor(private readonly repo: RecipeRepository) {}

  async execute(recipeId: string): Promise<RecipeDraft> {
    return this.repo.duplicate(recipeId);
  }
}
