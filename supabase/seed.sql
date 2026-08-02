-- =========================================================
-- SEED — FASE 1
-- Sucursal única + roles (admin, vendedor) + permisos base.
-- Ejecutar con: npx supabase db seed  (o pegar en el SQL Editor
-- de Supabase para el primer despliegue).
-- =========================================================

-- =========================================================
-- SUCURSAL
-- =========================================================
insert into branches (name, code, is_active)
values ('Sucursal Principal', 'MAIN', true);

-- =========================================================
-- ROLES
-- =========================================================
insert into roles (name, description, is_system) values
    ('admin', 'Administrador con acceso total al sistema', true),
    ('vendedor', 'Vendedor con acceso operativo a ventas y clientes', true);

-- =========================================================
-- PERMISOS
-- =========================================================
insert into permissions (module, action, code) values
    ('dashboard', 'read_full', 'dashboard.read_full'),
    ('dashboard', 'read_own', 'dashboard.read_own'),
    ('sales', 'create', 'sales.create'),
    ('sales', 'read_all', 'sales.read_all'),
    ('sales', 'read_own', 'sales.read_own'),
    ('sales', 'update', 'sales.update'),
    ('sales', 'cancel', 'sales.cancel'),
    ('customers', 'create', 'customers.create'),
    ('customers', 'read', 'customers.read'),
    ('customers', 'update', 'customers.update'),
    ('customers', 'delete', 'customers.delete'),
    ('inventory', 'create', 'inventory.create'),
    ('inventory', 'read', 'inventory.read'),
    ('inventory', 'read_cost', 'inventory.read_cost'),
    ('inventory', 'update', 'inventory.update'),
    ('inventory', 'delete', 'inventory.delete'),
    ('inventory', 'adjust', 'inventory.adjust'),
    ('suppliers', 'create', 'suppliers.create'),
    ('suppliers', 'read', 'suppliers.read'),
    ('suppliers', 'update', 'suppliers.update'),
    ('suppliers', 'delete', 'suppliers.delete'),
    ('purchases', 'create', 'purchases.create'),
    ('purchases', 'read', 'purchases.read'),
    ('purchases', 'update', 'purchases.update'),
    ('purchases', 'cancel', 'purchases.cancel'),
    ('recipes', 'create', 'recipes.create'),
    ('recipes', 'read', 'recipes.read'),
    ('recipes', 'read_cost', 'recipes.read_cost'),
    ('recipes', 'update', 'recipes.update'),
    ('recipes', 'delete', 'recipes.delete'),
    ('production', 'create', 'production.create'),
    ('production', 'read_all', 'production.read_all'),
    ('production', 'read_own', 'production.read_own'),
    ('production', 'update', 'production.update'),
    ('production', 'cancel', 'production.cancel'),
    ('cash', 'open_own', 'cash.open_own'),
    ('cash', 'close_own', 'cash.close_own'),
    ('cash', 'manage_all', 'cash.manage_all'),
    ('cash', 'adjust', 'cash.adjust'),
    ('reports', 'read_financial', 'reports.read_financial'),
    ('reports', 'read_own_sales', 'reports.read_own_sales'),
    ('audit', 'read', 'audit.read'),
    ('settings', 'manage', 'settings.manage'),
    ('users', 'create', 'users.create'),
    ('users', 'read', 'users.read'),
    ('users', 'update', 'users.update'),
    ('users', 'delete', 'users.delete'),
    ('roles', 'manage', 'roles.manage');

-- =========================================================
-- ASIGNACIÓN: ADMIN -> TODOS LOS PERMISOS
-- =========================================================
insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'admin'), id from permissions;

-- =========================================================
-- ASIGNACIÓN: VENDEDOR -> PERMISOS LIMITADOS
-- =========================================================
insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'vendedor'), id
from permissions
where code in (
    'dashboard.read_own',
    'sales.create', 'sales.read_own',
    'customers.create', 'customers.read', 'customers.update',
    'inventory.read',
    'recipes.read',
    'production.read_own',
    'cash.open_own', 'cash.close_own',
    'reports.read_own_sales'
);

-- =========================================================
-- NOTA: creación del primer usuario administrador
-- =========================================================
-- Supabase Auth gestiona auth.users por separado. Para crear el
-- primer admin:
--   1. Crear el usuario desde el dashboard de Supabase
--      (Authentication > Users > Add user), o vía
--      supabase.auth.admin.createUser en un script server-side.
--   2. Insertar su fila correspondiente en `profiles`:
--
-- insert into profiles (id, branch_id, role_id, full_name, email)
-- values (
--   '<uuid-del-usuario-en-auth.users>',
--   (select id from branches where code = 'MAIN'),
--   (select id from roles where name = 'admin'),
--   'Nombre Completo',
--   'admin@tuperfumeria.com'
-- );
