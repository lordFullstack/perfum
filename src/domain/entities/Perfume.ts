export interface Perfume {
  id: string;
  branchId: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  basePrice: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PerfumeWithRecipe extends Perfume {
  activeRecipeId: string | null;
  recipeCost: number | null;
}

export type CreatePerfumeInput = Omit<
  Perfume,
  'id' | 'branchId' | 'createdAt' | 'updatedAt' | 'isActive'
> & { isActive?: boolean };

export type UpdatePerfumeInput = Partial<CreatePerfumeInput>;
