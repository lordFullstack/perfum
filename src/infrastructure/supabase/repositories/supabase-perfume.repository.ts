import type { PerfumeInput, PerfumeRepository } from "@/domain/repositories/perfume.repository";
import type { Perfume } from "@/domain/entities/perfume.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawPerfumeRow {
  id: string;
  code: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  image_url: string | null;
  is_active: boolean;
}

function mapRow(row: RawPerfumeRow): Perfume {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    category: row.category,
    basePrice: Number(row.base_price),
    imageUrl: row.image_url,
    isActive: row.is_active,
  };
}

const SELECT = "id, code, name, description, category, base_price, image_url, is_active";

async function getCurrentBranchId(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("No hay sesión activa.");

  const { data, error } = await supabase.from("profiles").select("branch_id").eq("id", userId).single();
  if (error || !data) throw new Error("No se pudo determinar la sucursal del usuario.");
  return data.branch_id;
}

export class SupabasePerfumeRepository implements PerfumeRepository {
  async listPerfumes(): Promise<Perfume[]> {
    const { data, error } = await supabase
      .from("perfumes")
      .select(SELECT)
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudieron cargar los perfumes.");
    return (data ?? []).map(mapRow);
  }

  async createPerfume(input: PerfumeInput): Promise<Perfume> {
    const branchId = await getCurrentBranchId();

    const { data, error } = await supabase
      .from("perfumes")
      .insert({
        branch_id: branchId,
        code: input.code.trim(),
        name: input.name.trim(),
        description: input.description,
        category: input.category,
        base_price: input.basePrice,
      })
      .select(SELECT)
      .single();

    if (error || !data) {
      const message = error?.code === "23505" ? "Ya existe un perfume con ese código." : "No se pudo crear el perfume.";
      throw new Error(message);
    }
    return mapRow(data);
  }

  async updatePerfume(id: string, input: PerfumeInput): Promise<Perfume> {
    const { data, error } = await supabase
      .from("perfumes")
      .update({
        code: input.code.trim(),
        name: input.name.trim(),
        description: input.description,
        category: input.category,
        base_price: input.basePrice,
      })
      .eq("id", id)
      .select(SELECT)
      .single();

    if (error || !data) {
      const message = error?.code === "23505" ? "Ya existe un perfume con ese código." : "No se pudo actualizar el perfume.";
      throw new Error(message);
    }
    return mapRow(data);
  }

  async setPerfumeActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from("perfumes").update({ is_active: isActive }).eq("id", id);
    if (error) throw new Error("No se pudo actualizar el estado del perfume.");
  }

  async uploadImage(perfumeId: string, file: File): Promise<string> {
    const extension = file.name.split(".").pop() ?? "jpg";
    const path = `${perfumeId}/${Date.now()}.${extension}`;

    const { error: uploadError } = await supabase.storage
      .from("perfume-images")
      .upload(path, file, { upsert: true });

    if (uploadError) throw new Error("No se pudo subir la imagen.");

    const { data } = supabase.storage.from("perfume-images").getPublicUrl(path);

    const { error: updateError } = await supabase
      .from("perfumes")
      .update({ image_url: data.publicUrl })
      .eq("id", perfumeId);

    if (updateError) throw new Error("La imagen se subió pero no se pudo vincular al perfume.");

    return data.publicUrl;
  }
}
