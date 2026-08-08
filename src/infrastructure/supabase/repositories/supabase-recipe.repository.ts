import type { CreateRecipeInput, RecipeRepository } from "@/domain/repositories/recipe.repository";
import type { Recipe, RecipeCost, RecipeFeasibility } from "@/domain/entities/recipe.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawRecipeItemRow {
  id: string;
  supply_id: string;
  quantity: number;
  unit_id: string;
  notes: string | null;
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
  recipe_items: RawRecipeItemRow[];
}

const SELECT_WITH_JOINS = `
  id, perfume_id, version, yield_ml, notes, created_at,
  recipe_items (
    id, supply_id, quantity, unit_id, notes, sort_order,
    supplies:supply_id ( name ),
    units_of_measure:unit_id ( abbreviation )
  )
`;

function mapRow(row: RawRecipeRow): Recipe {
  return {
    id: row.id,
    perfumeId: row.perfume_id,
    version: row.version,
    yieldMl: Number(row.yield_ml),
    notes: row.notes,
    createdAt: row.created_at,
    items: (row.recipe_items ?? [])
      .slice()
      .sort((a, b) => a.sort_order - b.sort_order)
      .map((item) => ({
        id: item.id,
        supplyId: item.supply_id,
        supplyName: item.supplies?.name ?? "—",
        quantity: Number(item.quantity),
        unitId: item.unit_id,
        unitAbbreviation: item.units_of_measure?.abbreviation ?? "",
        notes: item.notes,
        sortOrder: item.sort_order,
      })),
  };
}

export class SupabaseRecipeRepository implements RecipeRepository {
  async getActiveRecipe(perfumeId: string): Promise<Recipe | null> {
    const { data, error } = await supabase
      .from("recipes")
      .select<string, RawRecipeRow>(SELECT_WITH_JOINS)
      .eq("perfume_id", perfumeId)
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw new Error("No se pudo cargar la receta activa.");
    return data ? mapRow(data) : null;
  }

  async createRecipe(input: CreateRecipeInput): Promise<Recipe> {
    const { data, error } = await supabase.rpc("create_recipe", {
      p_perfume_id: input.perfumeId,
      p_yield_ml: input.yieldMl,
      p_notes: input.notes as string,
      p_items: input.items.map((item) => ({
        supply_id: item.supplyId,
        quantity: item.quantity,
        unit_id: item.unitId,
        notes: item.notes,
        sort_order: item.sortOrder,
      })),
    });

    if (error || !data) {
      throw new Error(this.translateError(error?.message) ?? "No se pudo crear la receta.");
    }

    const recipe = await this.getActiveRecipe(input.perfumeId);
    if (!recipe) throw new Error("La receta se creó pero no se pudo recargar.");
    return recipe;
  }

  async calculateCost(recipeId: string): Promise<RecipeCost> {
    const { data, error } = await supabase.rpc("calculate_recipe_cost", { p_recipe_id: recipeId });
    if (error || !data) throw new Error(this.translateError(error?.message) ?? "No se pudo calcular el costo.");

    const raw = data as { total_cost: number; breakdown: Array<Record<string, unknown>> };
    return {
      totalCost: Number(raw.total_cost),
      breakdown: raw.breakdown.map((line) => ({
        supplyId: String(line.supply_id),
        supplyName: String(line.supply_name),
        quantity: Number(line.quantity),
        unit: String(line.unit),
        unitCost: Number(line.unit_cost),
        subtotal: Number(line.subtotal),
      })),
    };
  }

  async checkFeasibility(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility> {
    const { data, error } = await supabase.rpc("check_recipe_feasibility", {
      p_recipe_id: recipeId,
      p_quantity_to_produce: quantityToProduce,
    });

    if (error || !data) throw new Error(this.translateError(error?.message) ?? "No se pudo verificar la factibilidad.");

    const raw = data as { feasible: boolean; shortfalls: Array<Record<string, unknown>> };
    return {
      feasible: raw.feasible,
      shortfalls: raw.shortfalls.map((s) => ({
        supplyId: String(s.supply_id),
        supplyName: String(s.supply_name),
        required: Number(s.required),
        available: Number(s.available),
        unit: String(s.unit),
      })),
    };
  }

  private translateError(message: string | undefined): string | null {
    if (!message) return null;
    if (message.includes("PERMISSION_DENIED")) return "No tenés permiso para esta acción.";
    if (message.includes("RECIPE_NOT_FOUND")) return "La receta no existe.";
    if (message.includes("PERFUME_NOT_FOUND")) return "El perfume no existe.";
    if (message.includes("RECIPE_MUST_HAVE_AT_LEAST_ONE_ITEM")) return "La receta debe tener al menos un insumo.";
    if (message.includes("BRANCH_MISMATCH")) return "No tenés acceso a este recurso.";
    return message;
  }
}
