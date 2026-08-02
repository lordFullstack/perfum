import { hasPermission } from "@/domain/entities/user.entity";
import { useAuth } from "@/presentation/hooks/use-auth";

/**
 * Uso: const canReadCosts = usePermission("inventory.read_cost");
 * Centraliza la verificación para que ningún componente acceda
 * a profile.permissions directamente.
 */
export function usePermission(permissionCode: string): boolean {
  const { profile } = useAuth();
  return hasPermission(profile, permissionCode);
}
