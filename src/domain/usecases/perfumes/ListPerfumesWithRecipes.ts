import { PerfumeRepository } from '../../repositories/PerfumeRepository';
import { PerfumeWithRecipe } from '../../entities/Perfume';

export class ListPerfumesWithRecipes {
  constructor(private readonly repo: PerfumeRepository) {}

  async execute(branchId: string): Promise<PerfumeWithRecipe[]> {
    return this.repo.list(branchId);
  }
}
