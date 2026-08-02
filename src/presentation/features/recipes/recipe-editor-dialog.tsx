import { useEffect, useState, type FormEvent } from "react";
import { Beaker, Loader2, Plus, Trash2 } from "lucide-react";

import type { Perfume } from "@/domain/entities/recipe.entity";
import type { Supply } from "@/domain/entities/supply.entity";
import { recipeMargin } from "@/domain/entities/recipe.entity";
import { useRecipe } from "@/presentation/features/recipes/use-recipe";
import { usePermission } from "@/presentation/hooks/use-permission";
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
}

function emptyRow(): ItemRow {
  return { key: crypto.randomUUID(), supplyId: "", quantity: "" };
}

interface RecipeEditorDialogProps {
  perfume: Perfume;
  supplies: Supply[];
}

export function RecipeEditorDialog({ perfume, supplies }: RecipeEditorDialogProps) {
  const [open, setOpen] = useState(false);
  const canWrite = usePermission("recipes.create") || usePermission("recipes.update");
  const canReadCost = usePermission("recipes.read_cost");

  const { recipe, cost, isLoading, isSaving, saveNewVersion, checkFeasibility } = useRecipe(
    open ? perfume.id : null,
  );

  const [yieldMl, setYieldMl] = useState("100");
  const [notes, setNotes] = useState("");
  const [rows, setRows] = useState<ItemRow[]>([emptyRow()]);
  const [testQuantity, setTestQuantity] = useState("1");
  const [shortfalls, setShortfalls] = useState<
    { supplyId: string; supplyName: string; required: number; available: number; unitAbbreviation: string }[] | null
  >(null);

  useEffect(() => {
    if (!recipe) return;
    setYieldMl(String(recipe.yieldMl));
    setNotes(recipe.notes ?? "");
    setRows(
      recipe.items.length > 0
        ? recipe.items.map((item) => ({
            key: crypto.randomUUID(),
            supplyId: item.supplyId,
            quantity: String(item.quantity),
          }))
        : [emptyRow()],
    );
  }, [recipe]);

  function updateRow(key: string, patch: Partial<ItemRow>) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, ...patch } : r)));
  }

  function supplyUnit(supplyId: string): string {
    return supplies.find((s) => s.id === supplyId)?.unitAbbreviation ?? "";
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const items = rows
      .filter((r) => r.supplyId)
      .map((r) => {
        const supply = supplies.find((s) => s.id === r.supplyId);
        return { supplyId: r.supplyId, quantity: Number(r.quantity) || 0, unitId: supply?.unitId ?? "" };
      });

    await saveNewVersion(Number(yieldMl) || 0, notes.trim() || null, items);
  }

  async function handleCheckFeasibility() {
    const result = await checkFeasibility(Number(testQuantity) || 0);
    setShortfalls(result ? result.shortfalls : null);
  }

  const margin = cost ? recipeMargin(perfume.basePrice, cost.totalCost) : null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Beaker className="size-4" />
          {perfume.activeRecipeId ? "Ver receta" : "Crear receta"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receta — {perfume.name}</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <p className="text-sm text-muted-foreground">Cargando receta…</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="yieldMl">Rendimiento (ml)</Label>
                <Input
                  id="yieldMl"
                  type="number"
                  min={1}
                  step="any"
                  required
                  className="font-data"
                  value={yieldMl}
                  onChange={(e) => setYieldMl(e.target.value)}
                  disabled={!canWrite || isSaving}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Input
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={!canWrite || isSaving}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3">
              <Label>Insumos</Label>
              {rows.map((row, index) => (
                <div key={row.key} className="flex items-center gap-2">
                  <Select
                    value={row.supplyId}
                    onValueChange={(v) => updateRow(row.key, { supplyId: v })}
                    disabled={!canWrite || isSaving}
                  >
                    <SelectTrigger className="h-9 flex-1">
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
                  <Input
                    type="number"
                    min={0.0001}
                    step="any"
                    placeholder={`Cant.${index === 0 ? " *" : ""}`}
                    required
                    className="w-28 font-data"
                    value={row.quantity}
                    onChange={(e) => updateRow(row.key, { quantity: e.target.value })}
                    disabled={!canWrite || isSaving}
                  />
                  <span className="w-10 shrink-0 text-xs text-muted-foreground">
                    {supplyUnit(row.supplyId)}
                  </span>
                  {canWrite && rows.length > 1 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      aria-label="Quitar insumo"
                      onClick={() => setRows((prev) => prev.filter((r) => r.key !== row.key))}
                      disabled={isSaving}
                    >
                      <Trash2 className="size-4 text-muted-foreground" />
                    </Button>
                  )}
                </div>
              ))}

              {canWrite && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setRows((prev) => [...prev, emptyRow()])}
                  disabled={isSaving}
                >
                  <Plus className="size-4" />
                  Agregar insumo
                </Button>
              )}
            </div>

            {canReadCost && cost && (
              <div className="flex flex-col gap-1.5 rounded-md bg-muted px-3 py-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Costo total</span>
                  <span className="font-data font-medium text-foreground">
                    ${cost.totalCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Precio de venta</span>
                  <span className="font-data text-foreground">${perfume.basePrice.toFixed(2)}</span>
                </div>
                {margin !== null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Margen</span>
                    <span
                      className={`font-data font-medium ${margin < 20 ? "text-destructive" : "text-foreground"}`}
                    >
                      {margin.toFixed(1)}%
                    </span>
                  </div>
                )}
              </div>
            )}

            {recipe && (
              <div className="flex flex-col gap-2 rounded-md border border-border p-3">
                <div className="flex items-center gap-2">
                  <Label htmlFor="testQuantity" className="shrink-0">
                    Verificar stock para
                  </Label>
                  <Input
                    id="testQuantity"
                    type="number"
                    min={1}
                    className="h-8 w-20 font-data"
                    value={testQuantity}
                    onChange={(e) => setTestQuantity(e.target.value)}
                  />
                  <Button type="button" variant="outline" size="sm" onClick={handleCheckFeasibility}>
                    Verificar
                  </Button>
                </div>
                {shortfalls && (
                  <p className={`text-xs ${shortfalls.length === 0 ? "text-emerald-600" : "text-destructive"}`}>
                    {shortfalls.length === 0
                      ? "Stock suficiente para producir la cantidad indicada."
                      : shortfalls
                          .map((s) => `Falta ${(s.required - s.available).toFixed(2)} ${s.unitAbbreviation} de ${s.supplyName}`)
                          .join(" · ")}
                  </p>
                )}
              </div>
            )}

            {canWrite && (
              <DialogFooter className="mt-2">
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="size-4 animate-spin" />}
                  {isSaving ? "Guardando…" : recipe ? "Guardar nueva versión" : "Crear receta"}
                </Button>
              </DialogFooter>
            )}
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
