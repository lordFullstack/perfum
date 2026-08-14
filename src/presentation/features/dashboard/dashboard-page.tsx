import { AlertTriangle, ShoppingBag, Wallet } from "lucide-react";

import { useAuth } from "@/presentation/hooks/use-auth";
import { useDashboard } from "@/presentation/features/dashboard/use-dashboard";
import { Card, CardContent } from "@/presentation/components/ui/card";
import { Skeleton } from "@/presentation/components/ui/skeleton";

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

function StatCard({
  icon: Icon,
  label,
  value,
  tone,
}: {
  icon: typeof Wallet;
  label: string;
  value: string;
  tone?: "warning" | "success";
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 py-4">
        <div
          className={`flex size-9 shrink-0 items-center justify-center rounded-full ${
            tone === "warning"
              ? "bg-warning/15 text-warning"
              : tone === "success"
                ? "bg-success/15 text-success"
                : "bg-primary/10 text-primary"
          }`}
        >
          <Icon className="size-4" />
        </div>
        <div>
          <p className="text-xs text-muted-foreground">{label}</p>
          <p className="font-data text-lg font-medium text-foreground">{value}</p>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardPage() {
  const { profile } = useAuth();
  const { summary, isLoading } = useDashboard();
  const firstName = profile?.fullName.split(" ")[0] ?? "";

  return (
    <div className="flex flex-col gap-6">
      <div>
        <p className="text-sm text-muted-foreground">{getGreeting()}</p>
        <h2 className="font-display text-2xl text-foreground md:text-3xl">
          {firstName ? `Hola, ${firstName}` : "Bienvenido a LA PERFUMERÍA"}
        </h2>
        {profile && (
          <p className="mt-1 text-sm text-muted-foreground">
            {ROLE_LABELS[profile.role]} — Sucursal Principal
          </p>
        )}
      </div>

      {isLoading || !summary ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard icon={ShoppingBag} label="Ventas hoy" value={String(summary.todaySalesCount)} />
            <StatCard
              icon={ShoppingBag}
              label="Ingresos hoy"
              value={`$${summary.todaySalesRevenue.toFixed(2)}`}
            />
            <StatCard
              icon={ShoppingBag}
              label="Ingresos esta semana"
              value={`$${summary.weekSalesRevenue.toFixed(2)}`}
            />
            <StatCard
              icon={Wallet}
              label="Caja"
              value={summary.cashSession ? "Abierta" : "Cerrada"}
              tone={summary.cashSession ? "success" : undefined}
            />
          </div>

          {(summary.lowStockCount !== null || summary.pendingOnlineOrdersCount !== null) && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
              {summary.lowStockCount !== null && (
                <StatCard
                  icon={AlertTriangle}
                  label="Insumos con stock bajo"
                  value={String(summary.lowStockCount)}
                  tone={summary.lowStockCount > 0 ? "warning" : undefined}
                />
              )}
              {summary.pendingOnlineOrdersCount !== null && (
                <StatCard
                  icon={ShoppingBag}
                  label="Pedidos online pendientes"
                  value={String(summary.pendingOnlineOrdersCount)}
                  tone={summary.pendingOnlineOrdersCount > 0 ? "warning" : undefined}
                />
              )}
            </div>
          )}

          {summary.cashSession && (
            <p className="text-sm text-muted-foreground">
              Caja abierta con ${summary.cashSession.openingAmount.toFixed(2)} de apertura
              {summary.cashSession.openedByMe ? " (la abriste vos)" : ""}.
            </p>
          )}
        </>
      )}
    </div>
  );
}
