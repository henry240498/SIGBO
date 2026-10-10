# Centro de mando, matriz de pantallas web y área Sistema — Plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Un Centro de mando en vivo para el personal activo, reglas por usuario/rol/rango/cargo que gobiernan qué pantalla web ve cada uno y qué puede hacer en ella (exigidas por el backend), un área Sistema con el estado real y las operaciones seguras que hoy exigen la terminal, y los estados del bombero corregidos.

**Architecture:** El catálogo de pantallas web (código estable `0xB…`/`0xC…`, rutas de API que llama cada una) lo genera `npm run generar:pantallas` en el frontend y lo escribe también en el backend. Un servicio global (`MatrizWebService`) cruza ese catálogo con la tabla real de rutas de Nest al arrancar, sincroniza `seguridad.pantallas` y decide dentro de `PermissionsGuard` (que ya está en todos los controladores) con las reglas existentes de `seguridad.pantalla_permisos`. El Centro de mando y el área Sistema son módulos Nest nuevos que reutilizan los servicios existentes; el frontend agrega un proveedor de permisos de pantalla, filtra menú/pestañas/buscador y suma las pantallas nuevas.

**Tech Stack:** NestJS 11 + TypeORM (SQL Server, `synchronize: false`), Jest (backend, sin base: `BaseFalsa`), Next.js 16 App Router + React 19 (sin librería de UI), runner nativo `node --test` para la lógica pura del frontend, PowerShell 5.1.

**Spec:** `docs/superpowers/specs/2026-10-09-centro-de-mando-design.md` (leer también su §15, "Ajustes al escribir el plan").

## Global Constraints

- Todo en español: código, mensajes, interfaz, commits.
- `synchronize: false`: entidad y migración cambian juntas; una migración aplicada nunca se edita; números nuevos: **096** (permisos) y **097** (estados del bombero). Toda migración nueva se agrega a `$ordenMigraciones` de `database/run-migrations.ps1` y a `database/migrations.sha256`.
- Todo endpoint usa `@UseGuards(JwtAuthGuard, PermissionsGuard)`. Llevan `@RequirePermission` salvo los de "cualquier usuario autenticado" (mismo criterio que `GET /seguridad/mi-inicio`): `GET /centro-mando`, `GET /centro-mando/acceso`, `GET /pantallas/mis-permisos-web`.
- Permiso nuevo = usarlo **y** sembrarlo: `sistema:ver`, `sistema:operar`, `sistema:ver_registros` (096).
- La matriz **restringe**: nunca da más que el rol; denegar gana. Sin reglas web configuradas, la API se comporta exactamente como hoy.
- Rutas de API **exentas** de la matriz (anti-bloqueo): `/pantallas`, `/pantallas/*`, `/auth/*`, `/salud`, `/centro-mando*`, `/seguridad/mi-perfil*`, `/seguridad/mi-inicio`, `/configuracion/publica`, `/configuracion/mis-preferencias`.
- Códigos de pantalla: `0xB###` web (los asigna el generador, nunca se renumeran), `0xC###` Centro de mando y área Sistema (fijos), `0xA###` app móvil (no se tocan). Fuera de la matriz: `/dashboard`, `/dashboard/mi-perfil*`, `/dashboard/reportar`, `/dashboard/[modulo]`.
- Estados del bombero: `ACTIVO`, `SUSPENDIDO`, `LICENCIA`, `BAJA`, `FALLECIDO`. Estados con acceso al Centro de mando por defecto: `['ACTIVO']` (clave `operations.commandCenterStates`).
- Supervisión de emergencias (ve todas): `despacho:seguimiento` o `servicios:despachar`.
- Sin comandos arbitrarios: solo `execFile('powershell.exe', [argumentos fijos])` con texto armado desde constantes, `windowsHide: true`, con tiempo máximo. Nombres de tarea: `SIGBO-Respaldo-Diario`, `SIGBO-Arranque-Automatico`.
- Ningún dato inventado: lo que no se puede obtener se muestra "No disponible: {motivo}".
- Frontend: `'use client'`, `useState`/`useEffect`, `cargar()` tras cada mutación, `apiFetch` con rutas relativas, `<Aviso>`, `<Cargando>`, `useConfirmacion()` (nunca `confirm`/`alert`), colores con `var(--…)` (sin hex de texto), chips `.badge` con `--ok-fill`/`--bad-fill`/`--warn-fill`/`--info-fill`/`--neutral-fill`, `<label htmlFor>` + `id`, `<th scope="col">`. Pantalla nueva ⇒ su `TABS` + `npm run generar:pantallas`.
- La lógica pura del frontend que se prueba vive en `frontend/src/lib/*.ts` **con imports relativos** (el runner de Node no resuelve `@/`).
- Entorno: Windows 11, PowerShell 5.1 (sin `&&`, sin ternario), Node 24. Backend: `cd backend; npx jest <ruta>`. Frontend: `cd frontend; node --test scripts/pruebas/`.
- Hay edición en paralelo en este repo: antes de crear un archivo, comprobar que no existe; antes de editar un archivo compartido (`app.module.ts`, `run-migrations.ps1`, `migrations.sha256`, `globals.css`), mirar su fecha de modificación y releerlo.
- Commits en `main` (convención del proyecto), terminados con `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. **No hacer push** salvo pedido explícito.

## Review Focus

1. **Bloqueo del propio administrador**: una regla "Denegar" sobre Seguridad › Pantallas para el rol del administrador no debe impedirle quitarla → las rutas `/pantallas/*` están exentas (prueba en Task 4).
2. **Falla al cargar los permisos de pantalla** (backend caído o viejo, 404/500): el menú no se vacía ni bloquea pantallas; se vuelve a la lógica por prefijo y se avisa (prueba en Task 7).
3. **URL de detalle con id real** (`/dashboard/personal/3f2a…`): debe resolver a la pantalla `/dashboard/personal/[id]` para aplicar su "ver" (prueba en Task 7).
4. **"Respaldar ahora" dos veces seguidas** con la tarea todavía corriendo: la segunda responde 409 y no lanza otra corrida (prueba en Task 10).
5. **Nombre de archivo malicioso** al verificar un respaldo (`..\..\backend\.env`, `sigbo_cbvc-20261009-082934.bak/../x`): 400 sin tocar el disco (prueba en Task 9).

---
### Task 1: Migraciones 096 (permisos del área Sistema) y 097 (estados del bombero)

**Files:**
- Create: `database/migrations/096_sistema_permisos.sql`
- Create: `database/migrations/097_estados_bombero.sql`
- Modify: `database/run-migrations.ps1` (lista `$ordenMigraciones`, después de `"095_matpel_permisos.sql"`)
- Modify: `database/migrations.sha256` (dos líneas al final)

**Interfaces:**
- Produces: permisos `sistema:ver`, `sistema:operar`, `sistema:ver_registros` en `seguridad.permisos`; CHECK `CK_bomberos_estado` con `ACTIVO`, `SUSPENDIDO`, `LICENCIA`, `BAJA`, `FALLECIDO`.

- [ ] **Step 1: Comprobar que los números siguen libres**

Run: `Get-ChildItem database\migrations -Filter "09[6-9]_*.sql"`
Expected: sin resultados. Si aparece alguno, usar el siguiente número libre en todo este task y avisar.

- [ ] **Step 2: Escribir `096_sistema_permisos.sql`**

```sql
/* SIGBO — 096: permisos del área Sistema del Centro de mando. Aditiva y reejecutable.
   sistema:ver            mirar estado, tareas, respaldos, migraciones y app móvil
   sistema:operar         respaldar ahora, verificar un respaldo, ejecutar avisos
   sistema:ver_registros  leer los registros del servidor (pueden traer datos personales)
   El Administrador General ya los recibe por acceso_total (mig. 035); se asignan
   también de forma explícita, como en la 095. Otros roles: desde Seguridad › Roles. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'sistema:ver',           N'sistema', N'ver',           N'Sistema'),
    (N'sistema:operar',        N'sistema', N'operar',        N'Sistema'),
    (N'sistema:ver_registros', N'sistema', N'ver_registros', N'Sistema')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
    AND p.nombre IN (N'sistema:ver', N'sistema:operar', N'sistema:ver_registros')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
```

- [ ] **Step 3: Escribir `097_estados_bombero.sql`**

```sql
/* SIGBO — 097: estados del bombero. Los reales son ACTIVO, SUSPENDIDO, LICENCIA, BAJA y
   FALLECIDO (decisión del cuartel, 2026-10-09). RETIRADO pasa a BAJA.
   ASPIRANTE y HONORARIO no se convierten solos: si hay fichas en esos estados el script
   se detiene y pide decidir cada caso. La condición institucional HONORARIO es otra
   columna (condicion_institucional) y no se toca. El historial institucional no se
   reescribe: una baja sigue registrando el tipo de movimiento RETIRO. Reejecutable. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
SET XACT_ABORT ON;
GO
IF EXISTS (SELECT 1 FROM personal.bomberos WHERE estado IN (N'ASPIRANTE', N'HONORARIO'))
    THROW 51097, N'097: hay bomberos en estado ASPIRANTE u HONORARIO. Decidir el estado de cada uno (ACTIVO, SUSPENDIDO, LICENCIA, BAJA o FALLECIDO) antes de aplicar esta migración.', 1;
GO
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = N'CK_bomberos_estado' AND parent_object_id = OBJECT_ID(N'personal.bomberos'))
    ALTER TABLE personal.bomberos DROP CONSTRAINT CK_bomberos_estado;
GO
UPDATE personal.bomberos SET estado = N'BAJA' WHERE estado = N'RETIRADO';
GO
ALTER TABLE personal.bomberos
    ADD CONSTRAINT CK_bomberos_estado CHECK (estado IN (N'ACTIVO', N'SUSPENDIDO', N'LICENCIA', N'BAJA', N'FALLECIDO'));
GO
```

- [ ] **Step 4: Registrarlas en el ejecutor**

En `database/run-migrations.ps1`, reemplazar:

```powershell
    "094_gre_base_documental.sql",
    "095_matpel_permisos.sql"
)
```

por:

```powershell
    "094_gre_base_documental.sql",
    "095_matpel_permisos.sql",
    "096_sistema_permisos.sql",
    "097_estados_bombero.sql"
)
```

- [ ] **Step 5: Agregar los hashes al manifiesto**

```powershell
foreach ($n in '096_sistema_permisos.sql', '097_estados_bombero.sql') {
  $h = (Get-FileHash -Algorithm SHA256 -LiteralPath "database\migrations\$n").Hash.ToLowerInvariant()
  Add-Content -LiteralPath database\migrations.sha256 -Value "$h  $n" -Encoding ascii
}
Get-Content database\migrations.sha256 -Tail 3
```
Expected: las dos líneas nuevas con dos espacios entre hash y nombre.

- [ ] **Step 6: Validar el manifiesto (lo mismo que corre CI)**

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File database\run-migrations.ps1 -ValidateOnly`
Expected: `=== Manifiesto de migraciones válido; no se alteró la base de datos ===`, código 0.

- [ ] **Step 7: Respaldo previo con la tarea programada existente**

```powershell
$antes = (Get-ChildItem respaldos -Filter 'sigbo_cbvc-*.bak' | Sort-Object Name | Select-Object -Last 1).Name
Start-ScheduledTask -TaskName 'SIGBO-Respaldo-Diario'
do { Start-Sleep -Seconds 5; $t = Get-ScheduledTask -TaskName 'SIGBO-Respaldo-Diario' } while ($t.State -eq 'Running')
$despues = (Get-ChildItem respaldos -Filter 'sigbo_cbvc-*.bak' | Sort-Object Name | Select-Object -Last 1).Name
"antes=$antes despues=$despues"; Get-Content respaldos\registro.log -Tail 2
```
Expected: `despues` es un archivo nuevo y la última línea del registro es `RESULTADO: OK`. Si no, **detenerse** e informar.

- [ ] **Step 8: Aplicar solo 096 y 097 en la base local (autorizado por el usuario; 094/095 NO)**

La contraseña de `sa` ya está en el entorno del contenedor (`SQLCMDPASSWORD`); no se escribe en la línea de comandos.

```powershell
foreach ($n in '096_sistema_permisos.sql', '097_estados_bombero.sql') {
  docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -f 65001 -I -d sigbo_cbvc -b -i "/sigbo-database/migrations/$n"
  if ($LASTEXITCODE -ne 0) { throw "Fallo al aplicar $n" }
  $h = (Get-FileHash -Algorithm SHA256 -LiteralPath "database\migrations\$n").Hash.ToUpperInvariant()
  docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -I -d sigbo_cbvc -b -Q "IF NOT EXISTS (SELECT 1 FROM dbo.__sigbo_migrations WHERE nombre = N'$n') INSERT INTO dbo.__sigbo_migrations (nombre, hash_sha256) VALUES (N'$n', '$h')"
  if ($LASTEXITCODE -ne 0) { throw "Fallo al registrar $n" }
}
docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -I -d sigbo_cbvc -h -1 -W -Q "SET NOCOUNT ON; SELECT nombre FROM dbo.__sigbo_migrations WHERE nombre LIKE N'09%' ORDER BY nombre; SELECT nombre FROM seguridad.permisos WHERE nombre LIKE N'sistema:%';"
```
Expected: `093_…`, `096_sistema_permisos.sql`, `097_estados_bombero.sql` (sin 094/095) y los tres permisos `sistema:*`.

- [ ] **Step 9: Commit**

```bash
git add database/migrations/096_sistema_permisos.sql database/migrations/097_estados_bombero.sql database/run-migrations.ps1 database/migrations.sha256
git commit -m "Migraciones 096 (permisos del área Sistema) y 097 (estados del bombero)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Estados del bombero en el código

**Files:**
- Modify: `backend/src/shared/entities/bombero.entity.ts:3-10`
- Modify: `backend/src/modules/personal/dto/create-bombero.dto.ts:46-52`
- Modify: `backend/src/modules/personal/bomberos.service.ts:10-15` y `:224-226`
- Modify: `backend/src/modules/ia/tools/ia-nlu.util.ts:101-107`
- Modify: `frontend/src/lib/personal.ts:42-54`
- Modify: `frontend/src/app/dashboard/personal/page.tsx:308,321`
- Modify: `frontend/src/app/dashboard/personal/nuevo/page.tsx:16`
- Modify: `frontend/src/app/dashboard/personal/[id]/secciones/TabInstitucional.tsx:275`
- Test: `backend/src/modules/personal/estados-bombero.spec.ts` (nuevo)

**Interfaces:**
- Produces: `ESTADOS_BOMBERO` (`readonly ['ACTIVO','SUSPENDIDO','LICENCIA','BAJA','FALLECIDO']`) y `type EstadoBombero` en `bombero.entity.ts`; `export function tipoMovimientoPorEstado(estadoNuevo: string): string` en `bomberos.service.ts`; en el frontend `ESTADOS_BOMBERO: string[]` y `estiloEstadoBombero(estado: string): React.CSSProperties` en `lib/personal.ts`.

- [ ] **Step 1: Escribir la prueba que falla**

`backend/src/modules/personal/estados-bombero.spec.ts`:

```ts
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ESTADOS_BOMBERO } from '../../shared/entities/bombero.entity';
import { ESTADO_BOMBERO_SINONIMOS, resolverSinonimo } from '../ia/tools/ia-nlu.util';
import { tipoMovimientoPorEstado } from './bomberos.service';
import { CreateBomberoDto } from './dto/create-bombero.dto';

describe('estados del bombero', () => {
  it('son exactamente los cinco que usa el cuartel', () => {
    expect([...ESTADOS_BOMBERO]).toEqual(['ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'BAJA', 'FALLECIDO']);
  });

  it('el DTO rechaza los estados que ya no existen y acepta BAJA', async () => {
    // Solo interesa el error del campo estado; los demas obligatorios pueden faltar.
    for (const viejo of ['RETIRADO', 'ASPIRANTE', 'HONORARIO']) {
      const errores = await validate(plainToInstance(CreateBomberoDto, { estado: viejo }));
      expect(errores.some((e) => e.property === 'estado')).toBe(true);
    }
    const ok = await validate(plainToInstance(CreateBomberoDto, { estado: 'BAJA' }));
    expect(ok.some((e) => e.property === 'estado')).toBe(false);
  });

  it('una baja sigue registrando el movimiento RETIRO del historial (no se reescribe)', () => {
    expect(tipoMovimientoPorEstado('BAJA')).toBe('RETIRO');
    expect(tipoMovimientoPorEstado('LICENCIA')).toBe('LICENCIA');
    expect(tipoMovimientoPorEstado('SUSPENDIDO')).toBe('SUSPENSION');
  });

  it('Snoopy entiende "de baja" y ya no ofrece aspirantes', () => {
    // resolverSinonimo recibe el mensaje ya normalizado (minusculas, sin tildes).
    expect(resolverSinonimo('cuantos bomberos de baja hay', ESTADO_BOMBERO_SINONIMOS)).toBe('BAJA');
    expect(resolverSinonimo('listame los retirados', ESTADO_BOMBERO_SINONIMOS)).toBe('BAJA');
    expect(resolverSinonimo('los fallecidos', ESTADO_BOMBERO_SINONIMOS)).toBe('FALLECIDO');
    expect(Object.values(ESTADO_BOMBERO_SINONIMOS)).not.toContain('ASPIRANTE');
  });
});
```

- [ ] **Step 2: Correrla y ver que falla**

Run: `cd backend; npx jest src/modules/personal/estados-bombero.spec.ts`
Expected: FAIL (`ESTADOS_BOMBERO` no exportado / `tipoMovimientoPorEstado` no exportada).

- [ ] **Step 3: Entidad**

En `bombero.entity.ts` reemplazar el tipo `EstadoBombero` (líneas 3-10) por:

```ts
/** Estados reales del bombero (decisión del cuartel, 2026-10-09). Los impone el CHECK
 * CK_bomberos_estado (mig. 097) y el DTO; no es un catálogo administrable. */
export const ESTADOS_BOMBERO = ['ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'BAJA', 'FALLECIDO'] as const;
export type EstadoBombero = (typeof ESTADOS_BOMBERO)[number];
```

- [ ] **Step 4: DTO**

En `create-bombero.dto.ts`, importar `import { ESTADOS_BOMBERO } from '../../../shared/entities/bombero.entity';` y reemplazar el bloque de `estado`:

```ts
  @ApiProperty({ enum: ESTADOS_BOMBERO, default: 'ACTIVO' })
  @IsOptional()
  @IsIn([...ESTADOS_BOMBERO])
  estado?: string;
```

- [ ] **Step 5: Servicio de bomberos**

En `bomberos.service.ts`, exportar la función y tratar `BAJA`:

```ts
/** Traduce un cambio de `estado` al tipo de movimiento mas especifico posible.
 * BAJA sigue registrando RETIRO: el historial institucional no se reescribe (mig. 097). */
export function tipoMovimientoPorEstado(estadoNuevo: string): string {
  if (estadoNuevo === 'LICENCIA') return 'LICENCIA';
  if (estadoNuevo === 'SUSPENDIDO') return 'SUSPENSION';
  if (estadoNuevo === 'BAJA') return 'RETIRO';
  return 'CAMBIO_CONDICION';
}
```

y en `darBaja` cambiar `estado: 'RETIRADO',` por `estado: 'BAJA',`. Buscar otros usos: `grep -n "RETIRADO" backend/src/modules/personal/*.ts` → no debe quedar ninguno referido al estado del bombero.

- [ ] **Step 6: Snoopy (sinónimos)**

En `ia-nlu.util.ts`, reemplazar `ESTADO_BOMBERO_SINONIMOS` por:

```ts
export const ESTADO_BOMBERO_SINONIMOS: Record<string, string> = {
  activos: 'ACTIVO', activo: 'ACTIVO', activas: 'ACTIVO', activa: 'ACTIVO', vigentes: 'ACTIVO', vigente: 'ACTIVO',
  suspendidos: 'SUSPENDIDO', suspendido: 'SUSPENDIDO',
  licencia: 'LICENCIA', licencias: 'LICENCIA',
  'dados de baja': 'BAJA', 'de baja': 'BAJA', bajas: 'BAJA', baja: 'BAJA', retirados: 'BAJA', retirado: 'BAJA',
  fallecidos: 'FALLECIDO', fallecido: 'FALLECIDO',
};
```

(`resolverSinonimo` prueba primero los términos más largos, así "dados de baja" gana sobre "baja".)

- [ ] **Step 7: Correr la prueba y la suite de personal e IA**

Run: `cd backend; npx jest src/modules/personal src/modules/ia/tools`
Expected: PASS.

- [ ] **Step 8: Frontend**

En `frontend/src/lib/personal.ts`, reemplazar la constante y agregar el estilo (sin hex: tokens):

```ts
/** Estados de ciclo de vida de un bombero (mig. 097). Maquina de estados fija
 * (CHECK + DTO en el backend), no un catalogo administrable. */
export const ESTADOS_BOMBERO = ['ACTIVO', 'SUSPENDIDO', 'LICENCIA', 'BAJA', 'FALLECIDO'];

/** Chip del estado: ACTIVO verde, LICENCIA ambar, el resto rojo (tinte claro: .badge fija el texto). */
export function estiloEstadoBombero(estado: string): React.CSSProperties {
  if (estado === 'ACTIVO') return { background: 'var(--ok-fill)' };
  if (estado === 'LICENCIA') return { background: 'var(--warn-fill)' };
  return { background: 'var(--bad-fill)' };
}
```

Si `personal.ts` no importa React, agregar `import type React from 'react';` al principio.

En `personal/nuevo/page.tsx` borrar `const ESTADOS = [...]` (línea 16), importar `ESTADOS_BOMBERO` desde `@/lib/personal` y reemplazar los usos de `ESTADOS` por `ESTADOS_BOMBERO`. Lo mismo en `TabInstitucional.tsx` (línea 275).

En `personal/page.tsx`: línea 308 `<span className="badge">{b.estado}</span>` → `<span className="badge" style={estiloEstadoBombero(b.estado)}>{b.estado}</span>` (importar `estiloEstadoBombero`); línea 321 `b.estado !== 'RETIRADO'` → `b.estado !== 'BAJA'`. Revisar el `<select>` del filtro de estado (línea ~241): si arma las opciones con una lista propia, usar `ESTADOS_BOMBERO`.

En `personal/[id]/page.tsx:137` reemplazar el `style` del chip por `style={estiloEstadoBombero(bombero.estado)}`.

- [ ] **Step 9: Verificar el frontend**

Run: `cd frontend; npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y`
Then: `Select-String -Path frontend\src -Pattern "'RETIRADO'|'ASPIRANTE'" -Recurse -Include *.ts,*.tsx` → solo pueden quedar usos que **no** son del estado del bombero (p. ej. participantes de un servicio o inscripciones de academia); revisar cada uno.
Expected: tsc sin errores; auditorías en verde.

- [ ] **Step 10: Commit**

```bash
git add backend/src/shared/entities/bombero.entity.ts backend/src/modules/personal backend/src/modules/ia/tools/ia-nlu.util.ts frontend/src/lib/personal.ts frontend/src/app/dashboard/personal
git commit -m "Personal: estados del bombero ACTIVO, SUSPENDIDO, LICENCIA, BAJA y FALLECIDO

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Ruta de Piper acotada a una carpeta permitida

**Files:**
- Create: `backend/src/modules/ia/piper/piper-rutas.ts`
- Modify: `backend/src/modules/ia/piper/piper.service.ts:50-61` (método `estado`)
- Modify: `backend/src/modules/ia/ia-configuracion.service.ts:~100-110` (antes de guardar `piperRutaBinario`/`piperRutaVoz`)
- Test: `backend/src/modules/ia/piper/piper-rutas.spec.ts`

**Interfaces:**
- Produces: `validarRutasPiper(rutaBinario: string | null, rutaVoz: string | null, carpetaPermitida: string | null): string | null` (devuelve el motivo del rechazo o `null`), `carpetaPermitidaPiper(guardada: string | null): string | null`.

- [ ] **Step 1: Prueba que falla**

`backend/src/modules/ia/piper/piper-rutas.spec.ts`:

```ts
import { join } from 'path';
import { carpetaPermitidaPiper, validarRutasPiper } from './piper-rutas';

const raiz = join('C:', 'Herramientas', 'piper');

describe('rutas de Piper', () => {
  it('acepta piper(.exe) y una voz .onnx dentro de la carpeta permitida', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join(raiz, 'voces', 'es_ES-davefx-medium.onnx'), raiz)).toBeNull();
    expect(validarRutasPiper(join(raiz, 'piper'), null, raiz)).toBeNull();
  });

  it('rechaza cualquier otro ejecutable aunque esté en la carpeta', () => {
    expect(validarRutasPiper(join(raiz, 'cmd.exe'), null, raiz)).toMatch(/piper/);
    expect(validarRutasPiper(join(raiz, 'piper.exe.bat'), null, raiz)).toMatch(/piper/);
  });

  it('rechaza rutas fuera de la carpeta, incluso con ..', () => {
    expect(validarRutasPiper(join('C:', 'Windows', 'System32', 'piper.exe'), null, raiz)).toMatch(/carpeta/);
    expect(validarRutasPiper(join(raiz, '..', '..', 'Windows', 'piper.exe'), null, raiz)).toMatch(/carpeta/);
  });

  it('la voz debe ser .onnx y estar en la carpeta', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join(raiz, 'voz.txt'), raiz)).toMatch(/onnx/);
    expect(validarRutasPiper(join(raiz, 'piper.exe'), join('D:', 'otra', 'voz.onnx'), raiz)).toMatch(/carpeta/);
  });

  it('sin carpeta permitida no se acepta ninguna ruta nueva', () => {
    expect(validarRutasPiper(join(raiz, 'piper.exe'), null, null)).toMatch(/IA_PIPER_DIR/);
  });

  it('la carpeta permitida sale de IA_PIPER_DIR o, si no está, de la ruta ya guardada', () => {
    const previo = process.env.IA_PIPER_DIR;
    process.env.IA_PIPER_DIR = raiz;
    expect(carpetaPermitidaPiper(null)).toBe(raiz);
    delete process.env.IA_PIPER_DIR;
    expect(carpetaPermitidaPiper(join(raiz, 'piper.exe'))).toBe(raiz);
    expect(carpetaPermitidaPiper(null)).toBeNull();
    if (previo !== undefined) process.env.IA_PIPER_DIR = previo;
  });
});
```

- [ ] **Step 2: Correrla**

Run: `cd backend; npx jest src/modules/ia/piper/piper-rutas.spec.ts`
Expected: FAIL (`Cannot find module './piper-rutas'`).

- [ ] **Step 3: Implementar `piper-rutas.ts`**

```ts
import { basename, dirname, extname, relative, resolve, isAbsolute } from 'path';

/**
 * La ruta del binario de Piper se configura desde la web. Sin acotarla, quien tuviera
 * inteligencia:configurar podia hacer que el servidor ejecutara cualquier programa del
 * disco (PiperService la pasa a spawn). Solo se acepta un ejecutable llamado piper o
 * piper.exe, y la voz .onnx, dentro de una carpeta permitida.
 */
const NOMBRES_BINARIO = new Set(['piper', 'piper.exe']);

export function carpetaPermitidaPiper(guardada: string | null): string | null {
  const env = process.env.IA_PIPER_DIR?.trim();
  if (env) return resolve(env);
  return guardada ? resolve(dirname(guardada)) : null;
}

function dentroDe(carpeta: string, ruta: string): boolean {
  const rel = relative(resolve(carpeta), resolve(ruta));
  return rel !== '' && !rel.startsWith('..') && !isAbsolute(rel);
}

export function validarRutasPiper(rutaBinario: string | null, rutaVoz: string | null, carpetaPermitida: string | null): string | null {
  if (!rutaBinario && !rutaVoz) return null;
  if (!carpetaPermitida) return 'No hay carpeta permitida para Piper: definir IA_PIPER_DIR en el .env del backend.';
  if (rutaBinario) {
    if (!NOMBRES_BINARIO.has(basename(rutaBinario).toLowerCase())) return 'El ejecutable debe llamarse piper o piper.exe.';
    if (!dentroDe(carpetaPermitida, rutaBinario)) return `El ejecutable de Piper debe estar dentro de la carpeta permitida (${carpetaPermitida}).`;
  }
  if (rutaVoz) {
    if (extname(rutaVoz).toLowerCase() !== '.onnx') return 'La voz debe ser un archivo .onnx.';
    if (!dentroDe(carpetaPermitida, rutaVoz)) return `La voz debe estar dentro de la carpeta permitida (${carpetaPermitida}).`;
  }
  return null;
}
```

- [ ] **Step 4: Correr la prueba**

Run: `cd backend; npx jest src/modules/ia/piper/piper-rutas.spec.ts`
Expected: PASS.

- [ ] **Step 5: Exigirla al guardar y antes de ejecutar**

En `ia-configuracion.service.ts`, en el método que aplica el DTO (el que tiene las líneas `...(dto.piperRutaBinario !== undefined ? ...` y termina con `this.registrarCambio(actual, nuevo, ...)`), justo antes del `update` que aplica los cambios — donde `actual` ya es la configuración vigente:

```ts
    if (dto.piperRutaBinario !== undefined || dto.piperRutaVoz !== undefined) {
      const binario = dto.piperRutaBinario ?? actual.piperRutaBinario;
      const voz = dto.piperRutaVoz ?? actual.piperRutaVoz;
      const motivo = validarRutasPiper(binario || null, voz || null, carpetaPermitidaPiper(actual.piperRutaBinario));
      if (motivo) throw new BadRequestException(motivo);
    }
```

Importar `BadRequestException` de `@nestjs/common` (si no estaba) y las dos funciones de `./piper/piper-rutas`. Antes de cerrar la tarea, revisar la configuración actual de la base (`GET /ia/admin/config` con `admin`): si la voz configurada no está dentro de la carpeta del binario, definir `IA_PIPER_DIR` en `backend/.env` con la carpeta que contiene a ambos, para no apagar la voz de Snoopy.

En `piper.service.ts`, al principio de `estado(config)`:

```ts
    const motivo = validarRutasPiper(config.piperRutaBinario, config.piperRutaVoz, carpetaPermitidaPiper(config.piperRutaBinario));
    if (motivo) return { disponible: false, rutaBinario: config.piperRutaBinario, rutaVoz: config.piperRutaVoz, error: motivo };
```

(`sintetizar` ya llama a `estado` antes de `spawn`, así que la validación también corre antes de ejecutar.) Agregar `IA_PIPER_DIR=` comentado en `backend/.env.example` con una línea que explique para qué sirve.

- [ ] **Step 6: Suite de IA**

Run: `cd backend; npx jest src/modules/ia`
Expected: PASS.

- [ ] **Step 7: Commit**

```bash
git add backend/src/modules/ia backend/.env.example
git commit -m "IA: la ruta de Piper solo acepta piper(.exe) y voces .onnx dentro de una carpeta permitida

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 4: Lógica pura de la matriz web

**Files:**
- Create: `backend/src/modules/pantallas/matriz-web.logica.ts`
- Test: `backend/src/modules/pantallas/matriz-web.logica.spec.ts`

**Interfaces:**
- Consumes: `AccionPantalla`, `SujetoUsuario`, `reglaAplica` de `./pantallas.logica`; `PantallaPermiso` de `../../shared/entities`.
- Produces (todo exportado desde `matriz-web.logica.ts`):
  - `type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'`, `METODOS: MetodoHttp[]`
  - `interface RutaBackend { metodo: MetodoHttp; patron: string; permisos: string[] }` (patrón sin `/api/v1`, con `:param`)
  - `interface LlamadaApi { metodos: MetodoHttp[]; patron: string }` (patrón del frontend, `*` = segmento variable)
  - `interface PantallaCatalogo { codigo: string; ruta: string; nombre: string; modulo: string; prefijo: string | null; llamadas: LlamadaApi[] }`
  - `interface AccionForzada { metodo: MetodoHttp; patron: string; accion: AccionPantalla }`
  - `interface IndiceMatriz { pantallasPorRuta: Map<string, string[]>; rutasPorPantalla: Map<string, RutaBackend[]>; sinResolver: Array<{ codigo: string; llamada: LlamadaApi }> }`
  - `interface BaseUi { siempre: boolean; nunca: boolean; algunoDe: string[]; prefijo: string | null }`
  - `type AccionUi = 'ver' | 'crear' | 'editar' | 'eliminar'`
  - funciones: `segmentos`, `normalizarPatron`, `sinPrefijo`, `resolverLlamada`, `claveRuta`, `construirIndice`, `esExenta`, `accionDe`, `decidirApi`, `tieneBase`, `baseDePantalla`, `decidirUiDetalle`, `decidirUi`, `VERBO_ACCION`.

- [ ] **Step 1: Escribir las pruebas que fallan**

`backend/src/modules/pantallas/matriz-web.logica.spec.ts`:

```ts
import type { PantallaPermiso } from '../../shared/entities';
import {
  accionDe, baseDePantalla, construirIndice, decidirApi, decidirUi, decidirUiDetalle, esExenta,
  PantallaCatalogo, resolverLlamada, RutaBackend, sinPrefijo,
} from './matriz-web.logica';
import type { SujetoUsuario } from './pantallas.logica';

const sujeto: SujetoUsuario = { usuarioId: 'u1', rolIds: ['rolA'], rangoId: 'r1', cargo: 'Jefe' };
const regla = (o: Partial<PantallaPermiso>): PantallaPermiso => ({
  id: 'x', pantallaCodigo: '0xB001', sujetoTipo: 'USUARIO', sujetoId: 'u1', ver: false, crear: false, editar: false,
  eliminar: false, confidencial: false, denegar: false, creadoPor: null, creadoEn: new Date(), actualizadoEn: new Date(), ...o,
}) as PantallaPermiso;

const rutas: RutaBackend[] = [
  { metodo: 'GET', patron: '/personal/bomberos', permisos: ['personal:ver'] },
  { metodo: 'GET', patron: '/personal/bomberos/:id', permisos: ['personal:ver'] },
  { metodo: 'GET', patron: '/personal/bomberos/exportar', permisos: ['personal:exportar'] },
  { metodo: 'DELETE', patron: '/personal/bomberos/:id', permisos: ['personal:eliminar'] },
  { metodo: 'PUT', patron: '/pantallas/reglas', permisos: ['seguridad:gestionar_pantallas'] },
  { metodo: 'GET', patron: '/seguridad/mi-inicio', permisos: [] },
];

const personal: PantallaCatalogo = {
  codigo: '0xB001', ruta: '/dashboard/personal', nombre: 'Personal', modulo: 'personal', prefijo: 'personal:',
  llamadas: [{ metodos: ['GET'], patron: '/personal/bomberos' }, { metodos: ['DELETE'], patron: '/personal/bomberos/*' }],
};
const guardias: PantallaCatalogo = {
  codigo: '0xB002', ruta: '/dashboard/guardias', nombre: 'Guardias', modulo: 'guardias', prefijo: 'guardias:',
  llamadas: [{ metodos: ['GET'], patron: '/personal/bomberos' }],
};
const reglasPantallas: PantallaCatalogo = {
  codigo: '0xB003', ruta: '/dashboard/seguridad/pantallas', nombre: 'Pantallas', modulo: 'seguridad', prefijo: 'seguridad:',
  llamadas: [{ metodos: ['PUT'], patron: '/pantallas/reglas' }, { metodos: ['GET'], patron: '/no/existe' }],
};

describe('rutas y llamadas', () => {
  it('quita el prefijo global del patrón de Express', () => {
    expect(sinPrefijo('/api/v1/personal/bomberos/:id')).toBe('/personal/bomberos/:id');
    expect(sinPrefijo('api/v1//salud/')).toBe('/salud');
  });

  it('un comodín prefiere la ruta con parámetro; un literal, la ruta literal', () => {
    expect(resolverLlamada({ metodos: ['GET'], patron: '/personal/bomberos/*' }, rutas).map((r) => r.patron)).toEqual(['/personal/bomberos/:id']);
    expect(resolverLlamada({ metodos: ['GET'], patron: '/personal/bomberos/exportar' }, rutas).map((r) => r.patron)).toEqual(['/personal/bomberos/exportar']);
  });

  it('si no hay coincidencia exacta, acepta la flexible (literal contra parámetro)', () => {
    expect(resolverLlamada({ metodos: ['DELETE'], patron: '/personal/bomberos/abc' }, rutas).map((r) => r.patron)).toEqual(['/personal/bomberos/:id']);
  });

  it('respeta el método', () => {
    expect(resolverLlamada({ metodos: ['POST'], patron: '/personal/bomberos' }, rutas)).toEqual([]);
  });
});

describe('índice', () => {
  const indice = construirIndice([personal, guardias, reglasPantallas], rutas);

  it('una ruta compartida queda asociada a todas sus pantallas', () => {
    expect(indice.pantallasPorRuta.get('GET /personal/bomberos')).toEqual(['0xB001', '0xB002']);
    expect(indice.pantallasPorRuta.get('DELETE /personal/bomberos/:id')).toEqual(['0xB001']);
  });

  it('las rutas exentas no entran al índice: administrar la matriz nunca se bloquea con la matriz', () => {
    expect(esExenta('/pantallas/reglas/:id')).toBe(true);
    expect(esExenta('/seguridad/mi-inicio')).toBe(true);
    expect(esExenta('/personal/bomberos')).toBe(false);
    expect(indice.pantallasPorRuta.has('PUT /pantallas/reglas')).toBe(false);
    // pero la pantalla conoce su ruta, para calcular su permiso base
    expect(indice.rutasPorPantalla.get('0xB003')!.map((r) => r.patron)).toEqual(['/pantallas/reglas']);
  });

  it('informa las llamadas que no corresponden a ninguna ruta', () => {
    expect(indice.sinResolver).toEqual([{ codigo: '0xB003', llamada: { metodos: ['GET'], patron: '/no/existe' } }]);
  });
});

describe('acción por método', () => {
  it('GET ver, POST crear, PUT/PATCH editar, DELETE eliminar, salvo acción forzada', () => {
    expect(accionDe('GET', '/x', [])).toBe('ver');
    expect(accionDe('HEAD', '/x', [])).toBe('ver');
    expect(accionDe('POST', '/x', [])).toBe('crear');
    expect(accionDe('PATCH', '/x', [])).toBe('editar');
    expect(accionDe('DELETE', '/x', [])).toBe('eliminar');
    expect(accionDe('POST', '/finanzas/beneficios/simular', [{ metodo: 'POST', patron: '/finanzas/beneficios/simular', accion: 'ver' }])).toBe('ver');
    expect(accionDe('OPTIONS', '/x', [])).toBeNull();
  });
});

describe('decidirApi', () => {
  it('sin pantallas o sin reglas aplicables, permite (el rol ya se exigió)', () => {
    expect(decidirApi([], 'ver', [], sujeto).permitido).toBe(true);
    expect(decidirApi(['0xB001'], 'ver', [], sujeto).permitido).toBe(true);
    expect(decidirApi(['0xB001'], 'ver', [regla({ sujetoId: 'otro', denegar: true })], sujeto).permitido).toBe(true);
  });

  it('denegar gana y se informa qué pantalla lo negó', () => {
    expect(decidirApi(['0xB001'], 'ver', [regla({ ver: true }), regla({ id: 'y', sujetoTipo: 'ROL', sujetoId: 'rolA', denegar: true })], sujeto))
      .toEqual({ permitido: false, codigoDenegado: '0xB001' });
  });

  it('una regla que concede ver no concede eliminar', () => {
    expect(decidirApi(['0xB001'], 'eliminar', [regla({ ver: true })], sujeto).permitido).toBe(false);
  });

  it('una ruta compartida sigue disponible si otra pantalla la permite', () => {
    expect(decidirApi(['0xB001', '0xB002'], 'ver', [regla({ denegar: true })], sujeto).permitido).toBe(true);
  });
});

describe('decisión para la interfaz', () => {
  const r = construirIndice([personal], rutas).rutasPorPantalla.get('0xB001')!;

  it('ver exige el prefijo del módulo y alguno de los permisos de sus GET', () => {
    const base = baseDePantalla(personal, r, 'ver', []);
    expect(decidirUi(base, 'ver', ['personal:ver'], [], sujeto)).toBe(true);
    expect(decidirUi(base, 'ver', ['guardias:ver'], [], sujeto)).toBe(false);
    expect(decidirUi(base, 'ver', ['personal:crear'], [], sujeto)).toBe(false);
  });

  it('una acción sin rutas de ese método no se ofrece', () => {
    expect(baseDePantalla(personal, r, 'crear', []).nunca).toBe(true);
    expect(decidirUi(baseDePantalla(personal, r, 'crear', []), 'crear', ['personal:crear'], [], sujeto)).toBe(false);
  });

  it('una ruta abierta (sin permiso) no exige permiso, solo el prefijo', () => {
    const p: PantallaCatalogo = { ...personal, codigo: '0xB009', llamadas: [{ metodos: ['GET'], patron: '/seguridad/mi-inicio' }] };
    const rr = construirIndice([p], rutas).rutasPorPantalla.get('0xB009')!;
    expect(decidirUi(baseDePantalla(p, rr, 'ver', []), 'ver', ['personal:editar'], [], sujeto)).toBe(true);
  });

  it('las reglas restringen e informan el origen', () => {
    const base = baseDePantalla(personal, r, 'ver', []);
    expect(decidirUiDetalle(base, 'ver', ['personal:ver'], [regla({ denegar: true })], sujeto)).toEqual({ permitido: false, origen: 'REGLA' });
    expect(decidirUiDetalle(base, 'ver', ['personal:ver'], [regla({ ver: true })], sujeto)).toEqual({ permitido: true, origen: 'REGLA' });
    expect(decidirUiDetalle(base, 'ver', ['personal:ver'], [], sujeto)).toEqual({ permitido: true, origen: 'ROL' });
    expect(decidirUiDetalle(base, 'ver', [], [regla({ ver: true })], sujeto)).toEqual({ permitido: false, origen: 'ROL' });
  });
});
```

- [ ] **Step 2: Correrlas**

Run: `cd backend; npx jest src/modules/pantallas/matriz-web.logica.spec.ts`
Expected: FAIL (`Cannot find module './matriz-web.logica'`).

- [ ] **Step 3: Implementar `matriz-web.logica.ts`**

```ts
import type { PantallaPermiso } from '../../shared/entities';
import { AccionPantalla, reglaAplica, SujetoUsuario } from './pantallas.logica';

/**
 * Matriz de permisos por pantalla aplicada a la web (spec 2026-10-09 §4).
 * Logica pura: cruzar lo que llama cada pantalla con las rutas reales del backend y
 * decidir con las reglas de seguridad.pantalla_permisos. La matriz SOLO restringe:
 * el permiso por rol de cada endpoint se exige antes, en PermissionsGuard.
 */

export type MetodoHttp = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
export const METODOS: MetodoHttp[] = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
export type AccionUi = 'ver' | 'crear' | 'editar' | 'eliminar';

/** Una ruta real del backend, sin el prefijo /api/v1 (los parametros como `:id`). */
export interface RutaBackend { metodo: MetodoHttp; patron: string; permisos: string[] }

/** Una llamada que hace una pantalla, tal como la escribio el frontend (`*` = segmento variable). */
export interface LlamadaApi { metodos: MetodoHttp[]; patron: string }

export interface PantallaCatalogo {
  codigo: string;
  ruta: string;
  nombre: string;
  modulo: string;
  /** Prefijo de permisos del modulo (p. ej. 'personal:'); null si la pantalla no depende de uno. */
  prefijo: string | null;
  llamadas: LlamadaApi[];
}

/** Rutas cuya accion no es la que sugiere el metodo (p. ej. un POST que solo calcula). */
export interface AccionForzada { metodo: MetodoHttp; patron: string; accion: AccionPantalla }

export interface IndiceMatriz {
  /** 'GET /personal/bomberos/:id' -> codigos de las pantallas que la usan. */
  pantallasPorRuta: Map<string, string[]>;
  /** Codigo -> rutas del backend que usa (incluidas las exentas, para su permiso base). */
  rutasPorPantalla: Map<string, RutaBackend[]>;
  sinResolver: Array<{ codigo: string; llamada: LlamadaApi }>;
}

export const PREFIJO_API = '/api/v1';

export const VERBO_ACCION: Record<AccionPantalla, string> = {
  ver: 'ver', crear: 'crear', editar: 'editar', eliminar: 'eliminar', confidencial: 'ver información confidencial',
};

export function segmentos(patron: string): string[] {
  return patron.split('/').filter(Boolean);
}

export function normalizarPatron(patron: string): string {
  return '/' + segmentos(patron).join('/');
}

/** Patron de Express ('/api/v1/personal/bomberos/:id') sin el prefijo global. */
export function sinPrefijo(rutaExpress: string): string {
  const p = normalizarPatron(rutaExpress);
  if (p === PREFIJO_API) return '/';
  return p.startsWith(`${PREFIJO_API}/`) ? p.slice(PREFIJO_API.length) : p;
}

export const claveRuta = (metodo: string, patron: string) => `${metodo.toUpperCase()} ${normalizarPatron(patron)}`;

function coincide(llamada: string[], ruta: string[], flexible: boolean): boolean {
  if (llamada.length !== ruta.length) return false;
  return llamada.every((s, i) => {
    const esParametro = ruta[i].startsWith(':');
    if (s === '*') return esParametro || flexible;
    return s === ruta[i] || (flexible && esParametro);
  });
}

/**
 * Rutas del backend que corresponden a una llamada. Primero las exactas (`*` solo contra
 * parametros, literal contra literal); si no hay ninguna, las flexibles.
 */
export function resolverLlamada(llamada: LlamadaApi, rutas: RutaBackend[]): RutaBackend[] {
  const seg = segmentos(llamada.patron);
  const candidatas = rutas.filter((r) => llamada.metodos.includes(r.metodo));
  const exactas = candidatas.filter((r) => coincide(seg, segmentos(r.patron), false));
  return exactas.length ? exactas : candidatas.filter((r) => coincide(seg, segmentos(r.patron), true));
}

/**
 * Rutas que la matriz nunca bloquea: administrar la propia matriz (si no, una regla mal
 * puesta dejaria al administrador sin forma de quitarla), la sesion, la salud, el perfil
 * propio y el Centro de mando (que decide seccion por seccion).
 */
const EXENTAS: RegExp[] = [
  /^\/pantallas(\/|$)/, /^\/auth(\/|$)/, /^\/salud(\/|$)/, /^\/centro-mando(\/|$)/,
  /^\/seguridad\/mi-perfil(\/|$)/, /^\/seguridad\/mi-inicio$/,
  /^\/configuracion\/publica$/, /^\/configuracion\/mis-preferencias$/,
];

export function esExenta(patron: string): boolean {
  const p = normalizarPatron(patron);
  return EXENTAS.some((re) => re.test(p));
}

export function construirIndice(pantallas: PantallaCatalogo[], rutas: RutaBackend[]): IndiceMatriz {
  const pantallasPorRuta = new Map<string, string[]>();
  const rutasPorPantalla = new Map<string, RutaBackend[]>();
  const sinResolver: IndiceMatriz['sinResolver'] = [];
  for (const p of pantallas) {
    const propias: RutaBackend[] = [];
    for (const llamada of p.llamadas) {
      const encontradas = resolverLlamada(llamada, rutas);
      if (!encontradas.length) sinResolver.push({ codigo: p.codigo, llamada });
      for (const r of encontradas) if (!propias.includes(r)) propias.push(r);
    }
    rutasPorPantalla.set(p.codigo, propias);
    for (const r of propias) {
      if (esExenta(r.patron)) continue;
      const clave = claveRuta(r.metodo, r.patron);
      const lista = pantallasPorRuta.get(clave) ?? [];
      if (!lista.includes(p.codigo)) lista.push(p.codigo);
      pantallasPorRuta.set(clave, lista);
    }
  }
  return { pantallasPorRuta, rutasPorPantalla, sinResolver };
}

const ACCION_POR_METODO: Record<string, AccionPantalla> = {
  GET: 'ver', HEAD: 'ver', POST: 'crear', PUT: 'editar', PATCH: 'editar', DELETE: 'eliminar',
};

export function accionDe(metodo: string, patron: string, forzadas: AccionForzada[]): AccionPantalla | null {
  const m = metodo.toUpperCase();
  const forzada = forzadas.find((f) => f.metodo === m && normalizarPatron(f.patron) === normalizarPatron(patron));
  return forzada?.accion ?? ACCION_POR_METODO[m] ?? null;
}

export interface DecisionApi { permitido: boolean; codigoDenegado: string | null }

/**
 * Decide una llamada a la API. Se permite si ALGUNA de las pantallas que usan la ruta lo
 * permite a esta persona: sin reglas que le apliquen, o sin denegacion y con alguna regla
 * que conceda la accion. Una ruta compartida (combos, catalogos) sigue disponible
 * mientras otra pantalla permitida la use.
 */
export function decidirApi(codigos: string[], accion: AccionPantalla, reglas: PantallaPermiso[], sujeto: SujetoUsuario): DecisionApi {
  if (!codigos.length) return { permitido: true, codigoDenegado: null };
  let denegado: string | null = null;
  for (const codigo of codigos) {
    const aplicables = reglas.filter((r) => r.pantallaCodigo === codigo && reglaAplica(r, sujeto));
    if (!aplicables.length) return { permitido: true, codigoDenegado: null };
    if (!aplicables.some((r) => r.denegar) && aplicables.some((r) => !!r[accion])) return { permitido: true, codigoDenegado: null };
    denegado ??= codigo;
  }
  return { permitido: false, codigoDenegado: denegado };
}

/** Lo que hace falta, por rol, para ofrecer una accion en la interfaz. */
export interface BaseUi {
  siempre: boolean;
  /** No hay nada que hacer (p. ej. "eliminar" en una pantalla sin DELETE). */
  nunca: boolean;
  /** Alguno de estos permisos; vacio = no exige permiso. */
  algunoDe: string[];
  /** Algun permiso que empiece asi (el prefijo del modulo); null = no exige. */
  prefijo: string | null;
}

export function tieneBase(base: BaseUi, permisos: string[]): boolean {
  if (base.nunca) return false;
  if (base.siempre) return true;
  const porPrefijo = base.prefijo === null || permisos.some((p) => p.startsWith(base.prefijo as string));
  const porPermiso = base.algunoDe.length === 0 || base.algunoDe.some((p) => permisos.includes(p));
  return porPrefijo && porPermiso;
}

const METODOS_DE: Record<AccionUi, MetodoHttp[]> = { ver: ['GET'], crear: ['POST'], editar: ['PUT', 'PATCH'], eliminar: ['DELETE'] };

/**
 * Permiso base de una accion de una pantalla: "ver" exige el prefijo del modulo y alguno de
 * los permisos de sus GET; crear/editar/eliminar, alguno de los permisos de las rutas de
 * esa accion. Una ruta sin permiso (abierta) no exige permiso.
 */
export function baseDePantalla(p: Pick<PantallaCatalogo, 'prefijo'>, rutas: RutaBackend[], accion: AccionUi, forzadas: AccionForzada[]): BaseUi {
  const propias = rutas.filter((r) => accionDe(r.metodo, r.patron, forzadas) === accion
    || (accionDe(r.metodo, r.patron, forzadas) === null && METODOS_DE[accion].includes(r.metodo)));
  if (accion !== 'ver' && propias.length === 0) return { siempre: false, nunca: true, algunoDe: [], prefijo: null };
  const abierta = propias.some((r) => r.permisos.length === 0);
  return {
    siempre: false,
    nunca: false,
    algunoDe: abierta ? [] : [...new Set(propias.flatMap((r) => r.permisos))],
    prefijo: accion === 'ver' ? p.prefijo : null,
  };
}

export interface DecisionUi { permitido: boolean; origen: 'ROL' | 'REGLA' }

export function decidirUiDetalle(base: BaseUi, accion: AccionPantalla, permisos: string[], reglasDeLaPantalla: PantallaPermiso[], sujeto: SujetoUsuario): DecisionUi {
  if (!tieneBase(base, permisos)) return { permitido: false, origen: 'ROL' };
  const aplicables = reglasDeLaPantalla.filter((r) => reglaAplica(r, sujeto));
  if (!aplicables.length) return { permitido: true, origen: 'ROL' };
  if (aplicables.some((r) => r.denegar)) return { permitido: false, origen: 'REGLA' };
  return { permitido: aplicables.some((r) => !!r[accion]), origen: 'REGLA' };
}

export function decidirUi(base: BaseUi, accion: AccionPantalla, permisos: string[], reglasDeLaPantalla: PantallaPermiso[], sujeto: SujetoUsuario): boolean {
  return decidirUiDetalle(base, accion, permisos, reglasDeLaPantalla, sujeto).permitido;
}
```

- [ ] **Step 4: Correr las pruebas**

Run: `cd backend; npx jest src/modules/pantallas/matriz-web.logica.spec.ts`
Expected: PASS (todas).

- [ ] **Step 5: Commit**

```bash
git add backend/src/modules/pantallas/matriz-web.logica.ts backend/src/modules/pantallas/matriz-web.logica.spec.ts
git commit -m "Pantallas: lógica pura de la matriz web (rutas, índice, decisiones)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 5: Catálogo de pantallas: generador ampliado (códigos estables y rutas de API)

**Files:**
- Create: `frontend/scripts/lib/catalogo-pantallas.mjs`
- Create: `frontend/scripts/pantallas-codigos.json`
- Create: `frontend/scripts/pantallas-api-extra.json`
- Modify (reescribir): `frontend/scripts/generar-pantallas.mjs`
- Modify: `frontend/src/lib/navegacion.ts:67-81` (`buscarPantallas` excluye las pantallas de detalle)
- Modify: `frontend/package.json` (scripts `test` y `verificar:pantallas`)
- Modify: `.github/workflows/build.yml` (paso de verificación del catálogo en el job frontend)
- Generated: `frontend/src/lib/pantallas.generado.ts`, `backend/src/modules/pantallas/catalogo-web.generado.ts`
- Test: `frontend/scripts/pruebas/catalogo-pantallas.test.mjs`

**Interfaces:**
- Consumes: `PantallaCatalogo`, `AccionForzada` (tipos de Task 4).
- Produces:
  - `frontend/src/lib/pantallas.generado.ts`: `interface PantallaRegistrada { ruta: string; nombre: string; modulo: string; codigo: string | null; detalle: boolean }` y `PANTALLAS: PantallaRegistrada[]` (incluye las de detalle con `[param]` en la ruta).
  - `backend/src/modules/pantallas/catalogo-web.generado.ts`: `PANTALLAS_WEB: PantallaCatalogo[]`, `ACCIONES_FORZADAS: AccionForzada[]`, `LLAMADAS_SIN_RESOLVER: Array<{ codigo: string; ruta: string; texto: string }>`.
  - `catalogo-pantallas.mjs`: `extraerLlamadas(fuente) → { llamadas: Array<{metodos: string[], patron: string}>, sinResolver: string[] }`, `asignarCodigos(rutas, previos) → Record<string,string>`, `prefijosDeModulos(fuenteModulos) → Record<string, string|null>`, `importsLocales(fuente) → string[]`, `FUERA_DE_LA_MATRIZ: Set<string>`.

- [ ] **Step 1: Pruebas que fallan**

`frontend/scripts/pruebas/catalogo-pantallas.test.mjs`:

```js
/**
 * Pruebas del catálogo de pantallas que alimenta la matriz de permisos web.
 * Correr: node --test scripts/pruebas/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { asignarCodigos, extraerLlamadas, importsLocales, prefijosDeModulos } from '../lib/catalogo-pantallas.mjs';

const una = (fuente) => extraerLlamadas(fuente).llamadas;

test('literal simple es GET', () => {
  assert.deepEqual(una("apiFetch('/personal/bomberos')"), [{ metodos: ['GET'], patron: '/personal/bomberos' }]);
});

test('un ${…} entero es un segmento variable y se lee el método', () => {
  assert.deepEqual(una("apiFetch(`/personal/bomberos/${id}`, { method: 'DELETE' })"), [{ metodos: ['DELETE'], patron: '/personal/bomberos/*' }]);
  assert.deepEqual(una('apiFetch(`/a/${b}/c`)'), [{ metodos: ['GET'], patron: '/a/*/c' }]);
});

test('la consulta no cuenta, aunque venga dentro de una expresión', () => {
  assert.deepEqual(una('apiFetch(`/despacho/solicitudes?abiertas=${x}`)'), [{ metodos: ['GET'], patron: '/despacho/solicitudes' }]);
  assert.deepEqual(una("apiFetch(`/flota/vencimientos${q ? `?dias=${q}` : ''}`)"), [{ metodos: ['GET'], patron: '/flota/vencimientos' }]);
});

test('descargarArchivo con o sin /api/v1', () => {
  assert.deepEqual(una("descargarArchivo(`/personal/bomberos/exportar/excel${f ? `?estado=${f}` : ''}`, 'p.xlsx')"), [{ metodos: ['GET'], patron: '/personal/bomberos/exportar/excel' }]);
  assert.deepEqual(una("descargarArchivo('/api/v1/flota/informe/x/pdf', 'i.pdf')"), [{ metodos: ['GET'], patron: '/flota/informe/x/pdf' }]);
});

test('fetch solo cuenta si va a la API', () => {
  assert.deepEqual(una("fetch(`${API_URL}/auth/login`, { method: 'POST', body })"), [{ metodos: ['POST'], patron: '/auth/login' }]);
  assert.deepEqual(una("fetch('https://tile.openstreetmap.org/1/2/3.png')"), []);
});

test('método condicional o en una variable', () => {
  assert.deepEqual(una("apiFetch('/x', { method: editando ? 'PUT' : 'POST', body })"), [{ metodos: ['POST', 'PUT'], patron: '/x' }]);
  assert.deepEqual(una("apiFetch('/x', opciones)"), [{ metodos: ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'], patron: '/x' }]);
});

test('una ruta en una variable se informa como no resuelta', () => {
  const r = extraerLlamadas('apiFetch(url)');
  assert.deepEqual(r.llamadas, []);
  assert.deepEqual(r.sinResolver, ['url']);
});

test('el mismo patrón llamado dos veces se une', () => {
  assert.deepEqual(una("apiFetch('/x'); apiFetch('/x', { method: 'POST' })"), [{ metodos: ['GET', 'POST'], patron: '/x' }]);
});

test('los códigos ya asignados no cambian y los nuevos siguen la numeración', () => {
  const previos = { '/dashboard/centro-mando': '0xC001', '/dashboard/b': '0xB002' };
  const r = asignarCodigos(['/dashboard/c', '/dashboard/b', '/dashboard/a', '/dashboard/centro-mando'], previos);
  assert.equal(r['/dashboard/b'], '0xB002');
  assert.equal(r['/dashboard/centro-mando'], '0xC001');
  assert.equal(r['/dashboard/a'], '0xB003');
  assert.equal(r['/dashboard/c'], '0xB004');
  // una ruta que desaparecio conserva su codigo (las reglas lo referencian)
  assert.equal(asignarCodigos([], r)['/dashboard/a'], '0xB003');
});

test('prefijos de permisos por módulo', () => {
  const fuente = "{ slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true }\n{ slug: 'centro-mando', nombre: 'Centro de mando', icono: 'flame', permisoPrefijo: '', disponible: true }";
  assert.deepEqual(prefijosDeModulos(fuente), { personal: 'personal:', 'centro-mando': null });
});

test('imports locales, sin los de tipos ni los de paquetes', () => {
  const fuente = "import { a } from './a';\nimport type { T } from './t';\nimport {\n  b,\n  c,\n} from '@/lib/b';\nimport React from 'react';\nimport './estilos.css';";
  assert.deepEqual(importsLocales(fuente), ['./a', '@/lib/b', './estilos.css']);
});
```

- [ ] **Step 2: Correrlas**

Run: `cd frontend; node --test scripts/pruebas/catalogo-pantallas.test.mjs`
Expected: FAIL (`Cannot find module '../lib/catalogo-pantallas.mjs'`).

- [ ] **Step 3: Implementar `frontend/scripts/lib/catalogo-pantallas.mjs`**

```js
/**
 * Lógica pura del catálogo de pantallas (la usa generar-pantallas.mjs y se prueba con
 * node --test). Sin dependencias.
 *
 * Para la matriz de permisos web hace falta saber a qué rutas de la API llama cada
 * pantalla: se leen las llamadas apiFetch / descargarArchivo / fetch(`${API_URL}…`) del
 * código fuente con un lexer mínimo (cadenas, plantillas y paréntesis balanceados).
 */

export const METODOS = ['DELETE', 'GET', 'PATCH', 'POST', 'PUT'];

/** Rutas web que no entran a la matriz: son de cada persona o no son destinos. */
export const FUERA_DE_LA_MATRIZ = new Set([
  '/dashboard', '/dashboard/mi-perfil', '/dashboard/mi-perfil/preferencias', '/dashboard/mi-perfil/seguridad', '/dashboard/reportar',
]);

const ABRE = '\u0001';
const CIERRA = '\u0002';

/** `i` apunta a la comilla de apertura; devuelve el índice siguiente al cierre. */
function saltarCadena(fuente, i) {
  const comilla = fuente[i];
  let j = i + 1;
  while (j < fuente.length) {
    const c = fuente[j];
    if (c === '\\') { j += 2; continue; }
    if (comilla === '`' && c === '$' && fuente[j + 1] === '{') { j = saltarExpresion(fuente, j + 2); continue; }
    if (c === comilla) return j + 1;
    j++;
  }
  return j;
}

/** `i` apunta justo después de `${`; devuelve el índice siguiente a la `}` que la cierra. */
function saltarExpresion(fuente, i) {
  let profundidad = 1;
  let j = i;
  while (j < fuente.length && profundidad > 0) {
    const c = fuente[j];
    if (c === '\'' || c === '"' || c === '`') { j = saltarCadena(fuente, j); continue; }
    if (c === '{') profundidad++;
    else if (c === '}') profundidad--;
    j++;
  }
  return j;
}

/** Texto entre paréntesis balanceados; `i` apunta justo después de `(`. */
function argumentosDesde(fuente, i) {
  let profundidad = 1;
  let j = i;
  while (j < fuente.length) {
    const c = fuente[j];
    if (c === '\'' || c === '"' || c === '`') { j = saltarCadena(fuente, j); continue; }
    if (c === '(' || c === '[' || c === '{') profundidad++;
    else if (c === ')' || c === ']' || c === '}') {
      profundidad--;
      if (profundidad === 0) return fuente.slice(i, j);
    }
    j++;
  }
  return null;
}

function dividirArgumentos(args) {
  const partes = [];
  let profundidad = 0;
  let inicio = 0;
  let j = 0;
  while (j < args.length) {
    const c = args[j];
    if (c === '\'' || c === '"' || c === '`') { j = saltarCadena(args, j); continue; }
    if (c === '(' || c === '[' || c === '{') profundidad++;
    else if (c === ')' || c === ']' || c === '}') profundidad--;
    else if (c === ',' && profundidad === 0) { partes.push(args.slice(inicio, j).trim()); inicio = j + 1; }
    j++;
  }
  const ultima = args.slice(inicio).trim();
  if (ultima) partes.push(ultima);
  return partes;
}

/**
 * Contenido de UN literal de cadena o plantilla, con cada `${…}` reemplazado por
 * ABRE + (el identificador, si es uno simple) + CIERRA. null si no es un literal único.
 */
function contenidoLiteral(expresion) {
  const e = expresion.trim();
  const q = e[0];
  if (q !== '\'' && q !== '"' && q !== '`') return null;
  if (saltarCadena(e, 0) !== e.length) return null;
  let salida = '';
  let j = 1;
  while (j < e.length - 1) {
    const c = e[j];
    if (c === '\\') { salida += e[j + 1] ?? ''; j += 2; continue; }
    if (q === '`' && c === '$' && e[j + 1] === '{') {
      const fin = saltarExpresion(e, j + 2);
      const interior = e.slice(j + 2, fin - 1).trim();
      salida += ABRE + (/^[\w.]+$/.test(interior) ? interior : '') + CIERRA;
      j = fin;
      continue;
    }
    salida += c;
    j++;
  }
  return salida;
}

function cortarConsulta(texto) {
  let dentro = false;
  for (let i = 0; i < texto.length; i++) {
    if (texto[i] === ABRE) dentro = true;
    else if (texto[i] === CIERRA) dentro = false;
    else if (texto[i] === '?' && !dentro) return texto.slice(0, i);
  }
  return texto;
}

const SOLO_EXPRESION = new RegExp(`^${ABRE}[^${CIERRA}]*${CIERRA}$`);
const LITERAL_Y_SUFIJO = new RegExp(`^([^${ABRE}]+)${ABRE}[^${CIERRA}]*${CIERRA}$`);

/** Patrón de API ('/a/*') a partir del contenido del literal; undefined = no es la API; null = no se puede saber. */
function patronDeRuta(contenido, funcion) {
  let t = contenido;
  if (funcion === 'fetch') {
    const m = t.match(new RegExp(`^${ABRE}(API_URL|API_ORIGIN)${CIERRA}`));
    if (!m) return undefined;
    t = t.slice(m[0].length);
    if (m[1] === 'API_ORIGIN') {
      if (!t.startsWith('/api/v1')) return undefined;
      t = t.slice('/api/v1'.length);
    }
  }
  if (t.startsWith('/api/v1/')) t = t.slice('/api/v1'.length);
  if (!t.startsWith('/')) return null;
  const tramos = cortarConsulta(t).split('/').filter(Boolean);
  const salida = tramos.map((s, i) => {
    if (!s.includes(ABRE)) return s;
    if (SOLO_EXPRESION.test(s)) return '*';
    const m = s.match(LITERAL_Y_SUFIJO);
    // 'excel${consulta}' al final: lo variable es la consulta, el tramo es 'excel'
    if (m && i === tramos.length - 1) return m[1];
    return '*';
  });
  return '/' + salida.join('/');
}

function metodosDe(funcion, opciones) {
  if (funcion === 'descargarArchivo' || !opciones) return ['GET'];
  if (!opciones.startsWith('{')) return [...METODOS];
  const m = opciones.match(/\bmethod\s*:\s*([^,}]+)/);
  if (!m) return ['GET'];
  const encontrados = [...m[1].matchAll(/['"`](GET|POST|PUT|PATCH|DELETE)['"`]/g)].map((x) => x[1]);
  return encontrados.length ? [...new Set(encontrados)].sort() : [...METODOS];
}

export function extraerLlamadas(fuente) {
  const porPatron = new Map();
  const sinResolver = [];
  const re = /\b(apiFetch|descargarArchivo|fetch)\s*\(/g;
  let m;
  while ((m = re.exec(fuente))) {
    const args = argumentosDesde(fuente, m.index + m[0].length);
    if (args === null) continue;
    const partes = dividirArgumentos(args);
    if (!partes.length) continue;
    const contenido = contenidoLiteral(partes[0]);
    if (contenido === null) {
      if (m[1] !== 'fetch') sinResolver.push(partes[0].slice(0, 120));
      continue;
    }
    const patron = patronDeRuta(contenido, m[1]);
    if (patron === undefined) continue;
    if (patron === null) { sinResolver.push(partes[0].slice(0, 120)); continue; }
    const metodos = porPatron.get(patron) ?? new Set();
    for (const x of metodosDe(m[1], partes[1])) metodos.add(x);
    porPatron.set(patron, metodos);
  }
  const llamadas = [...porPatron].map(([patron, metodos]) => ({ metodos: [...metodos].sort(), patron }));
  return { llamadas, sinResolver };
}

/** Especificadores de import locales (relativos o '@/'), sin los `import type`. */
export function importsLocales(fuente) {
  const salida = [];
  for (const m of fuente.matchAll(/^\s*import\s+(?!type\b)([^'";]*?)\s+from\s+['"]([^'"]+)['"]/gm)) salida.push(m[2]);
  for (const m of fuente.matchAll(/^\s*import\s+['"]([^'"]+)['"]/gm)) salida.push(m[1]);
  return salida.filter((s) => s.startsWith('.') || s.startsWith('@/'));
}

/** Los códigos asignados no cambian nunca; los nuevos siguen la numeración 0xB…. */
export function asignarCodigos(rutas, previos) {
  const codigos = { ...previos };
  const usados = new Set(Object.values(codigos));
  const numerosB = Object.values(codigos).filter((c) => /^0xB[0-9A-F]{3}$/.test(c)).map((c) => parseInt(c.slice(2), 16));
  let siguiente = Math.max(0xb000, ...numerosB) + 1;
  for (const ruta of [...new Set(rutas)].sort()) {
    if (codigos[ruta]) continue;
    let codigo;
    do {
      if (siguiente > 0xbfff) throw new Error('Se agotaron los códigos 0xB…');
      codigo = '0x' + siguiente.toString(16).toUpperCase().padStart(4, '0');
      siguiente++;
    } while (usados.has(codigo));
    codigos[ruta] = codigo;
    usados.add(codigo);
  }
  return Object.fromEntries(Object.entries(codigos).sort(([a], [b]) => a.localeCompare(b)));
}

/** slug -> prefijo de permisos, leido de src/lib/modulos.ts ('' => null). */
export function prefijosDeModulos(fuenteModulos) {
  const mapa = {};
  for (const m of fuenteModulos.matchAll(/slug:\s*'([^']+)'[^}]*?permisoPrefijo:\s*'([^']*)'/g)) mapa[m[1]] = m[2] || null;
  return mapa;
}
```

- [ ] **Step 4: Correr las pruebas**

Run: `cd frontend; node --test scripts/pruebas/catalogo-pantallas.test.mjs`
Expected: PASS.

- [ ] **Step 5: Archivos de códigos y de rutas extra**

`frontend/scripts/pantallas-codigos.json` (los `0xC…` quedan fijados antes de que existan las pantallas; el generador agrega el resto):

```json
{
  "/dashboard/centro-mando": "0xC001",
  "/dashboard/sistema": "0xC010",
  "/dashboard/sistema/app-movil": "0xC013",
  "/dashboard/sistema/datos": "0xC012",
  "/dashboard/sistema/registros": "0xC014",
  "/dashboard/sistema/tareas": "0xC011"
}
```

`frontend/scripts/pantallas-api-extra.json` (`llamadas`: lo que el generador no puede deducir, por ruta web; `acciones`: POST que no crean nada):

```json
{
  "llamadas": {},
  "acciones": [
    { "metodo": "POST", "patron": "/finanzas/beneficios/simular", "accion": "ver" },
    { "metodo": "POST", "patron": "/configuracion/admin/borradores/:id/validar", "accion": "editar" }
  ]
}
```

- [ ] **Step 6: Reescribir `frontend/scripts/generar-pantallas.mjs`**

```js
/**
 * Genera el catálogo de pantallas recorriendo el árbol de rutas:
 *  - src/lib/pantallas.generado.ts: migas de pan, buscador (Ctrl+K) y matriz en la web;
 *  - ../backend/src/modules/pantallas/catalogo-web.generado.ts: qué rutas de la API llama
 *    cada pantalla, para que el backend aplique la matriz de permisos por pantalla.
 * Los códigos de pantalla viven en scripts/pantallas-codigos.json y nunca se renumeran.
 *
 * Correr: npm run generar:pantallas        (escribe)
 *         npm run verificar:pantallas      (falla si lo generado no está al día; lo usa CI)
 */
import { readFile, writeFile, readdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join, relative, resolve, sep } from 'node:path';
import { asignarCodigos, extraerLlamadas, FUERA_DE_LA_MATRIZ, importsLocales, prefijosDeModulos } from './lib/catalogo-pantallas.mjs';

const VERIFICAR = process.argv.includes('--verificar');
const FRONT = process.cwd();
const SRC = join(FRONT, 'src');
const RAIZ = join(SRC, 'app', 'dashboard');
const SALIDA_FRONT = join(SRC, 'lib', 'pantallas.generado.ts');
const SALIDA_BACK = join(FRONT, '..', 'backend', 'src', 'modules', 'pantallas', 'catalogo-web.generado.ts');
const CODIGOS = join(FRONT, 'scripts', 'pantallas-codigos.json');
const EXTRA = join(FRONT, 'scripts', 'pantallas-api-extra.json');
const NO_RECORRER = new Set([join(SRC, 'lib', 'api.ts'), SALIDA_FRONT]);

/** Etiquetas legibles que los submenús ya declaran en su array TABS. */
async function etiquetasDeLosSubmenus(dir, mapa = new Map()) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) await etiquetasDeLosSubmenus(r, mapa);
    else if (e.name === 'layout.tsx') {
      const src = await readFile(r, 'utf8');
      for (const m of src.matchAll(/href: '([^']+)',\s*label: '([^']+)'/g)) mapa.set(m[1], m[2]);
    }
  }
  return mapa;
}

const CON_ACENTO = new Map(Object.entries({
  'organizacion': 'Organización', 'deposito': 'Depósito', 'vehiculos': 'Vehículos',
  'academia': 'Academia', 'documentos': 'Documentos', 'inteligencia': 'Inteligencia artificial',
  'mi-perfil': 'Mi perfil', 'seguridad': 'Seguridad', 'guardias': 'Guardias',
}));

/** Rutas cuyo último segmento no se explica solo ("Nuevo", "[id]"). */
const NOMBRES_POR_RUTA = new Map(Object.entries({
  '/dashboard/personal/nuevo': 'Nuevo bombero',
  '/dashboard/servicios/nuevo': 'Nuevo servicio',
  '/dashboard/guardias/ordenes/nueva': 'Nueva orden de guardia',
  '/dashboard/guardias/ordenes/configuracion': 'Configuración de órdenes',
  '/dashboard/seguridad/inteligencia-artificial': 'Inteligencia artificial',
  '/dashboard/seguridad/inteligencia-artificial/auditoria': 'Auditoría de IA',
  '/dashboard/seguridad/inteligencia-artificial/configuracion': 'Configuración de IA',
  '/dashboard/centro-mando': 'Centro de mando',
  '/dashboard/personal/[id]': 'Legajo del bombero',
  '/dashboard/academia/[id]': 'Detalle de curso',
  '/dashboard/asistencia/eventos/[id]': 'Detalle de evento de asistencia',
  '/dashboard/denuncias/[id]': 'Detalle de denuncia',
  '/dashboard/deposito/articulos/[id]': 'Ficha de artículo',
  '/dashboard/deposito/inventarios-fisicos/[id]': 'Detalle de inventario físico',
  '/dashboard/documentos/[id]': 'Detalle de documento',
  '/dashboard/documentos/expedientes/[id]': 'Detalle de expediente',
  '/dashboard/equipos/[id]': 'Ficha de equipo',
  '/dashboard/finanzas/socios-protectores/[id]': 'Ficha de socio protector',
  '/dashboard/guardias/[id]': 'Detalle de guardia',
  '/dashboard/guardias/grupos/[id]': 'Detalle de grupo de guardia',
  '/dashboard/guardias/ordenes/[id]': 'Detalle de orden de guardia',
  '/dashboard/guardias/sorteos/[id]': 'Detalle de sorteo',
  '/dashboard/seguridad/usuarios/[id]': 'Ficha de usuario',
  '/dashboard/vehiculos/[id]': 'Ficha de vehículo',
}));

function titulizar(slug) {
  if (CON_ACENTO.has(slug)) return CON_ACENTO.get(slug);
  const texto = slug.replace(/-/g, ' ');
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

function nombreDeRuta(ruta, etiquetas) {
  if (NOMBRES_POR_RUTA.has(ruta)) return NOMBRES_POR_RUTA.get(ruta);
  if (etiquetas.has(ruta)) return etiquetas.get(ruta);
  const segmentos = ruta.split('/').filter(Boolean);
  if (segmentos.length === 1) return 'Inicio';
  const ultimo = segmentos[segmentos.length - 1];
  if (ultimo.startsWith('[')) return `${nombreDeRuta('/' + segmentos.slice(0, -1).join('/'), etiquetas)} › Detalle`;
  return titulizar(ultimo);
}

async function paginas(dir, acumulado = []) {
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const r = join(dir, e.name);
    if (e.isDirectory()) await paginas(r, acumulado);
    else if (e.name === 'page.tsx') acumulado.push(r);
  }
  return acumulado;
}

function resolverImport(desde, especificador) {
  const base = especificador.startsWith('@/') ? join(SRC, especificador.slice(2)) : resolve(dirname(desde), especificador);
  for (const c of [base, `${base}.ts`, `${base}.tsx`, join(base, 'index.ts'), join(base, 'index.tsx')]) {
    if (/\.(ts|tsx)$/.test(c) && existsSync(c)) return c;
  }
  return null;
}

const posix = (p) => relative(FRONT, p).split(sep).join('/');

/** Llamadas de una página y de todo lo que importa dentro de src/ (componentes, lib). */
async function llamadasDePagina(archivo) {
  const visitados = new Set();
  const pendientes = [archivo];
  const porPatron = new Map();
  const sinResolver = [];
  while (pendientes.length) {
    const actual = pendientes.pop();
    if (visitados.has(actual) || NO_RECORRER.has(actual)) continue;
    visitados.add(actual);
    const fuente = await readFile(actual, 'utf8');
    const r = extraerLlamadas(fuente);
    for (const ll of r.llamadas) {
      const s = porPatron.get(ll.patron) ?? new Set();
      ll.metodos.forEach((m) => s.add(m));
      porPatron.set(ll.patron, s);
    }
    for (const texto of r.sinResolver) sinResolver.push(`${posix(actual)}: ${texto}`);
    for (const imp of importsLocales(fuente)) {
      const destino = resolverImport(actual, imp);
      if (destino && destino.startsWith(SRC)) pendientes.push(destino);
    }
  }
  const llamadas = [...porPatron].map(([patron, s]) => ({ metodos: [...s].sort(), patron })).sort((a, b) => a.patron.localeCompare(b.patron));
  return { llamadas, sinResolver };
}

const etiquetas = await etiquetasDeLosSubmenus(RAIZ);
const prefijos = prefijosDeModulos(await readFile(join(SRC, 'lib', 'modulos.ts'), 'utf8'));
const extra = JSON.parse(await readFile(EXTRA, 'utf8'));
const previos = JSON.parse(await readFile(CODIGOS, 'utf8'));

const pantallas = [];
for (const archivo of await paginas(RAIZ)) {
  const segmentos = relative(join(SRC, 'app'), archivo).split(sep).slice(0, -1);
  const ruta = '/' + segmentos.join('/');
  if (ruta === '/dashboard/[modulo]') continue;
  pantallas.push({ archivo, ruta, nombre: nombreDeRuta(ruta, etiquetas), modulo: segmentos[1] ?? 'inicio', detalle: segmentos.some((s) => s.startsWith('[')) });
}
pantallas.sort((a, b) => a.ruta.localeCompare(b.ruta));

const enMatriz = pantallas.filter((p) => !FUERA_DE_LA_MATRIZ.has(p.ruta));
const codigos = asignarCodigos(enMatriz.map((p) => p.ruta), previos);

const catalogo = [];
const sinResolver = [];
for (const p of enMatriz) {
  const { llamadas, sinResolver: propias } = await llamadasDePagina(p.archivo);
  const extras = extra.llamadas?.[p.ruta] ?? [];
  catalogo.push({ codigo: codigos[p.ruta], ruta: p.ruta, nombre: p.nombre, modulo: p.modulo, prefijo: prefijos[p.modulo] ?? null, llamadas: [...llamadas, ...extras] });
  for (const texto of propias) sinResolver.push({ codigo: codigos[p.ruta], ruta: p.ruta, texto });
}

const salidaFront = `// GENERADO por scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: npm run generar:pantallas

export interface PantallaRegistrada {
  /** Ruta absoluta; las de detalle llevan el parametro entre corchetes ('/dashboard/personal/[id]'). */
  ruta: string;
  /** Nombre legible: el del submenu si existe, si no derivado del slug. */
  nombre: string;
  /** Slug del modulo al que pertenece, para filtrar por permisos. */
  modulo: string;
  /** Codigo en la matriz de permisos por pantalla; null = fuera de la matriz (Inicio, Mi perfil, Reportar). */
  codigo: string | null;
  /** Pantalla de detalle (ruta con parametro): no es un destino del buscador. */
  detalle: boolean;
}

export const PANTALLAS: PantallaRegistrada[] = ${JSON.stringify(pantallas.map((p) => ({ ruta: p.ruta, nombre: p.nombre, modulo: p.modulo, codigo: codigos[p.ruta] ?? null, detalle: p.detalle })), null, 2)};
`;

const salidaBack = `// GENERADO por frontend/scripts/generar-pantallas.mjs — no editar a mano.
// Volver a generar con: cd frontend; npm run generar:pantallas

import type { AccionForzada, PantallaCatalogo } from './matriz-web.logica';

export const PANTALLAS_WEB: PantallaCatalogo[] = ${JSON.stringify(catalogo, null, 2)};

export const ACCIONES_FORZADAS: AccionForzada[] = ${JSON.stringify(extra.acciones ?? [], null, 2)};

/** Llamadas que el generador no pudo convertir en ruta (se ven en Sistema › Estado). */
export const LLAMADAS_SIN_RESOLVER: Array<{ codigo: string; ruta: string; texto: string }> = ${JSON.stringify(sinResolver, null, 2)};
`;

const salidaCodigos = `${JSON.stringify(codigos, null, 2)}\n`;
const archivos = [[SALIDA_FRONT, salidaFront], [SALIDA_BACK, salidaBack], [CODIGOS, salidaCodigos]];

if (VERIFICAR) {
  const desactualizados = [];
  for (const [ruta, contenido] of archivos) {
    const actual = existsSync(ruta) ? (await readFile(ruta, 'utf8')).replace(/\r\n/g, '\n') : null;
    if (actual !== contenido) desactualizados.push(posix(ruta));
  }
  if (desactualizados.length) {
    console.error(`El catálogo de pantallas no está al día: ${desactualizados.join(', ')}. Correr: npm run generar:pantallas`);
    process.exit(1);
  }
  console.log(`Catálogo al día: ${pantallas.length} pantallas, ${catalogo.length} en la matriz.`);
} else {
  for (const [ruta, contenido] of archivos) await writeFile(ruta, contenido, 'utf8');
  console.log(`${pantallas.length} pantallas registradas (${catalogo.length} en la matriz). Llamadas sin resolver: ${sinResolver.length}.`);
  for (const s of sinResolver.slice(0, 40)) console.log(`  · ${s.ruta} — ${s.texto}`);
}
```

- [ ] **Step 7: El buscador no ofrece pantallas de detalle**

En `frontend/src/lib/navegacion.ts`, dentro de `buscarPantallas`, cambiar el primer `.filter(...)` por:

```ts
    .filter((p) => !p.detalle)
    .filter((p) => p.modulo === 'inicio' || p.modulo === 'mi-perfil' || p.modulo === 'reportar' || visibles.has(p.modulo))
```

- [ ] **Step 8: Scripts de npm y CI**

En `frontend/package.json`, scripts:

```json
    "generar:pantallas": "node scripts/generar-pantallas.mjs",
    "verificar:pantallas": "node scripts/generar-pantallas.mjs --verificar",
    "test": "node --test scripts/pruebas/"
```

En `.github/workflows/build.yml`, job `build`, después del paso `if: matrix.proyecto == 'frontend'` existente agregar:

```yaml
      - if: matrix.proyecto == 'frontend'
        run: npm run verificar:pantallas
      - if: matrix.proyecto == 'frontend'
        run: npm test
```

- [ ] **Step 9: Generar y revisar lo no resuelto**

Run: `cd frontend; npm run generar:pantallas`
Expected: "N pantallas registradas (M en la matriz)", con N ≈ 128 y M ≈ 123. Revisar la lista de "sin resolver": por cada una que sea una ruta real de la API (abrir el archivo indicado), agregarla en `pantallas-api-extra.json` → `llamadas["<ruta web>"]` con `{ "metodos": [...], "patron": "/..." }` y volver a generar. Las que no son llamadas a la API (falsos positivos) se dejan.
Then: `git diff --stat frontend/scripts/pantallas-codigos.json` → todas las rutas con código; las `0xC…` intactas.

- [ ] **Step 10: Compilar ambos lados y correr las pruebas**

Run: `cd frontend; npx tsc --noEmit; npm test; npm run verificar:pantallas`
Run: `cd backend; npx tsc --noEmit -p tsconfig.json`
Expected: sin errores; "Catálogo al día".

- [ ] **Step 11: Commit**

```bash
git add frontend/scripts frontend/src/lib/pantallas.generado.ts frontend/src/lib/navegacion.ts frontend/package.json .github/workflows/build.yml backend/src/modules/pantallas/catalogo-web.generado.ts
git commit -m "Pantallas: catálogo web con códigos estables y rutas de API por pantalla

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 6: MatrizWebService, control en `PermissionsGuard` y endpoints de la matriz

**Files:**
- Create: `backend/src/modules/pantallas/sujeto.ts`
- Create: `backend/src/modules/pantallas/catalogo-secciones.ts`
- Create: `backend/src/modules/pantallas/matriz-web.service.ts`
- Create: `backend/src/modules/pantallas/matriz-web.module.ts`
- Modify: `backend/src/modules/pantallas/pantallas.service.ts` (delegar `sujeto`, invalidar caché, sincronizar al listar)
- Modify: `backend/src/modules/pantallas/pantallas.controller.ts` (tres endpoints nuevos)
- Modify: `backend/src/modules/seguridad/guards/permissions.guard.ts`
- Modify: `backend/src/app.module.ts` (importar `MatrizWebModule`)
- Test: `backend/src/modules/pantallas/matriz-web.service.spec.ts`

**Interfaces:**
- Consumes: Task 4 (`matriz-web.logica.ts`), Task 5 (`catalogo-web.generado.ts`).
- Produces:
  - `resolverSujeto(dataSource: DataSource, usuarioId: string, ahora?: Date): Promise<SujetoUsuario>`, `sujetoVacio(usuarioId: string): SujetoUsuario` (en `sujeto.ts`).
  - `type ClaveSeccion = 'accesos' | 'emergencias' | 'alertas' | 'moviles' | 'personal' | 'guardia' | 'convocatorias' | 'mi_actividad' | 'pendientes' | 'sistema'`, `interface SeccionCentroMando { clave: ClaveSeccion; codigo: string; nombre: string; descripcion: string; base: 'SIEMPRE' | string[] }`, `SECCIONES_CENTRO_MANDO: SeccionCentroMando[]` (en `catalogo-secciones.ts`).
  - `MatrizWebService` con: `onApplicationBootstrap()`, `sincronizar(): Promise<void>`, `estaSincronizada(): boolean`, `invalidar(): void`, `exigirEnRuta(user: UsuarioMatriz, metodo: string, rutaExpress: string | undefined): Promise<void>`, `misPermisosWeb(user: UsuarioMatriz): Promise<{ generadoEn: Date; activa: boolean; pantallas: Array<{ codigo: string; ruta: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean }> }>`, `evaluadorSecciones(user: UsuarioMatriz): Promise<(clave: ClaveSeccion) => boolean>`, `vistaPrevia(usuarioId: string)`, `catalogoParaAdministrar()`, `estado(): EstadoMatriz`.
  - `interface UsuarioMatriz { id: string; permisos: string[] }`, `interface EstadoMatriz { activa: boolean; sincronizada: boolean; error: string | null; pantallas: number; secciones: number; rutasBackend: number; llamadasSinResolver: number }`, token `CATALOGO_PANTALLAS_WEB` e `interface CatalogoWeb { pantallas: PantallaCatalogo[]; forzadas: AccionForzada[]; sinResolver: number }`.
  - Endpoints: `GET /pantallas/mis-permisos-web` (cualquier autenticado), `GET /pantallas/vista-previa?usuarioId=` y `GET /pantallas/catalogo-web` (`seguridad:gestionar_pantallas`).

- [ ] **Step 1: Pruebas que fallan**

`backend/src/modules/pantallas/matriz-web.service.spec.ts`:

```ts
import { Controller, Delete, ForbiddenException, Get } from '@nestjs/common';
import { MetadataScanner, Reflector } from '@nestjs/core';
import { Pantalla, PantallaPermiso } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CatalogoWeb, MatrizWebService } from './matriz-web.service';

@Controller('demo')
@RequirePermission('demo:ver')
class DemoController {
  @Get() listar() { return []; }
  @Get(':id') uno() { return {}; }
  @Delete(':id') @RequirePermission('demo:eliminar') borrar() { return {}; }
}

@Controller('pantallas')
class PantallasDemo {
  @Get('reglas') reglas() { return []; }
}

const catalogo: CatalogoWeb = {
  pantallas: [
    { codigo: '0xB101', ruta: '/dashboard/demo', nombre: 'Demo', modulo: 'demo', prefijo: 'demo:', llamadas: [
      { metodos: ['GET'], patron: '/demo' }, { metodos: ['DELETE'], patron: '/demo/*' }, { metodos: ['GET'], patron: '/pantallas/reglas' },
    ] },
    { codigo: '0xB102', ruta: '/dashboard/otra', nombre: 'Otra', modulo: 'demo', prefijo: 'demo:', llamadas: [{ metodos: ['GET'], patron: '/demo' }] },
  ],
  forzadas: [],
  sinResolver: 0,
};

const discovery = { getControllers: () => [DemoController, PantallasDemo].map((C) => ({ instance: new C(), metatype: C })) };
const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };
const moduleRef = { get: jest.fn(() => auditoria) };
const user = { id: 'u1', permisos: ['demo:ver', 'demo:eliminar'] };

async function nueva(base: BaseFalsa) {
  const s = new MatrizWebService(discovery as never, new MetadataScanner(), moduleRef as never, base as never, catalogo);
  await s.onApplicationBootstrap();
  return s;
}

function regla(base: BaseFalsa, o: Partial<PantallaPermiso>) {
  return base.getRepository(PantallaPermiso as never).save(Object.assign(new PantallaPermiso(), {
    pantallaCodigo: '0xB101', sujetoTipo: 'USUARIO', sujetoId: 'u1', ver: false, crear: false, editar: false,
    eliminar: false, confidencial: false, denegar: false, creadoPor: null, actualizadoEn: new Date(), ...o,
  }) as never);
}

describe('MatrizWebService', () => {
  let base: BaseFalsa;
  beforeEach(() => { base = new BaseFalsa(); auditoria.registrar.mockClear(); });

  it('lee las rutas reales de los controladores con el permiso de cada una', async () => {
    const s = await nueva(base);
    const demo = s.catalogoParaAdministrar().pantallas.find((p) => p.codigo === '0xB101')!;
    expect(demo.rutasApi).toEqual(expect.arrayContaining([
      { metodo: 'GET', patron: '/demo', permisos: ['demo:ver'], exenta: false },
      { metodo: 'DELETE', patron: '/demo/:id', permisos: ['demo:eliminar'], exenta: false },
      { metodo: 'GET', patron: '/pantallas/reglas', permisos: [], exenta: true },
    ]));
    expect(s.estado()).toMatchObject({ activa: true, sincronizada: true, rutasBackend: 4 });
  });

  it('sin reglas configuradas no cambia nada', async () => {
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
  });

  it('una regla que concede ver pero no eliminar devuelve 403 con el nombre de la pantalla, y audita una sola vez', async () => {
    await regla(base, { ver: true });
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toThrow(/eliminar en «Demo»/);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
    expect(auditoria.registrar).toHaveBeenCalledTimes(1);
    await expect(s.exigirEnRuta(user, 'GET', '/api/v1/demo/:id')).resolves.toBeUndefined();
  });

  it('una ruta compartida sigue disponible si otra pantalla la permite', async () => {
    await regla(base, { denegar: true });
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'GET', '/api/v1/demo')).resolves.toBeUndefined();
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('administrar la matriz nunca queda bloqueado por la matriz', async () => {
    await regla(base, { denegar: true });
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'GET', '/api/v1/pantallas/reglas')).resolves.toBeUndefined();
  });

  it('las reglas se leen de un caché que se invalida al guardar', async () => {
    const s = await nueva(base);
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
    await regla(base, { denegar: true });
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).resolves.toBeUndefined();
    s.invalidar();
    await expect(s.exigirEnRuta(user, 'DELETE', '/api/v1/demo/:id')).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sincroniza seguridad.pantallas: da de alta, desactiva las web que ya no están y no toca las de la app', async () => {
    const repo = base.getRepository(Pantalla as never);
    await repo.save(Object.assign(new Pantalla(), { codigo: '0xA001', nombre: 'App', descripcion: null, confidencialAplica: false, activa: true }) as never);
    await repo.save(Object.assign(new Pantalla(), { codigo: '0xB999', nombre: 'Vieja', descripcion: null, confidencialAplica: false, activa: true }) as never);
    await nueva(base);
    const filas = base.tabla('Pantalla') as Array<{ codigo: string; activa: boolean; nombre: string }>;
    const por = new Map(filas.map((f) => [f.codigo, f]));
    expect(por.get('0xB101')).toMatchObject({ nombre: 'Demo', activa: true });
    expect(por.get('0xB999')!.activa).toBe(false);
    expect(por.get('0xA001')!.activa).toBe(true);
    expect(por.get('0xC003')).toMatchObject({ activa: true });
  });

  it('decide lo que ofrece la interfaz', async () => {
    const s = await nueva(base);
    const sinEliminar = await s.misPermisosWeb({ id: 'u1', permisos: ['demo:ver'] });
    expect(sinEliminar.pantallas.find((p) => p.codigo === '0xB101')).toMatchObject({ ver: true, eliminar: false, crear: false });
    await regla(base, { denegar: true });
    s.invalidar();
    const negada = await s.misPermisosWeb({ id: 'u1', permisos: ['demo:ver'] });
    expect(negada.pantallas.find((p) => p.codigo === '0xB101')!.ver).toBe(false);
    expect(negada.pantallas.find((p) => p.codigo === '0xB102')!.ver).toBe(true);
  });

  it('evalúa las secciones del Centro de mando con su permiso base y las reglas', async () => {
    const s = await nueva(base);
    const puede = await s.evaluadorSecciones({ id: 'u1', permisos: ['servicios:ver'] });
    expect(puede('alertas')).toBe(true);
    expect(puede('sistema')).toBe(false);
    expect(puede('mi_actividad')).toBe(true);
    await regla(base, { pantallaCodigo: '0xC004', denegar: true });
    s.invalidar();
    expect((await s.evaluadorSecciones({ id: 'u1', permisos: ['servicios:ver'] }))('alertas')).toBe(false);
  });
});

describe('PermissionsGuard con la matriz', () => {
  const contexto = (permisos: string[]) => ({
    getHandler: () => DemoController.prototype.borrar,
    getClass: () => DemoController,
    switchToHttp: () => ({ getRequest: () => ({ user: { id: 'u1', permisos }, method: 'DELETE', route: { path: '/api/v1/demo/:id' } }) }),
  });

  it('primero exige el permiso por rol (síncrono, como antes)', async () => {
    const s = await nueva(new BaseFalsa());
    const guard = new PermissionsGuard(new Reflector(), s);
    expect(() => guard.canActivate(contexto(['demo:ver']) as never)).toThrow(/Permiso insuficiente/);
  });

  it('después aplica la matriz', async () => {
    const b = new BaseFalsa();
    await regla(b, { ver: true });
    const guard = new PermissionsGuard(new Reflector(), await nueva(b));
    await expect(guard.canActivate(contexto(['demo:ver', 'demo:eliminar']) as never)).rejects.toBeInstanceOf(ForbiddenException);
  });

  it('sin el servicio de la matriz se comporta exactamente como antes', () => {
    const guard = new PermissionsGuard(new Reflector());
    expect(guard.canActivate(contexto(['demo:eliminar']) as never)).toBe(true);
  });
});
```

(`BaseFalsa` guarda cada entidad en la tabla con el nombre de su clase: `base.tabla('Pantalla')`. Sin `copias`, lo leído es la misma fila, así que la sincronización la actualiza en el lugar.)

- [ ] **Step 2: Correrlas**

Run: `cd backend; npx jest src/modules/pantallas/matriz-web.service.spec.ts`
Expected: FAIL (`Cannot find module './matriz-web.service'`).

- [ ] **Step 3: `sujeto.ts` y delegación en `PantallasService`**

`backend/src/modules/pantallas/sujeto.ts`:

```ts
import { DataSource } from 'typeorm';
import { AsignacionRol, Bombero, Usuario } from '../../shared/entities';
import type { SujetoUsuario } from './pantallas.logica';

/** Roles vigentes, rango y cargo de una persona: lo que las reglas de la matriz pueden nombrar. */
export async function resolverSujeto(dataSource: DataSource, usuarioId: string, ahora = new Date()): Promise<SujetoUsuario> {
  const asignaciones = await dataSource.getRepository(AsignacionRol).find({ where: { usuarioId } });
  const rolIds = asignaciones
    .filter((a) => !a.fechaExpiracion || new Date(a.fechaExpiracion).getTime() > ahora.getTime())
    .map((a) => a.rolId);
  const usuario = await dataSource.getRepository(Usuario).findOne({ where: { id: usuarioId } });
  let rangoId: string | null = null;
  let cargo: string | null = null;
  if (usuario?.bomberoId) {
    const b = await dataSource.getRepository(Bombero).findOne({ where: { id: usuario.bomberoId } });
    rangoId = b?.rangoId ?? null;
    cargo = b?.cargo ?? null;
  }
  return { usuarioId, rolIds, rangoId, cargo };
}

export const sujetoVacio = (usuarioId: string): SujetoUsuario => ({ usuarioId, rolIds: [], rangoId: null, cargo: null });
```

En `pantallas.service.ts`, reemplazar el cuerpo de `sujeto(...)` por `return resolverSujeto(this.dataSource, usuarioId, ahora);` (importar desde `./sujeto`) y agregar al constructor `@Optional() private readonly matriz?: MatrizWebService` (importar `Optional` de `@nestjs/common` y `MatrizWebService` de `./matriz-web.service`). Al final de `guardarRegla` y de `eliminarRegla` (antes del `return`): `this.matriz?.invalidar();`. Al principio de `listarPantallas()`: `if (this.matriz && !this.matriz.estaSincronizada()) await this.matriz.sincronizar();`.

- [ ] **Step 4: `catalogo-secciones.ts`**

```ts
/**
 * Secciones del Centro de mando (spec 2026-10-09 §5.4). Cada una es una "pantalla" de la
 * matriz: se puede restringir por usuario, rol, rango o cargo como cualquier otra.
 * base: los permisos por rol que hacen falta (alguno), o SIEMPRE.
 */
export type ClaveSeccion =
  | 'accesos' | 'emergencias' | 'alertas' | 'moviles' | 'personal'
  | 'guardia' | 'convocatorias' | 'mi_actividad' | 'pendientes' | 'sistema';

export interface SeccionCentroMando {
  clave: ClaveSeccion;
  codigo: string;
  nombre: string;
  descripcion: string;
  base: 'SIEMPRE' | string[];
}

export const SECCIONES_CENTRO_MANDO: SeccionCentroMando[] = [
  { clave: 'accesos', codigo: '0xC002', nombre: 'Accesos rápidos', descripcion: 'Módulos y pantallas que la persona puede abrir, con buscador.', base: 'SIEMPRE' },
  { clave: 'emergencias', codigo: '0xC003', nombre: 'Emergencias en curso', descripcion: 'Solo las que la persona integra, salvo permiso de supervisión.', base: ['servicios:ver', 'despacho:responder', 'despacho:servicio'] },
  { clave: 'alertas', codigo: '0xC004', nombre: 'Alertas activas', descripcion: 'Alertas de emergencia pendientes de atención.', base: ['servicios:ver'] },
  { clave: 'moviles', codigo: '0xC005', nombre: 'Móviles', descripcion: 'Móviles disponibles, en servicio y fuera de servicio.', base: ['vehiculos:ver', 'servicios:ver'] },
  { clave: 'personal', codigo: '0xC006', nombre: 'Personal disponible', descripcion: 'Bomberos por disponibilidad: al llamado, en base, en camino, en servicio.', base: ['servicios:ver', 'despacho:seguimiento'] },
  { clave: 'guardia', codigo: '0xC007', nombre: 'Guardia de turno', descripcion: 'Guardias vigentes ahora y su personal.', base: ['guardias:ver', 'servicios:ver'] },
  { clave: 'convocatorias', codigo: '0xC008', nombre: 'Convocatorias abiertas', descripcion: 'Convocatorias abiertas y sus respuestas.', base: ['servicios:ver'] },
  { clave: 'mi_actividad', codigo: '0xC009', nombre: 'Mi actividad', descripcion: 'Próximas guardias y últimos servicios propios.', base: 'SIEMPRE' },
  { clave: 'pendientes', codigo: '0xC00A', nombre: 'Pendientes de mi función', descripcion: 'Lo que espera una decisión de la persona; cada ítem exige su permiso.', base: 'SIEMPRE' },
  { clave: 'sistema', codigo: '0xC00B', nombre: 'Estado del sistema', descripcion: 'Semáforo de servicios, respaldos y tareas.', base: ['sistema:ver'] },
];
```

- [ ] **Step 5: `matriz-web.service.ts`**

```ts
import { ForbiddenException, Inject, Injectable, Logger, OnApplicationBootstrap, Optional, RequestMethod } from '@nestjs/common';
import { METHOD_METADATA, PATH_METADATA } from '@nestjs/common/constants';
import { DiscoveryService, MetadataScanner, ModuleRef } from '@nestjs/core';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Pantalla, PantallaPermiso } from '../../shared/entities';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { PERMISSION_KEY } from '../seguridad/decorators/require-permission.decorator';
import { PolicyEngineService } from '../seguridad/policy-engine.service';
import { ClaveSeccion, SECCIONES_CENTRO_MANDO } from './catalogo-secciones';
import { ACCIONES_FORZADAS, LLAMADAS_SIN_RESOLVER, PANTALLAS_WEB } from './catalogo-web.generado';
import {
  AccionForzada, AccionUi, accionDe, baseDePantalla, BaseUi, claveRuta, construirIndice, decidirApi, decidirUi,
  decidirUiDetalle, esExenta, IndiceMatriz, MetodoHttp, normalizarPatron, PantallaCatalogo, RutaBackend, sinPrefijo, VERBO_ACCION,
} from './matriz-web.logica';
import { resolverSujeto, sujetoVacio } from './sujeto';

export const CATALOGO_PANTALLAS_WEB = Symbol('CATALOGO_PANTALLAS_WEB');

export interface CatalogoWeb { pantallas: PantallaCatalogo[]; forzadas: AccionForzada[]; sinResolver: number }
export interface UsuarioMatriz { id: string; permisos: string[] }
export interface EstadoMatriz {
  activa: boolean; sincronizada: boolean; error: string | null; pantallas: number;
  secciones: number; rutasBackend: number; llamadasSinResolver: number;
}

const CATALOGO_GENERADO: CatalogoWeb = { pantallas: PANTALLAS_WEB, forzadas: ACCIONES_FORZADAS, sinResolver: LLAMADAS_SIN_RESOLVER.length };
const METODO_POR_ENUM: Partial<Record<number, MetodoHttp>> = {
  [RequestMethod.GET]: 'GET', [RequestMethod.POST]: 'POST', [RequestMethod.PUT]: 'PUT',
  [RequestMethod.PATCH]: 'PATCH', [RequestMethod.DELETE]: 'DELETE',
};
const VIGENCIA_REGLAS_MS = 60_000;
const SILENCIO_AUDITORIA_MS = 10 * 60_000;
const ACCIONES_UI: AccionUi[] = ['ver', 'crear', 'editar', 'eliminar'];

const recortar = (t: string, n: number) => (t.length > n ? `${t.slice(0, n - 1)}…` : t);
const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));

/**
 * Matriz de permisos por pantalla aplicada a la web (spec 2026-10-09 §4).
 * Al arrancar: arma la tabla real de rutas de Nest, la cruza con el catalogo generado y
 * sincroniza seguridad.pantallas. En cada pedido (desde PermissionsGuard): si la ruta
 * pertenece a pantallas con reglas para esa persona, decide la matriz. Solo restringe.
 */
@Injectable()
export class MatrizWebService implements OnApplicationBootstrap {
  private readonly log = new Logger('MatrizWeb');
  private readonly catalogo: CatalogoWeb;
  private indice: IndiceMatriz = { pantallasPorRuta: new Map(), rutasPorPantalla: new Map(), sinResolver: [] };
  private rutas: RutaBackend[] = [];
  private activa = false;
  private sincronizada = false;
  private errorSincronizacion: string | null = null;
  private reglasCache: { cargadas: number; reglas: PantallaPermiso[] } | null = null;
  private readonly ultimasDenegaciones = new Map<string, number>();

  constructor(
    private readonly discovery: DiscoveryService,
    private readonly scanner: MetadataScanner,
    private readonly moduleRef: ModuleRef,
    @InjectDataSource() private readonly dataSource: DataSource,
    @Optional() @Inject(CATALOGO_PANTALLAS_WEB) catalogo?: CatalogoWeb,
  ) {
    this.catalogo = catalogo ?? CATALOGO_GENERADO;
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      this.rutas = this.leerRutas();
      this.indice = construirIndice(this.catalogo.pantallas, this.rutas);
      this.activa = true;
      if (this.indice.sinResolver.length) {
        this.log.warn(`${this.indice.sinResolver.length} llamadas del catálogo no coinciden con ninguna ruta del backend (ver Sistema › Estado).`);
      }
    } catch (e) {
      this.activa = false;
      this.log.error(`No se pudo armar el índice de pantallas: ${mensaje(e)}. La matriz web queda inactiva.`);
    }
    await this.sincronizar();
  }

  private leerRutas(): RutaBackend[] {
    const salida: RutaBackend[] = [];
    for (const wrapper of this.discovery.getControllers()) {
      const { instance, metatype } = wrapper as { instance?: object; metatype?: Function };
      if (!instance || !metatype) continue;
      const bases = ([] as string[]).concat(Reflect.getMetadata(PATH_METADATA, metatype) ?? '');
      const permisosClase: string[] = Reflect.getMetadata(PERMISSION_KEY, metatype) ?? [];
      const prototipo = Object.getPrototypeOf(instance);
      for (const nombre of this.scanner.getAllMethodNames(prototipo)) {
        const manejador = prototipo[nombre];
        const metodo = METODO_POR_ENUM[Reflect.getMetadata(METHOD_METADATA, manejador) as number];
        const caminos = Reflect.getMetadata(PATH_METADATA, manejador);
        if (!metodo || caminos === undefined) continue;
        const permisos: string[] = Reflect.getMetadata(PERMISSION_KEY, manejador) ?? permisosClase;
        for (const base of bases) {
          for (const camino of ([] as string[]).concat(caminos)) {
            salida.push({ metodo, patron: normalizarPatron(`${base}/${camino}`), permisos });
          }
        }
      }
    }
    return salida;
  }

  async sincronizar(): Promise<void> {
    try {
      const repo = this.dataSource.getRepository(Pantalla);
      const existentes = await repo.find({});
      const porCodigo = new Map(existentes.map((p) => [p.codigo, p]));
      const deseadas = [
        ...this.catalogo.pantallas.map((p) => ({ codigo: p.codigo, nombre: recortar(p.nombre, 80), descripcion: recortar(`${p.modulo} · ${p.ruta}`, 200) })),
        ...SECCIONES_CENTRO_MANDO.map((s) => ({ codigo: s.codigo, nombre: recortar(`Centro de mando › ${s.nombre}`, 80), descripcion: recortar(s.descripcion, 200) })),
      ];
      const codigos = new Set(deseadas.map((d) => d.codigo));
      for (const d of deseadas) {
        const e = porCodigo.get(d.codigo);
        if (e && e.nombre === d.nombre && e.descripcion === d.descripcion && e.activa) continue;
        await repo.save(Object.assign(e ?? new Pantalla(), { ...d, confidencialAplica: e?.confidencialAplica ?? false, activa: true }));
      }
      for (const e of existentes) {
        if (/^0x[BC]/.test(e.codigo) && !codigos.has(e.codigo) && e.activa) await repo.save(Object.assign(e, { activa: false }));
      }
      this.sincronizada = true;
      this.errorSincronizacion = null;
    } catch (e) {
      this.sincronizada = false;
      this.errorSincronizacion = mensaje(e);
      this.log.error(`No se pudo sincronizar seguridad.pantallas: ${this.errorSincronizacion}. Se reintenta al abrir Seguridad › Pantallas.`);
    }
  }

  estaSincronizada(): boolean {
    return this.sincronizada;
  }

  invalidar(): void {
    this.reglasCache = null;
  }

  private async reglas(): Promise<PantallaPermiso[]> {
    if (this.reglasCache && Date.now() - this.reglasCache.cargadas < VIGENCIA_REGLAS_MS) return this.reglasCache.reglas;
    const reglas = await this.dataSource.getRepository(PantallaPermiso).find({});
    this.reglasCache = { cargadas: Date.now(), reglas };
    return reglas;
  }

  async exigirEnRuta(user: UsuarioMatriz, metodo: string, rutaExpress: string | undefined): Promise<void> {
    if (!this.activa || !rutaExpress) return;
    const patron = sinPrefijo(rutaExpress);
    if (esExenta(patron)) return;
    const m = metodo.toUpperCase() === 'HEAD' ? 'GET' : metodo.toUpperCase();
    const codigos = this.indice.pantallasPorRuta.get(claveRuta(m, patron)) ?? [];
    if (!codigos.length) return;
    const accion = accionDe(m, patron, this.catalogo.forzadas);
    if (!accion) return;
    const reglas = (await this.reglas()).filter((r) => codigos.includes(r.pantallaCodigo));
    if (!reglas.length) return;
    const decision = decidirApi(codigos, accion, reglas, await resolverSujeto(this.dataSource, user.id));
    if (decision.permitido) return;
    const codigo = decision.codigoDenegado as string;
    const nombre = this.catalogo.pantallas.find((p) => p.codigo === codigo)?.nombre ?? codigo;
    await this.auditarDenegacion(user.id, codigo, accion, `${m} ${patron}`);
    throw new ForbiddenException(`No tenés permiso para ${VERBO_ACCION[accion]} en «${nombre}».`);
  }

  private async auditarDenegacion(usuarioId: string, codigo: string, accion: string, ruta: string) {
    const clave = `${usuarioId}|${codigo}|${accion}`;
    const ahora = Date.now();
    if (ahora - (this.ultimasDenegaciones.get(clave) ?? 0) < SILENCIO_AUDITORIA_MS) return;
    this.ultimasDenegaciones.set(clave, ahora);
    try {
      await this.moduleRef.get(AuditoriaService, { strict: false }).registrar({
        usuarioId, accion: 'DENEGADO_POR_PANTALLA', recurso: 'seguridad.pantalla_permisos', recursoId: null,
        datosDespues: { pantalla: codigo, accion, ruta },
      });
    } catch (e) {
      this.log.warn(`No se pudo auditar una denegación por pantalla: ${mensaje(e)}`);
    }
  }

  private base(p: PantallaCatalogo, accion: AccionUi): BaseUi {
    return baseDePantalla(p, this.indice.rutasPorPantalla.get(p.codigo) ?? [], accion, this.catalogo.forzadas);
  }

  async misPermisosWeb(user: UsuarioMatriz) {
    const reglas = await this.reglas();
    const sujeto = reglas.some((r) => /^0x[BC]/.test(r.pantallaCodigo)) ? await resolverSujeto(this.dataSource, user.id) : sujetoVacio(user.id);
    const pantallas = this.catalogo.pantallas.map((p) => {
      const propias = reglas.filter((r) => r.pantallaCodigo === p.codigo);
      const [ver, crear, editar, eliminar] = ACCIONES_UI.map((a) => decidirUi(this.base(p, a), a, user.permisos, propias, sujeto));
      return { codigo: p.codigo, ruta: p.ruta, ver, crear, editar, eliminar };
    });
    return { generadoEn: new Date(), activa: this.activa, pantallas };
  }

  async evaluadorSecciones(user: UsuarioMatriz): Promise<(clave: ClaveSeccion) => boolean> {
    const reglas = await this.reglas();
    const sujeto = reglas.some((r) => r.pantallaCodigo.startsWith('0xC')) ? await resolverSujeto(this.dataSource, user.id) : sujetoVacio(user.id);
    return (clave) => {
      const s = SECCIONES_CENTRO_MANDO.find((x) => x.clave === clave);
      if (!s) return false;
      const base: BaseUi = s.base === 'SIEMPRE'
        ? { siempre: true, nunca: false, algunoDe: [], prefijo: null }
        : { siempre: false, nunca: false, algunoDe: s.base, prefijo: null };
      return decidirUi(base, 'ver', user.permisos, reglas.filter((r) => r.pantallaCodigo === s.codigo), sujeto);
    };
  }

  /** Qué vería y podría hacer una persona en cada pantalla, y por qué (rol o regla). */
  async vistaPrevia(usuarioId: string) {
    const permisos = await this.moduleRef.get(PolicyEngineService, { strict: false }).getPermisosEfectivos(usuarioId);
    const reglas = await this.reglas();
    const sujeto = await resolverSujeto(this.dataSource, usuarioId);
    return this.catalogo.pantallas.map((p) => {
      const propias = reglas.filter((r) => r.pantallaCodigo === p.codigo);
      const [ver, crear, editar, eliminar] = ACCIONES_UI.map((a) => decidirUiDetalle(this.base(p, a), a, permisos, propias, sujeto));
      return { codigo: p.codigo, ruta: p.ruta, nombre: p.nombre, modulo: p.modulo, ver, crear, editar, eliminar };
    });
  }

  catalogoParaAdministrar() {
    return {
      activa: this.activa,
      sincronizada: this.sincronizada,
      pantallas: [
        ...this.catalogo.pantallas.map((p) => ({
          codigo: p.codigo, nombre: p.nombre, ruta: p.ruta, modulo: p.modulo, tipo: 'WEB' as const,
          rutasApi: (this.indice.rutasPorPantalla.get(p.codigo) ?? []).map((r) => ({ metodo: r.metodo, patron: r.patron, permisos: r.permisos, exenta: esExenta(r.patron) })),
        })),
        ...SECCIONES_CENTRO_MANDO.map((s) => ({
          codigo: s.codigo, nombre: `Centro de mando › ${s.nombre}`, ruta: '/dashboard/centro-mando', modulo: 'centro-mando', tipo: 'SECCION' as const,
          rutasApi: [] as Array<{ metodo: MetodoHttp; patron: string; permisos: string[]; exenta: boolean }>,
        })),
      ],
    };
  }

  estado(): EstadoMatriz {
    return {
      activa: this.activa, sincronizada: this.sincronizada, error: this.errorSincronizacion,
      pantallas: this.catalogo.pantallas.length, secciones: SECCIONES_CENTRO_MANDO.length,
      rutasBackend: this.rutas.length, llamadasSinResolver: this.indice.sinResolver.length + this.catalogo.sinResolver,
    };
  }
}
```

- [ ] **Step 6: `matriz-web.module.ts` y registro en `AppModule`**

```ts
import { Global, Module } from '@nestjs/common';
import { DiscoveryModule } from '@nestjs/core';
import { MatrizWebService } from './matriz-web.service';

/**
 * Global: PermissionsGuard se instancia en cada modulo que lo usa y necesita poder
 * resolver MatrizWebService en todos. No importa otros modulos (usa ModuleRef para la
 * auditoria y la politica) para no crear ciclos con SeguridadModule.
 */
@Global()
@Module({
  imports: [DiscoveryModule],
  providers: [MatrizWebService],
  exports: [MatrizWebService],
})
export class MatrizWebModule {}
```

En `backend/src/app.module.ts`: `import { MatrizWebModule } from './modules/pantallas/matriz-web.module';` y agregar `MatrizWebModule,` en `imports` justo antes de `PantallasModule,`.

- [ ] **Step 7: `PermissionsGuard`**

Reemplazar el contenido de `backend/src/modules/seguridad/guards/permissions.guard.ts` por:

```ts
import { CanActivate, ExecutionContext, ForbiddenException, Injectable, Optional } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PERMISSION_KEY } from '../decorators/require-permission.decorator';
import { AuthenticatedUser } from '../../auth/types/authenticated-user';
import { MatrizWebService } from '../../pantallas/matriz-web.service';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    /** Matriz de pantallas web (MatrizWebModule es global). Opcional: sin ella, solo el rol. */
    @Optional() private readonly matriz?: MatrizWebService,
  ) {}

  canActivate(context: ExecutionContext): boolean | Promise<boolean> {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSION_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const request = context.switchToHttp().getRequest();
    const user: AuthenticatedUser | undefined = request.user;

    if (requiredPermissions && requiredPermissions.length > 0) {
      if (!user) {
        throw new ForbiddenException('Usuario no autenticado');
      }
      const tienePermiso = requiredPermissions.some((p) => user.permisos.includes(p));
      if (!tienePermiso) {
        throw new ForbiddenException(
          `Permiso insuficiente. Se requiere: ${requiredPermissions.join(' o ')}`,
        );
      }
    }

    // Despues del rol, la matriz por pantalla: solo restringe, y sin reglas no cambia nada.
    if (!this.matriz || !user) return true;
    return this.matriz.exigirEnRuta(user, request.method, request.route?.path).then(() => true);
  }
}
```

- [ ] **Step 8: Endpoints en `PantallasController`**

Agregar `private readonly matriz: MatrizWebService` al constructor de `PantallasController` (importar desde `./matriz-web.service`) y, después de `misPermisos`:

```ts
  /** Lo que la persona puede hacer en cada pantalla web: la web lo usa para ocultar; el backend igual lo exige. */
  @Get('mis-permisos-web')
  misPermisosWeb(@CurrentUser() user: AuthenticatedUser) {
    return this.matriz.misPermisosWeb(user);
  }

  /** Qué vería una persona y por qué (rol o regla): para configurar sin adivinar. */
  @Get('vista-previa')
  @RequirePermission('seguridad:gestionar_pantallas')
  vistaPrevia(@Query('usuarioId', new ParseUUIDPipe()) usuarioId: string) {
    return this.matriz.vistaPrevia(usuarioId);
  }

  /** Pantallas web y secciones del Centro de mando, con las rutas de API que cubre cada una. */
  @Get('catalogo-web')
  @RequirePermission('seguridad:gestionar_pantallas')
  catalogoWeb() {
    return this.matriz.catalogoParaAdministrar();
  }
```

- [ ] **Step 9: Correr las pruebas nuevas y la suite completa**

Run: `cd backend; npx jest src/modules/pantallas src/modules/gre/gre-administracion.spec.ts`
Expected: PASS.
Run: `cd backend; npm test`
Expected: solo las 2 fallas previas de `despacho.spec.ts` (si aparece otra, corregirla antes de seguir).

- [ ] **Step 10: Verificar en el backend real**

Run: `cd backend; npm run build`, reiniciar el backend (`powershell.exe -NoProfile -ExecutionPolicy Bypass -File ..\iniciar-sigbo.ps1 -NoBrowser -NoPause`) y revisar `logs\backend-err.log`: no debe haber errores de inyección; puede haber un aviso de "llamadas del catálogo no coinciden".
Con el script de login de la verificación (Task 16, Step 3) o desde Swagger: `GET /api/v1/pantallas/mis-permisos-web` con `admin` → 200 y `pantallas.length ≈ 123`.

- [ ] **Step 11: Commit**

```bash
git add backend/src/modules/pantallas backend/src/modules/seguridad/guards/permissions.guard.ts backend/src/app.module.ts
git commit -m "Pantallas: la matriz por pantalla rige toda la web, exigida en PermissionsGuard

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 7: La web obedece la matriz (menú, pestañas, buscador y pantallas bloqueadas)

**Files:**
- Create: `frontend/src/lib/permisos-pantalla.ts`
- Create: `frontend/src/app/components/PermisosPantallaProvider.tsx`
- Create: `frontend/src/app/components/SinAcceso.tsx`
- Modify (reemplazar): `frontend/src/app/dashboard/layout.tsx`
- Modify: `frontend/src/app/components/BuscadorPantallas.tsx` (prop `matriz`)
- Modify: `frontend/src/lib/navegacion.ts` (`buscarPantallas` con matriz)
- Modify: los 13 `layout.tsx` de módulo que tienen `TABS` (academia, asistencia, deposito, documentos, equipos, finanzas, guardias, organizacion, personal, seguridad, servicios, vehiculos, seguridad/inteligencia-artificial)
- Test: `frontend/scripts/pruebas/permisos-pantalla.test.mjs`

**Interfaces:**
- Consumes: `GET /pantallas/mis-permisos-web` (Task 6) → `{ generadoEn, activa, pantallas: PermisoPantalla[] }`; `GET /centro-mando/acceso` (Task 11; mientras no exista responde 404 y se ignora); `PANTALLAS` con `codigo`/`detalle` (Task 5).
- Produces:
  - `lib/permisos-pantalla.ts`: `type AccionUi`, `interface PermisoPantalla { codigo; ruta; ver; crear; editar; eliminar }`, `type MatrizWeb = Map<string, PermisoPantalla>` (por ruta), `indexarPorRuta`, `rutaCoincide`, `pantallaDeRuta`, `decisionDeRuta`, `puede`, `moduloVisibleEnMenu`, `tabsVisibles`, `pantallasVisibles`.
  - `PermisosPantallaProvider`, `usePermisosPantalla(): { estado: 'cargando' | 'listo' | 'sin_datos'; matriz: MatrizWeb | null; centroMando: { acceso: boolean; motivo: string | null } | null; recargar(): void }`, `usePuede(): (accion: AccionUi) => boolean`, `useTabsVisibles<T extends { href: string }>(tabs: T[]): T[]`.
  - `<SinAcceso nombre="…" />`.

- [ ] **Step 1: Pruebas que fallan**

`frontend/scripts/pruebas/permisos-pantalla.test.mjs`:

```js
/**
 * Pruebas de cómo la web aplica la matriz de permisos por pantalla.
 * Correr: node --test scripts/pruebas/
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  decisionDeRuta, indexarPorRuta, moduloVisibleEnMenu, pantallaDeRuta, pantallasVisibles, puede, tabsVisibles,
} from '../../src/lib/permisos-pantalla.ts';

const PANTALLAS = [
  { ruta: '/dashboard', nombre: 'Inicio', modulo: 'inicio', codigo: null, detalle: false },
  { ruta: '/dashboard/personal', nombre: 'Personal', modulo: 'personal', codigo: '0xB001', detalle: false },
  { ruta: '/dashboard/personal/control', nombre: 'Control', modulo: 'personal', codigo: '0xB002', detalle: false },
  { ruta: '/dashboard/personal/[id]', nombre: 'Legajo del bombero', modulo: 'personal', codigo: '0xB003', detalle: true },
  { ruta: '/dashboard/personal/nuevo', nombre: 'Nuevo bombero', modulo: 'personal', codigo: '0xB004', detalle: false },
];
const MODULOS = [{ slug: 'personal', nombre: 'Personal', icono: 'people', permisoPrefijo: 'personal:', disponible: true, grupo: 'personas', descripcion: '' }];
const permiso = (ruta, o = {}) => ({ codigo: 'x', ruta, ver: true, crear: true, editar: true, eliminar: true, ...o });

test('una URL de detalle con id real resuelve a la pantalla [id]', () => {
  assert.equal(pantallaDeRuta('/dashboard/personal/3f2a9c1e-0000-4000-8000-000000000000', PANTALLAS)?.ruta, '/dashboard/personal/[id]');
  assert.equal(pantallaDeRuta('/dashboard/personal/nuevo', PANTALLAS)?.ruta, '/dashboard/personal/nuevo');
  assert.equal(pantallaDeRuta('/dashboard/personal/', PANTALLAS)?.ruta, '/dashboard/personal');
});

test('la matriz decide en el detalle', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal/[id]', { ver: false })]);
  assert.equal(decisionDeRuta('/dashboard/personal/abc-123-def-456', PANTALLAS, matriz)?.ver, false);
});

test('sin datos de la matriz (no se pudieron cargar) no se bloquea nada: decide el backend', () => {
  assert.equal(decisionDeRuta('/dashboard/personal', PANTALLAS, null), null);
  assert.equal(puede('/dashboard/personal', PANTALLAS, null, 'eliminar'), true);
});

test('Inicio queda fuera de la matriz', () => {
  assert.equal(decisionDeRuta('/dashboard', PANTALLAS, indexarPorRuta([])), null);
});

test('puede() lee la acción de la pantalla actual', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal', { eliminar: false })]);
  assert.equal(puede('/dashboard/personal', PANTALLAS, matriz, 'eliminar'), false);
  assert.equal(puede('/dashboard/personal', PANTALLAS, matriz, 'crear'), true);
});

test('el módulo aparece en el menú si alguna de sus pantallas se puede ver', () => {
  const ninguna = indexarPorRuta(PANTALLAS.filter((p) => p.codigo).map((p) => permiso(p.ruta, { ver: false })));
  assert.equal(moduloVisibleEnMenu(MODULOS[0], ['personal:ver'], PANTALLAS, ninguna), false);
  const una = indexarPorRuta([permiso('/dashboard/personal/control')]);
  assert.equal(moduloVisibleEnMenu(MODULOS[0], [], PANTALLAS, una), true);
});

test('sin datos de la matriz, el menú sigue por prefijo como antes (no se vacía)', () => {
  assert.equal(moduloVisibleEnMenu(MODULOS[0], ['personal:ver'], PANTALLAS, null), true);
  assert.equal(moduloVisibleEnMenu(MODULOS[0], ['guardias:ver'], PANTALLAS, null), false);
});

test('pestañas: con matriz solo las visibles; sin datos, todas', () => {
  const TABS = [{ href: '/dashboard/personal', label: 'Listado' }, { href: '/dashboard/personal/control', label: 'Control' }];
  const matriz = indexarPorRuta([permiso('/dashboard/personal'), permiso('/dashboard/personal/control', { ver: false })]);
  assert.deepEqual(tabsVisibles(TABS, PANTALLAS, matriz).map((t) => t.label), ['Listado']);
  assert.equal(tabsVisibles(TABS, PANTALLAS, null).length, 2);
});

test('buscador y accesos: sin detalles, Inicio siempre, el resto según la matriz o el prefijo', () => {
  const matriz = indexarPorRuta([permiso('/dashboard/personal'), permiso('/dashboard/personal/control', { ver: false }), permiso('/dashboard/personal/nuevo', { ver: false })]);
  assert.deepEqual(pantallasVisibles(PANTALLAS, [], matriz, MODULOS).map((p) => p.ruta), ['/dashboard', '/dashboard/personal']);
  assert.deepEqual(pantallasVisibles(PANTALLAS, ['personal:ver'], null, MODULOS).map((p) => p.ruta), ['/dashboard', '/dashboard/personal', '/dashboard/personal/control', '/dashboard/personal/nuevo']);
});
```

- [ ] **Step 2: Correrlas**

Run: `cd frontend; node --test scripts/pruebas/permisos-pantalla.test.mjs`
Expected: FAIL (no existe `src/lib/permisos-pantalla.ts`).

- [ ] **Step 3: `frontend/src/lib/permisos-pantalla.ts`** (solo imports relativos y de tipos: lo corre el runner de Node)

```ts
import type { ModuloConfig } from './modulos';
import type { PantallaRegistrada } from './pantallas.generado';

/**
 * Como aplica la web la matriz de permisos por pantalla (spec 2026-10-09 §4.5).
 * La web solo OCULTA: quien decide es el backend. Por eso, si la matriz no se pudo
 * cargar, nada se bloquea aca y el menu vuelve a la logica por prefijo de siempre.
 */

export type AccionUi = 'ver' | 'crear' | 'editar' | 'eliminar';

export interface PermisoPantalla {
  codigo: string;
  ruta: string;
  ver: boolean;
  crear: boolean;
  editar: boolean;
  eliminar: boolean;
}

/** Decisiones de la matriz indexadas por ruta registrada ('/dashboard/personal/[id]'). */
export type MatrizWeb = Map<string, PermisoPantalla>;

export function indexarPorRuta(lista: PermisoPantalla[]): MatrizWeb {
  return new Map(lista.map((p) => [p.ruta, p]));
}

const tramos = (ruta: string) => ruta.split('?')[0].split('/').filter(Boolean);

/** ¿La ruta registrada (con [parametro]) corresponde a este pathname? */
export function rutaCoincide(patron: string, pathname: string): boolean {
  const a = tramos(patron);
  const b = tramos(pathname);
  return a.length === b.length && a.every((s, i) => s.startsWith('[') || s === b[i]);
}

/** Pantalla registrada para un pathname: la exacta, si no la de detalle que coincida. */
export function pantallaDeRuta(pathname: string, pantallas: PantallaRegistrada[]): PantallaRegistrada | undefined {
  const limpio = '/' + tramos(pathname).join('/');
  return pantallas.find((p) => p.ruta === limpio) ?? pantallas.find((p) => p.detalle && rutaCoincide(p.ruta, limpio));
}

/** Decision de la matriz para un pathname; null si esta fuera de la matriz o no hay datos. */
export function decisionDeRuta(pathname: string, pantallas: PantallaRegistrada[], matriz: MatrizWeb | null): PermisoPantalla | null {
  if (!matriz) return null;
  const p = pantallaDeRuta(pathname, pantallas);
  if (!p || !p.codigo) return null;
  return matriz.get(p.ruta) ?? null;
}

export function puede(pathname: string, pantallas: PantallaRegistrada[], matriz: MatrizWeb | null, accion: AccionUi): boolean {
  const d = decisionDeRuta(pathname, pantallas, matriz);
  return d ? d[accion] : true;
}

const porPrefijo = (m: ModuloConfig, permisos: string[]) =>
  m.permisoPrefijo === '' || permisos.some((p) => p.startsWith(m.permisoPrefijo));

/** Un modulo va en el menu si alguna de sus pantallas se puede ver; sin datos, por prefijo. */
export function moduloVisibleEnMenu(m: ModuloConfig, permisos: string[], pantallas: PantallaRegistrada[], matriz: MatrizWeb | null): boolean {
  if (!matriz) return porPrefijo(m, permisos);
  const propias = pantallas.filter((p) => p.modulo === m.slug && p.codigo && !p.detalle);
  if (!propias.length) return porPrefijo(m, permisos);
  return propias.some((p) => matriz.get(p.ruta)?.ver === true);
}

/** Pestanas de un modulo que la persona puede abrir; sin datos, todas (como antes). */
export function tabsVisibles<T extends { href: string }>(tabs: T[], pantallas: PantallaRegistrada[], matriz: MatrizWeb | null): T[] {
  if (!matriz) return tabs;
  return tabs.filter((t) => decisionDeRuta(t.href, pantallas, matriz)?.ver ?? true);
}

/** Pantallas para el buscador y los accesos rapidos (sin las de detalle). */
export function pantallasVisibles(pantallas: PantallaRegistrada[], permisos: string[], matriz: MatrizWeb | null, modulos: ModuloConfig[]): PantallaRegistrada[] {
  return pantallas.filter((p) => !p.detalle).filter((p) => {
    if (!p.codigo) return true;
    if (matriz) return matriz.get(p.ruta)?.ver === true;
    const m = modulos.find((x) => x.slug === p.modulo);
    return m ? porPrefijo(m, permisos) : false;
  });
}
```

- [ ] **Step 4: Correr las pruebas**

Run: `cd frontend; node --test scripts/pruebas/`
Expected: PASS (las de `seccion-url`, `catalogo-pantallas` y `permisos-pantalla`).

- [ ] **Step 5: Proveedor y hooks — `frontend/src/app/components/PermisosPantallaProvider.tsx`**

```tsx
'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { usePathname } from 'next/navigation';
import { apiFetch } from '@/lib/api';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { AccionUi, indexarPorRuta, MatrizWeb, PermisoPantalla, puede, tabsVisibles } from '@/lib/permisos-pantalla';

/** Las reglas pueden cambiar mientras la persona trabaja; igual el backend ya las exige al instante. */
const RECARGA_MS = 5 * 60_000;

export interface AccesoCentroMando { acceso: boolean; motivo: string | null }

interface ValorPermisos {
  estado: 'cargando' | 'listo' | 'sin_datos';
  matriz: MatrizWeb | null;
  centroMando: AccesoCentroMando | null;
  recargar: () => void;
}

const Contexto = createContext<ValorPermisos>({ estado: 'sin_datos', matriz: null, centroMando: null, recargar: () => undefined });

export function PermisosPantallaProvider({ children }: { children: React.ReactNode }) {
  const [estado, setEstado] = useState<ValorPermisos['estado']>('cargando');
  const [matriz, setMatriz] = useState<MatrizWeb | null>(null);
  const [centroMando, setCentroMando] = useState<AccesoCentroMando | null>(null);

  const cargar = useCallback(async () => {
    const [pantallas, acceso] = await Promise.allSettled([apiFetch('/pantallas/mis-permisos-web'), apiFetch('/centro-mando/acceso')]);
    if (pantallas.status === 'fulfilled' && pantallas.value.ok) {
      const datos = (await pantallas.value.json()) as { pantallas: PermisoPantalla[] };
      setMatriz(indexarPorRuta(datos.pantallas));
      setEstado('listo');
    } else {
      // Se conserva lo ultimo que se cargo bien; si nunca se cargo, la web vuelve al prefijo.
      setEstado((previo) => (previo === 'listo' ? 'listo' : 'sin_datos'));
    }
    if (acceso.status === 'fulfilled' && acceso.value.ok) setCentroMando((await acceso.value.json()) as AccesoCentroMando);
  }, []);

  useEffect(() => {
    void cargar();
    const reloj = window.setInterval(() => void cargar(), RECARGA_MS);
    return () => window.clearInterval(reloj);
  }, [cargar]);

  const valor = useMemo<ValorPermisos>(() => ({ estado, matriz, centroMando, recargar: () => void cargar() }), [estado, matriz, centroMando, cargar]);
  return <Contexto.Provider value={valor}>{children}</Contexto.Provider>;
}

export function usePermisosPantalla(): ValorPermisos {
  return useContext(Contexto);
}

/** ¿Puede hacer esta accion en la pantalla actual? Sin datos de la matriz: si (decide el backend). */
export function usePuede(): (accion: AccionUi) => boolean {
  const pathname = usePathname();
  const { matriz } = usePermisosPantalla();
  return useCallback((accion: AccionUi) => puede(pathname, PANTALLAS, matriz, accion), [pathname, matriz]);
}

/** Pestanas del submenu de un modulo que la persona puede abrir. */
export function useTabsVisibles<T extends { href: string }>(tabs: T[]): T[] {
  const { matriz } = usePermisosPantalla();
  return useMemo(() => tabsVisibles(tabs, PANTALLAS, matriz), [tabs, matriz]);
}
```

- [ ] **Step 6: `frontend/src/app/components/SinAcceso.tsx`**

```tsx
import Link from 'next/link';

/** Lo que se ve al abrir (por URL o un enlace viejo) una pantalla que una regla restringe. */
export function SinAcceso({ nombre }: { nombre: string }) {
  return (
    <section className="card" role="alert" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>No tenés acceso a «{nombre}»</h2>
      <p style={{ color: 'var(--muted)', fontSize: 14, lineHeight: 1.5 }}>
        Una regla de Seguridad › Pantallas restringe esta pantalla para tu usuario, rol, rango o cargo.
        Si la necesitás, pedíselo a quien administra la seguridad del sistema.
      </p>
      <p style={{ marginTop: 12 }}><Link href="/dashboard">Volver al inicio</Link></p>
    </section>
  );
}
```

- [ ] **Step 7: Reemplazar `frontend/src/app/dashboard/layout.tsx`**

Mismo comportamiento que hoy más: proveedor de permisos, menú y buscador filtrados por la matriz, ítem del Centro de mando oculto si su acceso es `false`, pantalla bloqueada con `<SinAcceso>`, aviso si la matriz no se pudo cargar, y título correcto en pantallas de detalle.

```tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  API_ORIGIN,
  apiFetch,
  EVENTO_SESION_FINALIZADA,
  logout,
  obtenerSesion,
  Sesion,
} from '@/lib/api';
import { MODULOS, agruparModulos, GrupoModulo, IconoModulo } from '@/lib/modulos';
import { migasDePan } from '@/lib/navegacion';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { decisionDeRuta, moduloVisibleEnMenu, pantallaDeRuta } from '@/lib/permisos-pantalla';
import { SystemIcon } from '@/app/components/SystemIcon';
import { BuscadorPantallas } from '@/app/components/BuscadorPantallas';
import { PermisosPantallaProvider, usePermisosPantalla } from '@/app/components/PermisosPantallaProvider';
import { SinAcceso } from '@/app/components/SinAcceso';

interface Apariencia { nombreSistemaMenu: string | null; subtituloMenu: string | null; logoMenu: string | null; }

/** Que grupos dejo plegados el usuario. Es una preferencia de vista, no dato de negocio. */
const CLAVE_PLEGADOS = 'sigbo_menu_plegados';

function leerPlegados(): GrupoModulo[] {
  try {
    const guardado = window.localStorage.getItem(CLAVE_PLEGADOS);
    return guardado ? (JSON.parse(guardado) as GrupoModulo[]) : [];
  } catch {
    return [];
  }
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return <PermisosPantallaProvider><Marco>{children}</Marco></PermisosPantallaProvider>;
}

function Marco({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { estado: estadoPermisos, matriz, centroMando } = usePermisosPantalla();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [apariencia, setApariencia] = useState<Apariencia | null>(null);
  const [plegados, setPlegados] = useState<GrupoModulo[]>([]);
  const [buscadorAbierto, setBuscadorAbierto] = useState(false);

  useEffect(() => {
    const current = obtenerSesion();
    if (!current) router.replace('/login');
    else setSesion(current);
    const redirigirAlLogin = () => router.replace('/login');
    const sync=(event:StorageEvent)=>{if(event.key==='sigbo_sesion'&&!event.newValue)redirigirAlLogin()};
    window.addEventListener('storage',sync);
    window.addEventListener(EVENTO_SESION_FINALIZADA, redirigirAlLogin);
    return()=>{
      window.removeEventListener('storage',sync);
      window.removeEventListener(EVENTO_SESION_FINALIZADA, redirigirAlLogin);
    };
  }, [router]);

  useEffect(() => { setPlegados(leerPlegados()); }, []);

  // En telefono la barra inferior es una fila de iconos con scroll horizontal, y en
  // escritorio el menu puede pasar del alto de la pantalla: en los dos casos el modulo
  // abierto puede quedar fuera de vista. 'nearest' mueve solo ese contenedor.
  useEffect(() => {
    document
      .querySelector<HTMLElement>('.side-nav .nav-link.active')
      ?.scrollIntoView({ block: 'nearest', inline: 'nearest' });
  }, [pathname]);

  useEffect(() => {
    function alTeclado(evento: KeyboardEvent) {
      if ((evento.ctrlKey || evento.metaKey) && evento.key.toLowerCase() === 'k') {
        evento.preventDefault();
        setBuscadorAbierto((abierto) => !abierto);
      }
    }
    window.addEventListener('keydown', alTeclado);
    return () => window.removeEventListener('keydown', alTeclado);
  }, []);

  useEffect(() => {
    apiFetch('/seguridad/apariencia').then(async (res) => res.ok && setApariencia(await res.json())).catch(() => undefined);
  }, []);

  const alternarGrupo = useCallback((grupo: GrupoModulo) => {
    setPlegados((previos) => {
      const siguiente = previos.includes(grupo) ? previos.filter((g) => g !== grupo) : [...previos, grupo];
      try { window.localStorage.setItem(CLAVE_PLEGADOS, JSON.stringify(siguiente)); } catch { /* modo privado */ }
      return siguiente;
    });
  }, []);

  async function onLogout() { await logout(); router.push('/login'); }

  const permisos = sesion?.usuario.permisos ?? [];
  const slugActual = pathname.split('/')[2];
  const moduloActual = MODULOS.find((m) => m.slug === slugActual);
  const grupos = useMemo(
    () => agruparModulos(MODULOS.filter((m) =>
      (m.slug !== 'centro-mando' || centroMando?.acceso !== false) && moduloVisibleEnMenu(m, permisos, PANTALLAS, matriz))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [sesion, matriz, centroMando],
  );

  const migas = migasDePan(pathname);
  const pantallaActual = pantallaDeRuta(pathname, PANTALLAS);
  const titulo = pantallaActual?.nombre
    ?? migas[migas.length - 1]?.nombre
    ?? 'Panel de mando';
  // En la portada de un modulo se explica el modulo; mas adentro, la ruta ya ubica.
  const descripcion = pathname === `/dashboard/${slugActual}` ? moduloActual?.descripcion : undefined;
  const decision = decisionDeRuta(pathname, PANTALLAS, matriz);
  const bloqueada = decision !== null && !decision.ver;

  // La pestana decia "SIGBO-CBVC" en todas las pantallas: con varias abiertas no habia
  // forma de distinguirlas, y el historial y los favoritos quedaban todos iguales.
  useEffect(() => { document.title = `${titulo} · SIGBO`; }, [titulo]);

  if (!sesion) return null;
  const iniciales = sesion.usuario.username.slice(0, 2).toUpperCase();

  return (
    <div className="app-shell">
      <aside className="app-sidebar">
        <div className="brand">
          <div className="brand-mark">
            {apariencia?.logoMenu ? <img src={`${API_ORIGIN}${apariencia.logoMenu}`} alt="" /> : <SystemIcon name="flame" size={23} />}
          </div>
          <div className="brand-copy">
            <div className="brand-title">{apariencia?.nombreSistemaMenu || 'SIGBO · CBVC'}</div>
            <div className="brand-subtitle">{apariencia?.subtituloMenu || 'Comando operativo'}</div>
          </div>
        </div>
        <nav className="side-nav" aria-label="Navegación principal">
          <MenuLink href="/dashboard" icono="home" nombre="Inicio" activo={pathname === '/dashboard'} />
          {grupos.map((grupo) => {
            // El grupo del modulo abierto se muestra siempre, para no esconder donde estas parado.
            const contieneActual = grupo.modulos.some((m) => m.slug === slugActual);
            const abierto = contieneActual || !plegados.includes(grupo.id);
            const idLista = `grupo-${grupo.id}`;
            return (
              <div key={grupo.id} className="side-group">
                <button
                  type="button"
                  className="side-group-header"
                  onClick={() => alternarGrupo(grupo.id)}
                  aria-expanded={abierto}
                  aria-controls={idLista}
                >
                  <span>{grupo.nombre}</span>
                  <span className={`side-group-chevron${abierto ? ' abierto' : ''}`} aria-hidden="true">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
                  </span>
                </button>
                <div id={idLista} className="side-group-items" hidden={!abierto}>
                  {grupo.modulos.map((m) => (
                    <MenuLink key={m.slug} href={`/dashboard/${m.slug}`} icono={m.icono} nombre={m.nombre} activo={slugActual === m.slug} proximamente={!m.disponible} />
                  ))}
                </div>
              </div>
            );
          })}
        </nav>
        <div className="sidebar-footer">
          <MenuLink href="/dashboard/mi-perfil" icono="user" nombre="Mi perfil" activo={pathname === '/dashboard/mi-perfil'} />
          <MenuLink href="/dashboard/reportar" icono="document" nombre="Reportar un problema" activo={pathname === '/dashboard/reportar'} />
          <button type="button" className="logout-button" onClick={onLogout}>Cerrar sesión</button>
        </div>
      </aside>

      <main className="app-main" id="contenido-principal" tabIndex={-1}>
        <header className="topbar">
          <div style={{ minWidth: 0 }}>
            <nav className="migas" aria-label="Ruta de navegación">
              {migas.map((miga, i) => (
                <span key={miga.href ?? `actual-${i}`}>
                  {i > 0 && <span className="migas-sep" aria-hidden="true">›</span>}
                  {miga.href
                    ? <Link href={miga.href}>{miga.nombre}</Link>
                    : <span aria-current="page">{miga.nombre}</span>}
                </span>
              ))}
            </nav>
            <h1>{titulo}</h1>
            {descripcion && <p className="topbar-descripcion">{descripcion}</p>}
          </div>
          <div className="topbar-acciones">
            <button type="button" className="boton-buscar" onClick={() => setBuscadorAbierto(true)}>
              <SystemIcon name="buscar" size={15} />
              <span>Buscar pantalla</span>
              <kbd>Ctrl K</kbd>
            </button>
            <div className="user-chip" title={`${sesion.usuario.roles.length} roles asignados`}>
              <span className="user-name">{sesion.usuario.username}</span>
              <span className="badge">{sesion.usuario.roles.length} roles</span>
              <span className="user-avatar">{iniciales}</span>
            </div>
          </div>
        </header>
        <div className="page-content">
          {estadoPermisos === 'sin_datos' && (
            <p className="aviso aviso-error" role="status">
              No se pudieron cargar tus permisos por pantalla. El menú muestra lo que permite tu rol; el servidor sigue aplicando las restricciones.
            </p>
          )}
          {bloqueada ? <SinAcceso nombre={pantallaActual?.nombre ?? titulo} /> : children}
        </div>
      </main>

      <BuscadorPantallas permisos={permisos} matriz={matriz} abierto={buscadorAbierto} onCerrar={() => setBuscadorAbierto(false)} />
    </div>
  );
}

function MenuLink({ href, icono, nombre, activo, proximamente }: { href: string; icono: IconoModulo | 'home' | 'user'; nombre: string; activo: boolean; proximamente?: boolean }) {
  return <Link href={href} className={`nav-link${activo ? ' active' : ''}`} aria-current={activo ? 'page' : undefined}>
    <span className="nav-icon"><SystemIcon name={icono} size={18} /></span>
    <span>{nombre}</span>
    {proximamente && <span className="nav-tag">Pronto</span>}
  </Link>;
}
```

- [ ] **Step 8: Buscador y navegación**

En `frontend/src/lib/navegacion.ts`: importar `import { MatrizWeb, pantallasVisibles } from './permisos-pantalla';` y reemplazar `buscarPantallas` por:

```ts
/**
 * Pantallas que el usuario puede abrir, filtradas por la matriz de permisos (o, si no se
 * pudo cargar, por prefijo) y por texto. Sin busqueda devuelve todas.
 */
export function buscarPantallas(consulta: string, permisos: string[], matriz: MatrizWeb | null = null): ResultadoBusqueda[] {
  const termino = consulta.trim();
  return pantallasVisibles(PANTALLAS, permisos, matriz, MODULOS)
    .map((p) => ({
      ...p,
      contexto: MODULOS.find((m) => m.slug === p.modulo)?.nombre ?? 'General',
    }))
    .filter((p) => !termino || coincideBusqueda(p.nombre, termino) || coincideBusqueda(p.contexto, termino))
    .slice(0, 40);
}
```

En `BuscadorPantallas.tsx`: la firma pasa a `{ permisos, matriz, abierto, onCerrar }: { permisos: string[]; matriz: MatrizWeb | null; abierto: boolean; onCerrar: () => void }` (importar `MatrizWeb` de `@/lib/permisos-pantalla`) y el `useMemo` a `buscarPantallas(consulta, permisos, matriz)` con dependencias `[consulta, permisos, matriz]`.

- [ ] **Step 9: Pestañas de cada módulo**

Listar los usos: `Select-String -Path frontend\src\app\dashboard -Recurse -Include layout.tsx -Pattern "TABS.map"`. En cada uno de esos 13 archivos:
1. agregar `import { useTabsVisibles } from '@/app/components/PermisosPantallaProvider';`
2. dentro del componente, primera línea: `const tabs = useTabsVisibles(TABS);`
3. reemplazar `TABS.map(` por `tabs.map(`.
No cambiar el marcado ni los estilos de cada submenú.

- [ ] **Step 10: Verificar**

Run: `cd frontend; node --test scripts/pruebas/; npx tsc --noEmit; npm run audit:a11y; npm run audit:contraste`
Expected: todo en verde.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/lib/permisos-pantalla.ts frontend/src/lib/navegacion.ts frontend/src/app/components frontend/src/app/dashboard frontend/scripts/pruebas/permisos-pantalla.test.mjs
git commit -m "Web: menú, pestañas, buscador y pantallas obedecen la matriz por pantalla

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 8: Seguridad › Pantallas para ~145 pantallas (agrupar, buscar, rutas y vista previa)

**Files:**
- Create: `frontend/src/lib/pantallas-admin.ts` (lógica pura de agrupación y búsqueda)
- Modify (reemplazar): `frontend/src/app/dashboard/seguridad/pantallas/page.tsx`
- Test: `frontend/scripts/pruebas/pantallas-admin.test.mjs`

**Interfaces:**
- Consumes: `GET /pantallas` (filas de `seguridad.pantallas`, incluidas las `0xA…`), `GET /pantallas/catalogo-web` y `GET /pantallas/vista-previa?usuarioId=` (Task 6), `GET /pantallas/sujetos`, `GET/PUT/DELETE /pantallas/reglas`.
- Produces: `agruparPantallas(filas, catalogo, nombresModulo) → GrupoAdmin[]` y `filtrarGrupos(grupos, texto) → GrupoAdmin[]` en `pantallas-admin.ts`.

- [ ] **Step 1: Prueba que falla**

`frontend/scripts/pruebas/pantallas-admin.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { agruparPantallas, filtrarGrupos } from '../../src/lib/pantallas-admin.ts';

const filas = [
  { codigo: '0xA001', nombre: 'Alertas (app)', descripcion: null, confidencialAplica: false, activa: true },
  { codigo: '0xB001', nombre: 'Personal', descripcion: 'personal · /dashboard/personal', confidencialAplica: false, activa: true },
  { codigo: '0xB002', nombre: 'Artículos', descripcion: 'deposito · /dashboard/deposito/articulos', confidencialAplica: false, activa: true },
  { codigo: '0xC003', nombre: 'Centro de mando › Emergencias en curso', descripcion: null, confidencialAplica: false, activa: true },
  { codigo: '0xB0FF', nombre: 'Vieja', descripcion: null, confidencialAplica: false, activa: false },
];
const catalogo = [
  { codigo: '0xB001', nombre: 'Personal', ruta: '/dashboard/personal', modulo: 'personal', tipo: 'WEB', rutasApi: [] },
  { codigo: '0xB002', nombre: 'Artículos', ruta: '/dashboard/deposito/articulos', modulo: 'deposito', tipo: 'WEB', rutasApi: [] },
  { codigo: '0xC003', nombre: 'Centro de mando › Emergencias en curso', ruta: '/dashboard/centro-mando', modulo: 'centro-mando', tipo: 'SECCION', rutasApi: [] },
];
const nombres = { personal: 'Personal', deposito: 'Depósito' };

test('agrupa por módulo, con la app móvil y el Centro de mando aparte, sin las inactivas', () => {
  const g = agruparPantallas(filas, catalogo, nombres);
  assert.deepEqual(g.map((x) => x.titulo), ['Centro de mando', 'Depósito', 'Personal', 'App móvil']);
  assert.equal(g.flatMap((x) => x.pantallas).some((p) => p.codigo === '0xB0FF'), false);
});

test('busca por nombre, ruta o código sin distinguir acentos', () => {
  const g = agruparPantallas(filas, catalogo, nombres);
  assert.deepEqual(filtrarGrupos(g, 'articulos').flatMap((x) => x.pantallas).map((p) => p.codigo), ['0xB002']);
  assert.deepEqual(filtrarGrupos(g, '/dashboard/personal').flatMap((x) => x.pantallas).map((p) => p.codigo), ['0xB001']);
  assert.deepEqual(filtrarGrupos(g, '0xa001').flatMap((x) => x.pantallas).map((p) => p.codigo), ['0xA001']);
  assert.equal(filtrarGrupos(g, '').length, 4);
});
```

- [ ] **Step 2: Correrla**

Run: `cd frontend; node --test scripts/pruebas/pantallas-admin.test.mjs`
Expected: FAIL.

- [ ] **Step 3: `frontend/src/lib/pantallas-admin.ts`**

```ts
/** Agrupacion y busqueda de la administracion de reglas por pantalla (Seguridad › Pantallas). */

export interface FilaPantalla { codigo: string; nombre: string; descripcion: string | null; confidencialAplica: boolean; activa: boolean }
export interface RutaApiAdmin { metodo: string; patron: string; permisos: string[]; exenta: boolean }
export interface PantallaCatalogoAdmin { codigo: string; nombre: string; ruta: string; modulo: string; tipo: 'WEB' | 'SECCION'; rutasApi: RutaApiAdmin[] }
export interface PantallaAdmin extends FilaPantalla { ruta: string | null; rutasApi: RutaApiAdmin[]; tipo: 'WEB' | 'SECCION' | 'MOVIL' }
export interface GrupoAdmin { clave: string; titulo: string; pantallas: PantallaAdmin[] }

const sinAcentos = (t: string) => t.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

export function agruparPantallas(filas: FilaPantalla[], catalogo: PantallaCatalogoAdmin[], nombresModulo: Record<string, string>): GrupoAdmin[] {
  const porCodigo = new Map(catalogo.map((c) => [c.codigo, c]));
  const grupos = new Map<string, GrupoAdmin>();
  for (const f of filas.filter((x) => x.activa)) {
    const c = porCodigo.get(f.codigo);
    const tipo: PantallaAdmin['tipo'] = c ? c.tipo : 'MOVIL';
    const clave = tipo === 'MOVIL' ? 'app-movil' : c!.modulo;
    const titulo = tipo === 'MOVIL' ? 'App móvil' : clave === 'centro-mando' ? 'Centro de mando' : nombresModulo[clave] ?? clave;
    const grupo = grupos.get(clave) ?? { clave, titulo, pantallas: [] };
    grupo.pantallas.push({ ...f, ruta: c?.ruta ?? null, rutasApi: c?.rutasApi ?? [], tipo });
    grupos.set(clave, grupo);
  }
  const lista = [...grupos.values()];
  for (const g of lista) g.pantallas.sort((a, b) => a.nombre.localeCompare(b.nombre, 'es'));
  // La app movil al final: es otro canal, con sus propias pantallas.
  return lista.sort((a, b) => (a.clave === 'app-movil' ? 1 : b.clave === 'app-movil' ? -1 : a.titulo.localeCompare(b.titulo, 'es')));
}

export function filtrarGrupos(grupos: GrupoAdmin[], texto: string): GrupoAdmin[] {
  const t = sinAcentos(texto.trim());
  if (!t) return grupos;
  return grupos
    .map((g) => ({ ...g, pantallas: g.pantallas.filter((p) => [p.nombre, p.codigo, p.ruta ?? '', g.titulo].some((x) => sinAcentos(x).includes(t))) }))
    .filter((g) => g.pantallas.length > 0);
}
```

- [ ] **Step 4: Correr la prueba**

Run: `cd frontend; node --test scripts/pruebas/`
Expected: PASS.

- [ ] **Step 5: Reemplazar `frontend/src/app/dashboard/seguridad/pantallas/page.tsx`**

Conserva el editor de reglas actual (mismos endpoints y comportamiento) y suma: lista agrupada con búsqueda, rutas de API de la pantalla elegida y vista previa por usuario.

```tsx
'use client';

import { useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { MODULOS } from '@/lib/modulos';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { agruparPantallas, FilaPantalla, filtrarGrupos, PantallaAdmin, PantallaCatalogoAdmin } from '@/lib/pantallas-admin';

type TipoSujeto = 'ROL' | 'USUARIO' | 'RANGO' | 'CARGO';
type Accion = 'ver' | 'crear' | 'editar' | 'eliminar' | 'confidencial' | 'denegar';
interface Sujeto { id: string; nombre: string }
interface Sujetos { roles: Sujeto[]; usuarios: Sujeto[]; rangos: Sujeto[]; cargos: Sujeto[] }
interface Regla { id: string; pantallaCodigo: string; sujetoTipo: TipoSujeto; sujetoId: string; ver: boolean; crear: boolean; editar: boolean; eliminar: boolean; confidencial: boolean; denegar: boolean }
interface DecisionUi { permitido: boolean; origen: 'ROL' | 'REGLA' }
interface FilaVistaPrevia { codigo: string; ruta: string; nombre: string; modulo: string; ver: DecisionUi; crear: DecisionUi; editar: DecisionUi; eliminar: DecisionUi }

const ACCIONES: { key: Accion; label: string }[] = [
  { key: 'ver', label: 'Ver' }, { key: 'crear', label: 'Crear' }, { key: 'editar', label: 'Editar' },
  { key: 'eliminar', label: 'Eliminar' }, { key: 'confidencial', label: 'Confidencial' }, { key: 'denegar', label: 'Denegar' },
];
const GRUPOS_SUJETO: { tipo: TipoSujeto; titulo: string; clave: keyof Sujetos }[] = [
  { tipo: 'ROL', titulo: 'Rol', clave: 'roles' }, { tipo: 'USUARIO', titulo: 'Usuario', clave: 'usuarios' },
  { tipo: 'RANGO', titulo: 'Rango', clave: 'rangos' }, { tipo: 'CARGO', titulo: 'Cargo', clave: 'cargos' },
];
const VACIA: Record<Accion, boolean> = { ver: false, crear: false, editar: false, eliminar: false, confidencial: false, denegar: false };
const NOMBRES_MODULO = Object.fromEntries(MODULOS.map((m) => [m.slug, m.nombre]));

export default function PermisosPantallaPage() {
  const confirmar = useConfirmacion();
  const [filas, setFilas] = useState<FilaPantalla[]>([]);
  const [catalogo, setCatalogo] = useState<PantallaCatalogoAdmin[]>([]);
  const [sujetos, setSujetos] = useState<Sujetos>({ roles: [], usuarios: [], rangos: [], cargos: [] });
  const [busqueda, setBusqueda] = useState('');
  const [codigo, setCodigo] = useState('');
  const [reglas, setReglas] = useState<Regla[]>([]);
  const [tipo, setTipo] = useState<TipoSujeto>('ROL');
  const [sujetoId, setSujetoId] = useState('');
  const [form, setForm] = useState<Record<Accion, boolean>>(VACIA);
  const [editando, setEditando] = useState<string | null>(null);
  const [cargando, setCargando] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [usuarioPrevia, setUsuarioPrevia] = useState('');
  const [previa, setPrevia] = useState<FilaVistaPrevia[] | null>(null);
  const [soloRestringidas, setSoloRestringidas] = useState(true);

  const grupos = useMemo(() => agruparPantallas(filas, catalogo, NOMBRES_MODULO), [filas, catalogo]);
  const visibles = useMemo(() => filtrarGrupos(grupos, busqueda), [grupos, busqueda]);
  const pantalla: PantallaAdmin | undefined = grupos.flatMap((g) => g.pantallas).find((p) => p.codigo === codigo);
  const opcionesSujeto = sujetos[GRUPOS_SUJETO.find((g) => g.tipo === tipo)!.clave];

  async function cargarBase() {
    setCargando(true); setError('');
    try {
      const [pRes, cRes, sRes] = await Promise.all([apiFetch('/pantallas'), apiFetch('/pantallas/catalogo-web'), apiFetch('/pantallas/sujetos')]);
      if (!pRes.ok || !cRes.ok || !sRes.ok) throw new Error('Tu usuario no tiene permiso para administrar reglas por pantalla.');
      setFilas(await pRes.json());
      setCatalogo(((await cRes.json()) as { pantallas: PantallaCatalogoAdmin[] }).pantallas);
      setSujetos(await sRes.json());
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cargar la configuración.'); }
    finally { setCargando(false); }
  }

  async function cargarReglas() {
    if (!codigo) { setReglas([]); return; }
    try {
      const res = await apiFetch(`/pantallas/reglas?codigo=${encodeURIComponent(codigo)}`);
      if (!res.ok) throw new Error('No se pudieron cargar las reglas.');
      setReglas(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudieron cargar las reglas.'); }
  }

  useEffect(() => { void cargarBase(); }, []);
  useEffect(() => { void cargarReglas(); setEditando(null); setForm(VACIA); setSujetoId(''); }, [codigo]);

  function cargarEnEditor(r: Regla) {
    setTipo(r.sujetoTipo); setSujetoId(r.sujetoId); setEditando(r.id);
    setForm({ ver: r.ver, crear: r.crear, editar: r.editar, eliminar: r.eliminar, confidencial: r.confidencial, denegar: r.denegar });
  }

  async function guardar() {
    if (!codigo || !sujetoId) return;
    setGuardando(true); setError(''); setAviso('');
    try {
      const res = await apiFetch('/pantallas/reglas', { method: 'PUT', body: JSON.stringify({ pantallaCodigo: codigo, sujetoTipo: tipo, sujetoId, ...form }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message ?? 'No se pudo guardar la regla.');
      setAviso('Regla guardada y registrada en auditoría. Rige en el servidor en menos de un minuto.');
      setEditando(null); setForm(VACIA); setSujetoId('');
      await cargarReglas();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo guardar la regla.'); }
    finally { setGuardando(false); }
  }

  async function quitar(r: Regla) {
    const ok = await confirmar({ titulo: 'Quitar regla', mensaje: `Se quita la regla de ${r.sujetoTipo.toLowerCase()} «${nombreSujeto(r)}» sobre «${pantalla?.nombre ?? r.pantallaCodigo}».`, confirmar: 'Quitar', peligro: true });
    if (!ok) return;
    setError(''); setAviso('');
    try {
      const res = await apiFetch(`/pantallas/reglas/${r.id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('No se pudo quitar la regla.');
      if (editando === r.id) { setEditando(null); setForm(VACIA); setSujetoId(''); }
      setAviso('Regla quitada y registrada en auditoría.');
      await cargarReglas();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo quitar la regla.'); }
  }

  async function verPrevia() {
    if (!usuarioPrevia) return;
    setError(''); setPrevia(null);
    try {
      const res = await apiFetch(`/pantallas/vista-previa?usuarioId=${encodeURIComponent(usuarioPrevia)}`);
      if (!res.ok) throw new Error('No se pudo calcular la vista previa.');
      setPrevia(await res.json());
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo calcular la vista previa.'); }
  }

  function nombreSujeto(r: Regla) {
    return sujetos[GRUPOS_SUJETO.find((g) => g.tipo === r.sujetoTipo)!.clave].find((x) => x.id === r.sujetoId)?.nombre ?? r.sujetoId;
  }

  const filasPrevia = (previa ?? []).filter((f) => !soloRestringidas || [f.ver, f.crear, f.editar, f.eliminar].some((d) => d.origen === 'REGLA'));
  const marca = (d: DecisionUi) => <span className="badge" style={{ background: d.permitido ? 'var(--ok-fill)' : 'var(--bad-fill)' }} title={d.origen === 'REGLA' ? 'Lo decide una regla' : 'Lo decide el rol'}>{d.permitido ? 'Sí' : 'No'}{d.origen === 'REGLA' ? ' · regla' : ''}</span>;

  if (cargando) return <Cargando texto="Cargando pantallas y reglas…" />;

  return <div style={{ display: 'grid', gap: 16 }}>
    <p style={{ color: 'var(--muted)', fontSize: 14 }}>
      Las reglas restringen lo que el rol permite, por rol, usuario, rango o cargo, y el servidor las exige en cada pantalla. Denegar gana siempre.
      Para dar más de lo que el rol permite, asigná el permiso en Roles.
    </p>
    {error && <Aviso tipo="error" texto={error} />}
    {aviso && <Aviso tipo="exito" texto={aviso} />}

    <div className="pantallas-admin">
      <section className="card pantallas-lista" aria-labelledby="titulo-lista">
        <h2 id="titulo-lista" style={{ fontSize: 16, marginBottom: 10 }}>Pantallas</h2>
        <label htmlFor="buscar-pantalla" className="sr-only">Buscar pantalla</label>
        <input id="buscar-pantalla" className="input-field" placeholder="Buscar por nombre, ruta o código…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
        <div style={{ marginTop: 10, display: 'grid', gap: 12 }}>
          {visibles.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Ninguna pantalla coincide con «{busqueda}».</p>}
          {visibles.map((g) => <div key={g.clave}>
            <h3 className="grupo-titulo">{g.titulo}</h3>
            <ul style={{ listStyle: 'none', display: 'grid', gap: 2 }}>
              {g.pantallas.map((p) => <li key={p.codigo}>
                <button type="button" className={`pantallas-opcion${p.codigo === codigo ? ' activa' : ''}`} aria-pressed={p.codigo === codigo} onClick={() => setCodigo(p.codigo)}>
                  <span>{p.nombre}</span><small>{p.codigo}</small>
                </button>
              </li>)}
            </ul>
          </div>)}
        </div>
      </section>

      <div style={{ display: 'grid', gap: 16, alignContent: 'start' }}>
        {!pantalla && <section className="card"><p style={{ color: 'var(--muted)' }}>Elegí una pantalla de la lista para ver sus rutas y reglas.</p></section>}
        {pantalla && <>
          <section className="card" aria-labelledby="titulo-pantalla">
            <h2 id="titulo-pantalla" style={{ fontSize: 17 }}>{pantalla.nombre}</h2>
            <p style={{ color: 'var(--muted)', fontSize: 13 }}>{pantalla.codigo}{pantalla.ruta ? ` · ${pantalla.ruta}` : ''} · {pantalla.tipo === 'MOVIL' ? 'app móvil' : pantalla.tipo === 'SECCION' ? 'sección del Centro de mando' : 'pantalla web'}</p>
            {pantalla.rutasApi.length > 0 && <div style={{ overflowX: 'auto', marginTop: 12 }}>
              <table className="tabla-compacta">
                <caption className="sr-only">Rutas de la API que cubre esta pantalla</caption>
                <thead><tr><th scope="col">Método</th><th scope="col">Ruta</th><th scope="col">Permiso por rol</th><th scope="col">Matriz</th></tr></thead>
                <tbody>{pantalla.rutasApi.map((r) => <tr key={`${r.metodo} ${r.patron}`}>
                  <td><code>{r.metodo}</code></td><td><code>{r.patron}</code></td>
                  <td>{r.permisos.length ? r.permisos.join(' o ') : 'cualquier usuario'}</td>
                  <td>{r.exenta ? <span className="badge" style={{ background: 'var(--neutral-fill)' }}>exenta</span> : <span className="badge" style={{ background: 'var(--info-fill)' }}>aplica</span>}</td>
                </tr>)}</tbody>
              </table>
            </div>}
          </section>

          <section className="card" style={{ display: 'grid', gap: 12 }} aria-labelledby="titulo-editor">
            <h2 id="titulo-editor" style={{ fontSize: 16 }}>{editando ? 'Editar regla' : 'Agregar regla'}</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(180px,1fr))', gap: 12 }}>
              <div><label htmlFor="tipo-sujeto">Tipo de sujeto</label>
                <select id="tipo-sujeto" className="input-field" value={tipo} onChange={(e) => { setTipo(e.target.value as TipoSujeto); setSujetoId(''); setEditando(null); setForm(VACIA); }}>
                  {GRUPOS_SUJETO.map((g) => <option key={g.tipo} value={g.tipo}>{g.titulo}</option>)}
                </select></div>
              <div><label htmlFor="sujeto">{GRUPOS_SUJETO.find((g) => g.tipo === tipo)?.titulo}</label>
                <select id="sujeto" className="input-field" value={sujetoId} onChange={(e) => setSujetoId(e.target.value)}>
                  <option value="">Seleccionar…</option>{opcionesSujeto.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
                </select></div>
            </div>
            <fieldset style={{ border: 0, display: 'flex', flexWrap: 'wrap', gap: '8px 18px' }}>
              <legend className="sr-only">Acciones</legend>
              {ACCIONES.map((a) => {
                const deshabilitada = a.key === 'confidencial' && !pantalla.confidencialAplica;
                return <label key={a.key} htmlFor={`accion-${a.key}`} style={{ display: 'inline-flex', gap: 6, alignItems: 'center', color: deshabilitada ? 'var(--muted)' : undefined }}>
                  <input id={`accion-${a.key}`} type="checkbox" checked={form[a.key]} disabled={deshabilitada} onChange={(e) => setForm((f) => ({ ...f, [a.key]: e.target.checked }))} />{a.label}
                </label>;
              })}
            </fieldset>
            <div style={{ display: 'flex', gap: 8 }}>
              <button type="button" className="btn-primary" onClick={guardar} disabled={guardando || !sujetoId}>{guardando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Agregar regla'}</button>
              {editando && <button type="button" className="service-secondary" onClick={() => { setEditando(null); setForm(VACIA); setSujetoId(''); }}>Cancelar edición</button>}
            </div>
          </section>

          <section className="card" aria-labelledby="titulo-reglas">
            <h2 id="titulo-reglas" style={{ fontSize: 16 }}>Reglas de esta pantalla</h2>
            {!reglas.length ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>Sin reglas: rige solo el permiso por rol.</p> :
              <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
                <thead><tr><th scope="col">Sujeto</th>{ACCIONES.map((a) => <th key={a.key} scope="col">{a.label}</th>)}<th scope="col">Acciones</th></tr></thead>
                <tbody>{reglas.map((r) => <tr key={r.id}>
                  <td>{r.sujetoTipo} · {nombreSujeto(r)}</td>
                  {ACCIONES.map((a) => <td key={a.key} style={{ textAlign: 'center' }}>{r[a.key] ? 'Sí' : '—'}</td>)}
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <button type="button" className="service-secondary" onClick={() => cargarEnEditor(r)}>Editar</button>{' '}
                    <button type="button" className="service-secondary" onClick={() => void quitar(r)}>Quitar</button>
                  </td>
                </tr>)}</tbody>
              </table></div>}
          </section>
        </>}

        <section className="card" style={{ display: 'grid', gap: 10 }} aria-labelledby="titulo-previa">
          <h2 id="titulo-previa" style={{ fontSize: 16 }}>Vista previa: qué ve una persona</h2>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
            <div><label htmlFor="usuario-previa">Usuario</label>
              <select id="usuario-previa" className="input-field" value={usuarioPrevia} onChange={(e) => { setUsuarioPrevia(e.target.value); setPrevia(null); }}>
                <option value="">Seleccionar…</option>{sujetos.usuarios.map((u) => <option key={u.id} value={u.id}>{u.nombre}</option>)}
              </select></div>
            <button type="button" className="btn-primary" disabled={!usuarioPrevia} onClick={() => void verPrevia()}>Calcular</button>
            <label htmlFor="solo-restringidas" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
              <input id="solo-restringidas" type="checkbox" checked={soloRestringidas} onChange={(e) => setSoloRestringidas(e.target.checked)} />Solo donde decide una regla
            </label>
          </div>
          {previa && (filasPrevia.length === 0
            ? <p style={{ color: 'var(--muted)', fontSize: 13 }}>{soloRestringidas ? 'Ninguna regla afecta a esta persona: ve lo que su rol permite.' : 'Sin pantallas.'}</p>
            : <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
              <thead><tr><th scope="col">Pantalla</th><th scope="col">Ver</th><th scope="col">Crear</th><th scope="col">Editar</th><th scope="col">Eliminar</th></tr></thead>
              <tbody>{filasPrevia.map((f) => <tr key={f.codigo}>
                <td>{f.nombre}<small style={{ display: 'block', color: 'var(--muted)' }}>{f.ruta}</small></td>
                <td>{marca(f.ver)}</td><td>{marca(f.crear)}</td><td>{marca(f.editar)}</td><td>{marca(f.eliminar)}</td>
              </tr>)}</tbody>
            </table></div>)}
        </section>
      </div>
    </div>
  </div>;
}
```

- [ ] **Step 6: Estilos (en `frontend/src/app/globals.css`, al final; solo tokens)**

```css
/* Seguridad › Pantallas: lista agrupada + detalle */
.pantallas-admin { display: grid; grid-template-columns: minmax(240px, 320px) 1fr; gap: 16px; align-items: start; }
.pantallas-lista { position: sticky; top: 12px; max-height: calc(100vh - 140px); overflow-y: auto; }
.pantallas-opcion { width: 100%; display: flex; justify-content: space-between; gap: 8px; padding: 6px 8px; color: var(--ink); background: transparent; border: 0; border-radius: 7px; text-align: left; font-size: 13px; cursor: pointer; }
.pantallas-opcion small { color: var(--muted); font: 10px 'Space Mono', monospace; }
.pantallas-opcion:hover { background: var(--surface-soft); }
.pantallas-opcion.activa { background: var(--info-fill); font-weight: 700; }
.tabla-compacta { width: 100%; border-collapse: collapse; font-size: 13px; }
.tabla-compacta th { text-align: left; padding: 6px 8px; color: var(--muted); font-size: 11px; border-bottom: 1px solid var(--line); }
.tabla-compacta td { padding: 7px 8px; border-bottom: 1px solid var(--line-soft); vertical-align: top; }
@media (max-width: 860px) { .pantallas-admin { grid-template-columns: 1fr; } .pantallas-lista { position: static; max-height: 360px; } }
```

- [ ] **Step 7: Verificar**

Run: `cd frontend; node --test scripts/pruebas/; npx tsc --noEmit; npm run audit:a11y; npm run audit:contraste`
Expected: verde.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/lib/pantallas-admin.ts frontend/scripts/pruebas/pantallas-admin.test.mjs frontend/src/app/dashboard/seguridad/pantallas/page.tsx frontend/src/app/globals.css
git commit -m "Seguridad › Pantallas: agrupada por módulo, con búsqueda, rutas de API y vista previa por usuario

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 9: Área Sistema — lógica pura (respaldos, registros, migraciones, red y tareas)

**Files:**
- Create: `backend/src/modules/sistema/respaldos.logica.ts`
- Create: `backend/src/modules/sistema/registros.logica.ts`
- Create: `backend/src/modules/sistema/migraciones.logica.ts`
- Create: `backend/src/modules/sistema/red.logica.ts`
- Create: `backend/src/modules/sistema/tareas.logica.ts`
- Test: `backend/src/modules/sistema/sistema.logica.spec.ts`

**Interfaces:**
- Produces:
  - `respaldos.logica.ts`: `NOMBRE_RESPALDO: RegExp`, `validarNombreRespaldo(nombre: unknown): boolean`, `fechaDeRespaldo(nombre: string): string | null` (local, `YYYY-MM-DDTHH:MM:SS`), `interface RespaldoArchivo { nombre: string; fecha: string; tamanioBytes: number; tieneSha256: boolean }`, `interface CorridaRespaldo { archivo: string | null; tamanio: string | null; sha256: string | null; resultado: 'OK' | 'FALLO' | 'INCOMPLETA'; pruebaRestauracion: 'OMITIDA' | 'OK' | 'FALLO' | 'DESCONOCIDA'; detalleRestauracion: string | null; avisos: string[] }`, `parsearRegistro(texto: string): CorridaRespaldo[]`, `interface AlertaSistema { nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }`, `alertasRespaldo(archivos, corridas, ahora: Date): AlertaSistema[]`.
  - `registros.logica.ts`: `ARCHIVOS_REGISTRO`, `type ClaveRegistro`, `esClaveRegistro(x: string): x is ClaveRegistro`, `ocultarSecretos(linea: string): string`, `ultimasLineas(texto: string, max: number): string[]`, `type NivelLinea = 'ERROR' | 'WARN' | 'LOG' | 'OTRO'`, `nivelDeLinea(linea: string): NivelLinea`.
  - `migraciones.logica.ts`: `parsearManifiesto(texto: string): Array<{ nombre: string; hash: string }>`, `interface EstadoMigraciones { total: number; aplicadas: number; pendientes: string[]; alteradas: string[]; desconocidas: string[]; ultimaAplicada: { nombre: string; aplicadaEn: string } | null }`, `compararMigraciones(manifiesto, aplicadas: Array<{ nombre: string; hash: string; aplicadaEn: Date | string }>): EstadoMigraciones`.
  - `red.logica.ts`: `interface DireccionRed { nombre: string; ip: string; virtual: boolean }`, `direccionesDeRed(interfaces: NodeJS.Dict<os.NetworkInterfaceInfo[]>): DireccionRed[]`, `contenidoQrConexion(urlApi: string): string`.
  - `tareas.logica.ts`: `TAREAS_WINDOWS` (`'SIGBO-Respaldo-Diario' | 'SIGBO-Arranque-Automatico'`), `type NombreTarea`, `SCRIPT_CONSULTA_TAREAS: string`, `scriptIniciarTarea(nombre: NombreTarea): string`, `interface TareaProgramada { nombre: string; existe: boolean; estado: 'LISTA' | 'EN_EJECUCION' | 'DESHABILITADA' | 'DESCONOCIDO' | null; ultimaEjecucion: string | null; ultimoResultado: number | null; descripcionResultado: string | null; proximaEjecucion: string | null }`, `parsearTareas(json: string): TareaProgramada[]`, `describirResultado(codigo: number | null): string | null`.

- [ ] **Step 1: Pruebas que fallan**

`backend/src/modules/sistema/sistema.logica.spec.ts`:

```ts
import { compararMigraciones, parsearManifiesto } from './migraciones.logica';
import { contenidoQrConexion, direccionesDeRed } from './red.logica';
import { esClaveRegistro, nivelDeLinea, ocultarSecretos, ultimasLineas } from './registros.logica';
import { alertasRespaldo, fechaDeRespaldo, parsearRegistro, validarNombreRespaldo } from './respaldos.logica';
import { describirResultado, parsearTareas, SCRIPT_CONSULTA_TAREAS, scriptIniciarTarea } from './tareas.logica';

const REGISTRO = [
  '[1/5] Respaldando sigbo_cbvc ...',
  '[2/5] Verificando integridad (VERIFYONLY + CHECKSUM) ...',
  '[3/5] Copiando al equipo y calculando SHA-256 ...',
  '[4/5] (omitido) Use -ProbarRestauracion para restaurar de prueba.',
  '[5/5] Retencion: se conservan los ultimos 14 respaldos ...',
  '',
  'Respaldo listo: C:\\Proyectos\\Personal\\SIGBO\\respaldos\\sigbo_cbvc-20261008-081341.bak (18 MB)',
  'SHA-256: 85D4D2339EF40DE3DED8B7436F03A7ECA5ECEBB0CE6AE31143258330899ABD0C',
  '',
  'RESULTADO: OK',
  '[1/5] Respaldando sigbo_cbvc ...',
  '[4/5] Restaurando de prueba ...',
  'Restauracion correcta: 312 tablas',
  'AVISO: no se pudo copiar a la ubicacion externa',
  'RESULTADO: FALLO',
  '[1/5] Respaldando sigbo_cbvc ...',
].join('\r\n');

describe('respaldos', () => {
  it('lee cada corrida del registro real', () => {
    const c = parsearRegistro(REGISTRO);
    expect(c).toHaveLength(3);
    expect(c[0]).toMatchObject({ archivo: 'sigbo_cbvc-20261008-081341.bak', tamanio: '18 MB', resultado: 'OK', pruebaRestauracion: 'OMITIDA' });
    expect(c[0].sha256).toBe('85d4d2339ef40de3ded8b7436f03a7eca5ecebb0ce6ae31143258330899abd0c');
    expect(c[1]).toMatchObject({ resultado: 'FALLO', pruebaRestauracion: 'OK', detalleRestauracion: '312 tablas', avisos: ['AVISO: no se pudo copiar a la ubicacion externa'] });
    expect(c[2].resultado).toBe('INCOMPLETA');
  });

  it('solo acepta nombres de respaldo exactos: nada de rutas', () => {
    expect(validarNombreRespaldo('sigbo_cbvc-20261009-082934.bak')).toBe(true);
    for (const malo of ['..\\..\\backend\\.env', 'sigbo_cbvc-20261009-082934.bak/../x', '../sigbo_cbvc-20261009-082934.bak',
      'sigbo_cbvc-20261009-082934.bak.sha256', 'otra-20261009-082934.bak', '', null, 42]) {
      expect(validarNombreRespaldo(malo)).toBe(false);
    }
  });

  it('la fecha sale del nombre, en hora local', () => {
    expect(fechaDeRespaldo('sigbo_cbvc-20261009-082934.bak')).toBe('2026-10-09T08:29:34');
    expect(fechaDeRespaldo('x.bak')).toBeNull();
  });

  it('alerta si no hay respaldo en 24 h, si la última corrida falló, si nunca se probó restaurar y si falta un .sha256', () => {
    const archivos = [
      { nombre: 'sigbo_cbvc-20261008-081341.bak', fecha: '2026-10-08T08:13:41', tamanioBytes: 1, tieneSha256: true },
      { nombre: 'sigbo_cbvc-20261006-080917.bak', fecha: '2026-10-06T08:09:17', tamanioBytes: 1, tieneSha256: false },
    ];
    const ahora = new Date('2026-10-09T12:00:00');
    const soloOk = parsearRegistro(REGISTRO).slice(0, 1);
    const mensajes = alertasRespaldo(archivos, soloOk, ahora).map((a) => `${a.nivel}:${a.mensaje}`);
    expect(mensajes.some((m) => m.startsWith('critica:') && m.includes('24 horas'))).toBe(true);
    expect(mensajes.some((m) => m.includes('Nunca se probó restaurar'))).toBe(true);
    expect(mensajes.some((m) => m.includes('.sha256'))).toBe(true);
    const conFallo = alertasRespaldo(archivos, parsearRegistro(REGISTRO).slice(0, 2), new Date('2026-10-08T09:00:00'));
    expect(conFallo.some((a) => a.nivel === 'critica' && a.mensaje.includes('FALLO'))).toBe(true);
    expect(conFallo.some((a) => a.mensaje.includes('24 horas'))).toBe(false);
    expect(alertasRespaldo([], [], ahora)[0]).toMatchObject({ nivel: 'critica' });
  });
});

describe('registros', () => {
  it('solo claves de la lista cerrada', () => {
    expect(esClaveRegistro('backend-err')).toBe(true);
    expect(esClaveRegistro('..\\backend\\.env')).toBe(false);
    expect(esClaveRegistro('constructor')).toBe(false);
  });

  it('oculta contraseñas, tokens, cookies y JWT antes de mostrar', () => {
    expect(ocultarSecretos('DB_PASSWORD=Sup3r!secreta otra=1')).toBe('DB_PASSWORD=[oculto] otra=1');
    expect(ocultarSecretos('{"password":"abc123","usuario":"x"}')).toBe('{"password":"[oculto]","usuario":"x"}');
    expect(ocultarSecretos('Authorization: Bearer abc.def.ghi')).not.toContain('abc.def.ghi');
    expect(ocultarSecretos('cookie sigbo_access=eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiIxMjM0NTY3OCJ9.c2lnbmF0dXJhMTIz; path=/')).not.toMatch(/eyJ/);
    expect(ocultarSecretos('token: 0123456789abcdef')).toBe('token: [oculto]');
    expect(ocultarSecretos('[Nest] 123  - LOG [RouterExplorer] Mapped {/api/v1/salud, GET}')).toBe('[Nest] 123  - LOG [RouterExplorer] Mapped {/api/v1/salud, GET}');
  });

  it('se queda con las últimas líneas y saca los colores de consola', () => {
    expect(ultimasLineas('a\r\nb\r\nc\r\n', 2)).toEqual(['b', 'c']);
    expect(ultimasLineas('\u001b[32mLOG\u001b[39m listo', 5)).toEqual(['LOG listo']);
  });

  it('reconoce el nivel de una línea de Nest', () => {
    expect(nivelDeLinea('[Nest] 1 - 09/10/2026 ERROR [ExceptionsHandler] x')).toBe('ERROR');
    expect(nivelDeLinea('[Nest] 1 - 09/10/2026 WARN [MatrizWeb] y')).toBe('WARN');
    expect(nivelDeLinea('[Nest] 1 - 09/10/2026 LOG [NestApplication] z')).toBe('LOG');
    expect(nivelDeLinea('=== 2026-10-09T08:00:00 ===')).toBe('OTRO');
  });
});

describe('migraciones', () => {
  const manifiesto = parsearManifiesto([
    '# comentario',
    `${'a'.repeat(64)}  000_create_database.sql`,
    `${'B'.repeat(64)}  093_centro_operaciones_incidentes.sql`,
    `${'c'.repeat(64)}  094_gre_base_documental.sql`,
    `${'d'.repeat(64)}  096_sistema_permisos.sql`,
  ].join('\n'));

  it('lee el manifiesto en mayúsculas y sin comentarios', () => {
    expect(manifiesto).toHaveLength(4);
    expect(manifiesto[2]).toEqual({ nombre: '094_gre_base_documental.sql', hash: 'C'.repeat(64) });
  });

  it('separa aplicadas, pendientes, alteradas y desconocidas (sin contar la 000)', () => {
    const e = compararMigraciones(manifiesto, [
      { nombre: '093_centro_operaciones_incidentes.sql', hash: 'b'.repeat(64), aplicadaEn: '2026-10-07T10:00:00Z' },
      { nombre: '096_sistema_permisos.sql', hash: 'e'.repeat(64), aplicadaEn: '2026-10-09T10:00:00Z' },
      { nombre: '050_vieja_borrada.sql', hash: 'f'.repeat(64), aplicadaEn: '2026-01-01T10:00:00Z' },
    ]);
    expect(e).toMatchObject({ total: 3, aplicadas: 2, pendientes: ['094_gre_base_documental.sql'], alteradas: ['096_sistema_permisos.sql'], desconocidas: ['050_vieja_borrada.sql'] });
    expect(e.ultimaAplicada).toEqual({ nombre: '096_sistema_permisos.sql', aplicadaEn: '2026-10-09T10:00:00.000Z' });
  });
});

describe('red', () => {
  it('direcciones privadas reales primero (Wi-Fi/Ethernet), sin virtuales si hay reales', () => {
    const d = direccionesDeRed({
      'vEthernet (WSL)': [{ family: 'IPv4', address: '172.20.0.1', internal: false } as never],
      'Wi-Fi': [{ family: 'IPv4', address: '192.168.0.15', internal: false } as never, { family: 'IPv6', address: 'fe80::1', internal: false } as never],
      Loopback: [{ family: 'IPv4', address: '127.0.0.1', internal: true } as never],
      Otra: [{ family: 'IPv4', address: '10.0.0.9', internal: false } as never],
      Publica: [{ family: 'IPv4', address: '8.8.8.8', internal: false } as never],
    });
    expect(d.map((x) => x.ip)).toEqual(['192.168.0.15', '10.0.0.9']);
  });

  it('el QR de conexión usa el formato que lee la app', () => {
    expect(contenidoQrConexion('http://192.168.0.15:3001/api/v1')).toBe('sigbo://servidor?url=http%3A%2F%2F192.168.0.15%3A3001%2Fapi%2Fv1');
  });
});

describe('tareas de Windows', () => {
  it('el script solo nombra las tareas fijas', () => {
    expect(SCRIPT_CONSULTA_TAREAS).toContain("'SIGBO-Respaldo-Diario'");
    expect(SCRIPT_CONSULTA_TAREAS).toContain("'SIGBO-Arranque-Automatico'");
    expect(scriptIniciarTarea('SIGBO-Respaldo-Diario')).toBe("Start-ScheduledTask -TaskName 'SIGBO-Respaldo-Diario'");
  });

  it('lee la salida de PowerShell 5.1 (fechas /Date()/ y un solo objeto)', () => {
    const json = '[{"nombre":"SIGBO-Respaldo-Diario","existe":true,"estado":"Ready","ultimaEjecucion":"\\/Date(1791448174000)\\/","ultimoResultado":0,"proximaEjecucion":"\\/Date(1791525600000)\\/"},'
      + '{"nombre":"SIGBO-Arranque-Automatico","existe":false}]';
    const t = parsearTareas(json);
    expect(t[0]).toMatchObject({ existe: true, estado: 'LISTA', ultimoResultado: 0, descripcionResultado: 'Correcto' });
    expect(t[0].ultimaEjecucion).toBe(new Date(1791448174000).toISOString());
    expect(t[1]).toMatchObject({ existe: false, estado: null, ultimaEjecucion: null });
    const una = parsearTareas('{"nombre":"SIGBO-Respaldo-Diario","existe":true,"estado":"Running","ultimaEjecucion":"\\/Date(943920000000)\\/","ultimoResultado":267009}');
    expect(una[0]).toMatchObject({ estado: 'EN_EJECUCION', ultimaEjecucion: null, descripcionResultado: 'En ejecución' });
  });

  it('describe los códigos de resultado', () => {
    expect(describirResultado(267011)).toBe('Nunca se ejecutó');
    expect(describirResultado(1)).toBe('Código 1 (0x1)');
    expect(describirResultado(null)).toBeNull();
  });
});
```

- [ ] **Step 2: Correrlas**

Run: `cd backend; npx jest src/modules/sistema/sistema.logica.spec.ts`
Expected: FAIL (módulos inexistentes).

- [ ] **Step 3: `respaldos.logica.ts`**

```ts
/**
 * Lectura de los respaldos que deja la tarea SIGBO-Respaldo-Diario
 * (workflows/scripts/respaldo-docker.ps1): archivos sigbo_cbvc-AAAAMMDD-HHMMSS.bak con su
 * .sha256, y respaldos/registro.log con una corrida por bloque "[1/5] … RESULTADO: OK|FALLO".
 * El registro no fecha sus entradas: la fecha sale del nombre del archivo.
 */

export const NOMBRE_RESPALDO = /^sigbo_cbvc-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})\.bak$/;

export interface RespaldoArchivo { nombre: string; fecha: string; tamanioBytes: number; tieneSha256: boolean }

export interface CorridaRespaldo {
  archivo: string | null;
  tamanio: string | null;
  sha256: string | null;
  resultado: 'OK' | 'FALLO' | 'INCOMPLETA';
  pruebaRestauracion: 'OMITIDA' | 'OK' | 'FALLO' | 'DESCONOCIDA';
  detalleRestauracion: string | null;
  avisos: string[];
}

export interface AlertaSistema { nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }

/** Solo un nombre de respaldo exacto: nunca una ruta (lo elige el cliente). */
export function validarNombreRespaldo(nombre: unknown): boolean {
  return typeof nombre === 'string' && NOMBRE_RESPALDO.test(nombre);
}

export function fechaDeRespaldo(nombre: string): string | null {
  const m = nombre.match(NOMBRE_RESPALDO);
  if (!m) return null;
  const [a, me, d, h, mi, s] = m.slice(1);
  return `${a}-${me}-${d}T${h}:${mi}:${s}`;
}

const nueva = (): CorridaRespaldo => ({
  archivo: null, tamanio: null, sha256: null, resultado: 'INCOMPLETA', pruebaRestauracion: 'DESCONOCIDA', detalleRestauracion: null, avisos: [],
});

export function parsearRegistro(texto: string): CorridaRespaldo[] {
  const corridas: CorridaRespaldo[] = [];
  let actual: CorridaRespaldo | null = null;
  for (const cruda of texto.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const linea = cruda.trim();
    if (!linea || /^===\s/.test(linea)) continue;
    if (/^\[1\/5\]/.test(linea)) {
      if (actual) corridas.push(actual);
      actual = nueva();
      continue;
    }
    if (!actual) actual = nueva();
    let m: RegExpMatchArray | null;
    if ((m = linea.match(/^\[4\/5\]\s*(.*)$/))) {
      if (/omitid/i.test(m[1])) actual.pruebaRestauracion = 'OMITIDA';
    } else if ((m = linea.match(/^Restauraci[oó]n correcta:?\s*(.*)$/i))) {
      actual.pruebaRestauracion = 'OK';
      actual.detalleRestauracion = m[1] || null;
    } else if (/restauraci[oó]n/i.test(linea) && /(fall|error)/i.test(linea)) {
      actual.pruebaRestauracion = 'FALLO';
      actual.detalleRestauracion = linea;
    } else if ((m = linea.match(/^Respaldo listo:\s*(.+?)\s*\(([^)]+)\)\s*$/))) {
      actual.archivo = m[1].split(/[\\/]/).pop() ?? m[1];
      actual.tamanio = m[2];
    } else if ((m = linea.match(/^SHA-256:\s*([0-9a-fA-F]{64})/))) {
      actual.sha256 = m[1].toLowerCase();
    } else if ((m = linea.match(/^RESULTADO:\s*(OK|FALLO)/))) {
      actual.resultado = m[1] as 'OK' | 'FALLO';
      corridas.push(actual);
      actual = null;
    } else if (/^(AVISO|ATENCI[OÓ]N)\b/i.test(linea)) {
      actual.avisos.push(linea);
    }
  }
  if (actual) corridas.push(actual);
  return corridas;
}

const legible = (fechaLocal: string) => {
  const [f, h] = fechaLocal.split('T');
  const [a, m, d] = f.split('-');
  return `${d}/${m}/${a} ${h.slice(0, 5)}`;
};

export function alertasRespaldo(archivos: RespaldoArchivo[], corridas: CorridaRespaldo[], ahora: Date): AlertaSistema[] {
  const alertas: AlertaSistema[] = [];
  const ultimo = [...archivos].sort((a, b) => b.fecha.localeCompare(a.fecha))[0];
  if (!ultimo) {
    alertas.push({ nivel: 'critica', mensaje: 'No hay ningún respaldo en la carpeta de respaldos.' });
  } else if (ahora.getTime() - new Date(ultimo.fecha).getTime() > 24 * 3_600_000) {
    alertas.push({ nivel: 'critica', mensaje: `El último respaldo es del ${legible(ultimo.fecha)}: pasaron más de 24 horas.` });
  }
  const ultima = corridas[corridas.length - 1];
  if (ultima?.resultado === 'FALLO') alertas.push({ nivel: 'critica', mensaje: 'La última corrida del respaldo terminó con FALLO. Revisar el registro.' });
  if (ultima?.resultado === 'INCOMPLETA') alertas.push({ nivel: 'advertencia', mensaje: 'La última corrida del respaldo no terminó (no hay RESULTADO en el registro).' });
  if (!corridas.some((c) => c.pruebaRestauracion === 'OK')) {
    alertas.push({ nivel: 'advertencia', mensaje: 'Nunca se probó restaurar un respaldo. La tarea lo hace los domingos (-ProbarRestauracion).' });
  }
  const sinHash = archivos.filter((a) => !a.tieneSha256);
  if (sinHash.length) alertas.push({ nivel: 'advertencia', mensaje: `${sinHash.length} respaldo(s) sin su archivo .sha256: no se puede verificar su integridad.` });
  return alertas;
}
```

- [ ] **Step 4: `registros.logica.ts`**

```ts
/** Lectura segura de los registros del servidor: lista cerrada de archivos y secretos ocultos. */

export const ARCHIVOS_REGISTRO = {
  'backend-out': 'backend-out.log',
  'backend-err': 'backend-err.log',
  'arranque-automatico': 'arranque-automatico.log',
} as const;

export type ClaveRegistro = keyof typeof ARCHIVOS_REGISTRO;

export function esClaveRegistro(x: string): x is ClaveRegistro {
  return Object.prototype.hasOwnProperty.call(ARCHIVOS_REGISTRO, x);
}

const CLAVES_SECRETAS = 'password|passwd|contrase(?:ñ|n)a|secret|secreto|token|api[_-]?key|authorization|cookie|sa_password|sqlcmdpassword|[a-z_]*_password';
const CLAVE_VALOR = new RegExp(`(\\b(?:${CLAVES_SECRETAS})\\b["']?\\s*[=:]\\s*)("[^"]*"|'[^']*'|[^\\s,;&]+)`, 'gi');
/** Van ANTES que clave=valor: si no, "Authorization: Bearer x" ocultaria la palabra Bearer y dejaria x. */
const PATRONES: Array<[RegExp, string]> = [
  [/\bBearer\s+[A-Za-z0-9\-._~+/]+=*/g, 'Bearer [oculto]'],
  [/(sigbo_(?:access|refresh)=)[^;\s]+/gi, '$1[oculto]'],
  [/\beyJ[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}\.[A-Za-z0-9_-]{8,}/g, '[jwt oculto]'],
];

export function ocultarSecretos(linea: string): string {
  const sinTokens = PATRONES.reduce((t, [re, reemplazo]) => t.replace(re, reemplazo), linea);
  return sinTokens.replace(CLAVE_VALOR, (_m: string, clave: string, valor: string) => {
    const comilla = valor.startsWith('"') ? '"' : valor.startsWith("'") ? "'" : '';
    return `${clave}${comilla}[oculto]${comilla}`;
  });
}

const ANSI = /\u001b\[[0-9;]*m/g;

export function ultimasLineas(texto: string, max: number): string[] {
  const lineas = texto.replace(/^\uFEFF/, '').replace(ANSI, '').split(/\r?\n/);
  if (lineas.length && lineas[lineas.length - 1] === '') lineas.pop();
  return lineas.slice(-max);
}

export type NivelLinea = 'ERROR' | 'WARN' | 'LOG' | 'OTRO';

export function nivelDeLinea(linea: string): NivelLinea {
  if (/\bERROR\b|\bError:|\bFALLO\b|Exception\b/.test(linea)) return 'ERROR';
  if (/\bWARN\b|\bAVISO\b|\bATENCI[OÓ]N\b/.test(linea)) return 'WARN';
  if (/\b(LOG|DEBUG|VERBOSE)\b/.test(linea)) return 'LOG';
  return 'OTRO';
}
```

(El reemplazo conserva las comillas: `"password":"abc"` → `"password":"[oculto]"`.)

- [ ] **Step 5: `migraciones.logica.ts`**

```ts
/** Estado de las migraciones: dbo.__sigbo_migrations contra database/migrations.sha256. */

export function parsearManifiesto(texto: string): Array<{ nombre: string; hash: string }> {
  const salida: Array<{ nombre: string; hash: string }> = [];
  for (const linea of texto.replace(/^\uFEFF/, '').split(/\r?\n/)) {
    const t = linea.trim();
    if (!t || t.startsWith('#')) continue;
    const m = t.match(/^([A-Fa-f0-9]{64})\s{2,}(.+\.sql)$/);
    if (m) salida.push({ nombre: m[2], hash: m[1].toUpperCase() });
  }
  return salida;
}

export interface EstadoMigraciones {
  total: number;
  aplicadas: number;
  pendientes: string[];
  alteradas: string[];
  desconocidas: string[];
  ultimaAplicada: { nombre: string; aplicadaEn: string } | null;
}

const CREACION = '000_create_database.sql';

export function compararMigraciones(manifiesto: Array<{ nombre: string; hash: string }>, aplicadas: Array<{ nombre: string; hash: string; aplicadaEn: Date | string }>): EstadoMigraciones {
  const esperadas = manifiesto.filter((m) => m.nombre !== CREACION);
  const porNombre = new Map(aplicadas.map((a) => [a.nombre, a]));
  const pendientes = esperadas.filter((m) => !porNombre.has(m.nombre)).map((m) => m.nombre);
  const alteradas = esperadas
    .filter((m) => porNombre.has(m.nombre) && porNombre.get(m.nombre)!.hash.trim().toUpperCase() !== m.hash)
    .map((m) => m.nombre);
  const nombres = new Set(esperadas.map((m) => m.nombre));
  const desconocidas = aplicadas.filter((a) => a.nombre !== CREACION && !nombres.has(a.nombre)).map((a) => a.nombre);
  const enManifiesto = aplicadas.filter((a) => nombres.has(a.nombre)).sort((a, b) => a.nombre.localeCompare(b.nombre));
  const ultima = enManifiesto[enManifiesto.length - 1];
  return {
    total: esperadas.length,
    aplicadas: esperadas.length - pendientes.length,
    pendientes,
    alteradas,
    desconocidas,
    ultimaAplicada: ultima ? { nombre: ultima.nombre, aplicadaEn: new Date(ultima.aplicadaEn).toISOString() } : null,
  };
}
```

- [ ] **Step 6: `red.logica.ts`** (misma regla que `scripts/conectar-celulares.mjs`)

```ts
import type { NetworkInterfaceInfo } from 'os';

/** Adaptadores que no son la red del cuartel (Docker, WSL, VPN...). */
const VIRTUALES = /vethernet|wsl|vmware|virtualbox|hyper-v|docker|loopback|tailscale|zerotier|vpn|bluetooth/i;
const esPrivada = (ip: string) => /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(ip);
const PRIORIDAD = /wi-?fi|wlan|ethernet|eth|en\d/i;

export interface DireccionRed { nombre: string; ip: string; virtual: boolean }

/** Direcciones IPv4 privadas, reales primero (Wi-Fi/Ethernet); las virtuales solo si no hay otras. */
export function direccionesDeRed(interfaces: NodeJS.Dict<NetworkInterfaceInfo[]>): DireccionRed[] {
  const todas: DireccionRed[] = [];
  for (const [nombre, lista] of Object.entries(interfaces)) {
    for (const i of lista ?? []) {
      const ipv4 = i.family === 'IPv4' || (i.family as unknown) === 4;
      if (ipv4 && !i.internal && esPrivada(i.address)) todas.push({ nombre, ip: i.address, virtual: VIRTUALES.test(nombre) });
    }
  }
  const reales = todas.filter((d) => !d.virtual);
  return (reales.length ? reales : todas).sort((a, b) => Number(PRIORIDAD.test(b.nombre)) - Number(PRIORIDAD.test(a.nombre)));
}

/** El mismo formato que lee la app (lib/conexion.dart: contenidoQrServidor). */
export const contenidoQrConexion = (urlApi: string) => `sigbo://servidor?url=${encodeURIComponent(urlApi)}`;
```

- [ ] **Step 7: `tareas.logica.ts`**

```ts
/**
 * Tareas programadas de Windows que mantienen SIGBO. Se consultan con un script FIJO de
 * PowerShell (sin ningun dato del cliente) y se ejecutan solo por nombre de una lista cerrada.
 */

export const TAREAS_WINDOWS = ['SIGBO-Respaldo-Diario', 'SIGBO-Arranque-Automatico'] as const;
export type NombreTarea = (typeof TAREAS_WINDOWS)[number];

export const SCRIPT_CONSULTA_TAREAS = [
  "$ErrorActionPreference = 'Stop'",
  '$salida = @()',
  `foreach ($n in @(${TAREAS_WINDOWS.map((t) => `'${t}'`).join(', ')})) {`,
  '  $t = Get-ScheduledTask -TaskName $n -ErrorAction SilentlyContinue',
  '  if ($t) {',
  '    $i = $t | Get-ScheduledTaskInfo',
  '    $salida += [pscustomobject]@{ nombre = $n; existe = $true; estado = [string]$t.State; ultimaEjecucion = $i.LastRunTime; ultimoResultado = $i.LastTaskResult; proximaEjecucion = $i.NextRunTime }',
  '  } else {',
  '    $salida += [pscustomobject]@{ nombre = $n; existe = $false }',
  '  }',
  '}',
  'ConvertTo-Json -InputObject $salida -Compress -Depth 3',
].join('\n');

export function scriptIniciarTarea(nombre: NombreTarea): string {
  return `Start-ScheduledTask -TaskName '${nombre}'`;
}

export interface TareaProgramada {
  nombre: string;
  existe: boolean;
  estado: 'LISTA' | 'EN_EJECUCION' | 'DESHABILITADA' | 'DESCONOCIDO' | null;
  ultimaEjecucion: string | null;
  ultimoResultado: number | null;
  descripcionResultado: string | null;
  proximaEjecucion: string | null;
}

const ESTADOS: Record<string, TareaProgramada['estado']> = { Ready: 'LISTA', Running: 'EN_EJECUCION', Queued: 'EN_EJECUCION', Disabled: 'DESHABILITADA' };

/** PowerShell 5.1 serializa las fechas como "/Date(ms)/"; antes de 2000 significa "nunca". */
function fechaPs(v: unknown): string | null {
  if (typeof v !== 'string') return null;
  const m = v.match(/\/Date\((-?\d+)\)\//);
  const d = m ? new Date(Number(m[1])) : new Date(v);
  if (Number.isNaN(d.getTime()) || d.getFullYear() < 2000) return null;
  return d.toISOString();
}

export function describirResultado(codigo: number | null): string | null {
  if (codigo === null) return null;
  if (codigo === 0) return 'Correcto';
  if (codigo === 267009) return 'En ejecución';
  if (codigo === 267011) return 'Nunca se ejecutó';
  if (codigo === 267014) return 'Detenida por el usuario';
  return `Código ${codigo} (0x${(codigo >>> 0).toString(16).toUpperCase()})`;
}

export function parsearTareas(json: string): TareaProgramada[] {
  const datos: unknown = JSON.parse(json.trim() || '[]');
  const lista = (Array.isArray(datos) ? datos : [datos]) as Array<Record<string, unknown>>;
  return lista.map((t) => {
    const existe = t.existe === true;
    const resultado = typeof t.ultimoResultado === 'number' ? t.ultimoResultado : null;
    return {
      nombre: String(t.nombre),
      existe,
      estado: existe ? ESTADOS[String(t.estado)] ?? 'DESCONOCIDO' : null,
      ultimaEjecucion: existe ? fechaPs(t.ultimaEjecucion) : null,
      ultimoResultado: existe ? resultado : null,
      descripcionResultado: existe ? describirResultado(resultado) : null,
      proximaEjecucion: existe ? fechaPs(t.proximaEjecucion) : null,
    };
  });
}
```

- [ ] **Step 8: Correr las pruebas**

Run: `cd backend; npx jest src/modules/sistema/sistema.logica.spec.ts`
Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git add backend/src/modules/sistema
git commit -m "Sistema: lógica pura de respaldos, registros, migraciones, red y tareas de Windows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 10: Área Sistema — servicios, controlador y estado de los trabajos internos

**Files:**
- Create: `backend/src/modules/sistema/entorno.ts` (carpetas configurables, PowerShell, lectura de colas de archivo)
- Create: `backend/src/modules/sistema/respaldos.service.ts`
- Create: `backend/src/modules/sistema/sistema.service.ts`
- Create: `backend/src/modules/sistema/sistema.controller.ts`
- Create: `backend/src/modules/sistema/sistema.module.ts`
- Modify: `backend/src/modules/gre/gre-trabajador.service.ts` (estado + `iniciarProcesamiento`)
- Modify: `backend/src/modules/gre/gre.module.ts` (exportar `GreTrabajadorService`)
- Modify: `backend/src/modules/gre/gre-admin.controller.ts` (`POST importaciones/procesar`)
- Modify: `backend/src/modules/control-personal/avisos-vencimiento.service.ts` (estado + `ejecutarAhora`)
- Modify: `backend/src/modules/control-personal/control-personal.module.ts` (exportar `AvisosVencimientoService`, `VencimientosService`)
- Modify: `backend/src/modules/despacho/despacho-tiempo-real.service.ts` (`totalConexiones`, `personasConectadas`)
- Modify: `backend/src/modules/alertas/alertas.service.ts` (`flujo()`, `suscriptoresActivos()`) y `alertas.controller.ts:35` (usar `flujo()`)
- Modify: `backend/src/modules/ia/ia.module.ts` (exportar `IaConfiguracionService`, `OllamaService`, `WhisperService`, `PiperService`)
- Modify: `backend/src/modules/app-movil/app-movil.service.ts` (`huellaCertificado()`), `app-movil.module.ts` (exportar `AppMovilService`)
- Modify: `backend/src/app.module.ts` (importar `SistemaModule`)
- Modify: `backend/.env.example` (`SIGBO_RESPALDOS_DIR`, `SIGBO_LOGS_DIR`, `SIGBO_DATABASE_DIR` comentadas)
- Test: `backend/src/modules/sistema/sistema.service.spec.ts`

**Interfaces:**
- Consumes: Task 9 (lógica pura), Task 6 (`MatrizWebService.estado()`), Task 1 (permisos `sistema:*`).
- Produces:
  - `EJECUTOR_POWERSHELL` (token) y `type EjecutorPowerShell = (script: string, timeoutMs?: number) => Promise<string>`; `directoriosSistema(): { respaldos: string; logs: string; database: string }`; `leerCola(ruta: string, bytes: number): Promise<string>`; `class NoDisponible extends Error`.
  - `RespaldosService`: `tareas(sinCache?: boolean): Promise<TareaProgramada[]>`, `respaldos()`, `respaldarAhora(ctx)`, `verificarRespaldo(nombre, ctx)`, `migraciones()`.
  - `SistemaService`: `estado()`, `resumen(): Promise<{ generadoEn: Date; nivel: 'normal' | 'atencion' | 'critico'; alertas: AlertaSistema[] }>`, `tareasYTrabajos()`, `ejecutarAvisos(ctx)`, `registros(clave: string, lineas?: number, ctx?)`, `appMovil()`, `conexionMovil()`.
  - `interface ContextoSistema { usuarioId: string; ip: string | null; userAgent: string | null }`.
  - `GreTrabajadorService.estado()`, `GreTrabajadorService.iniciarProcesamiento(): { iniciado: true }`; `AvisosVencimientoService.estado()`, `AvisosVencimientoService.ejecutarAhora()`; `DespachoTiempoReal.totalConexiones()`, `.personasConectadas()`; `AlertasService.flujo()`, `.suscriptoresActivos()`; `AppMovilService.huellaCertificado(): string | null`.
  - Endpoints de la tabla §6.2 de la spec (prefijo `/sistema`) y `POST /matpel/administracion/importaciones/procesar`.

- [ ] **Step 1: Pruebas que fallan**

`backend/src/modules/sistema/sistema.service.spec.ts`:

```ts
import { BadRequestException, ConflictException } from '@nestjs/common';
import { createHash } from 'crypto';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';
import { RespaldosService } from './respaldos.service';
import { SistemaService } from './sistema.service';

const ctx = { usuarioId: 'u1', ip: '127.0.0.1', userAgent: 'jest' };
const auditoria = { registrar: jest.fn().mockResolvedValue(undefined) };

function carpetaTemporal() {
  return mkdtempSync(join(tmpdir(), 'sigbo-sistema-'));
}

function tareasJson(estado: string) {
  return JSON.stringify([
    { nombre: 'SIGBO-Respaldo-Diario', existe: true, estado, ultimaEjecucion: '/Date(1791448174000)/', ultimoResultado: 0, proximaEjecucion: '/Date(1791525600000)/' },
    { nombre: 'SIGBO-Arranque-Automatico', existe: false },
  ]);
}

describe('RespaldosService', () => {
  let respaldos: string;
  beforeEach(() => {
    respaldos = carpetaTemporal();
    process.env.SIGBO_RESPALDOS_DIR = respaldos;
    auditoria.registrar.mockClear();
  });
  afterAll(() => { delete process.env.SIGBO_RESPALDOS_DIR; delete process.env.SIGBO_DATABASE_DIR; });

  it('"Respaldar ahora" dos veces seguidas: la segunda responde 409 y no lanza otra corrida', async () => {
    const ejecutor = jest.fn(async (script: string) => (script.startsWith('Start-ScheduledTask') ? '' : tareasJson('Ready')));
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, ejecutor);
    await expect(s.respaldarAhora(ctx)).resolves.toMatchObject({ lanzado: true });
    await expect(s.respaldarAhora(ctx)).rejects.toBeInstanceOf(ConflictException);
    expect(ejecutor.mock.calls.filter(([sc]) => sc.startsWith('Start-ScheduledTask'))).toHaveLength(1);
    expect(auditoria.registrar).toHaveBeenCalledTimes(1);
  });

  it('no lanza si la tarea ya está en ejecución o no existe', async () => {
    const corriendo = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => tareasJson('Running')));
    await expect(corriendo.respaldarAhora(ctx)).rejects.toThrow(/en curso/);
    const sinTarea = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => '[{"nombre":"SIGBO-Respaldo-Diario","existe":false}]'));
    await expect(sinTarea.respaldarAhora(ctx)).rejects.toThrow(/programar-respaldo/);
  });

  it('verificar: un nombre malicioso se rechaza sin tocar el disco', async () => {
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn());
    for (const malo of ['..\\..\\backend\\.env', 'sigbo_cbvc-20261009-082934.bak/../x', '../sigbo_cbvc-20261009-082934.bak']) {
      await expect(s.verificarRespaldo(malo, ctx)).rejects.toBeInstanceOf(BadRequestException);
    }
    expect(auditoria.registrar).not.toHaveBeenCalled();
  });

  it('verificar: recalcula el SHA-256 y lo compara con su .sha256', async () => {
    const nombre = 'sigbo_cbvc-20261009-082934.bak';
    writeFileSync(join(respaldos, nombre), 'contenido del respaldo');
    const hash = createHash('sha256').update('contenido del respaldo').digest('hex');
    writeFileSync(join(respaldos, `${nombre}.sha256`), `${hash}  ${nombre}\n`);
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn());
    await expect(s.verificarRespaldo(nombre, ctx)).resolves.toMatchObject({ coincide: true, sha256: hash });
    writeFileSync(join(respaldos, `${nombre}.sha256`), `${'0'.repeat(64)}  ${nombre}\n`);
    await expect(s.verificarRespaldo(nombre, ctx)).resolves.toMatchObject({ coincide: false });
  });

  it('lista respaldos con su fecha, el registro y las alertas', async () => {
    writeFileSync(join(respaldos, 'sigbo_cbvc-20261008-081341.bak'), 'x');
    writeFileSync(join(respaldos, 'otro-archivo.txt'), 'x');
    writeFileSync(join(respaldos, 'registro.log'), '[1/5] Respaldando sigbo_cbvc ...\r\nRESULTADO: OK\r\n');
    const s = new RespaldosService({ query: jest.fn() } as never, auditoria as never, jest.fn(async () => tareasJson('Ready')));
    const r = await s.respaldos();
    expect(r.archivos.map((a) => a.nombre)).toEqual(['sigbo_cbvc-20261008-081341.bak']);
    expect(r.archivos[0]).toMatchObject({ fecha: '2026-10-08T08:13:41', tieneSha256: false });
    expect(r.corridas).toHaveLength(1);
    expect(r.alertas.some((a) => a.mensaje.includes('.sha256'))).toBe(true);
  });

  it('migraciones: manifiesto contra la tabla de historial', async () => {
    const db = carpetaTemporal();
    process.env.SIGBO_DATABASE_DIR = db;
    writeFileSync(join(db, 'migrations.sha256'), `${'A'.repeat(64)}  093_x.sql\n${'B'.repeat(64)}  094_y.sql\n`);
    const query = jest.fn().mockResolvedValue([{ nombre: '093_x.sql', hash: 'a'.repeat(64), aplicadaEn: new Date('2026-10-07T10:00:00Z') }]);
    const s = new RespaldosService({ query } as never, auditoria as never, jest.fn());
    await expect(s.migraciones()).resolves.toMatchObject({ disponible: true, aplicadas: 1, pendientes: ['094_y.sql'], alteradas: [] });
  });
});

describe('SistemaService', () => {
  const nuevo = (o: Partial<Record<string, unknown>> = {}) => new SistemaService(
    { query: jest.fn().mockResolvedValue([{ ok: 1 }]) } as never,
    { estado: () => ({ activa: true, sincronizada: true, error: null, pantallas: 1, secciones: 10, rutasBackend: 1, llamadasSinResolver: 0 }) } as never,
    auditoria as never,
    (o.respaldos ?? { respaldos: jest.fn().mockResolvedValue({ alertas: [] }), migraciones: jest.fn().mockResolvedValue({ disponible: true, alteradas: [], pendientes: [] }), tareas: jest.fn().mockResolvedValue([]) }) as never,
    { estado: () => ({ activo: false, ocupado: false }) } as never,
    (o.avisos ?? { estado: () => ({ programado: true, ocupado: false }), ejecutarAhora: jest.fn().mockResolvedValue({ enviados: 0, motivo: 'Telegram no configurado' }) }) as never,
    { totalConexiones: () => 2, personasConectadas: () => 1 } as never,
    { suscriptoresActivos: () => 3 } as never,
    { obtener: jest.fn().mockResolvedValue({ estado: 'ACTIVA' }) } as never,
    { estado: jest.fn().mockResolvedValue({ conectado: false, url: 'http://localhost:11434', modelosInstalados: [], modeloConfigurado: 'x', modeloDisponible: false, error: 'sin conexión' }) } as never,
    { estado: jest.fn().mockResolvedValue({ conectado: false, url: '', error: null }) } as never,
    { estado: jest.fn().mockReturnValue({ disponible: false, rutaBinario: null, rutaVoz: null, error: 'sin configurar' }) } as never,
    { obtenerVersion: () => ({ disponible: false }), huellaCertificado: () => null } as never,
    { habilitado: () => false } as never,
  );

  it('ejecutar avisos ya en curso responde 409', async () => {
    const avisos = { estado: () => ({}), ejecutarAhora: jest.fn().mockRejectedValue(new ConflictException('ya está corriendo')) };
    await expect(nuevo({ avisos }).ejecutarAvisos(ctx)).rejects.toBeInstanceOf(ConflictException);
  });

  it('registros: solo la lista cerrada, con secretos ocultos', async () => {
    const logs = carpetaTemporal();
    process.env.SIGBO_LOGS_DIR = logs;
    writeFileSync(join(logs, 'backend-err.log'), 'linea 1\nDB_PASSWORD=Secreta123 al conectar\n[Nest] 1 - ERROR [X] fallo\n');
    const s = nuevo();
    await expect(s.registros('..\\..\\backend\\.env', 50, ctx)).rejects.toBeInstanceOf(BadRequestException);
    const r = await s.registros('backend-err', 50, ctx);
    expect(r.lineas.map((l) => l.texto)).toEqual(['linea 1', 'DB_PASSWORD=[oculto] al conectar', '[Nest] 1 - ERROR [X] fallo']);
    expect(r.lineas[2].nivel).toBe('ERROR');
    delete process.env.SIGBO_LOGS_DIR;
  });

  it('el resumen es "atención" si Ollama no responde', async () => {
    await expect(nuevo().resumen()).resolves.toMatchObject({ nivel: 'atencion' });
  });

  it('el resumen es "crítico" si la base no responde', async () => {
    const s = nuevo();
    (s as unknown as { dataSource: { query: jest.Mock } }).dataSource.query = jest.fn().mockRejectedValue(new Error('ECONNREFUSED'));
    await expect(s.resumen()).resolves.toMatchObject({ nivel: 'critico' });
  });

  it('el estado informa las conexiones en tiempo real y la matriz', async () => {
    const e = await nuevo().estado();
    expect(e.tiempoReal).toEqual({ despacho: { conexiones: 2, personas: 1 }, alertas: { suscriptores: 3 } });
    expect(e.matriz.sincronizada).toBe(true);
    expect(e.baseDeDatos.disponible).toBe(true);
  });
});
```

- [ ] **Step 2: Correrlas**

Run: `cd backend; npx jest src/modules/sistema/sistema.service.spec.ts`
Expected: FAIL (servicios inexistentes).

- [ ] **Step 3: `entorno.ts`**

```ts
import { execFile } from 'child_process';
import { open, stat } from 'fs/promises';
import { join, resolve } from 'path';

/** Algo que este servidor no puede informar (no es Windows, falta una carpeta...): se muestra el motivo. */
export class NoDisponible extends Error {}

export type EjecutorPowerShell = (script: string, timeoutMs?: number) => Promise<string>;
export const EJECUTOR_POWERSHELL = Symbol('EJECUTOR_POWERSHELL');

/** Carpetas del repositorio que el area Sistema lee. El backend corre con cwd = backend/. */
export function directoriosSistema() {
  const raiz = resolve(process.cwd(), '..');
  return {
    respaldos: process.env.SIGBO_RESPALDOS_DIR || join(raiz, 'respaldos'),
    logs: process.env.SIGBO_LOGS_DIR || join(raiz, 'logs'),
    database: process.env.SIGBO_DATABASE_DIR || join(raiz, 'database'),
  };
}

/**
 * Corre un script FIJO de PowerShell (nunca texto del cliente): execFile sin shell,
 * ventana oculta, con tiempo maximo y salida acotada.
 */
export const ejecutarPowerShell: EjecutorPowerShell = (script, timeoutMs = 20_000) => {
  if (process.platform !== 'win32') return Promise.reject(new NoDisponible('Las tareas programadas de Windows solo existen en un servidor Windows.'));
  return new Promise((resolver, rechazar) => {
    execFile(
      'powershell.exe',
      ['-NoProfile', '-NonInteractive', '-ExecutionPolicy', 'Bypass', '-Command', script],
      { timeout: timeoutMs, windowsHide: true, maxBuffer: 1024 * 1024 },
      (error, stdout, stderr) => {
        if (error) return rechazar(new Error(String(stderr || error.message).trim().slice(0, 500)));
        resolver(String(stdout));
      },
    );
  });
};

/** Ultimos `bytes` de un archivo, decodificados como UTF-8 (o Latin-1 si no lo son). */
export async function leerCola(ruta: string, bytes: number): Promise<string> {
  const info = await stat(ruta);
  const desde = Math.max(0, info.size - bytes);
  const largo = info.size - desde;
  const archivo = await open(ruta, 'r');
  try {
    const buffer = Buffer.alloc(largo);
    await archivo.read(buffer, 0, largo, desde);
    const utf8 = buffer.toString('utf8');
    const texto = utf8.includes('�') ? buffer.toString('latin1') : utf8;
    // Si se corto en el medio de una linea, se descarta ese pedazo.
    return desde > 0 ? texto.slice(texto.indexOf('\n') + 1) : texto;
  } finally {
    await archivo.close();
  }
}
```

- [ ] **Step 4: `respaldos.service.ts`**

```ts
import { BadRequestException, ConflictException, Inject, Injectable, NotFoundException, Optional } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { createHash } from 'crypto';
import { createReadStream, existsSync } from 'fs';
import { readdir, readFile, stat } from 'fs/promises';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { directoriosSistema, EJECUTOR_POWERSHELL, EjecutorPowerShell, ejecutarPowerShell } from './entorno';
import { compararMigraciones, EstadoMigraciones, parsearManifiesto } from './migraciones.logica';
import { alertasRespaldo, fechaDeRespaldo, NOMBRE_RESPALDO, parsearRegistro, RespaldoArchivo, validarNombreRespaldo } from './respaldos.logica';
import { parsearTareas, SCRIPT_CONSULTA_TAREAS, scriptIniciarTarea, TareaProgramada } from './tareas.logica';

export interface ContextoSistema { usuarioId: string; ip: string | null; userAgent: string | null }

const VIGENCIA_TAREAS_MS = 15_000;
/** Despues de lanzar un respaldo, Windows tarda unos segundos en marcarlo "en ejecucion". */
const VENTANA_LANZAMIENTO_MS = 60_000;
const TAREA_RESPALDO = 'SIGBO-Respaldo-Diario' as const;

function sha256DeArchivo(ruta: string): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const hash = createHash('sha256');
    createReadStream(ruta).on('data', (d) => hash.update(d)).on('end', () => resolver(hash.digest('hex'))).on('error', rechazar);
  });
}

/** Respaldos (tarea programada existente) y migraciones: lectura y las dos operaciones seguras. */
@Injectable()
export class RespaldosService {
  private cacheTareas: { en: number; tareas: TareaProgramada[] } | null = null;
  private respaldoLanzadoEn = 0;
  private readonly ejecutor: EjecutorPowerShell;

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    @Optional() @Inject(EJECUTOR_POWERSHELL) ejecutor?: EjecutorPowerShell,
  ) {
    this.ejecutor = ejecutor ?? ejecutarPowerShell;
  }

  async tareas(sinCache = false): Promise<TareaProgramada[]> {
    if (!sinCache && this.cacheTareas && Date.now() - this.cacheTareas.en < VIGENCIA_TAREAS_MS) return this.cacheTareas.tareas;
    const tareas = parsearTareas(await this.ejecutor(SCRIPT_CONSULTA_TAREAS));
    this.cacheTareas = { en: Date.now(), tareas };
    return tareas;
  }

  async respaldos() {
    const { respaldos: carpeta } = directoriosSistema();
    if (!existsSync(carpeta)) {
      return { disponible: false, motivo: `No existe la carpeta de respaldos (${carpeta}).`, carpeta, archivos: [] as RespaldoArchivo[], corridas: [], alertas: alertasRespaldo([], [], new Date()), tarea: null };
    }
    const nombres = await readdir(carpeta);
    const archivos: RespaldoArchivo[] = [];
    for (const nombre of nombres.filter((n) => NOMBRE_RESPALDO.test(n))) {
      const info = await stat(join(carpeta, nombre));
      archivos.push({ nombre, fecha: fechaDeRespaldo(nombre) as string, tamanioBytes: info.size, tieneSha256: nombres.includes(`${nombre}.sha256`) });
    }
    archivos.sort((a, b) => b.fecha.localeCompare(a.fecha));
    const registro = await readFile(join(carpeta, 'registro.log'), 'utf8').catch(() => '');
    const corridas = parsearRegistro(registro);
    let tarea: TareaProgramada | { disponible: false; motivo: string } | null = null;
    try {
      tarea = (await this.tareas()).find((t) => t.nombre === TAREA_RESPALDO) ?? null;
    } catch (e) {
      tarea = { disponible: false, motivo: e instanceof Error ? e.message : 'No se pudo consultar la tarea.' };
    }
    return {
      disponible: true,
      motivo: null,
      carpeta,
      archivos,
      corridas: corridas.slice(-10).reverse(),
      alertas: alertasRespaldo(archivos, corridas, new Date()),
      tarea,
    };
  }

  async respaldarAhora(ctx: ContextoSistema) {
    const tarea = (await this.tareas(true)).find((t) => t.nombre === TAREA_RESPALDO);
    if (!tarea?.existe) {
      throw new ConflictException('La tarea SIGBO-Respaldo-Diario no está programada en este servidor. Se programa con workflows\\scripts\\programar-respaldo.ps1.');
    }
    if (tarea.estado === 'EN_EJECUCION' || Date.now() - this.respaldoLanzadoEn < VENTANA_LANZAMIENTO_MS) {
      throw new ConflictException('Ya hay un respaldo en curso. Esperá a que termine; esta pantalla se actualiza sola.');
    }
    if (tarea.estado === 'DESHABILITADA') throw new ConflictException('La tarea de respaldo está deshabilitada en Windows.');
    await this.ejecutor(scriptIniciarTarea(TAREA_RESPALDO));
    this.respaldoLanzadoEn = Date.now();
    this.cacheTareas = null;
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'RESPALDO_SOLICITADO', recurso: 'sistema.respaldos', ip: ctx.ip, userAgent: ctx.userAgent });
    return { lanzado: true, mensaje: 'Respaldo iniciado. Tarda uno o dos minutos; esta pantalla se actualiza sola.' };
  }

  async verificarRespaldo(nombre: string, ctx: ContextoSistema) {
    if (!validarNombreRespaldo(nombre)) throw new BadRequestException('Nombre de respaldo inválido.');
    const ruta = join(directoriosSistema().respaldos, nombre);
    if (!existsSync(ruta)) throw new NotFoundException('El respaldo no existe.');
    const esperado = await readFile(`${ruta}.sha256`, 'utf8').then((t) => t.trim().split(/\s+/)[0].toLowerCase()).catch(() => null);
    const sha256 = await sha256DeArchivo(ruta);
    const coincide = esperado ? esperado === sha256 : null;
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'RESPALDO_VERIFICADO', recurso: 'sistema.respaldos', recursoId: nombre, datosDespues: { coincide }, ip: ctx.ip, userAgent: ctx.userAgent });
    return { nombre, sha256, esperado, coincide };
  }

  async migraciones(): Promise<({ disponible: true } & EstadoMigraciones & { comando: string }) | { disponible: false; motivo: string }> {
    const manifiesto = join(directoriosSistema().database, 'migrations.sha256');
    let texto: string;
    try {
      texto = await readFile(manifiesto, 'utf8');
    } catch {
      return { disponible: false, motivo: `No se encontró el manifiesto de migraciones (${manifiesto}).` };
    }
    let aplicadas: Array<{ nombre: string; hash: string; aplicadaEn: Date }>;
    try {
      aplicadas = await this.dataSource.query('SELECT nombre, hash_sha256 AS hash, aplicada_en AS aplicadaEn FROM dbo.__sigbo_migrations');
    } catch (e) {
      return { disponible: false, motivo: `No se pudo leer dbo.__sigbo_migrations: ${e instanceof Error ? e.message : 'error'}` };
    }
    return { disponible: true, ...compararMigraciones(parsearManifiesto(texto), aplicadas), comando: 'database\\run-migrations.ps1' };
  }
}
```

- [ ] **Step 5: Estado de los trabajos internos (cambios chicos en servicios existentes)**

`gre-trabajador.service.ts` — reemplazar la clase por:

```ts
@Injectable()
export class GreTrabajadorService implements OnApplicationBootstrap, OnApplicationShutdown {
  private readonly log = new Logger('GreTrabajador');
  private reloj: NodeJS.Timeout | null = null;
  private intervaloMs: number | null = null;
  private ocupado = false;
  private ultima: { en: Date; procesados: number; error: string | null } | null = null;

  constructor(private readonly importacion: GreImportacionService) {}

  onApplicationBootstrap() {
    if (process.env.GRE_TRABAJADOR !== 'activo') return;
    const intervalo = Math.max(5_000, Number(process.env.GRE_TRABAJADOR_INTERVALO_MS) || 30_000);
    this.intervaloMs = intervalo;
    this.log.log(`Trabajador GRE activo cada ${intervalo} ms.`);
    this.reloj = setInterval(() => void this.ciclo(), intervalo);
  }

  onApplicationShutdown() {
    if (this.reloj) clearInterval(this.reloj);
  }

  private async ciclo() {
    if (this.ocupado) return;
    this.ocupado = true;
    try {
      const procesados = await this.importacion.procesarPendientes(1);
      this.ultima = { en: new Date(), procesados, error: null };
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : String(error);
      this.ultima = { en: new Date(), procesados: 0, error: mensaje };
      this.log.error(`Ciclo del trabajador GRE: ${mensaje}`);
    } finally {
      this.ocupado = false;
    }
  }

  /** Lo que muestra Sistema › Tareas. */
  estado() {
    return {
      activo: this.reloj !== null,
      intervaloMs: this.intervaloMs,
      ocupado: this.ocupado,
      ultimaEjecucion: this.ultima?.en ?? null,
      ultimosProcesados: this.ultima?.procesados ?? null,
      ultimoError: this.ultima?.error ?? null,
    };
  }

  /** "Procesar ahora": una importacion puede tardar minutos (Python), asi que corre en segundo plano. */
  iniciarProcesamiento(): { iniciado: true } {
    if (this.ocupado) throw new ConflictException('El trabajador GRE ya está procesando una importación.');
    void this.ciclo();
    return { iniciado: true };
  }
}
```

(importar `ConflictException` de `@nestjs/common`). En `gre.module.ts`: `exports: [GreCatalogoService, GreFuentesService, GreTrabajadorService],`.

`gre-admin.controller.ts` — agregar al constructor `private readonly trabajador: GreTrabajadorService` y `private readonly auditoria: AuditoriaService` (importar ambos; `AuditoriaService` de `../seguridad/auditoria.service`; verificar con `grep -n "SeguridadModule" backend/src/modules/gre/gre.module.ts` que el módulo lo importa, si no agregarlo a `imports`), y el endpoint:

```ts
  /** Procesa ya una importacion pendiente (el trabajador automatico puede estar apagado). */
  @Post('importaciones/procesar')
  @RequirePermission('matpel:administrar_gre')
  async procesarPendiente(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    const [fila] = await this.ds.query(`SELECT OBJECT_ID(N'matpel.gre_importaciones', N'U') AS id`);
    if (!fila?.id) throw new ConflictException('La base no tiene las tablas del GRE: las migraciones 094 y 095 no están aplicadas (decisión de la institución).');
    const resultado = this.trabajador.iniciarProcesamiento();
    await this.auditoria.registrar({ usuarioId: user.id, accion: 'GRE_PROCESAMIENTO_SOLICITADO', recurso: 'matpel.gre_importaciones', ip: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null });
    return resultado;
  }
```

`avisos-vencimiento.service.ts` — agregar campos y métodos, y que `ejecutarSeguro` los registre:

```ts
  private ocupado = false;
  private ultima: { en: Date; enviados: number; motivo: string | null; error: string | null } | null = null;

  private async ejecutarSeguro() {
    if (this.ocupado) return;
    this.ocupado = true;
    try {
      const r = await this.ejecutar();
      this.ultima = { en: new Date(), enviados: r.enviados, motivo: r.motivo ?? null, error: null };
      if (r.enviados > 0) this.log.log(`Aviso de vencimientos enviado (${r.enviados}).`);
    } catch (error) {
      const mensaje = error instanceof Error ? error.message : 'error';
      this.ultima = { en: new Date(), enviados: 0, motivo: null, error: mensaje };
      this.log.warn(`No se pudo revisar los vencimientos: ${mensaje}`);
    } finally {
      this.ocupado = false;
    }
  }

  /** Lo que muestra Sistema › Tareas. */
  estado() {
    return {
      programado: this.temporizador !== null,
      intervaloHoras: INTERVALO_MS / 3_600_000,
      ocupado: this.ocupado,
      telegramConfigurado: this.telegram.habilitado(),
      ultimaEjecucion: this.ultima?.en ?? null,
      ultimosEnviados: this.ultima?.enviados ?? null,
      ultimoMotivo: this.ultima?.motivo ?? null,
      ultimoError: this.ultima?.error ?? null,
    };
  }

  /** "Ejecutar ahora" desde Sistema › Tareas. */
  async ejecutarAhora(): Promise<{ enviados: number; motivo?: string }> {
    if (this.ocupado) throw new ConflictException('La revisión de vencimientos ya está corriendo.');
    this.ocupado = true;
    try {
      const r = await this.ejecutar();
      this.ultima = { en: new Date(), enviados: r.enviados, motivo: r.motivo ?? null, error: null };
      return r;
    } catch (error) {
      this.ultima = { en: new Date(), enviados: 0, motivo: null, error: error instanceof Error ? error.message : 'error' };
      throw error;
    } finally {
      this.ocupado = false;
    }
  }
```

(reemplaza el `ejecutarSeguro` existente; importar `ConflictException`). En `control-personal.module.ts`: `exports: [AvisosVencimientoService, VencimientosService],` (si ya hay `exports`, sumarlos).

`despacho-tiempo-real.service.ts` — al final de la clase:

```ts
  /** Streams abiertos en total (Sistema › Estado). */
  totalConexiones(): number {
    let total = 0;
    for (const n of this.conexiones.values()) total += n;
    return total;
  }

  personasConectadas(): number {
    return this.conexiones.size;
  }
```

`alertas.service.ts` — agregar (importar `Observable` de `rxjs`):

```ts
  private suscriptores = 0;

  /** Flujo del SSE de alertas que ademas cuenta cuantos lo escuchan (Sistema › Estado). */
  flujo(): Observable<AlertaEmergencia> {
    return new Observable<AlertaEmergencia>((destino) => {
      this.suscriptores++;
      const s = this.eventos$.subscribe(destino);
      return () => {
        this.suscriptores--;
        s.unsubscribe();
      };
    });
  }

  suscriptoresActivos(): number {
    return this.suscriptores;
  }
```

y en `alertas.controller.ts` cambiar `this.alertasService.observarEventos().pipe(` por `this.alertasService.flujo().pipe(`.

`app-movil.service.ts` — método público:

```ts
  /** Huella del certificado de firma publicada junto al APK (certificado.sha256), si existe. */
  huellaCertificado(): string | null {
    try {
      const texto = readFileSync(join(this.directorio(), 'certificado.sha256'), 'utf8').trim();
      return texto.split(/\s+/)[0] || null;
    } catch {
      return null;
    }
  }
```

`app-movil.module.ts`: `exports: [AppMovilService],`. `ia.module.ts`: agregar `exports: [IaConfiguracionService, OllamaService, WhisperService, PiperService],` después de `providers`.

- [ ] **Step 6: `sistema.service.ts`**

```ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { existsSync, readFileSync } from 'fs';
import { stat } from 'fs/promises';
import { networkInterfaces } from 'os';
import { join } from 'path';
import { DataSource } from 'typeorm';
import { AlertasService } from '../alertas/alertas.service';
import { AppMovilService } from '../app-movil/app-movil.service';
import { AvisosVencimientoService } from '../control-personal/avisos-vencimiento.service';
import { DespachoTiempoReal } from '../despacho/despacho-tiempo-real.service';
import { GreTrabajadorService } from '../gre/gre-trabajador.service';
import { IaConfiguracionService } from '../ia/ia-configuracion.service';
import { OllamaService } from '../ia/ollama/ollama.service';
import { PiperService } from '../ia/piper/piper.service';
import { WhisperService } from '../ia/whisper/whisper.service';
import { TelegramService } from '../notificaciones/telegram.service';
import { MatrizWebService } from '../pantallas/matriz-web.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { directoriosSistema, leerCola } from './entorno';
import { contenidoQrConexion, direccionesDeRed } from './red.logica';
import { ARCHIVOS_REGISTRO, esClaveRegistro, nivelDeLinea, ocultarSecretos, ultimasLineas } from './registros.logica';
import { AlertaSistema } from './respaldos.logica';
import { ContextoSistema, RespaldosService } from './respaldos.service';

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));
const SILENCIO_AUDITORIA_MS = 10 * 60_000;

function leerVersion(): string | null {
  try {
    return (JSON.parse(readFileSync(join(process.cwd(), 'package.json'), 'utf8')) as { version?: string }).version ?? null;
  } catch {
    return null;
  }
}

async function responde(api: string): Promise<boolean> {
  try {
    const r = await fetch(`${api}/salud`, { signal: AbortSignal.timeout(2000) });
    const j = (await r.json().catch(() => ({}))) as { estado?: string };
    return r.status === 200 && j.estado === 'disponible';
  } catch {
    return false;
  }
}

/** Estado real de los servicios, agentes y tareas del sistema, y sus operaciones seguras. */
@Injectable()
export class SistemaService {
  private readonly version = leerVersion();
  private readonly lecturasRegistro = new Map<string, number>();

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly matriz: MatrizWebService,
    private readonly auditoria: AuditoriaService,
    private readonly respaldos: RespaldosService,
    private readonly gre: GreTrabajadorService,
    private readonly avisos: AvisosVencimientoService,
    private readonly despacho: DespachoTiempoReal,
    private readonly alertas: AlertasService,
    private readonly iaConfig: IaConfiguracionService,
    private readonly ollama: OllamaService,
    private readonly whisper: WhisperService,
    private readonly piper: PiperService,
    private readonly appMovilService: AppMovilService,
    private readonly telegram: TelegramService,
  ) {}

  private async baseDeDatos() {
    const inicio = Date.now();
    try {
      await this.dataSource.query('SELECT 1 AS ok');
    } catch (e) {
      return { disponible: false as const, motivo: mensaje(e), latenciaMs: null, version: null, tamanioMb: null };
    }
    const latenciaMs = Date.now() - inicio;
    const version = await this.dataSource.query(`SELECT CAST(SERVERPROPERTY('ProductVersion') AS NVARCHAR(50)) AS v`).then((r: Array<{ v: string }>) => r[0]?.v ?? null).catch(() => null);
    const tamanioMb = await this.dataSource.query('SELECT CAST(SUM(size) * 8.0 / 1024 AS DECIMAL(12,1)) AS mb FROM sys.database_files').then((r: Array<{ mb: number }>) => (r[0]?.mb != null ? Number(r[0].mb) : null)).catch(() => null);
    return { disponible: true as const, motivo: null, latenciaMs, version, tamanioMb };
  }

  private async inteligencia() {
    try {
      const config = await this.iaConfig.obtener();
      const [ollama, whisper] = await Promise.all([
        this.ollama.estado(config).catch((e: unknown) => ({ conectado: false, error: mensaje(e) })),
        this.whisper.estado(config).catch((e: unknown) => ({ conectado: false, error: mensaje(e) })),
      ]);
      return { disponible: true as const, estado: config.estado, ollama, whisper, piper: this.piper.estado(config), motivo: null };
    } catch (e) {
      return { disponible: false as const, estado: null, ollama: null, whisper: null, piper: null, motivo: mensaje(e) };
    }
  }

  private async colaGre() {
    try {
      const [existe] = await this.dataSource.query(`SELECT OBJECT_ID(N'matpel.gre_importaciones', N'U') AS id`);
      if (!existe?.id) return { tablas: false as const, motivo: 'Las migraciones 094 y 095 (GRE) no están aplicadas.', porEstado: {} as Record<string, number> };
      const filas: Array<{ estado: string; n: number }> = await this.dataSource.query('SELECT estado, COUNT(*) AS n FROM matpel.gre_importaciones GROUP BY estado');
      return { tablas: true as const, motivo: null, porEstado: Object.fromEntries(filas.map((f) => [f.estado, Number(f.n)])) };
    } catch (e) {
      return { tablas: false as const, motivo: mensaje(e), porEstado: {} as Record<string, number> };
    }
  }

  async estado() {
    const [baseDeDatos, inteligencia, colaGre] = await Promise.all([this.baseDeDatos(), this.inteligencia(), this.colaGre()]);
    return {
      generadoEn: new Date(),
      backend: {
        version: this.version,
        node: process.version,
        entorno: process.env.NODE_ENV ?? 'development',
        plataforma: process.platform,
        segundosEncendido: Math.round(process.uptime()),
        memoriaMb: Math.round(process.memoryUsage().rss / 1_048_576),
      },
      baseDeDatos,
      inteligencia,
      telegram: { configurado: this.telegram.habilitado() },
      tiempoReal: {
        despacho: { conexiones: this.despacho.totalConexiones(), personas: this.despacho.personasConectadas() },
        alertas: { suscriptores: this.alertas.suscriptoresActivos() },
      },
      trabajos: { gre: { ...this.gre.estado(), cola: colaGre }, avisos: this.avisos.estado() },
      matriz: this.matriz.estado(),
    };
  }

  async resumen(): Promise<{ generadoEn: Date; nivel: 'normal' | 'atencion' | 'critico'; alertas: AlertaSistema[] }> {
    const [estado, respaldos, migraciones] = await Promise.all([
      this.estado(),
      this.respaldos.respaldos().catch((e: unknown) => ({ alertas: [{ nivel: 'advertencia' as const, mensaje: `No se pudieron leer los respaldos: ${mensaje(e)}` }] })),
      this.respaldos.migraciones(),
    ]);
    const alertas: AlertaSistema[] = [];
    if (!estado.baseDeDatos.disponible) alertas.push({ nivel: 'critica', mensaje: `La base de datos no responde: ${estado.baseDeDatos.motivo}` });
    alertas.push(...respaldos.alertas);
    if (migraciones.disponible && migraciones.alteradas.length) alertas.push({ nivel: 'critica', mensaje: `Migraciones alteradas después de aplicarse: ${migraciones.alteradas.join(', ')}.` });
    if (migraciones.disponible && migraciones.pendientes.length) alertas.push({ nivel: 'info', mensaje: `${migraciones.pendientes.length} migración(es) pendiente(s): ${migraciones.pendientes.join(', ')}.` });
    const ollama = estado.inteligencia.ollama as { conectado?: boolean } | null;
    if (ollama && ollama.conectado === false) alertas.push({ nivel: 'advertencia', mensaje: 'Ollama no responde: Snoopy contesta con su motor local.' });
    if (!estado.matriz.sincronizada) alertas.push({ nivel: 'advertencia', mensaje: 'El catálogo de pantallas no se pudo sincronizar con la base.' });
    if (estado.trabajos.avisos.ultimoError) alertas.push({ nivel: 'advertencia', mensaje: `La última revisión de vencimientos falló: ${estado.trabajos.avisos.ultimoError}` });
    const pendientesGre = estado.trabajos.gre.cola.porEstado['PENDIENTE'] ?? 0;
    if (pendientesGre > 0 && !estado.trabajos.gre.activo) alertas.push({ nivel: 'info', mensaje: `${pendientesGre} importación(es) GRE pendiente(s) con el trabajador apagado.` });
    const nivel = alertas.some((a) => a.nivel === 'critica') ? 'critico' : alertas.some((a) => a.nivel === 'advertencia') ? 'atencion' : 'normal';
    return { generadoEn: new Date(), nivel, alertas };
  }

  async tareasYTrabajos() {
    let tareas: Awaited<ReturnType<RespaldosService['tareas']>> | null = null;
    let motivoTareas: string | null = null;
    try {
      tareas = await this.respaldos.tareas();
    } catch (e) {
      motivoTareas = mensaje(e);
    }
    const arranque = await this.registros('arranque-automatico', 30).catch(() => null);
    return {
      tareas,
      motivoTareas,
      arranque: arranque?.disponible ? arranque.lineas : [],
      trabajos: { gre: { ...this.gre.estado(), cola: await this.colaGre() }, avisos: this.avisos.estado() },
    };
  }

  async ejecutarAvisos(ctx: ContextoSistema) {
    const r = await this.avisos.ejecutarAhora();
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'AVISOS_VENCIMIENTO_EJECUTADOS', recurso: 'sistema.tareas', datosDespues: r, ip: ctx.ip, userAgent: ctx.userAgent });
    return r;
  }

  async registros(clave: string, lineas = 200, ctx?: ContextoSistema) {
    if (!esClaveRegistro(clave)) throw new BadRequestException('Registro desconocido.');
    const archivo = ARCHIVOS_REGISTRO[clave];
    const ruta = join(directoriosSistema().logs, archivo);
    if (!existsSync(ruta)) return { clave, archivo, disponible: false as const, motivo: `No existe ${archivo} en la carpeta de registros.`, actualizadoEn: null, lineas: [] as Array<{ texto: string; nivel: string }> };
    const n = Math.min(Math.max(Number(lineas) || 200, 10), 500);
    const [texto, info] = await Promise.all([leerCola(ruta, 256 * 1024), stat(ruta)]);
    if (ctx) await this.auditarLectura(ctx, clave);
    return {
      clave,
      archivo,
      disponible: true as const,
      motivo: null,
      actualizadoEn: info.mtime,
      lineas: ultimasLineas(texto, n).map((t) => {
        const limpia = ocultarSecretos(t);
        return { texto: limpia, nivel: nivelDeLinea(limpia) };
      }),
    };
  }

  /** Leer registros queda auditado, una vez cada 10 minutos por persona y archivo (se consultan cada 5 s). */
  private async auditarLectura(ctx: ContextoSistema, clave: string) {
    const llave = `${ctx.usuarioId}|${clave}`;
    if (Date.now() - (this.lecturasRegistro.get(llave) ?? 0) < SILENCIO_AUDITORIA_MS) return;
    this.lecturasRegistro.set(llave, Date.now());
    await this.auditoria.registrar({ usuarioId: ctx.usuarioId, accion: 'REGISTROS_LEIDOS', recurso: 'sistema.registros', recursoId: clave, ip: ctx.ip, userAgent: ctx.userAgent });
  }

  appMovil() {
    return { ...this.appMovilService.obtenerVersion(), huellaCertificado: this.appMovilService.huellaCertificado() };
  }

  async conexionMovil() {
    const puerto = Number(process.env.PORT) || 3001;
    const direcciones = await Promise.all(direccionesDeRed(networkInterfaces()).map(async (d) => {
      const api = `http://${d.ip}:${puerto}/api/v1`;
      return { ...d, api, responde: await responde(api), qrConectar: contenidoQrConexion(api), urlInstalar: `${api}/app-movil/descargar` };
    }));
    return { puerto, apkDisponible: this.appMovilService.obtenerVersion().disponible, direcciones };
  }
}
```

- [ ] **Step 7: `sistema.controller.ts` y `sistema.module.ts`**

```ts
import { Controller, Get, Param, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { ContextoSistema, RespaldosService } from './respaldos.service';
import { SistemaService } from './sistema.service';

/** Area Sistema del Centro de mando (spec 2026-10-09 §6). */
@ApiTags('sistema')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('sistema')
export class SistemaController {
  constructor(private readonly sistema: SistemaService, private readonly respaldos: RespaldosService) {}

  private ctx(user: AuthenticatedUser, req: Request): ContextoSistema {
    return { usuarioId: user.id, ip: req.ip ?? null, userAgent: req.headers['user-agent'] ?? null };
  }

  @Get('resumen')
  @RequirePermission('sistema:ver')
  resumen() { return this.sistema.resumen(); }

  @Get('estado')
  @RequirePermission('sistema:ver')
  estado() { return this.sistema.estado(); }

  @Get('tareas')
  @RequirePermission('sistema:ver')
  tareas() { return this.sistema.tareasYTrabajos(); }

  @Post('tareas/avisos-vencimiento/ejecutar')
  @RequirePermission('sistema:operar')
  ejecutarAvisos(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) { return this.sistema.ejecutarAvisos(this.ctx(user, req)); }

  @Get('respaldos')
  @RequirePermission('sistema:ver')
  listarRespaldos() { return this.respaldos.respaldos(); }

  @Post('respaldos/ejecutar')
  @RequirePermission('sistema:operar')
  respaldar(@CurrentUser() user: AuthenticatedUser, @Req() req: Request) { return this.respaldos.respaldarAhora(this.ctx(user, req)); }

  @Post('respaldos/:archivo/verificar')
  @RequirePermission('sistema:operar')
  verificar(@Param('archivo') archivo: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.respaldos.verificarRespaldo(archivo, this.ctx(user, req));
  }

  @Get('migraciones')
  @RequirePermission('sistema:ver')
  migraciones() { return this.respaldos.migraciones(); }

  @Get('app-movil')
  @RequirePermission('sistema:ver')
  appMovil() { return this.sistema.appMovil(); }

  @Get('conexion-movil')
  @RequirePermission('sistema:ver')
  conexionMovil() { return this.sistema.conexionMovil(); }

  @Get('registros')
  @RequirePermission('sistema:ver_registros')
  registros(@Query('archivo') archivo: string, @Query('lineas') lineas: string | undefined, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.sistema.registros(archivo ?? '', Number(lineas) || 200, this.ctx(user, req));
  }
}
```

```ts
import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { AppMovilModule } from '../app-movil/app-movil.module';
import { ControlPersonalModule } from '../control-personal/control-personal.module';
import { DespachoModule } from '../despacho/despacho.module';
import { GreModule } from '../gre/gre.module';
import { IaModule } from '../ia/ia.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { RespaldosService } from './respaldos.service';
import { SistemaController } from './sistema.controller';
import { SistemaService } from './sistema.service';

@Module({
  imports: [SeguridadModule, GreModule, ControlPersonalModule, DespachoModule, AlertasModule, IaModule, AppMovilModule],
  controllers: [SistemaController],
  providers: [SistemaService, RespaldosService],
  exports: [SistemaService],
})
export class SistemaModule {}
```

(`NotificacionesModule` es `@Global`: `TelegramService` se resuelve sin importarlo.) En `app.module.ts`: importar `SistemaModule` y agregarlo al final de `imports`.

En `backend/.env.example`, al final:

```
# Area Sistema: carpetas que lee (por defecto, relativas a la raiz del repositorio)
# SIGBO_RESPALDOS_DIR=
# SIGBO_LOGS_DIR=
# SIGBO_DATABASE_DIR=
# Carpeta permitida para el ejecutable y las voces de Piper
# IA_PIPER_DIR=
```

(si Task 3 ya agregó `IA_PIPER_DIR`, no duplicarla).

- [ ] **Step 8: Correr pruebas, compilar y arrancar**

Run: `cd backend; npx jest src/modules/sistema src/modules/gre src/modules/control-personal src/modules/alertas src/modules/despacho`
Expected: PASS salvo las 2 fallas previas de `despacho.spec.ts`.
Run: `cd backend; npm run build`
Expected: sin errores. Reiniciar el backend y revisar `logs\backend-err.log`: sin errores de inyección de dependencias (si Nest no puede resolver algo de `SistemaModule`, falta un `exports` del Step 5).

- [ ] **Step 9: Probar las rutas reales**

Con el script de login de Task 16 Step 3 (o Swagger con `admin`): `GET /sistema/estado`, `/sistema/resumen`, `/sistema/tareas`, `/sistema/respaldos`, `/sistema/migraciones` (debe listar 094 y 095 como pendientes), `/sistema/app-movil`, `/sistema/conexion-movil` y `/sistema/registros?archivo=backend-out&lineas=50` → todas 200 con datos reales. `GET /sistema/registros?archivo=..%5C.env` → 400.

- [ ] **Step 10: Commit**

```bash
git add backend/src/modules/sistema backend/src/modules/gre backend/src/modules/control-personal backend/src/modules/despacho/despacho-tiempo-real.service.ts backend/src/modules/alertas backend/src/modules/ia/ia.module.ts backend/src/modules/app-movil backend/src/app.module.ts backend/.env.example
git commit -m "Sistema: estado, tareas, respaldos, migraciones, registros y app móvil con operaciones seguras

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 11: Centro de mando — backend (acceso por estado, emergencias por participación, secciones)

**Files:**
- Modify: `backend/src/modules/configuracion/configuracion.registry.ts` (tipo `lista` y clave `operations.commandCenterStates`)
- Modify: `backend/src/modules/configuracion/configuracion.service.ts` (validar `lista`, `valorGlobal`)
- Modify: `backend/src/modules/despacho/servicio-activo.service.ts` (`activosParaCentroMando`, sin duplicar el armado)
- Modify: `backend/src/modules/seguridad/seguridad.module.ts` (exportar `PerfilService`)
- Modify: `backend/src/modules/flota/flota.module.ts` (exportar `FlotaService`, `DisponibilidadService`)
- Modify: `backend/src/modules/denuncias/denuncias.module.ts` (exportar `DenunciasService`)
- Modify: `backend/src/modules/reservas/reservas.module.ts` (exportar `ReservasService`)
- Create: `backend/src/modules/centro-mando/centro-mando.logica.ts`
- Create: `backend/src/modules/centro-mando/centro-mando.service.ts`
- Create: `backend/src/modules/centro-mando/centro-mando.controller.ts`
- Create: `backend/src/modules/centro-mando/centro-mando.module.ts`
- Modify: `backend/src/app.module.ts` (importar `CentroMandoModule`)
- Test: `backend/src/modules/centro-mando/centro-mando.spec.ts`

**Interfaces:**
- Consumes: `MatrizWebService.evaluadorSecciones` y `SECCIONES_CENTRO_MANDO` (Task 6), `SistemaService.resumen` (Task 10), `VencimientosService` exportado (Task 10).
- Produces:
  - `ConfiguracionService.valorGlobal<T>(clave: string): Promise<T>`; `ConfigTipo` incluye `'lista'`.
  - `ServicioActivoService.activosParaCentroMando(user, { supervisor: boolean; bomberoId: string | null }): Promise<{ supervisor: boolean; servicios: EmergenciaResumen[] }>` con `EmergenciaResumen = { id; numeroServicio; tipo; estado; gravedad; fechaHoraAviso; personal; enCamino; moviles; direccion }`.
  - `centro-mando.logica.ts`: `ETIQUETA_ESTADO_BOMBERO`, `decidirAcceso(estado: string | null, permitidos: string[]): { acceso: boolean; motivo: string | null }`, `esSupervisor(permisos: string[]): boolean`, `nivelPorCantidad(cantidad: number, criticos?: number): 'normal' | 'atencion' | 'critico'`.
  - `CentroMandoService.acceso(user)`, `.panel(user)` → `{ generadoEn: Date; acceso: 'PERMITIDO' | 'SIN_ACCESO'; motivo: string | null; secciones: Partial<Record<ClaveSeccion, { estado: 'ok'; datos: unknown } | { estado: 'error'; error: string }>> }`.
  - `interface ItemPendiente { clave: string; titulo: string; cantidad: number | null; detalle: string | null; enlace: string; nivel: 'normal' | 'atencion' | 'critico'; error: string | null }`.
  - Endpoints: `GET /centro-mando`, `GET /centro-mando/acceso` (cualquier autenticado).

- [ ] **Step 1: Pruebas que fallan**

`backend/src/modules/centro-mando/centro-mando.spec.ts`:

```ts
import { Bombero, PersonalServicio, Servicio, ServicioParticipante, TipoServicio, Usuario } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { ServicioActivoService } from '../despacho/servicio-activo.service';
import { decidirAcceso, esSupervisor } from './centro-mando.logica';
import { CentroMandoService } from './centro-mando.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('reglas del Centro de mando', () => {
  it('solo los estados configurados tienen acceso', () => {
    expect(decidirAcceso('ACTIVO', ['ACTIVO'])).toEqual({ acceso: true, motivo: null });
    expect(decidirAcceso('LICENCIA', ['ACTIVO'])).toEqual({ acceso: false, motivo: 'Tu estado actual (Licencia) no tiene acceso al Centro de mando.' });
    expect(decidirAcceso('BAJA', ['ACTIVO', 'LICENCIA']).acceso).toBe(false);
    expect(decidirAcceso(null, ['ACTIVO']).acceso).toBe(false);
  });

  it('supervisa quien despacha o hace seguimiento', () => {
    expect(esSupervisor(['despacho:seguimiento'])).toBe(true);
    expect(esSupervisor(['servicios:despachar'])).toBe(true);
    expect(esSupervisor(['servicios:ver', 'despacho:responder'])).toBe(false);
  });
});

describe('emergencias en curso por participación', () => {
  async function preparar() {
    const base = new BaseFalsa();
    await sembrar(base, TipoServicio, { id: 't1', nombre: 'Incendio' });
    for (const id of ['s1', 's2', 's3']) {
      await sembrar(base, Servicio, { id, numeroServicio: `CS-2026-0000${id[1]}`, tipoServicioId: 't1', estado: 'EN_CURSO', gravedad: 'GRAVE', fechaHoraAviso: new Date(), direccion: 'Calle 1' });
    }
    await sembrar(base, Servicio, { id: 's4', numeroServicio: 'CS-2026-00004', tipoServicioId: 't1', estado: 'FINALIZADO', fechaHoraAviso: new Date(), direccion: 'x' });
    await sembrar(base, ServicioParticipante, { servicioId: 's1', usuarioId: 'u1', estado: 'EN_CAMINO', hasta: null });
    await sembrar(base, ServicioParticipante, { servicioId: 's3', usuarioId: 'u1', estado: 'RETIRADO', hasta: new Date() });
    await sembrar(base, PersonalServicio, { servicioId: 's2', bomberoId: 'b1', rol: 'Bombero', horasServicio: 0 });
    const pantallas = { permite: jest.fn().mockResolvedValue(false), exigir: jest.fn() };
    return new ServicioActivoService(base as never, { registrar: jest.fn() } as never, pantallas as never, {} as never);
  }

  it('sin supervisión, solo las que la persona integra (participante vigente o personal del servicio)', async () => {
    const s = await preparar();
    const r = await s.activosParaCentroMando({ id: 'u1', permisos: [] } as never, { supervisor: false, bomberoId: 'b1' });
    expect(r.servicios.map((x) => x.id).sort()).toEqual(['s1', 's2']);
    expect(r.servicios[0]).toMatchObject({ tipo: 'Incendio', gravedad: 'GRAVE', direccion: null });
  });

  it('con supervisión, todas las activas', async () => {
    const s = await preparar();
    const r = await s.activosParaCentroMando({ id: 'u9', permisos: [] } as never, { supervisor: true, bomberoId: null });
    expect(r.servicios.map((x) => x.id).sort()).toEqual(['s1', 's2', 's3']);
  });
});

describe('CentroMandoService', () => {
  function nuevo(base: BaseFalsa, o: { secciones?: string[]; alertasFalla?: boolean } = {}) {
    const visibles = new Set(o.secciones ?? ['emergencias', 'alertas', 'mi_actividad', 'pendientes']);
    const deps = {
      matriz: { evaluadorSecciones: jest.fn().mockResolvedValue((c: string) => visibles.has(c)) },
      configuracion: { valorGlobal: jest.fn().mockResolvedValue(['ACTIVO']) },
      servicioActivo: { activosParaCentroMando: jest.fn().mockResolvedValue({ supervisor: false, servicios: [] }) },
      despacho: { listar: jest.fn().mockResolvedValue([{}, {}]) },
      alertas: { listar: o.alertasFalla ? jest.fn().mockRejectedValue(new Error('se cayó')) : jest.fn().mockResolvedValue([]) },
      disponibilidad: { consultar: jest.fn() },
      flota: { vencimientos: jest.fn().mockResolvedValue([]) },
      perfil: { obtenerInicioPropio: jest.fn().mockResolvedValue({ tienePerfilBombero: false, proximasGuardias: [], ultimosServicios: [] }) },
      denuncias: { resumen: jest.fn().mockResolvedValue({ NUEVA: 2, EN_REVISION: 1 }) },
      reservas: { listar: jest.fn().mockResolvedValue([]) },
      vencimientos: { vencimientos: jest.fn().mockResolvedValue([]) },
      sistema: { resumen: jest.fn() },
    };
    const s = new CentroMandoService(base as never, deps.matriz as never, deps.configuracion as never, deps.servicioActivo as never,
      deps.despacho as never, deps.alertas as never, deps.disponibilidad as never, deps.flota as never, deps.perfil as never,
      deps.denuncias as never, deps.reservas as never, deps.vencimientos as never, deps.sistema as never);
    return { s, deps };
  }

  it('el personal no activo no ve nada (ni se consulta nada)', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: 'b1' });
    await sembrar(base, Bombero, { id: 'b1', estado: 'LICENCIA' });
    const { s, deps } = nuevo(base);
    await expect(s.panel({ id: 'u1', permisos: ['servicios:ver'] } as never)).resolves.toMatchObject({ acceso: 'SIN_ACCESO', secciones: {} });
    expect(deps.matriz.evaluadorSecciones).not.toHaveBeenCalled();
    expect(deps.servicioActivo.activosParaCentroMando).not.toHaveBeenCalled();
  });

  it('una cuenta sin ficha de bombero se rige por sus roles', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'admin', bomberoId: null });
    const { s } = nuevo(base);
    await expect(s.acceso({ id: 'admin', permisos: [] } as never)).resolves.toMatchObject({ acceso: true });
  });

  it('una sección que falla no tumba a las demás, y los pendientes respetan cada permiso', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: 'b1' });
    await sembrar(base, Bombero, { id: 'b1', estado: 'ACTIVO' });
    const { s, deps } = nuevo(base, { alertasFalla: true });
    const r = await s.panel({ id: 'u1', permisos: ['servicios:ver', 'denuncias:ver'] } as never);
    expect(r.acceso).toBe('PERMITIDO');
    expect(r.secciones.alertas).toEqual({ estado: 'error', error: 'se cayó' });
    expect(r.secciones.emergencias).toMatchObject({ estado: 'ok' });
    expect(deps.servicioActivo.activosParaCentroMando).toHaveBeenCalledWith(expect.anything(), { supervisor: false, bomberoId: 'b1' });
    const pendientes = (r.secciones.pendientes as { datos: Array<{ clave: string; cantidad: number }> }).datos;
    expect(pendientes).toEqual([expect.objectContaining({ clave: 'denuncias', cantidad: 3 })]);
    expect(deps.despacho.listar).not.toHaveBeenCalled();
  });

  it('sin ningún pendiente permitido, la sección no aparece', async () => {
    const base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', bomberoId: null });
    const { s } = nuevo(base, { secciones: ['pendientes', 'mi_actividad'] });
    const r = await s.panel({ id: 'u1', permisos: [] } as never);
    expect(r.secciones.pendientes).toBeUndefined();
    expect(r.secciones.mi_actividad).toMatchObject({ estado: 'ok' });
  });
});
```

- [ ] **Step 2: Correrlas**

Run: `cd backend; npx jest src/modules/centro-mando`
Expected: FAIL (archivos inexistentes).

- [ ] **Step 3: Configuración — tipo `lista` y la clave nueva**

En `configuracion.registry.ts`: `export type ConfigTipo = 'texto' | 'numero' | 'booleano' | 'selector' | 'color' | 'lista';` y, en `CONFIG_REGISTRY`, después de `operations.sessionMinutes`:

```ts
  d({key:'operations.commandCenterStates',nombre:'Estados con acceso al Centro de mando',descripcion:'Estados del bombero que pueden ver el Centro de mando. Las cuentas sin ficha de bombero se rigen por sus roles.',categoria:'Seguridad global',nivel:'GLOBAL',tipo:'lista',control:'checkboxes',defaultValue:['ACTIVO'],allowed:['ACTIVO','SUSPENDIDO','LICENCIA','BAJA','FALLECIDO'],public:false,userOverride:false,permission:'configuracion:editar_borrador',realtime:true,reload:false,sensitive:false,version:'1.0'}),
```

En `configuracion.service.ts`, dentro de `validar`, reemplazar la línea `if(def.allowed&&!def.allowed.includes(value))errors.push(...)` por:

```ts
      if(def.tipo==='lista'&&(!Array.isArray(value)||value.some(v=>!def.allowed?.includes(v))))errors.push(`${key} debe ser una lista de valores permitidos`);
      if(def.allowed&&def.tipo!=='lista'&&!def.allowed.includes(value))errors.push(`${key} contiene un valor no permitido`);
```

y agregar el método:

```ts
  /** Valor GLOBAL publicado de una clave (o su valor por defecto). Para que otros modulos lean la configuracion. */
  async valorGlobal<T>(clave: string): Promise<T> {
    const def = CONFIG_BY_KEY.get(clave);
    if (!def) throw new Error(`Clave de configuración desconocida: ${clave}`);
    const fila = await this.valoresRepo.findOne({ where: { alcance: 'GLOBAL', clave } });
    return (fila ? JSON.parse(fila.valorJson) : def.defaultValue) as T;
  }
```

- [ ] **Step 4: Emergencias por participación sin duplicar el armado**

En `servicio-activo.service.ts` importar `PersonalServicio` desde `../../shared/entities` y reemplazar el método `activos` por:

```ts
  async activos(user: AuthenticatedUser) {
    await this.exigirPantalla(user, '0xA006', 'ver');
    return this.resumirActivos(await this.serviciosActivos(), user);
  }

  /**
   * Emergencias en curso para el Centro de mando (spec 2026-10-09 §5.5): quien supervisa
   * (central, comandancia) ve todas; el resto, solo las que integra: participante vigente
   * del servicio o integrante del personal del servicio con su ficha de bombero.
   */
  async activosParaCentroMando(user: AuthenticatedUser, opciones: { supervisor: boolean; bomberoId: string | null }) {
    let servicios = await this.serviciosActivos();
    if (!opciones.supervisor && servicios.length) {
      const ids = servicios.map((s) => s.id);
      const participa = new Set(
        (await this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId: In(ids), usuarioId: user.id } }))
          .filter((p) => !p.hasta && p.estado !== 'RETIRADO')
          .map((p) => p.servicioId),
      );
      if (opciones.bomberoId) {
        const personal = await this.dataSource.getRepository(PersonalServicio).find({ where: { servicioId: In(ids), bomberoId: opciones.bomberoId } });
        for (const p of personal) participa.add(p.servicioId);
      }
      servicios = servicios.filter((s) => participa.has(s.id));
    }
    return { supervisor: opciones.supervisor, servicios: await this.resumirActivos(servicios, user) };
  }

  private serviciosActivos() {
    return this.dataSource.getRepository(Servicio).find({ where: { estado: In([...ESTADOS_ACTIVOS]) }, order: { fechaHoraAviso: 'DESC' }, take: 100 });
  }

  private async resumirActivos(servicios: Servicio[], user: AuthenticatedUser) {
    const tipos = await this.dataSource.getRepository(TipoServicio).find({ where: { id: In([...new Set(servicios.map((s) => s.tipoServicioId))]) } });
    const participantes = servicios.length ? await this.dataSource.getRepository(ServicioParticipante).find({ where: { servicioId: In(servicios.map((s) => s.id)) } }) : [];
    const moviles = servicios.length ? await this.dataSource.getRepository(Despacho).find({ where: { servicioId: In(servicios.map((s) => s.id)), estado: In(['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO']) } }) : [];
    const tipoPorId = new Map(tipos.map((t) => [t.id, t.nombre]));
    const conf = await this.puedeConfidencial(user, '0xA006');
    const salida = servicios.map((s) => ({
      id: s.id, numeroServicio: s.numeroServicio, tipo: tipoPorId.get(s.tipoServicioId) ?? 'Servicio', estado: s.estado,
      gravedad: s.gravedad ?? null,
      fechaHoraAviso: s.fechaHoraAviso, personal: participantes.filter((p) => p.servicioId === s.id && !p.hasta && p.estado !== 'RETIRADO').length,
      enCamino: participantes.filter((p) => p.servicioId === s.id && !p.hasta && p.estado === 'EN_CAMINO').length,
      moviles: moviles.filter((m) => m.servicioId === s.id).length,
      direccion: conf ? s.direccion : null,
    }));
    if (conf && servicios.length) await this.auditar(user, 'ACCESO_CONFIDENCIAL', servicios[0].id, null, { campos: ['direccion'], servicios: servicios.length });
    return salida;
  }
```

(Es el mismo cuerpo que tenía `activos`, más `gravedad`. La app móvil recibe un campo más; no cambia nada de lo que ya usa.)

- [ ] **Step 5: Exportar los servicios que se reutilizan**

`seguridad.module.ts`: `exports: [PolicyEngineService, AuditoriaService, PerfilService],`. `flota.module.ts`: agregar `exports: [FlotaService, DisponibilidadService],` (o sumarlos si ya hay). `denuncias.module.ts`: `exports: [DenunciasService],`. `reservas.module.ts`: `exports: [ReservasService],`.

- [ ] **Step 6: `centro-mando.logica.ts`**

```ts
/** Reglas puras del Centro de mando (spec 2026-10-09 §5.3 y §5.5). */

export const ETIQUETA_ESTADO_BOMBERO: Record<string, string> = {
  ACTIVO: 'Activo', SUSPENDIDO: 'Suspendido', LICENCIA: 'Licencia', BAJA: 'De baja', FALLECIDO: 'Fallecido',
};

/** El personal cuyo estado no esta entre los permitidos no ve nada del Centro de mando. */
export function decidirAcceso(estado: string | null, permitidos: string[]): { acceso: boolean; motivo: string | null } {
  if (!estado) return { acceso: false, motivo: 'Tu usuario está vinculado a una ficha de bombero que no se encontró.' };
  if (permitidos.includes(estado)) return { acceso: true, motivo: null };
  return { acceso: false, motivo: `Tu estado actual (${ETIQUETA_ESTADO_BOMBERO[estado] ?? estado}) no tiene acceso al Centro de mando.` };
}

/** Supervisa (ve todas las emergencias) quien despacha o hace seguimiento. */
export function esSupervisor(permisos: string[]): boolean {
  return permisos.includes('despacho:seguimiento') || permisos.includes('servicios:despachar');
}

export function nivelPorCantidad(cantidad: number, criticos = 0): 'normal' | 'atencion' | 'critico' {
  if (criticos > 0) return 'critico';
  return cantidad > 0 ? 'atencion' : 'normal';
}
```

- [ ] **Step 7: `centro-mando.service.ts`**

```ts
import { Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Bombero, DisponibilidadPersonal, Usuario } from '../../shared/entities';
import { AlertasService } from '../alertas/alertas.service';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { ConfiguracionService } from '../configuracion/configuracion.service';
import { VencimientosService } from '../control-personal/vencimientos.service';
import { DenunciasService } from '../denuncias/denuncias.service';
import { DespachoService } from '../despacho/despacho.service';
import { ServicioActivoService } from '../despacho/servicio-activo.service';
import { DisponibilidadService } from '../flota/disponibilidad.service';
import { FlotaService } from '../flota/flota.service';
import { ClaveSeccion, SECCIONES_CENTRO_MANDO } from '../pantallas/catalogo-secciones';
import { MatrizWebService } from '../pantallas/matriz-web.service';
import { ReservasService } from '../reservas/reservas.service';
import { PerfilService } from '../seguridad/perfil.service';
import { SistemaService } from '../sistema/sistema.service';
import { decidirAcceso, esSupervisor, nivelPorCantidad } from './centro-mando.logica';

export interface ItemPendiente {
  clave: string;
  titulo: string;
  cantidad: number | null;
  detalle: string | null;
  enlace: string;
  nivel: 'normal' | 'atencion' | 'critico';
  error: string | null;
}

type SeccionRespuesta = { estado: 'ok'; datos: unknown } | { estado: 'error'; error: string };

const mensaje = (e: unknown) => (e instanceof Error ? e.message : String(e));

/** Centro de mando (spec 2026-10-09 §5): solo las secciones que la persona puede ver, cada una por su lado. */
@Injectable()
export class CentroMandoService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly matriz: MatrizWebService,
    private readonly configuracion: ConfiguracionService,
    private readonly servicioActivo: ServicioActivoService,
    private readonly despacho: DespachoService,
    private readonly alertas: AlertasService,
    private readonly disponibilidad: DisponibilidadService,
    private readonly flota: FlotaService,
    private readonly perfil: PerfilService,
    private readonly denuncias: DenunciasService,
    private readonly reservas: ReservasService,
    private readonly vencimientos: VencimientosService,
    private readonly sistema: SistemaService,
  ) {}

  async acceso(user: Pick<AuthenticatedUser, 'id'>): Promise<{ acceso: boolean; motivo: string | null; bomberoId: string | null }> {
    const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { id: user.id } });
    if (!usuario?.bomberoId) return { acceso: true, motivo: null, bomberoId: null };
    const bombero = await this.dataSource.getRepository(Bombero).findOne({ where: { id: usuario.bomberoId } });
    const permitidos = await this.configuracion.valorGlobal<string[]>('operations.commandCenterStates');
    return { ...decidirAcceso(bombero?.estado ?? null, permitidos), bomberoId: usuario.bomberoId };
  }

  async panel(user: AuthenticatedUser) {
    const acceso = await this.acceso(user);
    if (!acceso.acceso) return { generadoEn: new Date(), acceso: 'SIN_ACCESO' as const, motivo: acceso.motivo, secciones: {} };

    const puede = await this.matriz.evaluadorSecciones(user);
    const claves = SECCIONES_CENTRO_MANDO.map((s) => s.clave).filter((c) => puede(c));
    let disponibilidad: ReturnType<DisponibilidadService['consultar']> | null = null;
    const enVivo = () => (disponibilidad ??= this.disponibilidad.consultar());

    const cargadores: Record<ClaveSeccion, () => Promise<unknown>> = {
      accesos: async () => null,
      emergencias: () => this.servicioActivo.activosParaCentroMando(user, { supervisor: esSupervisor(user.permisos), bomberoId: acceso.bomberoId }),
      alertas: async () => (await this.alertas.listar({ estado: 'PENDIENTE', limite: 20 })).map((a) => ({
        id: a.id, tipo: a.tipo, solicitanteNombre: a.solicitanteNombre, detalle: a.detalle, creadoEn: a.creadoEn,
      })),
      moviles: async () => (await enVivo()).moviles,
      personal: () => this.disponibilidadPersonal(),
      guardia: async () => (await enVivo()).personalDeGuardia,
      convocatorias: async () => (await enVivo()).convocatorias,
      mi_actividad: () => this.perfil.obtenerInicioPropio(user.id),
      pendientes: () => this.pendientes(user),
      sistema: () => this.sistema.resumen(),
    };

    const resultados = await Promise.allSettled(claves.map((c) => cargadores[c]()));
    const secciones: Partial<Record<ClaveSeccion, SeccionRespuesta>> = {};
    claves.forEach((clave, i) => {
      const r = resultados[i];
      secciones[clave] = r.status === 'fulfilled' ? { estado: 'ok', datos: r.value } : { estado: 'error', error: mensaje(r.reason) };
    });
    const pendientes = secciones.pendientes;
    if (pendientes?.estado === 'ok' && Array.isArray(pendientes.datos) && pendientes.datos.length === 0) delete secciones.pendientes;
    return { generadoEn: new Date(), acceso: 'PERMITIDO' as const, motivo: null, secciones };
  }

  /** Bomberos por disponibilidad, con el estado mas reciente de cada persona. */
  private async disponibilidadPersonal() {
    const filas = await this.dataSource.getRepository(DisponibilidadPersonal).find({});
    const ultima = new Map<string, DisponibilidadPersonal>();
    for (const f of filas) {
      const previa = ultima.get(f.usuarioId);
      if (!previa || new Date(f.desde).getTime() > new Date(previa.desde).getTime()) ultima.set(f.usuarioId, f);
    }
    const estados = [...ultima.values()].map((f) => f.estado);
    const cuenta = (e: string) => estados.filter((x) => x === e).length;
    return { alLlamado: cuenta('AL_LLAMADO'), enBase: cuenta('EN_BASE'), enCamino: cuenta('EN_CAMINO'), enServicio: cuenta('EN_SERVICIO'), noDisponible: cuenta('NO_DISPONIBLE'), total: estados.length };
  }

  /** Bandeja de lo que espera a la funcion de la persona: cada item exige su propio permiso. */
  private async pendientes(user: AuthenticatedUser): Promise<ItemPendiente[]> {
    const tiene = (p: string) => user.permisos.includes(p);
    const definiciones: Array<{ clave: string; titulo: string; enlace: string; cargar: () => Promise<Pick<ItemPendiente, 'cantidad' | 'detalle' | 'nivel'>> }> = [];
    if (tiene('despacho:seguimiento')) definiciones.push({
      clave: 'despacho', titulo: 'Solicitudes de despacho abiertas', enlace: '/dashboard/servicios/despacho',
      cargar: async () => { const n = (await this.despacho.listar(true)).length; return { cantidad: n, detalle: null, nivel: nivelPorCantidad(n) }; },
    });
    if (tiene('denuncias:ver')) definiciones.push({
      clave: 'denuncias', titulo: 'Denuncias sin resolver', enlace: '/dashboard/denuncias',
      cargar: async () => {
        const r = await this.denuncias.resumen() as Record<string, number>;
        const nuevas = r['NUEVA'] ?? 0;
        const enRevision = r['EN_REVISION'] ?? 0;
        return { cantidad: nuevas + enRevision, detalle: `${nuevas} nueva(s), ${enRevision} en revisión`, nivel: nivelPorCantidad(nuevas + enRevision) };
      },
    });
    if (tiene('reservas:decidir')) definiciones.push({
      clave: 'reservas', titulo: 'Reservas por decidir', enlace: '/dashboard/reservas',
      cargar: async () => { const n = (await this.reservas.listar({ estado: 'SOLICITADA' }) as unknown[]).length; return { cantidad: n, detalle: null, nivel: nivelPorCantidad(n) }; },
    });
    if (tiene('vehiculos:ver')) definiciones.push({
      clave: 'flota', titulo: 'Vencimientos de móviles (30 días)', enlace: '/dashboard/vehiculos/flota',
      cargar: async () => {
        const l = await this.flota.vencimientos(30);
        const vencidos = l.filter((v) => v.vencido).length;
        return { cantidad: l.length, detalle: `${vencidos} vencido(s)`, nivel: nivelPorCantidad(l.length, vencidos) };
      },
    });
    if (tiene('personal:ver')) definiciones.push({
      clave: 'personal', titulo: 'Vencimientos del personal (30 días)', enlace: '/dashboard/personal/control',
      cargar: async () => {
        const l = await this.vencimientos.vencimientos(30, { incluirMedicas: false });
        const vencidos = l.filter((v) => v.vencido).length;
        return { cantidad: l.length, detalle: `${vencidos} vencido(s)`, nivel: nivelPorCantidad(l.length, vencidos) };
      },
    });
    const resultados = await Promise.allSettled(definiciones.map((d) => d.cargar()));
    return definiciones.map((d, i) => {
      const r = resultados[i];
      return r.status === 'fulfilled'
        ? { clave: d.clave, titulo: d.titulo, enlace: d.enlace, error: null, ...r.value }
        : { clave: d.clave, titulo: d.titulo, enlace: d.enlace, cantidad: null, detalle: null, nivel: 'normal' as const, error: mensaje(r.reason) };
    });
  }
}
```

- [ ] **Step 8: Controlador y módulo**

```ts
import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { CentroMandoService } from './centro-mando.service';

/**
 * Accesible para cualquier usuario autenticado, como GET /seguridad/mi-inicio: el estado
 * del bombero, el permiso base de cada seccion y la matriz deciden que se devuelve.
 */
@ApiTags('centro-mando')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('centro-mando')
export class CentroMandoController {
  constructor(private readonly centro: CentroMandoService) {}

  @Get()
  panel(@CurrentUser() user: AuthenticatedUser) {
    return this.centro.panel(user);
  }

  @Get('acceso')
  async acceso(@CurrentUser() user: AuthenticatedUser) {
    const { acceso, motivo } = await this.centro.acceso(user);
    return { acceso, motivo };
  }
}
```

```ts
import { Module } from '@nestjs/common';
import { AlertasModule } from '../alertas/alertas.module';
import { ConfiguracionModule } from '../configuracion/configuracion.module';
import { ControlPersonalModule } from '../control-personal/control-personal.module';
import { DenunciasModule } from '../denuncias/denuncias.module';
import { DespachoModule } from '../despacho/despacho.module';
import { FlotaModule } from '../flota/flota.module';
import { ReservasModule } from '../reservas/reservas.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { SistemaModule } from '../sistema/sistema.module';
import { CentroMandoController } from './centro-mando.controller';
import { CentroMandoService } from './centro-mando.service';

@Module({
  imports: [SeguridadModule, ConfiguracionModule, DespachoModule, AlertasModule, FlotaModule, DenunciasModule, ReservasModule, ControlPersonalModule, SistemaModule],
  controllers: [CentroMandoController],
  providers: [CentroMandoService],
})
export class CentroMandoModule {}
```

En `app.module.ts`: importar `CentroMandoModule` y agregarlo al final de `imports`.

- [ ] **Step 9: Pruebas, compilación y arranque**

Run: `cd backend; npx jest src/modules/centro-mando src/modules/despacho src/modules/configuracion`
Expected: PASS salvo las 2 fallas previas de `despacho.spec.ts`.
Run: `cd backend; npm run build` y reiniciar; `logs\backend-err.log` sin errores de dependencias.
Con `admin`: `GET /api/v1/centro-mando` → 200, `acceso: 'PERMITIDO'`, secciones según sus permisos; `GET /api/v1/centro-mando/acceso` → `{ acceso: true, motivo: null }`.

- [ ] **Step 10: Commit**

```bash
git add backend/src/modules/centro-mando backend/src/modules/configuracion backend/src/modules/despacho/servicio-activo.service.ts backend/src/modules/seguridad/seguridad.module.ts backend/src/modules/flota/flota.module.ts backend/src/modules/denuncias/denuncias.module.ts backend/src/modules/reservas/reservas.module.ts backend/src/app.module.ts
git commit -m "Centro de mando: acceso por estado del bombero, emergencias por participación y secciones en vivo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 12: Frontend base — actualización automática, estilos del panel e íconos

**Files:**
- Create: `frontend/src/lib/actualizacion.ts` (lógica pura: espera con reintento, "hace cuánto")
- Create: `frontend/src/app/components/useActualizacionPeriodica.tsx` (hook + `<MarcaActualizacion>`)
- Modify: `frontend/src/lib/modulos.ts:1` (íconos `radar` y `server` en `IconoModulo`)
- Modify: `frontend/src/app/components/SystemIcon.tsx` (dibujos de esos dos íconos)
- Modify: `frontend/src/lib/configuracion.ts:3` y `frontend/src/app/dashboard/seguridad/configuracion/page.tsx` (control para `tipo: 'lista'`)
- Modify: `frontend/src/app/globals.css` (clases del Centro de mando y del área Sistema)
- Test: `frontend/scripts/pruebas/actualizacion.test.mjs`

**Interfaces:**
- Produces:
  - `siguienteEspera(baseMs: number, fallosSeguidos: number): number` (10 s → 20 → 40 → tope 60 s), `haceCuanto(desde: Date | null, ahora: Date): string`, `INTENTO_MAXIMO_MS`.
  - `useActualizacionPeriodica(cargar: () => Promise<void>, intervaloMs: number, activo?: boolean): EstadoActualizacion` con `EstadoActualizacion = { actualizadoEn: Date | null; error: string | null; cargando: boolean; refrescar: () => void }`. `cargar` debe **lanzar** si falla.
  - `<MarcaActualizacion {...estado} />`.
  - Clases CSS: `.cm-cabecera`, `.marca-actualizacion`, `.punto-vivo(.caido)`, `.cm-grid`, `.cm-panel`, `.cm-panel-ancho`, `.cm-cifras`, `.cm-cifra`, `.cm-lista`, `.cm-vacio`, `.cm-acciones`, `.semaforo`, `.semaforo-normal|atencion|critico`, `.qr-grid`, `.qr-tarjeta`, `.registro-visor`, `.registro-linea.error|.warn`, `.config-lista`.

- [ ] **Step 1: Prueba que falla**

`frontend/scripts/pruebas/actualizacion.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { haceCuanto, siguienteEspera } from '../../src/lib/actualizacion.ts';

test('sin fallos espera el intervalo; con fallos duplica hasta 60 s', () => {
  assert.equal(siguienteEspera(10_000, 0), 10_000);
  assert.equal(siguienteEspera(10_000, 1), 20_000);
  assert.equal(siguienteEspera(10_000, 2), 40_000);
  assert.equal(siguienteEspera(10_000, 3), 60_000);
  assert.equal(siguienteEspera(10_000, 9), 60_000);
});

test('hace cuánto, en palabras', () => {
  const ahora = new Date('2026-10-09T12:00:00Z');
  assert.equal(haceCuanto(null, ahora), 'nunca');
  assert.equal(haceCuanto(new Date('2026-10-09T11:59:58Z'), ahora), 'recién');
  assert.equal(haceCuanto(new Date('2026-10-09T11:59:30Z'), ahora), 'hace 30 s');
  assert.equal(haceCuanto(new Date('2026-10-09T11:55:00Z'), ahora), 'hace 5 min');
  assert.equal(haceCuanto(new Date('2026-10-09T09:00:00Z'), ahora), 'hace 3 h');
});
```

- [ ] **Step 2: Correrla**

Run: `cd frontend; node --test scripts/pruebas/actualizacion.test.mjs`
Expected: FAIL.

- [ ] **Step 3: `frontend/src/lib/actualizacion.ts`**

```ts
/** Consulta periodica de las pantallas en vivo (spec 2026-10-09 §5.6). Logica pura. */

export const INTENTO_MAXIMO_MS = 60_000;

/** Tras cada falla seguida se espera el doble, hasta un minuto. */
export function siguienteEspera(baseMs: number, fallosSeguidos: number): number {
  if (fallosSeguidos <= 0) return baseMs;
  return Math.min(baseMs * 2 ** fallosSeguidos, INTENTO_MAXIMO_MS);
}

export function haceCuanto(desde: Date | null, ahora: Date): string {
  if (!desde) return 'nunca';
  const s = Math.max(0, Math.round((ahora.getTime() - desde.getTime()) / 1000));
  if (s < 5) return 'recién';
  if (s < 60) return `hace ${s} s`;
  const m = Math.round(s / 60);
  if (m < 60) return `hace ${m} min`;
  return `hace ${Math.round(m / 60)} h`;
}
```

- [ ] **Step 4: Correr la prueba**

Run: `cd frontend; node --test scripts/pruebas/`
Expected: PASS.

- [ ] **Step 5: `frontend/src/app/components/useActualizacionPeriodica.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { haceCuanto, siguienteEspera } from '@/lib/actualizacion';

export interface EstadoActualizacion {
  actualizadoEn: Date | null;
  error: string | null;
  cargando: boolean;
  refrescar: () => void;
}

/**
 * Llama a `cargar` cada `intervaloMs` mientras la pestana esta visible; al volver a
 * verla consulta enseguida. Si falla, conserva lo ultimo cargado y reintenta con
 * espera creciente. `cargar` debe lanzar un Error con el mensaje para la persona.
 */
export function useActualizacionPeriodica(cargar: () => Promise<void>, intervaloMs: number, activo = true): EstadoActualizacion {
  const [actualizadoEn, setActualizadoEn] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [cargando, setCargando] = useState(false);
  const fallos = useRef(0);
  const reloj = useRef<number | null>(null);
  const montado = useRef(true);
  const cargarRef = useRef(cargar);
  cargarRef.current = cargar;

  const detener = () => {
    if (reloj.current !== null) window.clearTimeout(reloj.current);
    reloj.current = null;
  };

  const ciclo = useCallback(async () => {
    detener();
    setCargando(true);
    try {
      await cargarRef.current();
      fallos.current = 0;
      setError(null);
      setActualizadoEn(new Date());
    } catch (e) {
      fallos.current += 1;
      setError(e instanceof Error ? e.message : 'No se pudo actualizar.');
    } finally {
      setCargando(false);
      if (montado.current && activo && document.visibilityState === 'visible') {
        reloj.current = window.setTimeout(() => void ciclo(), siguienteEspera(intervaloMs, fallos.current));
      }
    }
  }, [intervaloMs, activo]);

  useEffect(() => {
    montado.current = true;
    if (!activo) return () => { montado.current = false; };
    void ciclo();
    const alCambiarVisibilidad = () => {
      if (document.visibilityState === 'visible') void ciclo();
      else detener();
    };
    document.addEventListener('visibilitychange', alCambiarVisibilidad);
    return () => {
      montado.current = false;
      document.removeEventListener('visibilitychange', alCambiarVisibilidad);
      detener();
    };
  }, [ciclo, activo]);

  return { actualizadoEn, error, cargando, refrescar: () => void ciclo() };
}

/** "Actualizado hace N s", con el boton para actualizar ya y el aviso si se perdio la conexion. */
export function MarcaActualizacion({ actualizadoEn, error, cargando, refrescar }: EstadoActualizacion) {
  const [ahora, setAhora] = useState(() => new Date());
  useEffect(() => {
    const t = window.setInterval(() => setAhora(new Date()), 5000);
    return () => window.clearInterval(t);
  }, []);
  return (
    <div className="marca-actualizacion">
      <span className={`punto-vivo${error ? ' caido' : ''}`} aria-hidden="true" />
      {error
        ? <span role="status">Sin conexión con el servidor · último dato {haceCuanto(actualizadoEn, ahora)}</span>
        : <span>Actualizado {haceCuanto(actualizadoEn, ahora)}</span>}
      <button type="button" className="service-secondary" onClick={refrescar} disabled={cargando}>{cargando ? 'Actualizando…' : 'Actualizar'}</button>
    </div>
  );
}
```

- [ ] **Step 6: Íconos**

En `frontend/src/lib/modulos.ts` línea 1, sumar `| 'radar' | 'server'` al final del tipo `IconoModulo`. En `SystemIcon.tsx`, dentro de `paths`:

```tsx
  radar: <><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><path d="M12 12 18.4 5.6"/><circle cx="12" cy="12" r="1"/></>,
  server: <><rect x="4" y="4" width="16" height="6.5" rx="1.5"/><rect x="4" y="13.5" width="16" height="6.5" rx="1.5"/><path d="M8 7.25h.01M8 16.75h.01M12 7.25h4M12 16.75h4"/></>,
```

- [ ] **Step 7: Control para listas en Seguridad › Configuración**

En `frontend/src/lib/configuracion.ts`, el campo `tipo:string` de `ConfigDefinition` ya admite `'lista'` (es `string`): no hace falta cambiar el tipo; verificarlo. En `seguridad/configuracion/page.tsx`, dentro de `AdminField`, el `div.config-control` hoy elige el control con una cadena de ternarios que empieza en `def.tipo==='booleano'?…`. Agregar como **primer** caso:

```tsx
def.tipo==='lista'?<fieldset className="config-lista"><legend className="sr-only">{def.nombre}</legend>{(def.allowed??[]).map(x=>{const id=`${def.key}-${String(x)}`;const lista=Array.isArray(value)?value as unknown[]:[];return <label key={String(x)} htmlFor={id}><input id={id} type="checkbox" checked={lista.includes(x)} onChange={e=>onChange(e.target.checked?[...lista,x]:lista.filter(y=>y!==x))}/>{String(x)}</label>})}</fieldset>:
```

(queda `def.tipo==='lista'?…:def.tipo==='booleano'?…`). En el pie, `Predeterminado: <code>{String(def.defaultValue)}</code>` ya muestra `ACTIVO` para el arreglo.

- [ ] **Step 8: Estilos (al final de `frontend/src/app/globals.css`; solo tokens)**

```css
/* Centro de mando y área Sistema (spec 2026-10-09). .card fuerza su padding con !important:
   los paneles densos usan clases propias. */
.cm-cabecera { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 10px; }
.cm-cabecera p { color: var(--muted); font-size: 13px; }
.marca-actualizacion { display: flex; align-items: center; gap: 8px; color: var(--muted); font-size: 12px; }
.punto-vivo { width: 8px; height: 8px; border-radius: 50%; background: var(--success); box-shadow: 0 0 0 3px var(--ok-fill); }
.punto-vivo.caido { background: var(--danger); box-shadow: 0 0 0 3px var(--bad-fill); }
.cm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 14px; align-items: start; }
.cm-panel { display: grid; gap: 10px; align-content: start; padding: 16px; background: var(--surface); border: 1px solid var(--line); border-radius: 14px; box-shadow: var(--shadow); }
.cm-panel > h2 { display: flex; justify-content: space-between; align-items: center; gap: 8px; font-size: 15px; }
.cm-panel-ancho { grid-column: 1 / -1; }
.cm-cifras { display: grid; grid-template-columns: repeat(auto-fit, minmax(92px, 1fr)); gap: 8px; }
.cm-cifra { padding: 10px; border-radius: 10px; background: var(--surface-soft); }
.cm-cifra strong { display: block; color: var(--ink); font: 700 22px 'Space Mono', monospace; }
.cm-cifra span { color: var(--muted); font-size: 11px; }
.cm-lista { list-style: none; display: grid; }
.cm-lista > li { display: flex; justify-content: space-between; align-items: flex-start; gap: 8px; padding: 8px 0; border-top: 1px solid var(--line-soft); font-size: 13px; }
.cm-lista small { display: block; color: var(--muted); }
.cm-vacio { color: var(--muted); font-size: 13px; }
.cm-acciones { display: flex; flex-wrap: wrap; gap: 6px; }
.semaforo { display: inline-flex; align-items: center; gap: 6px; padding: 4px 10px; color: var(--ink); border-radius: 999px; font-size: 12px; font-weight: 700; }
.semaforo-normal { background: var(--ok-fill); }
.semaforo-atencion { background: var(--warn-fill); }
.semaforo-critico { background: var(--bad-fill); }
.qr-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(230px, 1fr)); gap: 14px; }
.qr-tarjeta { display: grid; gap: 8px; justify-items: center; padding: 14px; text-align: center; background: var(--surface); border: 1px solid var(--line); border-radius: 12px; }
.qr-tarjeta code { font-size: 11px; word-break: break-all; }
.registro-visor { max-height: 60vh; overflow: auto; padding: 10px 12px; color: var(--ink); background: var(--surface-soft); border: 1px solid var(--line); border-radius: 10px; font: 12px/1.55 'Space Mono', monospace; white-space: pre-wrap; word-break: break-word; }
.registro-linea.error { color: var(--danger); font-weight: 700; }
.registro-linea.warn { color: var(--warning); }
.config-lista { display: flex; flex-wrap: wrap; gap: 8px 16px; border: 0; }
.config-lista label { display: inline-flex; align-items: center; gap: 6px; }
```

- [ ] **Step 9: Verificar**

Run: `cd frontend; node --test scripts/pruebas/; npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y`
Expected: verde.

- [ ] **Step 10: Commit**

```bash
git add frontend/src/lib/actualizacion.ts frontend/src/app/components/useActualizacionPeriodica.tsx frontend/src/lib/modulos.ts frontend/src/app/components/SystemIcon.tsx frontend/src/app/dashboard/seguridad/configuracion/page.tsx frontend/src/app/globals.css frontend/scripts/pruebas/actualizacion.test.mjs
git commit -m "Web: actualización periódica con reintento, estilos del Centro de mando y control de listas en Configuración

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 13: Centro de mando — pantalla, ítem del menú y acceso desde el Inicio

**Files:**
- Modify: `frontend/src/lib/modulos.ts` (entrada `centro-mando`, primera de Operaciones)
- Create: `frontend/src/app/dashboard/centro-mando/tipos.ts`
- Create: `frontend/src/app/dashboard/centro-mando/paneles.tsx`
- Create: `frontend/src/app/dashboard/centro-mando/page.tsx`
- Modify (reemplazar): `frontend/src/app/dashboard/page.tsx` (estado real, acceso al Centro de mando, tarjetas según la matriz)
- Modify: `frontend/src/app/globals.css` (accesos rápidos)
- Modify: `frontend/src/app/components/PermisosPantallaProvider.tsx` (hook `useRutasVisibles`)
- Generated: `frontend/src/lib/pantallas.generado.ts`, `backend/src/modules/pantallas/catalogo-web.generado.ts`

**Interfaces:**
- Consumes: `GET /centro-mando` (Task 11), `PATCH /alertas/:id/estado` (existente, `servicios:editar`), `GET /salud` (público), `GET /sistema/resumen` (Task 10), `useActualizacionPeriodica`/`MarcaActualizacion` (Task 12), `usePermisosPantalla`/`usePuede` (Task 7), `pantallasVisibles`/`moduloVisibleEnMenu` (Task 7).
- Produces: pantalla `/dashboard/centro-mando` (código `0xC001`).

- [ ] **Step 1: Entrada del menú**

En `frontend/src/lib/modulos.ts`, primera línea de `MODULOS`:

```ts
  { slug: 'centro-mando', nombre: 'Centro de mando', icono: 'radar', permisoPrefijo: '', disponible: true, grupo: 'operaciones', descripcion: 'Lo que está pasando ahora y lo que te toca, según tu rol.' },
```

(`permisoPrefijo: ''`: lo ve cualquiera con algún permiso; la matriz y el estado del bombero lo ocultan cuando corresponde — ver `moduloVisibleEnMenu` y el layout de Task 7.)

- [ ] **Step 2: `frontend/src/app/dashboard/centro-mando/tipos.ts`**

```ts
/** Forma de GET /centro-mando (backend: CentroMandoService.panel). */
export type Seccion<T> = { estado: 'ok'; datos: T } | { estado: 'error'; error: string };

export interface Emergencia {
  id: string; numeroServicio: string; tipo: string; estado: string; gravedad: string | null;
  fechaHoraAviso: string; personal: number; enCamino: number; moviles: number; direccion: string | null;
}
export interface Alerta { id: string; tipo: string; solicitanteNombre: string; detalle: string | null; creadoEn: string }
export interface MovilResumen { id: string; numeroInterno: string; alias: string | null; tipo: string }
export interface Moviles {
  total: number;
  disponibles: MovilResumen[];
  enServicio: Array<MovilResumen & { estadoOperativo: string }>;
  noOperativos: Array<MovilResumen & { estado: string }>;
}
export interface PersonalDisponible { alLlamado: number; enBase: number; enCamino: number; enServicio: number; noDisponible: number; total: number }
export interface GuardiaVigente {
  guardiasVigentes: number;
  personal: Array<{ guardiaId: string; bomberoId: string; nombre: string; numeroBombero: string | null; rol: string | null; tipoParticipacion: string; ausente: boolean }>;
}
export interface Convocatoria { id: string; mensaje: string; voy: number; noPuedo: number; menorEtaMinutos: number | null }
export interface MiActividad {
  tienePerfilBombero: boolean;
  proximasGuardias: Array<{ id: string; fecha: string; horaInicio: string; horaFin: string; turno: string; estado: string; rol: string | null }>;
  ultimosServicios: Array<{ id: string; numeroServicio: string; fechaHoraAviso: string; estado: string; tipo: string | null; rol: string | null }>;
}
export interface Pendiente {
  clave: string; titulo: string; cantidad: number | null; detalle: string | null; enlace: string;
  nivel: 'normal' | 'atencion' | 'critico'; error: string | null;
}
export interface ResumenSistema { nivel: 'normal' | 'atencion' | 'critico'; alertas: Array<{ nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }> }

export interface PanelCentroMando {
  generadoEn: string;
  acceso: 'PERMITIDO' | 'SIN_ACCESO';
  motivo: string | null;
  secciones: Partial<{
    accesos: Seccion<null>;
    emergencias: Seccion<{ supervisor: boolean; servicios: Emergencia[] }>;
    alertas: Seccion<Alerta[]>;
    moviles: Seccion<Moviles>;
    personal: Seccion<PersonalDisponible>;
    guardia: Seccion<GuardiaVigente>;
    convocatorias: Seccion<Convocatoria[]>;
    mi_actividad: Seccion<MiActividad>;
    pendientes: Seccion<Pendiente[]>;
    sistema: Seccion<ResumenSistema>;
  }>;
}

export const ETIQUETA_NIVEL: Record<ResumenSistema['nivel'], string> = { normal: 'Normal', atencion: 'Requiere atención', critico: 'Crítico' };
```

- [ ] **Step 3: `frontend/src/app/dashboard/centro-mando/paneles.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { haceCuanto } from '@/lib/actualizacion';
import { MODULOS } from '@/lib/modulos';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { MatrizWeb, pantallasVisibles } from '@/lib/permisos-pantalla';
import { coincideBusqueda } from '@/lib/texto';
import { Aviso } from '@/app/components/Aviso';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import {
  Alerta, Convocatoria, Emergencia, ETIQUETA_NIVEL, GuardiaVigente, MiActividad, Moviles, Pendiente, PersonalDisponible, ResumenSistema, Seccion,
} from './tipos';

const GRAVEDAD: Record<string, { texto: string; fondo: string }> = {
  LEVE: { texto: 'Baja', fondo: 'var(--info-fill)' },
  MODERADA: { texto: 'Media', fondo: 'var(--warn-fill)' },
  GRAVE: { texto: 'Alta', fondo: 'var(--bad-fill)' },
  CRITICA: { texto: 'Crítica', fondo: 'var(--bad-fill)' },
};
const FONDO_NIVEL = { normal: 'var(--ok-fill)', atencion: 'var(--warn-fill)', critico: 'var(--bad-fill)' } as const;

function Marco({ id, titulo, extra, ancho, children }: { id: string; titulo: string; extra?: React.ReactNode; ancho?: boolean; children: React.ReactNode }) {
  return (
    <section className={`cm-panel${ancho ? ' cm-panel-ancho' : ''}`} aria-labelledby={`cm-${id}`}>
      <h2 id={`cm-${id}`}><span>{titulo}</span>{extra}</h2>
      {children}
    </section>
  );
}

function Contenido<T>({ seccion, children }: { seccion: Seccion<T>; children: (datos: T) => React.ReactNode }) {
  if (seccion.estado === 'error') return <Aviso tipo="error" texto={`No se pudo cargar: ${seccion.error}`} fontSize={12} />;
  return <>{children(seccion.datos)}</>;
}

/** Enlace a una pantalla solo si la persona puede abrirla (sin enlaces que terminen en "Sin acceso"). */
function EnlaceSiVisible({ ruta, texto, visibles }: { ruta: string; texto: string; visibles: Set<string> }) {
  return visibles.has(ruta) ? <Link href={ruta} style={{ fontSize: 12 }}>{texto}</Link> : null;
}

export function PanelEmergencias({ seccion, visibles }: { seccion: Seccion<{ supervisor: boolean; servicios: Emergencia[] }>; visibles: Set<string> }) {
  const supervisor = seccion.estado === 'ok' && seccion.datos.supervisor;
  return (
    <Marco id="emergencias" titulo="Emergencias en curso" ancho extra={supervisor ? <span className="badge" style={{ background: 'var(--info-fill)' }}>Supervisión: todas</span> : undefined}>
      <Contenido seccion={seccion}>{({ servicios }) => servicios.length === 0
        ? <p className="cm-vacio">{supervisor ? 'No hay emergencias en curso.' : 'No integrás ninguna emergencia en curso.'}</p>
        : <ul className="cm-lista">{servicios.map((s) => {
          const g = s.gravedad ? GRAVEDAD[s.gravedad] : null;
          return <li key={s.id}>
            <span>
              <strong>{s.numeroServicio} · {s.tipo}</strong>
              <small>{s.estado} · aviso {haceCuanto(new Date(s.fechaHoraAviso), new Date())}{s.direccion ? ` · ${s.direccion}` : ''}</small>
              <small>{s.personal} en el servicio · {s.enCamino} en camino · {s.moviles} móvil(es)</small>
            </span>
            {g && <span className="badge" style={{ background: g.fondo }}>{g.texto}</span>}
          </li>;
        })}</ul>}
      </Contenido>
      <EnlaceSiVisible ruta="/dashboard/servicios" texto="Abrir Servicios" visibles={visibles} />
    </Marco>
  );
}

export function PanelAlertas({ seccion, puedeAtender, alCambiar }: { seccion: Seccion<Alerta[]>; puedeAtender: boolean; alCambiar: () => void }) {
  const confirmar = useConfirmacion();
  const pedirMotivo = useEntradaConfirmada();
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [ocupada, setOcupada] = useState<string | null>(null);

  async function cambiar(a: Alerta, estado: 'ATENDIDA' | 'CANCELADA') {
    let motivo: string | undefined;
    if (estado === 'ATENDIDA') {
      const ok = await confirmar({ titulo: 'Marcar alerta atendida', mensaje: `${a.tipo} de ${a.solicitanteNombre}. Queda registrado quién la atendió.`, confirmar: 'Marcar atendida' });
      if (!ok) return;
    } else {
      const m = await pedirMotivo({ titulo: 'Cancelar alerta', mensaje: `${a.tipo} de ${a.solicitanteNombre}.`, etiqueta: 'Motivo', requerida: true, confirmar: 'Cancelar alerta', peligro: true });
      if (m === null) return;
      motivo = m;
    }
    setOcupada(a.id); setError(''); setExito('');
    try {
      const res = await apiFetch(`/alertas/${a.id}/estado`, { method: 'PATCH', body: JSON.stringify({ estado, ...(motivo ? { motivo } : {}) }) });
      const cuerpo = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(cuerpo.message ?? 'No se pudo cambiar la alerta.');
      setExito(estado === 'ATENDIDA' ? 'Alerta marcada como atendida.' : 'Alerta cancelada.');
      alCambiar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo cambiar la alerta.'); }
    finally { setOcupada(null); }
  }

  return (
    <Marco id="alertas" titulo="Alertas activas">
      {error && <Aviso tipo="error" texto={error} fontSize={12} />}
      {exito && <Aviso tipo="exito" texto={exito} fontSize={12} />}
      <Contenido seccion={seccion}>{(alertas) => alertas.length === 0
        ? <p className="cm-vacio">No hay alertas pendientes.</p>
        : <ul className="cm-lista">{alertas.map((a) => <li key={a.id}>
          <span>
            <strong>{a.tipo === 'SOLICITUD_CHOFER' ? 'Pide chofer' : 'Pide apoyo'} · {a.solicitanteNombre}</strong>
            <small>{haceCuanto(new Date(a.creadoEn), new Date())}{a.detalle ? ` · ${a.detalle}` : ''}</small>
          </span>
          {puedeAtender && <span className="cm-acciones">
            <button type="button" className="btn-primary" disabled={ocupada === a.id} onClick={() => void cambiar(a, 'ATENDIDA')}>Atendida</button>
            <button type="button" className="service-secondary" disabled={ocupada === a.id} onClick={() => void cambiar(a, 'CANCELADA')}>Cancelar</button>
          </span>}
        </li>)}</ul>}
      </Contenido>
    </Marco>
  );
}

export function PanelMoviles({ seccion, visibles }: { seccion: Seccion<Moviles>; visibles: Set<string> }) {
  return (
    <Marco id="moviles" titulo="Móviles">
      <Contenido seccion={seccion}>{(m) => <>
        <div className="cm-cifras">
          <div className="cm-cifra"><strong>{m.disponibles.length}</strong><span>Disponibles</span></div>
          <div className="cm-cifra"><strong>{m.enServicio.length}</strong><span>En servicio</span></div>
          <div className="cm-cifra"><strong>{m.noOperativos.length}</strong><span>Fuera de servicio</span></div>
        </div>
        {m.enServicio.length > 0 && <ul className="cm-lista">{m.enServicio.map((v) => <li key={v.id}><span>{v.numeroInterno}{v.alias ? ` · ${v.alias}` : ''}</span><span className="badge" style={{ background: 'var(--info-fill)' }}>{v.estadoOperativo}</span></li>)}</ul>}
      </>}</Contenido>
      <EnlaceSiVisible ruta="/dashboard/vehiculos/flota" texto="Abrir Flota en vivo" visibles={visibles} />
    </Marco>
  );
}

export function PanelPersonal({ seccion }: { seccion: Seccion<PersonalDisponible> }) {
  return (
    <Marco id="personal" titulo="Personal disponible">
      <Contenido seccion={seccion}>{(p) => <div className="cm-cifras">
        <div className="cm-cifra"><strong>{p.alLlamado + p.enBase}</strong><span>Disponibles</span></div>
        <div className="cm-cifra"><strong>{p.enCamino}</strong><span>En camino</span></div>
        <div className="cm-cifra"><strong>{p.enServicio}</strong><span>En servicio</span></div>
        <div className="cm-cifra"><strong>{p.noDisponible}</strong><span>No disponibles</span></div>
      </div>}</Contenido>
    </Marco>
  );
}

export function PanelGuardia({ seccion, visibles }: { seccion: Seccion<GuardiaVigente>; visibles: Set<string> }) {
  return (
    <Marco id="guardia" titulo="Guardia de turno">
      <Contenido seccion={seccion}>{(g) => g.guardiasVigentes === 0
        ? <p className="cm-vacio">No hay ninguna guardia vigente en este momento.</p>
        : <ul className="cm-lista">{g.personal.map((p) => <li key={`${p.guardiaId}-${p.bomberoId}`}>
          <span>{p.nombre}<small>{p.rol ?? p.tipoParticipacion}{p.numeroBombero ? ` · N.º ${p.numeroBombero}` : ''}</small></span>
          {p.ausente && <span className="badge" style={{ background: 'var(--warn-fill)' }}>Ausente</span>}
        </li>)}</ul>}
      </Contenido>
      <EnlaceSiVisible ruta="/dashboard/guardias" texto="Abrir Guardias" visibles={visibles} />
    </Marco>
  );
}

export function PanelConvocatorias({ seccion, visibles }: { seccion: Seccion<Convocatoria[]>; visibles: Set<string> }) {
  return (
    <Marco id="convocatorias" titulo="Convocatorias abiertas">
      <Contenido seccion={seccion}>{(c) => c.length === 0
        ? <p className="cm-vacio">No hay convocatorias abiertas.</p>
        : <ul className="cm-lista">{c.map((x) => <li key={x.id}>
          <span>{x.mensaje}<small>{x.voy} van · {x.noPuedo} no pueden{x.menorEtaMinutos !== null ? ` · el primero llega en ${x.menorEtaMinutos} min` : ''}</small></span>
        </li>)}</ul>}
      </Contenido>
      <EnlaceSiVisible ruta="/dashboard/servicios/convocatorias" texto="Abrir Convocatorias" visibles={visibles} />
    </Marco>
  );
}

export function PanelPendientes({ seccion }: { seccion: Seccion<Pendiente[]> }) {
  return (
    <Marco id="pendientes" titulo="Pendientes de mi función">
      <Contenido seccion={seccion}>{(items) => <ul className="cm-lista">{items.map((p) => <li key={p.clave}>
        <span>
          <strong>{p.titulo}</strong>
          <small>{p.error ? `No se pudo consultar: ${p.error}` : p.detalle ?? ''}</small>
        </span>
        <span className="cm-acciones">
          {p.cantidad !== null && <span className="badge" style={{ background: FONDO_NIVEL[p.nivel] }}>{p.cantidad}</span>}
          <Link href={p.enlace} style={{ fontSize: 12 }}>Abrir</Link>
        </span>
      </li>)}</ul>}</Contenido>
    </Marco>
  );
}

export function PanelMiActividad({ seccion }: { seccion: Seccion<MiActividad> }) {
  const fecha = (f: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short' }).format(new Date(`${f}T12:00:00`));
  return (
    <Marco id="mi-actividad" titulo="Mi actividad">
      <Contenido seccion={seccion}>{(m) => !m.tienePerfilBombero
        ? <p className="cm-vacio">Tu usuario no está vinculado a una ficha de bombero.</p>
        : <ul className="cm-lista">
          {m.proximasGuardias.slice(0, 3).map((g) => <li key={g.id}><span>Guardia {fecha(g.fecha)}<small>{g.horaInicio.slice(0, 5)}–{g.horaFin.slice(0, 5)} · {g.turno}</small></span><span className="badge">{g.rol ?? g.estado}</span></li>)}
          {m.ultimosServicios.slice(0, 3).map((s) => <li key={s.id}><span>{s.numeroServicio}<small>{s.tipo ?? 'Servicio'} · {haceCuanto(new Date(s.fechaHoraAviso), new Date())}</small></span><span className="badge">{s.rol ?? s.estado}</span></li>)}
          {m.proximasGuardias.length === 0 && m.ultimosServicios.length === 0 && <li><span className="cm-vacio">Sin guardias próximas ni servicios recientes.</span></li>}
        </ul>}
      </Contenido>
    </Marco>
  );
}

export function PanelSistema({ seccion }: { seccion: Seccion<ResumenSistema> }) {
  return (
    <Marco id="sistema" titulo="Estado del sistema">
      <Contenido seccion={seccion}>{(r) => <>
        <span className={`semaforo semaforo-${r.nivel}`}>{ETIQUETA_NIVEL[r.nivel]}</span>
        {r.alertas.length === 0
          ? <p className="cm-vacio">Sin alertas.</p>
          : <ul className="cm-lista">{r.alertas.slice(0, 4).map((a, i) => <li key={i}><span>{a.mensaje}</span></li>)}</ul>}
      </>}</Contenido>
      <Link href="/dashboard/sistema" style={{ fontSize: 12 }}>Abrir el área Sistema</Link>
    </Marco>
  );
}

export function PanelAccesos({ permisos, matriz }: { permisos: string[]; matriz: MatrizWeb | null }) {
  const [busqueda, setBusqueda] = useState('');
  const grupos = useMemo(() => {
    const visibles = pantallasVisibles(PANTALLAS, permisos, matriz, MODULOS).filter((p) => p.modulo !== 'inicio' && p.ruta !== '/dashboard/centro-mando');
    const nombre = (slug: string) => MODULOS.find((m) => m.slug === slug)?.nombre ?? slug;
    const filtradas = busqueda.trim() ? visibles.filter((p) => coincideBusqueda(p.nombre, busqueda) || coincideBusqueda(nombre(p.modulo), busqueda)) : visibles;
    return MODULOS.map((m) => ({ slug: m.slug, nombre: m.nombre, pantallas: filtradas.filter((p) => p.modulo === m.slug) })).filter((g) => g.pantallas.length > 0);
  }, [permisos, matriz, busqueda]);

  return (
    <Marco id="accesos" titulo="Accesos rápidos" ancho>
      <label htmlFor="cm-buscar" className="sr-only">Buscar una pantalla</label>
      <input id="cm-buscar" className="input-field" placeholder="Buscar una pantalla…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
      {grupos.length === 0 && <p className="cm-vacio">Ninguna pantalla coincide con «{busqueda}».</p>}
      <div className="cm-accesos">
        {grupos.map((g) => <div key={g.slug}>
          <h3 className="grupo-titulo">{g.nombre}</h3>
          <div className="cm-acciones">{g.pantallas.map((p) => <Link key={p.ruta} href={p.ruta} className="cm-acceso">{p.nombre}</Link>)}</div>
        </div>)}
      </div>
    </Marco>
  );
}
```

- [ ] **Step 3b: Hook compartido `useRutasVisibles` (al final de `PermisosPantallaProvider.tsx`)**

Lo usan el Centro de mando y el área Sistema para ofrecer solo enlaces a pantallas que la persona puede abrir. Sumar a los imports del archivo `useEffect`, `useState` (de `react`), `obtenerSesion` (de `@/lib/api`), `MODULOS` (de `@/lib/modulos`) y `pantallasVisibles` (de `@/lib/permisos-pantalla`), y agregar:

```tsx
/** Rutas que la persona puede abrir: para no ofrecer enlaces que terminen en "Sin acceso". */
export function useRutasVisibles(): Set<string> {
  const { matriz } = usePermisosPantalla();
  const [permisos, setPermisos] = useState<string[]>([]);
  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);
  return useMemo(() => new Set(pantallasVisibles(PANTALLAS, permisos, matriz, MODULOS).map((p) => p.ruta)), [permisos, matriz]);
}
```

- [ ] **Step 4: `frontend/src/app/dashboard/centro-mando/page.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { usePermisosPantalla, usePuede, useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import {
  PanelAccesos, PanelAlertas, PanelConvocatorias, PanelEmergencias, PanelGuardia, PanelMiActividad, PanelMoviles, PanelPendientes, PanelPersonal, PanelSistema,
} from './paneles';
import { PanelCentroMando } from './tipos';

const INTERVALO_MS = 10_000;

/**
 * Centro de mando (spec 2026-10-09 §5): lo que pasa ahora y lo que le toca a cada uno.
 * El backend decide que secciones vienen (estado del bombero, permiso de cada seccion y
 * reglas por pantalla); aca solo se dibujan las que llegaron.
 */
export default function CentroMandoPage() {
  const { matriz } = usePermisosPantalla();
  const puede = usePuede();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [panel, setPanel] = useState<PanelCentroMando | null>(null);

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const res = await apiFetch('/centro-mando');
    if (!res.ok) {
      const cuerpo = await res.json().catch(() => ({}));
      throw new Error(cuerpo.message ?? 'No se pudo cargar el Centro de mando.');
    }
    setPanel(await res.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, INTERVALO_MS);
  const visibles = useRutasVisibles();

  if (!panel) {
    return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Cargando el Centro de mando…" filas={4} />;
  }
  if (panel.acceso === 'SIN_ACCESO') {
    return <section className="card" role="status" style={{ maxWidth: 640 }}>
      <h2 style={{ fontSize: 18, marginBottom: 8 }}>Centro de mando</h2>
      <p style={{ color: 'var(--muted)' }}>{panel.motivo}</p>
    </section>;
  }

  const s = panel.secciones;
  const nada = Object.keys(s).length === 0;
  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera">
        <p>Lo que está pasando ahora y lo que te toca, según tu rol. Se actualiza solo.</p>
        <MarcaActualizacion {...actualizacion} />
      </div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {nada && <p className="cm-vacio">Tu rol no tiene secciones del Centro de mando habilitadas. Si necesitás alguna, pedíselo a quien administra la seguridad.</p>}
      <div className="cm-grid">
        {s.emergencias && <PanelEmergencias seccion={s.emergencias} visibles={visibles} />}
        {s.alertas && <PanelAlertas seccion={s.alertas} puedeAtender={permisos.includes('servicios:editar') && puede('editar')} alCambiar={actualizacion.refrescar} />}
        {s.pendientes && <PanelPendientes seccion={s.pendientes} />}
        {s.moviles && <PanelMoviles seccion={s.moviles} visibles={visibles} />}
        {s.personal && <PanelPersonal seccion={s.personal} />}
        {s.guardia && <PanelGuardia seccion={s.guardia} visibles={visibles} />}
        {s.convocatorias && <PanelConvocatorias seccion={s.convocatorias} visibles={visibles} />}
        {s.mi_actividad && <PanelMiActividad seccion={s.mi_actividad} />}
        {s.sistema && <PanelSistema seccion={s.sistema} />}
        {s.accesos && <PanelAccesos permisos={permisos} matriz={matriz} />}
      </div>
    </div>
  );
}
```

- [ ] **Step 5: Estilos de los accesos (al final de `globals.css`)**

```css
.cm-accesos { display: grid; gap: 12px; }
.cm-acceso { display: inline-block; padding: 5px 9px; color: var(--ink); background: var(--surface); border: 1px solid var(--line); border-radius: 7px; text-decoration: none; font-size: 12px; font-weight: 600; }
.cm-acceso:hover { background: var(--surface-soft); }
```

- [ ] **Step 6: Inicio con estado real y acceso al Centro de mando**

Reemplazar `frontend/src/app/dashboard/page.tsx` por:

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { apiFetch, obtenerSesion, Sesion } from '@/lib/api';
import { MODULOS, agruparModulos } from '@/lib/modulos';
import { PANTALLAS } from '@/lib/pantallas.generado';
import { decisionDeRuta, moduloVisibleEnMenu } from '@/lib/permisos-pantalla';
import { SystemIcon } from '@/app/components/SystemIcon';
import { Cargando } from '@/app/components/Cargando';
import { Aviso } from '@/app/components/Aviso';
import { usePermisosPantalla } from '@/app/components/PermisosPantallaProvider';
import { useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';

interface InicioBombero {
  tienePerfilBombero: boolean;
  proximasGuardias: Array<{ id: string; fecha: string; horaInicio: string; horaFin: string; turno: string; estado: string; rol: string | null }>;
  ultimosServicios: Array<{ id: string; numeroServicio: string; fechaHoraAviso: string; estado: string; tipo: string | null; rol: string | null; horasServicio: number | null }>;
}
interface ResumenSistema { nivel: 'normal' | 'atencion' | 'critico'; alertas: Array<{ nivel: string; mensaje: string }> }

const fechaCorta = (fecha: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric' }).format(new Date(`${fecha}T12:00:00`));
const fechaHoraCorta = (fecha: string) => new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(fecha));
const NIVEL: Record<ResumenSistema['nivel'], string> = { normal: 'Operativo', atencion: 'Requiere atención', critico: 'Crítico' };

/** Antes decia "Estado del sistema · Operativo" fijo en el codigo: ahora lo que realmente responde el servidor. */
function EstadoDelSistema({ permisos }: { permisos: string[] }) {
  const [salud, setSalud] = useState<'ok' | 'caido' | null>(null);
  const [resumen, setResumen] = useState<ResumenSistema | null>(null);
  const veSistema = permisos.includes('sistema:ver');
  const cargar = useCallback(async () => {
    const res = await apiFetch('/salud').catch(() => null);
    const cuerpo = res ? await res.json().catch(() => ({})) : {};
    const ok = !!res && res.ok && (cuerpo as { estado?: string }).estado === 'disponible';
    setSalud(ok ? 'ok' : 'caido');
    if (ok && veSistema) {
      const r = await apiFetch('/sistema/resumen');
      if (r.ok) setResumen(await r.json());
    }
    if (!ok) throw new Error('El servidor no responde.');
  }, [veSistema]);
  useActualizacionPeriodica(cargar, 30_000);
  const texto = salud === null ? 'comprobando…' : salud === 'caido' ? 'Sin respuesta del servidor' : resumen ? NIVEL[resumen.nivel] : 'Servidor operativo';
  return (
    <div className="hero-kicker" role="status">
      Estado del sistema · {texto}
      {resumen && resumen.alertas.length > 0 && <> · <Link href="/dashboard/sistema" style={{ color: 'inherit' }}>{resumen.alertas.length} aviso(s)</Link></>}
    </div>
  );
}

export default function InicioPage() {
  const { matriz, centroMando } = usePermisosPantalla();
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [ahora, setAhora] = useState<Date | null>(null);
  const [inicioBombero, setInicioBombero] = useState<InicioBombero | null>(null);
  const [errorInicio, setErrorInicio] = useState<string | null>(null);
  useEffect(() => {
    setSesion(obtenerSesion());
    setAhora(new Date());
    const reloj = window.setInterval(() => setAhora(new Date()), 30_000);
    apiFetch('/seguridad/mi-inicio')
      .then(async (res) => {
        if (!res.ok) throw new Error('No se pudo cargar tu resumen operativo.');
        setInicioBombero(await res.json());
      })
      .catch((error: Error) => setErrorInicio(error.message));
    return () => window.clearInterval(reloj);
  }, []);
  if (!sesion) return null;
  const permisos = sesion.usuario.permisos;
  const modulos = MODULOS.filter((m) => m.slug !== 'centro-mando' && moduloVisibleEnMenu(m, permisos, PANTALLAS, matriz));
  const centroVisible = centroMando?.acceso !== false && (decisionDeRuta('/dashboard/centro-mando', PANTALLAS, matriz)?.ver ?? true);
  const hora = ahora?.toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }) || '--:--';
  const fecha = ahora?.toLocaleDateString('es-PY', { weekday: 'long', day: '2-digit', month: 'long' }) || '';

  return <>
    {sesion.usuario.debeCambiarPassword && <section className="card" style={{ marginBottom: 18, borderLeft: '4px solid var(--warning)' }}>
      <strong>Acción requerida.</strong> Tu contraseña necesita actualizarse. <Link href="/dashboard/mi-perfil">Cambiar contraseña →</Link>
    </section>}
    <section className="dashboard-hero">
      <div>
        <EstadoDelSistema permisos={permisos} />
        <h2>Todo el cuerpo,<br />en un solo mapa.</h2>
        <p>Personal, unidades y recursos organizados para tomar decisiones con información clara y confiable.</p>
        {centroVisible && <p style={{ marginTop: 14 }}><Link href="/dashboard/centro-mando" className="btn-primary" style={{ display: 'inline-block', textDecoration: 'none' }}>Abrir el Centro de mando</Link></p>}
      </div>
      <div className="hero-stamp"><div className="hero-time">{hora}</div><div className="hero-date">{fecha}</div></div>
    </section>
    <section className="card" style={{ marginTop: 18 }}>
      <div className="section-heading" style={{ margin: 0, marginBottom: 14 }}><h2>Mi actividad operativa</h2><span>Información vinculada a tu perfil</span></div>
      {errorInicio && <Aviso tipo="error" texto={errorInicio} fontSize={13} />}
      {!inicioBombero && !errorInicio && <Cargando texto="Cargando tu actividad operativa…" />}
      {inicioBombero && !inicioBombero.tienePerfilBombero && <p style={{ color: 'var(--muted)', fontSize: 13 }}>Tu usuario aún no está vinculado a una ficha de bombero. Contactá a Personal para completar la vinculación.</p>}
      {inicioBombero?.tienePerfilBombero && <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Próximas guardias</h3>
          {inicioBombero.proximasGuardias.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No tenés guardias próximas asignadas.</p>}
          {inicioBombero.proximasGuardias.map((guardia) => <div key={guardia.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderTop: '1px solid var(--line)' }}>
            <span><strong>{fechaCorta(guardia.fecha)}</strong><small style={{ display: 'block', color: 'var(--muted)' }}>{guardia.horaInicio.slice(0, 5)} - {guardia.horaFin.slice(0, 5)} · {guardia.turno}</small></span>
            <span className="badge">{guardia.rol || guardia.estado}</span>
          </div>)}
        </div>
        <div>
          <h3 style={{ fontSize: 14, marginBottom: 10 }}>Últimos servicios con tu participación</h3>
          {inicioBombero.ultimosServicios.length === 0 && <p style={{ color: 'var(--muted)', fontSize: 13 }}>No hay servicios registrados con tu participación.</p>}
          {inicioBombero.ultimosServicios.map((servicio) => <div key={servicio.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 8, padding: '9px 0', borderTop: '1px solid var(--line)' }}>
            <span><strong>{servicio.numeroServicio}</strong><small style={{ display: 'block', color: 'var(--muted)' }}>{servicio.tipo || 'Servicio'} · {fechaHoraCorta(servicio.fechaHoraAviso)}</small></span>
            <span className="badge">{servicio.rol || servicio.estado}</span>
          </div>)}
        </div>
      </div>}
    </section>
    <div className="section-heading"><h2>Accesos directos</h2><span>{modulos.length} módulos habilitados para tu usuario</span></div>
    {agruparModulos(modulos).map((grupo) => <section key={grupo.id} style={{ marginBottom: 22 }}>
      <h3 className="grupo-titulo">{grupo.nombre}</h3>
      <div className="module-grid">
        {grupo.modulos.map((m) => <Link key={m.slug} href={`/dashboard/${m.slug}`} className="card module-card" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div className="module-icon"><SystemIcon name={m.icono} size={20} /></div>
          <div>
            <div className="module-name">{m.nombre}</div>
            <p className="module-desc">{m.descripcion}</p>
            {!m.disponible && <div className="module-status soon">Próximamente</div>}
          </div>
        </Link>)}
      </div>
    </section>)}
  </>;
}
```

- [ ] **Step 7: Regenerar el catálogo y verificar**

Run: `cd frontend; npm run generar:pantallas` → `/dashboard/centro-mando` aparece con `0xC001` y nombre "Centro de mando".
Run: `cd frontend; node --test scripts/pruebas/; npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y; npm run verificar:pantallas`
Run: `cd backend; npx tsc --noEmit -p tsconfig.json`
Expected: todo en verde.

- [ ] **Step 8: Commit**

```bash
git add frontend/src/lib/modulos.ts frontend/src/app/components/PermisosPantallaProvider.tsx frontend/src/app/dashboard/centro-mando frontend/src/app/dashboard/page.tsx frontend/src/app/globals.css frontend/src/lib/pantallas.generado.ts frontend/scripts/pantallas-codigos.json backend/src/modules/pantallas/catalogo-web.generado.ts
git commit -m "Centro de mando: pantalla en vivo, ítem del menú y estado real en el Inicio

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 14: Área Sistema — las cinco pantallas

**Files:**
- Modify: `frontend/src/lib/modulos.ts` (entrada `sistema` en el grupo Sistema)
- Create: `frontend/src/app/dashboard/sistema/tipos.ts`
- Create: `frontend/src/app/dashboard/sistema/layout.tsx`
- Create: `frontend/src/app/dashboard/sistema/page.tsx` (Estado)
- Create: `frontend/src/app/dashboard/sistema/tareas/page.tsx`
- Create: `frontend/src/app/dashboard/sistema/datos/page.tsx`
- Create: `frontend/src/app/dashboard/sistema/app-movil/page.tsx`
- Create: `frontend/src/app/dashboard/sistema/registros/page.tsx`
- Test: `frontend/scripts/pruebas/sistema-formatos.test.mjs`
- Generated: catálogos (Task 5)

**Interfaces:**
- Consumes: endpoints `/sistema/*` (Task 10), `POST /matpel/administracion/importaciones/procesar` (Task 10), `PATCH /ia/admin/estado` y `POST /ia/admin/config/ollama/probar-conexion` (existentes), `useActualizacionPeriodica`/`MarcaActualizacion` (Task 12), `useRutasVisibles`/`useTabsVisibles` (Tasks 7 y 13), `qrcode` (dependencia existente).
- Produces: pantallas `0xC010` a `0xC014`.

- [ ] **Step 1: Prueba de los formatos (falla)**

`frontend/scripts/pruebas/sistema-formatos.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { duracion, tamanio } from '../../src/app/dashboard/sistema/tipos.ts';

test('duración legible', () => {
  assert.equal(duracion(59), '0 min');
  assert.equal(duracion(3_660), '1 h 1 min');
  assert.equal(duracion(90_000), '1 d 1 h');
});

test('tamaño legible', () => {
  assert.equal(tamanio(500), '1 KB');
  assert.equal(tamanio(18_862_080), '18.0 MB');
});
```

Run: `cd frontend; node --test scripts/pruebas/sistema-formatos.test.mjs` → FAIL (no existe `tipos.ts`).

- [ ] **Step 2: Entrada del menú**

En `frontend/src/lib/modulos.ts`, después de la entrada `inteligencia`:

```ts
  { slug: 'sistema', nombre: 'Sistema', icono: 'server', permisoPrefijo: 'sistema:', disponible: true, grupo: 'sistema', descripcion: 'Estado de servicios, tareas, respaldos, registros y app móvil.' },
```

- [ ] **Step 3: `frontend/src/app/dashboard/sistema/tipos.ts`** (sin React ni `@/`: lo prueba el runner de Node)

```ts
/** Respuestas de /sistema/* (backend: SistemaService y RespaldosService) y formatos. */

export interface AlertaSistema { nivel: 'critica' | 'advertencia' | 'info'; mensaje: string }
export interface ResumenSistema { generadoEn: string; nivel: 'normal' | 'atencion' | 'critico'; alertas: AlertaSistema[] }

export interface TrabajoGre {
  activo: boolean; intervaloMs: number | null; ocupado: boolean; ultimaEjecucion: string | null;
  ultimosProcesados: number | null; ultimoError: string | null;
  cola: { tablas: boolean; motivo: string | null; porEstado: Record<string, number> };
}
export interface TrabajoAvisos {
  programado: boolean; intervaloHoras: number; ocupado: boolean; telegramConfigurado: boolean;
  ultimaEjecucion: string | null; ultimosEnviados: number | null; ultimoMotivo: string | null; ultimoError: string | null;
}

export interface EstadoSistema {
  generadoEn: string;
  backend: { version: string | null; node: string; entorno: string; plataforma: string; segundosEncendido: number; memoriaMb: number };
  baseDeDatos: { disponible: boolean; motivo: string | null; latenciaMs: number | null; version: string | null; tamanioMb: number | null };
  inteligencia: {
    disponible: boolean;
    estado: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO' | null;
    ollama: { conectado: boolean; modeloConfigurado?: string | null; modeloDisponible?: boolean; error: string | null } | null;
    whisper: { conectado: boolean; error: string | null } | null;
    piper: { disponible: boolean; error: string | null } | null;
    motivo: string | null;
  };
  telegram: { configurado: boolean };
  tiempoReal: { despacho: { conexiones: number; personas: number }; alertas: { suscriptores: number } };
  trabajos: { gre: TrabajoGre; avisos: TrabajoAvisos };
  matriz: { activa: boolean; sincronizada: boolean; error: string | null; pantallas: number; secciones: number; rutasBackend: number; llamadasSinResolver: number };
}

export interface TareaProgramada {
  nombre: string; existe: boolean; estado: 'LISTA' | 'EN_EJECUCION' | 'DESHABILITADA' | 'DESCONOCIDO' | null;
  ultimaEjecucion: string | null; ultimoResultado: number | null; descripcionResultado: string | null; proximaEjecucion: string | null;
}
export interface LineaRegistro { texto: string; nivel: 'ERROR' | 'WARN' | 'LOG' | 'OTRO' }
export interface TareasYTrabajos { tareas: TareaProgramada[] | null; motivoTareas: string | null; arranque: LineaRegistro[]; trabajos: { gre: TrabajoGre; avisos: TrabajoAvisos } }

export interface RespaldoArchivo { nombre: string; fecha: string; tamanioBytes: number; tieneSha256: boolean }
export interface CorridaRespaldo {
  archivo: string | null; tamanio: string | null; sha256: string | null; resultado: 'OK' | 'FALLO' | 'INCOMPLETA';
  pruebaRestauracion: 'OMITIDA' | 'OK' | 'FALLO' | 'DESCONOCIDA'; detalleRestauracion: string | null; avisos: string[];
}
export interface Respaldos {
  disponible: boolean; motivo: string | null; carpeta: string; archivos: RespaldoArchivo[]; corridas: CorridaRespaldo[];
  alertas: AlertaSistema[]; tarea: TareaProgramada | { disponible: false; motivo: string } | null;
}
export type Migraciones =
  | { disponible: true; total: number; aplicadas: number; pendientes: string[]; alteradas: string[]; desconocidas: string[]; ultimaAplicada: { nombre: string; aplicadaEn: string } | null; comando: string }
  | { disponible: false; motivo: string };

export interface AppMovil {
  disponible: boolean; versionCodigo?: number; versionNombre?: string; obligatoria?: boolean; notas?: string;
  tamanioBytes?: number; sha256?: string; huellaCertificado: string | null;
}
export interface DireccionConexion { nombre: string; ip: string; virtual: boolean; api: string; responde: boolean; qrConectar: string; urlInstalar: string }
export interface ConexionMovil { puerto: number; apkDisponible: boolean; direcciones: DireccionConexion[] }
export interface Registro { clave: string; archivo: string; disponible: boolean; motivo: string | null; actualizadoEn: string | null; lineas: LineaRegistro[] }

export const ETIQUETA_NIVEL = { normal: 'Normal', atencion: 'Requiere atención', critico: 'Crítico' } as const;
export const FONDO_ALERTA = { critica: 'var(--bad-fill)', advertencia: 'var(--warn-fill)', info: 'var(--info-fill)' } as const;
export const ESTADO_TAREA: Record<string, { texto: string; fondo: string }> = {
  LISTA: { texto: 'Lista', fondo: 'var(--ok-fill)' },
  EN_EJECUCION: { texto: 'En ejecución', fondo: 'var(--info-fill)' },
  DESHABILITADA: { texto: 'Deshabilitada', fondo: 'var(--bad-fill)' },
  DESCONOCIDO: { texto: 'Desconocido', fondo: 'var(--neutral-fill)' },
};

export function duracion(segundos: number): string {
  const d = Math.floor(segundos / 86_400);
  const h = Math.floor((segundos % 86_400) / 3_600);
  const m = Math.floor((segundos % 3_600) / 60);
  if (d) return `${d} d ${h} h`;
  if (h) return `${h} h ${m} min`;
  return `${m} min`;
}

export function tamanio(bytes: number): string {
  return bytes >= 1_048_576 ? `${(bytes / 1_048_576).toFixed(1)} MB` : `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

export function fechaLegible(valor: string | null): string {
  if (!valor) return '—';
  return new Intl.DateTimeFormat('es-PY', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(valor));
}
```

Run: `cd frontend; node --test scripts/pruebas/` → PASS.

- [ ] **Step 4: `frontend/src/app/dashboard/sistema/layout.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTabsVisibles } from '@/app/components/PermisosPantallaProvider';

const TABS = [
  { href: '/dashboard/sistema', label: 'Estado', exact: true },
  { href: '/dashboard/sistema/tareas', label: 'Tareas' },
  { href: '/dashboard/sistema/datos', label: 'Respaldos y base de datos' },
  { href: '/dashboard/sistema/app-movil', label: 'App móvil' },
  { href: '/dashboard/sistema/registros', label: 'Registros' },
];

export default function SistemaLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const tabs = useTabsVisibles(TABS);
  return (
    <div>
      <nav className="subnav" aria-label="Secciones del área Sistema">
        {tabs.map((tab) => {
          const activo = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href);
          return <Link key={tab.href} href={tab.href} className={`subnav-link${activo ? ' active' : ''}`} aria-current={activo ? 'page' : undefined}>{tab.label}</Link>;
        })}
      </nav>
      {children}
    </div>
  );
}
```

- [ ] **Step 5: Estado — `frontend/src/app/dashboard/sistema/page.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { duracion, EstadoSistema, ETIQUETA_NIVEL, FONDO_ALERTA, ResumenSistema } from './tipos';

const ESTADO_SNOOPY = {
  ACTIVA: { texto: 'Activo', fondo: 'var(--ok-fill)' },
  MANTENIMIENTO: { texto: 'En mantenimiento', fondo: 'var(--warn-fill)' },
  INACTIVA: { texto: 'Apagado', fondo: 'var(--bad-fill)' },
} as const;

/** Lo que sigue en la terminal, y por qué (spec 2026-10-09 §6.7). Texto, sin botones. */
const SOLO_TERMINAL = [
  { accion: 'Iniciar, reiniciar o detener SIGBO', motivo: 'Es el mismo servidor que atiende esta pantalla.', comando: 'iniciar-sigbo.bat -Rebuild · detener-sigbo.bat' },
  { accion: 'Aplicar migraciones', motivo: 'Cambian la estructura de la base; la 094 y la 095 esperan la decisión de la institución.', comando: 'database\\run-migrations.ps1' },
  { accion: 'Publicar una versión del APK', motivo: 'La clave privada de firma no está en el servidor, a propósito.', comando: '.movile\\scripts\\publicar-apk.ps1' },
  { accion: 'Abrir el túnel a internet', motivo: 'Expone el sistema fuera de la red del cuartel.', comando: 'tunel-sigbo.bat' },
  { accion: 'Programar o quitar tareas de Windows', motivo: 'Necesitan la sesión de Windows del servidor.', comando: 'workflows\\scripts\\programar-respaldo.ps1 · programar-arranque.ps1' },
];

const Si = ({ ok, si = 'Sí', no = 'No' }: { ok: boolean; si?: string; no?: string }) =>
  <span className="badge" style={{ background: ok ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{ok ? si : no}</span>;

export default function SistemaEstadoPage() {
  const confirmar = useConfirmacion();
  const pedir = useEntradaConfirmada();
  const visibles = useRutasVisibles();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [estado, setEstado] = useState<EstadoSistema | null>(null);
  const [resumen, setResumen] = useState<ResumenSistema | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [prueba, setPrueba] = useState<{ conectado: boolean; version: string | null; error: string | null } | null>(null);

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const [e, r] = await Promise.all([apiFetch('/sistema/estado'), apiFetch('/sistema/resumen')]);
    if (!e.ok) {
      const cuerpo = await e.json().catch(() => ({}));
      throw new Error(cuerpo.message ?? 'No se pudo consultar el estado del sistema.');
    }
    setEstado(await e.json());
    if (r.ok) setResumen(await r.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 15_000);

  async function cambiarSnoopy(nuevo: 'ACTIVA' | 'INACTIVA' | 'MANTENIMIENTO') {
    let cuerpo: Record<string, string> = { estado: nuevo };
    if (nuevo === 'MANTENIMIENTO') {
      const mensaje = await pedir({ titulo: 'Poner a Snoopy en mantenimiento', mensaje: 'Las personas verán este mensaje mientras dure.', etiqueta: 'Mensaje para las personas', requerida: true, confirmar: 'Poner en mantenimiento' });
      if (mensaje === null) return;
      cuerpo = { ...cuerpo, mensajeMantenimiento: mensaje, motivo: mensaje };
    } else if (nuevo === 'INACTIVA') {
      const motivo = await pedir({ titulo: 'Apagar a Snoopy', mensaje: 'Nadie podrá usar el asistente hasta que se reactive. Queda auditado.', etiqueta: 'Motivo', requerida: true, confirmar: 'Apagar', peligro: true });
      if (motivo === null) return;
      cuerpo = { ...cuerpo, motivo };
    } else if (!(await confirmar({ titulo: 'Reactivar a Snoopy', mensaje: 'El asistente vuelve a estar disponible para todos.', confirmar: 'Reactivar' }))) {
      return;
    }
    setError(''); setExito('');
    const res = await apiFetch('/ia/admin/estado', { method: 'PATCH', body: JSON.stringify(cuerpo) });
    const datos = await res.json().catch(() => ({}));
    if (!res.ok) { setError(datos.message ?? 'No se pudo cambiar el estado de Snoopy.'); return; }
    setExito('Estado de Snoopy actualizado y registrado en auditoría.');
    actualizacion.refrescar();
  }

  async function probarOllama() {
    setPrueba(null); setError('');
    const res = await apiFetch('/ia/admin/config/ollama/probar-conexion', { method: 'POST' });
    const datos = await res.json().catch(() => ({}));
    if (!res.ok) { setError(datos.message ?? 'No se pudo probar la conexión con Ollama.'); return; }
    setPrueba(datos);
  }

  if (!estado) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando el estado del sistema…" filas={4} />;
  const ia = estado.inteligencia;
  const puedeCambiarSnoopy = permisos.includes('inteligencia:desactivar');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera">
        <p>Estado real de los servicios, el asistente y las tareas del sistema.</p>
        <MarcaActualizacion {...actualizacion} />
      </div>
      {actualizacion.error && <Aviso tipo="error" texto={`No se pudo actualizar: ${actualizacion.error}. Se muestran los últimos datos.`} />}
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      {resumen && <section className="cm-panel" aria-labelledby="sis-resumen">
        <h2 id="sis-resumen"><span>Resumen</span><span className={`semaforo semaforo-${resumen.nivel}`}>{ETIQUETA_NIVEL[resumen.nivel]}</span></h2>
        {resumen.alertas.length === 0 ? <p className="cm-vacio">Sin alertas.</p> : <ul className="cm-lista">
          {resumen.alertas.map((a, i) => <li key={i}><span>{a.mensaje}</span><span className="badge" style={{ background: FONDO_ALERTA[a.nivel] }}>{a.nivel}</span></li>)}
        </ul>}
      </section>}

      <div className="cm-grid">
        <section className="cm-panel" aria-labelledby="sis-backend">
          <h2 id="sis-backend">Servidor (backend)</h2>
          <ul className="cm-lista">
            <li><span>Versión</span><span>{estado.backend.version ?? 'No disponible'}</span></li>
            <li><span>Encendido desde hace</span><span>{duracion(estado.backend.segundosEncendido)}</span></li>
            <li><span>Memoria</span><span>{estado.backend.memoriaMb} MB</span></li>
            <li><span>Node · entorno</span><span>{estado.backend.node} · {estado.backend.entorno}</span></li>
          </ul>
        </section>

        <section className="cm-panel" aria-labelledby="sis-bd">
          <h2 id="sis-bd"><span>Base de datos</span><Si ok={estado.baseDeDatos.disponible} si="Responde" no="Sin respuesta" /></h2>
          {estado.baseDeDatos.disponible ? <ul className="cm-lista">
            <li><span>Latencia</span><span>{estado.baseDeDatos.latenciaMs} ms</span></li>
            <li><span>SQL Server</span><span>{estado.baseDeDatos.version ?? 'No disponible'}</span></li>
            <li><span>Tamaño</span><span>{estado.baseDeDatos.tamanioMb !== null ? `${estado.baseDeDatos.tamanioMb} MB` : 'No disponible'}</span></li>
          </ul> : <Aviso tipo="error" texto={estado.baseDeDatos.motivo ?? 'Sin respuesta.'} fontSize={12} />}
        </section>

        <section className="cm-panel" aria-labelledby="sis-ia">
          <h2 id="sis-ia"><span>Snoopy (asistente)</span>{ia.estado && <span className="badge" style={{ background: ESTADO_SNOOPY[ia.estado].fondo }}>{ESTADO_SNOOPY[ia.estado].texto}</span>}</h2>
          {!ia.disponible ? <Aviso tipo="error" texto={`No disponible: ${ia.motivo}`} fontSize={12} /> : <ul className="cm-lista">
            <li><span>Ollama{ia.ollama?.modeloConfigurado ? <small>Modelo {ia.ollama.modeloConfigurado}{ia.ollama.modeloDisponible === false ? ' (no instalado)' : ''}</small> : null}</span><Si ok={!!ia.ollama?.conectado} si="Conectado" no="Sin conexión" /></li>
            <li><span>Whisper (voz a texto)</span><Si ok={!!ia.whisper?.conectado} si="Conectado" no="Sin conexión" /></li>
            <li><span>Piper (texto a voz){ia.piper?.error ? <small>{ia.piper.error}</small> : null}</span><Si ok={!!ia.piper?.disponible} si="Listo" no="No disponible" /></li>
          </ul>}
          {prueba && <p className="cm-vacio">Prueba de Ollama: {prueba.conectado ? `conectado (versión ${prueba.version ?? '?'})` : `sin conexión: ${prueba.error ?? 'sin detalle'}`}</p>}
          <div className="cm-acciones">
            {permisos.includes('inteligencia:configurar') && <button type="button" className="service-secondary" onClick={() => void probarOllama()}>Probar Ollama</button>}
            {puedeCambiarSnoopy && ia.estado !== 'MANTENIMIENTO' && <button type="button" className="service-secondary" onClick={() => void cambiarSnoopy('MANTENIMIENTO')}>Mantenimiento</button>}
            {puedeCambiarSnoopy && ia.estado !== 'ACTIVA' && <button type="button" className="btn-primary" onClick={() => void cambiarSnoopy('ACTIVA')}>Reactivar</button>}
            {puedeCambiarSnoopy && ia.estado !== 'INACTIVA' && <button type="button" className="service-secondary" onClick={() => void cambiarSnoopy('INACTIVA')}>Apagar</button>}
            {visibles.has('/dashboard/seguridad/inteligencia-artificial/configuracion') && <Link href="/dashboard/seguridad/inteligencia-artificial/configuracion" style={{ fontSize: 12 }}>Configurar</Link>}
          </div>
        </section>

        <section className="cm-panel" aria-labelledby="sis-tr">
          <h2 id="sis-tr">Tiempo real y avisos</h2>
          <ul className="cm-lista">
            <li><span>Despacho: conexiones abiertas<small>{estado.tiempoReal.despacho.personas} persona(s) conectada(s)</small></span><strong>{estado.tiempoReal.despacho.conexiones}</strong></li>
            <li><span>Alertas: oyentes</span><strong>{estado.tiempoReal.alertas.suscriptores}</strong></li>
            <li><span>Telegram</span><Si ok={estado.telegram.configurado} si="Configurado" no="Sin configurar" /></li>
          </ul>
        </section>

        <section className="cm-panel" aria-labelledby="sis-matriz">
          <h2 id="sis-matriz"><span>Permisos por pantalla</span><Si ok={estado.matriz.activa && estado.matriz.sincronizada} si="Activos" no="Revisar" /></h2>
          <ul className="cm-lista">
            <li><span>Pantallas web y secciones</span><span>{estado.matriz.pantallas} + {estado.matriz.secciones}</span></li>
            <li><span>Rutas de la API leídas</span><span>{estado.matriz.rutasBackend}</span></li>
            <li><span>Llamadas sin resolver</span><span>{estado.matriz.llamadasSinResolver}</span></li>
          </ul>
          {estado.matriz.error && <Aviso tipo="error" texto={estado.matriz.error} fontSize={12} />}
          {visibles.has('/dashboard/seguridad/pantallas') && <Link href="/dashboard/seguridad/pantallas" style={{ fontSize: 12 }}>Configurar reglas</Link>}
        </section>

        <section className="cm-panel cm-panel-ancho" aria-labelledby="sis-terminal">
          <h2 id="sis-terminal">Lo que sigue en la terminal</h2>
          <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
            <thead><tr><th scope="col">Acción</th><th scope="col">Por qué no está en la web</th><th scope="col">Comando</th></tr></thead>
            <tbody>{SOLO_TERMINAL.map((t) => <tr key={t.accion}><td>{t.accion}</td><td>{t.motivo}</td><td><code>{t.comando}</code></td></tr>)}</tbody>
          </table></div>
          <p className="cm-vacio">El Centro de Control del ecosistema también arranca, detiene, compila y prueba SIGBO.</p>
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Tareas — `frontend/src/app/dashboard/sistema/tareas/page.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { usePuede } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { ESTADO_TAREA, fechaLegible, TareasYTrabajos } from '../tipos';

export default function SistemaTareasPage() {
  const confirmar = useConfirmacion();
  const puede = usePuede();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [datos, setDatos] = useState<TareasYTrabajos | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [enCurso, setEnCurso] = useState<string | null>(null);

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const res = await apiFetch('/sistema/tareas');
    if (!res.ok) { const c = await res.json().catch(() => ({})); throw new Error(c.message ?? 'No se pudieron consultar las tareas.'); }
    setDatos(await res.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 15_000);

  async function ejecutar(clave: 'avisos' | 'gre') {
    const textos = clave === 'avisos'
      ? { titulo: 'Revisar vencimientos ahora', mensaje: 'Se revisan los vencimientos y, si hay nuevos, se avisa por Telegram (sin datos médicos).', ruta: '/sistema/tareas/avisos-vencimiento/ejecutar' }
      : { titulo: 'Procesar una importación GRE', mensaje: 'Procesa la próxima importación pendiente. Puede tardar varios minutos; corre en segundo plano.', ruta: '/matpel/administracion/importaciones/procesar' };
    if (!(await confirmar({ titulo: textos.titulo, mensaje: textos.mensaje, confirmar: 'Ejecutar' }))) return;
    setEnCurso(clave); setError(''); setExito('');
    try {
      const res = await apiFetch(textos.ruta, { method: 'POST' });
      const c = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.message ?? 'No se pudo ejecutar.');
      setExito(clave === 'avisos'
        ? (c.enviados > 0 ? `Se enviaron ${c.enviados} aviso(s).` : `Revisión hecha: ${c.motivo ?? 'no había vencimientos nuevos'}.`)
        : 'Procesamiento iniciado. El estado se actualiza solo.');
      actualizacion.refrescar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo ejecutar.'); }
    finally { setEnCurso(null); }
  }

  if (!datos) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando tareas…" />;
  const { gre, avisos } = datos.trabajos;
  const puedeOperar = permisos.includes('sistema:operar') && puede('crear');
  const puedeGre = permisos.includes('matpel:administrar_gre');

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera"><p>Tareas programadas de Windows y trabajos internos del servidor.</p><MarcaActualizacion {...actualizacion} /></div>
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      <section className="cm-panel" aria-labelledby="t-windows">
        <h2 id="t-windows">Tareas programadas de Windows</h2>
        {datos.tareas === null ? <p className="cm-vacio">No disponible: {datos.motivoTareas}</p> : <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
          <thead><tr><th scope="col">Tarea</th><th scope="col">Estado</th><th scope="col">Última ejecución</th><th scope="col">Resultado</th><th scope="col">Próxima</th></tr></thead>
          <tbody>{datos.tareas.map((t) => <tr key={t.nombre}>
            <td>{t.nombre}</td>
            <td>{t.existe && t.estado ? <span className="badge" style={{ background: ESTADO_TAREA[t.estado].fondo }}>{ESTADO_TAREA[t.estado].texto}</span> : <span className="badge" style={{ background: 'var(--bad-fill)' }}>No programada</span>}</td>
            <td>{fechaLegible(t.ultimaEjecucion)}</td>
            <td>{t.descripcionResultado ?? '—'}</td>
            <td>{fechaLegible(t.proximaEjecucion)}</td>
          </tr>)}</tbody>
        </table></div>}
        <p className="cm-vacio">El respaldo se lanza desde «Respaldos y base de datos».</p>
      </section>

      <div className="cm-grid">
        <section className="cm-panel" aria-labelledby="t-avisos">
          <h2 id="t-avisos"><span>Avisos de vencimiento</span><span className="badge" style={{ background: avisos.programado ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{avisos.programado ? `Cada ${avisos.intervaloHoras} h` : 'Apagado'}</span></h2>
          <ul className="cm-lista">
            <li><span>Telegram</span><span>{avisos.telegramConfigurado ? 'Configurado' : 'Sin configurar'}</span></li>
            <li><span>Última revisión</span><span>{fechaLegible(avisos.ultimaEjecucion)}</span></li>
            <li><span>Resultado</span><span>{avisos.ultimoError ? `Error: ${avisos.ultimoError}` : avisos.ultimosEnviados !== null ? `${avisos.ultimosEnviados} enviado(s)${avisos.ultimoMotivo ? ` · ${avisos.ultimoMotivo}` : ''}` : '—'}</span></li>
          </ul>
          {puedeOperar && <button type="button" className="btn-primary" disabled={avisos.ocupado || enCurso === 'avisos'} onClick={() => void ejecutar('avisos')}>{avisos.ocupado || enCurso === 'avisos' ? 'Revisando…' : 'Revisar ahora'}</button>}
        </section>

        <section className="cm-panel" aria-labelledby="t-gre">
          <h2 id="t-gre"><span>Importación de la GRE</span><span className="badge" style={{ background: gre.activo ? 'var(--ok-fill)' : 'var(--neutral-fill)' }}>{gre.activo ? 'Automático' : 'Manual'}</span></h2>
          {!gre.cola.tablas ? <p className="cm-vacio">No disponible: {gre.cola.motivo}</p> : <ul className="cm-lista">
            {Object.entries(gre.cola.porEstado).map(([e, n]) => <li key={e}><span>{e}</span><strong>{n}</strong></li>)}
            {Object.keys(gre.cola.porEstado).length === 0 && <li><span className="cm-vacio">No hay importaciones.</span></li>}
            <li><span>Última corrida</span><span>{fechaLegible(gre.ultimaEjecucion)}{gre.ultimoError ? ` · error: ${gre.ultimoError}` : ''}</span></li>
          </ul>}
          {puedeGre && <button type="button" className="btn-primary" disabled={!gre.cola.tablas || gre.ocupado || enCurso === 'gre'} title={!gre.cola.tablas ? gre.cola.motivo ?? undefined : undefined} onClick={() => void ejecutar('gre')}>{gre.ocupado ? 'Procesando…' : 'Procesar una importación'}</button>}
        </section>

        <section className="cm-panel cm-panel-ancho" aria-labelledby="t-arranque">
          <h2 id="t-arranque">Arranque automático (últimas líneas)</h2>
          {datos.arranque.length === 0 ? <p className="cm-vacio">Sin registro de arranque automático.</p>
            : <div className="registro-visor">{datos.arranque.map((l, i) => <div key={i} className={`registro-linea ${l.nivel === 'ERROR' ? 'error' : l.nivel === 'WARN' ? 'warn' : ''}`}>{l.texto}</div>)}</div>}
        </section>
      </div>
    </div>
  );
}
```

- [ ] **Step 7: Respaldos y base de datos — `frontend/src/app/dashboard/sistema/datos/page.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { apiFetch, obtenerSesion } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { usePuede } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { ESTADO_TAREA, fechaLegible, FONDO_ALERTA, Migraciones, Respaldos, tamanio } from '../tipos';

export default function SistemaDatosPage() {
  const confirmar = useConfirmacion();
  const puede = usePuede();
  const [permisos, setPermisos] = useState<string[]>([]);
  const [respaldos, setRespaldos] = useState<Respaldos | null>(null);
  const [migraciones, setMigraciones] = useState<Migraciones | null>(null);
  const [verificaciones, setVerificaciones] = useState<Record<string, { coincide: boolean | null; sha256: string }>>({});
  const [ocupado, setOcupado] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');

  useEffect(() => { setPermisos(obtenerSesion()?.usuario.permisos ?? []); }, []);

  const cargar = useCallback(async () => {
    const [r, m] = await Promise.all([apiFetch('/sistema/respaldos'), apiFetch('/sistema/migraciones')]);
    if (!r.ok) { const c = await r.json().catch(() => ({})); throw new Error(c.message ?? 'No se pudieron consultar los respaldos.'); }
    setRespaldos(await r.json());
    if (m.ok) setMigraciones(await m.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 15_000);
  const puedeOperar = permisos.includes('sistema:operar') && puede('crear');

  async function respaldar() {
    if (!(await confirmar({ titulo: 'Respaldar ahora', mensaje: 'Se lanza la tarea programada SIGBO-Respaldo-Diario: respalda la base, verifica el archivo y calcula su SHA-256. Tarda uno o dos minutos.', confirmar: 'Respaldar' }))) return;
    setOcupado('respaldo'); setError(''); setExito('');
    try {
      const res = await apiFetch('/sistema/respaldos/ejecutar', { method: 'POST' });
      const c = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.message ?? 'No se pudo iniciar el respaldo.');
      setExito(c.mensaje ?? 'Respaldo iniciado.');
      actualizacion.refrescar();
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo iniciar el respaldo.'); }
    finally { setOcupado(null); }
  }

  async function verificar(nombre: string) {
    setOcupado(nombre); setError('');
    try {
      const res = await apiFetch(`/sistema/respaldos/${encodeURIComponent(nombre)}/verificar`, { method: 'POST' });
      const c = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(c.message ?? 'No se pudo verificar el respaldo.');
      setVerificaciones((v) => ({ ...v, [nombre]: { coincide: c.coincide, sha256: c.sha256 } }));
    } catch (e) { setError(e instanceof Error ? e.message : 'No se pudo verificar el respaldo.'); }
    finally { setOcupado(null); }
  }

  if (!respaldos) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando respaldos…" />;
  const tarea = respaldos.tarea && 'nombre' in respaldos.tarea ? respaldos.tarea : null;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera"><p>Respaldos de la base (tarea programada) y estado de las migraciones.</p><MarcaActualizacion {...actualizacion} /></div>
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      <section className="cm-panel" aria-labelledby="d-respaldos">
        <h2 id="d-respaldos">
          <span>Respaldos</span>
          {tarea?.estado && <span className="badge" style={{ background: ESTADO_TAREA[tarea.estado].fondo }}>Tarea: {ESTADO_TAREA[tarea.estado].texto}</span>}
        </h2>
        {!respaldos.disponible && <Aviso tipo="error" texto={respaldos.motivo ?? 'No disponible.'} fontSize={12} />}
        {respaldos.alertas.length > 0 && <ul className="cm-lista">{respaldos.alertas.map((a, i) => <li key={i}><span>{a.mensaje}</span><span className="badge" style={{ background: FONDO_ALERTA[a.nivel] }}>{a.nivel}</span></li>)}</ul>}
        {puedeOperar && <div className="cm-acciones">
          <button type="button" className="btn-primary" disabled={ocupado === 'respaldo' || tarea?.estado === 'EN_EJECUCION'} onClick={() => void respaldar()}>
            {tarea?.estado === 'EN_EJECUCION' ? 'Respaldo en curso…' : 'Respaldar ahora'}
          </button>
        </div>}
        {respaldos.archivos.length > 0 && <div style={{ overflowX: 'auto' }}><table className="tabla-compacta">
          <thead><tr><th scope="col">Fecha</th><th scope="col">Archivo</th><th scope="col">Tamaño</th><th scope="col">Integridad</th></tr></thead>
          <tbody>{respaldos.archivos.map((a) => {
            const v = verificaciones[a.nombre];
            return <tr key={a.nombre}>
              <td>{fechaLegible(a.fecha)}</td>
              <td><code>{a.nombre}</code></td>
              <td>{tamanio(a.tamanioBytes)}</td>
              <td>
                {v ? <span className="badge" style={{ background: v.coincide ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{v.coincide === null ? 'Sin .sha256 para comparar' : v.coincide ? 'Íntegro' : 'NO coincide'}</span>
                  : !a.tieneSha256 ? <span className="badge" style={{ background: 'var(--warn-fill)' }}>Sin .sha256</span>
                    : puedeOperar ? <button type="button" className="service-secondary" disabled={ocupado === a.nombre} onClick={() => void verificar(a.nombre)}>{ocupado === a.nombre ? 'Verificando…' : 'Verificar'}</button>
                      : <span className="cm-vacio">Con .sha256</span>}
              </td>
            </tr>;
          })}</tbody>
        </table></div>}
        {respaldos.corridas.length > 0 && <>
          <h3 className="grupo-titulo">Últimas corridas registradas</h3>
          <ul className="cm-lista">{respaldos.corridas.map((c, i) => <li key={i}>
            <span>{c.archivo ?? 'Sin archivo'}{c.tamanio ? ` · ${c.tamanio}` : ''}<small>Prueba de restauración: {c.pruebaRestauracion === 'OMITIDA' ? 'omitida' : c.pruebaRestauracion === 'OK' ? `correcta (${c.detalleRestauracion ?? ''})` : c.pruebaRestauracion === 'FALLO' ? 'falló' : 'sin dato'}{c.avisos.length ? ` · ${c.avisos.join(' · ')}` : ''}</small></span>
            <span className="badge" style={{ background: c.resultado === 'OK' ? 'var(--ok-fill)' : c.resultado === 'FALLO' ? 'var(--bad-fill)' : 'var(--warn-fill)' }}>{c.resultado}</span>
          </li>)}</ul>
        </>}
      </section>

      <section className="cm-panel" aria-labelledby="d-migraciones">
        <h2 id="d-migraciones">Migraciones de la base</h2>
        {!migraciones ? <p className="cm-vacio">Consultando…</p> : !migraciones.disponible ? <p className="cm-vacio">No disponible: {migraciones.motivo}</p> : <>
          <div className="cm-cifras">
            <div className="cm-cifra"><strong>{migraciones.aplicadas}/{migraciones.total}</strong><span>Aplicadas</span></div>
            <div className="cm-cifra"><strong>{migraciones.pendientes.length}</strong><span>Pendientes</span></div>
            <div className="cm-cifra"><strong>{migraciones.alteradas.length}</strong><span>Alteradas</span></div>
          </div>
          {migraciones.alteradas.length > 0 && <Aviso tipo="error" texto={`Alteradas después de aplicarse (no se deben editar): ${migraciones.alteradas.join(', ')}`} fontSize={12} />}
          {migraciones.pendientes.length > 0 && <p className="cm-vacio">Pendientes: {migraciones.pendientes.join(', ')}. Aplicarlas cambia la estructura de la base y es una decisión de la institución: se hace desde la terminal con <code>{migraciones.comando}</code>, que aplica todas las pendientes en orden.</p>}
          {migraciones.desconocidas.length > 0 && <p className="cm-vacio">Registradas en la base pero ausentes del manifiesto: {migraciones.desconocidas.join(', ')}.</p>}
          {migraciones.ultimaAplicada && <p className="cm-vacio">Última aplicada: {migraciones.ultimaAplicada.nombre} ({fechaLegible(migraciones.ultimaAplicada.aplicadaEn)}).</p>}
        </>}
      </section>
    </div>
  );
}
```

- [ ] **Step 8: App móvil — `frontend/src/app/dashboard/sistema/app-movil/page.tsx`**

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { AppMovil, ConexionMovil, tamanio } from '../tipos';

/** Lo que hacia conectar-celulares.bat, dentro del sistema: QR para instalar y para conectar la app. */
export default function SistemaAppMovilPage() {
  const [app, setApp] = useState<AppMovil | null>(null);
  const [conexion, setConexion] = useState<ConexionMovil | null>(null);
  const [qrs, setQrs] = useState<Record<string, { conectar: string; instalar: string }>>({});

  const cargar = useCallback(async () => {
    const [a, c] = await Promise.all([apiFetch('/sistema/app-movil'), apiFetch('/sistema/conexion-movil')]);
    if (!a.ok || !c.ok) throw new Error('No se pudo consultar la app móvil.');
    setApp(await a.json());
    setConexion(await c.json());
  }, []);
  const actualizacion = useActualizacionPeriodica(cargar, 30_000);

  useEffect(() => {
    if (!conexion) return;
    let vigente = true;
    void Promise.all(conexion.direcciones.map(async (d) => [d.ip, {
      conectar: await QRCode.toDataURL(d.qrConectar, { width: 220, margin: 2 }),
      instalar: await QRCode.toDataURL(d.urlInstalar, { width: 220, margin: 2 }),
    }] as const)).then((pares) => { if (vigente) setQrs(Object.fromEntries(pares)); });
    return () => { vigente = false; };
  }, [conexion]);

  if (!app || !conexion) return actualizacion.error ? <Aviso tipo="error" texto={actualizacion.error} /> : <Cargando texto="Consultando la app móvil…" />;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera"><p>Versión publicada de la app y códigos para instalarla y conectarla desde la red del cuartel.</p><MarcaActualizacion {...actualizacion} /></div>

      <section className="cm-panel" aria-labelledby="m-apk">
        <h2 id="m-apk"><span>APK publicado</span><span className="badge" style={{ background: app.disponible ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{app.disponible ? `Versión ${app.versionNombre}` : 'Sin publicar'}</span></h2>
        {!app.disponible ? <p className="cm-vacio">No hay un APK publicado (o el archivo no coincide con su version.json). Se publica desde la terminal con <code>.movile\scripts\publicar-apk.ps1</code>.</p> : <ul className="cm-lista">
          <li><span>Código de versión</span><span>{app.versionCodigo}{app.obligatoria ? ' · actualización obligatoria' : ''}</span></li>
          <li><span>Tamaño</span><span>{app.tamanioBytes ? tamanio(app.tamanioBytes) : '—'}</span></li>
          <li><span>SHA-256</span><code style={{ fontSize: 11, wordBreak: 'break-all' }}>{app.sha256}</code></li>
          <li><span>Huella del certificado</span><code style={{ fontSize: 11, wordBreak: 'break-all' }}>{app.huellaCertificado ?? 'No publicada'}</code></li>
          {app.notas && <li><span>Notas</span><span>{app.notas}</span></li>}
        </ul>}
      </section>

      <section className="cm-panel" aria-labelledby="m-conexion">
        <h2 id="m-conexion">Conectar los celulares (puerto {conexion.puerto})</h2>
        {conexion.direcciones.length === 0 ? <p className="cm-vacio">Este servidor no tiene ninguna dirección de red local (Wi-Fi o Ethernet).</p> : <div className="qr-grid">
          {conexion.direcciones.flatMap((d) => [
            <div key={`${d.ip}-i`} className="qr-tarjeta">
              <strong>Instalar la app</strong>
              {qrs[d.ip] && conexion.apkDisponible ? <img src={qrs[d.ip].instalar} alt={`Código QR para descargar la app desde ${d.ip}`} width={200} height={200} /> : <p className="cm-vacio">{conexion.apkDisponible ? 'Generando…' : 'No hay APK publicado.'}</p>}
              <code>{d.urlInstalar}</code>
              <span className="badge" style={{ background: d.responde ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{d.nombre} · {d.responde ? 'responde' : 'no responde'}</span>
            </div>,
            <div key={`${d.ip}-c`} className="qr-tarjeta">
              <strong>Conectar la app</strong>
              {qrs[d.ip] ? <img src={qrs[d.ip].conectar} alt={`Código QR para conectar la app al servidor ${d.ip}`} width={200} height={200} /> : <p className="cm-vacio">Generando…</p>}
              <code>{d.api}</code>
              <span className="cm-vacio">En la app: Conectar con el servidor › Escanear.</span>
            </div>,
          ])}
        </div>}
        {conexion.direcciones.some((d) => !d.responde) && <p className="cm-vacio">Si una dirección no responde, el firewall de Windows puede estar bloqueando el puerto {conexion.puerto} para la red privada.</p>}
      </section>
    </div>
  );
}
```

- [ ] **Step 9: Registros — `frontend/src/app/dashboard/sistema/registros/page.tsx`**

```tsx
'use client';

import Link from 'next/link';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { apiFetch } from '@/lib/api';
import { Aviso } from '@/app/components/Aviso';
import { useRutasVisibles } from '@/app/components/PermisosPantallaProvider';
import { MarcaActualizacion, useActualizacionPeriodica } from '@/app/components/useActualizacionPeriodica';
import { fechaLegible, Registro } from '../tipos';

const ARCHIVOS = [
  { clave: 'backend-out', nombre: 'Servidor: salida' },
  { clave: 'backend-err', nombre: 'Servidor: errores' },
  { clave: 'arranque-automatico', nombre: 'Arranque automático' },
];
const AUDITORIAS = [
  { ruta: '/dashboard/seguridad/auditoria', nombre: 'Auditoría de seguridad' },
  { ruta: '/dashboard/seguridad/inteligencia-artificial/auditoria', nombre: 'Auditoría de IA' },
  { ruta: '/dashboard/documentos/auditoria', nombre: 'Auditoría de documentos' },
];

export default function SistemaRegistrosPage() {
  const visibles = useRutasVisibles();
  const [archivo, setArchivo] = useState('backend-err');
  const [lineas, setLineas] = useState(200);
  const [filtro, setFiltro] = useState('');
  const [nivel, setNivel] = useState<'todos' | 'ERROR' | 'WARN'>('todos');
  const [seguir, setSeguir] = useState(false);
  const [registro, setRegistro] = useState<Registro | null>(null);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    const res = await apiFetch(`/sistema/registros?archivo=${encodeURIComponent(archivo)}&lineas=${lineas}`);
    const c = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(c.message ?? 'No se pudo leer el registro.');
    setRegistro(c);
  }, [archivo, lineas]);
  const actualizacion = useActualizacionPeriodica(cargar, 5_000, seguir);

  // Sin "seguir en vivo", se lee una vez por cada cambio de archivo o de cantidad.
  useEffect(() => {
    if (seguir) return;
    setError('');
    cargar().catch((e: Error) => setError(e.message));
  }, [cargar, seguir]);

  const visiblesLineas = useMemo(() => (registro?.lineas ?? []).filter((l) =>
    (nivel === 'todos' || l.nivel === nivel) && (!filtro.trim() || l.texto.toLowerCase().includes(filtro.trim().toLowerCase()))), [registro, nivel, filtro]);

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="cm-cabecera">
        <p>Últimas líneas de los registros del servidor. Las contraseñas y los tokens se ocultan antes de mostrarse.</p>
        {seguir && <MarcaActualizacion {...actualizacion} />}
      </div>
      {(error || (seguir && actualizacion.error)) && <Aviso tipo="error" texto={error || actualizacion.error || ''} />}

      <section className="cm-panel" aria-labelledby="r-filtros">
        <h2 id="r-filtros" className="sr-only">Filtros</h2>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, alignItems: 'flex-end' }}>
          <div><label htmlFor="r-archivo">Registro</label>
            <select id="r-archivo" className="input-field" value={archivo} onChange={(e) => setArchivo(e.target.value)}>{ARCHIVOS.map((a) => <option key={a.clave} value={a.clave}>{a.nombre}</option>)}</select></div>
          <div><label htmlFor="r-lineas">Líneas</label>
            <select id="r-lineas" className="input-field" value={lineas} onChange={(e) => setLineas(Number(e.target.value))}>{[100, 200, 500].map((n) => <option key={n} value={n}>{n}</option>)}</select></div>
          <div><label htmlFor="r-nivel">Nivel</label>
            <select id="r-nivel" className="input-field" value={nivel} onChange={(e) => setNivel(e.target.value as typeof nivel)}>
              <option value="todos">Todos</option><option value="ERROR">Solo errores</option><option value="WARN">Solo avisos</option>
            </select></div>
          <div><label htmlFor="r-filtro">Contiene</label>
            <input id="r-filtro" className="input-field" value={filtro} onChange={(e) => setFiltro(e.target.value)} placeholder="Texto a buscar" /></div>
          <label htmlFor="r-seguir" style={{ display: 'inline-flex', gap: 6, alignItems: 'center' }}>
            <input id="r-seguir" type="checkbox" checked={seguir} onChange={(e) => setSeguir(e.target.checked)} />Seguir en vivo
          </label>
          {!seguir && <button type="button" className="service-secondary" onClick={() => { setError(''); cargar().catch((e: Error) => setError(e.message)); }}>Actualizar</button>}
        </div>
      </section>

      {registro && !registro.disponible && <p className="cm-vacio">No disponible: {registro.motivo}</p>}
      {registro?.disponible && <section className="cm-panel" aria-labelledby="r-visor">
        <h2 id="r-visor"><span>{registro.archivo}</span><span className="cm-vacio">modificado {fechaLegible(registro.actualizadoEn)} · {visiblesLineas.length} línea(s)</span></h2>
        {visiblesLineas.length === 0 ? <p className="cm-vacio">Ninguna línea coincide.</p>
          : <div className="registro-visor" role="log" aria-live="off">{visiblesLineas.map((l, i) => <div key={i} className={`registro-linea ${l.nivel === 'ERROR' ? 'error' : l.nivel === 'WARN' ? 'warn' : ''}`}>{l.texto}</div>)}</div>}
      </section>}

      {AUDITORIAS.some((a) => visibles.has(a.ruta)) && <section className="cm-panel" aria-labelledby="r-auditorias">
        <h2 id="r-auditorias">Auditorías</h2>
        <div className="cm-acciones">{AUDITORIAS.filter((a) => visibles.has(a.ruta)).map((a) => <Link key={a.ruta} href={a.ruta} className="cm-acceso">{a.nombre}</Link>)}</div>
      </section>}
    </div>
  );
}
```

- [ ] **Step 10: Regenerar el catálogo y verificar**

Run: `cd frontend; npm run generar:pantallas` → las cinco rutas `/dashboard/sistema*` con `0xC010`–`0xC014`, nombres de la `TABS` y prefijo `sistema:`.
Run: `cd frontend; node --test scripts/pruebas/; npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y; npm run verificar:pantallas`
Run: `cd backend; npx tsc --noEmit -p tsconfig.json`
Expected: todo en verde.

- [ ] **Step 11: Commit**

```bash
git add frontend/src/lib/modulos.ts frontend/src/app/dashboard/sistema frontend/scripts/pruebas/sistema-formatos.test.mjs frontend/src/lib/pantallas.generado.ts frontend/scripts/pantallas-codigos.json backend/src/modules/pantallas/catalogo-web.generado.ts
git commit -m "Sistema: pantallas de estado, tareas, respaldos y base, app móvil y registros

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---
### Task 15: Documentación, pendientes de la app móvil e índice `.context`

**Files:**
- Create: `docs/CENTRO-DE-MANDO.md`
- Create: `docs/PENDIENTES-APP-MOVIL.md`
- Create: `.context/graph/curated/decision/decision--matriz-web-en-permissions-guard.md`
- Create: `.context/graph/curated/rule/rule--pantalla-nueva-entra-a-la-matriz.md`
- Create: `.context/graph/curated/rule/rule--centro-de-mando-solo-personal-activo.md`
- Modify: `CLAUDE.md` (reglas 3 y 11, cómo correrlo)
- Modify: `.context/contexto.md` (documento por tarea)
- Regenerate: `.context/graph/**` (`build-graph.mjs`)

- [ ] **Step 1: `docs/CENTRO-DE-MANDO.md`** (para quien administra el sistema en el cuartel)

```markdown
# Centro de mando, permisos por pantalla y área Sistema

## Centro de mando

Menú › Operaciones › **Centro de mando** (también desde el Inicio). Se actualiza solo cada 10 segundos
mientras la pestaña está a la vista.

- **Quién lo ve.** Quien está vinculado a una ficha de bombero ve el Centro de mando solo si su estado
  está habilitado (por defecto, **solo ACTIVO**). Se cambia en Seguridad › Configuración ›
  "Estados con acceso al Centro de mando". Las cuentas sin ficha de bombero (administración) se rigen
  por sus roles.
- **Qué ve cada uno.** Cada sección exige su permiso por rol y, además, se puede restringir por
  usuario, rol, rango o cargo en Seguridad › Pantallas (grupo "Centro de mando"):

| Sección | Hace falta (alguno) |
|---|---|
| Emergencias en curso | servicios:ver, despacho:responder o despacho:servicio |
| Alertas activas (y marcarlas atendidas o cancelarlas) | servicios:ver (atender: servicios:editar) |
| Móviles | vehiculos:ver o servicios:ver |
| Personal disponible | servicios:ver o despacho:seguimiento |
| Guardia de turno | guardias:ver o servicios:ver |
| Convocatorias abiertas | servicios:ver |
| Pendientes de mi función | cada ítem el suyo (despacho:seguimiento, denuncias:ver, reservas:decidir, vehiculos:ver, personal:ver) |
| Estado del sistema | sistema:ver |
| Mi actividad y Accesos rápidos | cualquier persona con acceso |

- **Emergencias.** Cada uno ve solo las emergencias que integra (participante vigente o personal del
  servicio). Quien tiene despacho:seguimiento o servicios:despachar (central, comandancia) ve todas.

## Permisos por pantalla (toda la web)

Seguridad › **Pantallas** lista todas las pantallas web, agrupadas por módulo, más las secciones del
Centro de mando y las pantallas de la app móvil.

- Una regla nombra a un **usuario, rol, rango o cargo** y marca Ver, Crear, Editar, Eliminar,
  Confidencial o **Denegar**.
- Las reglas **restringen** lo que el rol permite: nunca dan más. Para dar más, se asigna el permiso
  en Roles. **Denegar gana siempre.**
- El servidor las exige en cada pantalla, en menos de un minuto desde que se guardan. El menú, las
  pestañas y el buscador ocultan lo que no se puede ver; una URL escrita a mano muestra "Sin acceso".
- Si una ruta la usan varias pantallas (por ejemplo, la lista de bomberos de los combos), denegar una
  pantalla no la bloquea mientras otra pantalla permitida la use.
- **Vista previa:** elegir un usuario y ver qué pantallas ve y qué puede hacer, y si lo decide su rol
  o una regla.
- La administración de las reglas nunca queda bloqueada por una regla (para no dejar a nadie sin
  forma de deshacerla).

## Área Sistema

Menú › Sistema › **Sistema** (permisos sistema:ver, sistema:operar y sistema:ver_registros).

| Pestaña | Qué muestra | Qué se puede hacer |
|---|---|---|
| Estado | Servidor, base de datos, Snoopy (Ollama, Whisper, Piper), Telegram, conexiones en tiempo real, permisos por pantalla | Probar Ollama; mantenimiento, apagado o reactivación de Snoopy (inteligencia:desactivar) |
| Tareas | Tareas de Windows (respaldo diario, arranque automático), avisos de vencimiento, importación GRE | Revisar vencimientos ahora; procesar una importación GRE (matpel:administrar_gre) |
| Respaldos y base de datos | Respaldos, su integridad, las últimas corridas, alertas; migraciones aplicadas, pendientes y alteradas | Respaldar ahora (lanza la tarea programada); verificar el SHA-256 de un respaldo |
| App móvil | Versión publicada del APK; QR para instalar y conectar por cada red del servidor | — (reemplaza a conectar-celulares.bat) |
| Registros | Últimas líneas de los registros del servidor, con contraseñas y tokens ocultos | Seguir en vivo, filtrar |

Todo lo que se ejecuta queda en Seguridad › Auditoría. La web no ejecuta comandos libres: solo
tareas con nombre fijo.

## Lo que sigue en la terminal

Iniciar o detener SIGBO, aplicar migraciones, publicar el APK, el túnel a internet y programar
tareas de Windows (ver Sistema › Estado, "Lo que sigue en la terminal").

## Limitaciones conocidas

- En las pantallas que ya existían, los botones de crear, editar y eliminar no se ocultan cuando una
  regla los prohíbe: el servidor los rechaza con un mensaje claro. Se van ocultando pantalla por
  pantalla.
- Las secciones internas de una pantalla (por ejemplo, las del legajo) no tienen reglas propias.
- El registro de respaldos no escribe la fecha de cada corrida: la fecha sale del nombre del archivo.
  Corregirlo requiere volver a registrar la tarea de Windows.
- La 094 y la 095 (GRE) siguen sin aplicar: es una decisión de la institución.

## Para quien desarrolla

- Pantalla nueva ⇒ `cd frontend; npm run generar:pantallas`. Asigna su código (nunca renumera),
  registra a qué rutas de la API llama y actualiza el catálogo del backend. CI corre
  `npm run verificar:pantallas`.
- Lo que el generador no puede deducir va en `frontend/scripts/pantallas-api-extra.json`.
- Especificación: `docs/superpowers/specs/2026-10-09-centro-de-mando-design.md`.
```

- [ ] **Step 2: `docs/PENDIENTES-APP-MOVIL.md`**

```markdown
# Pendientes para la app móvil (corte siguiente)

Se terminó primero la web (2026-10-09). Esto es lo que la app debe incorporar, reutilizando los mismos
endpoints y reglas del backend.

1. **Centro de mando esencial.** Consumir `GET /api/v1/centro-mando` y mostrar solo: emergencias en
   curso, alertas activas, mi actividad y pendientes. Las reglas son las mismas: estado del bombero
   (solo ACTIVO por defecto), permiso base de cada sección y reglas de Seguridad › Pantallas (códigos
   `0xC002`–`0xC00B`). Sin sección Sistema ni accesos rápidos.
2. **Atender alertas** desde el Centro de mando con `PATCH /api/v1/alertas/:id/estado`
   (`servicios:editar`), igual que la web.
3. **Acceso.** Si `GET /api/v1/centro-mando/acceso` responde `acceso: false`, la app no muestra el
   Centro de mando y explica el motivo.
4. **Estados del bombero.** Ahora son ACTIVO, SUSPENDIDO, LICENCIA, BAJA y FALLECIDO. Revisar cualquier
   pantalla de la app que muestre el estado de una persona (hoy `servicio_activo.dart` usa
   `RETIRADO` solo para participantes de un servicio, que no cambia).
5. **Matriz por pantalla.** La app sigue con sus códigos `0xA…` y `GET /pantallas/mis-permisos`; la web
   usa `GET /pantallas/mis-permisos-web`. No mezclar.
6. **Conexión por QR.** La pantalla web Sistema › App móvil genera los mismos QR (`sigbo://servidor?url=…`
   e instalación) que `conectar-celulares.bat`; la app no cambia.
7. **Actualización.** La web consulta cada 10 s; en la app conviene el SSE existente
   (`/despacho/stream`, `/alertas/stream`) más una consulta al volver al frente.
8. **No va en la app:** mantenimiento de Snoopy, respaldos, registros, migraciones y reglas por pantalla.
```

- [ ] **Step 3: Nodos curados**

Antes, buscar los ids existentes que se van a enlazar: `node .context/graph/context.mjs pantallas matriz permisos --level L2` (anotar los ids de `component--…pantallas…`, `rule--confidencial-lo-decide-la-matriz` y del dominio seguridad). En `edges` usar **solo** ids que aparezcan en esa salida.

`.context/graph/curated/decision/decision--matriz-web-en-permissions-guard.md`:

```markdown
---
id: decision--matriz-web-en-permissions-guard
tipo: DECISION
nombre: La matriz por pantalla rige toda la web y se exige en PermissionsGuard
nivel: L1
resumen: Las reglas por usuario/rol/rango/cargo de seguridad.pantalla_permisos se aplican a todas las pantallas web. El catálogo (código estable + rutas de API por pantalla) lo genera el frontend; el backend lo cruza con sus rutas reales al arrancar, sincroniza seguridad.pantallas y decide en PermissionsGuard después del rol. Sin reglas no cambia nada.
estado: IMPLEMENTADA
dominio: seguridad
fuente: docs/superpowers/specs/2026-10-09-centro-de-mando-design.md
archivos:
  - backend/src/modules/pantallas/matriz-web.logica.ts
  - backend/src/modules/pantallas/matriz-web.service.ts
  - backend/src/modules/seguridad/guards/permissions.guard.ts
  - frontend/scripts/generar-pantallas.mjs
  - frontend/src/lib/permisos-pantalla.ts
edges:
  - [constrains, rule--confidencial-lo-decide-la-matriz]
terminos: [matriz, pantalla, permiso, regla, rol, rango, cargo, usuario, denegar, guard, catalogo]
---

## Decisión

- **Dónde se exige:** dentro de `PermissionsGuard`, que ya está en todos los controladores y corre
  después de `JwtAuthGuard`. Un guard global correría antes de conocer al usuario.
- **Catálogo sincronizado al arrancar**, no por migración: el catálogo es código; las reglas son
  filas que decide la institución. Una pantalla nueva solo necesita `npm run generar:pantallas`.
- **Restringe, no concede.** Denegar gana. Ruta compartida: alcanza con que una de sus pantallas lo
  permita. Rutas exentas (anti-bloqueo): `/pantallas/*`, `/auth/*`, `/salud`, `/centro-mando*`,
  perfil propio.

## Costo

Sobre-asociación: una pantalla queda ligada a todo lo que llaman los archivos que importa (incluidas
funciones de `lib/` que no usa). Denegar una pantalla puede no bloquear una ruta que otra pantalla
también "usa". Se acepta: nunca da más de lo que el rol permite.
```

`.context/graph/curated/rule/rule--pantalla-nueva-entra-a-la-matriz.md`:

```markdown
---
id: rule--pantalla-nueva-entra-a-la-matriz
tipo: RULE
nombre: Pantalla nueva ⇒ npm run generar:pantallas (también alimenta la matriz)
nivel: L1
resumen: El generador asigna el código estable de la pantalla, registra a qué rutas de la API llama y actualiza el catálogo del backend. Si no se corre, la pantalla funciona pero no se puede restringir por usuario/rol/rango/cargo, y CI falla en verificar:pantallas.
severidad: ALTA
dominio: seguridad
archivos: [frontend/scripts/generar-pantallas.mjs, frontend/scripts/pantallas-codigos.json, frontend/scripts/pantallas-api-extra.json]
terminos: [pantalla, generar, catalogo, codigo, matriz, ci]
---

Los códigos de `frontend/scripts/pantallas-codigos.json` **nunca** se renumeran ni se reutilizan:
las reglas los referencian. Una llamada que el generador no puede deducir (ruta armada en una
variable) se declara en `pantallas-api-extra.json`, junto con los POST que no crean nada.
```

`.context/graph/curated/rule/rule--centro-de-mando-solo-personal-activo.md`:

```markdown
---
id: rule--centro-de-mando-solo-personal-activo
tipo: RULE
nombre: El Centro de mando solo lo ve el personal en un estado habilitado y cada uno ve sus emergencias
nivel: L1
resumen: Con ficha de bombero, el estado debe estar en operations.commandCenterStates (por defecto ACTIVO); si no, GET /centro-mando no devuelve nada. Las emergencias en curso se filtran por participación salvo despacho:seguimiento o servicios:despachar.
severidad: ALTA
dominio: servicios
archivos: [backend/src/modules/centro-mando/centro-mando.service.ts, backend/src/modules/centro-mando/centro-mando.logica.ts, backend/src/modules/despacho/servicio-activo.service.ts]
terminos: [centro, mando, estado, activo, licencia, baja, emergencia, participacion, supervision]
---

Estados del bombero (mig. 097): ACTIVO, SUSPENDIDO, LICENCIA, BAJA, FALLECIDO. Las cuentas sin ficha
de bombero se rigen por sus roles.
```

- [ ] **Step 4: `CLAUDE.md` y `.context/contexto.md`**

En `CLAUDE.md` del proyecto:
- Regla 3, al final: "Además, la matriz por pantalla (Seguridad › Pantallas) puede restringir cualquier endpoint usado por una pantalla web; ver `docs/CENTRO-DE-MANDO.md`."
- Regla 11: reemplazar la primera oración por "**Pantalla nueva ⇒ `npm run generar:pantallas`.** Alimenta las migas, el buscador (Ctrl+K) **y la matriz de permisos por pantalla** (código estable y rutas de API); CI lo verifica con `npm run verificar:pantallas`."
- "Cómo correrlo": agregar al principio "`iniciar-sigbo.bat -Rebuild` (o `iniciar-sigbo.ps1`) levanta SQL Server en Docker, Ollama, el backend (3001) y el frontend (**3002**); `start-sigbo.ps1` es el iniciador anterior (frontend en 3000)."

En `.context/contexto.md`, sección "Documentos por tarea", agregar:
`- [CENTRO-DE-MANDO.md](<../docs/CENTRO-DE-MANDO.md>) — Centro de mando, permisos por pantalla en toda la web y área Sistema`

- [ ] **Step 5: Regenerar y validar el grafo**

Run: `node .context/graph/build-graph.mjs; node .context/graph/validar.mjs`
Expected: código 0; leer el encabezado (ERRORES debe ser 0; los avisos previos pueden seguir).

- [ ] **Step 6: Commit**

```bash
git add docs/CENTRO-DE-MANDO.md docs/PENDIENTES-APP-MOVIL.md .context CLAUDE.md
git commit -m "Documentación: Centro de mando, permisos por pantalla, área Sistema y pendientes de la app

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 16: Verificación completa y recorrido real

**Files:**
- Create (temporal, fuera del repo): `<scratchpad>/verificar-centro-mando.mjs`
- Modify: `.context/proyecto.json` (`LAST_VALIDATION`) y `docs/superpowers/specs/2026-10-09-centro-de-mando-design.md` (estado)

- [ ] **Step 1: Suites y auditorías**

```powershell
cd backend; npm test
cd ..\frontend; npm test; npx tsc --noEmit; npm run audit:contraste; npm run audit:a11y; npm run verificar:pantallas
cd ..; node scripts\verificar-endpoints.mjs
powershell.exe -NoProfile -ExecutionPolicy Bypass -File database\run-migrations.ps1 -ValidateOnly
```
Expected: backend solo con las 2 fallas previas de `despacho.spec.ts`; el resto en verde. `verificar-endpoints` no debe listar rutas nuevas sin backend (si lista `descargarArchivo` de exportaciones viejas, anotarlo como hallazgo previo, no corregirlo aquí).

- [ ] **Step 2: Levantar todo con lo compilado nuevo**

Run: `powershell.exe -NoProfile -ExecutionPolicy Bypass -File iniciar-sigbo.ps1 -Rebuild -NoBrowser -NoPause` (en segundo plano; tarda unos minutos).
Expected: "SIGBO-CBVC listo"; `logs\backend-err.log` sin errores de inyección ni de la matriz.

- [ ] **Step 3: Recorrido por la API con dos usuarios**

Escribir en el scratchpad `verificar-centro-mando.mjs` (lee `SIGBO_DEMO_PASSWORD` de `backend/.env` sin imprimirlo; login con `Origin: http://localhost:3002` y `X-SIGBO-Request: 1`), que con `admin` haga y muestre solo el código HTTP y un dato de cada respuesta:
- `GET /pantallas/mis-permisos-web` (cantidad de pantallas), `GET /centro-mando` (claves de secciones), `GET /centro-mando/acceso`;
- `GET /sistema/estado|resumen|tareas|respaldos|migraciones|app-movil|conexion-movil`, `GET /sistema/registros?archivo=backend-out&lineas=20`, `GET /sistema/registros?archivo=..%5C.env` (400);
- `POST /sistema/respaldos/<último .bak>/verificar` (coincide true);
y con un usuario de rol limitado (uno de `docs/CREDENCIALES-Y-ROLES.md`, p. ej. `bombero` si existe; si no, el de menor rol): `GET /sistema/estado` (403), `GET /centro-mando` (secciones solo de sus permisos).
Run: `node <scratchpad>\verificar-centro-mando.mjs`
Expected: los códigos esperados en cada línea.

- [ ] **Step 4: Regla de prueba (y quitarla)**

Con `admin`, por API: `PUT /pantallas/reglas` con `{ pantallaCodigo: <código de /dashboard/deposito/articulos>, sujetoTipo: 'USUARIO', sujetoId: <id del usuario limitado>, ver:false, crear:false, editar:false, eliminar:false, confidencial:false, denegar:true }`. Con el usuario limitado: `GET /deposito/articulos` → 403 con "No tenés permiso para ver en «Artículos»" (si su rol no tenía `deposito:*`, elegir otra pantalla que sí pueda ver). Luego `DELETE /pantallas/reglas/:id` y repetir → 200. Confirmar en `GET /seguridad/auditoria?recurso=seguridad.pantalla_permisos` las tres entradas (alta, denegación, baja).

- [ ] **Step 5: Operaciones reales del área Sistema**

- `POST /sistema/respaldos/ejecutar` → 200; repetirlo enseguida → 409. Esperar a que la tarea termine y confirmar un `.bak` nuevo en `respaldos\` y `RESULTADO: OK` al final de `registro.log`.
- `POST /sistema/tareas/avisos-vencimiento/ejecutar` → 200 (`motivo: 'Telegram no configurado'` si no hay Telegram: es el dato real).
- `POST /matpel/administracion/importaciones/procesar` → 409 con el motivo de 094/095 (esperado en esta base).

- [ ] **Step 6: Recorrido en el navegador**

Con Playwright (http://localhost:3002), como `admin`: Inicio (estado real, botón del Centro de mando), Centro de mando (secciones, "Actualizado hace…"), Sistema (las cinco pestañas: Estado, Tareas, Respaldos y base, App móvil con los QR, Registros con "Seguir en vivo"), Seguridad › Pantallas (búsqueda, rutas, vista previa del usuario limitado). Como el usuario limitado: el menú no muestra Sistema; `/dashboard/sistema` muestra "Sin acceso" o la pantalla con 403 según sus permisos; con la regla del Step 4 activa, la pestaña denegada no aparece y su URL muestra "Sin acceso". Revisar la consola del navegador (sin errores salvo el `favicon.ico` previo). Borrar la carpeta `.playwright-mcp` que deja la herramienta.

- [ ] **Step 7: Registrar la validación**

En `.context/proyecto.json`, `LAST_VALIDATION`: fecha de hoy, revisión (`git rev-parse HEAD`), comandos de los Steps 1–6 y resultado real (incluidas las 2 fallas previas de Despacho). En la spec, cambiar el estado a "implementada (2026-10-09)". Commit:

```bash
git add .context/proyecto.json docs/superpowers/specs/2026-10-09-centro-de-mando-design.md
git commit -m "Centro de mando: validación completa registrada

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

No hacer push: informar al usuario y esperar su pedido.
