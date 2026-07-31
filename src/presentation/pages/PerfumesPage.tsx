import { useState } from 'react';
import { Plus, FlaskConical } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { usePerfumes } from '../../application/context/PerfumesContext';
import { usePermissions } from '../../application/context/AuthContext';
import { Perfume } from '../../domain/entities/Perfume';
import { PerfumeFormDialog } from '../components/perfumes/PerfumeFormDialog';

export function PerfumesPage() {
  const { perfumes, loading, error } = usePerfumes();
  const { hasPermission } = usePermissions();
  const navigate = useNavigate();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPerfume, setEditingPerfume] = useState<Perfume | null>(null);

  const canCreate = hasPermission('perfumes.create');
  const canUpdate = hasPermission('perfumes.update');
  const canReadCost = hasPermission('recipes.read_cost');

  const openCreate = () => {
    setEditingPerfume(null);
    setDialogOpen(true);
  };

  const openEdit = (perfume: Perfume) => {
    setEditingPerfume(perfume);
    setDialogOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-medium">Perfumes</h1>
          <p className="text-sm text-muted-foreground">Catálogo de perfumes y sus recetas</p>
        </div>
        {canCreate && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium text-white transition-colors"
            style={{ backgroundColor: 'var(--color-gold)' }}
          >
            <Plus className="h-4 w-4" />
            Nuevo perfume
          </button>
        )}
      </div>

      {error && <p className="text-sm text-destructive bg-destructive/10 rounded-lg px-4 py-2">{error}</p>}

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-muted animate-pulse" />
          ))}
        </div>
      ) : perfumes.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <FlaskConical className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground">Todavía no hay perfumes registrados.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {perfumes.map((perfume) => {
            const margin =
              canReadCost && perfume.recipeCost !== null && perfume.basePrice > 0
                ? ((perfume.basePrice - perfume.recipeCost) / perfume.basePrice) * 100
                : null;

            return (
              <div
                key={perfume.id}
                className="group rounded-xl border border-border bg-card overflow-hidden hover:shadow-lg transition-shadow"
              >
                <div className="h-32 bg-muted flex items-center justify-center overflow-hidden">
                  {perfume.imageUrl ? (
                    <img src={perfume.imageUrl} alt={perfume.name} className="w-full h-full object-cover" />
                  ) : (
                    <FlaskConical className="h-10 w-10 text-muted-foreground" />
                  )}
                </div>

                <div className="p-4 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h3 className="font-display font-medium">{perfume.name}</h3>
                      <p className="text-xs text-muted-foreground font-mono">{perfume.code}</p>
                    </div>
                    <span className="font-mono text-sm font-semibold" style={{ color: 'var(--color-gold)' }}>
                      ${perfume.basePrice.toFixed(2)}
                    </span>
                  </div>

                  {canReadCost && perfume.recipeCost !== null && (
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Costo: ${perfume.recipeCost.toFixed(2)}</span>
                      {margin !== null && (
                        <span className={margin < 20 ? 'text-destructive font-medium' : 'text-green-600'}>
                          {margin.toFixed(0)}% margen
                        </span>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => navigate(`/recetas/${perfume.id}`)}
                      className="flex-1 text-xs font-medium rounded-lg border border-border px-3 py-1.5 hover:bg-muted transition-colors"
                    >
                      {perfume.activeRecipeId ? 'Ver receta' : 'Crear receta'}
                    </button>
                    {canUpdate && (
                      <button
                        onClick={() => openEdit(perfume)}
                        className="text-xs font-medium rounded-lg border border-border px-3 py-1.5 hover:bg-muted transition-colors"
                      >
                        Editar
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <PerfumeFormDialog open={dialogOpen} onClose={() => setDialogOpen(false)} perfume={editingPerfume} />
    </div>
  );
}
