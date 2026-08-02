import type { LucideIcon } from "lucide-react";
import { Hourglass } from "lucide-react";

export function EmptyModule({
  title,
  icon: Icon = Hourglass,
}: {
  title: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
      <div className="flex size-14 items-center justify-center rounded-full bg-muted">
        <Icon className="size-6 text-muted-foreground" strokeWidth={1.5} />
      </div>
      <div>
        <h2 className="font-display text-xl text-foreground">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-muted-foreground">
          Este módulo se construye en una próxima fase del proyecto. El acceso y los
          permisos ya están listos — falta la pantalla.
        </p>
      </div>
    </div>
  );
}
