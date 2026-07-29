import type { UserManagementRepository } from "@/domain/repositories/user-management.repository";

export class CannotChangeOwnRoleError extends Error {
  constructor() {
    super("No podés cambiar tu propio rol. Pedile a otro administrador que lo haga.");
    this.name = "CannotChangeOwnRoleError";
  }
}

interface ChangeUserRoleParams {
  targetUserId: string;
  newRoleId: string;
  currentUserId: string;
}

export async function changeUserRoleUseCase(
  repository: UserManagementRepository,
  { targetUserId, newRoleId, currentUserId }: ChangeUserRoleParams,
): Promise<void> {
  if (targetUserId === currentUserId) {
    throw new CannotChangeOwnRoleError();
  }

  await repository.changeUserRole(targetUserId, newRoleId);
}
