import { useState } from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ShoppingCart, Factory, Menu } from "lucide-react";

import { NAV_GROUPS } from "@/shared/constants/navigation";
import { usePermission } from "@/presentation/hooks/use-permission";
import { BrandMark } from "@/presentation/components/shared/brand-mark";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/presentation/components/ui/sheet";
import { cn } from "@/shared/utils/cn";

const QUICK_ITEMS = [
  { label: "Dashboard", path: "/", icon: LayoutDashboard },
  { label: "Ventas", path: "/ventas", icon: ShoppingCart },
  { label: "Producción", path: "/produccion", icon: Factory },
];

export function MobileBottomNav() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex items-center justify-around border-t border-border bg-surface/95 px-2 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      {QUICK_ITEMS.map((item) => (
        <NavLink
          key={item.path}
          to={item.path}
          end={item.path === "/"}
          className={({ isActive }) =>
            cn(
              "flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] transition-elegant",
              isActive ? "text-primary" : "text-muted-foreground",
            )
          }
        >
          <item.icon className="size-5" strokeWidth={1.75} />
          {item.label}
        </NavLink>
      ))}

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="flex flex-1 flex-col items-center gap-1 py-2.5 text-[11px] text-muted-foreground transition-elegant"
            aria-label="Abrir menú completo"
          >
            <Menu className="size-5" strokeWidth={1.75} />
            Menú
          </button>
        </SheetTrigger>
        <SheetContent side="left">
          <div className="flex items-center gap-2.5 px-5 pt-5">
            <BrandMark className="size-8" />
            <SheetTitle>AromaPro</SheetTitle>
          </div>
          <nav className="flex-1 overflow-y-auto px-3 py-2">
            {NAV_GROUPS.map((group) => (
              <MobileNavGroup key={group.label} group={group} onNavigate={() => setOpen(false)} />
            ))}
          </nav>
        </SheetContent>
      </Sheet>
    </nav>
  );
}

function MobileNavGroup({
  group,
  onNavigate,
}: {
  group: (typeof NAV_GROUPS)[number];
  onNavigate: () => void;
}) {
  return (
    <div className="mb-6">
      <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/45">
        {group.label}
      </p>
      <ul className="flex flex-col gap-0.5">
        {group.items.map((item) => (
          <MobileNavItem key={item.path} item={item} onNavigate={onNavigate} />
        ))}
      </ul>
    </div>
  );
}

function MobileNavItem({
  item,
  onNavigate,
}: {
  item: (typeof NAV_GROUPS)[number]["items"][number];
  onNavigate: () => void;
}) {
  // El hook se llama siempre (regla de hooks); si el ítem no requiere
  // permiso puntual, el código evaluado es un no-op y se ignora abajo.
  const granted = usePermission(item.permission ?? "");
  const allowed = item.permission === null || granted;
  if (!allowed) return null;

  return (
    <li>
      <NavLink
        to={item.path}
        end={item.path === "/"}
        onClick={onNavigate}
        className={({ isActive }) =>
          cn(
            "flex items-center gap-3 rounded-md px-3 py-2.5 text-sm text-sidebar-foreground/75 transition-elegant hover:bg-white/5",
            isActive && "bg-white/[0.07] text-sidebar-foreground",
          )
        }
      >
        <item.icon className="size-4 shrink-0" strokeWidth={1.75} />
        <span className="truncate">{item.label}</span>
        {!item.implemented && (
          <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/50">
            Pronto
          </span>
        )}
      </NavLink>
    </li>
  );
}
