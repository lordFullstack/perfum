import type { CreateRecipeInput, RecipeRepository } from "@/domain/repositories/recipe.repository";
import type { Recipe } from "@/domain/entities/recipe.entity";

export class InvalidRecipeDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidRecipeDataError";
  }
}

function validate(input: CreateRecipeInput): void {
  if (input.yieldMl <= 0) {
    throw new InvalidRecipeDataError("El rendimiento (ml) debe ser mayor a cero.");
  }
  if (input.items.length === 0) {
    throw new InvalidRecipeDataError("La receta debe tener al menos un insumo.");
  }
  for (const item of input.items) {
    if (!item.supplyId) {
      throw new InvalidRecipeDataError("Todos los ítems deben tener un insumo seleccionado.");
    }
    if (item.quantity <= 0) {
      throw new InvalidRecipeDataError("La cantidad de cada insumo debe ser mayor a cero.");
    }
  }
}

export async function createRecipeUseCase(
  repository: RecipeRepository,
  input: CreateRecipeInput,
): Promise<Recipe> {
  validate(input);
  return repository.createRecipe(input);
}
