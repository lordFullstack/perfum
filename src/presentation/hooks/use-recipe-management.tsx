import { createContext, useContext, useMemo, type ReactNode } from "react";

import { SupabaseRecipeRepository } from "@/infrastructure/supabase/repositories/supabase-recipe.repository";
import type { RecipeRepository } from "@/domain/repositories/recipe.repository";

const RecipeContext = createContext<RecipeRepository | undefined>(undefined);

const repository = new SupabaseRecipeRepository();

export function RecipeProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => repository, []);
  return <RecipeContext.Provider value={value}>{children}</RecipeContext.Provider>;
}

export function useRecipeRepository(): RecipeRepository {
  const ctx = useContext(RecipeContext);
  if (!ctx) throw new Error("useRecipeRepository debe usarse dentro de <RecipeProvider>.");
  return ctx;
}
