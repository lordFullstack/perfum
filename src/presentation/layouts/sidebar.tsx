import { NavLink } from "react-router-dom";

import { NAV_GROUPS } from "@/shared/constants/navigation";
import { usePermission } from "@/presentation/hooks/use-permission";
import { BrandMark } from "@/presentation/components/shared/brand-mark";
import { cn } from "@/shared/utils/cn";

function NavGroupList() {
  return (
    <>
      {NAV_GROUPS.map((group) => (
        <div key={group.label} className="mb-6">
          <p className="mb-2 px-3 text-xs font-medium uppercase tracking-wider text-sidebar-foreground/45">
            {group.label}
          </p>
          <ul className="flex flex-col gap-0.5">
            {group.items.map((item) => (
              <NavItemLink key={item.path} item={item} />
            ))}
          </ul>
        </div>
      ))}
    </>
  );
}

function NavItemLink({ item }: { item: (typeof NAV_GROUPS)[number]["items"][number] }) {
  // El hook se llama siempre (regla de hooks); si el ítem no requiere
  // permiso puntual, el código evaluado es un no-op y se ignora abajo.
  const granted = usePermission(item.permission ?? "");
  const allowed = item.permission === null || granted;
  if (!allowed) return null;

  const Icon = item.icon;

  return (
    <li>
      <NavLink
        to={item.path}
        end={item.path === "/"}
        className={({ isActive }) =>
          cn(
            "group relative flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-elegant",
            "text-sidebar-foreground/75 hover:bg-white/5 hover:text-sidebar-foreground",
            isActive && "bg-white/[0.07] text-sidebar-foreground",
          )
        }
      >
        {({ isActive }) => (
          <>
            {/* Firma visual: hilo dorado tipo "menisco" que marca el ítem activo */}
            <span
              className={cn(
                "absolute left-0 top-1/2 h-4 w-[3px] -translate-y-1/2 rounded-full bg-sidebar-primary transition-elegant",
                isActive ? "opacity-100" : "opacity-0",
              )}
            />
            <Icon className="size-4 shrink-0" strokeWidth={1.75} />
            <span className="truncate">{item.label}</span>
            {!item.implemented && (
              <span className="ml-auto rounded-full bg-white/10 px-1.5 py-0.5 text-[10px] font-medium text-sidebar-foreground/50">
                Pronto
              </span>
            )}
          </>
        )}
      </NavLink>
    </li>
  );
}

export function Sidebar() {
  return (
    <aside className="hidden h-dvh w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar md:flex">
      <div className="flex items-center gap-2.5 px-5 py-5">
        <BrandMark className="size-8" />
        <div>
          <p className="font-display text-base leading-none text-sidebar-foreground">AromaPro</p>
          <p className="mt-1 text-[11px] leading-none text-sidebar-foreground/45">Sucursal Principal</p>
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-2">
        <NavGroupList />
      </nav>
    </aside>
  );
}
