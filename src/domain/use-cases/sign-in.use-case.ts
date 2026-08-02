import type { AuthCredentials, AuthRepository } from "@/domain/repositories/auth.repository";
import type { UserProfile } from "@/domain/entities/user.entity";

export class InvalidCredentialsError extends Error {
  constructor() {
    super("El correo o la contraseña son incorrectos.");
    this.name = "InvalidCredentialsError";
  }
}

export class InactiveUserError extends Error {
  constructor() {
    super("Esta cuenta está desactivada. Contacta al administrador.");
    this.name = "InactiveUserError";
  }
}

/**
 * Caso de uso: autenticar un usuario y devolver su perfil completo
 * (rol, permisos, sucursal). Encapsula las reglas de negocio de
 * acceso: una cuenta inactiva no puede iniciar sesión aunque la
 * contraseña sea correcta.
 */
export async function signInUseCase(
  authRepository: AuthRepository,
  credentials: AuthCredentials,
): Promise<UserProfile> {
  if (!credentials.email || !credentials.password) {
    throw new InvalidCredentialsError();
  }

  const profile = await authRepository.signIn(credentials);

  if (!profile.isActive) {
    await authRepository.signOut();
    throw new InactiveUserError();
  }

  return profile;
}
