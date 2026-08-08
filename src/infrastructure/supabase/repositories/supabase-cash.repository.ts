import type {
  CashRepository,
  CloseCashSessionInput,
  OpenCashSessionInput,
  RegisterCashMovementInput,
} from "@/domain/repositories/cash.repository";
import type { CashMovement, CashMovementType, CashSession } from "@/domain/entities/cash-session.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawSessionRow {
  id: string;
  opening_amount: number;
  closing_amount: number | null;
  expected_amount: number | null;
  difference: number | null;
  status: string;
  notes: string | null;
  opened_at: string;
  closed_at: string | null;
}

interface RawMovementRow {
  id: string;
  type: string;
  amount: number;
  reference_type: string | null;
  notes: string | null;
  created_at: string;
}

const SESSION_COLUMNS =
  "id, opening_amount, closing_amount, expected_amount, difference, status, notes, opened_at, closed_at";

function mapSession(row: RawSessionRow): CashSession {
  return {
    id: row.id,
    openingAmount: Number(row.opening_amount),
    closingAmount: row.closing_amount !== null ? Number(row.closing_amount) : null,
    expectedAmount: row.expected_amount !== null ? Number(row.expected_amount) : null,
    difference: row.difference !== null ? Number(row.difference) : null,
    status: row.status as CashSession["status"],
    notes: row.notes,
    openedAt: row.opened_at,
    closedAt: row.closed_at,
  };
}

function mapMovement(row: RawMovementRow): CashMovement {
  return {
    id: row.id,
    type: row.type as CashMovementType,
    amount: Number(row.amount),
    referenceType: row.reference_type,
    notes: row.notes,
    createdAt: row.created_at,
  };
}

export class SupabaseCashRepository implements CashRepository {
  async getOpenSession(): Promise<CashSession | null> {
    const { data, error } = await supabase
      .from("cash_sessions")
      .select<string, RawSessionRow>(SESSION_COLUMNS)
      .eq("status", "open")
      .maybeSingle();

    if (error) throw new Error("No se pudo verificar el estado de la caja.");
    return data ? mapSession(data) : null;
  }

  async listSessions(): Promise<CashSession[]> {
    const { data, error } = await supabase
      .from("cash_sessions")
      .select<string, RawSessionRow>(SESSION_COLUMNS)
      .order("opened_at", { ascending: false });

    if (error) throw new Error("No se pudo cargar el historial de caja.");
    return (data ?? []).map(mapSession);
  }

  async listMovements(sessionId: string): Promise<CashMovement[]> {
    const { data, error } = await supabase
      .from("cash_movements")
      .select<string, RawMovementRow>("id, type, amount, reference_type, notes, created_at")
      .eq("cash_session_id", sessionId)
      .order("created_at", { ascending: false });

    if (error) throw new Error("No se pudieron cargar los movimientos de caja.");
    return (data ?? []).map(mapMovement);
  }

  async openSession(input: OpenCashSessionInput): Promise<CashSession> {
    const { data, error } = await supabase.rpc("open_cash_session", {
      p_opening_amount: input.openingAmount,
      p_notes: input.notes ?? undefined,
    });
    if (error || !data) throw new Error(error?.message ?? "No se pudo abrir la caja.");
    return mapSession(data as RawSessionRow);
  }

  async closeSession(input: CloseCashSessionInput): Promise<CashSession> {
    const { data, error } = await supabase.rpc("close_cash_session", {
      p_closing_amount: input.closingAmount,
      p_notes: input.notes ?? undefined,
    });
    if (error || !data) throw new Error(error?.message ?? "No se pudo cerrar la caja.");
    return mapSession(data as RawSessionRow);
  }

  async registerMovement(input: RegisterCashMovementInput): Promise<CashMovement> {
    const { data, error } = await supabase.rpc("register_cash_movement", {
      p_type: input.type,
      p_amount: input.amount,
      p_notes: input.notes ?? undefined,
    });
    if (error || !data) throw new Error(error?.message ?? "No se pudo registrar el movimiento.");
    return mapMovement(data as RawMovementRow);
  }
}
