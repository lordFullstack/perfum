import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Recipe, RecipeCost, RecipeFeasibility, RecipeItemDraft } from "@/domain/entities/recipe.entity";
import { createRecipeUseCase } from "@/domain/use-cases/create-recipe.use-case";
import { useRecipeRepository } from "@/presentation/hooks/use-recipe-management";
import { usePermission } from "@/presentation/hooks/use-permission";

export function useRecipe(perfumeId: string | null) {
  const repository = useRecipeRepository();
  const canReadCost = usePermission("recipes.read_cost");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [cost, setCost] = useState<RecipeCost | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const reload = useCallback(async () => {
    if (!perfumeId) {
      setRecipe(null);
      setCost(null);
      return;
    }
    setIsLoading(true);
    try {
      const active = await repository.getActiveRecipe(perfumeId);
      setRecipe(active);
      if (active && canReadCost) {
        setCost(await repository.getRecipeCost(active.id));
      } else {
        setCost(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la receta.");
    } finally {
      setIsLoading(false);
    }
  }, [perfumeId, repository, canReadCost]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function saveNewVersion(yieldMl: number, notes: string | null, items: RecipeItemDraft[]): Promise<boolean> {
    if (!perfumeId) return false;
    setIsSaving(true);
    try {
      const created = await createRecipeUseCase(repository, { perfumeId, yieldMl, notes, items });
      setRecipe(created);
      if (canReadCost) {
        setCost(await repository.getRecipeCost(created.id));
      }
      toast.success(`Receta guardada (versión ${created.version}).`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo guardar la receta.");
      return false;
    } finally {
      setIsSaving(false);
    }
  }

  async function checkFeasibility(quantity: number): Promise<RecipeFeasibility | null> {
    if (!recipe) return null;
    try {
      return await repository.checkFeasibility(recipe.id, quantity);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo verificar disponibilidad.");
      return null;
    }
  }

  return { recipe, cost, isLoading, isSaving, saveNewVersion, checkFeasibility, reload };
}
