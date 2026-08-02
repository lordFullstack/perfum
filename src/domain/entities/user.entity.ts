/**
 * Entidad de dominio: perfil del usuario autenticado.
 * No depende de Supabase ni de ninguna librería externa —
 * es la representación que el resto de la app conoce.
 */

export type RoleName = "admin" | "vendedor";

export interface Permission {
  code: string; // ej. "inventory.read_cost"
  module: string;
  action: string;
}

export interface UserProfile {
  id: string;
  branchId: string;
  email: string;
  fullName: string;
  avatarUrl: string | null;
  role: RoleName;
  permissions: Permission[];
  isActive: boolean;
}

/**
 * Verifica si el perfil tiene un permiso puntual.
 * Se usa en toda la capa de presentación para mostrar/ocultar UI
 * y en los casos de uso para validar acciones antes de ejecutarlas.
 */
export function hasPermission(
  profile: UserProfile | null,
  permissionCode: string,
): boolean {
  if (!profile) return false;
  return profile.permissions.some((p) => p.code === permissionCode);
}
