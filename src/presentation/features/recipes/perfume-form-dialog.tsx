import { useEffect, useRef, useState, type FormEvent } from "react";
import { Loader2, Pencil, Plus, Upload } from "lucide-react";

import type { Perfume } from "@/domain/entities/perfume.entity";
import type { PerfumeInput } from "@/domain/repositories/perfume.repository";
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

interface PerfumeFormDialogProps {
  perfume?: Perfume;
  onSubmit: (input: PerfumeInput) => Promise<Perfume | boolean | null>;
  onUploadImage?: (perfume: Perfume, file: File) => Promise<void>;
}

const EMPTY_FORM = { code: "", name: "", description: "", category: "", basePrice: "0" };

export function PerfumeFormDialog({ perfume, onSubmit, onUploadImage }: PerfumeFormDialogProps) {
  const isEditing = Boolean(perfume);
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!open) return;
    if (perfume) {
      setForm({
        code: perfume.code,
        name: perfume.name,
        description: perfume.description ?? "",
        category: perfume.category ?? "",
        basePrice: String(perfume.basePrice),
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [open, perfume]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const result = await onSubmit({
      code: form.code,
      name: form.name,
      description: form.description.trim() || null,
      category: form.category.trim() || null,
      basePrice: Number(form.basePrice) || 0,
    });

    setIsSubmitting(false);
    if (result) setOpen(false);
  }

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file || !perfume || !onUploadImage) return;
    setIsUploading(true);
    await onUploadImage(perfume, file);
    setIsUploading(false);
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
          <DialogDescription>
            {isEditing
              ? "La receta se gestiona por separado, desde \"Gestionar receta\"."
              : "Después de crearlo, gestioná su receta y podés subir una imagen."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {isEditing && onUploadImage && perfume && (
            <div className="flex items-center gap-3">
              <div className="flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                {perfume.imageUrl ? (
                  <img src={perfume.imageUrl} alt="" className="size-full object-cover" />
                ) : (
                  <span className="text-xs text-muted-foreground">Sin foto</span>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={handleFileChange}
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
              >
                {isUploading ? <Loader2 className="size-4 animate-spin" /> : <Upload className="size-4" />}
                {isUploading ? "Subiendo…" : "Cambiar imagen"}
              </Button>
            </div>
          )}

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
              <Label htmlFor="basePrice">Precio base</Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step="any"
                required
                className="font-data"
                value={form.basePrice}
                onChange={(e) => setForm((f) => ({ ...f, basePrice: e.target.value }))}
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
            <Label htmlFor="category">Categoría (opcional)</Label>
            <Input
              id="category"
              placeholder="Ej. Floral, Amaderado, Cítrico"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              disabled={isSubmitting}
            />
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
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
