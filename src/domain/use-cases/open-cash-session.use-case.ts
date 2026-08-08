import type { CashRepository, OpenCashSessionInput } from "@/domain/repositories/cash.repository";
import type { CashSession } from "@/domain/entities/cash-session.entity";

export class InvalidCashSessionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidCashSessionError";
  }
}

export async function openCashSessionUseCase(
  repository: CashRepository,
  input: OpenCashSessionInput,
): Promise<CashSession> {
  if (input.openingAmount < 0) {
    throw new InvalidCashSessionError("El monto de apertura debe ser mayor o igual a cero.");
  }
  return repository.openSession(input);
}
