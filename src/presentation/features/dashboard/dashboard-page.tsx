import { Sparkles } from "lucide-react";

import { useAuth } from "@/presentation/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/presentation/components/ui/card";

const ROLE_LABELS: Record<string, string> = {
  admin: "Administrador",
  vendedor: "Vendedor",
};

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Buenos días";
  if (hour < 19) return "Buenas tardes";
  return "Buenas noches";
}

export function DashboardPage() {
  const { profile } = useAuth();
  const firstName = profile?.fullName.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h2 className="font-display text-2xl text-foreground md:text-3xl">
          {firstName ? `Hola, ${firstName}` : "Bienvenido a AromaPro"}
        </h2>
      </div>

      <Card className="border-primary/25 bg-gradient-to-br from-primary/[0.06] to-transparent">
        <CardHeader>
          <div className="flex items-center gap-2 text-primary">
            <Sparkles className="size-4" />
            <CardDescription className="text-primary/80">Fase 1 — Base del sistema</CardDescription>
          </div>
          <CardTitle>La cuenta y la sesión ya están funcionando</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          Iniciaste sesión como <span className="font-medium text-foreground">
            {profile ? ROLE_LABELS[profile.role] : ""}
          </span>{" "}
          en <span className="font-medium text-foreground">Sucursal Principal</span>. Los
          módulos de Inventario, Recetas, Producción, Ventas y el resto del sistema se
          activan en las próximas fases — el menú lateral ya refleja lo que tu rol puede ver.
        </CardContent>
      </Card>
    </div>
  );
}
