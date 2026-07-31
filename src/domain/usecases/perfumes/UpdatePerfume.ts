import { PerfumeRepository } from '../../repositories/PerfumeRepository';
import { UpdatePerfumeInput, Perfume } from '../../entities/Perfume';

export class UpdatePerfume {
  constructor(private readonly repo: PerfumeRepository) {}

  async execute(id: string, input: UpdatePerfumeInput): Promise<Perfume> {
    if (input.basePrice !== undefined && input.basePrice < 0) {
      throw new Error('El precio base no puede ser negativo');
    }
    return this.repo.update(id, input);
  }
}
