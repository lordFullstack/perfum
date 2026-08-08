import type { CashRepository, RegisterCashMovementInput } from "@/domain/repositories/cash.repository";
import type { CashMovement } from "@/domain/entities/cash-session.entity";

export class InvalidCashMovementError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCashMovementError";
  }
}

export async function registerCashMovementUseCase(
  repository: CashRepository,
  input: RegisterCashMovementInput,
): Promise<CashMovement> {
  if (input.amount <= 0) {
    throw new InvalidCashMovementError("El monto debe ser mayor a cero.");
  }
  return repository.registerMovement(input);
}
