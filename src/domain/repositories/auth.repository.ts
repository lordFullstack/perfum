import type { UserProfile } from "@/domain/entities/user.entity";

export interface AuthCredentials {
  email: string;
  password: string;
}

/**
 * Contrato que debe cumplir cualquier implementación de autenticación.
 * La capa de dominio y los casos de uso dependen de esta interfaz,
 * nunca de Supabase directamente (Dependency Inversion).
 */
export interface AuthRepository {
  signIn(credentials: AuthCredentials): Promise<UserProfile>;
  signOut(): Promise<void>;
  getCurrentProfile(): Promise<UserProfile | null>;
  onAuthStateChange(callback: (profile: UserProfile | null) => void): () => void;
}
