import type { UserManagementRepository } from "@/domain/repositories/user-management.repository";
import type { ManagedUser } from "@/domain/entities/managed-user.entity";

export async function listUsersUseCase(
  repository: UserManagementRepository,
): Promise<ManagedUser[]> {
  return repository.listUsers();
}
