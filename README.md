# AromaPro

PWA de administración integral para una perfumería que fabrica perfumes por encargo.
El inventario es de **insumos** (no de perfumes terminados); cada perfume se produce
a partir de una **receta** que descuenta insumos automáticamente al fabricarse.

## Stack

- **Frontend**: React 19 + Vite + TypeScript + Tailwind CSS v4 + shadcn/ui (componentes adaptados a mano)
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
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
(ver `src/presentation/hooks/use-auth.tsx`, que instancia `SupabaseAuthRepository`
y se lo pasa a los casos de uso de dominio).

## Decisión: sucursal única, lista para escalar

El esquema de base de datos es multi-sucursal desde el día 1 (toda tabla de
negocio tiene `branch_id`), pero la aplicación opera hoy con una única sucursal
fija (`Sucursal Principal`, seed en `supabase/seed.sql`). No hay selector de
sucursal en la UI. Para escalar a múltiples sucursales en el futuro:

1. Reintroducir la tabla `user_branches` (acceso multi-sucursal por usuario).
2. Agregar el selector de sucursal en el `Topbar`.
3. Cambiar la resolución de `branch_id` en `use-auth.tsx` de fija a seleccionada.

Ninguna tabla de negocio necesita migrarse para ese cambio.

## Roles y permisos

Dos roles predefinidos (`admin`, `vendedor`), con permisos granulares por
módulo y acción (`inventory.read_cost`, `sales.read_own`, etc.). Ver la matriz
completa y su seed en `supabase/seed.sql`. El sistema está preparado para
agregar roles adicionales sin cambios de esquema.

## Sistema de diseño

Paleta y tipografía documentadas como tokens CSS en `src/index.css` (Tailwind v4,
sin `tailwind.config.js`). Resumen:

- **Tipografía**: Fraunces (display/títulos), Inter (UI), JetBrains Mono (datos: SKU, montos, timestamps)
- **Color**: tinta cálida + oro (marca) + burdeos (secundario) + salvia (éxito), en modo claro y oscuro
- **Firma visual**: indicador de navegación activa estilo "menisco líquido" (ver `sidebar.tsx`)

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
npx supabase db push        # aplica supabase/migrations/*.sql
npx supabase db seed        # aplica supabase/seed.sql (sucursal, roles, permisos)
```

Luego crea el primer usuario administrador: ver instrucciones al final de
`supabase/seed.sql`.

## Estado del proyecto — Fase 1 ✅ y Fase 2 ✅

**Fase 1** — Base del sistema (setup, diseño, PWA, auth) — ver detalle abajo.

**Fase 2** — Roles y Permisos:
- Pantalla `/usuarios` (solo visible/accesible con permiso `users.read`, hoy solo `admin`)
- Crear usuarios: nombre, correo, teléfono, rol y contraseña temporal generada
  (o editable) — implementado con una **Supabase Edge Function**
  (`supabase/functions/admin-create-user`), porque crear usuarios de Auth
  requiere la `service_role key`, que **nunca** debe tocar el navegador
- Cambiar el rol de un usuario y activar/desactivar su cuenta, en línea en la tabla
- Reglas de negocio en el dominio (no en la UI): un admin no puede
  desactivarse a sí mismo, no puede cambiarse el rol a sí mismo, y no se
  puede desactivar al último administrador activo de la sucursal
- Recuperación de contraseña ("¿Olvidaste tu contraseña?") en el login,
  vía `supabase.auth.resetPasswordForEmail`

Pendiente (fases siguientes, ver plan del proyecto):
- Módulos de negocio (Inventario, Recetas, Producción, Ventas, Caja, Clientes, Compras, Proveedores, Reportes, Auditoría, Configuración, Catálogo online)
- Sincronización offline real vía IndexedDB (`infrastructure/offline/`, hoy vacío)
- Code-splitting por ruta (el bundle actual es un único chunk; se resuelve naturalmente al agregar `React.lazy` por módulo en fases siguientes)
- Flujo de "forzar cambio de contraseña en el primer login" (hoy el admin comunica la temporal manualmente)

## Estado del proyecto — detalle Fase 1

Completado:
- Setup Vite + TS + Tailwind v4 + estructura Clean Architecture
- Sistema de diseño (tokens claro/oscuro, tipografía, íconos PWA)
- PWA instalable con caché offline básico (API en `NetworkFirst`, imágenes en `CacheFirst`)
- Autenticación completa con Supabase Auth (dominio + infraestructura + presentación)
- Roles y permisos resueltos en el login, aplicados en navegación (`usePermission`)
- Layout autenticado: Sidebar (desktop) + barra inferior con drawer (móvil) + Topbar
- Modo claro/oscuro con `next-themes`
- Página de Login y Dashboard de bienvenida
- Políticas RLS para sucursal, roles, permisos y perfiles
- Rutas protegidas + placeholders elegantes para módulos de fases futuras

Pendiente (fases siguientes, ver plan del proyecto):
- Módulos de negocio (Inventario, Recetas, Producción, Ventas, Caja, Clientes, Compras, Proveedores, Reportes, Auditoría, Configuración, Catálogo online)
- Sincronización offline real vía IndexedDB (`infrastructure/offline/`, hoy vacío)
- Code-splitting por ruta (el bundle actual es un único chunk ~622 kB; se resuelve naturalmente al agregar `React.lazy` por módulo en fases siguientes)

## Notas técnicas

- **shadcn/ui**: el registro (`ui.shadcn.com`) no es accesible desde este
  entorno de desarrollo, así que los componentes en `presentation/components/ui/`
  fueron escritos a mano siguiendo el estándar de shadcn (estilo `new-york`),
  con las primitivas de Radix UI instaladas directamente. Son 100% compatibles
  con el CLI de shadcn si se usa en otro entorno con acceso a internet completo.
- **`database.types.ts`**: escrito a mano reflejando el esquema SQL actual.
  Regenerar con `npx supabase gen types typescript` una vez exista el proyecto
  Supabase real, y en cada fase que agregue tablas nuevas.
- **react-router-dom**: fijado en `7.18.1`. La única vulnerabilidad reportada
  por `npm audit` en este rango es específica del modo RSC/framework de React
  Router, que esta app no usa (SPA cliente puro con `BrowserRouter`).
