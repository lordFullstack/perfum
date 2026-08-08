export type CashSessionStatus = "open" | "closed";

export type CashMovementType = "sale" | "sale_cancellation" | "manual_income" | "manual_expense";

export interface CashMovement {
  id: string;
  type: CashMovementType;
  amount: number;
  referenceType: string | null;
  notes: string | null;
  createdAt: string;
}

export interface CashSession {
  id: string;
  openingAmount: number;
  closingAmount: number | null;
  expectedAmount: number | null;
  difference: number | null;
  status: CashSessionStatus;
  notes: string | null;
  openedAt: string;
  closedAt: string | null;
}
