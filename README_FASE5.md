# AromaPro — Fase 5: Perfumes y Recetas

## Estado

✅ Migración `0005_recipes.sql` **aplicada y verificada en producción**
(proyecto `cpffnhucemcmiglbqujw`): tablas `perfumes`, `recipes`, `recipe_items`;
RPCs `create_recipe`, `duplicate_recipe`, `calculate_recipe_cost`,
`check_recipe_feasibility`; permisos `perfumes.read/create/update` seedeados
(los de `recipes.*` ya existían desde el seed inicial del roadmap).

✅ Código de dominio, infraestructura, aplicación y presentación completo.

⏳ Wiring en `App.tsx` y sidebar: pegar los bloques de abajo (no se modificó tu
`App.tsx` real porque no está en este paquete).

## Correcciones importantes vs. el borrador inicial

Al conectar con Supabase y auditar el esquema real antes de aplicar la
migración, encontré diferencias con lo que había asumido. Todo el código en
este zip ya está corregido:

| Asumido inicialmente | Real / aplicado |
|---|---|
| `recipes.write` | `recipes.create` y `recipes.update` (permisos separados, ya seedeados) |
| `RecipeItem.unit: string` libre | `RecipeItem.unitId: string` → FK a `units_of_measure(id)`, igual que `supplies.unit_id` |
| `supplies.avg_cost` | `supplies.average_cost` |
| `current_user_branch_id()` | `current_user_branch()` |
| `created_by → auth.users(id)` | `created_by → profiles(id)` |
| Permisos `perfumes.*` a seedear | Solo faltaban `perfumes.*`; `recipes.*` ya estaba en el seed inicial |

## Wiring en `App.tsx`

```tsx
// Imports adicionales
import { PerfumesProvider } from './application/context/PerfumesContext';
import { RecipesProvider } from './application/context/RecipesContext';
import { PerfumesPage } from './presentation/pages/PerfumesPage';
import { RecipeBuilderPage } from './presentation/pages/RecipeBuilderPage';

// Envolver el árbol de providers existente:
<PerfumesProvider>
  <RecipesProvider>
    {/* ...resto de providers y <Routes> existentes */}
  </RecipesProvider>
</PerfumesProvider>
```

Rutas nuevas dentro de `<Routes>`:

```tsx
<Route
  path="/perfumes"
  element={
    <ProtectedRoute permission="perfumes.read">
      <PerfumesPage />
    </ProtectedRoute>
  }
/>
<Route
  path="/recetas/:perfumeId"
  element={
    <ProtectedRoute permission="recipes.read">
      <RecipeBuilderPage />
    </ProtectedRoute>
  }
/>
```

Ítem nuevo en el sidebar:

```tsx
{
  label: 'Perfumes',
  icon: FlaskConical, // de lucide-react
  path: '/perfumes',
  permission: 'perfumes.read',
}
```

## Dependencias de código que este paquete asume

Estos archivos **no están incluidos** porque ya existen de fases anteriores;
el código de Fase 5 los importa tal cual:

- `src/infrastructure/supabase/client.ts` — cliente Supabase inicializado
- `src/application/context/AuthContext.tsx` — expone `useAuth()` con `branchId`
  y `usePermissions()` con `hasPermission(code: string): boolean`
- `src/application/context/SuppliesContext.tsx` — expone `useSupplies()` con
  `supplies: Supply[]`
- `src/domain/entities/Supply.ts` — **debe tener** `unitId: string` y
  `unitAbbreviation: string` (o los nombres que uses; si difieren, avisame
  para ajustar `IngredientSelector.tsx` y `RecipeBuilderPage.tsx`) y
  `averageCost: number`

## Pendiente antes de probar

1. **Bucket de Storage** `perfume-images` — crealo en el dashboard de
   Supabase (Storage → New bucket, público para lectura) o decime y lo creo
   yo con el conector.
2. Confirmar los nombres reales de `AuthContext`/`SuppliesContext`/`Supply`
   listados arriba.

## Checklist de QA sugerido

- [ ] Crear un perfume nuevo con imagen
- [ ] Crear receta v1 con 3+ insumos, guardar
- [ ] Verificar que "Costo de receta" solo se vea con `recipes.read_cost`
- [ ] Editar receta (nueva versión v2), confirmar que v1 quede `is_active=false`
- [ ] Probar "Verificar disponibilidad" con cantidad que exceda el stock
- [ ] Verificar que un usuario `vendedor` no vea costos ni botón "Nuevo perfume"
