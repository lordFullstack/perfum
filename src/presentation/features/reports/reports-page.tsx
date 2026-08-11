import { usePermission } from "@/presentation/hooks/use-permission";
import { useSalesReport } from "@/presentation/features/reports/use-sales-report";
import { Card, CardContent, CardHeader, CardTitle } from "@/presentation/components/ui/card";
import { Input } from "@/presentation/components/ui/input";
import { Label } from "@/presentation/components/ui/label";
import { Skeleton } from "@/presentation/components/ui/skeleton";

function StatCard({ label, value, tone }: { label: string; value: string; tone?: "success" | "destructive" }) {
  return (
    <Card>
      <CardContent className="py-4">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p
          className={`font-data mt-1 text-xl font-medium ${
            tone === "success" ? "text-success" : tone === "destructive" ? "text-destructive" : "text-foreground"
          }`}
        >
          {value}
        </p>
      </CardContent>
    </Card>
  );
}

export function ReportsPage() {
  const hasFinancial = usePermission("reports.read_financial");
  const { report, isLoading, startDate, endDate, setStartDate, setEndDate } = useSalesReport();

  const maxDayRevenue = report ? Math.max(1, ...report.salesByDay.map((d) => d.revenue)) : 1;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-2xl text-foreground">Reportes</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          {hasFinancial ? "Vista financiera completa del negocio" : "Tus ventas en el período"}
        </p>
      </div>

      <div className="flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="startDate">Desde</Label>
          <Input
            id="startDate"
            type="date"
            value={startDate}
            max={endDate}
            onChange={(e) => setStartDate(e.target.value)}
            className="w-40"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="endDate">Hasta</Label>
          <Input
            id="endDate"
            type="date"
            value={endDate}
            min={startDate}
            onChange={(e) => setEndDate(e.target.value)}
            className="w-40"
          />
        </div>
      </div>

      {isLoading || !report ? (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <StatCard label="Ventas" value={String(report.salesCount)} />
            <StatCard label="Ingresos por ventas" value={`$${report.salesRevenue.toFixed(2)}`} />
            {hasFinancial && report.productionCost !== null && (
              <StatCard label="Costo de producción" value={`$${report.productionCost.toFixed(2)}`} />
            )}
            {hasFinancial && report.grossMargin !== null && (
              <StatCard
                label="Margen bruto estimado"
                value={`$${report.grossMargin.toFixed(2)}`}
                tone={report.grossMargin >= 0 ? "success" : "destructive"}
              />
            )}
          </div>

          {hasFinancial && (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {report.purchasesCost !== null && (
                <StatCard label="Compras de insumos" value={`$${report.purchasesCost.toFixed(2)}`} />
              )}
              {report.cashIncome !== null && (
                <StatCard label="Ingresos de caja" value={`$${report.cashIncome.toFixed(2)}`} tone="success" />
              )}
              {report.cashExpense !== null && (
                <StatCard
                  label="Egresos de caja"
                  value={`$${Math.abs(report.cashExpense).toFixed(2)}`}
                  tone="destructive"
                />
              )}
            </div>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Ventas por día</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pb-6">
              {report.salesByDay.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin ventas en este período.</p>
              ) : (
                report.salesByDay.map((day) => (
                  <div key={day.day} className="flex items-center gap-3">
                    <span className="w-24 shrink-0 font-data text-xs text-muted-foreground">
                      {day.day}
                    </span>
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${(day.revenue / maxDayRevenue) * 100}%` }}
                      />
                    </div>
                    <span className="w-20 shrink-0 text-right font-data text-xs text-foreground">
                      ${day.revenue.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Perfumes más vendidos</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 pb-6">
              {report.topPerfumes.length === 0 ? (
                <p className="text-sm text-muted-foreground">Sin ventas en este período.</p>
              ) : (
                report.topPerfumes.map((p, i) => (
                  <div key={p.perfumeId} className="flex items-center justify-between text-sm">
                    <span className="text-foreground">
                      <span className="font-data text-muted-foreground">{i + 1}.</span> {p.name}
                    </span>
                    <span className="font-data text-muted-foreground">
                      {p.quantity} u — ${p.revenue.toFixed(2)}
                    </span>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
