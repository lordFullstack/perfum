import { RecipeRepository } from '../../repositories/RecipeRepository';
import { CreateRecipeInput } from '../../entities/Recipe';

export class CreateRecipe {
  constructor(private readonly repo: RecipeRepository) {}

  async execute(input: CreateRecipeInput): Promise<string> {
    if (!input.items || input.items.length === 0) {
      throw new Error('La receta debe tener al menos un insumo');
    }
    if (input.yieldMl <= 0) {
      throw new Error('El rendimiento (ml) debe ser mayor a cero');
    }
    for (const item of input.items) {
      if (item.quantity <= 0) {
        throw new Error('Todas las cantidades de insumos deben ser mayores a cero');
      }
      if (!item.unitId) {
        throw new Error('Todos los insumos deben tener una unidad de medida');
      }
    }
    return this.repo.create(input);
  }
}
