-- =========================================================
-- MIGRACIÓN 0001 — FASE 1: BASE DE AUTENTICACIÓN
-- Solo las tablas necesarias para sucursal única, roles,
-- permisos y perfiles de usuario. Las tablas de negocio
-- (insumos, recetas, ventas, etc.) se agregan en sus fases.
-- =========================================================

create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- =========================================================
-- SUCURSALES
-- Modelo multi-sucursal desde el día 1 a nivel de esquema,
-- operado como sucursal única a nivel de aplicación (ver
-- decisión de arquitectura documentada en README).
-- =========================================================
create table branches (
    id uuid primary key default uuid_generate_v4(),
    name text not null,
    code text unique not null,
    address text,
    phone text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

-- =========================================================
-- ROLES Y PERMISOS
-- =========================================================
create table roles (
    id uuid primary key default uuid_generate_v4(),
    name text unique not null,
    description text,
    is_system boolean not null default false,
    created_at timestamptz not null default now()
);

create table permissions (
    id uuid primary key default uuid_generate_v4(),
    module text not null,
    action text not null,
    code text unique not null
);

create table role_permissions (
    role_id uuid references roles(id) on delete cascade,
    permission_id uuid references permissions(id) on delete cascade,
    primary key (role_id, permission_id)
);

-- =========================================================
-- PERFILES
-- Extiende auth.users (gestionado por Supabase Auth) con los
-- datos de negocio: sucursal, rol, estado.
-- =========================================================
create table profiles (
    id uuid primary key references auth.users(id) on delete cascade,
    branch_id uuid references branches(id) not null,
    role_id uuid references roles(id) not null,
    full_name text not null,
    email text unique not null,
    phone text,
    avatar_url text,
    is_active boolean not null default true,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create index idx_profiles_branch on profiles(branch_id);
create index idx_profiles_role on profiles(role_id);

-- Mantiene updated_at al día en cada modificación.
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger trg_branches_updated_at
  before update on branches
  for each row execute function set_updated_at();

create trigger trg_profiles_updated_at
  before update on profiles
  for each row execute function set_updated_at();
