import type { ManagedUser, RoleOption } from "@/domain/entities/managed-user.entity";

export interface InviteUserInput {
  fullName: string;
  email: string;
  phone: string | null;
  roleId: string;
  temporaryPassword: string;
}

export interface UserManagementRepository {
  listUsers(): Promise<ManagedUser[]>;
  listRoles(): Promise<RoleOption[]>;
  inviteUser(input: InviteUserInput): Promise<ManagedUser>;
  setUserActive(userId: string, isActive: boolean): Promise<void>;
  changeUserRole(userId: string, roleId: string): Promise<void>;
  /** Necesario para la regla de negocio: nunca dejar la sucursal sin administradores activos. */
  countActiveAdmins(): Promise<number>;
}
