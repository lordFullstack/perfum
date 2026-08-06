import { cn } from "@/shared/utils/cn";

/**
 * Firma visual del sistema de diseño: en vez de una barra de progreso
 * genérica, el nivel de stock se muestra como una probeta graduada.
 * El relleno usa el color de acento (ámbar) salvo cuando el nivel
 * está en o por debajo del mínimo, donde pasa a warning.
 */
export function StockLevelGauge({
  stock,
  minStock,
  className,
}: {
  stock: number;
  minStock: number;
  className?: string;
}) {
  // Referencia visual: el "lleno" de la probeta es 2x el mínimo
  // (o el propio stock si no hay mínimo definido), así el usuario
  // ve de un vistazo qué tan lejos está del umbral.
  const reference = Math.max(minStock * 2, stock, 1);
  const fillPercent = Math.min(100, Math.round((stock / reference) * 100));
  const isLow = stock <= minStock;

  return (
    <div className={cn("flex h-8 w-14 items-end gap-[3px]", className)} aria-hidden>
      {Array.from({ length: 8 }).map((_, i) => {
        const tickThreshold = ((8 - i) / 8) * 100;
        const filled = fillPercent >= tickThreshold;
        return (
          <span
            key={i}
            className={cn(
              "block w-full rounded-[1px] transition-elegant",
              filled ? (isLow ? "bg-warning" : "bg-primary") : "bg-muted",
            )}
            style={{ height: `${((i + 1) / 8) * 100}%` }}
          />
        );
      })}
    </div>
  );
}
