import type { RoleName } from "@/domain/entities/user.entity";

/**
 * Representa un usuario tal como lo ve la pantalla de administración
 * de Usuarios (Fase 2). Es más liviana que UserProfile: no carga la
 * lista completa de permisos, solo lo necesario para listar/gestionar.
 */
export interface ManagedUser {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  roleId: string;
  roleName: RoleName;
  isActive: boolean;
  createdAt: string;
}

export interface RoleOption {
  id: string;
  name: RoleName;
  description: string | null;
}
