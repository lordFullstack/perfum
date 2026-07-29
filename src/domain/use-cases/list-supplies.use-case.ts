import type { SupplyRepository } from "@/domain/repositories/supply.repository";
import type { Supply } from "@/domain/entities/supply.entity";

export async function listSuppliesUseCase(repository: SupplyRepository): Promise<Supply[]> {
  return repository.listSupplies();
}
