---
tipo: ARCHITECTURE
nivel: L1
---

# Arquitectura

Monolito modular NestJS + Next.js 14 + SQL Server Express. Tres procesos, sin cola de
mensajes, sin caché, sin servicios externos.

```
┌──────────────────────────────┐
│  Next.js 14 · puerto 3000    │   56 pantallas, todas 'use client'
│  App Router · React 18       │   sin store global, sin librería de UI
└──────────────┬───────────────┘
               │  apiFetch('/ruta')  →  Bearer token, reintento en 401
               ▼
┌──────────────────────────────┐
│  NestJS 10 · puerto 3001     │   prefijo global /api/v1 · Swagger en /api/docs
│  ┌────────────────────────┐  │
│  │ JwtAuthGuard           │  │   valida el token
│  │ PermissionsGuard       │  │   consulta permisos efectivos en cada request
│  │ ValidationPipe         │  │   whitelist + forbidNonWhitelisted
│  ├────────────────────────┤  │
│  │ 55 Controllers (API)   │  │   declaran @RequirePermission
│  │ 56 Services            │  │   toda la lógica de negocio
│  │ 75 Entities (TypeORM)  │  │   sin relaciones ORM: FKs como columnas planas
│  └────────────────────────┘  │
└──────────────┬───────────────┘
               │  TypeORM 0.3 · mssql · pool max 10 / idle 15s · synchronize: FALSE
               ▼
┌──────────────────────────────┐
│  SQL Server 2019 Express     │   12 esquemas · 88 tablas · 0 procedures
│  instancia SQLEXPRESS        │   constraints CHECK/UNIQUE como última defensa
└──────────────────────────────┘
```

## El recorrido de un request

1. La pantalla llama `apiFetch('/guardias/grupos')` — **sin** `/api/v1`, el helper lo
   agrega.
2. `JwtAuthGuard` valida el Bearer token. Si expiró → 401.
3. El cliente intercepta ese 401, llama `/auth/refresh` y **reintenta una vez** de forma
   transparente.
4. `PermissionsGuard` llama al Policy Engine, que calcula los permisos efectivos **desde
   la base, en cada request, sin caché**, y los compara con el `@RequirePermission` de la
   ruta.
5. `ValidationPipe` valida el DTO. Un campo no declarado **hace fallar** la petición con
   400 (`forbidNonWhitelisted`), no se ignora.
6. El controlador delega en el servicio. El servicio usa repositorios TypeORM, y puede
   aplicar reglas de negocio configurables (por ejemplo `ElegibilidadService` al asignar
   personal a una guardia).
7. La respuesta vuelve como JSON; la pantalla llama `cargar()` de nuevo tras cada
   mutación.

Detalle en [[workflow--login-y-sesion]] y [[rule--permisos-efectivos]].

## Capas del backend

```
backend/src/
├── main.ts                    prefijo /api/v1, helmet, CORS, body 8mb, Swagger
├── app.module.ts              cablea los 11 módulos
├── core/database/             data-source-options.ts (pool, naming, synchronize:false)
├── shared/entities/           75 entidades + index.ts (el DataSource carga Object.values)
└── modules/
    ├── auth/                  login, JWT, refresh, guards, strategies
    ├── seguridad/             usuarios, roles, permisos, sesiones, auditoría,
    │                          policy-engine.service.ts, PermissionsGuard
    ├── personal/              bomberos, condiciones, especialidades, foja de servicio
    ├── organizacion/          14 controladores de catálogos institucionales
    ├── operaciones/           asistencia: eventos, marcaciones, importaciones, tolerancias
    ├── guardias/              grupos, asignaciones, presencia, novedades, inspecciones,
    │                          pernoctes, requisitos de rol, elegibilidad
    ├── servicios/             comunicaciones de servicio + PDF
    ├── vehiculos/ equipos/    flotas y equipamiento
    ├── publicaciones/         contenido público
    └── configuracion/         registro tipado de configuración
```

Cada módulo tiene `*.controller.ts`, `*.service.ts`, `dto/` y su `*.module.ts`. Las
entidades son **compartidas** en `shared/entities/`, no por módulo.

**El módulo no dice el esquema.** `guardias` es un módulo propio pero sus tablas viven en
el esquema `operaciones` — ver [[rule--guardias-vive-en-operaciones]]. Es la confusión de
nombres más costosa del proyecto.

## Dos particularidades que sorprenden

### Sin relaciones TypeORM

**Ninguna de las 75 entidades usa `@ManyToOne`, `@OneToMany` ni `@ManyToMany`.** Las
llaves foráneas son columnas planas (`guardiaId: string`, `bomberoId: string`).

Consecuencias:

- No hay carga eager/lazy ni cascadas del ORM. Nada se trae "solo".
- Todo join es explícito, con `createQueryBuilder`, o son dos consultas y un armado en
  memoria. `relations: ['bombero']` **no funciona**.
- Las cascadas que existen son de **la base de datos**, no del ORM — y por eso son
  invisibles desde el código. Ver [[rule--una-comunicacion-por-servicio]].
- El grafo suple lo que el ORM no declara: las aristas `references` entre tablas se
  derivan de las FKs de las migraciones.

### Reglas de negocio como datos

El patrón dominante: si una regla la decide la institución, es una fila, no una
constante. Cuatro mecanismos coexisten —`organizacion.parametros`,
`operaciones.tolerancias_asistencia`, `operaciones.requisitos_rol_guardia` y el registro
de Configuración. Ver [[decision--tolerancias-parametrizables]] y
[[rule--elegibilidad-de-rol-guardia]].

## Capas del frontend

```
frontend/src/
├── app/
│   ├── layout.tsx · globals.css      las 4 clases utilitarias
│   ├── login/                        único acceso
│   ├── dashboard/
│   │   ├── layout.tsx                navegación filtrada por permisos
│   │   ├── [modulo]/                 comodín para módulos sin pantalla propia
│   │   └── organizacion/ personal/ asistencia/ guardias/ servicios/
│   │       seguridad/ publicaciones/ mi-perfil/
│   └── components/                   ConfigBootstrap, SystemIcon, ExperienceGuard
└── lib/
    ├── api.ts          apiFetch, login, logout, refresh, sesión en localStorage
    ├── modulos.ts      los 14 módulos y moduloVisible()
    ├── asistencia.ts · configuracion.ts · parametros.ts · personal.ts
    ├── publicaciones.ts · exportar.ts · texto.ts
```

## Lo que NO hay

Sin Redis, Kafka, Elasticsearch, MinIO, Docker, Kubernetes. Sin microservicios. Sin
caché de permisos. Sin store global en el cliente. Sin librería de UI. Sin i18n. Sin
procedimientos almacenados. **Sin pruebas automatizadas.** Sin CI.

Cada ausencia es una decisión, no un olvido: ver [DECISIONS.md](DECISIONS.md).

## Puertos y variables

| | |
|---|---|
| Backend | 3001 (`PORT`) · prefijo `/api/v1` |
| Frontend | 3000 · `NEXT_PUBLIC_API_URL` |
| SQL Server | 1433 (`DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD`) |
| CORS | `CORS_ORIGIN`, default `http://localhost:3000`, `credentials: true` |
| Estáticos | `/uploads` servido por el backend, fuera del prefijo de la API |

Ver [[rule--api-v1-y-contrato-http]].
