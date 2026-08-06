-- =========================================================
-- MIGRACIÓN 0005 — FASE 5: RECETAS
--
-- NOTA DE PROCESO: este archivo reconstruye, para el repositorio
-- local, el esquema que ya está aplicado en el proyecto Supabase
-- real (se aplicó originalmente en una sesión de chat que perdió
-- el contexto antes de terminar de documentarlo acá). El contenido
-- fue verificado columna por columna, política por política y
-- función por función contra la base real antes de escribir este
-- archivo, y se le corrigieron 3 detalles menores que faltaban
-- (ver 0006_recipes_security_fixes.sql).
-- =========================================================

-- =========================================================
-- PERFUMES
-- =========================================================
create table perfumes (
    id uuid primary key default gen_random_uuid(),
    branch_id uuid references branches(id) not null,
    code text not null,
    name text not null,
    description text,
    category text,
    base_price numeric(14,4) not null default 0,
    image_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    unique (branch_id, code),
    constraint perfumes_base_price_check check (base_price >= 0)
);

create index idx_perfumes_branch on perfumes(branch_id);
create index idx_perfumes_active on perfumes(branch_id, is_active);

create trigger trg_perfumes_updated_at
  before update on perfumes
  for each row execute function set_updated_at();

-- =========================================================
-- RECETAS
-- Versionadas: cada vez que se crea una receta nueva para un
-- perfume, la anterior pasa a is_active = false (nunca se
-- pierden versiones viejas, quedan como historial). El índice
-- único garantiza que solo exista una versión activa por perfume.
-- =========================================================
create table recipes (
    id uuid primary key default gen_random_uuid(),
    branch_id uuid references branches(id) not null,
    perfume_id uuid references perfumes(id) on delete cascade not null,
    version integer not null,
    is_active boolean not null default true,
    yield_ml numeric(14,4) not null,
    notes text,
    created_by uuid references profiles(id),
    created_at timestamptz not null default now(),
    unique (perfume_id, version),
    constraint recipes_yield_ml_check check (yield_ml > 0)
);

create index idx_recipes_perfume on recipes(perfume_id);
create unique index idx_recipes_active_per_perfume on recipes(perfume_id) where (is_active = true);

-- =========================================================
-- ÍTEMS DE RECETA
-- Cuánto de cada insumo entra en la receta, para producir
-- `yield_ml` de perfume. sort_order define el orden de
-- visualización (ej. notas de salida, corazón, fondo).
-- =========================================================
create table recipe_items (
    id uuid primary key default gen_random_uuid(),
    recipe_id uuid references recipes(id) on delete cascade not null,
    supply_id uuid references supplies(id) not null,
    quantity numeric(14,4) not null,
    unit_id uuid references units_of_measure(id) not null,
    notes text,
    sort_order integer not null default 0,
    constraint recipe_items_quantity_check check (quantity > 0)
);

create index idx_recipe_items_recipe on recipe_items(recipe_id);
create index idx_recipe_items_supply on recipe_items(supply_id);

-- =========================================================
-- Crea una nueva versión de receta para un perfume (cabecera +
-- ítems) en una sola transacción, y desactiva la versión previa.
-- p_items: [{ supply_id, quantity, unit_id, notes?, sort_order? }, ...]
-- =========================================================
create or replace function create_recipe(
  p_perfume_id uuid,
  p_yield_ml numeric,
  p_notes text,
  p_items jsonb
)
returns uuid
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

-- =========================================================
-- Costo total de una receta = suma de (cantidad × costo
-- promedio del insumo). Se calcula al vuelo, nunca se
-- guarda — así siempre refleja el costo promedio actual.
-- =========================================================
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

-- =========================================================
-- ¿Alcanza el stock actual para producir N unidades de esta
-- receta? Lista los insumos que faltarían si no alcanza.
-- La usa la Fase 6 (Producción) antes de confirmar una orden.
-- =========================================================
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

-- =========================================================
-- Devuelve los datos de una receta existente en el formato que
-- espera create_recipe(), para precargar el formulario de "nueva
-- versión a partir de esta". No inserta nada — solo lee.
-- =========================================================
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

revoke execute on function create_recipe(uuid, numeric, text, jsonb) from anon, public;
revoke execute on function calculate_recipe_cost(uuid) from anon, public;
revoke execute on function check_recipe_feasibility(uuid, integer) from anon, public;
revoke execute on function duplicate_recipe(uuid) from anon, public;
grant execute on function create_recipe(uuid, numeric, text, jsonb) to authenticated;
grant execute on function calculate_recipe_cost(uuid) to authenticated;
grant execute on function check_recipe_feasibility(uuid, integer) to authenticated;
grant execute on function duplicate_recipe(uuid) to authenticated;

-- =========================================================
-- RLS
-- =========================================================
alter table perfumes enable row level security;
alter table recipes enable row level security;
alter table recipe_items enable row level security;

create policy "perfumes_select" on perfumes
  for select to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('perfumes.read'));

create policy "perfumes_insert" on perfumes
  for insert to authenticated
  with check (branch_id = current_user_branch() and current_user_has_permission('perfumes.create'));

create policy "perfumes_update" on perfumes
  for update to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('perfumes.update'))
  with check (branch_id = current_user_branch());

create policy "recipes_select" on recipes
  for select to authenticated
  using (branch_id = current_user_branch() and current_user_has_permission('recipes.read'));

-- Los inserts de recipes/recipe_items pasan únicamente por
-- create_recipe() (SECURITY DEFINER) para mantener la versión
-- activa sincronizada; acá solo se permite update directo
-- (ej. editar notas) y select.
create policy "recipes_update" on recipes
  for update to authenticated
  using (
    branch_id = current_user_branch()
    and (current_user_has_permission('recipes.update') or current_user_has_permission('recipes.delete'))
  )
  with check (branch_id = current_user_branch());

create policy "recipe_items_select" on recipe_items
  for select to authenticated
  using (
    exists (
      select 1 from recipes r
      where r.id = recipe_items.recipe_id
        and r.branch_id = current_user_branch()
        and current_user_has_permission('recipes.read')
    )
  );
