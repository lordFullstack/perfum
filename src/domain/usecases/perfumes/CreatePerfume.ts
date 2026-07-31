import { PerfumeRepository } from '../../repositories/PerfumeRepository';
import { CreatePerfumeInput, Perfume } from '../../entities/Perfume';

export class CreatePerfume {
  constructor(private readonly repo: PerfumeRepository) {}

  async execute(input: CreatePerfumeInput): Promise<Perfume> {
    if (!input.name?.trim()) throw new Error('El nombre del perfume es obligatorio');
    if (!input.code?.trim()) throw new Error('El código del perfume es obligatorio');
    if (input.basePrice < 0) throw new Error('El precio base no puede ser negativo');
    return this.repo.create(input);
  }
}
