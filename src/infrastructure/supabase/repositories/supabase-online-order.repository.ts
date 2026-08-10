import type { OnlineOrderRepository } from "@/domain/repositories/online-order.repository";
import type { OnlineOrder, OnlineOrderStatus } from "@/domain/entities/online-order.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawOnlineOrderItemRow {
  id: string;
  perfume_id: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  perfumes: { name: string } | null;
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
  online_order_items: RawOnlineOrderItemRow[];
}

const SELECT_WITH_JOINS = `
  id, customer_name, customer_phone, customer_email, notes, total, status, created_at,
  online_order_items (
    id, perfume_id, quantity, unit_price, subtotal,
    perfumes:perfume_id ( name )
  )
`;

function mapRow(row: RawOnlineOrderRow): OnlineOrder {
  return {
    id: row.id,
    customerName: row.customer_name,
    customerPhone: row.customer_phone,
    customerEmail: row.customer_email,
    notes: row.notes,
    total: Number(row.total),
    status: row.status as OnlineOrderStatus,
    createdAt: row.created_at,
    items: (row.online_order_items ?? []).map((item) => ({
      id: item.id,
      perfumeId: item.perfume_id,
      perfumeName: item.perfumes?.name ?? "—",
      quantity: Number(item.quantity),
      unitPrice: Number(item.unit_price),
      subtotal: Number(item.subtotal),
    })),
  };
}

export class SupabaseOnlineOrderRepository implements OnlineOrderRepository {
  async listOrders(): Promise<OnlineOrder[]> {
    const { data, error } = await supabase
      .from("online_orders")
      .select<string, RawOnlineOrderRow>(SELECT_WITH_JOINS)
      .order("created_at", { ascending: false });

    if (error) throw new Error("No se pudieron cargar los pedidos online.");
    return (data ?? []).map(mapRow);
  }

  async updateStatus(orderId: string, status: OnlineOrderStatus): Promise<OnlineOrder> {
    const { data, error } = await supabase.rpc("update_online_order_status", {
      p_order_id: orderId,
      p_status: status,
    });

    if (error || !data) throw new Error(error?.message ?? "No se pudo actualizar el pedido.");

    const { data: full, error: fetchError } = await supabase
      .from("online_orders")
      .select<string, RawOnlineOrderRow>(SELECT_WITH_JOINS)
      .eq("id", orderId)
      .single();

    if (fetchError || !full) throw new Error("No se pudo recargar el pedido actualizado.");
    return mapRow(full);
  }
}
