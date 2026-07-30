import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import type { Supplier } from "@/domain/entities/purchase.entity";
import type { Supply } from "@/domain/entities/supply.entity";
import type { CreatePurchaseInput } from "@/domain/repositories/purchase.repository";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

interface ItemRow {
  key: string;
  supplyId: string;
  quantity: string;
  unitCost: string;
  batchCode: string;
  expirationDate: string;
}

function emptyRow(): ItemRow {
  return {
    key: crypto.randomUUID(),
    supplyId: "",
    quantity: "",
    unitCost: "",
    batchCode: "",
    expirationDate: "",
  };
}

interface PurchaseFormDialogProps {
  suppliers: Supplier[];
  supplies: Supply[];
  onSubmit: (input: CreatePurchaseInput) => Promise<boolean>;
}

export function PurchaseFormDialog({ suppliers, supplies, onSubmit }: PurchaseFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [supplierId, setSupplierId] = useState("");
  const [purchaseDate, setPurchaseDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);

  function resetForm() {
    setSupplierId("");
    setPurchaseDate(new Date().toISOString().slice(0, 10));
    setInvoiceNumber("");
    setRows([emptyRow()]);
  }

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  const total = rows.reduce((sum, r) => sum + (Number(r.quantity) || 0) * (Number(r.unitCost) || 0), 0);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit({
      supplierId,
      purchaseDate,
      invoiceNumber: invoiceNumber.trim() || null,
      items: rows
        .filter((r) => r.supplyId)
        .map((r) => ({
          supplyId: r.supplyId,
          quantity: Number(r.quantity) || 0,
          unitCost: Number(r.unitCost) || 0,
          batchCode: r.batchCode.trim() || null,
          expirationDate: r.expirationDate || null,
        })),
    });

    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      resetForm();
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) resetForm();
      }}
    >
      <DialogTrigger asChild>
        <Button>
          <Plus />
          Nueva compra
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar compra</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Proveedor</Label>
              <Select value={supplierId} onValueChange={setSupplierId} disabled={isSubmitting}>
                <SelectTrigger>
                  <SelectValue placeholder="Elegir" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="purchaseDate">Fecha</Label>
              <Input
                id="purchaseDate"
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="invoiceNumber">N° de factura (opcional)</Label>
            <Input
              id="invoiceNumber"
              className="font-data"
              value={invoiceNumber}
              onChange={(e) => setInvoiceNumber(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-3">
            <Label>Ítems</Label>
            {rows.map((row, index) => (
              <div key={row.key} className="flex flex-col gap-2 rounded-md border border-border p-3">
                <div className="flex items-center justify-between gap-2">
                  <Select
                    value={row.supplyId}
                    onValueChange={(v) => updateRow(row.key, { supplyId: v })}
                    disabled={isSubmitting}
                  >
                    <SelectTrigger className="h-9">
                      <SelectValue placeholder="Insumo" />
                    </SelectTrigger>
                    <SelectContent>
                      {supplies.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} ({s.unitAbbreviation})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar ítem"
                      onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                      disabled={isSubmitting}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    type="number"
                    min={0.0001}
                    step="any"
                    placeholder={`Cantidad${index === 0 ? " *" : ""}`}
                    required
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Input
                    type="number"
                    min={0}
                    step="any"
                    className="font-data"
                    placeholder="Costo unitario"
                    required
                    value={row.unitCost}
                    onChange={(e) => updateRow(row.key, { unitCost: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <Input
                    placeholder="Lote (opcional)"
                    className="font-data"
                    value={row.batchCode}
                    onChange={(e) => updateRow(row.key, { batchCode: e.target.value })}
                    disabled={isSubmitting}
                  />
                  <Input
                    type="date"
                    placeholder="Vencimiento"
                    value={row.expirationDate}
                    onChange={(e) => updateRow(row.key, { expirationDate: e.target.value })}
                    disabled={isSubmitting}
                  />
                </div>
              </div>
            ))}

            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setRows((prev) => [...prev, emptyRow()])}
              disabled={isSubmitting}
            >
              <Plus className="size-4" />
              Agregar ítem
            </Button>
          </div>

          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Total</span>
            <span className="font-data font-medium text-foreground">${total.toFixed(2)}</span>
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isSubmitting || !supplierId}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Registrando…" : "Registrar compra"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
