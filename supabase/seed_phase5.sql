-- =========================================================
-- SEED — FASE 5: permisos del módulo Perfumes
-- (recipes.* ya existía en el seed original de la Fase 1)
-- =========================================================

insert into permissions (module, action, code) values
    ('perfumes', 'create', 'perfumes.create'),
    ('perfumes', 'read', 'perfumes.read'),
    ('perfumes', 'update', 'perfumes.update');

insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'admin'), id
from permissions where code in ('perfumes.create', 'perfumes.read', 'perfumes.update');

-- El vendedor necesita ver los perfumes para poder venderlos
-- (Fase 7), aunque no pueda crearlos ni editarlos.
insert into role_permissions (role_id, permission_id)
select (select id from roles where name = 'vendedor'), id
from permissions where code = 'perfumes.read';
