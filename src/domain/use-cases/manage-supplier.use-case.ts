import type { SupplierInput, SupplierRepository } from "@/domain/repositories/supplier.repository";
import type { Supplier } from "@/domain/entities/purchase.entity";

export class InvalidSupplierDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSupplierDataError";
  }
}

function validate(input: SupplierInput): void {
  if (input.name.trim().length < 2) {
    throw new InvalidSupplierDataError("El nombre debe tener al menos 2 caracteres.");
  }
}

export async function createSupplierUseCase(
  repository: SupplierRepository,
  input: SupplierInput,
): Promise<Supplier> {
  validate(input);
  return repository.createSupplier(input);
}

export async function updateSupplierUseCase(
  repository: SupplierRepository,
  id: string,
  input: SupplierInput,
): Promise<Supplier> {
  validate(input);
  return repository.updateSupplier(id, input);
}
