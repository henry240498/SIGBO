# SIGBO-CBVC

Sistema de gestión para el Cuerpo de Bomberos Voluntarios. Monolito modular **NestJS 10**
+ **Next.js 14** (App Router) + **SQL Server 2019 Express**. Todo el código, la base de
datos y la interfaz están en **español**.

## Antes de explorar el repositorio: consultá el índice

Este proyecto tiene un índice semántico en [.context/](.context/INDEX.md) que evita leer
el repositorio a mano. Leer los 370+ archivos de código cuesta ~400K tokens; una consulta
al índice cuesta 1–4K.

**Empezá siempre por acá:**

```bash
node .context/graph/context.mjs <términos>                    # L1: nodos + reglas y decisiones que aplican
node .context/graph/context.mjs <términos> --level L2          # antes de modificar código
node .context/graph/context.mjs --tabla <esquema.tabla>         # qué se rompe si cambio esta tabla
node .context/graph/context.mjs --archivo <ruta>                # qué reglas tocan este archivo
node .context/graph/context.mjs --tipo RULE --dominio <dominio> # invariantes de un dominio
node .context/graph/context.mjs --mapa                          # L0: el mapa del proyecto
```

Escalá **L0 → L1 → L2 → L3** y detenete en cuanto puedas actuar. Cada consulta imprime su
costo en tokens y termina con la lista de **archivos relevantes**: abrí solo esos.

El índice dice *dónde mirar*; **el código es la fuente de verdad**. Verificá el archivo
antes de afirmar algo o de basar un cambio en un dato del grafo.

### Cuándo regenerarlo

Cuando cambie el **conocimiento estructural** —entidad, tabla, controlador, pantalla o
módulo nuevo; decisión de arquitectura; falla descubierta—, no en cada consulta:

```bash
node .context/graph/build-graph.mjs   # regenera nodos derivados, aristas e índices
node .context/graph/validar.mjs       # verifica integridad (sale 1 si hay errores)
```

Los nodos de `.context/graph/nodes/` se sobrescriben: **no editarlos a mano**. El
conocimiento escrito a mano vive en `.context/graph/curated/` (RULE, DECISION, WORKFLOW,
ERROR, DEPENDENCY) — ver `.context/graph/SCHEMA.md` para el contrato.

## Reglas que no hay que romper

Las críticas, en corto. El detalle está en `.context/RULES.md`.

1. **`synchronize: false`.** Agregar un `@Column` no crea la columna; agregar un valor a
   un `export type` de estados no lo permite en la base. Entidad y **migración** se
   cambian juntas, en el mismo cambio.
2. **Una migración aplicada nunca se edita.** Se agrega otra, con el siguiente número
   libre (verificá: la numeración ya colisionó en `017`).
3. **Todo endpoint declara `@RequirePermission('modulo:accion')`** con `JwtAuthGuard` +
   `PermissionsGuard`. Un permiso nuevo son **dos** pasos: usarlo *y* sembrarlo en
   `seguridad.permisos`. Si falta el segundo, nadie puede usar el endpoint nunca (403 sin
   explicación).
4. **El frontend oculta, el backend autoriza.** Los chequeos en React son cosmética: la
   lista de permisos vive en `localStorage`.
5. **Permiso efectivo** = roles vigentes + directos concedidos − directos denegados. La
   denegación directa gana sobre cualquier rol.
6. **CSS: tema claro, y el color sale de un token, no de un hex.** Sin Tailwind, sin
   librería de UI. `globals.css` define ~116 clases (`.card`, `.btn-primary`,
   `.input-field`, `.badge` y las de cada dominio) más las variables de `:root`. Lo que
   no cubran va `style={{}}` inline pero **con `var(--…)`**: `--muted`, `--danger`,
   `--success`, `--warning`, `--signal`, `--ink`, `--line`, `--line-soft`. Un hex crudo
   de texto en una pantalla es la falla que se corrigió en toda la app: quedaron de la
   época del tema oscuro y sobre tarjeta blanca daban 2,5:1. `npm run audit:contraste`
   falla si vuelve alguno.
   **Chips y botones no se pintan igual.** `.badge` fija `color: var(--ink)`, así que un
   badge lleva fondo de **tinte claro** (`--ok-fill`, `--bad-fill`, `--warn-fill`,
   `--info-fill`, `--neutral-fill`); con fondo sólido oscuro queda en 1,5:1. `.btn-primary`
   fija texto blanco, así que un botón sí lleva fondo **sólido oscuro**. La semántica no
   cambia: `ACTIVO` verde / cualquier estado malo rojo — `--bad-fill` en chip, `#7f1d1d`
   en botón.
7. **Pantallas:** `'use client'`, estado local con `useState`/`useEffect`, y recargar con
   `cargar()` después de cada mutación. No hay store global ni React Query.
