import { useLocation } from "react-router-dom";

import { NAV_GROUPS } from "@/shared/constants/navigation";
import { EmptyModule } from "@/presentation/components/shared/empty-module";

export function ModulePlaceholderRoute() {
  const { pathname } = useLocation();

  const item = NAV_GROUPS.flatMap((g) => g.items).find((i) => pathname.startsWith(i.path));

  return <EmptyModule title={item?.label ?? "Módulo"} icon={item?.icon} />;
}
