import { RecipeCostBreakdownItem } from '../../../domain/entities/Recipe';
import { usePermissions } from '../../../application/context/AuthContext';

interface RecipeCostPanelProps {
  totalCost: number;
  breakdown: RecipeCostBreakdownItem[];
  yieldMl: number;
  basePrice: number;
}

export function RecipeCostPanel({ totalCost, breakdown, yieldMl, basePrice }: RecipeCostPanelProps) {
  const { hasPermission } = usePermissions();

  if (!hasPermission('recipes.read_cost')) {
    return null;
  }

  const costPerMl = yieldMl > 0 ? totalCost / yieldMl : 0;
  const margin = basePrice > 0 ? ((basePrice - totalCost) / basePrice) * 100 : 0;

  return (
    <div className="rounded-xl border border-border bg-card p-4 space-y-4">
      <h3 className="font-display text-lg font-medium">Costo de receta</h3>

      <div className="grid grid-cols-2 gap-3">
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Costo total</p>
          <p className="font-mono text-lg font-semibold" style={{ color: 'var(--color-gold)' }}>
            ${totalCost.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Costo por ml</p>
          <p className="font-mono text-lg font-semibold">${costPerMl.toFixed(3)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Precio de venta</p>
          <p className="font-mono text-lg font-semibold">${basePrice.toFixed(2)}</p>
        </div>
        <div className="rounded-lg bg-muted/50 p-3">
          <p className="text-xs text-muted-foreground">Margen</p>
          <p className={`font-mono text-lg font-semibold ${margin < 20 ? 'text-destructive' : ''}`}>
            {margin.toFixed(1)}%
          </p>
        </div>
      </div>

      <div>
        <p className="text-xs text-muted-foreground mb-2">Desglose por insumo</p>
        <div className="space-y-1.5">
          {breakdown.map((item) => {
            const pct = totalCost > 0 ? (item.subtotal / totalCost) * 100 : 0;
            return (
              <div key={item.supplyId} className="flex items-center gap-2 text-xs">
                <span className="w-28 truncate">{item.supplyName}</span>
                <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{ width: `${pct}%`, backgroundColor: 'var(--color-gold)' }}
                  />
                </div>
                <span className="font-mono w-14 text-right">${item.subtotal.toFixed(2)}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
