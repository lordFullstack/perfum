-- =========================================================
-- MIGRACIÓN 0003 — FASE 3: INVENTARIO DE INSUMOS
-- =========================================================

-- ---------------------------------------------------------
-- Helper reutilizable: ¿el usuario autenticado tiene tal permiso?
-- Se usa desde acá en adelante en las políticas RLS de todos los
-- módulos, en vez de hardcodear nombres de rol.
-- ---------------------------------------------------------
create or replace function current_user_has_permission(perm_code text)
returns boolean
language sql
security definer
stable
set search_path = public
as $$
  select exists (
    select 1
    from profiles p
    join role_permissions rp on rp.role_id = p.role_id
    join permissions perm on perm.id = rp.permission_id
    where p.id = auth.uid() and perm.code = perm_code
  )
$$;

revoke execute on function current_user_has_permission(text) from anon, public;
grant execute on function current_user_has_permission(text) to authenticated;

-- =========================================================
-- CATÁLOGOS DE REFERENCIA
-- Fijos por ahora (se cargan por seed); sin UI de edición en
-- esta fase, así que no llevan políticas de escritura para
-- `authenticated`.
-- =========================================================
create table supply_categories (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null
);

create table units_of_measure (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    abbreviation text unique not null
);

-- =========================================================
-- INSUMOS
-- =========================================================
create table supplies (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) not null,
    code text not null,
    name text not null,
    category_id uuid references supply_categories(id) not null,
    unit_id uuid references units_of_measure(id) not null,
    stock numeric(14,4) not null default 0,
    min_stock numeric(14,4) not null default 0,
    average_cost numeric(14,4) not null default 0,
    location text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (branch_id, code),
    constraint stock_non_negative check (stock >= 0),
    constraint min_stock_non_negative check (min_stock >= 0)
);

create index idx_supplies_branch on supplies(branch_id);
create index idx_supplies_category on supplies(category_id);

create trigger trg_supplies_updated_at
  before update on supplies
  for each row execute function set_updated_at();

-- =========================================================
-- MOVIMIENTOS DE STOCK
-- Fuente de verdad de todo cambio de stock. Nunca se inserta
-- directamente desde el cliente: solo a través de la función
-- adjust_supply_stock() de abajo, que mantiene stock y
-- movimiento sincronizados en una misma transacción.
-- El proveedor/lote/fecha de compra se incorporan en la Fase 4
-- (Compras), vía reference_type = 'purchase'.
-- =========================================================
create table stock_movements (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) not null,
    supply_id uuid references supplies(id) not null,
    movement_type text not null check (movement_type in
        ('purchase_in','production_out','adjustment_in','adjustment_out','return_in','return_out')),
    quantity numeric(14,4) not null check (quantity > 0),
    unit_cost numeric(14,4),
    reference_type text,
    reference_id uuid,
    notes text,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now()
);

create index idx_stock_movements_supply on stock_movements(supply_id);
create index idx_stock_movements_branch on stock_movements(branch_id);

-- ---------------------------------------------------------
-- Ajusta el stock de un insumo y registra el movimiento de
-- forma atómica. Si el costo unitario viene informado en un
-- movimiento de entrada, recalcula el costo promedio ponderado.
-- ---------------------------------------------------------
create or replace function adjust_supply_stock(
  p_supply_id uuid,
  p_quantity numeric,
  p_movement_type text,
  p_unit_cost numeric default null,
  p_notes text default null
)
returns supplies
language plpgsql
security definer
set search_path = public
as $$
declare
  v_supply supplies%rowtype;
  v_is_incoming boolean;
  v_new_stock numeric;
  v_new_avg_cost numeric;
begin
  if not current_user_has_permission('inventory.adjust') then
    raise exception 'No tenés permiso para ajustar inventario.' using errcode = '42501';
  end if;

  if p_quantity <= 0 then
    raise exception 'La cantidad debe ser mayor a cero.';
  end if;

  v_is_incoming := p_movement_type in ('purchase_in', 'adjustment_in', 'return_in');

  select * into v_supply from supplies where id = p_supply_id for update;
  if not found then
    raise exception 'El insumo no existe.';
  end if;

  if v_is_incoming then
    v_new_stock := v_supply.stock + p_quantity;
    if p_unit_cost is not null then
      v_new_avg_cost := case
        when v_new_stock = 0 then v_supply.average_cost
        else ((v_supply.stock * v_supply.average_cost) + (p_quantity * p_unit_cost)) / v_new_stock
      end;
    else
      v_new_avg_cost := v_supply.average_cost;
    end if;
  else
    v_new_stock := v_supply.stock - p_quantity;
    if v_new_stock < 0 then
      raise exception 'Stock insuficiente: hay % y se intentan descontar %.',
        v_supply.stock, p_quantity;
    end if;
    v_new_avg_cost := v_supply.average_cost;
  end if;

  update supplies
    set stock = v_new_stock, average_cost = v_new_avg_cost
    where id = p_supply_id
    returning * into v_supply;

  insert into stock_movements (
    branch_id, supply_id, movement_type, quantity, unit_cost, notes, created_by
  ) values (
    v_supply.branch_id, p_supply_id, p_movement_type, p_quantity, p_unit_cost, p_notes, auth.uid()
  );

  return v_supply;
end;
$$;

revoke execute on function adjust_supply_stock(uuid, numeric, text, numeric, text) from anon, public;
grant execute on function adjust_supply_stock(uuid, numeric, text, numeric, text) to authenticated;

-- =========================================================
-- RLS
-- =========================================================
alter table supply_categories enable row level security;
alter table units_of_measure enable row level security;
alter table supplies enable row level security;
alter table stock_movements enable row level security;

create policy "supply_categories_select_authenticated" on supply_categories
  for select to authenticated using (true);

create policy "units_of_measure_select_authenticated" on units_of_measure
  for select to authenticated using (true);

create policy "supplies_select" on supplies
  for select to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('inventory.read'));

create policy "supplies_insert" on supplies
  for insert to authenticated
  with check (branch_id = current_user_branch() and current_user_has_permission('inventory.create'));

create policy "supplies_update" on supplies
  for update to authenticated
  using (
    branch_id = current_user_branch()
    and (current_user_has_permission('inventory.update') or current_user_has_permission('inventory.delete'))
  )
  with check (branch_id = current_user_branch());

-- Solo lectura para `authenticated`: los inserts de movimientos pasan
-- únicamente por adjust_supply_stock() (SECURITY DEFINER), nunca directo.
create policy "stock_movements_select" on stock_movements
  for select to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('inventory.read'));
