-- ============================================================
-- FASE 5: PERFUMES Y RECETAS
-- Aplicado en producción: proyecto cpffnhucemcmiglbqujw
-- ============================================================

-- --- PERFUMES ---
create table if not exists perfumes (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id),
  code text not null,
  name text not null,
  description text,
  category text,
  base_price numeric(12,2) not null default 0 check (base_price >= 0),
  image_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (branch_id, code)
);

create index if not exists idx_perfumes_branch on perfumes(branch_id);
create index if not exists idx_perfumes_active on perfumes(branch_id, is_active);

-- --- RECIPES (versionadas) ---
create table if not exists recipes (
  id uuid primary key default gen_random_uuid(),
  branch_id uuid not null references branches(id),
  perfume_id uuid not null references perfumes(id) on delete cascade,
  version integer not null,
  is_active boolean not null default true,
  yield_ml numeric(10,2) not null check (yield_ml > 0),
  notes text,
  created_by uuid references profiles(id),
  created_at timestamptz not null default now(),
  unique (perfume_id, version)
);

create index if not exists idx_recipes_perfume on recipes(perfume_id);
create unique index if not exists idx_recipes_active_per_perfume
  on recipes(perfume_id) where is_active = true;

-- --- RECIPE ITEMS ---
create table if not exists recipe_items (
  id uuid primary key default gen_random_uuid(),
  recipe_id uuid not null references recipes(id) on delete cascade,
  supply_id uuid not null references supplies(id),
  quantity numeric(12,4) not null check (quantity > 0),
  unit_id uuid not null references units_of_measure(id),
  notes text,
  sort_order integer not null default 0
);

create index if not exists idx_recipe_items_recipe on recipe_items(recipe_id);
create index if not exists idx_recipe_items_supply on recipe_items(supply_id);

-- ============================================================
-- RLS
-- ============================================================
alter table perfumes enable row level security;
alter table recipes enable row level security;
alter table recipe_items enable row level security;

create policy perfumes_select on perfumes for select
  using (branch_id = current_user_branch() and current_user_has_permission('perfumes.read'));

create policy perfumes_insert on perfumes for insert with check (
  branch_id = current_user_branch() and current_user_has_permission('perfumes.create'));

create policy perfumes_update on perfumes for update using (
  branch_id = current_user_branch() and current_user_has_permission('perfumes.update'))
  with check (branch_id = current_user_branch());

create policy recipes_select on recipes for select
  using (branch_id = current_user_branch() and current_user_has_permission('recipes.read'));

create policy recipes_insert on recipes for insert with check (
  branch_id = current_user_branch() and current_user_has_permission('recipes.create'));

create policy recipes_update on recipes for update using (
  branch_id = current_user_branch() and current_user_has_permission('recipes.update'));

-- recipe_items: solo lectura directa (las escrituras van por RPC security definer)
create policy recipe_items_select on recipe_items for select
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_items.recipe_id
        and r.branch_id = current_user_branch()
        and current_user_has_permission('recipes.read')
    )
  );

