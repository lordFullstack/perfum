import { useState, type FormEvent } from "react";
import { CheckCircle2, Loader2, Send } from "lucide-react";

import type { SubmitOnlineOrderInput } from "@/domain/repositories/catalog.repository";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Textarea } from "@/presentation/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/presentation/components/ui/dialog";

interface CartLine {
  perfumeId: string;
  name: string;
  quantity: number;
  unitPrice: number;
}

interface CheckoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cart: CartLine[];
  total: number;
  onSubmit: (input: SubmitOnlineOrderInput) => Promise<boolean>;
}

export function CheckoutDialog({ open, onOpenChange, cart, total, onSubmit }: CheckoutDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);

    const success = await onSubmit({
      customerName,
      customerPhone,
      customerEmail: customerEmail.trim() || null,
      notes: notes.trim() || null,
      items: cart.map((line) => ({ perfumeId: line.perfumeId, quantity: line.quantity })),
    });

    setIsSubmitting(false);
    if (success) setSubmitted(true);
  }

  function handleClose(next: boolean) {
    onOpenChange(next);
    if (!next) {
      setSubmitted(false);
      setCustomerName("");
      setCustomerPhone("");
      setCustomerEmail("");
      setNotes("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-sm">
        {submitted ? (
          <div className="flex flex-col items-center gap-3 py-4 text-center">
            <CheckCircle2 className="size-10 text-success" />
            <div>
              <p className="font-display text-lg text-foreground">¡Pedido enviado!</p>
              <p className="mt-1 text-sm text-muted-foreground">
                Nos vamos a comunicar con vos al teléfono que dejaste para coordinar el pago y la
                entrega.
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="mt-2">
              Listo
            </Button>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Confirmar pedido</DialogTitle>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1 rounded-md bg-muted px-3 py-2">
                {cart.map((line) => (
                  <div key={line.perfumeId} className="flex justify-between text-sm">
                    <span className="text-foreground">
                      {line.quantity} × {line.name}
                    </span>
                    <span className="font-data text-muted-foreground">
                      ${(line.quantity * line.unitPrice).toFixed(2)}
                    </span>
                  </div>
                ))}
                <div className="mt-1 flex justify-between border-t border-border pt-1 text-sm font-medium">
                  <span className="text-foreground">Total</span>
                  <span className="font-data text-foreground">${total.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <Label htmlFor="customerName">Nombre completo</Label>
                <Input
                  id="customerName"
                  required
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="customerPhone">Teléfono de contacto</Label>
                <Input
                  id="customerPhone"
                  type="tel"
                  required
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="customerEmail">Correo (opcional)</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="orderNotes">Notas para la entrega (opcional)</Label>
                <Textarea
                  id="orderNotes"
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  disabled={isSubmitting}
                />
              </div>

              <p className="text-xs text-muted-foreground">
                Este pedido no incluye pago online — te contactamos para coordinar cómo pagar y
                recibirlo.
              </p>

              <DialogFooter className="mt-1">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Send className="size-4" />
                  )}
                  {isSubmitting ? "Enviando…" : "Enviar pedido"}
                </Button>
              </DialogFooter>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
