import { Navigate, Outlet, useLocation } from "react-router-dom";

import { useAuth } from "@/presentation/hooks/use-auth";
import { FullScreenLoader } from "@/presentation/components/shared/full-screen-loader";

/**
 * Envuelve las rutas que requieren sesión activa.
 * Si aún no se resolvió la sesión, muestra un loader (evita el
 * parpadeo de redirigir a /login para luego volver al dashboard).
 */
export function ProtectedRoute() {
  const { profile, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <FullScreenLoader />;
  }

  if (!profile) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <Outlet />;
}
