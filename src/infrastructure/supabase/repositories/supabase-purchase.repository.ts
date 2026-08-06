import type { CreatePurchaseInput, PurchaseRepository } from "@/domain/repositories/purchase.repository";
import type { Purchase, PurchaseStatus } from "@/domain/entities/purchase.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawPurchaseItemRow {
  id: string;
  supply_id: string;
  quantity: number;
  unit_cost: number;
  batch_code: string | null;
  expiration_date: string | null;
  subtotal: number;
  supplies: { name: string; units_of_measure: { abbreviation: string } | null } | null;
}

interface RawPurchaseRow {
  id: string;
  supplier_id: string;
  purchase_date: string;
  invoice_number: string | null;
  status: string;
  total_amount: number;
  created_at: string;
  suppliers: { name: string } | null;
  purchase_items: RawPurchaseItemRow[];
}

const SELECT_WITH_JOINS = `
  id, supplier_id, purchase_date, invoice_number, status, total_amount, created_at,
  suppliers:supplier_id ( name ),
  purchase_items (
    id, supply_id, quantity, unit_cost, batch_code, expiration_date, subtotal,
    supplies:supply_id ( name, units_of_measure:unit_id ( abbreviation ) )
  )
`;

function mapRow(row: RawPurchaseRow): Purchase {
  return {
    id: row.id,
    supplierId: row.supplier_id,
    supplierName: row.suppliers?.name ?? "—",
    purchaseDate: row.purchase_date,
    invoiceNumber: row.invoice_number,
    status: row.status as PurchaseStatus,
    totalAmount: Number(row.total_amount),
    createdAt: row.created_at,
    items: (row.purchase_items ?? []).map((item) => ({
      id: item.id,
      supplyId: item.supply_id,
      supplyName: item.supplies?.name ?? "—",
      unitAbbreviation: item.supplies?.units_of_measure?.abbreviation ?? "",
      quantity: Number(item.quantity),
      unitCost: Number(item.unit_cost),
      batchCode: item.batch_code,
      expirationDate: item.expiration_date,
      subtotal: Number(item.subtotal),
    })),
  };
}

export class SupabasePurchaseRepository implements PurchaseRepository {
  async listPurchases(): Promise<Purchase[]> {
    const { data, error } = await supabase
      .from("purchases")
      .select<string, RawPurchaseRow>(SELECT_WITH_JOINS)
      .order("created_at", { ascending: false });

    if (error) throw new Error("No se pudieron cargar las compras.");
    return (data ?? []).map(mapRow);
  }

  async createPurchase(input: CreatePurchaseInput): Promise<Purchase> {
    const { data, error } = await supabase.rpc("create_purchase", {
      p_supplier_id: input.supplierId,
      p_purchase_date: input.purchaseDate,
      p_invoice_number: input.invoiceNumber,
      p_items: input.items.map((item) => ({
        supply_id: item.supplyId,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        batch_code: item.batchCode,
        expiration_date: item.expirationDate,
      })),
    });

    if (error || !data) {
      throw new Error(error?.message ?? "No se pudo registrar la compra.");
    }

    return this.getPurchaseById((data as { id: string }).id);
  }

  async cancelPurchase(purchaseId: string): Promise<void> {
    const { error } = await supabase.rpc("cancel_purchase", { p_purchase_id: purchaseId });
    if (error) throw new Error(error.message ?? "No se pudo cancelar la compra.");
  }

  private async getPurchaseById(id: string): Promise<Purchase> {
    const { data, error } = await supabase
      .from("purchases")
      .select<string, RawPurchaseRow>(SELECT_WITH_JOINS)
      .eq("id", id)
      .single();

    if (error || !data) throw new Error("No se pudo recargar la compra registrada.");
    return mapRow(data);
  }
}
