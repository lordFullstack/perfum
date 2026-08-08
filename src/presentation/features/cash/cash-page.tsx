import { ArrowDownCircle, ArrowUpCircle, ReceiptText, Wallet } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { useCashRegister } from "@/presentation/features/cash/use-cash-register";
import { OpenCashDialog } from "@/presentation/features/cash/open-cash-dialog";
import { CloseCashDialog } from "@/presentation/features/cash/close-cash-dialog";
import { MovementFormDialog } from "@/presentation/features/cash/movement-form-dialog";
import { Skeleton } from "@/presentation/components/ui/skeleton";

const MOVEMENT_LABELS: Record<string, string> = {
  sale: "Venta",
  sale_cancellation: "Reverso de venta cancelada",
  manual_income: "Depósito manual",
  manual_expense: "Retiro manual",
};

export function CashPage() {
  const canOpen = usePermission("cash.open_own");
  const canAdjust = usePermission("cash.adjust");

  const { session, movements, isLoading, openSession, closeSession, registerMovement } = useCashRegister();

  const runningTotal = session
    ? session.openingAmount + movements.reduce((sum, m) => sum + m.amount, 0)
    : 0;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Caja</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {session ? "Caja abierta" : "No hay una caja abierta"}
        </p>
      </div>

      {!session ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-4 text-center">
          <Wallet className="size-10 text-muted-foreground" />
          <p className="max-w-sm text-sm text-muted-foreground">
            Abrí la caja con el monto inicial para empezar a registrar ventas y ajustes del día.
          </p>
          {canOpen && <OpenCashDialog onSubmit={openSession} />}
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-3 rounded-lg border border-border p-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Monto de apertura</span>
              <span className="font-data text-foreground">${session.openingAmount.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Total esperado ahora</span>
              <span className="font-data text-lg font-medium text-foreground">
                ${runningTotal.toFixed(2)}
              </span>
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {canAdjust && <MovementFormDialog onSubmit={registerMovement} />}
              {canOpen && (
                <CloseCashDialog session={session} runningTotal={runningTotal} onSubmit={closeSession} />
              )}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ReceiptText className="size-4" />
              Movimientos de la caja
            </h3>

            {movements.length === 0 ? (
              <p className="text-sm text-muted-foreground">Todavía no hay movimientos registrados.</p>
            ) : (
              <div className="flex flex-col divide-y divide-border rounded-lg border border-border">
                {movements.map((movement) => (
                  <div key={movement.id} className="flex items-center justify-between gap-3 p-3">
                    <div className="flex items-center gap-2">
                      {movement.amount >= 0 ? (
                        <ArrowUpCircle className="size-4 shrink-0 text-success" />
                      ) : (
                        <ArrowDownCircle className="size-4 shrink-0 text-destructive" />
                      )}
                      <div>
                        <p className="text-sm text-foreground">
                          {MOVEMENT_LABELS[movement.type] ?? movement.type}
                        </p>
                        {movement.notes && (
                          <p className="text-xs text-muted-foreground">{movement.notes}</p>
                        )}
                      </div>
                    </div>
                    <span
                      className={`font-data text-sm font-medium ${
                        movement.amount >= 0 ? "text-success" : "text-destructive"
                      }`}
                    >
                      {movement.amount >= 0 ? "+" : ""}
                      ${movement.amount.toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
