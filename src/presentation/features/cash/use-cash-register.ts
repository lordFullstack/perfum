import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { CashMovement, CashSession } from "@/domain/entities/cash-session.entity";
import type {
  CloseCashSessionInput,
  OpenCashSessionInput,
  RegisterCashMovementInput,
} from "@/domain/repositories/cash.repository";
import { openCashSessionUseCase } from "@/domain/use-cases/open-cash-session.use-case";
import { registerCashMovementUseCase } from "@/domain/use-cases/register-cash-movement.use-case";
import { useCashRepository } from "@/presentation/hooks/use-cash-management";

export function useCashRegister() {
  const repository = useCashRepository();

  const [session, setSession] = useState<CashSession | null>(null);
  const [movements, setMovements] = useState<CashMovement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const open = await repository.getOpenSession();
      setSession(open);
      setMovements(open ? await repository.listMovements(open.id) : []);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la caja.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function openSession(input: OpenCashSessionInput): Promise<boolean> {
    setIsSubmitting(true);
    try {
      const opened = await openCashSessionUseCase(repository, input);
      setSession(opened);
      setMovements([]);
      toast.success("Caja abierta.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo abrir la caja.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function closeSession(input: CloseCashSessionInput): Promise<boolean> {
    setIsSubmitting(true);
    try {
      const closed = await repository.closeSession(input);
      setSession(closed);
      toast.success(
        closed.difference === 0
          ? "Caja cerrada — cuadró exacto."
          : `Caja cerrada — diferencia: $${closed.difference?.toFixed(2)}.`,
      );
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cerrar la caja.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  async function registerMovement(input: RegisterCashMovementInput): Promise<boolean> {
    setIsSubmitting(true);
    try {
      const movement = await registerCashMovementUseCase(repository, input);
      setMovements((prev) => [movement, ...prev]);
      toast.success("Movimiento registrado.");
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo registrar el movimiento.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }

  return { session, movements, isLoading, isSubmitting, openSession, closeSession, registerMovement };
}
