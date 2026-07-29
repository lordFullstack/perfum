import type {
  InviteUserInput,
  UserManagementRepository,
} from "@/domain/repositories/user-management.repository";
import type { ManagedUser, RoleOption } from "@/domain/entities/managed-user.entity";
import type { RoleName } from "@/domain/entities/user.entity";
import { supabase } from "@/infrastructure/supabase/client";

interface RawManagedUserRow {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
  is_active: boolean;
  created_at: string;
  role_id: string;
  roles: { name: RoleName } | null;
}

export class SupabaseUserManagementRepository implements UserManagementRepository {
  async listUsers(): Promise<ManagedUser[]> {
    const { data, error } = await supabase
      .from("profiles")
      .select<string, RawManagedUserRow>(
        "id, full_name, email, phone, is_active, created_at, role_id, roles:role_id ( name )",
      )
      .order("created_at", { ascending: true });

    if (error) throw new Error("No se pudo cargar la lista de usuarios.");

    return (data ?? []).map((row) => ({
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      roleId: row.role_id,
      roleName: row.roles?.name ?? "vendedor",
      isActive: row.is_active,
      createdAt: row.created_at,
    }));
  }

  async listRoles(): Promise<RoleOption[]> {
    const { data, error } = await supabase
      .from("roles")
      .select("id, name, description")
      .order("name", { ascending: true });

    if (error) throw new Error("No se pudieron cargar los roles.");
    return (data ?? []) as RoleOption[];
  }

  async inviteUser(input: InviteUserInput): Promise<ManagedUser> {
    const { data, error } = await supabase.functions.invoke("admin-create-user", {
      body: {
        fullName: input.fullName,
        email: input.email,
        phone: input.phone,
        roleId: input.roleId,
        temporaryPassword: input.temporaryPassword,
      },
    });

    if (error) {
      // El body de error de una FunctionsHttpError trae el mensaje que
      // devolvió la Edge Function (ver supabase/functions/admin-create-user).
      const context = (error as { context?: Response }).context;
      const parsed = context ? await context.json().catch(() => null) : null;
      throw new Error(parsed?.error ?? "No se pudo crear el usuario.");
    }

    const row = data as RawManagedUserRow;
    return {
      id: row.id,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone,
      roleId: row.role_id,
      roleName: row.roles?.name ?? "vendedor",
      isActive: row.is_active,
      createdAt: row.created_at,
    };
  }

  async setUserActive(userId: string, isActive: boolean): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ is_active: isActive })
      .eq("id", userId);

    if (error) throw new Error("No se pudo actualizar el estado del usuario.");
  }

  async changeUserRole(userId: string, roleId: string): Promise<void> {
    const { error } = await supabase
      .from("profiles")
      .update({ role_id: roleId })
      .eq("id", userId);

    if (error) throw new Error("No se pudo actualizar el rol del usuario.");
  }

  async countActiveAdmins(): Promise<number> {
    const { count, error } = await supabase
      .from("profiles")
      .select("id, roles:role_id!inner ( name )", { count: "exact", head: true })
      .eq("is_active", true)
      .eq("roles.name", "admin");

    if (error) throw new Error("No se pudo verificar los administradores activos.");
    return count ?? 0;
  }
}
