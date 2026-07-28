import { BrandMark } from "@/presentation/components/shared/brand-mark";

export function FullScreenLoader() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-background">
      <BrandMark className="h-10 w-10 animate-pulse" />
      <p className="text-sm text-muted-foreground">Cargando AromaPro…</p>
    </div>
  );
}
