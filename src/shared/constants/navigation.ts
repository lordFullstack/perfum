import type { LucideIcon } from "lucide-react";
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  Boxes,
  Truck,
  ShoppingBag,
  FlaskConical,
  Factory,
  Wallet,
  BarChart3,
  ShieldCheck,
  Settings,
  Store,
} from "lucide-react";

export interface NavItem {
  label: string;
  path: string;
  icon: LucideIcon;
  /** Módulos aún no implementados muestran un estado "Próximamente" en vez de 404. */
  implemented: boolean;
  /** Permiso requerido para ver el ítem. `null` = visible para cualquier sesión activa. */
  permission: string | null;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: "Operación",
    items: [
      { label: "Dashboard", path: "/", icon: LayoutDashboard, implemented: true, permission: null },
      { label: "Ventas", path: "/ventas", icon: ShoppingCart, implemented: false, permission: "sales.read_own" },
      { label: "Producción", path: "/produccion", icon: Factory, implemented: false, permission: "production.read_own" },
      { label: "Caja", path: "/caja", icon: Wallet, implemented: false, permission: "cash.open_own" },
      { label: "Clientes", path: "/clientes", icon: Users, implemented: false, permission: "customers.read" },
    ],
  },
  {
    label: "Inventario",
    items: [
      { label: "Insumos", path: "/insumos", icon: Boxes, implemented: false, permission: "inventory.read" },
      { label: "Recetas", path: "/recetas", icon: FlaskConical, implemented: false, permission: "recipes.read" },
      { label: "Compras", path: "/compras", icon: ShoppingBag, implemented: false, permission: "purchases.read" },
      { label: "Proveedores", path: "/proveedores", icon: Truck, implemented: false, permission: "suppliers.read" },
    ],
  },
  {
    label: "Análisis",
    items: [
      { label: "Reportes", path: "/reportes", icon: BarChart3, implemented: false, permission: "reports.read_own_sales" },
      { label: "Catálogo online", path: "/catalogo", icon: Store, implemented: false, permission: null },
    ],
  },
  {
    label: "Sistema",
    items: [
      { label: "Auditoría", path: "/auditoria", icon: ShieldCheck, implemented: false, permission: "audit.read" },
      { label: "Configuración", path: "/configuracion", icon: Settings, implemented: false, permission: "settings.manage" },
    ],
  },
];
