import type { Supplier } from "@/domain/entities/purchase.entity";

export interface SupplierInput {
  name: string;
  taxId: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface SupplierRepository {
  listSuppliers(): Promise<Supplier[]>;
  createSupplier(input: SupplierInput): Promise<Supplier>;
  updateSupplier(id: string, input: SupplierInput): Promise<Supplier>;
  setSupplierActive(id: string, isActive: boolean): Promise<void>;
}
