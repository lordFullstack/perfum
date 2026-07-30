-- =========================================================
-- MIGRACIÓN 0004 — FASE 4: PROVEEDORES Y COMPRAS
-- =========================================================

-- =========================================================
-- PROVEEDORES
-- =========================================================
create table suppliers (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) not null,
    name text not null,
    tax_id text,
    phone text,
    email text,
    address text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_suppliers_branch on suppliers(branch_id);

create trigger trg_suppliers_updated_at
  before update on suppliers
  for each row execute function set_updated_at();

-- =========================================================
-- COMPRAS
-- Se crean y cancelan únicamente vía las funciones RPC de abajo
-- (create_purchase / cancel_purchase) para garantizar que la
-- compra, sus ítems y el efecto en stock queden siempre
-- sincronizados en una sola transacción.
-- =========================================================
create table purchases (
    id uuid primary key default uuid_generate_v4(),
    branch_id uuid references branches(id) not null,
    supplier_id uuid references suppliers(id) not null,
    purchase_date date not null default current_date,
    invoice_number text,
    status text not null default 'received' check (status in ('received','cancelled')),
    total_amount numeric(14,4) not null default 0,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now()
);

create index idx_purchases_branch on purchases(branch_id);
create index idx_purchases_supplier on purchases(supplier_id);

create table purchase_items (
    id uuid primary key default uuid_generate_v4(),
    purchase_id uuid references purchases(id) on delete cascade not null,
    supply_id uuid references supplies(id) not null,
    quantity numeric(14,4) not null check (quantity > 0),
    unit_cost numeric(14,4) not null check (unit_cost >= 0),
    batch_code text,
    expiration_date date,
    subtotal numeric(14,4) generated always as (quantity * unit_cost) stored
);

create index idx_purchase_items_purchase on purchase_items(purchase_id);

-- =========================================================
-- Extiende adjust_supply_stock() con trazabilidad de referencia
-- (para poder vincular un movimiento a la compra que lo originó,
-- y luego revertirlo puntualmente si la compra se cancela).
-- Se recrea con dos parámetros nuevos al final, con default null,
-- así que las llamadas existentes desde el frontend no se rompen.
-- =========================================================
drop function if exists adjust_supply_stock(uuid, numeric, text, numeric, text);

create or replace function adjust_supply_stock(
  p_supply_id uuid,
  p_quantity numeric,
  p_movement_type text,
  p_unit_cost numeric default null,
  p_notes text default null,
  p_reference_type text default null,
  p_reference_id uuid default null
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
    branch_id, supply_id, movement_type, quantity, unit_cost, notes,
    reference_type, reference_id, created_by
  ) values (
    v_supply.branch_id, p_supply_id, p_movement_type, p_quantity, p_unit_cost, p_notes,
    p_reference_type, p_reference_id, auth.uid()
  );

  return v_supply;
end;
$$;

revoke execute on function adjust_supply_stock(uuid, numeric, text, numeric, text, text, uuid) from anon, public;
grant execute on function adjust_supply_stock(uuid, numeric, text, numeric, text, text, uuid) to authenticated;

-- =========================================================
-- Registra una compra completa: cabecera + ítems + efecto en
-- stock, todo en una transacción. p_items es un array JSON:
-- [{ "supply_id": "...", "quantity": 10, "unit_cost": 2.5,
--    "batch_code": "L001", "expiration_date": "2027-01-01" }, ...]
-- =========================================================
create or replace function create_purchase(
  p_supplier_id uuid,
  p_purchase_date date,
  p_invoice_number text,
  p_items jsonb
)
returns purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch_id uuid;
  v_purchase purchases%rowtype;
  v_item jsonb;
  v_total numeric := 0;
