import type { AdjustStockInput, SupplyRepository } from "@/domain/repositories/supply.repository";
import type { Supply } from "@/domain/entities/supply.entity";

export class InvalidStockAdjustmentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidStockAdjustmentError";
  }
}

export async function adjustStockUseCase(
  repository: SupplyRepository,
  input: AdjustStockInput,
): Promise<Supply> {
  if (input.quantity <= 0) {
    throw new InvalidStockAdjustmentError("La cantidad debe ser mayor a cero.");
  }
  return repository.adjustStock(input);
}
