import { useState, type FormEvent } from "react";
import { Loader2, Wallet } from "lucide-react";

import type { OpenCashSessionInput } from "@/domain/repositories/cash.repository";
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

interface OpenCashDialogProps {
  onSubmit: (input: OpenCashSessionInput) => Promise<boolean>;
}

export function OpenCashDialog({ onSubmit }: OpenCashDialogProps) {
  const [open, setOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openingAmount, setOpeningAmount] = useState("");
  const [notes, setNotes] = useState("");

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    const success = await onSubmit({
      openingAmount: Number(openingAmount) || 0,
      notes: notes.trim() || null,
    });
    setIsSubmitting(false);
    if (success) {
      setOpen(false);
      setOpeningAmount("");
      setNotes("");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Wallet />
          Abrir caja
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Abrir caja</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div className="flex flex-col gap-2">
            <Label htmlFor="openingAmount">Monto de apertura</Label>
            <Input
              id="openingAmount"
              type="number"
              min={0}
              step="any"
              className="font-data"
              required
              value={openingAmount}
              onChange={(e) => setOpeningAmount(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="openNotes">Notas (opcional)</Label>
            <Textarea
              id="openNotes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isSubmitting}
            />
          </div>
          <DialogFooter>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting && <Loader2 className="size-4 animate-spin" />}
              {isSubmitting ? "Abriendo…" : "Abrir caja"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
