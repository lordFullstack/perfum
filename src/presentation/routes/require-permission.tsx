import { Outlet } from "react-router-dom";
import { ShieldAlert } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { EmptyModule } from "@/presentation/components/shared/empty-module";

/**
 * A diferencia de ModulePlaceholderRoute (módulo no construido aún),
 * esto se usa en módulos que SÍ existen pero requieren un permiso
 * puntual — evita acceso por URL directa aunque el ítem esté oculto
 * del menú.
 */
export function RequirePermission({ permission }: { permission: string }) {
  const granted = usePermission(permission);

  if (!granted) {
    return (
      <EmptyModule title="No tenés acceso a esta sección" icon={ShieldAlert} />
    );
  }

  return <Outlet />;
}
