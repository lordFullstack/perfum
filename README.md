# AromaPro

PWA de administración integral para una perfumería que fabrica perfumes por encargo.
El inventario es de **insumos** (no de perfumes terminados); cada perfume se produce
a partir de una **receta** que descuenta insumos automáticamente al fabricarse.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui (componentes adaptados a mano)
- **Backend**: Supabase (PostgreSQL, Auth, Storage, Edge Functions)
- **PWA**: `vite-plugin-pwa` (Workbox), instalable en Android, iPhone y PC

## Arquitectura

Clean Architecture en 4 capas, de adentro hacia afuera:

```
src/
├── domain/            # Entidades y casos de uso — sin dependencias externas
│   ├── entities/
│   ├── repositories/  # Interfaces (contratos), no implementaciones
│   └── use-cases/
├── application/        # Orquestación de casos de uso complejos (fases futuras)
├── infrastructure/     # Implementaciones concretas: Supabase, IndexedDB
│   ├── supabase/
│   └── offline/
├── presentation/        # React: componentes, layouts, hooks, rutas
│   ├── components/ui/   # Primitivas shadcn adaptadas al sistema de diseño
│   ├── components/shared/
│   ├── features/        # Un subdirectorio por módulo de negocio
│   ├── layouts/
│   ├── hooks/
│   └── routes/
└── shared/              # Tipos, utilidades y constantes transversales
```

**Regla de dependencia**: `domain` no importa nada de `infrastructure` ni de
`presentation`. La inyección de dependencias ocurre en la capa de presentación
vía contextos (`use-auth.tsx`, `use-supply-management.tsx`, etc.), que instancian
el repositorio Supabase concreto y se lo pasan a los casos de uso de dominio.

**Escrituras que afectan stock son siempre atómicas vía RPC de Postgres**
(`adjust_supply_stock`, `create_purchase`, `cancel_purchase`) — nunca varios
pasos separados desde el navegador. Esto es crítico: es el mismo patrón que
va a usar Producción (Fase 6) para descontar insumos según receta.

**RLS basada en permisos, no en roles hardcodeados**: la función
`current_user_has_permission(code)` (creada en la Fase 3) se reutiliza en las
políticas de todos los módulos — agregar un rol nuevo en el futuro no requiere
tocar SQL de políticas, solo la tabla `role_permissions`.

## Decisión: sucursal única, lista para escalar

El esquema de base de datos es multi-sucursal desde el día 1 (toda tabla de
negocio tiene `branch_id`), pero la aplicación opera hoy con una única sucursal
fija (`Sucursal Principal`, seed en `supabase/seed.sql`). No hay selector de
sucursal en la UI. Para escalar a múltiples sucursales en el futuro:

1. Reintroducir la tabla `user_branches` (acceso multi-sucursal por usuario).
2. Agregar el selector de sucursal en el `Topbar`.
3. Cambiar la resolución de `branch_id` de fija a seleccionada.

Ninguna tabla de negocio necesita migrarse para ese cambio.

## Roles y permisos

Dos roles predefinidos (`admin`, `vendedor`), con permisos granulares por
módulo y acción (`inventory.read_cost`, `sales.read_own`, etc.). Ver la matriz
completa y su seed en `supabase/seed.sql`. Gestión desde la UI en `/usuarios`.

## Sistema de diseño

Paleta y tipografía documentadas como tokens CSS en `src/index.css` (Tailwind v4,
sin `tailwind.config.js`).

- **Tipografía**: Fraunces (display/títulos), Inter (UI), JetBrains Mono (datos: SKU, montos, timestamps)
- **Color**: tinta cálida + oro (marca) + burdeos (secundario) + salvia (éxito), en modo claro y oscuro
- **Firma visual**: indicador de nivel de stock estilo "probeta graduada" (`stock-level-gauge.tsx`) e indicador de navegación activa estilo "menisco líquido" (`sidebar.tsx`)

## Setup

```bash
npm install
cp .env.example .env
# completar VITE_SUPABASE_URL y VITE_SUPABASE_ANON_KEY con los datos
# de tu proyecto Supabase (Project Settings > API)
npm run dev
```

### Base de datos

```bash
npx supabase link --project-ref <tu-project-ref>
npx supabase db push        # aplica supabase/migrations/*.sql en orden
npx supabase db seed        # aplica supabase/seed.sql (sucursal, roles, permisos)
```

Luego aplicar manualmente `supabase/seed_phase3.sql` (categorías de insumos y
unidades de medida — no forma parte del seed principal porque se agregó en una
fase posterior). Crear el primer usuario administrador: ver instrucciones al
final de `supabase/seed.sql`.

### Edge Functions

```bash
npx supabase functions deploy admin-create-user
```

## Estado del proyecto

