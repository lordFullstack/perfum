import { Perfume, PerfumeWithRecipe, CreatePerfumeInput, UpdatePerfumeInput } from '../entities/Perfume';

export interface PerfumeRepository {
  list(branchId: string): Promise<PerfumeWithRecipe[]>;
  getById(id: string): Promise<Perfume | null>;
  create(input: CreatePerfumeInput): Promise<Perfume>;
  update(id: string, input: UpdatePerfumeInput): Promise<Perfume>;
  uploadImage(perfumeId: string, file: File): Promise<string>;
}
