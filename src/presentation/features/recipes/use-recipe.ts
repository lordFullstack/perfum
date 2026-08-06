import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { Recipe, RecipeCost, RecipeFeasibility } from "@/domain/entities/recipe.entity";
import type { CreateRecipeInput } from "@/domain/repositories/recipe.repository";
import { createRecipeUseCase } from "@/domain/use-cases/create-recipe.use-case";
import { useRecipeRepository } from "@/presentation/hooks/use-recipe-management";
import { usePermission } from "@/presentation/hooks/use-permission";

export function useRecipe(perfumeId: string) {
  const repository = useRecipeRepository();
  const canReadCost = usePermission("recipes.read_cost");

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [cost, setCost] = useState<RecipeCost | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const active = await repository.getActiveRecipe(perfumeId);
      setRecipe(active);
      if (active && canReadCost) {
        setCost(await repository.calculateCost(active.id));
      } else {
        setCost(null);
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la receta.");
    } finally {
      setIsLoading(false);
    }
  }, [repository, perfumeId, canReadCost]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function createNewVersion(input: CreateRecipeInput): Promise<boolean> {
    try {
      const created = await createRecipeUseCase(repository, input);
      setRecipe(created);
      if (canReadCost) setCost(await repository.calculateCost(created.id));
      toast.success(`Receta versión ${created.version} creada.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear la receta.");
      return false;
    }
  }

  async function checkFeasibility(quantityToProduce: number): Promise<RecipeFeasibility | null> {
    if (!recipe) return null;
    try {
      return await repository.checkFeasibility(recipe.id, quantityToProduce);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo verificar la factibilidad.");
      return null;
    }
  }

  return { recipe, cost, isLoading, createNewVersion, checkFeasibility };
}
