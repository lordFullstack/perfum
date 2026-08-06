import { BrowserRouter, Routes, Route } from "react-router-dom";

import { AuthProvider } from "@/presentation/hooks/use-auth";
import { UserManagementProvider } from "@/presentation/hooks/use-user-management";
import { ThemeProvider } from "@/presentation/hooks/theme-provider";
import { ProtectedRoute } from "@/presentation/routes/protected-route";
import { RequirePermission } from "@/presentation/routes/require-permission";
import { ModulePlaceholderRoute } from "@/presentation/routes/module-placeholder-route";
import { AppLayout } from "@/presentation/layouts/app-layout";
import { LoginPage } from "@/presentation/features/auth/login-page";
import { DashboardPage } from "@/presentation/features/dashboard/dashboard-page";
import { UsersPage } from "@/presentation/features/users/users-page";
import { Toaster } from "@/presentation/components/ui/sonner";

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        <AuthProvider>
          <UserManagementProvider>
            <Routes>
              <Route path="/login" element={<LoginPage />} />

              <Route element={<ProtectedRoute />}>
                <Route element={<AppLayout />}>
                  <Route path="/" element={<DashboardPage />} />
                  <Route path="/ventas" element={<ModulePlaceholderRoute />} />
                  <Route path="/produccion" element={<ModulePlaceholderRoute />} />
                  <Route path="/caja" element={<ModulePlaceholderRoute />} />
                  <Route path="/clientes" element={<ModulePlaceholderRoute />} />
                  <Route path="/insumos" element={<ModulePlaceholderRoute />} />
                  <Route path="/recetas" element={<ModulePlaceholderRoute />} />
                  <Route path="/compras" element={<ModulePlaceholderRoute />} />
                  <Route path="/proveedores" element={<ModulePlaceholderRoute />} />
                  <Route path="/reportes" element={<ModulePlaceholderRoute />} />
                  <Route path="/catalogo" element={<ModulePlaceholderRoute />} />
                  <Route path="/auditoria" element={<ModulePlaceholderRoute />} />
                  <Route path="/configuracion" element={<ModulePlaceholderRoute />} />

                  <Route element={<RequirePermission permission="users.read" />}>
                    <Route path="/usuarios" element={<UsersPage />} />
                  </Route>

                  <Route path="*" element={<ModulePlaceholderRoute />} />
                </Route>
              </Route>
            </Routes>

            <Toaster position="top-right" richColors closeButton />
          </UserManagementProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
}
