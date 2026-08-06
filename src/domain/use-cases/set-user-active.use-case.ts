import type { UserManagementRepository } from "@/domain/repositories/user-management.repository";

export class CannotDeactivateSelfError extends Error {
  constructor() {
    super("No podés desactivar tu propia cuenta.");
    this.name = "CannotDeactivateSelfError";
  }
}

export class LastActiveAdminError extends Error {
  constructor() {
    super("No podés desactivar al único administrador activo de la sucursal.");
    this.name = "LastActiveAdminError";
  }
}

interface SetUserActiveParams {
  targetUserId: string;
  targetRoleName: string;
  isActive: boolean;
  currentUserId: string;
}

export async function setUserActiveUseCase(
  repository: UserManagementRepository,
  { targetUserId, targetRoleName, isActive, currentUserId }: SetUserActiveParams,
): Promise<void> {
  if (!isActive && targetUserId === currentUserId) {
    throw new CannotDeactivateSelfError();
  }

  if (!isActive && targetRoleName === "admin") {
    const activeAdmins = await repository.countActiveAdmins();
    if (activeAdmins <= 1) {
      throw new LastActiveAdminError();
    }
  }

  await repository.setUserActive(targetUserId, isActive);
}
