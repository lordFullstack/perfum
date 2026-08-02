import { Outlet, useLocation } from "react-router-dom";

import { NAV_GROUPS } from "@/shared/constants/navigation";
import { Sidebar } from "@/presentation/layouts/sidebar";
import { Topbar } from "@/presentation/layouts/topbar";
import { MobileBottomNav } from "@/presentation/layouts/mobile-bottom-nav";

function getCurrentTitle(pathname: string): string {
  for (const group of NAV_GROUPS) {
    const match = group.items.find((item) =>
      item.path === "/" ? pathname === "/" : pathname.startsWith(item.path),
    );
    if (match) return match.label;
  }
  return "AromaPro";
}

export function AppLayout() {
  const location = useLocation();

  return (
    <div className="flex h-dvh w-full overflow-hidden bg-background">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <Topbar title={getCurrentTitle(location.pathname)} />
        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          <div className="mx-auto w-full max-w-6xl px-4 py-6 md:px-8 md:py-8">
            <Outlet />
          </div>
        </main>
      </div>
      <MobileBottomNav />
    </div>
  );
}