begin
  if not current_user_has_permission('purchases.create') then
    raise exception 'No tenés permiso para registrar compras.' using errcode = '42501';
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'La compra debe tener al menos un ítem.';
  end if;

  select branch_id into v_branch_id from profiles where id = auth.uid();

  insert into purchases (branch_id, supplier_id, purchase_date, invoice_number, status, total_amount, created_by)
  values (v_branch_id, p_supplier_id, p_purchase_date, nullif(p_invoice_number, ''), 'received', 0, auth.uid())
  returning * into v_purchase;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into purchase_items (purchase_id, supply_id, quantity, unit_cost, batch_code, expiration_date)
    values (
      v_purchase.id,
      (v_item->>'supply_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_cost')::numeric,
      nullif(v_item->>'batch_code', ''),
      nullif(v_item->>'expiration_date', '')::date
    );

    perform adjust_supply_stock(
      (v_item->>'supply_id')::uuid,
      (v_item->>'quantity')::numeric,
      'purchase_in',
      (v_item->>'unit_cost')::numeric,
      'Compra ' || coalesce(nullif(p_invoice_number, ''), v_purchase.id::text),
      'purchase',
      v_purchase.id
    );

    v_total := v_total + ((v_item->>'quantity')::numeric * (v_item->>'unit_cost')::numeric);
  end loop;

  update purchases set total_amount = v_total where id = v_purchase.id returning * into v_purchase;
  return v_purchase;
end;
$$;

revoke execute on function create_purchase(uuid, date, text, jsonb) from anon, public;
grant execute on function create_purchase(uuid, date, text, jsonb) to authenticated;

-- =========================================================
-- Cancela una compra "received": revierte el stock de cada
-- ítem (falla si ya no hay stock suficiente para revertir,
-- por ejemplo porque ya se usó en producción) y marca la
-- compra como cancelada.
-- =========================================================
create or replace function cancel_purchase(p_purchase_id uuid)
returns purchases
language plpgsql
security definer
set search_path = public
as $$
declare
  v_purchase purchases%rowtype;
  v_item record;
begin
  if not current_user_has_permission('purchases.cancel') then
    raise exception 'No tenés permiso para cancelar compras.' using errcode = '42501';
  end if;

  select * into v_purchase from purchases where id = p_purchase_id for update;
  if not found then
    raise exception 'La compra no existe.';
  end if;
  if v_purchase.status <> 'received' then
    raise exception 'Solo se pueden cancelar compras en estado "recibida".';
  end if;

  for v_item in select supply_id, quantity from purchase_items where purchase_id = p_purchase_id
  loop
    perform adjust_supply_stock(
      v_item.supply_id,
      v_item.quantity,
      'adjustment_out',
      null,
      'Reverso por cancelación de compra ' || coalesce(v_purchase.invoice_number, v_purchase.id::text),
      'purchase_cancel',
      p_purchase_id
    );
  end loop;

  update purchases set status = 'cancelled' where id = p_purchase_id returning * into v_purchase;
  return v_purchase;
end;
$$;

revoke execute on function cancel_purchase(uuid) from anon, public;
grant execute on function cancel_purchase(uuid) to authenticated;

-- =========================================================
-- RLS
-- =========================================================
alter table suppliers enable row level security;
alter table purchases enable row level security;
alter table purchase_items enable row level security;

create policy "suppliers_select" on suppliers
  for select to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('suppliers.read'));

create policy "suppliers_insert" on suppliers
  for insert to authenticated
  with check (branch_id = current_user_branch() and current_user_has_permission('suppliers.create'));

create policy "suppliers_update" on suppliers
  for update to authenticated
  using (
    branch_id = current_user_branch()
    and (current_user_has_permission('suppliers.update') or current_user_has_permission('suppliers.delete'))
  )
  with check (branch_id = current_user_branch());

-- Los inserts/updates de purchases pasan únicamente por las
-- funciones RPC (SECURITY DEFINER); acá solo se habilita lectura.
create policy "purchases_select" on purchases
  for select to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('purchases.read'));

create policy "purchase_items_select" on purchase_items
  for select to authenticated
  using (
    current_user_has_permission('purchases.read')
    and exists (
      select 1 from purchases pu
      where pu.id = purchase_items.purchase_id and pu.branch_id = current_user_branch()
    )
  );
