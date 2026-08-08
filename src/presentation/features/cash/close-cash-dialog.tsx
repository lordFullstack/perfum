import { useState, type FormEvent } from "react";
import { Loader2, Lock } from "lucide-react";

import type { CashSession } from "@/domain/entities/cash-session.entity";
import type { CloseCashSessionInput } from "@/domain/repositories/cash.repository";
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
  DialogTrigger,
} from "@/presentation/components/ui/dialog";

interface CloseCashDialogProps {
  session: CashSession;
  runningTotal: number;
  onSubmit: (input: CloseCashSessionInput) => Promise<boolean>;
}

export function CloseCashDialog({ session, runningTotal, onSubmit }: CloseCashDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [closingAmount, setClosingAmount] = useState("");
  const [notes, setNotes] = useState("");

  const projectedDifference = closingAmount === "" ? null : Number(closingAmount) - runningTotal;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit({
      closingAmount: Number(closingAmount) || 0,
      notes: notes.trim() || null,
    });
    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      setClosingAmount("");
      setNotes("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Lock />
          Cerrar caja
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Cerrar caja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Apertura</span>
            <span className="font-data text-foreground">${session.openingAmount.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between rounded-md bg-muted px-3 py-2 text-sm">
            <span className="text-muted-foreground">Esperado (según movimientos)</span>
            <span className="font-data font-medium text-foreground">${runningTotal.toFixed(2)}</span>
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="closingAmount">Monto contado en caja</Label>
            <Input
              id="closingAmount"
              type="number"
              min={0}
              step="any"
              className="font-data"
              required
              value={closingAmount}
              onChange={(e) => setClosingAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {projectedDifference !== null && (
            <p
              className={
                projectedDifference === 0
                  ? "text-sm text-success"
                  : "text-sm text-warning"
              }
            >
              {projectedDifference === 0
                ? "Cuadra exacto."
                : `Diferencia: ${projectedDifference > 0 ? "+" : ""}$${projectedDifference.toFixed(2)}`}
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Label htmlFor="closeNotes">Notas (opcional)</Label>
            <Textarea
              id="closeNotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Cerrando…" : "Cerrar caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
