import { useState, type FormEvent } from "react";
import { CheckCircle2, Factory, Loader2, Plus, XCircle } from "lucide-react";

import type { Perfume } from "@/domain/entities/perfume.entity";
import type { Recipe, RecipeFeasibility } from "@/domain/entities/recipe.entity";
import type { CreateProductionInput } from "@/domain/repositories/production.repository";
import { useRecipeRepository } from "@/presentation/hooks/use-recipe-management";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import { Separator } from "@/presentation/components/ui/separator";
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

interface ProductionFormDialogProps {
  perfumes: Perfume[];
  onSubmit: (input: CreateProductionInput) => Promise<boolean>;
}

export function ProductionFormDialog({ perfumes, onSubmit }: ProductionFormDialogProps) {
  const recipeRepository = useRecipeRepository();

  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [perfumeId, setPerfumeId] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [notes, setNotes] = useState("");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
  const [recipeError, setRecipeError] = useState<string | null>(null);

  const [feasibility, setFeasibility] = useState<RecipeFeasibility | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  function resetForm() {
    setPerfumeId("");
    setQuantity("1");
    setNotes("");
    setRecipe(null);
    setRecipeError(null);
    setFeasibility(null);
  }

  async function handlePerfumeChange(value: string) {
    setPerfumeId(value);
    setRecipe(null);
    setRecipeError(null);
    setFeasibility(null);
    setIsLoadingRecipe(true);
    try {
      const active = await recipeRepository.getActiveRecipe(value);
      if (!active) {
        setRecipeError("Este perfume todavía no tiene una receta activa.");
      }
      setRecipe(active);
    } catch (error) {
      setRecipeError(error instanceof Error ? error.message : "No se pudo cargar la receta.");
    } finally {
      setIsLoadingRecipe(false);
    }
  }

  async function handleCheckFeasibility() {
    if (!recipe) return;
    setIsChecking(true);
    try {
      setFeasibility(await recipeRepository.checkFeasibility(recipe.id, Number(quantity) || 1));
    } finally {
      setIsChecking(false);
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!recipe) return;
    setIsSubmitting(true);

    const success = await onSubmit({
      perfumeId,
      recipeId: recipe.id,
      quantityToProduce: Number(quantity) || 0,
      notes: notes.trim() || null,
    });

    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      resetForm();
    }
  }

  const canSubmit = Boolean(recipe) && Number(quantity) > 0 && !isSubmitting;

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
          Nueva producción
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Registrar producción</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex max-h-[70vh] flex-col gap-4 overflow-y-auto pr-1">
          <div className="flex flex-col gap-2">
            <Label>Perfume</Label>
            <Select value={perfumeId} onValueChange={handlePerfumeChange} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue placeholder="Elegir" />
              </SelectTrigger>
              <SelectContent>
                {perfumes.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isLoadingRecipe && (
            <p className="text-sm text-muted-foreground">Cargando receta activa…</p>
          )}

          {recipeError && !isLoadingRecipe && (
            <p className="text-sm text-destructive">{recipeError}</p>
          )}

          {recipe && !isLoadingRecipe && (
            <>
              <div className="flex flex-col gap-1.5 rounded-md border border-border p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Receta</span>
                  <span className="font-data text-foreground">v{recipe.version}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rendimiento por unidad</span>
                  <span className="font-data text-foreground">{recipe.yieldMl} ml</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Rendimiento total</span>
                  <span className="font-data font-medium text-foreground">
                    {recipe.yieldMl * (Number(quantity) || 0)} ml
                  </span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="quantity">Cantidad a producir</Label>
                <div className="flex gap-2">
                  <Input
                    id="quantity"
                    type="number"
                    min={1}
                    step={1}
                    required
                    value={quantity}
                    onChange={(e) => {
                      setQuantity(e.target.value);
                      setFeasibility(null);
                    }}
                    disabled={isSubmitting}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleCheckFeasibility}
                    disabled={isChecking || isSubmitting}
                  >
                    {isChecking && <Loader2 className="size-3.5 animate-spin" />}
                    Verificar stock
                  </Button>
                </div>

                {feasibility && (
                  <div className="flex flex-col gap-1.5 rounded-md border border-border p-2.5">
                    {feasibility.feasible ? (
                      <span className="flex items-center gap-1.5 text-sm text-success">
                        <CheckCircle2 className="size-4" />
                        Hay stock suficiente
                      </span>
                    ) : (
                      <>
                        <span className="flex items-center gap-1.5 text-sm text-destructive">
                          <XCircle className="size-4" />
                          Faltan insumos
                        </span>
                        {feasibility.shortfalls.map((s) => (
                          <p key={s.supplyId} className="text-xs text-muted-foreground">
                            {s.supplyName}: necesitás {s.required} {s.unit}, hay {s.available} {s.unit}
                          </p>
                        ))}
                      </>
                    )}
                  </div>
                )}
              </div>

              <Separator />

              <div className="flex flex-col gap-2">
                <Label htmlFor="notes">Notas (opcional)</Label>
                <Textarea
                  id="notes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
            </>
          )}

          <DialogFooter className="mt-2">
            <Button type="submit" disabled={!canSubmit}>
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <Factory className="size-4" />
              )}
              {isSubmitting ? "Registrando…" : "Registrar producción"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
