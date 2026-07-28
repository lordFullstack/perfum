-- =========================================================
-- RLS — FASE 1: AUTENTICACIÓN
-- Habilita Row Level Security y define quién puede leer/escribir
-- qué, para las tablas que intervienen en el login y la resolución
-- de permisos. El resto de las tablas del negocio (supplies, sales,
-- etc.) reciben sus propias políticas en la fase en que se crean.
-- =========================================================

alter table branches enable row level security;
alter table roles enable row level security;
alter table permissions enable row level security;
alter table role_permissions enable row level security;
alter table profiles enable row level security;

-- Función auxiliar: rol del usuario autenticado actual.
-- security definer para poder leer profiles/roles sin recursión de RLS.
create or replace function current_user_role()
returns text
language sql
security definer
stable
set search_path = public
as $$
  select r.name
  from profiles p
  join roles r on r.id = p.role_id
  where p.id = auth.uid()
$$;

-- Función auxiliar: sucursal del usuario autenticado actual.
create or replace function current_user_branch()
returns uuid
language sql
security definer
stable
set search_path = public
as $$
  select p.branch_id from profiles p where p.id = auth.uid()
$$;

-- ---------------------------------------------------------
-- branches: cualquier usuario autenticado puede leer su propia
-- sucursal (hoy solo existe una). Solo admin puede modificarla.
-- ---------------------------------------------------------
create policy "branches_select_own" on branches
  for select to authenticated
  using (id = current_user_branch());

create policy "branches_admin_manage" on branches
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

-- ---------------------------------------------------------
-- roles / permissions / role_permissions: catálogos de solo
-- lectura para cualquier usuario autenticado (se necesitan para
-- resolver los permisos del propio perfil). Solo admin escribe.
-- ---------------------------------------------------------
create policy "roles_select_authenticated" on roles
  for select to authenticated
  using (true);

create policy "roles_admin_manage" on roles
  for insert to authenticated
  with check (current_user_role() = 'admin');

create policy "roles_admin_update" on roles
  for update to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

create policy "roles_admin_delete" on roles
  for delete to authenticated
  using (current_user_role() = 'admin' and is_system = false);

create policy "permissions_select_authenticated" on permissions
  for select to authenticated
  using (true);

create policy "role_permissions_select_authenticated" on role_permissions
  for select to authenticated
  using (true);

create policy "role_permissions_admin_manage" on role_permissions
  for all to authenticated
  using (current_user_role() = 'admin')
  with check (current_user_role() = 'admin');

-- ---------------------------------------------------------
-- profiles: cada usuario lee y actualiza su propio perfil
-- (campos no sensibles). Admin lee/gestiona todos los perfiles
-- de su sucursal.
-- ---------------------------------------------------------
create policy "profiles_select_own" on profiles
  for select to authenticated
  using (id = auth.uid());

create policy "profiles_select_admin" on profiles
  for select to authenticated
  using (current_user_role() = 'admin' and branch_id = current_user_branch());

create policy "profiles_update_own_basic" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

create policy "profiles_admin_manage" on profiles
  for all to authenticated
  using (current_user_role() = 'admin' and branch_id = current_user_branch())
  with check (current_user_role() = 'admin' and branch_id = current_user_branch());
