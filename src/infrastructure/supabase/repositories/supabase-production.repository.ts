import type { CreateProductionInput, ProductionRepository } from "@/domain/repositories/production.repository";
import type { ProductionOrder, ProductionStatus } from "@/domain/entities/production.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawProductionItemRow {
  id: string;
  supply_id: string;
  quantity: number;
  unit_cost: number;
  subtotal: number;
  supplies: { name: string; units_of_measure: { abbreviation: string } | null } | null;
}

interface RawProductionOrderRow {
  id: string;
  perfume_id: string;
  recipe_id: string;
  quantity_to_produce: number;
  yield_total_ml: number;
  total_cost: number;
  status: string;
  notes: string | null;
  created_at: string;
  perfumes: { name: string } | null;
  recipes: { version: number } | null;
  production_items: RawProductionItemRow[];
}

const SELECT_WITH_JOINS = `
  id, perfume_id, recipe_id, quantity_to_produce, yield_total_ml, total_cost, status, notes, created_at,
  perfumes:perfume_id ( name ),
  recipes:recipe_id ( version ),
  production_items (
    id, supply_id, quantity, unit_cost, subtotal,
    supplies:supply_id ( name, units_of_measure:unit_id ( abbreviation ) )
  )
`;

function mapRow(row: RawProductionOrderRow): ProductionOrder {
  return {
    id: row.id,
    perfumeId: row.perfume_id,
    perfumeName: row.perfumes?.name ?? "—",
    recipeId: row.recipe_id,
    recipeVersion: row.recipes?.version ?? 0,
    quantityToProduce: Number(row.quantity_to_produce),
    yieldTotalMl: Number(row.yield_total_ml),
    totalCost: Number(row.total_cost),
    status: row.status as ProductionStatus,
    notes: row.notes,
    createdAt: row.created_at,
    items: (row.production_items ?? []).map((item) => ({
      id: item.id,
      supplyId: item.supply_id,
      supplyName: item.supplies?.name ?? "—",
      unitAbbreviation: item.supplies?.units_of_measure?.abbreviation ?? "",
      quantity: Number(item.quantity),
      unitCost: Number(item.unit_cost),
      subtotal: Number(item.subtotal),
    })),
  };
}

export class SupabaseProductionRepository implements ProductionRepository {
  async listProductionOrders(): Promise<ProductionOrder[]> {
    const { data, error } = await supabase
      .from("production_orders")
      .select<string, RawProductionOrderRow>(SELECT_WITH_JOINS)
      .order("created_at", { ascending: false });

    if (error) throw new Error("No se pudieron cargar las producciones.");
    return (data ?? []).map(mapRow);
  }

  async createProduction(input: CreateProductionInput): Promise<ProductionOrder> {
    const { data, error } = await supabase.rpc("create_production", {
      p_perfume_id: input.perfumeId,
      p_recipe_id: input.recipeId,
      p_quantity_to_produce: input.quantityToProduce,
      p_notes: input.notes ?? undefined,
    });

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo registrar la producción.");
    }

    return this.getProductionById((data as { id: string }).id);
  }

  async cancelProduction(productionOrderId: string): Promise<void> {
    const { error } = await supabase.rpc("cancel_production", {
      p_production_order_id: productionOrderId,
    });
    if (error) throw new Error(error.message ?? "No se pudo cancelar la producción.");
  }

  private async getProductionById(id: string): Promise<ProductionOrder> {
    const { data, error } = await supabase
      .from("production_orders")
      .select<string, RawProductionOrderRow>(SELECT_WITH_JOINS)
      .eq("id", id)
      .single();

    if (error || !data) throw new Error("No se pudo recargar la producción registrada.");
    return mapRow(data);
  }
}
