import type { CreateProductionInput, ProductionRepository } from "@/domain/repositories/production.repository";
import type { ProductionOrder } from "@/domain/entities/production.entity";

export class InvalidProductionDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidProductionDataError";
  }
}

function validate(input: CreateProductionInput): void {
  if (!input.perfumeId) {
    throw new InvalidProductionDataError("Debe seleccionarse un perfume.");
  }
  if (!input.recipeId) {
    throw new InvalidProductionDataError("El perfume seleccionado no tiene una receta activa.");
  }
  if (!Number.isInteger(input.quantityToProduce) || input.quantityToProduce <= 0) {
    throw new InvalidProductionDataError("La cantidad a producir debe ser un entero mayor a cero.");
  }
}

export async function createProductionUseCase(
  repository: ProductionRepository,
  input: CreateProductionInput,
): Promise<ProductionOrder> {
  validate(input);
  return repository.createProduction(input);
}
