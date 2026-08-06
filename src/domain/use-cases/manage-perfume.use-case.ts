import type { PerfumeInput, PerfumeRepository } from "@/domain/repositories/perfume.repository";
import type { Perfume } from "@/domain/entities/perfume.entity";

export class InvalidPerfumeDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidPerfumeDataError";
  }
}

function validate(input: PerfumeInput): void {
  if (input.code.trim().length < 2) {
    throw new InvalidPerfumeDataError("El código debe tener al menos 2 caracteres.");
  }
  if (input.name.trim().length < 2) {
    throw new InvalidPerfumeDataError("El nombre debe tener al menos 2 caracteres.");
  }
  if (input.basePrice < 0) {
    throw new InvalidPerfumeDataError("El precio base no puede ser negativo.");
  }
}

export async function createPerfumeUseCase(
  repository: PerfumeRepository,
  input: PerfumeInput,
): Promise<Perfume> {
  validate(input);
  return repository.createPerfume(input);
}

export async function updatePerfumeUseCase(
  repository: PerfumeRepository,
  id: string,
  input: PerfumeInput,
): Promise<Perfume> {
  validate(input);
  return repository.updatePerfume(id, input);
}
