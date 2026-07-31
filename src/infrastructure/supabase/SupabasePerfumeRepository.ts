import { SupabaseClient } from '@supabase/supabase-js';
import { PerfumeRepository } from '../../domain/repositories/PerfumeRepository';
import { Perfume, PerfumeWithRecipe, CreatePerfumeInput, UpdatePerfumeInput } from '../../domain/entities/Perfume';
import { mapPerfumeRow, mapPerfumeWithRecipeRow } from './mappers/perfumeMapper';

export class SupabasePerfumeRepository implements PerfumeRepository {
  constructor(private readonly client: SupabaseClient) {}

  async list(branchId: string): Promise<PerfumeWithRecipe[]> {
    const { data: perfumes, error } = await this.client
      .from('perfumes')
      .select('*, recipes!left(id, is_active)')
      .eq('branch_id', branchId)
      .order('name', { ascending: true });

    if (error) throw new Error(`Error al listar perfumes: ${error.message}`);

    const results: PerfumeWithRecipe[] = [];
    for (const row of perfumes ?? []) {
      const activeRecipe = (row.recipes ?? []).find((r: any) => r.is_active);
      let recipeCost: number | null = null;

      if (activeRecipe) {
        const { data: costData, error: costError } = await this.client.rpc('calculate_recipe_cost', {
          p_recipe_id: activeRecipe.id,
        });
        // Si el usuario no tiene permiso recipes.read_cost, el RPC lanza excepción:
        // se ignora silenciosamente y el costo queda en null (la UI ya oculta ese dato sin permiso).
        recipeCost = costError ? null : costData?.total_cost ?? null;
      }

      results.push(
        mapPerfumeWithRecipeRow({
          ...row,
          active_recipe_id: activeRecipe?.id ?? null,
          recipe_cost: recipeCost,
        })
      );
    }

    return results;
  }

  async getById(id: string): Promise<Perfume | null> {
    const { data, error } = await this.client.from('perfumes').select('*').eq('id', id).maybeSingle();
    if (error) throw new Error(`Error al obtener perfume: ${error.message}`);
    return data ? mapPerfumeRow(data) : null;
  }

  async create(input: CreatePerfumeInput): Promise<Perfume> {
    const { data, error } = await this.client
      .from('perfumes')
      .insert({
        code: input.code,
        name: input.name,
        description: input.description,
        category: input.category,
        base_price: input.basePrice,
        image_url: input.imageUrl,
        is_active: input.isActive ?? true,
      })
      .select('*')
      .single();

    if (error) throw new Error(`Error al crear perfume: ${error.message}`);
    return mapPerfumeRow(data);
  }

  async update(id: string, input: UpdatePerfumeInput): Promise<Perfume> {
    const payload: Record<string, unknown> = {};
    if (input.code !== undefined) payload.code = input.code;
    if (input.name !== undefined) payload.name = input.name;
    if (input.description !== undefined) payload.description = input.description;
    if (input.category !== undefined) payload.category = input.category;
    if (input.basePrice !== undefined) payload.base_price = input.basePrice;
    if (input.imageUrl !== undefined) payload.image_url = input.imageUrl;
    if (input.isActive !== undefined) payload.is_active = input.isActive;
    payload.updated_at = new Date().toISOString();

    const { data, error } = await this.client.from('perfumes').update(payload).eq('id', id).select('*').single();
    if (error) throw new Error(`Error al actualizar perfume: ${error.message}`);
    return mapPerfumeRow(data);
  }

  async uploadImage(perfumeId: string, file: File): Promise<string> {
    const ext = file.name.split('.').pop();
    const path = `perfumes/${perfumeId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await this.client.storage.from('perfume-images').upload(path, file, {
      upsert: true,
      cacheControl: '3600',
    });
    if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

    const { data } = this.client.storage.from('perfume-images').getPublicUrl(path);
    return data.publicUrl;
  }
}
