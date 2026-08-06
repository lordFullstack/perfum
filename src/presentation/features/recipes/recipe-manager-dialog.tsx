import { useState } from "react";
import { CheckCircle2, FlaskConical, Loader2, XCircle } from "lucide-react";

import type { Perfume } from "@/domain/entities/perfume.entity";
import type { Supply } from "@/domain/entities/supply.entity";
import type { RecipeFeasibility } from "@/domain/entities/recipe.entity";
import { usePermission } from "@/presentation/hooks/use-permission";
import { useRecipe } from "@/presentation/features/recipes/use-recipe";
import { RecipeItemsForm } from "@/presentation/features/recipes/recipe-items-form";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Badge } from "@/presentation/components/ui/badge";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import { Separator } from "@/presentation/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/presentation/components/ui/dialog";

interface RecipeManagerDialogProps {
  perfume: Perfume;
  supplies: Supply[];
}

export function RecipeManagerDialog({ perfume, supplies }: RecipeManagerDialogProps) {
  const canUpdateRecipe = usePermission("recipes.update");
  const canCreateRecipe = usePermission("recipes.create");
  const canUpdate = canUpdateRecipe || canCreateRecipe;
  const canReadCost = usePermission("recipes.read_cost");

  const [open, setOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [feasibilityQty, setFeasibilityQty] = useState("1");
  const [feasibility, setFeasibility] = useState<RecipeFeasibility | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const { recipe, cost, isLoading, createNewVersion, checkFeasibility } = useRecipe(perfume.id);

  async function handleCheckFeasibility() {
    setIsChecking(true);
    setFeasibility(await checkFeasibility(Number(feasibilityQty) || 1));
    setIsChecking(false);
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setShowForm(false);
          setFeasibility(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <FlaskConical className="size-4" />
          {recipe ? "Ver receta" : "Crear receta"}
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Receta — {perfume.name}</DialogTitle>
          <DialogDescription>
            {recipe
              ? `Versión ${recipe.version} · rinde ${recipe.yieldMl} ml`
              : "Este perfume todavía no tiene una receta activa."}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex flex-col gap-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : showForm || !recipe ? (
          <RecipeItemsForm
            supplies={supplies}
            perfumeId={perfume.id}
            initialYieldMl={recipe?.yieldMl}
            initialNotes={recipe?.notes}
            onSubmit={createNewVersion}
            onCancel={() => setShowForm(false)}
          />
        ) : (
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-1.5">
              {recipe.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <span className="text-foreground">{item.supplyName}</span>
                  <span className="font-data text-muted-foreground">
                    {item.quantity} {item.unitAbbreviation}
                  </span>
                </div>
              ))}
            </div>

            {canReadCost && cost && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Costo total de la receta</span>
                  <span className="font-data text-sm font-medium text-foreground">
                    ${cost.totalCost.toFixed(2)}
                  </span>
                </div>
              </>
            )}

            <Separator />

            <div className="flex flex-col gap-2">
              <p className="text-sm font-medium text-foreground">Verificar factibilidad de producción</p>
              <div className="flex gap-2">
                <Input
                  type="number"
                  min={1}
                  step={1}
                  className="w-24"
                  value={feasibilityQty}
                  onChange={(e) => setFeasibilityQty(e.target.value)}
                />
                <Button type="button" variant="outline" size="sm" onClick={handleCheckFeasibility} disabled={isChecking}>
                  {isChecking && <Loader2 className="size-3.5 animate-spin" />}
                  Verificar
                </Button>
              </div>

              {feasibility && (
                <div className="mt-1 flex flex-col gap-1.5 rounded-md border border-border p-2.5">
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

            {canUpdate && (
              <>
                <Separator />
                <div className="flex items-center justify-between">
                  <Badge variant="outline">Crear nueva versión reemplaza la actual</Badge>
                  <Button type="button" size="sm" onClick={() => setShowForm(true)}>
                    Nueva versión
                  </Button>
                </div>
              </>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
