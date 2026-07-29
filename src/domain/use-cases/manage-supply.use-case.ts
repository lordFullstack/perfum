import type { SupplyInput, SupplyRepository } from "@/domain/repositories/supply.repository";
import type { Supply } from "@/domain/entities/supply.entity";

export class InvalidSupplyDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSupplyDataError";
  }
}

function validate(input: SupplyInput): void {
  if (input.code.trim().length < 2) {
    throw new InvalidSupplyDataError("El código debe tener al menos 2 caracteres.");
  }
  if (input.name.trim().length < 2) {
    throw new InvalidSupplyDataError("El nombre debe tener al menos 2 caracteres.");
  }
  if (!input.categoryId) {
    throw new InvalidSupplyDataError("Debe seleccionarse una categoría.");
  }
  if (!input.unitId) {
    throw new InvalidSupplyDataError("Debe seleccionarse una unidad de medida.");
  }
  if (input.minStock < 0) {
    throw new InvalidSupplyDataError("El stock mínimo no puede ser negativo.");
  }
}

export async function createSupplyUseCase(
  repository: SupplyRepository,
  input: SupplyInput,
): Promise<Supply> {
  validate(input);
  return repository.createSupply(input);
}

export async function updateSupplyUseCase(
  repository: SupplyRepository,
  id: string,
  input: SupplyInput,
): Promise<Supply> {
  validate(input);
  return repository.updateSupply(id, input);
}
