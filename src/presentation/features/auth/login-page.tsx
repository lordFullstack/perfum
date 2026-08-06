import { useState, type FormEvent } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { Loader2, Lock, Mail } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/presentation/hooks/use-auth";
import { supabase } from "@/infrastructure/supabase/client";
import { BrandMark } from "@/presentation/components/shared/brand-mark";
import { ThemeToggle } from "@/presentation/components/shared/theme-toggle";
import { Button } from "@/presentation/components/ui/button";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";

export function LoginPage() {
  const { profile, isLoading, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Ya hay sesión activa: no tiene sentido ver el login.
  if (!isLoading && profile) {
    const state = location.state as { from?: { pathname?: string } } | null;
    const redirectTo = state?.from?.pathname ?? "/";
    return <Navigate to={redirectTo} replace />;
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await signIn({ email, password });
      navigate("/", { replace: true });
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : "No se pudo iniciar sesión.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleForgotPassword() {
    if (!email) {
      setErrorMessage("Escribí tu correo arriba para poder enviarte el enlace de recuperación.");
      return;
    }
    setIsResetting(true);
    try {
      await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}${import.meta.env.BASE_URL}login`,
      });
      toast.success("Si el correo existe, te enviamos un enlace para restablecer tu contraseña.");
    } finally {
      setIsResetting(false);
    }
  }

  return (
    <div className="relative flex min-h-dvh items-center justify-center bg-background px-4 py-10">
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Textura ambiental sutil: un halo dorado, sin gradientes genéricos de fondo completo */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/3 rounded-full bg-primary/10 blur-3xl"
      />

      <div className="relative w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <BrandMark className="size-12" />
          <div>
            <h1 className="font-display text-2xl text-foreground">AromaPro</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Administración de tu perfumería
            </p>
          </div>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 shadow-sm md:p-7"
        >
          <div className="flex flex-col gap-2">
            <Label htmlFor="email">Correo electrónico</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                className="pl-9"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Contraseña</Label>
              <button
                type="button"
                onClick={handleForgotPassword}
                disabled={isResetting}
                className="text-xs text-muted-foreground underline-offset-2 transition-elegant hover:text-primary hover:underline disabled:opacity-50"
              >
                {isResetting ? "Enviando…" : "¿Olvidaste tu contraseña?"}
              </button>
            </div>
            <div className="relative">
              <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="pl-9"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
            </div>
          </div>

          {errorMessage && (
            <p
              role="alert"
              className="rounded-md border border-destructive/25 bg-destructive/10 px-3 py-2 text-sm text-destructive"
            >
              {errorMessage}
            </p>
          )}

          <Button type="submit" size="lg" disabled={isSubmitting} className="mt-1">
            {isSubmitting && <Loader2 className="size-4 animate-spin" />}
            {isSubmitting ? "Ingresando…" : "Iniciar sesión"}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Acceso exclusivo para personal autorizado de la perfumería.
        </p>
      </div>
    </div>
  );
}
