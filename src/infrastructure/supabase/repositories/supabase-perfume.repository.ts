import type { PerfumeInput, PerfumeRepository } from "@/domain/repositories/recipe.repository";
import type { Perfume } from "@/domain/entities/recipe.entity";
import { supabase } from "@/infrastructure/supabase/client";

async function getCurrentBranchId(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("No hay sesión activa.");

  const { data, error } = await supabase.from("profiles").select("branch_id").eq("id", userId).single();
  if (error || !data) throw new Error("No se pudo determinar la sucursal del usuario.");
  return data.branch_id;
}

interface RawPerfumeRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  image_url: string | null;
  is_active: boolean;
  recipes: { id: string; is_active: boolean }[] | null;
}

function mapPerfume(row: RawPerfumeRow): Perfume {
  const activeRecipe = row.recipes?.find((r) => r.is_active) ?? null;
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    basePrice: row.base_price,
    imageUrl: row.image_url,
    isActive: row.is_active,
    activeRecipeId: activeRecipe?.id ?? null,
  };
}

export class SupabasePerfumeRepository implements PerfumeRepository {
  async listPerfumes(): Promise<Perfume[]> {
    const { data, error } = await supabase
      .from("perfumes")
      .select("*, recipes(id, is_active)")
      .order("name", { ascending: true });

    if (error) throw new Error(`Error al listar perfumes: ${error.message}`);
    return (data as RawPerfumeRow[]).map(mapPerfume);
  }

  async createPerfume(input: PerfumeInput): Promise<Perfume> {
    const branchId = await getCurrentBranchId();
    const { data, error } = await supabase
      .from("perfumes")
      .insert({
        branch_id: branchId,
        code: input.code,
        name: input.name,
        description: input.description,
        category: input.category,
        base_price: input.basePrice,
      })
      .select("*, recipes(id, is_active)")
      .single();

    if (error) throw new Error(`Error al crear perfume: ${error.message}`);
    return mapPerfume(data as RawPerfumeRow);
  }

  async updatePerfume(id: string, input: PerfumeInput): Promise<Perfume> {
    const { data, error } = await supabase
      .from("perfumes")
      .update({
        code: input.code,
        name: input.name,
        description: input.description,
        category: input.category,
        base_price: input.basePrice,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select("*, recipes(id, is_active)")
      .single();

    if (error) throw new Error(`Error al actualizar perfume: ${error.message}`);
    return mapPerfume(data as RawPerfumeRow);
  }

  async setPerfumeActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("perfumes")
      .update({ is_active: isActive, updated_at: new Date().toISOString() })
      .eq("id", id);

    if (error) throw new Error(`Error al actualizar estado del perfume: ${error.message}`);
  }

  async uploadPerfumeImage(perfumeId: string, file: File): Promise<string> {
    const ext = file.name.split(".").pop();
    const path = `${perfumeId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from("perfume-images")
      .upload(path, file, { upsert: true, cacheControl: "3600" });

    if (uploadError) throw new Error(`Error al subir imagen: ${uploadError.message}`);

    const { data } = supabase.storage.from("perfume-images").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("perfumes")
      .update({ image_url: data.publicUrl, updated_at: new Date().toISOString() })
      .eq("id", perfumeId);

    if (updateError) throw new Error(`Error al asociar imagen al perfume: ${updateError.message}`);

    return data.publicUrl;
  }
}
