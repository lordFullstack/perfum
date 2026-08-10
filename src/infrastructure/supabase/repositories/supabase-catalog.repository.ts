import type { CatalogRepository, SubmitOnlineOrderInput } from "@/domain/repositories/catalog.repository";
import type { CatalogPerfume } from "@/domain/entities/catalog-perfume.entity";
import type { OnlineOrder, OnlineOrderStatus } from "@/domain/entities/online-order.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawCatalogPerfumeRow {
  id: string;
  name: string;
  description: string | null;
  category: string | null;
  base_price: number;
  image_url: string | null;
}

interface RawOnlineOrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  notes: string | null;
  total: number;
  status: string;
  created_at: string;
}

function mapPerfume(row: RawCatalogPerfumeRow): CatalogPerfume {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    category: row.category,
    basePrice: Number(row.base_price),
    imageUrl: row.image_url,
  };
}

function mapOrder(row: RawOnlineOrderRow): OnlineOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    notes: row.notes,
    total: Number(row.total),
    status: row.status as OnlineOrderStatus,
    createdAt: row.created_at,
    items: [],
  };
}

export class SupabaseCatalogRepository implements CatalogRepository {
  async listCatalogPerfumes(): Promise<CatalogPerfume[]> {
    const { data, error } = await supabase
      .from("perfumes")
      .select("id, name, description, category, base_price, image_url")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudo cargar el catálogo.");
    return (data ?? []).map(mapPerfume);
  }

  async submitOrder(input: SubmitOnlineOrderInput): Promise<OnlineOrder> {
    const { data, error } = await supabase.rpc("submit_online_order", {
      p_customer_name: input.customerName,
      p_customer_phone: input.customerPhone,
      p_items: input.items.map((item) => ({
        perfume_id: item.perfumeId,
        quantity: item.quantity,
      })),
      p_customer_email: input.customerEmail ?? undefined,
      p_notes: input.notes ?? undefined,
    });

    if (error || !data) throw new Error(error?.message ?? "No se pudo enviar el pedido.");
    return mapOrder(data as RawOnlineOrderRow);
  }
}
