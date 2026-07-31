import { Trash2, GripVertical } from 'lucide-react';
import { RecipeItemInput } from '../../../domain/entities/Recipe';

export interface RecipeItemRow extends RecipeItemInput {
  supplyName: string;
  unitAbbreviation: string; // solo display, no se persiste (se persiste unitId)
  unitCost?: number;
}

interface RecipeItemsTableProps {
  items: RecipeItemRow[];
  onQuantityChange: (index: number, quantity: number) => void;
  onRemove: (index: number) => void;
}

export function RecipeItemsTable({ items, onQuantityChange, onRemove }: RecipeItemsTableProps) {
  if (items.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
        Agregá insumos a la receta desde el buscador de arriba.
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border overflow-hidden">
      <table className="w-full text-sm">
        <thead className="bg-muted/50">
          <tr>
            <th className="w-8" />
            <th className="text-left font-medium px-3 py-2">Insumo</th>
            <th className="text-right font-medium px-3 py-2">Cantidad</th>
            <th className="text-left font-medium px-3 py-2">Unidad</th>
            <th className="text-right font-medium px-3 py-2">Subtotal</th>
            <th className="w-10" />
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {items.map((item, index) => (
            <tr key={`${item.supplyId}-${index}`} className="hover:bg-muted/30">
              <td className="px-2 text-muted-foreground">
                <GripVertical className="h-4 w-4" />
              </td>
              <td className="px-3 py-2 font-medium">{item.supplyName}</td>
              <td className="px-3 py-2 text-right">
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={item.quantity}
                  onChange={(e) => onQuantityChange(index, parseFloat(e.target.value) || 0)}
                  className="w-24 text-right rounded border border-border bg-background px-2 py-1 font-mono text-sm"
                />
              </td>
              <td className="px-3 py-2 text-muted-foreground">{item.unitAbbreviation}</td>
              <td className="px-3 py-2 text-right font-mono">
                {item.unitCost !== undefined ? `$${(item.unitCost * item.quantity).toFixed(2)}` : '—'}
              </td>
              <td className="px-2 text-right">
                <button
                  type="button"
                  onClick={() => onRemove(index)}
                  className="p-1.5 rounded hover:bg-destructive/10 text-destructive transition-colors"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
