import type {
  AdjustStockInput,
  SupplyInput,
  SupplyRepository,
} from "@/domain/repositories/supply.repository";
import type { Supply, SupplyCategory, UnitOfMeasure } from "@/domain/entities/supply.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawSupplyRow {
  id: string;
  code: string;
  name: string;
  category_id: string;
  unit_id: string;
  stock: number;
  min_stock: number;
  average_cost: number;
  location: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  supply_categories: { name: string } | null;
  units_of_measure: { abbreviation: string } | null;
}

function mapRow(row: RawSupplyRow): Supply {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    categoryId: row.category_id,
    categoryName: row.supply_categories?.name ?? "—",
    unitId: row.unit_id,
    unitAbbreviation: row.units_of_measure?.abbreviation ?? "",
    stock: Number(row.stock),
    minStock: Number(row.min_stock),
    averageCost: Number(row.average_cost),
    location: row.location,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

const SELECT_WITH_JOINS =
  "id, code, name, category_id, unit_id, stock, min_stock, average_cost, location, is_active, created_at, updated_at, supply_categories:category_id ( name ), units_of_measure:unit_id ( abbreviation )";

export class SupabaseSupplyRepository implements SupplyRepository {
  async listSupplies(): Promise<Supply[]> {
    const { data, error } = await supabase
      .from("supplies")
      .select<string, RawSupplyRow>(SELECT_WITH_JOINS)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudo cargar el inventario.");
    return (data ?? []).map(mapRow);
  }

  async listCategories(): Promise<SupplyCategory[]> {
    const { data, error } = await supabase
      .from("supply_categories")
      .select("id, name")
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudieron cargar las categorías.");
    return (data ?? []) as SupplyCategory[];
  }

  async listUnits(): Promise<UnitOfMeasure[]> {
    const { data, error } = await supabase
      .from("units_of_measure")
      .select("id, name, abbreviation")
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudieron cargar las unidades de medida.");
    return (data ?? []) as UnitOfMeasure[];
  }

  async createSupply(input: SupplyInput): Promise<Supply> {
    const { data: sessionData } = await supabase.auth.getSession();
    const branchId = await this.getCurrentBranchId(sessionData.session?.user.id);

    const { data, error } = await supabase
      .from("supplies")
      .insert({
        branch_id: branchId,
        code: input.code.trim(),
        name: input.name.trim(),
        category_id: input.categoryId,
        unit_id: input.unitId,
        min_stock: input.minStock,
        location: input.location,
      })
      .select<string, RawSupplyRow>(SELECT_WITH_JOINS)
      .single();

    if (error || !data) {
      const message = error?.code === "23505" ? "Ya existe un insumo con ese código." : "No se pudo crear el insumo.";
      throw new Error(message);
    }
    return mapRow(data);
  }

  async updateSupply(id: string, input: SupplyInput): Promise<Supply> {
    const { data, error } = await supabase
      .from("supplies")
      .update({
        code: input.code.trim(),
        name: input.name.trim(),
        category_id: input.categoryId,
        unit_id: input.unitId,
        min_stock: input.minStock,
        location: input.location,
      })
      .eq("id", id)
      .select<string, RawSupplyRow>(SELECT_WITH_JOINS)
      .single();

    if (error || !data) {
      const message = error?.code === "23505" ? "Ya existe un insumo con ese código." : "No se pudo actualizar el insumo.";
      throw new Error(message);
    }
    return mapRow(data);
  }

  async setSupplyActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from("supplies").update({ is_active: isActive }).eq("id", id);
    if (error) throw new Error("No se pudo actualizar el estado del insumo.");
  }

  async adjustStock(input: AdjustStockInput): Promise<Supply> {
    const { data, error } = await supabase.rpc("adjust_supply_stock", {
      p_supply_id: input.supplyId,
      p_quantity: input.quantity,
      p_movement_type: input.movementType,
      p_unit_cost: input.unitCost ?? undefined,
      p_notes: input.notes ?? undefined,
    });

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo ajustar el stock.");
    }

    // El RPC devuelve la fila cruda de `supplies` (sin joins). Se vuelve a
    // pedir con joins para no duplicar el mapeo de categoría/unidad acá.
    return this.getSupplyById((data as { id: string }).id);
  }

  private async getSupplyById(id: string): Promise<Supply> {
    const { data, error } = await supabase
      .from("supplies")
      .select<string, RawSupplyRow>(SELECT_WITH_JOINS)
      .eq("id", id)
      .single();

    if (error || !data) throw new Error("No se pudo recargar el insumo actualizado.");
    return mapRow(data);
  }

  private async getCurrentBranchId(userId: string | undefined): Promise<string> {
    if (!userId) throw new Error("No hay sesión activa.");
    const { data, error } = await supabase
      .from("profiles")
      .select("branch_id")
      .eq("id", userId)
      .single();

    if (error || !data) throw new Error("No se pudo determinar la sucursal del usuario.");
    return data.branch_id;
  }
}
