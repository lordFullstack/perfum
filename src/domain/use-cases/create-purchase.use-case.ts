import type { CreatePurchaseInput, PurchaseRepository } from "@/domain/repositories/purchase.repository";
import type { Purchase } from "@/domain/entities/purchase.entity";

export class InvalidPurchaseDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPurchaseDataError";
  }
}

function validate(input: CreatePurchaseInput): void {
  if (!input.supplierId) {
    throw new InvalidPurchaseDataError("Debe seleccionarse un proveedor.");
  }
  if (input.items.length === 0) {
    throw new InvalidPurchaseDataError("La compra debe tener al menos un ítem.");
  }
  for (const item of input.items) {
    if (!item.supplyId) {
      throw new InvalidPurchaseDataError("Todos los ítems deben tener un insumo seleccionado.");
    }
    if (item.quantity <= 0) {
      throw new InvalidPurchaseDataError("La cantidad de cada ítem debe ser mayor a cero.");
    }
    if (item.unitCost < 0) {
      throw new InvalidPurchaseDataError("El costo unitario no puede ser negativo.");
    }
  }
}

export async function createPurchaseUseCase(
  repository: PurchaseRepository,
  input: CreatePurchaseInput,
): Promise<Purchase> {
  validate(input);
  return repository.createPurchase(input);
}
