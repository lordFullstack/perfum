import { usePermission } from "@/presentation/hooks/use-permission";
import { usePerfumes } from "@/presentation/features/recipes/use-perfumes";
import { useSupplies } from "@/presentation/features/inventory/use-supplies";
import { PerfumeFormDialog } from "@/presentation/features/recipes/perfume-form-dialog";
import { RecipeManagerDialog } from "@/presentation/features/recipes/recipe-manager-dialog";
import { Skeleton } from "@/presentation/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/presentation/components/ui/table";

export function RecipesPage() {
  const canCreate = usePermission("perfumes.create");
  const canUpdate = usePermission("perfumes.update");

  const { perfumes, isLoading, createPerfume, updatePerfume, uploadImage } = usePerfumes();
  const { supplies, isLoading: isLoadingSupplies } = useSupplies();

  const isReady = !isLoading && !isLoadingSupplies;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Perfumes y Recetas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {perfumes.length} perfume{perfumes.length !== 1 && "s"} activo
            {perfumes.length !== 1 && "s"}
          </p>
        </div>
        {canCreate && <PerfumeFormDialog onSubmit={createPerfume} />}
      </div>

      {!isReady ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      ) : perfumes.length === 0 ? (
        <div className="flex min-h-[40vh] flex-col items-center justify-center gap-2 text-center">
          <p className="font-display text-lg text-foreground">Todavía no hay perfumes cargados</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Creá el primero y después armá su receta con los insumos que ya cargaste en Inventario.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfume</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio base</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perfumes.map((perfume) => (
                <TableRow key={perfume.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-muted">
                        {perfume.imageUrl ? (
                          <img src={perfume.imageUrl} alt="" className="size-full object-cover" />
                        ) : (
                          <span className="text-[10px] text-muted-foreground">Sin foto</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">{perfume.name}</p>
                        <p className="font-data text-xs text-muted-foreground">{perfume.code}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {perfume.category ?? "—"}
                  </TableCell>
                  <TableCell className="font-data text-sm">${perfume.basePrice.toFixed(2)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <RecipeManagerDialog perfume={perfume} supplies={supplies} />
                      {canUpdate && (
                        <PerfumeFormDialog
                          perfume={perfume}
                          onSubmit={(input) => updatePerfume(perfume.id, input)}
                          onUploadImage={uploadImage}
                        />
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
