import type {
  CreateRecipeInput,
  RecipeRepository,
} from "@/domain/repositories/recipe.repository";
import type { Recipe, RecipeCost, RecipeFeasibility } from "@/domain/entities/recipe.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawRecipeItemRow {
  id: string;
  supply_id: string;
  quantity: number;
  unit_id: string;
  sort_order: number;
  supplies: { name: string } | null;
  units_of_measure: { abbreviation: string } | null;
}

interface RawRecipeRow {
  id: string;
  perfume_id: string;
  version: number;
  yield_ml: number;
  notes: string | null;
  created_at: string;
  recipe_items: RawRecipeItemRow[] | null;
}

function mapRecipe(row: RawRecipeRow): Recipe {
  return {
    id: row.id,
    perfumeId: row.perfume_id,
    version: row.version,
    yieldMl: row.yield_ml,
    notes: row.notes,
    createdAt: row.created_at,
    items: (row.recipe_items ?? [])
      .map((item) => ({
        id: item.id,
        supplyId: item.supply_id,
        supplyName: item.supplies?.name ?? "",
        unitAbbreviation: item.units_of_measure?.abbreviation ?? "",
        quantity: item.quantity,
        unitId: item.unit_id,
        sortOrder: item.sort_order,
      }))
      .sort((a, b) => a.sortOrder - b.sortOrder),
  };
}

export class SupabaseRecipeRepository implements RecipeRepository {
  async getActiveRecipe(perfumeId: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from("recipes")
      .select("*, recipe_items(*, supplies(name), units_of_measure(abbreviation))")
      .eq("perfume_id", perfumeId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error(`Error al obtener la receta activa: ${error.message}`);
    return data ? mapRecipe(data as RawRecipeRow) : null;
  }

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    const { data: recipeId, error } = await supabase.rpc("create_recipe", {
      p_perfume_id: input.perfumeId,
      p_yield_ml: input.yieldMl,
      // El parámetro Postgres es `text` sin marca de nulidad explícita en los tipos
      // generados, aunque la función acepta NULL en tiempo de ejecución.
      p_notes: input.notes as unknown as string,
      p_items: input.items.map((item, index) => ({
        supply_id: item.supplyId,
        quantity: item.quantity,
        unit_id: item.unitId,
        sort_order: index,
      })),
    });

    if (error) throw new Error(`Error al guardar la receta: ${error.message}`);

    const { data, error: fetchError } = await supabase
      .from("recipes")
      .select("*, recipe_items(*, supplies(name), units_of_measure(abbreviation))")
      .eq("id", recipeId as string)
      .single();

    if (fetchError) throw new Error(`Error al leer la receta creada: ${fetchError.message}`);
    return mapRecipe(data as RawRecipeRow);
  }

  async getRecipeCost(recipeId: string): Promise<RecipeCost> {
    const { data, error } = await supabase.rpc("calculate_recipe_cost", { p_recipe_id: recipeId });
    if (error) throw new Error(`Error al calcular el costo de la receta: ${error.message}`);

    const raw = data as {
      total_cost: number;
      breakdown: {
        supply_id: string;
        supply_name: string;
        quantity: number;
        unit: string;
        unit_cost: number;
        subtotal: number;
      }[];
    };

    return {
      totalCost: raw.total_cost,
      breakdown: raw.breakdown.map((item) => ({
        supplyId: item.supply_id,
        supplyName: item.supply_name,
        quantity: item.quantity,
        unitAbbreviation: item.unit,
        unitCost: item.unit_cost,
        subtotal: item.subtotal,
      })),
    };
  }

  async checkFeasibility(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility> {
    const { data, error } = await supabase.rpc("check_recipe_feasibility", {
      p_recipe_id: recipeId,
      p_quantity_to_produce: quantityToProduce,
    });
    if (error) throw new Error(`Error al verificar disponibilidad: ${error.message}`);

    const raw = data as {
      feasible: boolean;
      shortfalls: {
        supply_id: string;
        supply_name: string;
        required: number;
        available: number;
        unit: string;
      }[];
    };

    return {
      feasible: raw.feasible,
      shortfalls: raw.shortfalls.map((s) => ({
        supplyId: s.supply_id,
        supplyName: s.supply_name,
        required: s.required,
        available: s.available,
        unitAbbreviation: s.unit,
      })),
    };
  }
}