-- ============================================================
-- RPC: create_recipe
-- ============================================================
create or replace function create_recipe(
  p_perfume_id uuid,
  p_yield_ml numeric,
  p_notes text,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch_id uuid;
  v_new_version integer;
  v_recipe_id uuid;
  v_item jsonb;
begin
  if not current_user_has_permission('recipes.create') then
    raise exception 'PERMISSION_DENIED: recipes.create required';
  end if;

  select branch_id into v_branch_id from perfumes where id = p_perfume_id;
  if v_branch_id is null then
    raise exception 'PERFUME_NOT_FOUND';
  end if;
  if v_branch_id != current_user_branch() then
    raise exception 'BRANCH_MISMATCH';
  end if;

  if jsonb_array_length(p_items) = 0 then
    raise exception 'RECIPE_MUST_HAVE_AT_LEAST_ONE_ITEM';
  end if;

  select coalesce(max(version), 0) + 1 into v_new_version
  from recipes where perfume_id = p_perfume_id;

  update recipes set is_active = false
  where perfume_id = p_perfume_id and is_active = true;

  insert into recipes (branch_id, perfume_id, version, is_active, yield_ml, notes, created_by)
  values (v_branch_id, p_perfume_id, v_new_version, true, p_yield_ml, p_notes, auth.uid())
  returning id into v_recipe_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    insert into recipe_items (recipe_id, supply_id, quantity, unit_id, notes, sort_order)
    values (
      v_recipe_id,
      (v_item->>'supply_id')::uuid,
      (v_item->>'quantity')::numeric,
      (v_item->>'unit_id')::uuid,
      v_item->>'notes',
      coalesce((v_item->>'sort_order')::integer, 0)
    );
  end loop;

  return v_recipe_id;
end;
$$;

-- ============================================================
-- RPC: duplicate_recipe
-- ============================================================
create or replace function duplicate_recipe(p_recipe_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_source recipes%rowtype;
begin
  if not current_user_has_permission('recipes.update') then
    raise exception 'PERMISSION_DENIED: recipes.update required';
  end if;

  select * into v_source from recipes where id = p_recipe_id;
  if v_source.id is null then
    raise exception 'RECIPE_NOT_FOUND';
  end if;
  if v_source.branch_id != current_user_branch() then
    raise exception 'BRANCH_MISMATCH';
  end if;

  return jsonb_build_object(
    'perfume_id', v_source.perfume_id,
    'yield_ml', v_source.yield_ml,
    'notes', v_source.notes,
    'items', (
      select coalesce(jsonb_agg(jsonb_build_object(
        'supply_id', supply_id,
        'quantity', quantity,
        'unit_id', unit_id,
        'notes', notes,
        'sort_order', sort_order
      ) order by sort_order), '[]'::jsonb)
      from recipe_items where recipe_id = p_recipe_id
    )
  );
end;
$$;

-- ============================================================
-- RPC: calculate_recipe_cost
-- ============================================================
create or replace function calculate_recipe_cost(p_recipe_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch_id uuid;
  v_total numeric := 0;
  v_breakdown jsonb;
begin
  if not current_user_has_permission('recipes.read_cost') then
    raise exception 'PERMISSION_DENIED: recipes.read_cost required';
  end if;

  select branch_id into v_branch_id from recipes where id = p_recipe_id;
  if v_branch_id is null then
    raise exception 'RECIPE_NOT_FOUND';
  end if;
  if v_branch_id != current_user_branch() then
    raise exception 'BRANCH_MISMATCH';
  end if;

  select
    coalesce(sum(ri.quantity * s.average_cost), 0),
    coalesce(jsonb_agg(jsonb_build_object(
      'supply_id', s.id,
      'supply_name', s.name,
      'quantity', ri.quantity,
      'unit', u.abbreviation,
      'unit_cost', s.average_cost,
      'subtotal', ri.quantity * s.average_cost
    ) order by ri.sort_order), '[]'::jsonb)
  into v_total, v_breakdown
  from recipe_items ri
  join supplies s on s.id = ri.supply_id
  join units_of_measure u on u.id = ri.unit_id
  where ri.recipe_id = p_recipe_id;

  return jsonb_build_object('total_cost', v_total, 'breakdown', v_breakdown);
end;
$$;

-- ============================================================
-- RPC: check_recipe_feasibility
-- ============================================================
create or replace function check_recipe_feasibility(p_recipe_id uuid, p_quantity_to_produce integer)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_branch_id uuid;
  v_shortfalls jsonb;
begin
  if not current_user_has_permission('recipes.read') then
    raise exception 'PERMISSION_DENIED: recipes.read required';
  end if;
  if p_quantity_to_produce <= 0 then
    raise exception 'QUANTITY_MUST_BE_POSITIVE';
  end if;

  select branch_id into v_branch_id from recipes where id = p_recipe_id;
  if v_branch_id is null then
    raise exception 'RECIPE_NOT_FOUND';
  end if;
  if v_branch_id != current_user_branch() then
    raise exception 'BRANCH_MISMATCH';
  end if;

  select coalesce(jsonb_agg(jsonb_build_object(
      'supply_id', s.id,
      'supply_name', s.name,
      'required', ri.quantity * p_quantity_to_produce,
      'available', s.stock,
      'unit', u.abbreviation
    )), '[]'::jsonb)
  into v_shortfalls
  from recipe_items ri
  join supplies s on s.id = ri.supply_id
  join units_of_measure u on u.id = ri.unit_id
  where ri.recipe_id = p_recipe_id
    and s.stock < (ri.quantity * p_quantity_to_produce);

  return jsonb_build_object('feasible', jsonb_array_length(v_shortfalls) = 0, 'shortfalls', v_shortfalls);
end;
$$;

-- ============================================================
-- SEED DE PERMISOS (perfumes.* -- recipes.* ya estaba seedeado)
-- ============================================================
insert into permissions (module, action, code) values
  ('perfumes', 'read', 'perfumes.read'),
  ('perfumes', 'create', 'perfumes.create'),
  ('perfumes', 'update', 'perfumes.update')
on conflict (code) do nothing;

insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'admin'), id from permissions
where code in ('perfumes.read','perfumes.create','perfumes.update')
on conflict do nothing;

insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'vendedor'), id from permissions
where code = 'perfumes.read'
on conflict do nothing;
