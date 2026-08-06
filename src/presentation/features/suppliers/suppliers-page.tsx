import { Mail, Phone } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { useSuppliers } from "@/presentation/features/suppliers/use-suppliers";
import { SupplierFormDialog } from "@/presentation/features/suppliers/supplier-form-dialog";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import { Button } from "@/presentation/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

export function SuppliersPage() {
  const canCreate = usePermission("suppliers.create");
  const canUpdate = usePermission("suppliers.update");
  const canDelete = usePermission("suppliers.delete");
  const { suppliers, isLoading, createSupplier, updateSupplier, deactivateSupplier } = useSuppliers();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Proveedores</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {suppliers.length} proveedor{suppliers.length !== 1 && "es"} activo
            {suppliers.length !== 1 && "s"}
          </p>
        </div>
        {canCreate && <SupplierFormDialog onSubmit={createSupplier} />}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : suppliers.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay proveedores</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Cargá tus proveedores para poder registrar compras contra ellos.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Proveedor</TableHead>
                <TableHead>Contacto</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {suppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground">{supplier.name}</p>
                    {supplier.taxId && (
                      <p className="font-data text-xs text-muted-foreground">{supplier.taxId}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
                      {supplier.phone && (
                        <span className="flex items-center gap-1.5">
                          <Phone className="size-3" /> {supplier.phone}
                        </span>
                      )}
                      {supplier.email && (
                        <span className="flex items-center gap-1.5">
                          <Mail className="size-3" /> {supplier.email}
                        </span>
                      )}
                      {!supplier.phone && !supplier.email && "—"}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {canUpdate && (
                        <SupplierFormDialog
                          supplier={supplier}
                          onSubmit={(input) => updateSupplier(supplier.id, input)}
                        />
                      )}
                      {canDelete && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-muted-foreground hover:text-destructive"
                          onClick={() => deactivateSupplier(supplier)}
                        >
                          Desactivar
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
