import { Perfume, PerfumeWithRecipe } from '../../../domain/entities/Perfume';

export function mapPerfumeRow(row: any): Perfume {
  return {
    id: row.id,
    branchId: row.branch_id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    basePrice: Number(row.base_price),
    imageUrl: row.image_url,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapPerfumeWithRecipeRow(row: any): PerfumeWithRecipe {
  return {
    ...mapPerfumeRow(row),
    activeRecipeId: row.active_recipe_id ?? null,
    recipeCost:
      row.recipe_cost !== null && row.recipe_cost !== undefined ? Number(row.recipe_cost) : null,
  };
}