**Fase 1 — Base del sistema** ✅
- Setup Vite + TS + Tailwind v4, Clean Architecture, sistema de diseño, PWA instalable con caché offline básico
- Autenticación completa con Supabase Auth (dominio + infraestructura + presentación), roles y permisos resueltos en el login
- Layout autenticado (Sidebar + Topbar + nav móvil), modo claro/oscuro, rutas protegidas

**Fase 2 — Roles y Permisos** ✅
- Pantalla `/usuarios`: crear usuarios (vía Edge Function `admin-create-user`, la única pieza del sistema con `service_role key`), cambiar rol, activar/desactivar
- Reglas de negocio: un admin no puede desactivarse ni cambiarse el rol a sí mismo, ni desactivar al último admin activo de la sucursal
- Recuperación de contraseña en el login

**Fase 3 — Inventario de Insumos** ✅
- Pantalla `/insumos`: alta/edición, ajuste de stock (entrada/salida) atómico vía RPC `adjust_supply_stock`, costo promedio ponderado, indicador visual de nivel de stock
- Categorías (12) y unidades de medida (5) precargadas por seed
- Creada `current_user_has_permission()`, reutilizada por el resto de los módulos

**Fase 4 — Proveedores y Compras** ✅
- Pantalla `/proveedores`: alta/edición/desactivación
- Pantalla `/compras`: registrar compra con múltiples ítems (insumo, cantidad, costo, lote/vencimiento opcionales) vía RPC `create_purchase` (todo o nada: cabecera + ítems + stock en una transacción), cancelar compra vía `cancel_purchase` (revierte stock, falla si ya no alcanza)
- Movimientos de stock de una compra quedan trazados a ella (`stock_movements.reference_type = 'purchase'`)

**Fase 5 — Recetas** ✅
- Perfumes: alta/edición, imagen (bucket público `perfume-images`, pensado para el futuro Catálogo Online de la Fase 10)
- Recetas versionadas por perfume: crear una nueva versión (vía RPC `create_recipe`) desactiva automáticamente la anterior sin borrarla — queda como historial; un índice único en la base garantiza que solo haya una versión activa por perfume
- Costo total de receta calculado al vuelo (`calculate_recipe_cost`, nunca guardado — siempre refleja el costo promedio actual de los insumos)
- Verificación de factibilidad (`check_recipe_feasibility`): antes de producir N unidades, indica si el stock alcanza y qué falta si no
- **Nota de proceso**: el esquema de esta fase se había aplicado en una sesión de chat previa que perdió el contexto antes de documentarlo. Se auditó columna por columna, política por política y función por función contra la base real antes de continuar, y se corrigieron 3 gaps menores encontrados (4 funciones quedaban ejecutables por `anon` sin necesidad, faltaba el trigger de `updated_at` en `perfumes`, la política de update de `recipes` no tenía `with_check`) — ver `0007_recipes_security_fixes.sql`.

**Decisiones de alcance tomadas:**
- No hay tabla `supply_batches` con seguimiento FIFO de remanente por lote — el lote/vencimiento se guarda como dato informativo en `purchase_items`. Se agrega en una fase dedicada si se necesita descuento lote por lote.
- No hay pantalla de historial de movimientos de stock todavía — llega con el Reporte de "Movimientos" (Fase 11).

**Pendiente:**
- Módulos de negocio: Producción, Ventas, Caja, Clientes, Reportes, Auditoría, Configuración, Catálogo online
- Sincronización offline real vía IndexedDB (`infrastructure/offline/`, hoy vacío)
- Code-splitting por ruta (el bundle actual es un único chunk; se resuelve con `React.lazy` por módulo)
- Flujo de "forzar cambio de contraseña en el primer login"

## Notas técnicas

- **shadcn/ui**: el registro (`ui.shadcn.com`) no es accesible desde el entorno
  de desarrollo original de este proyecto, así que los componentes en
  `presentation/components/ui/` fueron escritos a mano siguiendo el estándar
  de shadcn (estilo `new-york`), con las primitivas de Radix UI instaladas
  directamente. Son 100% compatibles con el CLI de shadcn si se usa en otro
  entorno con acceso a internet completo.
- **`database.types.ts`**: escrito a mano reflejando el esquema SQL actual
  (incluye el campo `Relationships: []` que exige el tipado interno de
  `@supabase/postgrest-js`, aunque no se usen). Regenerar con
  `npx supabase gen types typescript` cuando sea posible, y mantenerlo
  actualizado en cada fase que agregue tablas o RPCs nuevas.
- **react-router-dom**: fijado en `7.18.1`. La única vulnerabilidad reportada
  por `npm audit` en este rango es específica del modo RSC/framework de React
  Router, que esta app no usa (SPA cliente puro con `BrowserRouter`).
- **Seguridad de RPCs**: todas las funciones `SECURITY DEFINER` (`adjust_supply_stock`,
  `create_purchase`, `cancel_purchase`, `current_user_*`) verifican el permiso
  correspondiente *dentro* de la función antes de hacer nada, porque
  `SECURITY DEFINER` evita las políticas RLS — el chequeo de permiso no es opcional.
