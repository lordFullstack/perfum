import { useEffect, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus } from "lucide-react";

import type { Perfume } from "@/domain/entities/recipe.entity";
import type { PerfumeInput } from "@/domain/repositories/recipe.repository";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";

interface PerfumeFormDialogProps {
  perfume?: Perfume;
  onSubmit: (input: PerfumeInput) => Promise<Perfume | null>;
}

const EMPTY_FORM = { code: "", name: "", category: "", basePrice: "", description: "" };

export function PerfumeFormDialog({ perfume, onSubmit }: PerfumeFormDialogProps) {
  const isEditing = Boolean(perfume);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);

  useEffect(() => {
    if (!open) return;
    setForm(
      perfume
        ? {
            code: perfume.code,
            name: perfume.name,
            category: perfume.category ?? "",
            basePrice: String(perfume.basePrice),
            description: perfume.description ?? "",
          }
        : EMPTY_FORM,
    );
  }, [open, perfume]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await onSubmit({
      code: form.code.trim(),
      name: form.name.trim(),
      category: form.category.trim() || null,
      basePrice: Number(form.basePrice) || 0,
      description: form.description.trim() || null,
    });

    setIsSubmitting(false);
    if (result) setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {isEditing ? (
          <Button variant="ghost" size="icon" aria-label="Editar perfume">
            <Pencil className="size-4" />
          </Button>
        ) : (
          <Button>
            <Plus />
            Nuevo perfume
          </Button>
        )}
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar perfume" : "Nuevo perfume"}</DialogTitle>
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
              <Label htmlFor="category">Categoría (opcional)</Label>
              <Input
                id="category"
                value={form.category}
                onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
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

          <div className="flex flex-col gap-2">
            <Label htmlFor="basePrice">Precio de venta</Label>
            <Input
              id="basePrice"
              type="number"
              min={0}
              step="0.01"
              required
              className="font-data"
              value={form.basePrice}
              onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              rows={3}
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Guardando…" : isEditing ? "Guardar cambios" : "Crear perfume"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
