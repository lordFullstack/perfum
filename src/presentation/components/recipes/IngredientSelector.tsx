import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { useSupplies } from '../../../application/context/SuppliesContext';
import { Supply } from '../../../domain/entities/Supply';

interface IngredientSelectorProps {
  onSelect: (supply: Supply) => void;
  excludeIds?: string[];
}

export function IngredientSelector({ onSelect, excludeIds = [] }: IngredientSelectorProps) {
  const { supplies } = useSupplies();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState<string>('all');

  const categories = useMemo(() => Array.from(new Set(supplies.map((s) => s.category))).sort(), [supplies]);

  const filtered = useMemo(() => {
    return supplies
      .filter((s) => !excludeIds.includes(s.id))
      .filter((s) => category === 'all' || s.category === category)
      .filter(
        (s) =>
          s.name.toLowerCase().includes(query.toLowerCase()) ||
          s.code.toLowerCase().includes(query.toLowerCase())
      );
  }, [supplies, excludeIds, category, query]);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar insumo por nombre o código..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
          />
        </div>
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-lg border border-border bg-background px-3 py-2 text-sm"
        >
          <option value="all">Todas las categorías</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
      </div>

      <div className="max-h-64 overflow-y-auto rounded-lg border border-border divide-y divide-border">
        {filtered.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground text-center">No se encontraron insumos.</p>
        )}
        {filtered.map((supply) => (
          <button
            key={supply.id}
            type="button"
            onClick={() => onSelect(supply)}
            className="w-full flex items-center justify-between px-4 py-2.5 text-left hover:bg-muted/60 transition-colors"
          >
            <div>
              <p className="text-sm font-medium">{supply.name}</p>
              <p className="text-xs text-muted-foreground font-mono">
                {supply.code} · {supply.category}
              </p>
            </div>
            <span className="text-xs font-mono text-muted-foreground">
              Stock: {supply.stock} {supply.unitAbbreviation}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
