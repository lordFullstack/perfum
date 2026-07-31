import { RecipeRepository } from '../../repositories/RecipeRepository';
import { RecipeFeasibility } from '../../entities/Recipe';

export class CheckRecipeFeasibility {
  constructor(private readonly repo: RecipeRepository) {}

  async execute(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility> {
    if (quantityToProduce <= 0) throw new Error('La cantidad debe ser mayor a cero');
    return this.repo.checkFeasibility(recipeId, quantityToProduce);
  }
}
