import type { CashMovement, CashMovementType, CashSession } from "@/domain/entities/cash-session.entity";

export interface OpenCashSessionInput {
  openingAmount: number;
  notes: string | null;
}

export interface CloseCashSessionInput {
  closingAmount: number;
  notes: string | null;
}

export interface RegisterCashMovementInput {
  type: Extract<CashMovementType, "manual_income" | "manual_expense">;
  amount: number;
  notes: string | null;
}

export interface CashRepository {
  getOpenSession(): Promise<CashSession | null>;
  listSessions(): Promise<CashSession[]>;
  listMovements(sessionId: string): Promise<CashMovement[]>;
  openSession(input: OpenCashSessionInput): Promise<CashSession>;
  closeSession(input: CloseCashSessionInput): Promise<CashSession>;
  registerMovement(input: RegisterCashMovementInput): Promise<CashMovement>;
}
