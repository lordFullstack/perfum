import type { CreateSaleInput, SaleRepository } from "@/domain/repositories/sale.repository";
import type { Sale } from "@/domain/entities/sale.entity";

export class InvalidSaleDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidSaleDataError";
  }
}

function validate(input: CreateSaleInput): void {
  if (input.items.length === 0) {
    throw new InvalidSaleDataError("La venta debe tener al menos un ítem.");
  }
  for (const item of input.items) {
    if (!item.perfumeId) {
      throw new InvalidSaleDataError("Cada ítem debe tener un perfume seleccionado.");
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new InvalidSaleDataError("La cantidad de cada ítem debe ser un entero mayor a cero.");
    }
  }
}

export async function createSaleUseCase(repository: SaleRepository, input: CreateSaleInput): Promise<Sale> {
  validate(input);
  return repository.createSale(input);
}
