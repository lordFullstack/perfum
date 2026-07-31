import { SupabaseClient } from '@supabase/supabase-js';
import { RecipeRepository } from '../../domain/repositories/RecipeRepository';
import {
  Recipe,
  CreateRecipeInput,
  RecipeCost,
  RecipeFeasibility,
  RecipeDraft,
} from '../../domain/entities/Recipe';
import { mapRecipeRow } from './mappers/recipeMapper';

export class SupabaseRecipeRepository implements RecipeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async getActiveByPerfumeId(perfumeId: string): Promise<Recipe | null> {
    const { data, error } = await this.client
      .from('recipes')
      .select('*, recipe_items(*, supplies(name), units_of_measure(abbreviation))')
      .eq('perfume_id', perfumeId)
      .eq('is_active', true)
      .maybeSingle();

    if (error) throw new Error(`Error al obtener receta activa: ${error.message}`);
    return data ? mapRecipeRow(data) : null;
  }

  async listVersionsByPerfumeId(perfumeId: string): Promise<Recipe[]> {
    const { data, error } = await this.client
      .from('recipes')
      .select('*, recipe_items(*, supplies(name), units_of_measure(abbreviation))')
      .eq('perfume_id', perfumeId)
      .order('version', { ascending: false });

    if (error) throw new Error(`Error al listar versiones de receta: ${error.message}`);
    return (data ?? []).map(mapRecipeRow);
  }

  async create(input: CreateRecipeInput): Promise<string> {
    const { data, error } = await this.client.rpc('create_recipe', {
      p_perfume_id: input.perfumeId,
      p_yield_ml: input.yieldMl,
      p_notes: input.notes ?? null,
      p_items: input.items.map((item, idx) => ({
        supply_id: item.supplyId,
        quantity: item.quantity,
        unit_id: item.unitId,
        notes: item.notes ?? null,
        sort_order: item.sortOrder ?? idx,
      })),
    });

    if (error) throw new Error(`Error al crear receta: ${error.message}`);
    return data as string;
  }

  async duplicate(recipeId: string): Promise<RecipeDraft> {
    const { data, error } = await this.client.rpc('duplicate_recipe', { p_recipe_id: recipeId });
    if (error) throw new Error(`Error al duplicar receta: ${error.message}`);

    return {
      perfumeId: data.perfume_id,
      yieldMl: Number(data.yield_ml),
      notes: data.notes,
      items: (data.items ?? []).map((item: any) => ({
        supplyId: item.supply_id,
        quantity: Number(item.quantity),
        unitId: item.unit_id,
        notes: item.notes,
        sortOrder: item.sort_order,
      })),
    };
  }

  async getCost(recipeId: string): Promise<RecipeCost> {
    const { data, error } = await this.client.rpc('calculate_recipe_cost', { p_recipe_id: recipeId });
    if (error) throw new Error(`Error al calcular costo de receta: ${error.message}`);

    return {
      totalCost: Number(data.total_cost),
      breakdown: (data.breakdown ?? []).map((item: any) => ({
        supplyId: item.supply_id,
        supplyName: item.supply_name,
        quantity: Number(item.quantity),
        unit: item.unit,
        unitCost: Number(item.unit_cost),
        subtotal: Number(item.subtotal),
      })),
    };
  }

  async checkFeasibility(recipeId: string, quantityToProduce: number): Promise<RecipeFeasibility> {
    const { data, error } = await this.client.rpc('check_recipe_feasibility', {
      p_recipe_id: recipeId,
      p_quantity_to_produce: quantityToProduce,
    });
    if (error) throw new Error(`Error al verificar disponibilidad: ${error.message}`);

    return {
      feasible: data.feasible,
      shortfalls: (data.shortfalls ?? []).map((s: any) => ({
        supplyId: s.supply_id,
        supplyName: s.supply_name,
        required: Number(s.required),
        available: Number(s.available),
        unit: s.unit,
      })),
    };
  }
}