8. **API:** el backend usa `setGlobalPrefix('api/v1')` y `apiFetch()` ya lo agrega — las
   pantallas pasan rutas relativas (`apiFetch('/guardias/grupos')`).
9. **Piezas compartidas de pantalla, en vez de repetir el patrón suelto:**
   `<Aviso tipo="error|exito" texto={x} />` para el resultado de una acción (lleva
   `role`, y el de éxito se retira solo), `<Cargando texto="…" />` para el estado de
   carga (esqueleto con `role="status"`), y `<ComboBuscable ariaLabel="…">` para un
   combo que puede crecer.
10. **Toda etiqueta nombra a su control.** `<label htmlFor>` + `id` en el control; si el
    control se repite en una lista, `useId()` para el prefijo, o `aria-label` cuando el
    texto de la etiqueta es dinámico. Un `<label>` suelto no nombra el campo ni permite
    enfocarlo con un clic. Los `<th>` llevan `scope="col"`.
    `npm run audit:a11y` falla si vuelve a aparecer alguno sin asociar.
11. **Pantalla nueva ⇒ `npm run generar:pantallas`.** `src/lib/pantallas.generado.ts`
    alimenta las migas de pan y el buscador (Ctrl+K); si no se regenera, la pantalla
    existe pero nadie la encuentra. El nombre legible sale del array `TABS` del
    `layout.tsx` del módulo, así que conviene agregarla ahí primero.

## Dos particularidades que sorprenden

- **Ninguna de las 75 entidades usa relaciones TypeORM** (`@ManyToOne` y compañía). Las
  FKs son columnas planas. `relations: ['bombero']` **no funciona**: todo join es
  explícito con `createQueryBuilder`, o dos consultas armadas en memoria. Las cascadas que
  existen son de la base de datos, invisibles desde el código.
- **Si una regla la decide la institución, es una fila, no una constante.** Tolerancias de
  asistencia, requisitos de rol de guardia, parámetros institucionales, configuración.
  Un número de negocio literal en un servicio es sospechoso.

## Trampa de nombres: `operaciones` / `asistencia` / `guardias`

| | Asistencia | Guardias |
|---|---|---|
| Módulo NestJS | `operaciones` | `guardias` |
| Prefijo de permisos | `asistencia:` | `guardias:` |
| Esquema SQL | `operaciones` | **`operaciones`** ← el mismo |

**No existe el prefijo `operaciones:` ni el esquema `guardias`.** Los dos dominios
comparten el esquema `operaciones`, y quedaron pantallas de guardias en ambos lados.

## Cómo correrlo

```powershell
cd backend;  npm run start:dev    # http://localhost:3001/api/v1  · Swagger en /api/docs
cd frontend; npm run dev          # http://localhost:3000
database\run-migrations.ps1       # migraciones, en orden numérico
```

**`start-sigbo.ps1` no reinicia servicios que ya escuchan.** Si un cambio "no surte
efecto", verificá primero que el proceso sea nuevo:

```powershell
Get-Process node | Select-Object Id, StartTime
```

Entorno: Node 24, Windows 10, **PowerShell 5.1** (sin `&&`, sin ternario, sin `??`).
SQL Server Express local con TCP/IP deshabilitado de fábrica
(`database/enable-tcp-sqlexpress.ps1`, requiere admin de Windows).

## Verificación

**No hay pruebas automatizadas** en backend ni frontend. Cualquier cambio se verifica a
mano o vía Swagger (`http://localhost:3001/api/docs`). Tenelo en cuenta al proponer
refactors: no hay red de seguridad.

Lo único que sí está automatizado son dos auditorías con línea base, que **fallan si la
deuda crece**. No prueban que algo funcione; sólo impiden que vuelvan defectos que ya se
corrigieron en masa. Conviene correrlas antes de dar por terminado un cambio de frontend:

```powershell
cd frontend
npm run audit:contraste   # paleta del tema oscuro sobre fondo claro
npm run audit:a11y        # etiquetas sin asociar, th sin scope, confirm/alert nativos
npx tsc --noEmit          # el build no corre en CI: esto es lo más rápido
```

## Documentación

| Dónde | Qué |
|---|---|
| `.context/INDEX.md` | Índice semántico, protocolo de consulta y niveles |
| `.context/RULES.md` | Los 21 invariantes, con severidad |
| `.context/DECISIONS.md` | Las 10 decisiones de arquitectura y su costo |
| `.context/DATABASE.md` | 12 esquemas, 88 tablas, convenciones |
| `.context/WORKFLOWS.md` | Máquinas de estado del dominio |
| `docs/GUIA-DE-ESTILO.md` | Paleta, medidas y patrones de pantalla (verificado contra el código) |
| `docs/CREDENCIALES-Y-ROLES.md` | Usuarios y roles de desarrollo |

`docs/README.md` está **desactualizado** (dice "42 tablas, 10 esquemas"; son 88 en 12).
Cuando dude, mandan `.context/` y el código.
