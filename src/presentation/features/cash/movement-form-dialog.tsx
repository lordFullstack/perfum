import { useState, type FormEvent } from "react";
import { ArrowDownCircle, ArrowUpCircle, Loader2 } from "lucide-react";

import type { RegisterCashMovementInput } from "@/domain/repositories/cash.repository";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/presentation/components/ui/select";

interface MovementFormDialogProps {
  onSubmit: (input: RegisterCashMovementInput) => Promise<boolean>;
}

export function MovementFormDialog({ onSubmit }: MovementFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [type, setType] = useState<"manual_income" | "manual_expense">("manual_expense");
  const [amount, setAmount] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit({
      type,
      amount: Number(amount) || 0,
      notes: notes.trim() || null,
    });
    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      setAmount("");
      setNotes("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <ArrowUpCircle className="size-4" />
          <ArrowDownCircle className="-ml-2 size-4" />
          Ajuste manual
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Registrar ajuste de caja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(v) => setType(v as typeof type)} disabled={isSubmitting}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="manual_expense">Retiro / egreso</SelectItem>
                <SelectItem value="manual_income">Depósito / ingreso</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="movementAmount">Monto</Label>
            <Input
              id="movementAmount"
              type="number"
              min={0.01}
              step="any"
              className="font-data"
              required
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="movementNotes">Motivo</Label>
            <Textarea
              id="movementNotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Registrando…" : "Registrar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
