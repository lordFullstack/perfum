import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import {
  Recipe,
  CreateRecipeInput,
  RecipeCost,
  RecipeFeasibility,
  RecipeDraft,
} from '../../domain/entities/Recipe';
import { CreateRecipe } from '../../domain/usecases/recipes/CreateRecipe';
import { DuplicateRecipe } from '../../domain/usecases/recipes/DuplicateRecipe';
import { GetRecipeCost } from '../../domain/usecases/recipes/GetRecipeCost';
import { CheckRecipeFeasibility } from '../../domain/usecases/recipes/CheckRecipeFeasibility';
import { SupabaseRecipeRepository } from '../../infrastructure/supabase/SupabaseRecipeRepository';
import { supabase } from '../../infrastructure/supabase/client';

interface RecipesContextValue {
  loading: boolean;
  error: string | null;
  getActiveRecipe: (perfumeId: string) => Promise<Recipe | null>;
  listVersions: (perfumeId: string) => Promise<Recipe[]>;
  createRecipe: (input: CreateRecipeInput) => Promise<string>;
  duplicateRecipe: (recipeId: string) => Promise<RecipeDraft>;
  getRecipeCost: (recipeId: string) => Promise<RecipeCost>;
  checkFeasibility: (recipeId: string, quantity: number) => Promise<RecipeFeasibility>;
}

const RecipesContext = createContext<RecipesContextValue | undefined>(undefined);

const repo = new SupabaseRecipeRepository(supabase);
const createRecipeUseCase = new CreateRecipe(repo);
const duplicateRecipeUseCase = new DuplicateRecipe(repo);
const getRecipeCostUseCase = new GetRecipeCost(repo);
const checkFeasibilityUseCase = new CheckRecipeFeasibility(repo);

export function RecipesProvider({ children }: { children: ReactNode }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const wrap = useCallback(async <T,>(fn: () => Promise<T>): Promise<T> => {
    setLoading(true);
    setError(null);
    try {
      return await fn();
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Error inesperado';
      setError(msg);
      throw e;
    } finally {
      setLoading(false);
    }
  }, []);

  const getActiveRecipe = useCallback((perfumeId: string) => wrap(() => repo.getActiveByPerfumeId(perfumeId)), [wrap]);
  const listVersions = useCallback((perfumeId: string) => wrap(() => repo.listVersionsByPerfumeId(perfumeId)), [wrap]);
  const createRecipe = useCallback((input: CreateRecipeInput) => wrap(() => createRecipeUseCase.execute(input)), [wrap]);
  const duplicateRecipe = useCallback((recipeId: string) => wrap(() => duplicateRecipeUseCase.execute(recipeId)), [wrap]);
  const getRecipeCost = useCallback((recipeId: string) => wrap(() => getRecipeCostUseCase.execute(recipeId)), [wrap]);
  const checkFeasibility = useCallback(
    (recipeId: string, quantity: number) => wrap(() => checkFeasibilityUseCase.execute(recipeId, quantity)),
    [wrap]
  );

  return (
    <RecipesContext.Provider
      value={{ loading, error, getActiveRecipe, listVersions, createRecipe, duplicateRecipe, getRecipeCost, checkFeasibility }}
    >
      {children}
    </RecipesContext.Provider>
  );
}

export function useRecipes() {
  const ctx = useContext(RecipesContext);
  if (!ctx) throw new Error('useRecipes debe usarse dentro de RecipesProvider');
  return ctx;
}
