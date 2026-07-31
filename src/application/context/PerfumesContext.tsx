import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { PerfumeWithRecipe, CreatePerfumeInput, UpdatePerfumeInput, Perfume } from '../../domain/entities/Perfume';
import { CreatePerfume } from '../../domain/usecases/perfumes/CreatePerfume';
import { UpdatePerfume } from '../../domain/usecases/perfumes/UpdatePerfume';
import { ListPerfumesWithRecipes } from '../../domain/usecases/perfumes/ListPerfumesWithRecipes';
import { SupabasePerfumeRepository } from '../../infrastructure/supabase/SupabasePerfumeRepository';
import { supabase } from '../../infrastructure/supabase/client';
import { useAuth } from './AuthContext';

interface PerfumesContextValue {
  perfumes: PerfumeWithRecipe[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createPerfume: (input: CreatePerfumeInput) => Promise<Perfume>;
  updatePerfume: (id: string, input: UpdatePerfumeInput) => Promise<Perfume>;
  uploadPerfumeImage: (perfumeId: string, file: File) => Promise<string>;
}

const PerfumesContext = createContext<PerfumesContextValue | undefined>(undefined);

const repo = new SupabasePerfumeRepository(supabase);
const createPerfumeUseCase = new CreatePerfume(repo);
const updatePerfumeUseCase = new UpdatePerfume(repo);
const listPerfumesUseCase = new ListPerfumesWithRecipes(repo);

export function PerfumesProvider({ children }: { children: ReactNode }) {
  const { branchId } = useAuth();
  const [perfumes, setPerfumes] = useState<PerfumeWithRecipe[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!branchId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await listPerfumesUseCase.execute(branchId);
      setPerfumes(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Error al cargar perfumes');
    } finally {
      setLoading(false);
    }
  }, [branchId]);

  const createPerfume = useCallback(
    async (input: CreatePerfumeInput) => {
      const perfume = await createPerfumeUseCase.execute(input);
      await refresh();
      return perfume;
    },
    [refresh]
  );

  const updatePerfume = useCallback(
    async (id: string, input: UpdatePerfumeInput) => {
      const perfume = await updatePerfumeUseCase.execute(id, input);
      await refresh();
      return perfume;
    },
    [refresh]
  );

  const uploadPerfumeImage = useCallback(async (perfumeId: string, file: File) => {
    return repo.uploadImage(perfumeId, file);
  }, []);

  return (
    <PerfumesContext.Provider
      value={{ perfumes, loading, error, refresh, createPerfume, updatePerfume, uploadPerfumeImage }}
    >
      {children}
    </PerfumesContext.Provider>
  );
}

export function usePerfumes() {
  const ctx = useContext(PerfumesContext);
  if (!ctx) throw new Error('usePerfumes debe usarse dentro de PerfumesProvider');
  return ctx;
}
