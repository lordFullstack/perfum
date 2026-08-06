import type { Perfume } from "@/domain/entities/perfume.entity";

export interface PerfumeInput {
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
}

export interface PerfumeRepository {
  listPerfumes(): Promise<Perfume[]>;
  createPerfume(input: PerfumeInput): Promise<Perfume>;
  updatePerfume(id: string, input: PerfumeInput): Promise<Perfume>;
  setPerfumeActive(id: string, isActive: boolean): Promise<void>;
  uploadImage(perfumeId: string, file: File): Promise<string>;
}
