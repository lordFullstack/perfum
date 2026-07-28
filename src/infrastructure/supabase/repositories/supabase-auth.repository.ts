import type { AuthRepository, AuthCredentials } from "@/domain/repositories/auth.repository";
import type { RoleName, UserProfile } from "@/domain/entities/user.entity";
import { InvalidCredentialsError } from "@/domain/use-cases/sign-in.use-case";
import { supabase } from "@/infrastructure/supabase/client";

/**
 * Trae el perfil completo del usuario autenticado: datos personales,
 * sucursal, rol y la lista de permisos resuelta a partir de
 * role_permissions -> permissions. Una sola consulta con joins
 * anidados de PostgREST.
 */
/**
 * Forma cruda de la fila que devuelve el select con joins anidados.
 * El `Database` escrito a mano no declara `Relationships`, así que
 * el cliente de Supabase no puede inferir este shape automáticamente;
 * se lo indicamos de forma explícita vía el genérico de `.select<>()`.
 */
interface RawProfileWithRole {
  id: string;
  branch_id: string;
  full_name: string;
  avatar_url: string | null;
  is_active: boolean;
  roles: {
    name: RoleName;
    role_permissions: {
      permissions: { code: string; module: string; action: string } | null;
    }[];
  } | null;
}

async function fetchFullProfile(userId: string, email: string): Promise<UserProfile> {
  const { data, error } = await supabase
    .from("profiles")
    .select<string, RawProfileWithRole>(
      `
      id,
      branch_id,
      full_name,
      avatar_url,
      is_active,
      roles:role_id (
        name,
        role_permissions (
          permissions ( code, module, action )
        )
      )
    `,
    )
    .eq("id", userId)
    .single();

  if (error || !data) {
    throw new Error(
      "No se encontró un perfil asociado a este usuario. Contacta al administrador.",
    );
  }

  const permissions = (data.roles?.role_permissions ?? [])
    .map((rp) => rp.permissions)
    .filter((p): p is { code: string; module: string; action: string } => Boolean(p));

  return {
    id: data.id,
    branchId: data.branch_id,
    email,
    fullName: data.full_name,
    avatarUrl: data.avatar_url,
    role: data.roles?.name ?? "vendedor",
    permissions,
    isActive: data.is_active,
  };
}

export class SupabaseAuthRepository implements AuthRepository {
  async signIn({ email, password }: AuthCredentials): Promise<UserProfile> {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error || !data.user) {
      throw new InvalidCredentialsError();
    }

    return fetchFullProfile(data.user.id, data.user.email ?? email);
  }

  async signOut(): Promise<void> {
    await supabase.auth.signOut();
  }

  async getCurrentProfile(): Promise<UserProfile | null> {
    const { data } = await supabase.auth.getSession();
    const user = data.session?.user;
    if (!user) return null;

    try {
      return await fetchFullProfile(user.id, user.email ?? "");
    } catch {
      return null;
    }
  }

  onAuthStateChange(callback: (profile: UserProfile | null) => void): () => void {
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      try {
        const profile = await fetchFullProfile(session.user.id, session.user.email ?? "");
        callback(profile);
      } catch {
        callback(null);
      }
    });

    return () => subscription.subscription.unsubscribe();
  }
}
