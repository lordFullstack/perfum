import { useState, type FormEvent } from "react";
import { Loader2, Plus, Trash2 } from "lucide-react";

import type { Supply } from "@/domain/entities/supply.entity";
import type { RecipeItemDraft } from "@/domain/entities/recipe.entity";
import type { CreateRecipeInput } from "@/domain/repositories/recipe.repository";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

interface DraftRow extends RecipeItemDraft {
  key: string;
}

function emptyRow(sortOrder: number): DraftRow {
  return {
    key: crypto.randomUUID(),
    supplyId: "",
    quantity: 0,
    unitId: "",
    notes: null,
    sortOrder,
  };
}

interface RecipeItemsFormProps {
  supplies: Supply[];
  perfumeId: string;
  initialYieldMl?: number;
  initialNotes?: string | null;
  onSubmit: (input: CreateRecipeInput) => Promise<boolean>;
  onCancel: () => void;
}

export function RecipeItemsForm({
  supplies,
  perfumeId,
  initialYieldMl,
  initialNotes,
  onSubmit,
  onCancel,
}: RecipeItemsFormProps) {
  const [yieldMl, setYieldMl] = useState(String(initialYieldMl ?? ""));
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [rows, setRows] = useState<DraftRow[]>([emptyRow(0)]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateRow(key: string, patch: Partial<DraftRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function addRow() {
    setRows((prev) => [...prev, emptyRow(prev.length)]);
  }

  function removeRow(key: string) {
    setRows((prev) => prev.filter((r) => r.key !== key));
  }

  function supplyDefaultUnit(supplyId: string): string {
    return supplies.find((s) => s.id === supplyId)?.unitId ?? "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit({
      perfumeId,
      yieldMl: Number(yieldMl) || 0,
      notes: notes.trim() || null,
      items: rows.map(({ key: _key, ...item }) => item),
    });

    setIsSubmitting(false);
    if (success) onCancel();
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <Label htmlFor="yieldMl">Rendimiento (ml producidos)</Label>
          <Input
            id="yieldMl"
            type="number"
            min={0.0001}
            step="any"
            required
            value={yieldMl}
            onChange={(e) => setYieldMl(e.target.value)}
            disabled={isSubmitting}
          />
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="recipeNotes">Notas (opcional)</Label>
        <Textarea
          id="recipeNotes"
          placeholder="Ej. macerar 48hs antes de envasar"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <Label>Insumos</Label>
          <Button type="button" variant="outline" size="sm" onClick={addRow} disabled={isSubmitting}>
            <Plus className="size-3.5" />
            Agregar insumo
          </Button>
        </div>

        <div className="flex flex-col gap-2">
          {rows.map((row) => (
            <div key={row.key} className="flex items-start gap-2 rounded-md border border-border p-2">
              <div className="grid flex-1 grid-cols-[1fr_auto] gap-2">
                <Select
                  value={row.supplyId}
                  onValueChange={(v) => updateRow(row.key, { supplyId: v, unitId: supplyDefaultUnit(v) })}
                  disabled={isSubmitting}
                >
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Elegir insumo" />
                  </SelectTrigger>
                  <SelectContent>
                    {supplies.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Input
                  type="number"
                  min={0.0001}
                  step="any"
                  placeholder="Cant."
                  className="h-9 w-24 font-data"
                  value={row.quantity || ""}
                  onChange={(e) => updateRow(row.key, { quantity: Number(e.target.value) || 0 })}
                  disabled={isSubmitting}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="mt-0.5 shrink-0"
                aria-label="Quitar insumo"
                onClick={() => removeRow(row.key)}
                disabled={isSubmitting || rows.length === 1}
              >
                <Trash2 className="size-4 text-muted-foreground" />
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-2 flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isSubmitting || !yieldMl}>
          {isSubmitting && <Loader2 className="size-4 animate-spin" />}
          {isSubmitting ? "Guardando…" : "Guardar receta"}
        </Button>
      </div>
    </form>
  );
}
