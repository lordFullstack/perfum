import type { SupplierInput, SupplierRepository } from "@/domain/repositories/supplier.repository";
import type { Supplier } from "@/domain/entities/purchase.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawSupplierRow {
  id: string;
  name: string;
  tax_id: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  is_active: boolean;
}

function mapRow(row: RawSupplierRow): Supplier {
  return {
    id: row.id,
    name: row.name,
    taxId: row.tax_id,
    phone: row.phone,
    email: row.email,
    address: row.address,
    isActive: row.is_active,
  };
}

async function getCurrentBranchId(): Promise<string> {
  const { data: sessionData } = await supabase.auth.getSession();
  const userId = sessionData.session?.user.id;
  if (!userId) throw new Error("No hay sesión activa.");

  const { data, error } = await supabase.from("profiles").select("branch_id").eq("id", userId).single();
  if (error || !data) throw new Error("No se pudo determinar la sucursal del usuario.");
  return data.branch_id;
}

export class SupabaseSupplierRepository implements SupplierRepository {
  async listSuppliers(): Promise<Supplier[]> {
    const { data, error } = await supabase
      .from("suppliers")
      .select("id, name, tax_id, phone, email, address, is_active")
      .eq("is_active", true)
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudieron cargar los proveedores.");
    return (data ?? []).map(mapRow);
  }

  async createSupplier(input: SupplierInput): Promise<Supplier> {
    const branchId = await getCurrentBranchId();

    const { data, error } = await supabase
      .from("suppliers")
      .insert({
        branch_id: branchId,
        name: input.name.trim(),
        tax_id: input.taxId,
        phone: input.phone,
        email: input.email,
        address: input.address,
      })
      .select("id, name, tax_id, phone, email, address, is_active")
      .single();

    if (error || !data) throw new Error("No se pudo crear el proveedor.");
    return mapRow(data);
  }

  async updateSupplier(id: string, input: SupplierInput): Promise<Supplier> {
    const { data, error } = await supabase
      .from("suppliers")
      .update({
        name: input.name.trim(),
        tax_id: input.taxId,
        phone: input.phone,
        email: input.email,
        address: input.address,
      })
      .eq("id", id)
      .select("id, name, tax_id, phone, email, address, is_active")
      .single();

    if (error || !data) throw new Error("No se pudo actualizar el proveedor.");
    return mapRow(data);
  }

  async setSupplierActive(id: string, isActive: boolean): Promise<void> {
    const { error } = await supabase.from("suppliers").update({ is_active: isActive }).eq("id", id);
    if (error) throw new Error("No se pudo actualizar el estado del proveedor.");
  }
}
