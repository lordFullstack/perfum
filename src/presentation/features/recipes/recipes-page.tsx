import { FlaskConical } from "lucide-react";

import { usePermission } from "@/presentation/hooks/use-permission";
import { usePerfumes } from "@/presentation/features/perfumes/use-perfumes";
import { useSupplies } from "@/presentation/features/inventory/use-supplies";
import { PerfumeFormDialog } from "@/presentation/features/perfumes/perfume-form-dialog";
import { RecipeEditorDialog } from "@/presentation/features/recipes/recipe-editor-dialog";
import { Badge } from "@/presentation/components/ui/badge";
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
  const canCreatePerfume = usePermission("perfumes.create");
  const canUpdatePerfume = usePermission("perfumes.update");

  const { perfumes, isLoading, createPerfume, updatePerfume } = usePerfumes();
  const { supplies } = useSupplies();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="font-display text-2xl text-foreground">Recetas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            {perfumes.length} perfume{perfumes.length !== 1 && "s"} en el catálogo
          </p>
        </div>
        {canCreatePerfume && <PerfumeFormDialog onSubmit={createPerfume} />}
      </div>

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-14 w-full" />
          ))}
        </div>
      ) : perfumes.length === 0 ? (
        <div className="flex min-h-[30vh] flex-col items-center justify-center gap-2 text-center">
          <FlaskConical className="size-8 text-muted-foreground" />
          <p className="font-display text-lg text-foreground">Todavía no hay perfumes registrados</p>
          <p className="max-w-sm text-sm text-muted-foreground">
            Creá un perfume y después armá su receta con los insumos que lo componen.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Receta</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {perfumes.map((perfume) => (
                <TableRow key={perfume.id}>
                  <TableCell className="font-data text-sm text-muted-foreground">{perfume.code}</TableCell>
                  <TableCell className="text-sm font-medium text-foreground">{perfume.name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">{perfume.category ?? "—"}</TableCell>
                  <TableCell className="font-data text-sm text-foreground">
                    ${perfume.basePrice.toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant={perfume.activeRecipeId ? "success" : "outline"}>
                      {perfume.activeRecipeId ? "Con receta" : "Sin receta"}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <RecipeEditorDialog perfume={perfume} supplies={supplies} />
                      {canUpdatePerfume && (
                        <PerfumeFormDialog
                          perfume={perfume}
                          onSubmit={(input) => updatePerfume(perfume.id, input)}
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
