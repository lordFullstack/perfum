import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";

import type { Supply, SupplyCategory, UnitOfMeasure } from "@/domain/entities/supply.entity";
import type { SupplyInput } from "@/domain/repositories/supply.repository";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
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

interface SupplyFormDialogProps {
  categories: SupplyCategory[];
  units: UnitOfMeasure[];
  /** Si se pasa, el diálogo edita ese insumo; si no, crea uno nuevo. */
  supply?: Supply;
  onSubmit: (input: SupplyInput) => Promise<boolean>;
}

const EMPTY_FORM = { code: "", name: "", categoryId: "", unitId: "", minStock: "0", location: "" };

export function SupplyFormDialog({ categories, units, supply, onSubmit }: SupplyFormDialogProps) {
  const isEditing = Boolean(supply);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    if (supply) {
      setForm({
        code: supply.code,
        name: supply.name,
        categoryId: supply.categoryId,
        unitId: supply.unitId,
        minStock: String(supply.minStock),
        location: supply.location ?? "",
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, supply]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit({
      code: form.code,
      name: form.name,
      categoryId: form.categoryId,
      unitId: form.unitId,
      minStock: Number(form.minStock) || 0,
      location: form.location.trim() || null,
    });

    setIsSubmitting(false);
    if (success) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" aria-label="Editar insumo">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus />
            Nuevo insumo
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar insumo" : "Nuevo insumo"}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? "El stock actual no se modifica acá — usá \"Ajustar stock\" para eso."
              : "El insumo se crea con stock inicial en 0. Cargá el stock con \"Ajustar stock\" después de crearlo."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                required
                className="font-data"
                value={form.code}
                onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="minStock">Stock mínimo</Label>
              <Input
                id="minStock"
                type="number"
                min={0}
                step="any"
                required
                value={form.minStock}
                onChange={(e) => setForm((f) => ({ ...f, minStock: e.target.value }))}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="name">Nombre</Label>
            <Input
              id="name"
              required
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-2">
              <Label>Categoría</Label>
              <Select
                value={form.categoryId}
                onValueChange={(v) => setForm((f) => ({ ...f, categoryId: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex flex-col gap-2">
              <Label>Unidad</Label>
              <Select
                value={form.unitId}
                onValueChange={(v) => setForm((f) => ({ ...f, unitId: v }))}
                disabled={isSubmitting}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Elegir" />
                </SelectTrigger>
                <SelectContent>
                  {units.map((u) => (
                    <SelectItem key={u.id} value={u.id}>
                      {u.name} ({u.abbreviation})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="location">Ubicación (opcional)</Label>
            <Input
              id="location"
              placeholder="Ej. Estante A, Depósito 2"
              value={form.location}
              onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isSubmitting || !form.categoryId || !form.unitId}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear insumo"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
