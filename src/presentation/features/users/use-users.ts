import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

import type { ManagedUser, RoleOption } from "@/domain/entities/managed-user.entity";
import type { InviteUserInput } from "@/domain/repositories/user-management.repository";
import { listUsersUseCase } from "@/domain/use-cases/list-users.use-case";
import { inviteUserUseCase } from "@/domain/use-cases/invite-user.use-case";
import { setUserActiveUseCase } from "@/domain/use-cases/set-user-active.use-case";
import { changeUserRoleUseCase } from "@/domain/use-cases/change-user-role.use-case";
import { useAuth } from "@/presentation/hooks/use-auth";
import { useUserManagementRepository } from "@/presentation/hooks/use-user-management";

export function useUsers() {
  const repository = useUserManagementRepository();
  const { profile } = useAuth();

  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<RoleOption[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [mutatingUserId, setMutatingUserId] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setIsLoading(true);
    try {
      const [usersResult, rolesResult] = await Promise.all([
        listUsersUseCase(repository),
        repository.listRoles(),
      ]);
      setUsers(usersResult);
      setRoles(rolesResult);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo cargar la información.");
    } finally {
      setIsLoading(false);
    }
  }, [repository]);

  useEffect(() => {
    reload();
  }, [reload]);

  async function inviteUser(input: InviteUserInput): Promise<boolean> {
    try {
      const created = await inviteUserUseCase(repository, input);
      setUsers((prev) => [...prev, created]);
      toast.success(`Usuario ${created.fullName} creado correctamente.`);
      return true;
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo crear el usuario.");
      return false;
    }
  }

  async function toggleActive(user: ManagedUser) {
    if (!profile) return;
    setMutatingUserId(user.id);
    try {
      await setUserActiveUseCase(repository, {
        targetUserId: user.id,
        targetRoleName: user.roleName,
        isActive: !user.isActive,
        currentUserId: profile.id,
      });
      setUsers((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, isActive: !u.isActive } : u)),
      );
      toast.success(!user.isActive ? "Usuario activado." : "Usuario desactivado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el usuario.");
    } finally {
      setMutatingUserId(null);
    }
  }

  async function changeRole(user: ManagedUser, newRoleId: string) {
    if (!profile || newRoleId === user.roleId) return;
    setMutatingUserId(user.id);
    try {
      await changeUserRoleUseCase(repository, {
        targetUserId: user.id,
        newRoleId,
        currentUserId: profile.id,
      });
      const newRole = roles.find((r) => r.id === newRoleId);
      setUsers((prev) =>
        prev.map((u) =>
          u.id === user.id
            ? { ...u, roleId: newRoleId, roleName: newRole?.name ?? u.roleName }
            : u,
        ),
      );
      toast.success("Rol actualizado.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "No se pudo actualizar el rol.");
    } finally {
      setMutatingUserId(null);
    }
  }

  return { users, roles, isLoading, mutatingUserId, inviteUser, toggleActive, changeRole };
}
