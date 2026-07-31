import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Save, History, Beaker } from 'lucide-react';
import { usePerfumes } from '../../application/context/PerfumesContext';
import { useRecipes } from '../../application/context/RecipesContext';
import { usePermissions } from '../../application/context/AuthContext';
import { Supply } from '../../domain/entities/Supply';
import { RecipeCost, RecipeFeasibility } from '../../domain/entities/Recipe';
import { IngredientSelector } from '../components/recipes/IngredientSelector';
import { RecipeItemsTable, RecipeItemRow } from '../components/recipes/RecipeItemsTable';
import { RecipeCostPanel } from '../components/recipes/RecipeCostPanel';
import { FeasibilityBadge } from '../components/recipes/FeasibilityBadge';

export function RecipeBuilderPage() {
  const { perfumeId } = useParams<{ perfumeId: string }>();
  const navigate = useNavigate();
  const { perfumes } = usePerfumes();
  const { hasPermission } = usePermissions();
  const { getActiveRecipe, createRecipe, getRecipeCost, checkFeasibility, loading, error } = useRecipes();

  const perfume = perfumes.find((p) => p.id === perfumeId);
  const [yieldMl, setYieldMl] = useState(100);
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<RecipeItemRow[]>([]);
  const [activeRecipeId, setActiveRecipeId] = useState<string | null>(null);
  const [cost, setCost] = useState<RecipeCost | null>(null);
  const [feasibility, setFeasibility] = useState<RecipeFeasibility | null>(null);
  const [testQuantity, setTestQuantity] = useState(1);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // La receta puede tener versión 1 (recipes.create) o versiones posteriores (recipes.update);
  // se habilita edición si el usuario tiene cualquiera de los dos permisos.
  const canWrite = hasPermission('recipes.create') || hasPermission('recipes.update');
  const canReadCost = hasPermission('recipes.read_cost');

  useEffect(() => {
    if (!perfumeId) return;
    (async () => {
      const recipe = await getActiveRecipe(perfumeId);
      if (recipe) {
        setActiveRecipeId(recipe.id);
        setYieldMl(recipe.yieldMl);
        setNotes(recipe.notes ?? '');
        setItems(
          recipe.items.map((item) => ({
            supplyId: item.supplyId,
            supplyName: item.supplyName ?? '',
            quantity: item.quantity,
            unitId: item.unitId,
            unitAbbreviation: item.unitAbbreviation ?? '',
            notes: item.notes,
            sortOrder: item.sortOrder,
          }))
        );
        if (canReadCost) {
          const c = await getRecipeCost(recipe.id);
          setCost(c);
        }
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [perfumeId]);

  const refreshFeasibility = useCallback(async () => {
    if (!activeRecipeId) return;
    const f = await checkFeasibility(activeRecipeId, testQuantity);
    setFeasibility(f);
  }, [activeRecipeId, testQuantity, checkFeasibility]);

  useEffect(() => {
    if (activeRecipeId) refreshFeasibility();
  }, [activeRecipeId, testQuantity, refreshFeasibility]);

  const handleAddSupply = (supply: Supply) => {
    setItems((prev) => [
      ...prev,
      {
        supplyId: supply.id,
        supplyName: supply.name,
        quantity: 1,
        unitId: supply.unitId,
        unitAbbreviation: supply.unitAbbreviation,
        sortOrder: prev.length,
        unitCost: supply.averageCost,
      },
    ]);
  };

  const handleQuantityChange = (index: number, quantity: number) => {
    setItems((prev) => prev.map((it, i) => (i === index ? { ...it, quantity } : it)));
  };

  const handleRemove = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!perfumeId) return;
    setSaving(true);
    setSaveError(null);
    try {
      const newRecipeId = await createRecipe({
        perfumeId,
        yieldMl,
        notes,
        items: items.map(({ supplyId, quantity, unitId, notes: n, sortOrder }) => ({
          supplyId,
          quantity,
          unitId,
          notes: n,
          sortOrder,
        })),
      });
      setActiveRecipeId(newRecipeId);
      if (canReadCost) {
        const c = await getRecipeCost(newRecipeId);
        setCost(c);
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Error al guardar la receta');
    } finally {
      setSaving(false);
    }
  };

  if (!perfume) {
    return (
      <div className="p-6">
        <p className="text-muted-foreground">Perfume no encontrado.</p>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => navigate('/perfumes')} className="text-sm text-muted-foreground hover:underline mb-1">
            ← Volver a perfumes
          </button>
          <h1 className="font-display text-2xl font-medium flex items-center gap-2">
            <Beaker className="h-6 w-6" style={{ color: 'var(--color-gold)' }} />
            Receta — {perfume.name}
          </h1>
        </div>
        {canWrite && (
          <button
            onClick={handleSave}
            disabled={saving || items.length === 0}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white disabled:opacity-50 transition-colors"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <Save className="h-4 w-4" />
            {saving ? 'Guardando...' : 'Guardar nueva versión'}
          </button>
        )}
      </div>

      {(error || saveError) && (
        <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{error || saveError}</p>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="rounded-xl border border-border bg-card p-4 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium block mb-1">Rendimiento (ml)</label>
                <input
                  type="number"
                  min={1}
                  value={yieldMl}
                  disabled={!canWrite}
                  onChange={(e) => setYieldMl(parseFloat(e.target.value) || 0)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-mono"
                />
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Notas</label>
                <input
                  value={notes}
                  disabled={!canWrite}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm"
                />
              </div>
            </div>

            {canWrite && (
              <IngredientSelector onSelect={handleAddSupply} excludeIds={items.map((i) => i.supplyId)} />
            )}

            <RecipeItemsTable items={items} onQuantityChange={handleQuantityChange} onRemove={handleRemove} />
          </div>

          {activeRecipeId && (
            <div className="rounded-xl border border-border bg-card p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-medium">Verificar disponibilidad</h3>
                <History className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="flex items-center gap-3">
                <label className="text-sm text-muted-foreground">Unidades a producir:</label>
                <input
                  type="number"
                  min={1}
                  value={testQuantity}
                  onChange={(e) => setTestQuantity(parseInt(e.target.value) || 1)}
                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-sm font-mono"
                />
              </div>
              <FeasibilityBadge feasibility={feasibility} quantity={testQuantity} />
            </div>
          )}
        </div>

        <div>
          {cost && (
            <RecipeCostPanel totalCost={cost.totalCost} breakdown={cost.breakdown} yieldMl={yieldMl} basePrice={perfume.basePrice} />
          )}
        </div>
      </div>
    </div>
  );
}
