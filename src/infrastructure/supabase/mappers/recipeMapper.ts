import { Recipe, RecipeItem } from '../../../domain/entities/Recipe';

export function mapRecipeItemRow(row: any): RecipeItem {
  return {
    id: row.id,
    supplyId: row.supply_id,
    supplyName: row.supplies?.name,
    quantity: Number(row.quantity),
    unitId: row.unit_id,
    unitAbbreviation: row.units_of_measure?.abbreviation,
    notes: row.notes,
    sortOrder: row.sort_order,
  };
}

export function mapRecipeRow(row: any): Recipe {
  return {
    id: row.id,
    branchId: row.branch_id,
    perfumeId: row.perfume_id,
    version: row.version,
    isActive: row.is_active,
    yieldMl: Number(row.yield_ml),
    notes: row.notes,
    createdBy: row.created_by,
    createdAt: row.created_at,
    items: (row.recipe_items ?? [])
      .map(mapRecipeItemRow)
      .sort((a: RecipeItem, b: RecipeItem) => a.sortOrder - b.sortOrder),
  };
}
