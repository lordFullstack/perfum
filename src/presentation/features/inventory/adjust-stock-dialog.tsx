import { useState, type FormEvent } from "react";
import { Loader2, PackagePlus, PackageMinus } from "lucide-react";

import type { Supply, StockMovementType } from "@/domain/entities/supply.entity";
import type { AdjustStockInput } from "@/domain/repositories/supply.repository";
import { usePermission } from "@/presentation/hooks/use-permission";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface AdjustStockDialogProps {
  supply: Supply;
  onAdjust: (input: AdjustStockInput) => Promise<boolean>;
}

const DIRECTION_OPTIONS: { value: "in" | "out"; label: string; movementType: StockMovementType }[] = [
  { value: "in", label: "Entrada (suma stock)", movementType: "adjustment_in" },
  { value: "out", label: "Salida (resta stock)", movementType: "adjustment_out" },
];

export function AdjustStockDialog({ supply, onAdjust }: AdjustStockDialogProps) {
  const canReadCost = usePermission("inventory.read_cost");
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [direction, setDirection] = useState<"in" | "out">("in");
  const [quantity, setQuantity] = useState("");
  const [unitCost, setUnitCost] = useState("");
  const [notes, setNotes] = useState("");

  function resetForm() {
    setDirection("in");
    setQuantity("");
    setUnitCost("");
    setNotes("");
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const movementType = DIRECTION_OPTIONS.find((d) => d.value === direction)!.movementType;

    const success = await onAdjust({
      supplyId: supply.id,
      quantity: Number(quantity),
      movementType,
      unitCost: direction === "in" && unitCost ? Number(unitCost) : null,
      notes: notes.trim() || null,
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
        <Button variant="outline" size="sm">
          {direction === "in" ? <PackagePlus className="size-4" /> : <PackageMinus className="size-4" />}
          Ajustar stock
        </Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajustar stock — {supply.name}</DialogTitle>
          <DialogDescription>
            Stock actual: <span className="font-data text-foreground">{supply.stock} {supply.unitAbbreviation}</span>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tipo de movimiento</Label>
            <Select value={direction} onValueChange={(v) => setDirection(v as "in" | "out")} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DIRECTION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="quantity">Cantidad ({supply.unitAbbreviation})</Label>
              <Input
                id="quantity"
                type="number"
                min={0.0001}
                step="any"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
            {direction === "in" && canReadCost && (
              <div className="flex flex-col gap-2">
                <Label htmlFor="unitCost">Costo unitario (opcional)</Label>
                <Input
                  id="unitCost"
                  type="number"
                  min={0}
                  step="any"
                  className="font-data"
                  value={unitCost}
                  onChange={(e) => setUnitCost(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="notes">Motivo (opcional)</Label>
            <Textarea
              id="notes"
              placeholder="Ej. Carga inicial de stock, merma por rotura, etc."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isSubmitting || !quantity}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Guardando…" : "Confirmar ajuste"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
