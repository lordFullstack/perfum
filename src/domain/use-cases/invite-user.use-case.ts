import type {
  InviteUserInput,
  UserManagementRepository,
} from "@/domain/repositories/user-management.repository";
import type { ManagedUser } from "@/domain/entities/managed-user.entity";

export class InvalidUserDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUserDataError";
  }
}

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function validate(input: InviteUserInput): void {
  if (input.fullName.trim().length < 3) {
    throw new InvalidUserDataError("El nombre completo debe tener al menos 3 caracteres.");
  }
  if (!EMAIL_REGEX.test(input.email)) {
    throw new InvalidUserDataError("El correo electrónico no es válido.");
  }
  if (input.temporaryPassword.length < 8) {
    throw new InvalidUserDataError("La contraseña temporal debe tener al menos 8 caracteres.");
  }
  if (!input.roleId) {
    throw new InvalidUserDataError("Debe seleccionarse un rol.");
  }
}

export async function inviteUserUseCase(
  repository: UserManagementRepository,
  input: InviteUserInput,
): Promise<ManagedUser> {
  validate(input);
  return repository.inviteUser(input);
}
