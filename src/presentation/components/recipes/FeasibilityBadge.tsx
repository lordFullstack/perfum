import { CheckCircle2, AlertTriangle } from 'lucide-react';
import { RecipeFeasibility } from '../../../domain/entities/Recipe';

interface FeasibilityBadgeProps {
  feasibility: RecipeFeasibility | null;
  quantity: number;
}

export function FeasibilityBadge({ feasibility, quantity }: FeasibilityBadgeProps) {
  if (!feasibility) return null;

  if (feasibility.feasible) {
    return (
      <div className="flex items-center gap-2 rounded-lg bg-green-500/10 text-green-700 dark:text-green-400 px-3 py-2 text-sm">
        <CheckCircle2 className="h-4 w-4 shrink-0" />
        <span>Stock suficiente para producir {quantity} unidad(es).</span>
      </div>
    );
  }

  return (
    <div className="rounded-lg bg-destructive/10 text-destructive px-3 py-2 text-sm space-y-1">
      <div className="flex items-center gap-2 font-medium">
        <AlertTriangle className="h-4 w-4 shrink-0" />
        <span>Insumos insuficientes para {quantity} unidad(es):</span>
      </div>
      <ul className="pl-6 list-disc space-y-0.5">
        {feasibility.shortfalls.map((s) => (
          <li key={s.supplyId}>
            {s.supplyName}: faltan {(s.required - s.available).toFixed(2)} {s.unit}
          </li>
        ))}
      </ul>
    </div>
  );
}
