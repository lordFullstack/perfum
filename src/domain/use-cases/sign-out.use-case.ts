import type { AuthRepository } from "@/domain/repositories/auth.repository";

export async function signOutUseCase(authRepository: AuthRepository): Promise<void> {
  await authRepository.signOut();
}
