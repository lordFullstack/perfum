import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Minus, Plus, ShoppingBag } from "lucide-react";

import type { SubmitOnlineOrderInput } from "@/domain/repositories/catalog.repository";
import { submitOnlineOrderUseCase } from "@/domain/use-cases/submit-online-order.use-case";
import { useCatalogRepository } from "@/presentation/hooks/use-catalog-management";
import { useCatalog } from "@/presentation/features/catalog/use-catalog";
import { CheckoutDialog } from "@/presentation/features/catalog/checkout-dialog";
import { BrandMark } from "@/presentation/components/shared/brand-mark";
import { ThemeToggle } from "@/presentation/components/shared/theme-toggle";
import { Button } from "@/presentation/components/ui/button";
import { Skeleton } from "@/presentation/components/ui/skeleton";

interface CartLines {
  [perfumeId: string]: number;
}

export function CatalogPage() {
  const repository = useCatalogRepository();
  const { perfumes, isLoading } = useCatalog();
  const [cart, setCart] = useState<CartLines>({});
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  function addToCart(perfumeId: string) {
    setCart((prev) => ({ ...prev, [perfumeId]: (prev[perfumeId] ?? 0) + 1 }));
  }

  function removeFromCart(perfumeId: string) {
    setCart((prev) => {
      const next = { ...prev };
      const current = (next[perfumeId] ?? 0) - 1;
      if (current <= 0) delete next[perfumeId];
      else next[perfumeId] = current;
      return next;
    });
  }

  const cartLines = useMemo(
    () =>
      Object.entries(cart)
        .map(([perfumeId, quantity]) => {
          const perfume = perfumes.find((p) => p.id === perfumeId);
          if (!perfume) return null;
          return { perfumeId, name: perfume.name, quantity, unitPrice: perfume.basePrice };
        })
        .filter((line): line is NonNullable<typeof line> => line !== null),
    [cart, perfumes],
  );

  const cartCount = cartLines.reduce((sum, l) => sum + l.quantity, 0);
  const cartTotal = cartLines.reduce((sum, l) => sum + l.quantity * l.unitPrice, 0);

  async function handleSubmitOrder(input: SubmitOnlineOrderInput): Promise<boolean> {
    try {
      await submitOnlineOrderUseCase(repository, input);
      setCart({});
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo enviar el pedido.");
      return false;
    }
  }

  return (
    <div className="min-h-dvh bg-background pb-28">
      <header className="sticky top-0 z-10 border-b border-border bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-3">
            <BrandMark className="size-9" />
            <div>
              <h1 className="font-display text-lg leading-tight text-foreground">LA PERFUMERÍA</h1>
              <p className="text-xs text-muted-foreground">Catálogo online</p>
            </div>
          </div>
          <ThemeToggle />
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-4 py-6">
        {isLoading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[3/4] w-full" />
            ))}
          </div>
        ) : perfumes.length === 0 ? (
          <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
            <p className="font-display text-lg text-foreground">Todavía no hay perfumes publicados</p>
            <p className="max-w-sm text-sm text-muted-foreground">Volvé a visitarnos pronto.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
            {perfumes.map((perfume) => {
              const quantityInCart = cart[perfume.id] ?? 0;
              return (
                <div
                  key={perfume.id}
                  className="flex flex-col overflow-hidden rounded-lg border border-border bg-card"
                >
                  <div className="aspect-square w-full bg-muted">
                    {perfume.imageUrl && (
                      <img
                        src={perfume.imageUrl}
                        alt={perfume.name}
                        className="size-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col gap-1 p-3">
                    <p className="text-sm font-medium leading-tight text-foreground">
                      {perfume.name}
                    </p>
                    {perfume.category && (
                      <p className="text-xs text-muted-foreground">{perfume.category}</p>
                    )}
                    <p className="font-data mt-1 text-sm font-medium text-foreground">
                      ${perfume.basePrice.toFixed(2)}
                    </p>

                    <div className="mt-auto pt-2">
                      {quantityInCart === 0 ? (
                        <Button size="sm" className="w-full" onClick={() => addToCart(perfume.id)}>
                          Agregar
                        </Button>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => removeFromCart(perfume.id)}
                            aria-label="Quitar uno"
                          >
                            <Minus className="size-3.5" />
                          </Button>
                          <span className="font-data text-sm font-medium text-foreground">
                            {quantityInCart}
                          </span>
                          <Button
                            variant="outline"
                            size="icon"
                            className="size-8"
                            onClick={() => addToCart(perfume.id)}
                            aria-label="Agregar uno"
                          >
                            <Plus className="size-3.5" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {cartCount > 0 && (
        <div className="fixed inset-x-0 bottom-0 z-10 border-t border-border bg-background/95 p-4 backdrop-blur">
          <div className="mx-auto flex max-w-3xl items-center justify-between gap-4">
            <div>
              <p className="text-sm text-muted-foreground">
                {cartCount} ítem{cartCount !== 1 && "s"}
              </p>
              <p className="font-data text-lg font-medium text-foreground">${cartTotal.toFixed(2)}</p>
            </div>
            <Button size="lg" onClick={() => setCheckoutOpen(true)}>
              <ShoppingBag className="size-4" />
              Continuar pedido
            </Button>
          </div>
        </div>
      )}

      <CheckoutDialog
        open={checkoutOpen}
        onOpenChange={setCheckoutOpen}
        cart={cartLines}
        total={cartTotal}
        onSubmit={handleSubmitOrder}
      />
    </div>
  );
}
