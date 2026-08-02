import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { UserProfile } from "@/domain/entities/user.entity";
import type { AuthCredentials } from "@/domain/repositories/auth.repository";
import { signInUseCase } from "@/domain/use-cases/sign-in.use-case";
import { signOutUseCase } from "@/domain/use-cases/sign-out.use-case";
import { SupabaseAuthRepository } from "@/infrastructure/supabase/repositories/supabase-auth.repository";

interface AuthContextValue {
  profile: UserProfile | null;
  isLoading: boolean;
  signIn: (credentials: AuthCredentials) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

// Instancia única del repositorio para toda la app (podría inyectarse
// por props si en el futuro se necesita mockear en tests).
const authRepository = new SupabaseAuthRepository();

export function AuthProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    authRepository.getCurrentProfile().then((current) => {
      if (mounted) {
        setProfile(current);
        setIsLoading(false);
      }
    });

    const unsubscribe = authRepository.onAuthStateChange((updated) => {
      if (mounted) setProfile(updated);
    });

    return () => {
      mounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      profile,
      isLoading,
      signIn: async (credentials) => {
        const result = await signInUseCase(authRepository, credentials);
        setProfile(result);
      },
      signOut: async () => {
        await signOutUseCase(authRepository);
        setProfile(null);
      },
    }),
    [profile, isLoading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth debe usarse dentro de un <AuthProvider>.");
  }
  return ctx;
}
