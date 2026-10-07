# Centro de Operaciones e Incidentes (corte 1): plan de implementación

> **Para agentes:** SUB-SKILL OBLIGATORIA: usar `superpowers:subagent-driven-development` (recomendado) o
> `superpowers:executing-plans` para ejecutar este plan tarea por tarea. Los pasos usan casillas
> (`- [ ]`) para el seguimiento. Marcá cada casilla al terminar el paso.

**Objetivo:** que un comandante gestione un incidente real durante varios minutos sin escribir
formularios, mientras SIGBO arma solo la cronología, y que al cerrar salga el informe de lo registrado.

**Arquitectura:** el incidente **es** la fila de `servicios.servicios`, ampliada con una fase operativa
de 10 estados; el `estado` heredado (5 valores) se deriva siempre de la fase. Toda acción escribe un
evento en una bitácora única e inmutable (`servicios.incidente_eventos`) **dentro de la misma
transacción** que la acción. Un módulo chico (`incidente-nucleo`) concentra la bitácora y el motor de
fases y lo usan `flota`, `campo`, `despacho` e `incidentes`, sin dependencias circulares.

**Stack:** NestJS 11 + TypeORM 0.3 sobre SQL Server 2019 Express (`synchronize: false`,
`SnakeNamingStrategy`), Next.js 16 + React 19 sin librería de UI, Leaflet + OpenStreetMap, Jest en el
backend y `node --test` (con eliminación de tipos de Node 24) en el frontend.

**Spec:** [docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md](../specs/2026-10-06-centro-operaciones-incidentes-design.md):
leela entera antes de empezar. Este plan la implementa; si algo choca, gana la spec, salvo los
**ajustes D1–D15** de la sección siguiente, que la corrigen y ya están reflejados en ella (§12 de la spec).

---

## Ajustes a la spec descubiertos al escribir el plan

- **D1. MENSAJE → COMUNICACIÓN.** El chat existente (`POST /despacho/servicios/:id/mensajes`) exige
  ser participante del servicio y permiso de la matriz de pantallas (`0xA007`). Un bombero que llega por
  la tripulación del móvil no es participante, así que no podría escribir. El botón del Modo Incidente
  pasa a ser **COMUNICACIÓN**, que registra una entrada de la bitácora de comunicaciones (punto 28 del
  pedido) con `POST /incidentes/:id/comunicacion` y el tipo de evento nuevo `COMUNICACION`. El chat
  sigue escribiendo eventos `MENSAJE` en la bitácora.
- **D2. `GET /incidentes/activos`** (`servicios:ver` o `servicios:operar`): lista corta para que el
  bombero entre al Modo Incidente desde el inicio del sistema.
- **D3. Prioridad por defecto = MODERADA (Media).** `tipos_servicio.prioridad` es un entero de orden,
  no una gravedad, así que no se traduce.
- **D4. Login.** La pantalla de login solo vuelve a `/fichar`. Se agrega `/incidente/<id>` a esa lista
  blanca para que quien abre un enlace del Modo Incidente sin sesión vuelva a él.
- **D5. Fotos.** `POST /adjuntos` exige `adjuntos:subir`, que hoy solo tienen los roles con
  `servicios:crear`. La migración se lo da también a quien tenga `servicios:operar`; si no, la FOTO
  del Modo Incidente daría 403 al bombero.
- **D6. Servicios cargados por la comunicación.** Al rellenar la fase de los servicios existentes, uno
  `REGISTRADO` que tiene comunicación queda `CERRADO`: es la documentación de algo que ya pasó y no
  debe aparecer como incidente vivo. Los que se creen desde ahora con el formulario largo nacen
  `RECIBIDO` y la central los cierra con un toque ("Sin intervención") si eran solo papeleo. Lo
  resuelve del todo el corte 4, que genera la comunicación desde el incidente.
- **D7. Catálogos con bomberos.** `GET /incidentes/catalogos` también devuelve los bomberos activos,
  porque el Modo Incidente los necesita para ajustar la tripulación y el bombero no tiene `vehiculos:ver`.
- **D8. Avisos inmediatos.** EMERGENCIA, condición crítica, pedido urgente, recuento con faltantes y nuevo
  servicio viajan por el canal SSE que ya existe (`GET /despacho/stream?solo=incidentes`), que **no cuenta como
  presencia** del despacho. La consulta cada 5 s queda de respaldo (tareas 17 y 21).
- **D9. Control de personal en zona.** ENTRA/SALE por persona y recuento (PAR) del comando. Nadie se libera
  solo: hay alertas en la central y el cierre se bloquea con alguien adentro (tareas 18 y 22).
- **D10. Fotos de víctimas confidenciales.** La categoría VICTIMA solo se ve con `despacho:confidencial` y cada
  acceso se audita. Se usa el permiso directamente, no la matriz de pantallas: es una simplificación de este
  corte (tarea 19).
- **D11. Función como código y minutos exactos.** `personal_servicio.funcion` guarda el código (ya no se
  reconvierte buscando el nombre) y `minutos_servicio` los minutos. Las horas salen de `horasDeServicio`
  (política DEC-4).
- **D12. Tripulación desde la guardia.** `GET /flota/tripulacion/guardia-actual` y la pantalla de tripulación
  muestran la guardia en curso y quién no tiene móvil.
- **D13. Quien no figura en el incidente** queda marcado en la bitácora (`fueraDeAsignacion`) o se rechaza,
  según DEC-2. La EMERGENCIA nunca se bloquea (tarea 19).
- **D14. Modo noche** en el Modo Incidente, si DEC-3 lo aprueba: excepción a la regla 6 limitada a `/incidente`
  (tarea 21).
- **D15. Dos puntos de control.** El backend completo se prueba contra la base real, con concurrencia y avisos
  (tarea 20), y el frontend con un recorrido automatizado en el navegador (tarea 23). Antes de empezar, la
  tarea 0 consulta la base y le pregunta al usuario las decisiones que son del cuartel.

## Orden de ejecución y puntos de control

Las tareas están numeradas por cuándo se escribieron, pero **en este documento ya aparecen en el orden en que
se ejecutan**: seguí el documento de arriba hacia abajo.

| Fase | Tareas, en orden | Punto de control |
|---|---|---|
| 0. Preparación | 0 | Base local arriba, consultas leídas y decisiones del cuartel (DEC-1 a DEC-5) anotadas |
| A. Backend | 1 → 9, 17, 18, 19 | **Tarea 20**: suite completa y prueba viva contra la base real, con concurrencia y avisos. No se pasa a la fase B con algo en rojo |
| B. Frontend | 10 → 15, 21, 22 | **Tarea 23**: recorrido automatizado en el navegador, con el criterio de aceptación en 360 × 740 |
| C. Cierre | 24 | Documentación, grafo y verificación final |

Si la ejecución se reparte en dos sesiones, cortá después de la tarea 20: la fase B solo necesita el backend en
verde y este documento.

## Antes de empezar (obligatorio)

1. Leé `CLAUDE.md`, `.context/contexto.md`, `.context/reglas.md`, `.context/RULES.md`,
   `.context/DESPACHO.md` y la spec.
2. **Hay otras sesiones editando el repo.** Antes de tocar un archivo que ya existe, corré
   `ls -la --time-style=full-iso <archivo>`. Si cambió en los últimos minutos y no fuiste vos, **no lo
   pises**: anotalo en `.context/DESPACHO.md` §0 y avisá al usuario. Antes de **crear** un archivo,
   confirmá que no exista (`ls`).
3. Shell: los comandos de este plan son de **Git Bash** (herramienta Bash). Para PowerShell 5.1 no hay
   `&&`. Con heredocs grandes que tengan comillas simples, escribí el script con la herramienta Write
   y ejecutalo.
4. **Base local:** corre en Docker (contenedor `sigbo-sqlserver`). Si `docker ps` falla, pedile al
   usuario que abra Docker Desktop. Aplicar migraciones:
   `powershell -ExecutionPolicy Bypass -File logs/migrate-local.ps1 2>&1 | tail -5`.
   Consulta suelta:
   `docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -f 65001 -d sigbo_cbvc -Q "<sql>"`
   (la clave de `sa` está en `logs/migrate-local.ps1` o en la variable que ese script usa; no la copies a ningún archivo versionado).
5. **Estado inicial:** `cd backend && npm test` (~2 min). Anotá cuántas suites y casos pasan y cuáles
   fallan **antes** de tu primer cambio, así no te atribuís fallas ajenas. Después, empezá por la **tarea 0**.
6. Trabajá en `main`, como el resto del repo. Un commit por tarea, con el mensaje indicado y la línea
   `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>` al final.

## Restricciones globales

- Todo en **español**: identificadores de dominio, mensajes de error, textos de pantalla y comentarios.
- `synchronize: false`: entidad y migración cambian **juntas**. Una migración aplicada **nunca** se
  edita: si hay que corregirla, va otra con el siguiente número libre. Número de este corte: **093**
  (verificá que siga libre con `ls database/migrations | tail -3`).
- Cada migración nueva se registra en `database/run-migrations.ps1` (array `$ordenMigraciones`) y en
  `database/migrations.sha256` (`<SHA256 en mayúsculas><dos espacios><nombre>`).
- Todo endpoint: `@UseGuards(JwtAuthGuard, PermissionsGuard)` a nivel de clase y
  `@RequirePermission(...)` en cada método. `RequirePermission('a','b')` = alcanza con uno.
- Permisos **exactos**: nuevos `servicios:operar`, `servicios:comandar`, `vehiculos:tripulacion`;
  existentes `servicios:ver`, `servicios:crear`, `servicios:despachar`, `servicios:finalizar`,
  `vehiculos:ver`. Un permiso nuevo se **usa y se siembra** (migración + `backend/src/database/seed-data.ts`).
- **Sin relaciones TypeORM** (`@ManyToOne`, `relations: [...]`): joins explícitos o dos consultas
  armadas en memoria.
- En el núcleo y en todo código que deba probarse con las bases falsas, usá solo
  `m.getRepository(X).findOne/find/save/create/update/delete`, nunca `createQueryBuilder` ni `m.query`.
- Lo que decide la institución es **una fila** (catálogos), nunca una constante en un servicio.
- La hora que manda un dispositivo pasa siempre por `instanteDelHecho` (`backend/src/shared/utils/instante.ts`).
- Frontend: `'use client'`, `useState`/`useEffect`, `cargar()` después de cada mutación,
  `apiFetch('/ruta')` (sin `/api/v1`), `<Aviso>`, `<Cargando>`, `<ComboBuscable>`, `useConfirmacion()`
  en vez de `confirm()`/`alert()`, `<label htmlFor>` + `id` (con `useId()` en listas), `<th scope="col">`.
  Color de texto **siempre** con `var(--…)`; chips con fondo `--ok-fill`/`--bad-fill`/`--warn-fill`/
  `--info-fill`/`--neutral-fill`; botones con fondo sólido oscuro (`.btn-primary` o `#7f1d1d` para
  peligro). Sin Tailwind ni librerías nuevas.
- Pantalla nueva ⇒ entrada en `TABS` del `layout.tsx` del módulo y `npm run generar:pantallas`.
- Solo software libre y autoalojado. **Ninguna dependencia nueva** en este corte.
- No se insertan datos de ejemplo. Los catálogos que se siembran salen de la lista del pedido del usuario.
- Archivos con tildes: UTF-8 sin BOM.

## Puntos a vigilar en la revisión

Casos que la spec implica y que un usuario real va a provocar. Cada uno tiene su prueba en la tarea
que lo implementa.

1. **Reintento de una acción de campo** (doble toque, o la red cae después de que el servidor guardó):
   debe quedar **un solo** evento y devolver el mismo resultado. Pruebas en las tareas 3 y 8.
2. **Reloj del celular corrido**: un LLEGAMOS con `ocurridoEn` anterior a la salida queda acotado a la
   salida, y uno futuro toma la hora del servidor. Prueba en la tarea 5.
3. **Despacho de varios móviles con uno ya ocupado**: ese móvil informa su error y los demás se
   despachan igual. Prueba en la tarea 8.
4. **Cierre con un móvil todavía afuera**: se rechaza con 409 y un mensaje claro. Prueba en la tarea 9.
5. **Condiciones excluyentes**: marcar "Incendio controlado" con "Incendio activo" vigente deja activa
   solo la nueva, en un único evento. Pruebas en las tareas 2 y 8.
6. **Dos personas hacen lo mismo a la vez** (dos operadores despachan el mismo móvil, dos celulares tocan
   LLEGAMOS): gana una y la otra recibe un mensaje claro. Las bases falsas ignoran los bloqueos, así que esto se
   prueba contra la base real en la tarea 20.
7. **Alguien queda registrado dentro de la zona** cuando los móviles vuelven: alerta en la central y el cierre
   se rechaza. Nadie se libera solo. Pruebas en las tareas 18 y 20.
8. **Un aviso crítico** (EMERGENCIA) tiene que llegar a la central en menos de 3 s, sin esperar la consulta
   periódica. Pruebas en las tareas 17 y 20.

---

## Mapa de archivos

### Base de datos

- Crear `database/migrations/093_centro_operaciones_incidentes.sql`.
- Modificar `database/run-migrations.ps1` y `database/migrations.sha256`.

### Backend: entidades (`backend/src/shared/entities/`)

- Crear `incidente.entity.ts` (`IncidenteEvento`, `CondicionSituacion`, `TipoRecurso`, `IncidenteSolicitud` y sus tipos).
- Crear `tripulacion-movil.entity.ts` (`TripulacionMovil`).
- Modificar `servicio.entity.ts`, `despacho.entity.ts`, `personal-servicio.entity.ts`, `campo.entity.ts` (`Adjunto`), `parametro.entity.ts` e `index.ts`.

### Backend: núcleo (`backend/src/modules/incidente-nucleo/`, módulo nuevo)

- `incidente.logica.ts`: funciones puras (fases, resultados, condiciones, pedidos, emergencia, etiquetas).
- `cronologia.service.ts`: escribe en la bitácora.
- `motor-fases.service.ts`: aplica transiciones de fase dentro de la transacción del llamador.
- `contexto.ts`: `origenDe(req)` y `dispositivoDe(req)`.
- `incidente-nucleo.module.ts`.
- Pruebas: `incidente.logica.spec.ts`, `incidente-nucleo.spec.ts`.

### Backend: flota (se modifica)

- Crear `tripulacion.service.ts` y `tripulacion.spec.ts`.
- Modificar `flota.service.ts` (paso `salida`, `salir`, tripulación, motor y bitácora), `flota.controller.ts`, `flota.module.ts`, `dto/flota.dto.ts` y `flota.service.spec.ts`.

### Backend: escriben en la bitácora (se modifican)

- `campo/victimas.service.ts`, `campo/adjuntos.service.ts`, `campo/dto/campo.dto.ts`, `campo/campo.module.ts`, `campo/campo.spec.ts`.
- `despacho/servicio-activo.service.ts`, `despacho/despacho.service.ts`, `despacho/despacho.module.ts` y sus specs.

### Backend: incidentes (`backend/src/modules/incidentes/`, módulo nuevo)

- `dto/incidentes.dto.ts`, `contexto.ts`, `recepcion.service.ts`, `expediente.service.ts`, `acciones.service.ts`, `cierre.service.ts`, `cierre-comun.ts`, `etiquetas.ts`, `avisos.service.ts` (tarea 17), `incidentes.controller.ts`, `incidentes.module.ts`.
- Pruebas: `recepcion.spec.ts`, `expediente.spec.ts`, `acciones.spec.ts`, `cierre.spec.ts`, `avisos.spec.ts`.
- Se modifican además `despacho/despacho-tiempo-real.service.ts` y `despacho/despacho.controller.ts` (canal `?solo=incidentes`, tarea 17).
- Se crea `scripts/smoke-incidente.mjs` (prueba viva, tarea 20).
- Crear `backend/src/modules/servicios/numeracion-servicio.ts` y modificar `servicios.service.ts` para que use la función compartida.
- Modificar `backend/src/app.module.ts` y `backend/src/database/seed-data.ts`.

### Frontend

- Crear `src/lib/incidentes.ts` (tipos y llamadas), `src/lib/cola-incidente.ts` (cola sin conexión, pura), `src/lib/fases-incidente.ts` (etiquetas, pura), `src/lib/use-cronologia.ts` y `src/lib/use-avisos-incidente.ts` (tarea 21).
- Crear `scripts/pruebas/cola-incidente.test.mjs` y `scripts/pruebas/fases-incidente.test.mjs`.
- Crear `src/components/MapaOperativo.tsx`.
- Crear `src/app/dashboard/servicios/operaciones/page.tsx` (Centro de Operaciones).
- Crear `src/app/dashboard/servicios/operaciones/[id]/page.tsx` (incidente: central y comando).
- Crear `src/app/dashboard/servicios/operaciones/[id]/informe/page.tsx` (informe y cierre).
- Crear `src/app/incidente/page.tsx` y `src/app/incidente/[id]/page.tsx` (Modo Incidente).
- Crear `src/app/dashboard/vehiculos/tripulacion/page.tsx`.
- Modificar `src/app/dashboard/servicios/layout.tsx`, `src/app/dashboard/vehiculos/layout.tsx`, `src/app/login/page.tsx`, `src/app/dashboard/page.tsx`, `src/app/globals.css`, `src/lib/flota.ts`, `src/app/dashboard/vehiculos/dotacion/page.tsx` y `package.json` (script `test`).

### Documentación

- Crear `.context/INCIDENTES.md` y los nodos curados en `.context/graph/curated/`.
- Modificar `.context/contexto.md`.

---

## Tarea 0: Verificaciones previas y decisiones del cuartel

**Archivos:**

- Crear: `.context/INCIDENTES.md` (solo la sección de decisiones; la tarea 24 la completa)
- Ningún archivo de código todavía: las respuestas DEC-1 y DEC-5 se aplican al escribir la migración (tarea 1) y DEC-4 al escribir `horasDeServicio` (tarea 2).

**Interfaces:**

- Produce las decisiones **DEC-1 a DEC-5**, que leen las tareas 1, 2, 19 y 21. Si el usuario no contesta, valen las opciones marcadas "(Recomendado)".

- [x] **Paso 1: Base local arriba**

```bash
docker ps --format "{{.Names}} {{.Status}}"
```

Resultado esperado: aparece `sigbo-sqlserver` "Up". Si falla, pedile al usuario que abra Docker Desktop y esperá su confirmación.

- [x] **Paso 2: Consultas de solo lectura**

```bash
Q() { docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -f 65001 -d sigbo_cbvc -h -1 -W -s '|' -Q "SET NOCOUNT ON; $1"; }
Q "SELECT s.estado, COUNT(*) AS total, SUM(CASE WHEN c.servicio_id IS NULL THEN 0 ELSE 1 END) AS con_comunicacion FROM servicios.servicios s LEFT JOIN servicios.comunicaciones_servicio c ON c.servicio_id = s.id GROUP BY s.estado;"
Q "SELECT st.name, st.auto_created, st.user_created FROM sys.stats st JOIN sys.stats_columns sc ON sc.object_id = st.object_id AND sc.stats_id = st.stats_id JOIN sys.columns col ON col.object_id = sc.object_id AND col.column_id = sc.column_id WHERE st.object_id = OBJECT_ID('servicios.despachos') AND col.name = 'hora_salida';"
Q "SELECT definition FROM sys.check_constraints WHERE name = 'CK_param_tipo';"
Q "SELECT nombre FROM seguridad.permisos WHERE nombre IN ('servicios:finalizar','despacho:responder','despacho:seguimiento','despacho:confidencial','adjuntos:subir','vehiculos:ver_mapa') ORDER BY nombre;"
Q "SELECT r.nombre, COUNT(a.id) AS permisos FROM seguridad.roles r LEFT JOIN seguridad.asignacion_permisos_rol a ON a.rol_id = r.id GROUP BY r.nombre ORDER BY r.nombre;"
Q "SELECT estado, COUNT(*) FROM operaciones.guardias WHERE fecha >= DATEADD(day, -1, CAST(SYSDATETIME() AS date)) GROUP BY estado;"
```

Cómo leer cada resultado:

- **Servicios.** En la fila `REGISTRADO`, `total - con_comunicacion` es la cantidad que la migración dejará como RECIBIDO (ajuste D6). Si es mayor que 0, hacé la pregunta DEC-5 del paso 3.
- **Estadísticas de `hora_salida`.** Si alguna tiene `user_created = 1`, agregá a la migración de la tarea 1, en un lote propio (`GO`) **antes** del `ALTER COLUMN hora_salida`, la línea `DROP STATISTICS servicios.despachos.<nombre>;`. Las automáticas (`auto_created = 1`) no bloquean.
- **`CK_param_tipo`.** Tiene que coincidir con la lista de la tarea 1, paso 2. Si hay un tipo de más, sumalo a esa lista.
- **Permisos.** Tienen que aparecer los 6. Si falta alguno, avisale al usuario antes de seguir: varias tareas dependen de ellos.
- **Roles.** Anotá los nombres: con ellos le vas a explicar al usuario quién recibe `servicios:operar` y `servicios:comandar`.
- **Guardias.** Si no hay ninguna `EN_CURSO` ni del día, la tarjeta "Guardia actual" de la tarea 22 dirá que no hay guardia. No es un error.

- [x] **Paso 3: Decisiones del cuartel**

Hacé estas preguntas al usuario con la herramienta de preguntas (`AskUserQuestion`), las cuatro en una sola llamada. Cada respuesta cambia algo concreto:

1. **DEC-1. ¿Qué condiciones disparan la alerta roja en la central?**
   - "Las 10 propuestas (Recomendado)": incendio fuera de control, víctima, víctima atrapada, persona desaparecida, derrumbe, riesgo estructural, material peligroso, riesgo de explosión, riesgo químico y riesgo biológico.
   - "Solo las de personas": víctima, víctima atrapada, persona desaparecida y derrumbe.
   - Otra lista que dicte el usuario.

   Se aplica cambiando la columna `critica` (1/0) en la semilla de `servicios.condiciones_situacion` de la migración 093.

2. **DEC-2. ¿Quién puede registrar acciones en un incidente?**
   - "Cualquiera con servicios:operar, y queda marcado si no figura en el incidente (Recomendado)".
   - "Solo quien figura en el incidente; la EMERGENCIA la puede mandar cualquiera".

   Se aplica en la tarea 19.

3. **DEC-3. ¿Modo noche en el Modo Incidente?**
   - "Sí, con un botón para cambiarlo (Recomendado)". Es una excepción a la regla 6 del repo (tema claro), limitada a `/incidente`.
   - "No, solo tema claro".

   Se aplica en la tarea 21.

4. **DEC-4. ¿Cómo se cuentan las horas de servicio de cada persona?** Los minutos exactos se guardan siempre.
   - "A la hora más cercana (Recomendado)" → `Math.round(minutos / 60)`.
   - "Toda hora empezada cuenta entera" → `Math.ceil(minutos / 60)`.
   - "Solo horas completas" → `Math.floor(minutos / 60)`.

   Se aplica en `horasDeServicio` (tarea 2), ajustando también los valores esperados de su prueba: con `ceil`, 89 → 2 y 90 → 2; con `floor`, 89 → 1 y 90 → 1.

Solo si el paso 2 dio servicios `REGISTRADO` sin comunicación, hacé otra pregunta:

5. **DEC-5. Hay N servicios viejos registrados sin comunicación. ¿Qué hacemos con ellos al migrar?**
   - "Dejarlos como recibidos (Recomendado si son pocos)".
   - "Cerrarlos al migrar con resultado Sin intervención".

   Para cerrarlos, en el `UPDATE` de relleno de la migración 093 reemplazá `THEN 'CERRADO' ELSE 'RECIBIDO' END END,` por `THEN 'CERRADO' ELSE 'CERRADO' END END,` y la línea del resultado por `resultado = CASE WHEN s.estado = 'CANCELADO' THEN 'CANCELADO' WHEN s.estado = 'REGISTRADO' THEN 'SIN_INTERVENCION' ELSE s.resultado END,`.

- [x] **Paso 4: Anotar las decisiones**

Crear `.context/INCIDENTES.md`:

```markdown
# Centro de Operaciones e Incidentes

## 0. Decisiones del cuartel (tarea 0, <fecha>)

| Decisión | Respuesta | Dónde se aplica |
|---|---|---|
| DEC-1 Condiciones críticas | <respuesta> | Semilla de `servicios.condiciones_situacion` (migración 093) |
| DEC-2 Quién registra en un incidente | <respuesta> | `AccionesService.registrarCampo` (tarea 19) |
| DEC-3 Modo noche | <respuesta> | `/incidente` (tarea 21) |
| DEC-4 Horas de servicio | <respuesta> | `horasDeServicio` (tarea 2) |
| DEC-5 Servicios viejos sin comunicación | <respuesta o "no aplica"> | Relleno de la migración 093 |

Resultado de las consultas previas: <cantidad de servicios por estado; estadísticas sobre hora_salida; roles existentes>.
```

Reemplazá cada `<…>` por lo que salió de los pasos 2 y 3. Los cambios que pidan DEC-1 y DEC-5 se
hacen al escribir la migración en la tarea 1, y el de DEC-4 al escribir `horasDeServicio` en la tarea 2:
esos archivos todavía no existen.

- [x] **Paso 5: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add .context/INCIDENTES.md
git commit -m "Incidentes: decisiones del cuartel y verificaciones previas a la implementación

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 1: Migración 093 y entidades

**Archivos:**

- Crear: `database/migrations/093_centro_operaciones_incidentes.sql`
- Modificar: `database/run-migrations.ps1` (array `$ordenMigraciones`, después de `"092_despacho_chofer_habilitado.sql"`)
- Modificar: `database/migrations.sha256` (línea al final)
- Crear: `backend/src/shared/entities/incidente.entity.ts`, `backend/src/shared/entities/tripulacion-movil.entity.ts`
- Modificar: `backend/src/shared/entities/servicio.entity.ts`, `despacho.entity.ts`, `personal-servicio.entity.ts`, `campo.entity.ts`, `parametro.entity.ts`, `index.ts`
- Modificar (compilación por `hora_salida` nula): `backend/src/modules/flota/flota.service.ts`, `flota/dotacion.service.ts`, `flota/informe.service.ts`, `frontend/src/lib/flota.ts`, `frontend/src/app/dashboard/vehiculos/dotacion/page.tsx`
- Modificar: `backend/src/database/seed-data.ts`

**Interfaces:**

- Consume: nada.
- Produce, exportado desde `backend/src/shared/entities`:
  - Tipos `FaseOperativa`, `ResultadoIncidente`, `TipoEventoIncidente`, `OrigenEvento`, `GrupoCondicion`, `CategoriaRecurso`, `PrioridadSolicitud`, `EstadoSolicitudRecurso`, `OrigenPersonalServicio` y `CategoriaFoto`.
  - Entidades `IncidenteEvento`, `CondicionSituacion`, `TipoRecurso`, `IncidenteSolicitud` y `TripulacionMovil`.
  - `Servicio` con `faseOperativa`, `faseDesde` y `resultado`; `Despacho` con `horaDespacho: Date` y `horaSalida: Date | null`; `PersonalServicio` con `vehiculoId`, `despachoId`, `origen`, `funcion`, `enZona`, `zonaDesde` y `minutosServicio`; `Adjunto` con `latitud`, `longitud` y `categoria`; `TipoParametro` con `'FUNCION_INCIDENTE'`.

- [x] **Paso 1: Verificar el número libre y la definición actual de `CK_param_tipo`**

```bash
cd /c/Proyectos/Personal/SIGBO && ls database/migrations | tail -3
docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -f 65001 -d sigbo_cbvc -h -1 -W \
  -Q "SET NOCOUNT ON; SELECT definition FROM sys.check_constraints WHERE name = 'CK_param_tipo';"
```

Resultado esperado: la última migración es `092_…` y la definición contiene **exactamente** los tipos
de la lista del paso 2 (la de `062_finanzas_socios_protectores.sql`). Si aparece otro tipo, agregalo a
la lista del paso 2 antes de seguir. (La tarea 0 ya hizo esta consulta: si ya la tenés, no hace falta repetirla.)

Al escribir la migración del paso 2 aplicá las decisiones de la tarea 0: **DEC-1** (valores de `critica` en la
semilla de condiciones), **DEC-5** (relleno de servicios viejos) y, si hubo estadísticas creadas a mano sobre
`hora_salida`, su `DROP STATISTICS` antes del `ALTER COLUMN`.

- [x] **Paso 2: Escribir la migración**

Crear `database/migrations/093_centro_operaciones_incidentes.sql` con este contenido exacto:

```sql
/* =============================================================
   SIGBO-CBVC | Migracion 093 - Centro de Operaciones e Incidentes (corte 1)
   =============================================================
   Spec: docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md
   - El incidente es el servicio: fase operativa (10 fases), resultado y fase_desde.
     El estado heredado se deriva de la fase en el codigo (incidente.logica.ts).
   - Despachos: hora_despacho; hora_salida admite NULL (movil asignado que aun no salio).
   - Bitacora unica e inmutable del incidente (incidente_eventos), con disparador.
   - Catalogos configurables: condiciones de situacion/riesgo y tipos de recurso.
   - Pedidos de recurso con ciclo SCI y tripulacion vigente por movil.
   - personal_servicio y adjuntos ampliados; parametro FUNCION_INCIDENTE.
   - Permisos servicios:operar, servicios:comandar, vehiculos:tripulacion. */
SET ANSI_NULLS ON;
SET QUOTED_IDENTIFIER ON;
GO

/* --- 1) Servicio: fase operativa y resultado --- */
IF COL_LENGTH('servicios.servicios', 'fase_operativa') IS NULL
    ALTER TABLE servicios.servicios ADD fase_operativa NVARCHAR(20) NOT NULL
        CONSTRAINT DF_ser_fase DEFAULT 'RECIBIDO';
GO
IF COL_LENGTH('servicios.servicios', 'fase_desde') IS NULL
    ALTER TABLE servicios.servicios ADD fase_desde DATETIMEOFFSET(3) NULL;
GO
IF COL_LENGTH('servicios.servicios', 'resultado') IS NULL
    ALTER TABLE servicios.servicios ADD resultado NVARCHAR(20) NULL;
GO
/* Relleno de los servicios existentes. Un servicio REGISTRADO que tiene comunicacion es la
   documentacion de algo que ya paso (el formulario largo se carga despues): queda CERRADO para no
   aparecer como incidente vivo en el Centro de Operaciones. Uno REGISTRADO sin comunicacion vino de
   otro flujo y queda RECIBIDO. El estado heredado de estas filas no se toca. */
UPDATE s
SET fase_operativa = CASE s.estado
        WHEN 'DESPACHADO' THEN 'DESPACHADO'
        WHEN 'EN_CURSO' THEN 'OPERANDO'
        WHEN 'FINALIZADO' THEN 'CERRADO'
        WHEN 'CANCELADO' THEN 'CERRADO'
        ELSE CASE WHEN EXISTS (SELECT 1 FROM servicios.comunicaciones_servicio c WHERE c.servicio_id = s.id)
                  THEN 'CERRADO' ELSE 'RECIBIDO' END END,
    resultado = CASE WHEN s.estado = 'CANCELADO' THEN 'CANCELADO' ELSE s.resultado END,
    fase_desde = s.actualizado_en
FROM servicios.servicios s
WHERE s.fase_desde IS NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ser_fase')
    ALTER TABLE servicios.servicios ADD CONSTRAINT CK_ser_fase CHECK (fase_operativa IN (
        'RECIBIDO', 'EVALUACION', 'DESPACHADO', 'EN_CAMINO', 'EN_LUGAR',
        'OPERANDO', 'CONTROLADO', 'RETORNO', 'DISPONIBLE', 'CERRADO'));
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_ser_resultado')
    ALTER TABLE servicios.servicios ADD CONSTRAINT CK_ser_resultado CHECK (resultado IS NULL OR resultado IN (
        'CONTROLADO', 'RESUELTO', 'FALSA_ALARMA', 'CANCELADO', 'DERIVADO',
        'NO_ATENDIDO', 'SIN_ACCESO', 'SIN_INTERVENCION'));
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_ser_fase' AND object_id = OBJECT_ID('servicios.servicios'))
    CREATE INDEX IX_ser_fase ON servicios.servicios (fase_operativa, fase_desde);
GO

/* --- 2) Despachos: asignar sin salir --- */
IF COL_LENGTH('servicios.despachos', 'hora_despacho') IS NULL
    ALTER TABLE servicios.despachos ADD hora_despacho DATETIMEOFFSET(3) NULL;
GO
UPDATE servicios.despachos SET hora_despacho = hora_salida WHERE hora_despacho IS NULL;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('servicios.despachos') AND name = 'hora_despacho' AND is_nullable = 1)
    ALTER TABLE servicios.despachos ALTER COLUMN hora_despacho DATETIMEOFFSET(3) NOT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_desp_despacho')
    ALTER TABLE servicios.despachos ADD CONSTRAINT DF_desp_despacho DEFAULT SYSDATETIMEOFFSET() FOR hora_despacho;
GO
/* hora_salida pasa a admitir NULL: antes hay que soltar el indice y el valor por defecto que la usan. */
IF EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_desp_servicio' AND object_id = OBJECT_ID('servicios.despachos'))
    DROP INDEX IX_desp_servicio ON servicios.despachos;
GO
IF EXISTS (SELECT 1 FROM sys.default_constraints WHERE name = 'DF_desp_salida')
    ALTER TABLE servicios.despachos DROP CONSTRAINT DF_desp_salida;
GO
IF EXISTS (SELECT 1 FROM sys.columns WHERE object_id = OBJECT_ID('servicios.despachos') AND name = 'hora_salida' AND is_nullable = 0)
    ALTER TABLE servicios.despachos ALTER COLUMN hora_salida DATETIMEOFFSET(3) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_desp_servicio' AND object_id = OBJECT_ID('servicios.despachos'))
    CREATE INDEX IX_desp_servicio ON servicios.despachos (servicio_id, hora_despacho DESC);
GO

/* --- 3) Bitacora del incidente: solo se agrega --- */
IF OBJECT_ID('servicios.incidente_eventos', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.incidente_eventos (
        id BIGINT IDENTITY(1,1) NOT NULL CONSTRAINT PK_incidente_eventos PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        tipo NVARCHAR(40) NOT NULL,
        titulo NVARCHAR(200) NOT NULL,
        ocurrido_en DATETIMEOFFSET(3) NOT NULL,
        registrado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_inev_registrado DEFAULT SYSDATETIMEOFFSET(),
        usuario_id UNIQUEIDENTIFIER NULL,
        usuario_nombre NVARCHAR(120) NULL,
        vehiculo_id UNIQUEIDENTIFIER NULL,
        despacho_id UNIQUEIDENTIFIER NULL,
        latitud DECIMAL(10, 8) NULL,
        longitud DECIMAL(11, 8) NULL,
        precision_m DECIMAL(7, 1) NULL,
        fase_anterior NVARCHAR(20) NULL,
        fase_nueva NVARCHAR(20) NULL,
        fuente NVARCHAR(30) NULL,
        fuente_id NVARCHAR(64) NULL,
        datos NVARCHAR(MAX) NULL CONSTRAINT CK_inev_datos CHECK (datos IS NULL OR ISJSON(datos) = 1),
        critico BIT NOT NULL CONSTRAINT DF_inev_critico DEFAULT 0,
        origen NVARCHAR(10) NOT NULL CONSTRAINT CK_inev_origen CHECK (origen IN ('WEB', 'APP', 'SISTEMA')),
        dispositivo NVARCHAR(200) NULL,
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT CK_inev_tipo CHECK (tipo IN (
            'SERVICIO_RECIBIDO', 'LLAMADO_VINCULADO', 'FASE_CAMBIADA', 'PRIORIDAD_CAMBIADA',
            'MOVIL_DESPACHADO', 'MOVIL_SALIO', 'MOVIL_LLEGO', 'MOVIL_RETORNA', 'MOVIL_DISPONIBLE',
            'DESPACHO_CANCELADO', 'TRIPULACION_AJUSTADA', 'PERSONAL_SUMADO', 'COMANDO_ASUMIDO',
            'SITUACION_MARCADA', 'SITUACION_RESUELTA', 'RECURSO_SOLICITADO', 'RECURSO_ACTUALIZADO',
            'VICTIMA_REGISTRADA', 'FOTO_TOMADA', 'MENSAJE', 'COMUNICACION', 'EMERGENCIA',
            'EMERGENCIA_ATENDIDA', 'RESULTADO_DECLARADO', 'INCIDENTE_CERRADO',
            'PERSONAL_ENTRA_ZONA', 'PERSONAL_SALE_ZONA', 'RECUENTO_PERSONAL')),
        CONSTRAINT FK_inev_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_inev_usuario FOREIGN KEY (usuario_id) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_inev_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_inev_servicio' AND object_id = OBJECT_ID('servicios.incidente_eventos'))
    CREATE INDEX IX_inev_servicio ON servicios.incidente_eventos (servicio_id, id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_inev_idempotencia' AND object_id = OBJECT_ID('servicios.incidente_eventos'))
    CREATE UNIQUE INDEX UX_inev_idempotencia ON servicios.incidente_eventos (servicio_id, clave_idempotencia)
        WHERE clave_idempotencia IS NOT NULL;
GO
IF OBJECT_ID('servicios.TR_incidente_eventos_inmutable', 'TR') IS NULL
    EXEC('CREATE TRIGGER servicios.TR_incidente_eventos_inmutable ON servicios.incidente_eventos
          INSTEAD OF UPDATE, DELETE
          AS
          BEGIN
              THROW 51093, N''La bitacora del incidente es inmutable: no se puede modificar ni borrar.'', 1;
          END');
GO

/* --- 4) Catalogo de condiciones (situacion y riesgo). Lista del pedido, sin repetir. --- */
IF OBJECT_ID('servicios.condiciones_situacion', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.condiciones_situacion (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_condsit_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_condiciones_situacion PRIMARY KEY,
        codigo NVARCHAR(40) NOT NULL CONSTRAINT UQ_condsit_codigo UNIQUE,
        nombre NVARCHAR(80) NOT NULL,
        grupo NVARCHAR(12) NOT NULL CONSTRAINT CK_condsit_grupo CHECK (grupo IN ('SITUACION', 'RIESGO')),
        critica BIT NOT NULL CONSTRAINT DF_condsit_critica DEFAULT 0,
        grupo_excluyente NVARCHAR(30) NULL,
        orden INT NOT NULL CONSTRAINT DF_condsit_orden DEFAULT 0,
        activo BIT NOT NULL CONSTRAINT DF_condsit_activo DEFAULT 1
    );
END
GO
INSERT INTO servicios.condiciones_situacion (codigo, nombre, grupo, critica, grupo_excluyente, orden)
SELECT v.codigo, v.nombre, v.grupo, v.critica, v.excluyente, v.orden FROM (VALUES
    (N'INCENDIO_ACTIVO',        N'Incendio activo',           N'SITUACION', 0, N'INCENDIO', 10),
    (N'INCENDIO_FUERA_CONTROL', N'Incendio fuera de control', N'SITUACION', 1, N'INCENDIO', 20),
    (N'INCENDIO_CONTROLADO',    N'Incendio controlado',       N'SITUACION', 0, N'INCENDIO', 30),
    (N'PROPAGACION',            N'Propagación',               N'SITUACION', 0, NULL, 40),
    (N'VICTIMA',                N'Víctima',                   N'SITUACION', 1, NULL, 50),
    (N'VICTIMA_ATRAPADA',       N'Víctima atrapada',          N'SITUACION', 1, NULL, 60),
    (N'PERSONA_DESAPARECIDA',   N'Persona desaparecida',      N'SITUACION', 1, NULL, 70),
    (N'EVACUACION',             N'Evacuación',                N'SITUACION', 0, NULL, 80),
    (N'INUNDACION',             N'Inundación',                N'SITUACION', 0, NULL, 90),
    (N'DERRUMBE',               N'Derrumbe',                  N'SITUACION', 1, NULL, 100),
    (N'ACCIDENTE_VEHICULAR',    N'Accidente vehicular',       N'SITUACION', 0, NULL, 110),
    (N'OTRA_SITUACION',         N'Otra situación',            N'SITUACION', 0, NULL, 120),
    (N'RIESGO_ESTRUCTURAL',     N'Riesgo estructural',        N'RIESGO',    1, NULL, 210),
    (N'RIESGO_ELECTRICO',       N'Riesgo eléctrico',          N'RIESGO',    0, NULL, 220),
    (N'MATERIAL_PELIGROSO',     N'Material peligroso',        N'RIESGO',    1, NULL, 230),
    (N'RIESGO_EXPLOSION',       N'Riesgo de explosión',       N'RIESGO',    1, NULL, 240),
    (N'RIESGO_QUIMICO',         N'Riesgo químico',            N'RIESGO',    1, NULL, 250),
    (N'RIESGO_BIOLOGICO',       N'Riesgo biológico',          N'RIESGO',    1, NULL, 260),
    (N'TRAFICO',                N'Tráfico',                   N'RIESGO',    0, NULL, 270),
    (N'CONDICIONES_CLIMATICAS', N'Condiciones climáticas',    N'RIESGO',    0, NULL, 280),
    (N'EPP_OBLIGATORIO',        N'EPP obligatorio',           N'RIESGO',    0, NULL, 290),
    (N'OTRO_RIESGO',            N'Otro riesgo',               N'RIESGO',    0, NULL, 300)
) AS v(codigo, nombre, grupo, critica, excluyente, orden)
WHERE NOT EXISTS (SELECT 1 FROM servicios.condiciones_situacion c WHERE c.codigo = v.codigo);
GO

/* --- 5) Catalogo de tipos de recurso de la SOLICITUD RAPIDA --- */
IF OBJECT_ID('servicios.tipos_recurso', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.tipos_recurso (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tiporec_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_tipos_recurso PRIMARY KEY,
        codigo NVARCHAR(30) NOT NULL CONSTRAINT UQ_tiporec_codigo UNIQUE,
        nombre NVARCHAR(80) NOT NULL,
        categoria NVARCHAR(10) NOT NULL CONSTRAINT CK_tiporec_categoria CHECK (categoria IN ('MOVIL', 'PERSONAL', 'INSUMO', 'EXTERNO', 'OTRO')),
        orden INT NOT NULL CONSTRAINT DF_tiporec_orden DEFAULT 0,
        activo BIT NOT NULL CONSTRAINT DF_tiporec_activo DEFAULT 1
    );
END
GO
INSERT INTO servicios.tipos_recurso (codigo, nombre, categoria, orden)
SELECT v.codigo, v.nombre, v.categoria, v.orden FROM (VALUES
    (N'AUTOBOMBA',     N'Autobomba',     N'MOVIL',    10),
    (N'RESCATE',       N'Rescate',       N'MOVIL',    20),
    (N'CISTERNA',      N'Cisterna',      N'MOVIL',    30),
    (N'AMBULANCIA',    N'Ambulancia',    N'EXTERNO',  40),
    (N'PERSONAL',      N'Personal',      N'PERSONAL', 50),
    (N'HERRAMIENTAS',  N'Herramientas',  N'INSUMO',   60),
    (N'ESPUMA',        N'Espuma',        N'INSUMO',   70),
    (N'AGUA',          N'Agua',          N'INSUMO',   80),
    (N'POLICIA',       N'Policía',       N'EXTERNO',  90),
    (N'HOSPITAL',      N'Hospital',      N'EXTERNO', 100),
    (N'OTRA_COMPANIA', N'Otra compañía', N'EXTERNO', 110),
    (N'OTRO',          N'Otro recurso',  N'OTRO',    120)
) AS v(codigo, nombre, categoria, orden)
WHERE NOT EXISTS (SELECT 1 FROM servicios.tipos_recurso t WHERE t.codigo = v.codigo);
GO

/* --- 6) Pedidos de recurso del incidente (ciclo SCI) --- */
IF OBJECT_ID('servicios.incidente_solicitudes', 'U') IS NULL
BEGIN
    CREATE TABLE servicios.incidente_solicitudes (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_insol_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_incidente_solicitudes PRIMARY KEY,
        servicio_id UNIQUEIDENTIFIER NOT NULL,
        tipo_recurso_id UNIQUEIDENTIFIER NOT NULL,
        cantidad INT NOT NULL CONSTRAINT DF_insol_cantidad DEFAULT 1 CONSTRAINT CK_insol_cantidad CHECK (cantidad > 0),
        prioridad NVARCHAR(10) NOT NULL CONSTRAINT CK_insol_prioridad CHECK (prioridad IN ('NORMAL', 'URGENTE')),
        estado NVARCHAR(12) NOT NULL CONSTRAINT DF_insol_estado DEFAULT 'SOLICITADO'
            CONSTRAINT CK_insol_estado CHECK (estado IN ('SOLICITADO', 'APROBADO', 'DESPACHADO', 'EN_CAMINO', 'EN_USO', 'LIBERADO', 'RECHAZADO', 'CANCELADO')),
        observacion NVARCHAR(300) NULL,
        solicitado_por UNIQUEIDENTIFIER NOT NULL,
        solicitado_en DATETIMEOFFSET(3) NOT NULL,
        actualizado_por UNIQUEIDENTIFIER NULL,
        actualizado_en DATETIMEOFFSET(3) NOT NULL,
        version INT NOT NULL CONSTRAINT DF_insol_version DEFAULT 0,
        clave_idempotencia NVARCHAR(64) NULL,
        CONSTRAINT FK_insol_servicio FOREIGN KEY (servicio_id) REFERENCES servicios.servicios(id),
        CONSTRAINT FK_insol_tipo FOREIGN KEY (tipo_recurso_id) REFERENCES servicios.tipos_recurso(id),
        CONSTRAINT FK_insol_solicitado FOREIGN KEY (solicitado_por) REFERENCES seguridad.usuarios(id),
        CONSTRAINT FK_insol_actualizado FOREIGN KEY (actualizado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_insol_servicio' AND object_id = OBJECT_ID('servicios.incidente_solicitudes'))
    CREATE INDEX IX_insol_servicio ON servicios.incidente_solicitudes (servicio_id, estado);
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'UX_insol_idempotencia' AND object_id = OBJECT_ID('servicios.incidente_solicitudes'))
    CREATE UNIQUE INDEX UX_insol_idempotencia ON servicios.incidente_solicitudes (servicio_id, clave_idempotencia)
        WHERE clave_idempotencia IS NOT NULL;
GO

/* --- 7) Tripulacion vigente de cada movil (se carga al tomar la guardia) --- */
IF OBJECT_ID('vehiculos.tripulacion_movil', 'U') IS NULL
BEGIN
    CREATE TABLE vehiculos.tripulacion_movil (
        id UNIQUEIDENTIFIER NOT NULL CONSTRAINT DF_tripm_id DEFAULT NEWSEQUENTIALID() CONSTRAINT PK_tripulacion_movil PRIMARY KEY,
        vehiculo_id UNIQUEIDENTIFIER NOT NULL,
        bombero_id UNIQUEIDENTIFIER NOT NULL,
        funcion NVARCHAR(40) NOT NULL,
        asignado_por UNIQUEIDENTIFIER NOT NULL,
        asignado_en DATETIMEOFFSET(3) NOT NULL CONSTRAINT DF_tripm_asignado DEFAULT SYSDATETIMEOFFSET(),
        /* Una persona va en un solo movil a la vez. */
        CONSTRAINT UQ_tripm_bombero UNIQUE (bombero_id),
        CONSTRAINT FK_tripm_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id),
        CONSTRAINT FK_tripm_bombero FOREIGN KEY (bombero_id) REFERENCES personal.bomberos(id),
        CONSTRAINT FK_tripm_usuario FOREIGN KEY (asignado_por) REFERENCES seguridad.usuarios(id)
    );
END
GO
IF NOT EXISTS (SELECT 1 FROM sys.indexes WHERE name = 'IX_tripm_vehiculo' AND object_id = OBJECT_ID('vehiculos.tripulacion_movil'))
    CREATE INDEX IX_tripm_vehiculo ON vehiculos.tripulacion_movil (vehiculo_id);
GO

/* --- 8) personal_servicio: de que movil y despacho viene cada persona --- */
IF COL_LENGTH('servicios.personal_servicio', 'vehiculo_id') IS NULL
    ALTER TABLE servicios.personal_servicio ADD
        vehiculo_id UNIQUEIDENTIFIER NULL,
        despacho_id UNIQUEIDENTIFIER NULL,
        origen NVARCHAR(12) NULL,
        /* Codigo del parametro FUNCION_INCIDENTE (rol guarda el nombre legible). */
        funcion NVARCHAR(40) NULL,
        /* Control de personal: dentro de la zona de trabajo y desde cuando. Nunca se libera solo. */
        en_zona BIT NOT NULL CONSTRAINT DF_perser_enzona DEFAULT 0,
        zona_desde DATETIMEOFFSET(3) NULL,
        /* Minutos exactos de servicio; horas_servicio queda como el valor redondeado (DEC-4). */
        minutos_servicio INT NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_perser_origen')
    ALTER TABLE servicios.personal_servicio ADD CONSTRAINT CK_perser_origen
        CHECK (origen IS NULL OR origen IN ('TRIPULACION', 'AJUSTE', 'SOLICITUD'));
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_perser_vehiculo')
    ALTER TABLE servicios.personal_servicio ADD CONSTRAINT FK_perser_vehiculo FOREIGN KEY (vehiculo_id) REFERENCES vehiculos.vehiculos(id);
GO
IF NOT EXISTS (SELECT 1 FROM sys.foreign_keys WHERE name = 'FK_perser_despacho')
    ALTER TABLE servicios.personal_servicio ADD CONSTRAINT FK_perser_despacho FOREIGN KEY (despacho_id) REFERENCES servicios.despachos(id);
GO

/* --- 9) adjuntos: posicion y categoria de la foto --- */
IF COL_LENGTH('servicios.adjuntos', 'latitud') IS NULL
    ALTER TABLE servicios.adjuntos ADD
        latitud DECIMAL(10, 8) NULL,
        longitud DECIMAL(11, 8) NULL,
        categoria NVARCHAR(12) NULL;
GO
IF NOT EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_adj_categoria')
    ALTER TABLE servicios.adjuntos ADD CONSTRAINT CK_adj_categoria CHECK (categoria IS NULL OR categoria IN (
        'DANO', 'VICTIMA', 'RIESGO', 'VEHICULO', 'ESTRUCTURA', 'EQUIPAMIENTO', 'EVIDENCIA', 'OTRO'));
GO

/* --- 10) Funciones del personal en un incidente (configurables) --- */
IF EXISTS (SELECT 1 FROM sys.check_constraints WHERE name = 'CK_param_tipo')
    ALTER TABLE organizacion.parametros DROP CONSTRAINT CK_param_tipo;
GO
ALTER TABLE organizacion.parametros ADD CONSTRAINT CK_param_tipo CHECK (tipo IN (
    N'PAIS', N'DEPARTAMENTO', N'CIUDAD', N'BARRIO', N'PROFESION', N'IDIOMA', N'NIVEL_IDIOMA',
    N'GRUPO_SANGUINEO', N'FACTOR_RH', N'TIPO_SEGURO', N'ASEGURADORA', N'TIPO_EVENTO_ASISTENCIA',
    N'UBICACION_EQUIPO', N'ESTADO_PRESENCIA_GUARDIA', N'SECTOR_ESTACION',
    N'TIPO_ACTIVIDAD_ACADEMICA', N'MODALIDAD_ACADEMICA', N'TIPO_EVALUACION_ACADEMICA', N'RESULTADO_ACADEMICO',
    N'TIPO_UBICACION_DEPOSITO', N'TIPO_TENENCIA_DEPOSITO', N'ESTADO_ELEMENTO_DEPOSITO',
    N'TIPO_MOVIMIENTO_DEPOSITO', N'UNIDAD_MEDIDA_DEPOSITO', N'MOTIVO_BAJA_DEPOSITO', N'TIPO_PRESTAMO_DEPOSITO',
    N'TIPO_INGRESO_FINANZAS', N'CATEGORIA_EGRESO_FINANZAS', N'TIPO_CUENTA_BANCARIA_FINANZAS',
    N'TIPO_DOCUMENTO_FINANZAS', N'MOTIVO_ANULACION_FINANZAS',
    N'TIPO_DOCUMENTO', N'CATEGORIA_DOCUMENTO', N'ESTADO_DOCUMENTO',
    N'NIVEL_CONFIDENCIALIDAD_DOCUMENTO', N'MOTIVO_ANULACION_DOCUMENTO', N'ARCHIVO_FISICO_DOCUMENTO',
    N'ESTADO_SOCIO_PROTECTOR', N'PERIODICIDAD_APORTE', N'MEDIO_PAGO_FINANZAS',
    N'TIPO_BENEFICIO_SOCIO', N'MOTIVO_NOTA_CREDITO_FINANZAS',
    N'FUNCION_INCIDENTE'
));
GO
INSERT INTO organizacion.parametros (tipo, nombre, nombre_normalizado, codigo, orden)
SELECT N'FUNCION_INCIDENTE', v.nombre, v.normalizado, v.codigo, v.orden FROM (VALUES
    (N'Comandante',       N'comandante',       N'COMANDANTE',      10),
    (N'Jefe de dotación', N'jefe de dotacion', N'JEFE_DOTACION',   20),
    (N'Conductor',        N'conductor',        N'CONDUCTOR',       30),
    (N'Bombero',          N'bombero',          N'BOMBERO',         40),
    (N'Rescatista',       N'rescatista',       N'RESCATISTA',      50),
    (N'Paramédico',       N'paramedico',       N'PARAMEDICO',      60),
    (N'Operador',         N'operador',         N'OPERADOR',        70),
    (N'Seguridad',        N'seguridad',        N'SEGURIDAD',       80),
    (N'Comunicaciones',   N'comunicaciones',   N'COMUNICACIONES',  90),
    (N'Logística',        N'logistica',        N'LOGISTICA',      100)
) AS v(nombre, normalizado, codigo, orden)
WHERE NOT EXISTS (SELECT 1 FROM organizacion.parametros p WHERE p.tipo = N'FUNCION_INCIDENTE' AND p.codigo = v.codigo);
GO

/* --- 11) Permisos: se usan en incidentes/flota y se siembran aca --- */
INSERT INTO seguridad.permisos (nombre, recurso, accion, categoria)
SELECT v.nombre, v.recurso, v.accion, v.categoria
FROM (VALUES
    (N'servicios:operar',      N'servicios', N'operar',      N'Servicios'),
    (N'servicios:comandar',    N'servicios', N'comandar',    N'Servicios'),
    (N'servicios:finalizar',   N'servicios', N'finalizar',   N'Servicios'),
    (N'vehiculos:tripulacion', N'vehiculos', N'tripulacion', N'Vehiculos')
) AS v(nombre, recurso, accion, categoria)
WHERE NOT EXISTS (SELECT 1 FROM seguridad.permisos p WHERE p.nombre = v.nombre);
GO
/* Se copian desde permisos existentes: no depende de como se llamen los roles en cada cuartel. */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id
JOIN (VALUES
    (N'despacho:responder',  N'servicios:operar'),
    (N'servicios:finalizar', N'servicios:comandar'),
    (N'servicios:despachar', N'vehiculos:tripulacion')
) AS m(origen, destino) ON m.origen = o.nombre
JOIN seguridad.permisos nuevo ON nuevo.nombre = m.destino
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT r.id, p.id FROM seguridad.roles r CROSS JOIN seguridad.permisos p
WHERE r.nombre = N'Administrador General'
    AND p.nombre IN (N'servicios:operar', N'servicios:comandar', N'servicios:finalizar', N'vehiculos:tripulacion')
    AND NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol a WHERE a.rol_id = r.id AND a.permiso_id = p.id);
GO
/* FOTO del Modo Incidente: quien opera en el lugar tiene que poder subir la foto (POST /adjuntos). */
INSERT INTO seguridad.asignacion_permisos_rol (rol_id, permiso_id)
SELECT DISTINCT a.rol_id, nuevo.id
FROM seguridad.asignacion_permisos_rol a
JOIN seguridad.permisos o ON o.id = a.permiso_id AND o.nombre = N'servicios:operar'
JOIN seguridad.permisos nuevo ON nuevo.nombre = N'adjuntos:subir'
WHERE NOT EXISTS (SELECT 1 FROM seguridad.asignacion_permisos_rol x WHERE x.rol_id = a.rol_id AND x.permiso_id = nuevo.id);
GO
```

- [x] **Paso 3: Registrar la migración**

En `database/run-migrations.ps1` reemplazá la línea `    "092_despacho_chofer_habilitado.sql"` por:

```powershell
    "092_despacho_chofer_habilitado.sql",
    "093_centro_operaciones_incidentes.sql"
```

Calculá el hash y agregalo al manifiesto:

```bash
cd /c/Proyectos/Personal/SIGBO
H=$(sha256sum database/migrations/093_centro_operaciones_incidentes.sql | cut -d' ' -f1 | tr 'a-f' 'A-F')
printf '%s  %s\n' "$H" "093_centro_operaciones_incidentes.sql" >> database/migrations.sha256
tail -2 database/migrations.sha256
```

Resultado esperado: la última línea es `<64 hex en mayúsculas>  093_centro_operaciones_incidentes.sql`.
**Si después editás el `.sql`, recalculá el hash** (antes de aplicarla; una vez aplicada ya no se toca).

- [x] **Paso 4: Entidades nuevas**

Crear `backend/src/shared/entities/incidente.entity.ts`:

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Flujo operativo del incidente (migracion 093). El orden importa: ver FASES en incidente.logica.ts. */
export type FaseOperativa =
  | 'RECIBIDO' | 'EVALUACION' | 'DESPACHADO' | 'EN_CAMINO' | 'EN_LUGAR'
  | 'OPERANDO' | 'CONTROLADO' | 'RETORNO' | 'DISPONIBLE' | 'CERRADO';

/** Como termino el incidente. Los alternativos al flujo normal son resultados, no fases. */
export type ResultadoIncidente =
  | 'CONTROLADO' | 'RESUELTO' | 'FALSA_ALARMA' | 'CANCELADO'
  | 'DERIVADO' | 'NO_ATENDIDO' | 'SIN_ACCESO' | 'SIN_INTERVENCION';

export type TipoEventoIncidente =
  | 'SERVICIO_RECIBIDO' | 'LLAMADO_VINCULADO' | 'FASE_CAMBIADA' | 'PRIORIDAD_CAMBIADA'
  | 'MOVIL_DESPACHADO' | 'MOVIL_SALIO' | 'MOVIL_LLEGO' | 'MOVIL_RETORNA' | 'MOVIL_DISPONIBLE'
  | 'DESPACHO_CANCELADO' | 'TRIPULACION_AJUSTADA' | 'PERSONAL_SUMADO' | 'COMANDO_ASUMIDO'
  | 'SITUACION_MARCADA' | 'SITUACION_RESUELTA' | 'RECURSO_SOLICITADO' | 'RECURSO_ACTUALIZADO'
  | 'VICTIMA_REGISTRADA' | 'FOTO_TOMADA' | 'MENSAJE' | 'COMUNICACION' | 'EMERGENCIA'
  | 'EMERGENCIA_ATENDIDA' | 'RESULTADO_DECLARADO' | 'INCIDENTE_CERRADO'
  | 'PERSONAL_ENTRA_ZONA' | 'PERSONAL_SALE_ZONA' | 'RECUENTO_PERSONAL';

export type OrigenEvento = 'WEB' | 'APP' | 'SISTEMA';
export type GrupoCondicion = 'SITUACION' | 'RIESGO';
export type CategoriaRecurso = 'MOVIL' | 'PERSONAL' | 'INSUMO' | 'EXTERNO' | 'OTRO';
export type PrioridadSolicitud = 'NORMAL' | 'URGENTE';
export type EstadoSolicitudRecurso =
  | 'SOLICITADO' | 'APROBADO' | 'DESPACHADO' | 'EN_CAMINO' | 'EN_USO' | 'LIBERADO' | 'RECHAZADO' | 'CANCELADO';

/** Bitacora unica del incidente: una accion = un evento. Inmutable (disparador en la base). */
@Entity({ name: 'incidente_eventos', schema: 'servicios' })
export class IncidenteEvento {
  @PrimaryGeneratedColumn({ type: 'bigint' })
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'nvarchar', length: 40 })
  tipo: TipoEventoIncidente;

  @Column({ type: 'nvarchar', length: 200 })
  titulo: string;

  /** Hora del hecho (acotada con instanteDelHecho), no la de llegada al servidor. */
  @Column({ type: 'datetimeoffset', precision: 3 })
  ocurridoEn: Date;

  @Column({ type: 'datetimeoffset', precision: 3 })
  registradoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  usuarioId: string | null;

  @Column({ type: 'nvarchar', length: 120, nullable: true })
  usuarioNombre: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  despachoId: string | null;

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;

  @Column({ type: 'decimal', precision: 7, scale: 1, nullable: true })
  precisionM: number | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  faseAnterior: FaseOperativa | null;

  @Column({ type: 'nvarchar', length: 20, nullable: true })
  faseNueva: FaseOperativa | null;

  /** Tabla de origen del hecho (despachos, adjuntos, servicio_mensajes...) y su id. */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  fuente: string | null;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  fuenteId: string | null;

  /** JSON con el detalle estructurado. */
  @Column({ type: 'nvarchar', length: 'MAX', nullable: true })
  datos: string | null;

  @Column({ type: 'bit', default: false })
  critico: boolean;

  @Column({ type: 'nvarchar', length: 10 })
  origen: OrigenEvento;

  @Column({ type: 'nvarchar', length: 200, nullable: true })
  dispositivo: string | null;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}

/** Condicion que se marca en SITUACION (o un riesgo). Configurable: es una fila. */
@Entity({ name: 'condiciones_situacion', schema: 'servicios' })
export class CondicionSituacion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 40 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 80 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 12 })
  grupo: GrupoCondicion;

  /** Si se marca, la central la ve como alerta critica. */
  @Column({ type: 'bit', default: false })
  critica: boolean;

  /** Las que comparten valor se excluyen: marcar una resuelve las otras. */
  @Column({ type: 'nvarchar', length: 30, nullable: true })
  grupoExcluyente: string | null;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;
}

/** Recurso que se puede pedir con la SOLICITUD RAPIDA. Configurable. */
@Entity({ name: 'tipos_recurso', schema: 'servicios' })
export class TipoRecurso {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'nvarchar', length: 30 })
  codigo: string;

  @Column({ type: 'nvarchar', length: 80 })
  nombre: string;

  @Column({ type: 'nvarchar', length: 10 })
  categoria: CategoriaRecurso;

  @Column({ type: 'int', default: 0 })
  orden: number;

  @Column({ type: 'bit', default: true })
  activo: boolean;
}

/** Pedido de recurso hecho durante el incidente, con su ciclo SCI. */
@Entity({ name: 'incidente_solicitudes', schema: 'servicios' })
export class IncidenteSolicitud {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  servicioId: string;

  @Column({ type: 'uniqueidentifier' })
  tipoRecursoId: string;

  @Column({ type: 'int', default: 1 })
  cantidad: number;

  @Column({ type: 'nvarchar', length: 10 })
  prioridad: PrioridadSolicitud;

  @Column({ type: 'nvarchar', length: 12, default: 'SOLICITADO' })
  estado: EstadoSolicitudRecurso;

  @Column({ type: 'nvarchar', length: 300, nullable: true })
  observacion: string | null;

  @Column({ type: 'uniqueidentifier' })
  solicitadoPor: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  solicitadoEn: Date;

  @Column({ type: 'uniqueidentifier', nullable: true })
  actualizadoPor: string | null;

  @Column({ type: 'datetimeoffset', precision: 3 })
  actualizadoEn: Date;

  @Column({ type: 'int', default: 0 })
  version: number;

  @Column({ type: 'nvarchar', length: 64, nullable: true })
  claveIdempotencia: string | null;
}
```

Crear `backend/src/shared/entities/tripulacion-movil.entity.ts`:

```ts
import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

/** Quien va en cada movil y con que funcion (migracion 093). Se carga al tomar la guardia;
 * cada despacho la copia a personal_servicio. Una persona, un movil (UQ_tripm_bombero). */
@Entity({ name: 'tripulacion_movil', schema: 'vehiculos' })
export class TripulacionMovil {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uniqueidentifier' })
  vehiculoId: string;

  @Column({ type: 'uniqueidentifier' })
  bomberoId: string;

  /** Codigo del parametro FUNCION_INCIDENTE (CONDUCTOR, JEFE_DOTACION...). */
  @Column({ type: 'nvarchar', length: 40 })
  funcion: string;

  @Column({ type: 'uniqueidentifier' })
  asignadoPor: string;

  @Column({ type: 'datetimeoffset', precision: 3 })
  asignadoEn: Date;
}
```

Al final de `backend/src/shared/entities/index.ts` agregá:

```ts
export * from './incidente.entity';
export * from './tripulacion-movil.entity';
```

- [x] **Paso 5: Ampliar las entidades existentes**

En `backend/src/shared/entities/servicio.entity.ts`, agregá el import de tipos debajo del import de
`typeorm`:

```ts
import type { FaseOperativa, ResultadoIncidente } from './incidente.entity';
```

y, inmediatamente después de la propiedad `estado: EstadoServicio;`, agregá:

```ts

  /** Fase del flujo operativo (migracion 093). `estado` se deriva de ella: ver estadoDesdeFase. */
  @Column({ type: 'nvarchar', length: 20, default: 'RECIBIDO' })
  faseOperativa: FaseOperativa;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  faseDesde: Date | null;

  /** Como termino: se declara en el lugar o en el cierre. */
  @Column({ type: 'nvarchar', length: 20, nullable: true })
  resultado: ResultadoIncidente | null;
```

En `backend/src/shared/entities/despacho.entity.ts` reemplazá:

```ts
  @Column({ type: 'datetimeoffset', precision: 3 })
  horaSalida: Date;
```

por:

```ts
  /** Cuando la central asigno el movil (migracion 093). */
  @Column({ type: 'datetimeoffset', precision: 3 })
  horaDespacho: Date;

  /** Cuando el movil salio. NULL = asignado, todavia en el cuartel. */
  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  horaSalida: Date | null;
```

En `backend/src/shared/entities/personal-servicio.entity.ts`, antes de `/** Personal que participo…`
agregá:

```ts
export type OrigenPersonalServicio = 'TRIPULACION' | 'AJUSTE' | 'SOLICITUD';

```

y después de la propiedad `observaciones` agregá:

```ts

  @Column({ type: 'uniqueidentifier', nullable: true })
  vehiculoId: string | null;

  @Column({ type: 'uniqueidentifier', nullable: true })
  despachoId: string | null;

  /** De donde salio la fila: la tripulacion del movil, un ajuste o una solicitud de despacho. */
  @Column({ type: 'nvarchar', length: 12, nullable: true })
  origen: OrigenPersonalServicio | null;

  /** Codigo del parametro FUNCION_INCIDENTE (rol guarda el nombre legible). */
  @Column({ type: 'nvarchar', length: 40, nullable: true })
  funcion: string | null;

  /** Control de personal: dentro de la zona de trabajo. Nunca se libera solo. */
  @Column({ type: 'bit', default: false })
  enZona: boolean;

  @Column({ type: 'datetimeoffset', precision: 3, nullable: true })
  zonaDesde: Date | null;

  /** Minutos exactos de servicio; horasServicio queda como el valor redondeado (horasDeServicio). */
  @Column({ type: 'int', nullable: true })
  minutosServicio: number | null;
```

En `backend/src/shared/entities/campo.entity.ts` reemplazá la línea
`export type TipoAdjunto = 'FOTO' | 'FIRMA';` por:

```ts
export type TipoAdjunto = 'FOTO' | 'FIRMA';
export type CategoriaFoto = 'DANO' | 'VICTIMA' | 'RIESGO' | 'VEHICULO' | 'ESTRUCTURA' | 'EQUIPAMIENTO' | 'EVIDENCIA' | 'OTRO';
```

y en la clase `Adjunto`, después de la propiedad `tomadoEn`, agregá:

```ts

  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitud: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitud: number | null;

  @Column({ type: 'nvarchar', length: 12, nullable: true })
  categoria: CategoriaFoto | null;
```

En `backend/src/shared/entities/parametro.entity.ts` agregá `| 'FUNCION_INCIDENTE'` como último
miembro del tipo `TipoParametro`, después del que hoy es el último.

- [x] **Paso 6: Compilar y corregir los usos de `horaSalida` nula**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx tsc --noEmit -p tsconfig.json 2>&1 | head -30
```

Corregí exactamente esto (y cualquier otro error que aparezca, con el mismo criterio: `null` =
"todavía no salió"):

1. `backend/src/modules/flota/flota.service.ts`, en `despachar`, dentro de `m.create(Despacho, {…})`:
   reemplazá `horaSalida: ahora,` por `horaDespacho: ahora,\n            horaSalida: ahora,`.
2. `flota.service.ts`, en `listarDespachos`: `.orderBy('d.horaSalida', 'DESC')` → `.orderBy('d.horaDespacho', 'DESC')`.
3. `flota.service.ts`, en `avanzar`: reemplazá
   `const previo = paso === 'llegada' ? d.horaSalida : paso === 'fin' ? d.horaLlegada : d.horaFin;` por
   `const previo = paso === 'llegada' ? (d.horaSalida ?? d.horaDespacho) : paso === 'fin' ? d.horaLlegada : d.horaFin;`
4. `backend/src/modules/flota/dotacion.service.ts`: `order: { horaSalida: 'DESC' }` → `order: { horaDespacho: 'DESC' }`.
5. `backend/src/modules/flota/informe.service.ts`: `order: { horaSalida: 'ASC' }` → `order: { horaDespacho: 'ASC' }`.
6. Si `indicadores.service.ts` marca error en `segundosEntre(d.horaSalida, …)`, cambiá la firma de
   `segundosEntre` para aceptar `Date | null` y devolver `null` cuando falte alguno.

Resultado esperado: `npx tsc --noEmit` sin errores.

En el frontend, en `frontend/src/lib/flota.ts` cambiá `horaSalida: string;` por
`horaSalida: string | null;` en **las dos** interfaces donde aparece (`MovilTablero.despachoActivo` y
`EntradaBitacora`). En `frontend/src/app/dashboard/vehiculos/dotacion/page.tsx` reemplazá
`<td>{new Date(b.horaSalida).toLocaleString('es-PY')}</td>` por
`<td>{b.horaSalida ? new Date(b.horaSalida).toLocaleString('es-PY') : 'Sin salir'}</td>`.

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npx tsc --noEmit 2>&1 | head -20
```

Resultado esperado: sin errores. Si otro archivo usa `despachoActivo.horaSalida` como `string`,
mostrá `'Sin salir'` cuando sea `null`.

- [x] **Paso 7: Semilla de desarrollo**

En `backend/src/database/seed-data.ts`:

- En el catálogo de permisos, después de la línea de `servicios:finalizar`, agregá:
  ```ts
  { nombre: 'servicios:operar', recurso: 'servicios', accion: 'operar', categoria: 'Servicios' },
  { nombre: 'servicios:comandar', recurso: 'servicios', accion: 'comandar', categoria: 'Servicios' },
  ```
  y después de la de `vehiculos:dotacion`:
  ```ts
  { nombre: 'vehiculos:tripulacion', recurso: 'vehiculos', accion: 'tripulacion', categoria: 'Vehiculos' },
  ```
- En el rol **Comandante** y en el rol **Jefe de Guardia**, en sus arrays `permisos`, después de
  `'servicios:finalizar'` agregá `'servicios:operar', 'servicios:comandar', 'vehiculos:tripulacion',`.
- En el rol **Bombero Operativo**, después de `'servicios:ver',` agregá `'servicios:operar', 'adjuntos:subir',`
  (si el rol ya tenía `adjuntos:subir`, no lo dupliques).

- [ ] **Paso 8: Aplicar la migración y verificarla**

```bash
cd /c/Proyectos/Personal/SIGBO && powershell -ExecutionPolicy Bypass -File logs/migrate-local.ps1 2>&1 | tail -5
```

Resultado esperado: `093_centro_operaciones_incidentes.sql` aplicada, sin errores. Si falla con
**5074** ("objects access this column") por una estadística sobre `hora_salida`, agregá antes del
`ALTER COLUMN hora_salida` un `DROP STATISTICS servicios.despachos.<nombre>` para esa estadística,
**recalculá el hash** (paso 3) y reintentá: la migración todavía no quedó registrada.

Verificá lo esencial:

```bash
Q() { docker exec sigbo-sqlserver /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -C -f 65001 -d sigbo_cbvc -h -1 -W -Q "SET NOCOUNT ON; $1"; }
Q "SELECT fase_operativa, COUNT(*) FROM servicios.servicios GROUP BY fase_operativa;"
Q "SELECT COUNT(*) FROM servicios.condiciones_situacion; SELECT nombre FROM servicios.condiciones_situacion WHERE codigo='VICTIMA';"
Q "SELECT COUNT(*) FROM servicios.tipos_recurso; SELECT COUNT(*) FROM organizacion.parametros WHERE tipo='FUNCION_INCIDENTE';"
Q "SELECT nombre FROM seguridad.permisos WHERE nombre IN ('servicios:operar','servicios:comandar','vehiculos:tripulacion');"
Q "SELECT is_nullable FROM sys.columns WHERE object_id=OBJECT_ID('servicios.despachos') AND name='hora_salida';"
```

Resultado esperado: cada servicio con una fase válida; `22` condiciones y `Víctima` escrito con tilde;
`12` tipos de recurso y `10` funciones; los 3 permisos; `is_nullable = 1`. Si "Víctima" sale con
caracteres raros, el archivo no está en UTF-8: corregilo en una migración **nueva** (094) que haga
`UPDATE` del nombre; la 093 ya aplicada no se edita.

Prueba de inmutabilidad: inserta un evento descartable sobre un servicio de prueba existente y
comprueba que la base rechace modificarlo.

```bash
Q "DECLARE @s UNIQUEIDENTIFIER = (SELECT TOP 1 id FROM servicios.servicios WHERE numero_servicio = 'PRUEBA-TECNICA-001');
   IF @s IS NULL SELECT 'sin servicio de prueba: omitir' ELSE BEGIN
   INSERT INTO servicios.incidente_eventos (servicio_id, tipo, titulo, ocurrido_en, origen) VALUES (@s, 'MENSAJE', N'Prueba de inmutabilidad (migracion 093)', SYSDATETIMEOFFSET(), 'SISTEMA');
   BEGIN TRY UPDATE servicios.incidente_eventos SET titulo = 'x' WHERE servicio_id = @s; SELECT 'MAL: se pudo modificar' END TRY
   BEGIN CATCH SELECT ERROR_NUMBER() END CATCH END"
```

Resultado esperado: `51093`. El servicio `PRUEBA-TECNICA-001` (CANCELADO) ya existe en la base local
como registro de prueba (`.context/DESPACHO.md` §9). Anotá este evento en la sección de registros de
prueba de `.context/INCIDENTES.md` (tarea 24): no se puede borrar.

- [ ] **Paso 9: Correr las pruebas del backend**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npm test 2>&1 | tail -8
```

Resultado esperado: el mismo número de suites y casos en verde que en el estado inicial.

- [x] **Paso 10: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add database/migrations/093_centro_operaciones_incidentes.sql database/run-migrations.ps1 database/migrations.sha256 \
  backend/src/shared/entities backend/src/modules/flota backend/src/modules/indicadores backend/src/database/seed-data.ts \
  frontend/src/lib/flota.ts frontend/src/app/dashboard/vehiculos/dotacion/page.tsx
git commit -m "Incidentes: migración 093 (fase operativa, bitácora inmutable, catálogos, tripulación) y entidades

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 2: Lógica pura del incidente

**Archivos:**

- Crear: `backend/src/modules/incidente-nucleo/incidente.logica.ts`
- Prueba: `backend/src/modules/incidente-nucleo/incidente.logica.spec.ts`

**Interfaces:**

- Consume: los tipos de la tarea 1.
- Produce: `FASES`, `FASES_ACTIVAS`, `RESULTADOS`, `DESPACHO_ACTIVO`, `ordenFase`, `estadoDesdeFase`,
  `HechoAutomatico`, `faseAutomatica`, `AccionFase`, `transicionManual`, `exigirPermisoResultado`,
  `faseTrasResultado`, `validarCierre`, `condicionesActivas`, `excluyentesDe`, `CICLO_RECURSO`,
  `validarEstadoRecurso`, `emergenciaActiva`, `NOMBRE_FASE`, `NOMBRE_RESULTADO`, `etiquetaMovil`,
  `nombreBombero` y `horasDeServicio` (las firmas exactas están en el código del paso 3). Si DEC-4 eligió otra
  política, `horasDeServicio` usa `Math.ceil` o `Math.floor`, y su prueba cambia los valores esperados como
  indica la tarea 0.

- [ ] **Paso 1: Escribir las pruebas**

Crear `backend/src/modules/incidente-nucleo/incidente.logica.spec.ts`:

```ts
import { ConflictException, ForbiddenException } from '@nestjs/common';
import {
  condicionesActivas,
  emergenciaActiva,
  estadoDesdeFase,
  excluyentesDe,
  exigirPermisoResultado,
  faseAutomatica,
  faseTrasResultado,
  horasDeServicio,
  transicionManual,
  validarCierre,
  validarEstadoRecurso,
} from './incidente.logica';

describe('estado heredado derivado de la fase', () => {
  it.each([
    ['RECIBIDO', null, 'REGISTRADO'],
    ['EVALUACION', null, 'REGISTRADO'],
    ['DESPACHADO', null, 'DESPACHADO'],
    ['EN_CAMINO', null, 'DESPACHADO'],
    ['EN_LUGAR', null, 'EN_CURSO'],
    ['OPERANDO', null, 'EN_CURSO'],
    ['CONTROLADO', null, 'EN_CURSO'],
    ['RETORNO', 'FALSA_ALARMA', 'EN_CURSO'],
    ['DISPONIBLE', null, 'EN_CURSO'],
    ['CERRADO', 'CONTROLADO', 'FINALIZADO'],
    ['CERRADO', 'FALSA_ALARMA', 'FINALIZADO'],
    ['CERRADO', 'CANCELADO', 'CANCELADO'],
  ] as const)('%s con resultado %s → %s', (fase, resultado, estado) => {
    expect(estadoDesdeFase(fase, resultado)).toBe(estado);
  });
});

describe('fases automáticas', () => {
  it('avanzan con despacho, salida y llegada', () => {
    expect(faseAutomatica('RECIBIDO', 'DESPACHO_CREADO')).toBe('DESPACHADO');
    expect(faseAutomatica('DESPACHADO', 'SALIDA')).toBe('EN_CAMINO');
    expect(faseAutomatica('RECIBIDO', 'SALIDA')).toBe('EN_CAMINO');
    expect(faseAutomatica('EN_CAMINO', 'LLEGADA')).toBe('EN_LUGAR');
  });
  it('nunca retroceden', () => {
    expect(faseAutomatica('OPERANDO', 'DESPACHO_CREADO')).toBeNull();
    expect(faseAutomatica('OPERANDO', 'LLEGADA')).toBeNull();
    expect(faseAutomatica('CONTROLADO', 'SALIDA')).toBeNull();
  });
  it('un incidente cerrado no se mueve', () => {
    expect(faseAutomatica('CERRADO', 'LLEGADA')).toBeNull();
  });
  it('la primera acción operativa en el lugar pasa a OPERANDO, y solo desde EN_LUGAR', () => {
    expect(faseAutomatica('EN_LUGAR', 'ACCION_OPERATIVA')).toBe('OPERANDO');
    expect(faseAutomatica('EN_CAMINO', 'ACCION_OPERATIVA')).toBeNull();
    expect(faseAutomatica('CONTROLADO', 'ACCION_OPERATIVA')).toBeNull();
  });
  it('RETORNO cuando nadie sigue en el lugar y al menos uno retorna', () => {
    expect(faseAutomatica('OPERANDO', 'DESPACHOS_CAMBIARON', [{ estado: 'REGRESANDO' }, { estado: 'CERRADO' }])).toBe('RETORNO');
    expect(faseAutomatica('OPERANDO', 'DESPACHOS_CAMBIARON', [{ estado: 'REGRESANDO' }, { estado: 'EN_SERVICIO' }])).toBeNull();
  });
  it('DISPONIBLE cuando ya no queda ningún despacho activo', () => {
    expect(faseAutomatica('RETORNO', 'DESPACHOS_CAMBIARON', [{ estado: 'CERRADO' }, { estado: 'CANCELADO' }])).toBe('DISPONIBLE');
    expect(faseAutomatica('CONTROLADO', 'DESPACHOS_CAMBIARON', [{ estado: 'CERRADO' }])).toBe('DISPONIBLE');
  });
  it('antes de llegar, que se vacíen los despachos no cambia la fase', () => {
    expect(faseAutomatica('EN_CAMINO', 'DESPACHOS_CAMBIARON', [{ estado: 'CANCELADO' }])).toBeNull();
  });
});

describe('transiciones manuales', () => {
  const comando = ['servicios:comandar'];
  it('EVALUACION solo desde RECIBIDO y con permiso de despacho', () => {
    expect(transicionManual('RECIBIDO', 'EVALUACION', ['servicios:despachar'])).toBe('EVALUACION');
    expect(() => transicionManual('DESPACHADO', 'EVALUACION', ['servicios:despachar'])).toThrow(ConflictException);
    expect(() => transicionManual('RECIBIDO', 'EVALUACION', comando)).toThrow(ForbiddenException);
  });
  it('CONTROLADO desde EN_LUGAR u OPERANDO; REACTIVADO vuelve a OPERANDO', () => {
    expect(transicionManual('OPERANDO', 'CONTROLADO', comando)).toBe('CONTROLADO');
    expect(transicionManual('EN_LUGAR', 'CONTROLADO', comando)).toBe('CONTROLADO');
    expect(transicionManual('CONTROLADO', 'REACTIVADO', comando)).toBe('OPERANDO');
    expect(() => transicionManual('EN_CAMINO', 'CONTROLADO', comando)).toThrow(ConflictException);
  });
  it('sin servicios:comandar no se controla', () => {
    expect(() => transicionManual('OPERANDO', 'CONTROLADO', ['servicios:operar'])).toThrow(ForbiddenException);
  });
});

describe('resultados alternativos', () => {
  it('sin móviles afuera y sin haber despachado: cierra en el acto', () => {
    expect(faseTrasResultado('RECIBIDO', 0)).toBe('CERRADO');
    expect(faseTrasResultado('EVALUACION', 0)).toBe('CERRADO');
  });
  it('con móviles afuera: pasa a RETORNO y espera que vuelvan', () => {
    expect(faseTrasResultado('EN_CAMINO', 2)).toBe('RETORNO');
    expect(faseTrasResultado('OPERANDO', 1)).toBe('RETORNO');
  });
  it('si los móviles ya volvieron, no cambia la fase (falta el cierre)', () => {
    expect(faseTrasResultado('DISPONIBLE', 0)).toBeNull();
    expect(faseTrasResultado('RETORNO', 1)).toBeNull();
  });
  it('un incidente cerrado no admite resultado', () => {
    expect(() => faseTrasResultado('CERRADO', 0)).toThrow(ConflictException);
  });
  it('después de despachar, el resultado lo declara el comando', () => {
    expect(() => exigirPermisoResultado('RECIBIDO', ['servicios:despachar'])).not.toThrow();
    expect(() => exigirPermisoResultado('OPERANDO', ['servicios:despachar'])).toThrow(ForbiddenException);
    expect(() => exigirPermisoResultado('OPERANDO', ['servicios:comandar'])).not.toThrow();
  });
});

describe('cierre', () => {
  it('se rechaza con un móvil todavía afuera', () => {
    expect(() => validarCierre('RETORNO', 1)).toThrow(/móvil/);
  });
  it('se rechaza si ya estaba cerrado', () => {
    expect(() => validarCierre('CERRADO', 0)).toThrow(ConflictException);
  });
  it('se acepta sin móviles afuera', () => {
    expect(() => validarCierre('DISPONIBLE', 0)).not.toThrow();
  });
});

describe('condiciones de situación', () => {
  const catalogo = [
    { codigo: 'INCENDIO_ACTIVO', grupoExcluyente: 'INCENDIO' },
    { codigo: 'INCENDIO_CONTROLADO', grupoExcluyente: 'INCENDIO' },
    { codigo: 'VICTIMA', grupoExcluyente: null },
  ];
  it('marcar y resolver', () => {
    const activas = condicionesActivas([
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'VICTIMA' }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_ACTIVO' }) },
      { tipo: 'SITUACION_RESUELTA', datos: JSON.stringify({ codigo: 'VICTIMA' }) },
    ]);
    expect([...activas]).toEqual(['INCENDIO_ACTIVO']);
  });
  it('las excluyentes del mismo grupo se resuelven con el mismo evento', () => {
    const antes = new Set(['INCENDIO_ACTIVO', 'VICTIMA']);
    expect(excluyentesDe('INCENDIO_CONTROLADO', catalogo, antes)).toEqual(['INCENDIO_ACTIVO']);
    expect(excluyentesDe('VICTIMA', catalogo, antes)).toEqual([]);
    const despues = condicionesActivas([
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_ACTIVO' }) },
      { tipo: 'SITUACION_MARCADA', datos: JSON.stringify({ codigo: 'INCENDIO_CONTROLADO', resueltas: ['INCENDIO_ACTIVO'] }) },
    ]);
    expect([...despues]).toEqual(['INCENDIO_CONTROLADO']);
  });
  it('ignora eventos de otros tipos y datos dañados', () => {
    expect(condicionesActivas([{ tipo: 'MOVIL_LLEGO', datos: null }, { tipo: 'SITUACION_MARCADA', datos: 'no-json' }]).size).toBe(0);
  });
});

describe('pedidos de recurso', () => {
  it('avanzan, pueden saltar pasos y no retroceden', () => {
    expect(() => validarEstadoRecurso('SOLICITADO', 'APROBADO')).not.toThrow();
    expect(() => validarEstadoRecurso('APROBADO', 'EN_USO')).not.toThrow();
    expect(() => validarEstadoRecurso('EN_USO', 'APROBADO')).toThrow(ConflictException);
  });
  it('rechazar o cancelar desde cualquier estado no final', () => {
    expect(() => validarEstadoRecurso('SOLICITADO', 'RECHAZADO')).not.toThrow();
    expect(() => validarEstadoRecurso('EN_CAMINO', 'CANCELADO')).not.toThrow();
    expect(() => validarEstadoRecurso('LIBERADO', 'CANCELADO')).toThrow(ConflictException);
  });
});

describe('emergencia', () => {
  it('está activa hasta que se atiende, y una nueva la reactiva', () => {
    expect(emergenciaActiva([{ tipo: 'EMERGENCIA' }])).toBe(true);
    expect(emergenciaActiva([{ tipo: 'EMERGENCIA' }, { tipo: 'EMERGENCIA_ATENDIDA' }])).toBe(false);
    expect(emergenciaActiva([{ tipo: 'EMERGENCIA' }, { tipo: 'EMERGENCIA_ATENDIDA' }, { tipo: 'EMERGENCIA' }])).toBe(true);
    expect(emergenciaActiva([])).toBe(false);
  });
});

describe('horas de servicio (política DEC-4)', () => {
  it('a la hora más cercana, y nunca negativa', () => {
    expect(horasDeServicio(120)).toBe(2);
    expect(horasDeServicio(89)).toBe(1);
    expect(horasDeServicio(90)).toBe(2);
    expect(horasDeServicio(-5)).toBe(0);
  });
});
```

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidente-nucleo/incidente.logica.spec.ts 2>&1 | tail -5
```

Resultado esperado: FAIL con `Cannot find module './incidente.logica'`.

- [ ] **Paso 3: Implementar**

Crear `backend/src/modules/incidente-nucleo/incidente.logica.ts`:

```ts
import { BadRequestException, ConflictException, ForbiddenException } from '@nestjs/common';
import type {
  EstadoDespacho,
  EstadoServicio,
  EstadoSolicitudRecurso,
  FaseOperativa,
  ResultadoIncidente,
} from '../../shared/entities';

/** Orden del flujo. La posicion define "avanzar": una fase automatica nunca retrocede. */
export const FASES: readonly FaseOperativa[] = [
  'RECIBIDO', 'EVALUACION', 'DESPACHADO', 'EN_CAMINO', 'EN_LUGAR',
  'OPERANDO', 'CONTROLADO', 'RETORNO', 'DISPONIBLE', 'CERRADO',
];

export const FASES_ACTIVAS: readonly FaseOperativa[] = FASES.filter((f) => f !== 'CERRADO');

export const RESULTADOS: readonly ResultadoIncidente[] = [
  'CONTROLADO', 'RESUELTO', 'FALSA_ALARMA', 'CANCELADO', 'DERIVADO', 'NO_ATENDIDO', 'SIN_ACCESO', 'SIN_INTERVENCION',
];

/** Un despacho en alguno de estos estados significa "el movil sigue afuera". */
export const DESPACHO_ACTIVO: readonly EstadoDespacho[] = ['DESPACHADO', 'EN_SERVICIO', 'REGRESANDO'];

export const ordenFase = (f: FaseOperativa) => FASES.indexOf(f);

/** El estado heredado (5 valores) que leen flota, servicio activo y la app, derivado de la fase. */
export function estadoDesdeFase(fase: FaseOperativa, resultado: ResultadoIncidente | null): EstadoServicio {
  switch (fase) {
    case 'RECIBIDO':
    case 'EVALUACION':
      return 'REGISTRADO';
    case 'DESPACHADO':
    case 'EN_CAMINO':
      return 'DESPACHADO';
    case 'CERRADO':
      return resultado === 'CANCELADO' ? 'CANCELADO' : 'FINALIZADO';
    default:
      return 'EN_CURSO';
  }
}

export type HechoAutomatico = 'DESPACHO_CREADO' | 'SALIDA' | 'LLEGADA' | 'ACCION_OPERATIVA' | 'DESPACHOS_CAMBIARON';

/**
 * Fase a la que lleva un hecho, o null si no cambia nada. Nunca retrocede ni mueve un incidente
 * cerrado. Para DESPACHOS_CAMBIARON hace falta la lista de despachos del incidente.
 */
export function faseAutomatica(
  actual: FaseOperativa,
  hecho: HechoAutomatico,
  despachos: ReadonlyArray<{ estado: EstadoDespacho }> = [],
): FaseOperativa | null {
  if (actual === 'CERRADO') return null;
  const avanzarA = (destino: FaseOperativa) => (ordenFase(destino) > ordenFase(actual) ? destino : null);
  switch (hecho) {
    case 'DESPACHO_CREADO':
      return avanzarA('DESPACHADO');
    case 'SALIDA':
      return avanzarA('EN_CAMINO');
    case 'LLEGADA':
      return avanzarA('EN_LUGAR');
    case 'ACCION_OPERATIVA':
      return actual === 'EN_LUGAR' ? 'OPERANDO' : null;
    case 'DESPACHOS_CAMBIARON': {
      if (ordenFase(actual) < ordenFase('EN_LUGAR')) return null;
      const activos = despachos.filter((d) => DESPACHO_ACTIVO.includes(d.estado));
      if (activos.length === 0) return avanzarA('DISPONIBLE');
      const sinRetornar = activos.some((d) => d.estado === 'DESPACHADO' || d.estado === 'EN_SERVICIO');
      return sinRetornar ? null : avanzarA('RETORNO');
    }
  }
}

export type AccionFase = 'EVALUACION' | 'OPERANDO' | 'CONTROLADO' | 'REACTIVADO';

const MANUALES: Record<AccionFase, { desde: FaseOperativa[]; hacia: FaseOperativa; permiso: string }> = {
  EVALUACION: { desde: ['RECIBIDO'], hacia: 'EVALUACION', permiso: 'servicios:despachar' },
  OPERANDO: { desde: ['EN_LUGAR'], hacia: 'OPERANDO', permiso: 'servicios:comandar' },
  CONTROLADO: { desde: ['EN_LUGAR', 'OPERANDO'], hacia: 'CONTROLADO', permiso: 'servicios:comandar' },
  REACTIVADO: { desde: ['CONTROLADO'], hacia: 'OPERANDO', permiso: 'servicios:comandar' },
};

export const NOMBRE_FASE: Record<FaseOperativa, string> = {
  RECIBIDO: 'Recibido', EVALUACION: 'En evaluación', DESPACHADO: 'Despachado', EN_CAMINO: 'En camino',
  EN_LUGAR: 'En el lugar', OPERANDO: 'Operando', CONTROLADO: 'Controlado', RETORNO: 'En retorno',
  DISPONIBLE: 'Unidades disponibles', CERRADO: 'Cerrado',
};

export const NOMBRE_RESULTADO: Record<ResultadoIncidente, string> = {
  CONTROLADO: 'Controlado', RESUELTO: 'Resuelto', FALSA_ALARMA: 'Falsa alarma', CANCELADO: 'Cancelado',
  DERIVADO: 'Derivado', NO_ATENDIDO: 'No atendido', SIN_ACCESO: 'Sin acceso', SIN_INTERVENCION: 'Sin intervención',
};

/** Valida una transicion manual y devuelve la fase destino. */
export function transicionManual(actual: FaseOperativa, accion: AccionFase, permisos: readonly string[]): FaseOperativa {
  const regla = MANUALES[accion];
  if (!regla) throw new BadRequestException(`Acción de fase desconocida: ${accion}.`);
  if (!permisos.includes(regla.permiso)) throw new ForbiddenException(`Hace falta el permiso ${regla.permiso}.`);
  if (!regla.desde.includes(actual)) {
    throw new ConflictException(`El incidente está ${NOMBRE_FASE[actual]}; esta acción solo aplica desde ${regla.desde.map((f) => NOMBRE_FASE[f]).join(' o ')}.`);
  }
  return regla.hacia;
}

/** Antes de despachar decide la central; despues, el comando. */
export function exigirPermisoResultado(fase: FaseOperativa, permisos: readonly string[]) {
  const permiso = ordenFase(fase) < ordenFase('DESPACHADO') ? 'servicios:despachar' : 'servicios:comandar';
  if (!permisos.includes(permiso)) throw new ForbiddenException(`Hace falta el permiso ${permiso}.`);
}

/**
 * Fase despues de declarar un resultado alternativo. Con moviles afuera: RETORNO (el incidente sigue
 * hasta que vuelvan). Sin moviles y sin haber despachado: CERRADO en el acto. Si ya volvieron todos,
 * no cambia: falta el cierre.
 */
export function faseTrasResultado(actual: FaseOperativa, despachosActivos: number): FaseOperativa | null {
  if (actual === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
  if (despachosActivos > 0) return ordenFase(actual) < ordenFase('RETORNO') ? 'RETORNO' : null;
  if (ordenFase(actual) < ordenFase('DESPACHADO')) return 'CERRADO';
  return null;
}

export function validarCierre(actual: FaseOperativa, despachosActivos: number) {
  if (actual === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
  if (despachosActivos > 0) {
    throw new ConflictException(`No se puede cerrar: ${despachosActivos === 1 ? 'hay un móvil' : `hay ${despachosActivos} móviles`} todavía afuera. Registrá su regreso primero.`);
  }
}

export interface EventoCondicion {
  tipo: string;
  datos: string | null;
}

function leer(datos: string | null): { codigo?: string; resueltas?: string[] } {
  if (!datos) return {};
  try {
    const d = JSON.parse(datos) as unknown;
    return d && typeof d === 'object' ? (d as { codigo?: string; resueltas?: string[] }) : {};
  } catch {
    return {};
  }
}

/** Condiciones vigentes, plegando los eventos SITUACION_MARCADA/RESUELTA en orden. */
export function condicionesActivas(eventos: readonly EventoCondicion[]): Set<string> {
  const activas = new Set<string>();
  for (const e of eventos) {
    if (e.tipo !== 'SITUACION_MARCADA' && e.tipo !== 'SITUACION_RESUELTA') continue;
    const d = leer(e.datos);
    if (!d.codigo) continue;
    if (e.tipo === 'SITUACION_MARCADA') {
      for (const r of d.resueltas ?? []) activas.delete(r);
      activas.add(d.codigo);
    } else {
      activas.delete(d.codigo);
    }
  }
  return activas;
}

/** Condiciones activas del mismo grupo excluyente que hay que resolver al marcar `codigo`. */
export function excluyentesDe(
  codigo: string,
  catalogo: ReadonlyArray<{ codigo: string; grupoExcluyente: string | null }>,
  activas: ReadonlySet<string>,
): string[] {
  const grupo = catalogo.find((c) => c.codigo === codigo)?.grupoExcluyente;
  if (!grupo) return [];
  return catalogo.filter((c) => c.codigo !== codigo && c.grupoExcluyente === grupo && activas.has(c.codigo)).map((c) => c.codigo);
}

export const CICLO_RECURSO: readonly EstadoSolicitudRecurso[] = ['SOLICITADO', 'APROBADO', 'DESPACHADO', 'EN_CAMINO', 'EN_USO', 'LIBERADO'];
const FINALES_RECURSO: readonly EstadoSolicitudRecurso[] = ['LIBERADO', 'RECHAZADO', 'CANCELADO'];

/** Avanza (se pueden saltar pasos), nunca retrocede; rechazar o cancelar desde cualquier estado no final. */
export function validarEstadoRecurso(actual: EstadoSolicitudRecurso, nuevo: EstadoSolicitudRecurso) {
  if (FINALES_RECURSO.includes(actual)) throw new ConflictException(`El pedido ya está ${actual.toLowerCase()}.`);
  if (nuevo === 'RECHAZADO' || nuevo === 'CANCELADO') return;
  if (CICLO_RECURSO.indexOf(nuevo) <= CICLO_RECURSO.indexOf(actual)) {
    throw new ConflictException(`El pedido está ${actual.toLowerCase()}; no puede volver a ${nuevo.toLowerCase()}.`);
  }
}

/** Hay emergencia activa si la ultima EMERGENCIA no fue seguida por una EMERGENCIA_ATENDIDA. Eventos en orden. */
export function emergenciaActiva(eventos: ReadonlyArray<{ tipo: string }>): boolean {
  let activa = false;
  for (const e of eventos) {
    if (e.tipo === 'EMERGENCIA') activa = true;
    else if (e.tipo === 'EMERGENCIA_ATENDIDA') activa = false;
  }
  return activa;
}

export const etiquetaMovil = (v: { numeroInterno: string }) => `Móvil ${v.numeroInterno}`;

/** "Nombre Apellido (numero)": la forma de nombrar a un bombero en todo el modulo de incidentes. */
export function nombreBombero(b?: { nombre: string; apellido: string; numeroBombero?: string | null } | null): string {
  if (!b) return 'Persona desconocida';
  return `${b.nombre} ${b.apellido}`.trim() + (b.numeroBombero ? ` (${b.numeroBombero})` : '');
}

/**
 * Horas de servicio de una persona a partir de sus minutos exactos (que tambien se guardan).
 * Politica DEC-4 de la tarea 0; por defecto, a la hora mas cercana. Cambiarla es cambiar SOLO esta funcion.
 */
export function horasDeServicio(minutos: number): number {
  return Math.max(0, Math.round(minutos / 60));
}
```

- [ ] **Paso 4: Correr las pruebas para ver que pasan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidente-nucleo/incidente.logica.spec.ts 2>&1 | tail -5
```

Resultado esperado: PASS, todos los casos.

- [ ] **Paso 5: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/incidente-nucleo/incidente.logica.ts backend/src/modules/incidente-nucleo/incidente.logica.spec.ts
git commit -m "Incidentes: lógica pura de fases, resultados, condiciones, pedidos y emergencia

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 3: Núcleo (bitácora y motor de fases)

**Archivos:**

- Crear: `backend/src/modules/incidente-nucleo/contexto.ts`, `cronologia.service.ts`, `motor-fases.service.ts`, `incidente-nucleo.module.ts`
- Prueba: `backend/src/modules/incidente-nucleo/incidente-nucleo.spec.ts`

**Interfaces:**

- Consume: las entidades de la tarea 1, y `estadoDesdeFase`, `faseAutomatica`, `DESPACHO_ACTIVO` y `HechoAutomatico` de la tarea 2.
- Produce:
  - `interface Gps { latitud: number; longitud: number; precisionM?: number | null }`
  - `interface NuevoEvento { servicioId; tipo: TipoEventoIncidente; titulo; ocurridoEn?: Date; usuarioId?: string | null; vehiculoId?; despachoId?; gps?: Gps | null; fase?: CambioFase | null; fuente?; fuenteId?; datos?: Record<string, unknown> | null; critico?: boolean; origen?: OrigenEvento; dispositivo?: string | null; claveIdempotencia?: string | null }`
  - `CronologiaService.registrar(m: EntityManager, e: NuevoEvento): Promise<IncidenteEvento>`, idempotente por `(servicioId, claveIdempotencia)`.
  - `CronologiaService.buscarPorClave(m, servicioId, clave): Promise<IncidenteEvento | null>`
  - `CronologiaService.nombreDe(m, usuarioId): Promise<string | null>`
  - `interface CambioFase { antes: FaseOperativa; despues: FaseOperativa }`
  - `MotorFases.bloquear(m, servicioId): Promise<Servicio>`, que lanza 404.
  - `MotorFases.despachosActivos(m, servicioId): Promise<Despacho[]>`
  - `MotorFases.alHecho(m, servicioId, hecho: HechoAutomatico, ahora?: Date): Promise<CambioFase | null>`
  - `MotorFases.fijar(m, servicio: Servicio, destino: FaseOperativa, ahora?: Date, resultado?: ResultadoIncidente | null): Promise<CambioFase>`
  - `origenDe(req): OrigenEvento` y `dispositivoDe(req): string | null`.
  - `IncidenteNucleoModule`, que exporta `CronologiaService` y `MotorFases`.
- **Regla:** `alHecho`, `fijar` y `bloquear` se llaman **dentro** de `dataSource.transaction(...)`, porque el
  bloqueo pesimista exige transacción.

- [ ] **Paso 1: Escribir las pruebas**

Crear `backend/src/modules/incidente-nucleo/incidente-nucleo.spec.ts`:

```ts
import { NotFoundException } from '@nestjs/common';
import { Bombero, Despacho, IncidenteEvento, Servicio, Usuario } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { CronologiaService } from './cronologia.service';
import { MotorFases } from './motor-fases.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('CronologiaService', () => {
  let base: BaseFalsa;
  const cronologia = new CronologiaService();

  beforeEach(async () => {
    base = new BaseFalsa();
    await sembrar(base, Usuario, { id: 'u1', username: 'jperez', bomberoId: 'b1' });
    await sembrar(base, Bombero, { id: 'b1', nombre: 'Juan', apellido: 'Pérez', numeroBombero: 'BC-12' });
    await sembrar(base, Usuario, { id: 'u2', username: 'central', bomberoId: null });
  });

  it('guarda el evento con el nombre del bombero y los datos en JSON', async () => {
    const e = await cronologia.registrar(base as never, {
      servicioId: 's1', tipo: 'COMUNICACION', titulo: 'Móvil 1 informa llegada', usuarioId: 'u1',
      gps: { latitud: -25.3, longitud: -57.6, precisionM: 8 }, datos: { texto: 'llegamos' },
    });
    expect(e).toMatchObject({
      servicioId: 's1', tipo: 'COMUNICACION', usuarioNombre: 'Juan Pérez (BC-12)', origen: 'WEB',
      critico: false, latitud: -25.3, longitud: -57.6, precisionM: 8, datos: JSON.stringify({ texto: 'llegamos' }),
    });
  });

  it('sin bombero vinculado usa el nombre de usuario', async () => {
    const e = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'MENSAJE', titulo: 'x', usuarioId: 'u2' });
    expect(e.usuarioNombre).toBe('central');
  });

  it('el reintento con la misma clave no duplica el evento', async () => {
    const a = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'EMERGENCIA', titulo: 'EMERGENCIA', claveIdempotencia: 'clave-12345' });
    const b = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'EMERGENCIA', titulo: 'EMERGENCIA', claveIdempotencia: 'clave-12345' });
    expect(b.id).toBe(a.id);
    expect(base.tabla('IncidenteEvento')).toHaveLength(1);
    expect(await cronologia.buscarPorClave(base as never, 's1', 'clave-12345')).toBe(a);
  });

  it('recorta el título a 200 caracteres', async () => {
    const e = await cronologia.registrar(base as never, { servicioId: 's1', tipo: 'COMUNICACION', titulo: 'a'.repeat(250) });
    expect(e.titulo).toHaveLength(200);
  });
});

describe('MotorFases', () => {
  let base: BaseFalsa;
  const motor = new MotorFases();
  const servicio = () => base.tabla('Servicio')[0] as unknown as Servicio;

  beforeEach(async () => {
    base = new BaseFalsa();
    await sembrar(base, Servicio, { id: 's1', estado: 'REGISTRADO', faseOperativa: 'RECIBIDO', faseDesde: null, resultado: null });
  });

  it('avanza con un hecho y deriva el estado heredado', async () => {
    const cambio = await motor.alHecho(base as never, 's1', 'SALIDA', new Date('2026-10-07T14:34:00Z'));
    expect(cambio).toEqual({ antes: 'RECIBIDO', despues: 'EN_CAMINO' });
    expect(servicio()).toMatchObject({ faseOperativa: 'EN_CAMINO', estado: 'DESPACHADO', faseDesde: new Date('2026-10-07T14:34:00Z') });
  });

  it('un hecho que no avanza devuelve null y no toca nada', async () => {
    await motor.alHecho(base as never, 's1', 'LLEGADA');
    expect(await motor.alHecho(base as never, 's1', 'SALIDA')).toBeNull();
    expect(servicio().faseOperativa).toBe('EN_LUGAR');
  });

  it('mira los despachos para RETORNO y DISPONIBLE', async () => {
    await motor.alHecho(base as never, 's1', 'LLEGADA');
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', estado: 'REGRESANDO' });
    expect(await motor.alHecho(base as never, 's1', 'DESPACHOS_CAMBIARON')).toEqual({ antes: 'EN_LUGAR', despues: 'RETORNO' });
    (base.tabla('Despacho')[0] as Record<string, unknown>).estado = 'CERRADO';
    expect(await motor.alHecho(base as never, 's1', 'DESPACHOS_CAMBIARON')).toEqual({ antes: 'RETORNO', despues: 'DISPONIBLE' });
    expect(await motor.despachosActivos(base as never, 's1')).toEqual([]);
  });

  it('fijar con resultado CANCELADO en CERRADO deja el estado CANCELADO', async () => {
    const s = await motor.bloquear(base as never, 's1');
    await motor.fijar(base as never, s, 'CERRADO', new Date(), 'CANCELADO');
    expect(servicio()).toMatchObject({ faseOperativa: 'CERRADO', estado: 'CANCELADO', resultado: 'CANCELADO' });
  });

  it('un incidente inexistente es 404', async () => {
    await expect(motor.bloquear(base as never, 'no-existe')).rejects.toThrow(NotFoundException);
  });
});

it('la entidad de la bitácora existe en el índice', () => {
  expect(new IncidenteEvento()).toBeInstanceOf(IncidenteEvento);
});
```

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidente-nucleo/incidente-nucleo.spec.ts 2>&1 | tail -5
```

Resultado esperado: FAIL con `Cannot find module './cronologia.service'`.

- [ ] **Paso 3: Implementar**

Crear `backend/src/modules/incidente-nucleo/contexto.ts`:

```ts
import type { Request } from 'express';
import type { OrigenEvento } from '../../shared/entities';

/** La app Android manda `X-SIGBO-Dispositivo: movil` (la misma cabecera que reconoce el CSRF y el login). */
export function origenDe(req: Request): OrigenEvento {
  return req.headers['x-sigbo-dispositivo'] === 'movil' ? 'APP' : 'WEB';
}

/** Equipo desde el que se hizo la accion: su User-Agent (la cabecera de la app siempre dice "movil"). */
export function dispositivoDe(req: Request): string | null {
  const valor = req.headers['user-agent'];
  const texto = Array.isArray(valor) ? valor[0] : valor;
  return texto ? String(texto).slice(0, 200) : null;
}
```

Crear `backend/src/modules/incidente-nucleo/cronologia.service.ts`:

```ts
import { Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { Bombero, IncidenteEvento, OrigenEvento, TipoEventoIncidente, Usuario } from '../../shared/entities';
import { nombreBombero } from './incidente.logica';
import type { CambioFase } from './motor-fases.service';

export interface Gps {
  latitud: number;
  longitud: number;
  precisionM?: number | null;
}

export interface NuevoEvento {
  servicioId: string;
  tipo: TipoEventoIncidente;
  titulo: string;
  ocurridoEn?: Date;
  usuarioId?: string | null;
  vehiculoId?: string | null;
  despachoId?: string | null;
  gps?: Gps | null;
  fase?: CambioFase | null;
  fuente?: string | null;
  fuenteId?: string | null;
  datos?: Record<string, unknown> | null;
  critico?: boolean;
  origen?: OrigenEvento;
  dispositivo?: string | null;
  claveIdempotencia?: string | null;
}

/**
 * Bitacora unica del incidente. Se escribe SIEMPRE con el EntityManager de la transaccion de la
 * accion: si la accion se revierte, el evento tambien. La tabla rechaza UPDATE y DELETE.
 */
@Injectable()
export class CronologiaService {
  async registrar(m: EntityManager, e: NuevoEvento): Promise<IncidenteEvento> {
    const repo = m.getRepository(IncidenteEvento);
    if (e.claveIdempotencia) {
      const previo = await this.buscarPorClave(m, e.servicioId, e.claveIdempotencia);
      if (previo) return previo;
    }
    const ahora = new Date();
    return repo.save(
      repo.create({
        servicioId: e.servicioId,
        tipo: e.tipo,
        titulo: e.titulo.slice(0, 200),
        ocurridoEn: e.ocurridoEn ?? ahora,
        registradoEn: ahora,
        usuarioId: e.usuarioId ?? null,
        usuarioNombre: e.usuarioId ? await this.nombreDe(m, e.usuarioId) : null,
        vehiculoId: e.vehiculoId ?? null,
        despachoId: e.despachoId ?? null,
        latitud: e.gps?.latitud ?? null,
        longitud: e.gps?.longitud ?? null,
        precisionM: e.gps?.precisionM ?? null,
        faseAnterior: e.fase?.antes ?? null,
        faseNueva: e.fase?.despues ?? null,
        fuente: e.fuente ?? null,
        fuenteId: e.fuenteId ?? null,
        datos: e.datos ? JSON.stringify(e.datos) : null,
        critico: e.critico ?? false,
        origen: e.origen ?? 'WEB',
        dispositivo: e.dispositivo ? e.dispositivo.slice(0, 200) : null,
        claveIdempotencia: e.claveIdempotencia ?? null,
      }),
    );
  }

  /** Reintentos: si la accion con esa clave ya quedo registrada, no se repite. */
  buscarPorClave(m: EntityManager, servicioId: string, clave: string): Promise<IncidenteEvento | null> {
    return m.getRepository(IncidenteEvento).findOne({ where: { servicioId, claveIdempotencia: clave } });
  }

  /** "Nombre Apellido (numero)" del bombero vinculado; si no hay, el nombre de usuario. */
  async nombreDe(m: EntityManager, usuarioId: string): Promise<string | null> {
    const u = await m.getRepository(Usuario).findOne({ where: { id: usuarioId } });
    if (!u) return null;
    if (u.bomberoId) {
      const b = await m.getRepository(Bombero).findOne({ where: { id: u.bomberoId } });
      if (b) return nombreBombero(b);
    }
    return u.username;
  }
}
```

Crear `backend/src/modules/incidente-nucleo/motor-fases.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import type { EntityManager } from 'typeorm';
import { Despacho, FaseOperativa, ResultadoIncidente, Servicio } from '../../shared/entities';
import { DESPACHO_ACTIVO, estadoDesdeFase, faseAutomatica, HechoAutomatico } from './incidente.logica';

export interface CambioFase {
  antes: FaseOperativa;
  despues: FaseOperativa;
}

/**
 * Aplica las transiciones de fase del incidente. Siempre dentro de la transaccion del llamador:
 * bloquea la fila del servicio y escribe fase, fase_desde y el estado heredado derivado.
 * Usa solo update() para no pisar columnas que el llamador haya cambiado en la misma transaccion.
 */
@Injectable()
export class MotorFases {
  async bloquear(m: EntityManager, servicioId: string): Promise<Servicio> {
    const s = await m.getRepository(Servicio).findOne({ where: { id: servicioId }, lock: { mode: 'pessimistic_write' } });
    if (!s) throw new NotFoundException('Incidente no encontrado.');
    return s;
  }

  async despachosActivos(m: EntityManager, servicioId: string): Promise<Despacho[]> {
    const todos = await m.getRepository(Despacho).find({ where: { servicioId } });
    return todos.filter((d) => DESPACHO_ACTIVO.includes(d.estado));
  }

  async alHecho(m: EntityManager, servicioId: string, hecho: HechoAutomatico, ahora = new Date()): Promise<CambioFase | null> {
    const s = await this.bloquear(m, servicioId);
    const despachos = hecho === 'DESPACHOS_CAMBIARON' ? await m.getRepository(Despacho).find({ where: { servicioId } }) : [];
    const destino = faseAutomatica(s.faseOperativa, hecho, despachos);
    return destino ? this.fijar(m, s, destino, ahora) : null;
  }

  async fijar(
    m: EntityManager,
    s: Servicio,
    destino: FaseOperativa,
    ahora = new Date(),
    resultado?: ResultadoIncidente | null,
  ): Promise<CambioFase> {
    const antes = s.faseOperativa;
    const res = resultado === undefined ? s.resultado : resultado;
    const cambios = { faseOperativa: destino, faseDesde: ahora, resultado: res, estado: estadoDesdeFase(destino, res) };
    await m.getRepository(Servicio).update({ id: s.id }, cambios);
    Object.assign(s, cambios);
    return { antes, despues: destino };
  }
}
```

Crear `backend/src/modules/incidente-nucleo/incidente-nucleo.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { CronologiaService } from './cronologia.service';
import { MotorFases } from './motor-fases.service';

/** Bitacora y motor de fases del incidente. Sin dependencias de dominio: lo importan flota, campo, despacho e incidentes. */
@Module({
  providers: [CronologiaService, MotorFases],
  exports: [CronologiaService, MotorFases],
})
export class IncidenteNucleoModule {}
```

- [ ] **Paso 4: Correr las pruebas para ver que pasan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidente-nucleo 2>&1 | tail -5
```

Resultado esperado: PASS (las dos suites del núcleo).

- [ ] **Paso 5: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/incidente-nucleo
git commit -m "Incidentes: núcleo con bitácora idempotente y motor de fases transaccional

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 4: Tripulación por móvil

**Archivos:**

- Crear: `backend/src/modules/flota/tripulacion.service.ts`
- Modificar: `backend/src/modules/flota/dto/flota.dto.ts`, `flota.controller.ts`, `flota.module.ts`
- Prueba: `backend/src/modules/flota/tripulacion.spec.ts`

**Interfaces:**

- Consume: `TripulacionMovil`, `Parametro`, `PersonalServicio`, `Bombero` y `Vehiculo`; `ContextoFlota` (tipo de `flota.service.ts`).
- Produce:
  - `interface IntegranteTripulacion { bomberoId: string; funcion: string }`, donde `funcion` es el **código** del parámetro, por ejemplo `CONDUCTOR`.
  - `TIPO_FUNCION = 'FUNCION_INCIDENTE'`, `FUNCION_CONDUCTOR = 'CONDUCTOR'` y `conductorDe(integrantes): string | null`.
  - `TripulacionService.funciones(m?)`, que devuelve `{ codigo, nombre }[]` ordenado.
  - `TripulacionService.listar()`, que devuelve `{ moviles: [{ vehiculoId, numeroInterno, alias, estado, estadoOperativo, tripulacion: [{ bomberoId, nombre, funcion, funcionNombre }] }], funciones, bomberos: [{ id, nombre }] }`.
  - `TripulacionService.reemplazar(vehiculoId, integrantes, ctx)`, que devuelve `{ vehiculoId, integrantes }`.
  - `TripulacionService.vigente(m, vehiculoId)`, que devuelve `IntegranteTripulacion[]`.
  - `TripulacionService.copiarAlDespacho(m, { servicioId, despachoId, vehiculoId, integrantes, origen: 'TRIPULACION' | 'AJUSTE', reemplazar?: boolean })`, que devuelve `Promise<void>`.
  - `TripulacionService.nombre(bombero?)`, que devuelve un `string`.
  - `TripulacionService.guardiaActual(ahora?)`, que devuelve `{ guardias: [{ id, fecha, turno, horaInicio, horaFin }], personal: [{ bomberoId, nombre, rol }] }`.
  - `copiarAlDespacho` guarda también `personal_servicio.funcion` (el código de la función).
  - Los DTO `IntegranteTripulacionDto` y `TripulacionDto` en `flota.dto.ts`.
  - `GET /flota/tripulacion` y `GET /flota/tripulacion/guardia-actual` (`vehiculos:ver`), y `PUT /flota/moviles/:id/tripulacion` (`vehiculos:tripulacion`).

- [ ] **Paso 1: Escribir las pruebas**

Crear `backend/src/modules/flota/tripulacion.spec.ts`:

```ts
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AsignacionGuardia, Bombero, Guardia, Parametro, PersonalServicio, TripulacionMovil, Vehiculo } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { conductorDe, TripulacionService } from './tripulacion.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('TripulacionService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let servicio: TripulacionService;
  const ctx = { usuarioId: 'u1' };

  beforeEach(async () => {
    base = new BaseFalsa();
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    servicio = new TripulacionService(base as unknown as DataSource, audit as never);
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '1', alias: null, estado: 'OPERATIVO', estadoOperativo: 'EN_CUARTEL' });
    await sembrar(base, Vehiculo, { id: 'V3', numeroInterno: '3', alias: null, estado: 'OPERATIVO', estadoOperativo: 'EN_CUARTEL' });
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gómez', numeroBombero: 'BC-01', estado: 'ACTIVO' });
    await sembrar(base, Bombero, { id: 'B2', nombre: 'Luis', apellido: 'Ríos', numeroBombero: 'BC-12', estado: 'ACTIVO' });
    await sembrar(base, Parametro, { id: 'p1', tipo: 'FUNCION_INCIDENTE', codigo: 'CONDUCTOR', nombre: 'Conductor', orden: 30, estado: 'ACTIVO' });
    await sembrar(base, Parametro, { id: 'p2', tipo: 'FUNCION_INCIDENTE', codigo: 'JEFE_DOTACION', nombre: 'Jefe de dotación', orden: 20, estado: 'ACTIVO' });
  });

  it('carga la tripulación y la devuelve con nombres y funciones', async () => {
    await servicio.reemplazar('V1', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }, { bomberoId: 'B2', funcion: 'JEFE_DOTACION' }], ctx);
    const r = await servicio.listar();
    const movil = r.moviles.find((m) => m.vehiculoId === 'V1')!;
    expect(movil.tripulacion).toEqual([
      { bomberoId: 'B1', nombre: 'Ana Gómez (BC-01)', funcion: 'CONDUCTOR', funcionNombre: 'Conductor' },
      { bomberoId: 'B2', nombre: 'Luis Ríos (BC-12)', funcion: 'JEFE_DOTACION', funcionNombre: 'Jefe de dotación' },
    ]);
    expect(r.funciones.map((f) => f.codigo)).toEqual(['JEFE_DOTACION', 'CONDUCTOR']);
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'CARGAR_TRIPULACION', recursoId: 'V1' }));
  });

  it('reemplazar borra la tripulación anterior del móvil', async () => {
    await servicio.reemplazar('V1', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }], ctx);
    await servicio.reemplazar('V1', [{ bomberoId: 'B2', funcion: 'CONDUCTOR' }], ctx);
    expect(base.tabla('TripulacionMovil').map((t) => t.bomberoId)).toEqual(['B2']);
  });

  it('una persona repetida en la lista es 400', async () => {
    await expect(servicio.reemplazar('V1', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }, { bomberoId: 'B1', funcion: 'JEFE_DOTACION' }], ctx))
      .rejects.toThrow(BadRequestException);
  });

  it('una persona que ya está en otro móvil es 409 y nombra ese móvil', async () => {
    await servicio.reemplazar('V3', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }], ctx);
    await expect(servicio.reemplazar('V1', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }], ctx)).rejects.toThrow(/Móvil 3/);
    await expect(servicio.reemplazar('V1', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }], ctx)).rejects.toThrow(ConflictException);
  });

  it('una función que no está en el catálogo es 400', async () => {
    await expect(servicio.reemplazar('V1', [{ bomberoId: 'B1', funcion: 'PILOTO' }], ctx)).rejects.toThrow(/Función desconocida/);
  });

  it('copia la tripulación al personal del servicio y, al reemplazar, quita a quien bajó', async () => {
    await servicio.copiarAlDespacho(base as never, {
      servicioId: 'S1', despachoId: 'D1', vehiculoId: 'V1', origen: 'TRIPULACION',
      integrantes: [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }, { bomberoId: 'B2', funcion: 'JEFE_DOTACION' }],
    });
    expect(base.tabla('PersonalServicio')).toEqual([
      expect.objectContaining({ servicioId: 'S1', bomberoId: 'B1', rol: 'Conductor', funcion: 'CONDUCTOR', despachoId: 'D1', vehiculoId: 'V1', origen: 'TRIPULACION', horasServicio: 0 }),
      expect.objectContaining({ bomberoId: 'B2', rol: 'Jefe de dotación' }),
    ]);
    await servicio.copiarAlDespacho(base as never, {
      servicioId: 'S1', despachoId: 'D1', vehiculoId: 'V1', origen: 'AJUSTE', reemplazar: true,
      integrantes: [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }],
    });
    expect(base.tabla('PersonalServicio').map((p) => [p.bomberoId, p.origen])).toEqual([['B1', 'AJUSTE']]);
  });

  it('conductorDe devuelve quien tiene la función CONDUCTOR', () => {
    expect(conductorDe([{ bomberoId: 'B2', funcion: 'JEFE_DOTACION' }, { bomberoId: 'B1', funcion: 'CONDUCTOR' }])).toBe('B1');
    expect(conductorDe([])).toBeNull();
  });

  it('la entidad PersonalServicio admite las columnas nuevas', () => {
    expect(Object.assign(new PersonalServicio(), { origen: 'AJUSTE' }).origen).toBe('AJUSTE');
    expect(new TripulacionMovil()).toBeInstanceOf(TripulacionMovil);
  });

  it('el personal de la guardia en curso, sin reemplazados ni ausentes', async () => {
    await sembrar(base, Guardia, { id: 'G1', fecha: '2026-10-07', turno: 'DIURNO', horaInicio: '07:00:00', horaFin: '19:00:00', estado: 'EN_CURSO' });
    await sembrar(base, AsignacionGuardia, { id: 'a1', guardiaId: 'G1', bomberoId: 'B1', rol: 'Chofer', estado: 'CONFIRMADO' });
    await sembrar(base, AsignacionGuardia, { id: 'a2', guardiaId: 'G1', bomberoId: 'B2', rol: null, estado: 'REEMPLAZADO' });
    const r = await servicio.guardiaActual(new Date(2026, 9, 7, 10, 0));
    expect(r.guardias).toEqual([expect.objectContaining({ id: 'G1', turno: 'DIURNO' })]);
    expect(r.personal).toEqual([{ bomberoId: 'B1', nombre: 'Ana Gómez (BC-01)', rol: 'Chofer' }]);
  });

  it('sin guardia en curso ni del día, devuelve listas vacías', async () => {
    expect(await servicio.guardiaActual(new Date(2026, 9, 7, 10, 0))).toEqual({ guardias: [], personal: [] });
  });
});
```

- [ ] **Paso 2: Correr la prueba para ver que falla**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/flota/tripulacion.spec.ts 2>&1 | tail -5
```

Resultado esperado: FAIL con `Cannot find module './tripulacion.service'`.

- [ ] **Paso 3: Implementar el servicio**

Crear `backend/src/modules/flota/tripulacion.service.ts`:

```ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In } from 'typeorm';
import { AsignacionGuardia, Bombero, Guardia, Parametro, PersonalServicio, TripulacionMovil, Vehiculo } from '../../shared/entities';
import { nombreBombero } from '../incidente-nucleo/incidente.logica';
import { AuditoriaService } from '../seguridad/auditoria.service';
import type { ContextoFlota } from './flota.service';

export interface IntegranteTripulacion {
  bomberoId: string;
  /** Codigo del parametro FUNCION_INCIDENTE. */
  funcion: string;
}

export const TIPO_FUNCION = 'FUNCION_INCIDENTE';
export const FUNCION_CONDUCTOR = 'CONDUCTOR';

export const conductorDe = (integrantes: readonly IntegranteTripulacion[]): string | null =>
  integrantes.find((i) => i.funcion === FUNCION_CONDUCTOR)?.bomberoId ?? null;

/**
 * Quien va en cada movil. Se carga al tomar la guardia; cada despacho la hereda (copiarAlDespacho)
 * y se puede ajustar en la salida y en el cierre. Las funciones son filas configurables.
 */
@Injectable()
export class TripulacionService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
  ) {}

  async funciones(m: EntityManager = this.dataSource.manager) {
    const filas = await m.getRepository(Parametro).find({ where: { tipo: TIPO_FUNCION, estado: 'ACTIVO' } });
    return filas
      .filter((p) => !!p.codigo)
      .sort((a, b) => a.orden - b.orden)
      .map((p) => ({ codigo: p.codigo as string, nombre: p.nombre }));
  }

  async listar() {
    const m = this.dataSource.manager;
    const [vehiculos, filas, funciones, bomberos] = await Promise.all([
      m.getRepository(Vehiculo).find({ where: { estado: In(['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO']) } }),
      m.getRepository(TripulacionMovil).find(),
      this.funciones(m),
      m.getRepository(Bombero).find({ where: { estado: 'ACTIVO' } }),
    ]);
    const persona = new Map(bomberos.map((b) => [b.id, b]));
    const nombreFuncion = new Map(funciones.map((f) => [f.codigo, f.nombre]));
    return {
      moviles: [...vehiculos]
        .sort((a, b) => a.numeroInterno.localeCompare(b.numeroInterno, 'es', { numeric: true }))
        .map((v) => ({
          vehiculoId: v.id,
          numeroInterno: v.numeroInterno,
          alias: v.alias,
          estado: v.estado,
          estadoOperativo: v.estadoOperativo,
          tripulacion: filas
            .filter((f) => f.vehiculoId === v.id)
            .map((f) => ({
              bomberoId: f.bomberoId,
              nombre: this.nombre(persona.get(f.bomberoId)),
              funcion: f.funcion,
              funcionNombre: nombreFuncion.get(f.funcion) ?? f.funcion,
            })),
        })),
      funciones,
      bomberos: bomberos.map((b) => ({ id: b.id, nombre: this.nombre(b) })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
    };
  }

  async reemplazar(vehiculoId: string, integrantes: IntegranteTripulacion[], ctx: ContextoFlota) {
    const ids = integrantes.map((i) => i.bomberoId);
    if (new Set(ids).size !== ids.length) throw new BadRequestException('Una persona figura dos veces en la tripulación.');
    const antes = await this.dataSource.transaction(async (m) => {
      const vehiculo = await m.getRepository(Vehiculo).findOne({ where: { id: vehiculoId } });
      if (!vehiculo || vehiculo.estado === 'BAJA') throw new NotFoundException('Móvil no encontrado.');
      await this.validarIntegrantes(m, integrantes);
      const repo = m.getRepository(TripulacionMovil);
      for (const i of integrantes) {
        const enOtro = await repo.findOne({ where: { bomberoId: i.bomberoId } });
        if (enOtro && enOtro.vehiculoId !== vehiculoId) {
          const otro = await m.getRepository(Vehiculo).findOne({ where: { id: enOtro.vehiculoId } });
          const b = await m.getRepository(Bombero).findOne({ where: { id: i.bomberoId } });
          throw new ConflictException(
            `${this.nombre(b)} ya está en la tripulación del Móvil ${otro?.numeroInterno ?? '?'}. Quitalo de ese móvil primero.`,
          );
        }
      }
      const previas = await repo.find({ where: { vehiculoId } });
      await repo.delete({ vehiculoId });
      const ahora = new Date();
      for (const i of integrantes) {
        await repo.save(repo.create({ vehiculoId, bomberoId: i.bomberoId, funcion: i.funcion, asignadoPor: ctx.usuarioId, asignadoEn: ahora }));
      }
      return previas.map((p) => ({ bomberoId: p.bomberoId, funcion: p.funcion }));
    });
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId,
      accion: 'CARGAR_TRIPULACION',
      recurso: 'vehiculos.tripulacion',
      recursoId: vehiculoId,
      datosAntes: { integrantes: antes },
      datosDespues: { integrantes },
      ip: ctx.ip ?? null,
      userAgent: ctx.userAgent ?? null,
    });
    return { vehiculoId, integrantes };
  }

  async vigente(m: EntityManager, vehiculoId: string): Promise<IntegranteTripulacion[]> {
    const filas = await m.getRepository(TripulacionMovil).find({ where: { vehiculoId } });
    return filas.map((f) => ({ bomberoId: f.bomberoId, funcion: f.funcion }));
  }

  /**
   * Personal de la guardia en curso (o, si no hay, la de hoy), para armar las tripulaciones repartiendo
   * esa gente en vez de buscarla una por una. Sin reemplazados ni ausentes.
   */
  async guardiaActual(ahora = new Date()) {
    const m = this.dataSource.manager;
    const p = (n: number) => String(n).padStart(2, '0');
    const hoy = `${ahora.getFullYear()}-${p(ahora.getMonth() + 1)}-${p(ahora.getDate())}`;
    let guardias = await m.getRepository(Guardia).find({ where: { estado: 'EN_CURSO' } });
    if (guardias.length === 0) {
      guardias = (await m.getRepository(Guardia).find({ where: { fecha: hoy } })).filter((g) => g.estado === 'PLANIFICADA' || g.estado === 'CONFIRMADA');
    }
    if (guardias.length === 0) return { guardias: [], personal: [] };
    const asignaciones = (await m.getRepository(AsignacionGuardia).find({ where: { guardiaId: In(guardias.map((g) => g.id)) } }))
      .filter((a) => a.estado === 'ASIGNADO' || a.estado === 'CONFIRMADO');
    const unicas = [...new Map(asignaciones.map((a) => [a.bomberoId, a])).values()];
    const bomberos = unicas.length ? await m.getRepository(Bombero).find({ where: { id: In(unicas.map((a) => a.bomberoId)) } }) : [];
    const persona = new Map(bomberos.map((b) => [b.id, b]));
    return {
      guardias: guardias.map((g) => ({ id: g.id, fecha: g.fecha, turno: g.turno, horaInicio: g.horaInicio, horaFin: g.horaFin })),
      personal: unicas.map((a) => ({ bomberoId: a.bomberoId, nombre: nombreBombero(persona.get(a.bomberoId)), rol: a.rol })),
    };
  }

  /**
   * Copia la tripulacion al personal del servicio, ligada al despacho. Lo heredado no se valida de
   * nuevo (en una emergencia no se bloquea un despacho por un dato viejo); lo ajustado a mano si.
   * Con `reemplazar`, quien ya no figura en la lista sale del personal de ese despacho.
   */
  async copiarAlDespacho(
    m: EntityManager,
    d: { servicioId: string; despachoId: string; vehiculoId: string; integrantes: IntegranteTripulacion[]; origen: 'TRIPULACION' | 'AJUSTE'; reemplazar?: boolean },
  ): Promise<void> {
    if (d.origen === 'AJUSTE') await this.validarIntegrantes(m, d.integrantes);
    const nombres = new Map((await this.funciones(m)).map((f) => [f.codigo, f.nombre]));
    const repo = m.getRepository(PersonalServicio);
    if (d.reemplazar) {
      const quedan = new Set(d.integrantes.map((i) => i.bomberoId));
      for (const actual of await repo.find({ where: { servicioId: d.servicioId, despachoId: d.despachoId } })) {
        if (!quedan.has(actual.bomberoId)) await repo.delete({ id: actual.id });
      }
    }
    for (const i of d.integrantes) {
      const datos = { vehiculoId: d.vehiculoId, despachoId: d.despachoId, rol: nombres.get(i.funcion) ?? i.funcion, funcion: i.funcion, origen: d.origen };
      const previo = await repo.findOne({ where: { servicioId: d.servicioId, bomberoId: i.bomberoId } });
      if (previo) await repo.update({ id: previo.id }, datos);
      else await repo.save(repo.create({ servicioId: d.servicioId, bomberoId: i.bomberoId, horasServicio: 0, observaciones: null, ...datos }));
    }
  }

  nombre(b?: { nombre: string; apellido: string; numeroBombero?: string | null } | null): string {
    return nombreBombero(b);
  }

  private async validarIntegrantes(m: EntityManager, integrantes: IntegranteTripulacion[]) {
    const codigos = new Set((await this.funciones(m)).map((f) => f.codigo));
    for (const i of integrantes) {
      if (!codigos.has(i.funcion)) throw new BadRequestException(`Función desconocida: ${i.funcion}.`);
      const b = await m.getRepository(Bombero).findOne({ where: { id: i.bomberoId } });
      if (!b || b.estado !== 'ACTIVO') throw new BadRequestException('Una de las personas no existe o no está activa.');
    }
  }
}
```

- [ ] **Paso 4: DTO, endpoints y módulo**

Al final de `backend/src/modules/flota/dto/flota.dto.ts` agregá (y sumá `ArrayMaxSize`, `IsArray`,
`MinLength`, `ValidateNested` al import de `class-validator`, más `import { Type } from 'class-transformer';`):

```ts
export class IntegranteTripulacionDto {
  @IsUUID()
  bomberoId!: string;

  /** Codigo del parametro FUNCION_INCIDENTE (CONDUCTOR, JEFE_DOTACION...). */
  @IsString()
  @MinLength(2)
  @MaxLength(40)
  funcion!: string;
}

export class TripulacionDto {
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => IntegranteTripulacionDto)
  integrantes!: IntegranteTripulacionDto[];
}
```

En `backend/src/modules/flota/flota.controller.ts`:

- Agregá `Put` al import de `@nestjs/common`, `TripulacionDto` al import de `./dto/flota.dto` e
  `import { TripulacionService } from './tripulacion.service';`.
- Agregá `private readonly tripulacion: TripulacionService,` como último parámetro del constructor.
- Antes del bloque `// ---- disponibilidad (2.3) ----` agregá:

```ts
  // ---- tripulacion por movil (se carga al tomar la guardia) ----

  @Get('tripulacion')
  @RequirePermission('vehiculos:ver')
  tripulaciones() {
    return this.tripulacion.listar();
  }

  @Get('tripulacion/guardia-actual')
  @RequirePermission('vehiculos:ver')
  guardiaActual() {
    return this.tripulacion.guardiaActual();
  }

  @Put('moviles/:id/tripulacion')
  @RequirePermission('vehiculos:tripulacion')
  cargarTripulacion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: TripulacionDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.tripulacion.reemplazar(id, dto.integrantes, this.ctx(user, req));
  }
```

En `backend/src/modules/flota/flota.module.ts` agregá `TripulacionService` a `providers` (con su import).

- [ ] **Paso 5: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/flota 2>&1 | tail -6 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -5
```

Resultado esperado: PASS en las suites de flota y `tsc` sin errores.

- [ ] **Paso 6: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/flota
git commit -m "Flota: tripulación por móvil cargada al tomar la guardia (vehiculos:tripulacion)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 5: Flota escribe la bitácora, mueve las fases y separa asignar de salir

**Archivos:**

- Modificar: `backend/src/modules/flota/flota.service.ts`, `flota.controller.ts`, `flota.module.ts`, `dto/flota.dto.ts`
- Prueba: `backend/src/modules/flota/flota.service.spec.ts`

**Interfaces:**

- Consume: `CronologiaService`, `MotorFases`, `Gps`, `origenDe` y `dispositivoDe` (tarea 3); `etiquetaMovil` y `HechoAutomatico` (tarea 2); `TripulacionService`, `conductorDe` e `IntegranteTripulacionDto` (tarea 4).
- Produce:
  - `ContextoFlota` con `dispositivo?: string | null` y `origen?: OrigenEvento`.
  - `interface ExtraPaso { kmRegreso?: number; ocurridoEn?: string; gps?: Gps | null; claveIdempotencia?: string | null }`
  - `FlotaService.despachar(dto, ctx)`. Acepta `dto.salir?: boolean` (por defecto `true`) y `dto.tripulacion?: IntegranteTripulacionDto[]`.
  - `FlotaService.salida(id, ctx, extra?: ExtraPaso)` (nuevo).
  - `FlotaService.avanzar(id, paso, ctx, extra?: ExtraPaso)`.
  - `FlotaService.cancelar(id, motivo, ctx)`, que ahora escribe `DESPACHO_CANCELADO` y avisa al motor.
  - `FlotaService.reportarPosicion(...)`, sin cambios.
  - `conTiempos` agrega `tiempoSalidaSegundos`.
  - `PATCH /flota/despachos/:id/salida` (`servicios:despachar`).
  - `FlotaModule` exporta `FlotaService` y `TripulacionService`.

- [ ] **Paso 1: Adaptar la base falsa de la prueba y escribir las pruebas nuevas**

En `backend/src/modules/flota/flota.service.spec.ts`:

1. Reemplazá el `getRepository` de la clase `BaseFalsa` local por:

```ts
  getRepository = (clase: Clase) => ({
    findOne: (o: { where: Record<string, unknown> }) => this.findOne(clase, o),
    find: async (o: { where?: Record<string, unknown> } = {}) =>
      this.tabla(clase.name).filter((f) => !o.where || this.coincide(f, o.where)),
    save: this.save,
    create: (d: Record<string, unknown>) => this.create(clase, d),
    update: async (where: Record<string, unknown>, cambios: Record<string, unknown>) => {
      const filas = this.tabla(clase.name).filter((f) => this.coincide(f, where));
      filas.forEach((f) => Object.assign(f, cambios));
      return { affected: filas.length };
    },
    delete: async (where: Record<string, unknown>) => {
      const tabla = this.tabla(clase.name);
      const quedan = tabla.filter((f) => !this.coincide(f, where));
      const affected = tabla.length - quedan.length;
      tabla.splice(0, tabla.length, ...quedan);
      return { affected };
    },
  });
```

2. Agregá a los imports de entidades `Parametro` y `TripulacionMovil`, y estos imports:

```ts
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import { MotorFases } from '../incidente-nucleo/motor-fases.service';
import { TripulacionService } from './tripulacion.service';
```

3. En `sembrarServicio`, agregá al objeto base `faseOperativa: 'RECIBIDO', faseDesde: null, resultado: null, coordenadasLat: null, coordenadasLon: null,`.

4. En `beforeEach`, reemplazá la construcción del servicio por:

```ts
    servicio = new FlotaService(
      base as unknown as DataSource,
      auditoria as never,
      new MotorFases(),
      new CronologiaService(),
      new TripulacionService(base as unknown as DataSource, auditoria as never),
    );
```

5. Agregá, junto a los demás ayudantes del `describe`:

```ts
  const tiposBitacora = () => base.tabla('IncidenteEvento').map((e) => e.tipo);
```

6. Agregá estos casos al final del `describe('FlotaService', …)`:

```ts
  it('asignar sin salir y después SALIMOS: dos horas y dos fases', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1', salir: false }, ctx);
    expect(d.horaSalida).toBeNull();
    expect(d.horaDespacho).toBeInstanceOf(Date);
    expect(svc().faseOperativa).toBe('DESPACHADO');
    expect(eventos()).toEqual([]);
    expect(tiposBitacora()).toEqual(['MOVIL_DESPACHADO']);

    const s = await servicio.salida(d.id, ctx);
    expect(s.horaSalida).toBeInstanceOf(Date);
    expect(svc()).toMatchObject({ faseOperativa: 'EN_CAMINO', estado: 'DESPACHADO' });
    expect(eventos()).toEqual(['SALIDA_CUARTEL']);
    expect(tiposBitacora()).toEqual(['MOVIL_DESPACHADO', 'MOVIL_SALIO']);
  });

  it('la salida no se registra dos veces', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1', salir: false }, ctx);
    await servicio.salida(d.id, ctx);
    await expect(servicio.salida(d.id, ctx)).rejects.toThrow(ConflictException);
  });

  it('sin el campo salir, despachar sigue siendo despachar y salir', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    expect(d.horaSalida).toBeInstanceOf(Date);
    expect(svc().faseOperativa).toBe('EN_CAMINO');
    expect(tiposBitacora()).toEqual(['MOVIL_SALIO']);
  });

  it('recorre las fases del incidente y deja un evento por paso', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await servicio.avanzar(d.id, 'llegada', ctx);
    expect(svc()).toMatchObject({ faseOperativa: 'EN_LUGAR', estado: 'EN_CURSO' });
    await servicio.avanzar(d.id, 'fin', ctx);
    expect(svc().faseOperativa).toBe('RETORNO');
    await servicio.avanzar(d.id, 'regreso', ctx);
    expect(svc()).toMatchObject({ faseOperativa: 'DISPONIBLE', estado: 'EN_CURSO' });
    expect(tiposBitacora()).toEqual(['MOVIL_SALIO', 'MOVIL_LLEGO', 'MOVIL_RETORNA', 'MOVIL_DISPONIBLE']);
  });

  it('una llegada con hora anterior a la salida queda acotada a la salida', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    const antes = new Date(new Date(d.horaSalida!).getTime() - 10 * 60_000).toISOString();
    const l = await servicio.avanzar(d.id, 'llegada', ctx, { ocurridoEn: antes });
    expect(new Date(l.horaLlegada!).getTime()).toBe(new Date(d.horaSalida!).getTime());
  });

  it('una llegada con GPS fija las coordenadas del incidente si faltaban', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await servicio.avanzar(d.id, 'llegada', ctx, { gps: { latitud: -25.29, longitud: -57.61 } });
    expect(svc()).toMatchObject({ coordenadasLat: -25.29, coordenadasLon: -57.61 });
    const llegada = base.tabla('IncidenteEvento').find((e) => e.tipo === 'MOVIL_LLEGO')!;
    expect(llegada).toMatchObject({ latitud: -25.29, longitud: -57.61 });
  });

  it('hereda la tripulación cargada al tomar la guardia', async () => {
    await base.save(Object.assign(new Parametro(), { id: 'p1', tipo: 'FUNCION_INCIDENTE', codigo: 'CONDUCTOR', nombre: 'Conductor', orden: 30, estado: 'ACTIVO' }) as never);
    await base.save(Object.assign(new TripulacionMovil(), { id: 't1', vehiculoId: 'V1', bomberoId: 'B1', funcion: 'CONDUCTOR' }) as never);
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    expect(d.conductorId).toBe('B1');
    expect(base.tabla('PersonalServicio')).toEqual([
      expect.objectContaining({ servicioId: 'S1', bomberoId: 'B1', rol: 'Conductor', origen: 'TRIPULACION', despachoId: d.id }),
    ]);
  });

  it('retirar el único móvil antes de llegar no hace retroceder la fase', async () => {
    const d = await servicio.despachar({ servicioId: 'S1', vehiculoId: 'V1' }, ctx);
    await servicio.cancelar(d.id, 'Se equivocó de móvil', ctx);
    expect(svc().faseOperativa).toBe('EN_CAMINO');
    expect(tiposBitacora()).toEqual(['MOVIL_SALIO', 'DESPACHO_CANCELADO']);
  });
```

- [ ] **Paso 2: Correr la prueba para ver que falla**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/flota/flota.service.spec.ts 2>&1 | tail -8
```

Resultado esperado: FAIL. No compila por el constructor y por `salida` inexistente, o fallan los casos nuevos.

- [ ] **Paso 3: DTO**

En `backend/src/modules/flota/dto/flota.dto.ts`, dentro de `CrearDespachoDto`, después de
`observaciones` agregá (sumá `IsBoolean` al import de `class-validator`):

```ts

  /** false = solo asignar: la dotacion confirma SALIMOS despues. Sin el campo: despachar y salir, como siempre. */
  @IsOptional()
  @IsBoolean()
  salir?: boolean;

  /** Tripulacion de esta salida. Sin el campo se hereda la cargada al tomar la guardia. */
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(20)
  @ValidateNested({ each: true })
  @Type(() => IntegranteTripulacionDto)
  tripulacion?: IntegranteTripulacionDto[];
```

Como `IntegranteTripulacionDto` está definida más abajo en el mismo archivo, **movela arriba de
`CrearDespachoDto`** (las clases no se elevan en tiempo de ejecución).

- [ ] **Paso 4: Servicio de flota**

En `backend/src/modules/flota/flota.service.ts`:

**4a. Imports y tipos.** Sumá `OrigenEvento` y `TipoEventoIncidente` al import de
`../../shared/entities` y agregá:

```ts
import { CronologiaService, Gps } from '../incidente-nucleo/cronologia.service';
import { etiquetaMovil, HechoAutomatico } from '../incidente-nucleo/incidente.logica';
import { MotorFases } from '../incidente-nucleo/motor-fases.service';
import { conductorDe, TripulacionService } from './tripulacion.service';
```

Reemplazá la interfaz `ContextoFlota`, el tipo `Paso` y la constante `SIGUIENTE` por:

```ts
export interface ContextoFlota {
  usuarioId: string;
  ip?: string | null;
  userAgent?: string | null;
  /** X-SIGBO-Dispositivo de la app o el User-Agent: queda en la bitacora. */
  dispositivo?: string | null;
  origen?: OrigenEvento;
}

/** Datos opcionales de un paso de despacho hecho desde el campo. */
export interface ExtraPaso {
  kmRegreso?: number;
  ocurridoEn?: string;
  gps?: Gps | null;
  claveIdempotencia?: string | null;
}

type Paso = 'llegada' | 'fin' | 'regreso';

/** Transiciones permitidas de un despacho: avance lineal, sin saltos. */
const SIGUIENTE: Record<
  Paso,
  {
    desde: EstadoDespacho;
    hacia: EstadoDespacho;
    movil: EstadoOperativoMovil;
    evento: TipoEventoHistorialServicio;
    hecho: HechoAutomatico;
    bitacora: TipoEventoIncidente;
    titulo: string;
  }
> = {
  llegada: { desde: 'DESPACHADO', hacia: 'EN_SERVICIO', movil: 'EN_SERVICIO', evento: 'LLEGADA_SERVICIO', hecho: 'LLEGADA', bitacora: 'MOVIL_LLEGO', titulo: 'llegó al lugar' },
  fin: { desde: 'EN_SERVICIO', hacia: 'REGRESANDO', movil: 'REGRESANDO', evento: 'SALIDA_SERVICIO', hecho: 'DESPACHOS_CAMBIARON', bitacora: 'MOVIL_RETORNA', titulo: 'retorna al cuartel' },
  regreso: { desde: 'REGRESANDO', hacia: 'CERRADO', movil: 'EN_CUARTEL', evento: 'REGRESO_CUARTEL', hecho: 'DESPACHOS_CAMBIARON', bitacora: 'MOVIL_DISPONIBLE', titulo: 'disponible en el cuartel' },
};
```

**4b. Constructor:**

```ts
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly motor: MotorFases,
    private readonly cronologia: CronologiaService,
    private readonly tripulacion: TripulacionService,
  ) {}
```

**4c. `despachar`.** Dentro de la transacción, reemplazá todo lo que va desde
`const ahora = instanteDelHecho(dto.ocurridoEn);` hasta `return creado;` (inclusive) por:

```ts
        const ahora = instanteDelHecho(dto.ocurridoEn);
        const salir = dto.salir !== false;
        const integrantes = dto.tripulacion ?? (await this.tripulacion.vigente(m, vehiculo.id));
        const creado = await m.save(
          m.create(Despacho, {
            ...(dto.id ? { id: dto.id } : {}),
            servicioId: servicio.id,
            vehiculoId: vehiculo.id,
            conductorId: dto.conductorId ?? conductorDe(integrantes),
            estado: 'DESPACHADO',
            horaDespacho: ahora,
            horaSalida: salir ? ahora : null,
            kmSalida: dto.kmSalida ?? vehiculo.kilometrajeActual ?? null,
            observaciones: dto.observaciones?.trim() || null,
            creadoPor: ctx.usuarioId,
          }),
        );

        // Primer movil en salir: el servicio toma la hora de salida. La fase la decide el motor.
        if (salir && !servicio.fechaHoraSalida) {
          await m.getRepository(Servicio).update({ id: servicio.id }, { fechaHoraSalida: ahora });
        }

        await this.cambiarEstadoMovil(m, vehiculo, 'DESPACHADO', {
          servicioId: servicio.id,
          despachoId: creado.id,
          usuarioId: ctx.usuarioId,
          ahora,
        });
        if (salir) await this.registrarEvento(m, servicio.id, vehiculo.id, 'SALIDA_CUARTEL', ahora, ctx.usuarioId);
        await this.tripulacion.copiarAlDespacho(m, {
          servicioId: servicio.id,
          despachoId: creado.id,
          vehiculoId: vehiculo.id,
          integrantes,
          origen: dto.tripulacion ? 'AJUSTE' : 'TRIPULACION',
        });
        const fase = await this.motor.alHecho(m, servicio.id, salir ? 'SALIDA' : 'DESPACHO_CREADO', ahora);
        await this.cronologia.registrar(m, {
          servicioId: servicio.id,
          tipo: salir ? 'MOVIL_SALIO' : 'MOVIL_DESPACHADO',
          titulo: `${etiquetaMovil(vehiculo)} ${salir ? 'despachado y en camino' : 'despachado'}`,
          ocurridoEn: ahora,
          usuarioId: ctx.usuarioId,
          vehiculoId: vehiculo.id,
          despachoId: creado.id,
          fuente: 'despachos',
          fuenteId: creado.id,
          fase,
          datos: { tripulacion: integrantes.length, conductorId: creado.conductorId },
          origen: ctx.origen,
          dispositivo: ctx.dispositivo,
        });
        return creado;
```

**4d. Método nuevo `salida`**, inmediatamente antes de `async avanzar(`:

```ts
  /** SALIMOS: el movil asignado sale del cuartel. Solo para despachos creados con salir=false. */
  async salida(id: string, ctx: ContextoFlota, extra: ExtraPaso = {}) {
    const despacho = await this.dataSource.transaction(async (m) => {
      const d = await this.obtenerDespacho(m, id, true);
      if (d.estado !== 'DESPACHADO') {
        throw new ConflictException(`El despacho está ${d.estado}; la salida solo aplica a un móvil despachado.`);
      }
      if (d.horaSalida) throw new ConflictException('La salida de este móvil ya estaba registrada.');
      const ahora = instanteDelHecho(extra.ocurridoEn, new Date(), d.horaDespacho);
      d.horaSalida = ahora;
      await m.save(d);
      const servicio = await m.findOne(Servicio, { where: { id: d.servicioId } });
      if (servicio && !servicio.fechaHoraSalida) {
        await m.getRepository(Servicio).update({ id: servicio.id }, { fechaHoraSalida: ahora });
      }
      const vehiculo = await this.obtenerVehiculo(m, d.vehiculoId);
      await this.registrarEvento(m, d.servicioId, vehiculo.id, 'SALIDA_CUARTEL', ahora, ctx.usuarioId);
      const fase = await this.motor.alHecho(m, d.servicioId, 'SALIDA', ahora);
      await this.cronologia.registrar(m, {
        servicioId: d.servicioId,
        tipo: 'MOVIL_SALIO',
        titulo: `${etiquetaMovil(vehiculo)} salió`,
        ocurridoEn: ahora,
        usuarioId: ctx.usuarioId,
        vehiculoId: vehiculo.id,
        despachoId: d.id,
        fuente: 'despachos',
        fuenteId: d.id,
        gps: extra.gps,
        fase,
        origen: ctx.origen,
        dispositivo: ctx.dispositivo,
        claveIdempotencia: extra.claveIdempotencia,
      });
      return d;
    });
    await this.auditar('SALIDA', despacho, 'DESPACHADO', ctx);
    if (extra.gps) await this.posicionDelPaso(despacho.vehiculoId, extra.gps, despacho.horaSalida, ctx.usuarioId);
    return this.conTiempos(despacho);
  }
```

**4e. `avanzar`.** Cambiá la firma a
`async avanzar(id: string, paso: Paso, ctx: ContextoFlota, extra: ExtraPaso = {}) {` y, dentro de la
transacción, reemplazá el bloque que empieza en el comentario `// Primera llegada al lugar: el servicio pasa a EN_CURSO.`
hasta el `}` que cierra ese `if (paso === 'llegada') { … }` por:

```ts
      // Primera llegada: el servicio toma la hora de llegada y, si no tenia coordenadas, las del GPS.
      if (paso === 'llegada') {
        const servicio = await m.findOne(Servicio, { where: { id: d.servicioId } });
        if (servicio) {
          const cambios: Partial<Servicio> = {};
          if (!servicio.fechaHoraLlegada) cambios.fechaHoraLlegada = ahora;
          if (extra.gps && (servicio.coordenadasLat === null || servicio.coordenadasLat === undefined)) {
            cambios.coordenadasLat = extra.gps.latitud;
            cambios.coordenadasLon = extra.gps.longitud;
          }
          if (Object.keys(cambios).length) await m.getRepository(Servicio).update({ id: servicio.id }, cambios);
        }
      }
      // Finalizar sigue siendo una decision del mando: el motor solo avanza hasta DISPONIBLE.
      const fase = await this.motor.alHecho(m, d.servicioId, regla.hecho, ahora);
      await this.cronologia.registrar(m, {
        servicioId: d.servicioId,
        tipo: regla.bitacora,
        titulo: `${etiquetaMovil(vehiculo)} ${regla.titulo}`,
        ocurridoEn: ahora,
        usuarioId: ctx.usuarioId,
        vehiculoId: vehiculo.id,
        despachoId: d.id,
        fuente: 'despachos',
        fuenteId: d.id,
        gps: extra.gps,
        fase,
        origen: ctx.origen,
        dispositivo: ctx.dispositivo,
        claveIdempotencia: extra.claveIdempotencia,
      });
```

Y después de `await this.auditar(paso.toUpperCase(), despacho, antes, ctx);` agregá:

```ts
    if (extra.gps) {
      const hora = paso === 'llegada' ? despacho.horaLlegada : paso === 'fin' ? despacho.horaFin : despacho.horaRegreso;
      await this.posicionDelPaso(despacho.vehiculoId, extra.gps, hora, ctx.usuarioId);
    }
```

**4f. `cancelar`.** Dentro de la transacción, después de `await this.cambiarEstadoMovil(…);` y antes
de `return { despacho: d, antes: estadoAntes };`, agregá:

```ts
      const fase = await this.motor.alHecho(m, d.servicioId, 'DESPACHOS_CAMBIARON');
      await this.cronologia.registrar(m, {
        servicioId: d.servicioId,
        tipo: 'DESPACHO_CANCELADO',
        titulo: `${etiquetaMovil(vehiculo)} retirado del incidente: ${motivoLimpio}`,
        usuarioId: ctx.usuarioId,
        vehiculoId: vehiculo.id,
        despachoId: d.id,
        fuente: 'despachos',
        fuenteId: d.id,
        fase,
        datos: { motivo: motivoLimpio, estadoAnterior: estadoAntes },
        origen: ctx.origen,
        dispositivo: ctx.dispositivo,
      });
```

**4g. `reponerEnCuartel`.** Dentro de la transacción, inmediatamente después de
`await m.save(activo);`, agregá:

```ts
        await this.motor.alHecho(m, activo.servicioId, 'DESPACHOS_CAMBIARON');
        await this.cronologia.registrar(m, {
          servicioId: activo.servicioId,
          tipo: 'DESPACHO_CANCELADO',
          titulo: `${etiquetaMovil(vehiculo)} repuesto en el cuartel a mano: ${motivoLimpio}`,
          usuarioId: ctx.usuarioId,
          vehiculoId: vehiculo.id,
          despachoId: activo.id,
          fuente: 'despachos',
          fuenteId: activo.id,
          origen: ctx.origen,
          dispositivo: ctx.dispositivo,
        });
```

**4h. Ayudante de posición y tiempos.** En la sección `// --- internos ---` agregá:

```ts
  /** El GPS de un paso hecho en el campo actualiza la ultima posicion conocida del movil. */
  private async posicionDelPaso(vehiculoId: string, gps: Gps, hora: Date | null, usuarioId: string) {
    await this.reportarPosicion(
      vehiculoId,
      { latitud: gps.latitud, longitud: gps.longitud, precisionM: gps.precisionM ?? undefined, registradoEn: (hora ?? new Date()).toISOString() },
      usuarioId,
    );
  }
```

y en `conTiempos`, dentro del objeto devuelto, agregá como primera métrica:

```ts
      tiempoSalidaSegundos: seg(d.horaDespacho, d.horaSalida),
```

- [ ] **Paso 5: Controlador y módulo**

En `backend/src/modules/flota/flota.controller.ts`:

- Agregá `import { dispositivoDe, origenDe } from '../incidente-nucleo/contexto';`.
- Reemplazá el método `ctx` por:

```ts
  private ctx(user: AuthenticatedUser, req: Request) {
    return {
      usuarioId: user.id,
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      dispositivo: dispositivoDe(req),
      origen: origenDe(req),
    };
  }
```

- Antes de `@Patch('despachos/:id/llegada')` agregá:

```ts
  @Patch('despachos/:id/salida')
  @RequirePermission('servicios:despachar')
  salida(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: RegresoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.flota.salida(id, this.ctx(user, req), { ocurridoEn: dto.ocurridoEn });
  }
```

En `backend/src/modules/flota/flota.module.ts`, reemplazá el decorador por:

```ts
@Module({
  imports: [SeguridadModule, IncidenteNucleoModule],
  controllers: [FlotaController],
  providers: [FlotaService, DotacionService, DisponibilidadService, InformeService, TripulacionService],
  exports: [FlotaService, TripulacionService],
})
```

con `import { IncidenteNucleoModule } from '../incidente-nucleo/incidente-nucleo.module';`.

- [ ] **Paso 6: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/flota 2>&1 | tail -8 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -10
```

Resultado esperado: PASS en todas las suites de flota (las previas siguen pasando) y `tsc` sin errores.
Si una prueba previa de `flota-extras.spec.ts` construye `FlotaService` con dos argumentos, pasale los
mismos tres extra que en el paso 1.4.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/flota
git commit -m "Flota: asignar o asignar y salir, paso SALIMOS, tripulación heredada, fases y bitácora del incidente

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 6: Víctimas, fotos, chat y personal sumado escriben en la bitácora

**Archivos:**

- Modificar: `backend/src/modules/campo/victimas.service.ts`, `adjuntos.service.ts`, `dto/campo.dto.ts`, `campo.controller.ts`, `campo.module.ts`, `campo.spec.ts`
- Modificar: `backend/src/modules/despacho/servicio-activo.service.ts`, `despacho.service.ts`, `despacho.module.ts`, `servicio-activo.spec.ts`, `despacho.spec.ts`

**Interfaces:**

- Consume: `CronologiaService`, `MotorFases`, `Gps`, `origenDe` y `dispositivoDe`.
- Produce:
  - `interface OpcionesCampo { gps?: Gps | null; claveIdempotencia?: string | null; origen?: OrigenEvento; ocurridoEn?: string }`, exportada desde `victimas.service.ts`.
  - `VictimasService.registrar(dto, ctx, opciones?: OpcionesCampo)`, que escribe `VICTIMA_REGISTRADA`, aplica el hecho `ACCION_OPERATIVA` y es idempotente por clave.
  - `ContextoCampo` con `origen?: OrigenEvento`.
  - `SubirAdjuntoDto` con `latitud?`, `longitud?` y `categoria?`.
  - `AdjuntosService.subir(...)` escribe `FOTO_TOMADA` cuando `entidad === 'SERVICIO'`.
  - `NOMBRE_CATEGORIA_FOTO: Record<CategoriaFoto, string>`, exportado desde `adjuntos.service.ts`.
  - `ServicioActivoService.enviarMensaje` escribe `MENSAJE` y `unirme` escribe `PERSONAL_SUMADO`.
  - `DespachoService.sincronizarParticipante` escribe `PERSONAL_SUMADO` cuando alguien nuevo se suma.
  - `CampoModule` exporta también `AdjuntosService`.

- [ ] **Paso 1: Escribir las pruebas**

En `backend/src/modules/campo/campo.spec.ts`:

- Sumá los imports
  `import { CronologiaService } from '../incidente-nucleo/cronologia.service';` e
  `import { MotorFases } from '../incidente-nucleo/motor-fases.service';`.
- Línea 34: `servicio = new AdjuntosService(base as unknown as DataSource, audit as never, new CronologiaService());`
- Línea 104: `servicio = new VictimasService(base as unknown as DataSource, { registrar: jest.fn().mockResolvedValue(undefined) } as never, new CronologiaService(), new MotorFases());`
- Al final del `describe('VictimasService', …)` agregá (usa el `ctx` de nivel de archivo que ya usan
  las pruebas existentes, `{ usuarioId: 'u1', … }`):

```ts
  it('registra el hecho en la bitácora y pasa el incidente a OPERANDO', async () => {
    await sembrar(base, Servicio, { id: 'S3', estado: 'EN_CURSO', faseOperativa: 'EN_LUGAR', resultado: null });
    await servicio.registrar({ servicioId: 'S3', categoria: 'HERIDA', cantidad: 2 }, ctx, { gps: { latitud: -25.3, longitud: -57.6 } });
    expect(base.tabla('IncidenteEvento')[0]).toMatchObject({
      servicioId: 'S3', tipo: 'VICTIMA_REGISTRADA', titulo: 'Personas heridas: 2', faseAnterior: 'EN_LUGAR', faseNueva: 'OPERANDO', latitud: -25.3,
    });
  });

  it('el reintento con la misma clave no duplica víctimas ni eventos', async () => {
    const op = { claveIdempotencia: 'victima-123456' };
    const a = await servicio.registrar({ servicioId: 'S1', categoria: 'RESCATADA', cantidad: 1 }, ctx, op);
    const b = await servicio.registrar({ servicioId: 'S1', categoria: 'RESCATADA', cantidad: 1 }, ctx, op);
    expect(b.id).toBe(a.id);
    expect(base.tabla('VictimaServicio')).toHaveLength(1);
    expect(base.tabla('IncidenteEvento')).toHaveLength(1);
  });
```

- En el `describe` de `AdjuntosService` (el que siembra el hidrante `H1` y usa `archivo(PNG)`), agregá:

```ts
  it('una foto del incidente queda en su bitácora con GPS y categoría', async () => {
    await sembrar(base, Servicio, { id: 'S9', estado: 'EN_CURSO' });
    await servicio.subir(archivo(PNG), { entidad: 'SERVICIO', entidadId: 'S9', tipo: 'FOTO', latitud: -25.3, longitud: -57.6, categoria: 'DANO' }, ctx);
    expect(base.tabla('IncidenteEvento')).toEqual([
      expect.objectContaining({ servicioId: 'S9', tipo: 'FOTO_TOMADA', titulo: 'Foto: Daño', fuente: 'adjuntos', latitud: -25.3, longitud: -57.6 }),
    ]);
  });
```

  Sumá `Servicio` al import de entidades de `campo.spec.ts` si no estaba.

En `backend/src/modules/despacho/servicio-activo.spec.ts` (línea 85):
`servicio = new ServicioActivoService(base as unknown as DataSource, audit as never, pantallas, tiempoReal, new CronologiaService());`
con el import correspondiente. Dentro del **mismo `describe`** que contiene las pruebas de
`enviarMensaje` de las líneas 156 a 161 (las que usan `ana` y `ahora`), agregá:

```ts
  it('cada mensaje del chat deja un evento MENSAJE en la bitácora', async () => {
    await servicio.enviarMensaje('s1', { texto: 'Necesitamos más mangueras' }, ana, ahora);
    expect(base.tabla('IncidenteEvento')).toEqual(expect.arrayContaining([
      expect.objectContaining({ servicioId: 's1', tipo: 'MENSAJE', titulo: 'Mensaje: Necesitamos más mangueras', fuente: 'servicio_mensajes' }),
    ]));
  });
```

En `backend/src/modules/despacho/despacho.spec.ts` (línea 181):
`servicio = new DespachoService(base as unknown as DataSource, audit as never, policy as never, tiempoReal, new CronologiaService());`
con el import. En la prueba existente que hace avanzar a alguien a `EN_CAMINO` en una solicitud
vinculada a `serv1` (alrededor de la línea 393), agregá al final:

```ts
    expect(base.tabla('IncidenteEvento').map((e) => e.tipo)).toContain('PERSONAL_SUMADO');
```

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/campo src/modules/despacho 2>&1 | tail -8
```

Resultado esperado: FAIL, porque los constructores no aceptan los parámetros nuevos y faltan los eventos.

- [ ] **Paso 3: Víctimas**

Reemplazá el contenido de `backend/src/modules/campo/victimas.service.ts` por:

```ts
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CategoriaVictima, OrigenEvento, Servicio, VictimaServicio } from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { CronologiaService, Gps } from '../incidente-nucleo/cronologia.service';
import { MotorFases } from '../incidente-nucleo/motor-fases.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { RegistrarVictimasDto } from './dto/campo.dto';
import { ContextoCampo } from './adjuntos.service';

export const CATEGORIAS_VICTIMA: CategoriaVictima[] = ['RESCATADA', 'HERIDA', 'FALLECIDA', 'EVACUADA'];

const ETIQUETA_VICTIMA: Record<CategoriaVictima, string> = {
  RESCATADA: 'rescatadas', HERIDA: 'heridas', FALLECIDA: 'fallecidas', EVACUADA: 'evacuadas',
};

/** Lo que trae una accion hecha desde el campo (Modo Incidente o app). */
export interface OpcionesCampo {
  gps?: Gps | null;
  claveIdempotencia?: string | null;
  origen?: OrigenEvento;
  ocurridoEn?: string;
}

/** Totales por categoria (todas presentes, aunque sean 0). */
export function totalesPorCategoria(filas: Array<{ categoria: CategoriaVictima; cantidad: number }>): Record<CategoriaVictima, number> {
  const t: Record<CategoriaVictima, number> = { RESCATADA: 0, HERIDA: 0, FALLECIDA: 0, EVACUADA: 0 };
  for (const f of filas) t[f.categoria] += f.cantidad;
  return t;
}

/** Solo registra el hecho (cuantas personas, en que categoria). No es un diagnostico ni una ficha medica. */
@Injectable()
export class VictimasService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly cronologia: CronologiaService,
    private readonly motor: MotorFases,
  ) {}

  async registrar(dto: RegistrarVictimasDto, ctx: ContextoCampo, opciones: OpcionesCampo = {}) {
    const r = await this.dataSource.transaction(async (m) => {
      if (opciones.claveIdempotencia) {
        const previo = await this.cronologia.buscarPorClave(m, dto.servicioId, opciones.claveIdempotencia);
        if (previo?.fuenteId) {
          const ya = await m.getRepository(VictimaServicio).findOne({ where: { id: previo.fuenteId } });
          if (ya) return { v: ya, repetido: true };
        }
      }
      const servicio = await m.getRepository(Servicio).findOne({ where: { id: dto.servicioId } });
      if (!servicio) throw new NotFoundException('Servicio no encontrado');
      if (servicio.estado === 'CANCELADO') throw new ConflictException('El servicio esta cancelado.');
      const repo = m.getRepository(VictimaServicio);
      const v = await repo.save(
        repo.create({ servicioId: dto.servicioId, categoria: dto.categoria, cantidad: dto.cantidad, observacion: dto.observacion ?? null, registradoPor: ctx.usuarioId }),
      );
      const ocurridoEn = instanteDelHecho(opciones.ocurridoEn);
      const fase = await this.motor.alHecho(m, dto.servicioId, 'ACCION_OPERATIVA', ocurridoEn);
      await this.cronologia.registrar(m, {
        servicioId: dto.servicioId,
        tipo: 'VICTIMA_REGISTRADA',
        titulo: `Personas ${ETIQUETA_VICTIMA[dto.categoria]}: ${dto.cantidad}`,
        ocurridoEn,
        usuarioId: ctx.usuarioId,
        fuente: 'victimas_servicio',
        fuenteId: v.id,
        datos: { categoria: dto.categoria, cantidad: dto.cantidad },
        gps: opciones.gps,
        fase,
        origen: opciones.origen ?? ctx.origen,
        dispositivo: ctx.userAgent ?? null,
        claveIdempotencia: opciones.claveIdempotencia,
      });
      return { v, repetido: false };
    });
    if (!r.repetido) {
      await this.auditoria.registrar({
        usuarioId: ctx.usuarioId,
        accion: 'REGISTRAR',
        recurso: 'servicios.victimas',
        recursoId: r.v.id,
        datosDespues: { servicioId: r.v.servicioId, categoria: r.v.categoria, cantidad: r.v.cantidad },
        ip: ctx.ip ?? null,
        userAgent: ctx.userAgent ?? null,
      });
    }
    return r.v;
  }

  async deServicio(servicioId: string) {
    const filas = await this.dataSource.getRepository(VictimaServicio).find({ where: { servicioId }, order: { creadoEn: 'ASC' } });
    return { registros: filas, totales: totalesPorCategoria(filas) };
  }
}
```

- [ ] **Paso 4: Fotos**

En `backend/src/modules/campo/dto/campo.dto.ts`, dentro de `SubirAdjuntoDto`, después de `tomadoEn`,
agregá (sumá `IsLatitude`, `IsLongitude` al import de `class-validator` y `Type` al de `class-transformer`):

```ts

  /** Posicion del celular al tomar la foto (multipart: llega como texto). */
  @IsOptional() @Type(() => Number) @IsLatitude() latitud?: number;
  @IsOptional() @Type(() => Number) @IsLongitude() longitud?: number;

  @IsOptional()
  @IsEnum(['DANO', 'VICTIMA', 'RIESGO', 'VEHICULO', 'ESTRUCTURA', 'EQUIPAMIENTO', 'EVIDENCIA', 'OTRO'] as const)
  categoria?: 'DANO' | 'VICTIMA' | 'RIESGO' | 'VEHICULO' | 'ESTRUCTURA' | 'EQUIPAMIENTO' | 'EVIDENCIA' | 'OTRO';
```

En `backend/src/modules/campo/adjuntos.service.ts`:

- Sumá `CategoriaFoto` y `OrigenEvento` al import de entidades y agregá
  `import { CronologiaService } from '../incidente-nucleo/cronologia.service';`.
- Agregá `origen?: OrigenEvento;` a la interfaz `ContextoCampo`.
- Agregá debajo de `ENTIDADES`:

```ts
export const NOMBRE_CATEGORIA_FOTO: Record<CategoriaFoto, string> = {
  DANO: 'Daño', VICTIMA: 'Víctima', RIESGO: 'Riesgo', VEHICULO: 'Vehículo',
  ESTRUCTURA: 'Estructura', EQUIPAMIENTO: 'Equipamiento', EVIDENCIA: 'Evidencia', OTRO: 'Otro',
};
```

- En `metadatos`, agregá `latitud: a.latitud, longitud: a.longitud, categoria: a.categoria,`.
- Constructor: agregá `private readonly cronologia: CronologiaService,` como tercer parámetro.
- En `subir`, dentro del `try`, reemplazá `const a = await repo.save(repo.create({ … }));` (todo el
  `save` con su `create`) por:

```ts
      const a = await this.dataSource.transaction(async (m) => {
        const r = m.getRepository(Adjunto);
        const guardado = await r.save(
          r.create({
            entidad: dto.entidad,
            entidadId: dto.entidadId,
            tipo: dto.tipo,
            descripcion: dto.descripcion ?? null,
            referencia,
            tamanoBytes: file.buffer.length,
            claveIdempotencia: dto.claveIdempotencia ?? null,
            subidoPor: ctx.usuarioId,
            tomadoEn: instanteDelHecho(dto.tomadoEn),
            latitud: dto.latitud ?? null,
            longitud: dto.longitud ?? null,
            categoria: dto.categoria ?? null,
          }),
        );
        // Una foto del incidente queda en su bitacora con hora, autor y GPS.
        if (guardado.entidad === 'SERVICIO') {
          await this.cronologia.registrar(m, {
            servicioId: guardado.entidadId,
            tipo: 'FOTO_TOMADA',
            titulo: guardado.categoria ? `Foto: ${NOMBRE_CATEGORIA_FOTO[guardado.categoria]}` : 'Foto',
            ocurridoEn: guardado.tomadoEn,
            usuarioId: ctx.usuarioId,
            fuente: 'adjuntos',
            fuenteId: guardado.id,
            gps: guardado.latitud !== null && guardado.longitud !== null ? { latitud: guardado.latitud, longitud: guardado.longitud } : null,
            datos: { categoria: guardado.categoria, tipo: guardado.tipo },
            origen: ctx.origen,
            dispositivo: ctx.userAgent ?? null,
          });
        }
        return guardado;
      });
```

En `backend/src/modules/campo/campo.controller.ts`, reemplazá el método `ctx` por:

```ts
  private ctx(user: AuthenticatedUser, req: Request) {
    return { usuarioId: user.id, ip: req.ip, userAgent: req.headers['user-agent'], origen: origenDe(req) };
  }
```

con `import { origenDe } from '../incidente-nucleo/contexto';`.

En `backend/src/modules/campo/campo.module.ts`: `imports: [SeguridadModule, IncidenteNucleoModule]` y
`exports: [AusenciasService, VictimasService, AdjuntosService]` (con el import del módulo del núcleo).

- [ ] **Paso 5: Chat y personal sumado**

En `backend/src/modules/despacho/servicio-activo.service.ts`:

- Import: `import { CronologiaService } from '../incidente-nucleo/cronologia.service';`
- Constructor: agregá `private readonly cronologia: CronologiaService,` como **último** parámetro.
- En `enviarMensaje`, reemplazá la línea `const mensaje = await repo.save(repo.create({ … }));` por:

```ts
    const mensaje = await this.dataSource.transaction(async (m) => {
      const r = m.getRepository(ServicioMensaje);
      const guardado = await r.save(r.create({ servicioId, usuarioId: user.id, usuarioNombre: user.username, texto: limpiarMensaje(dto.texto), ocurridoEn: instanteDelHecho(dto.ocurridoEn, ahora), registradoEn: ahora, claveIdempotencia: dto.clave ?? null }));
      await this.cronologia.registrar(m, {
        servicioId,
        tipo: 'MENSAJE',
        titulo: `Mensaje: ${guardado.texto}`,
        ocurridoEn: guardado.ocurridoEn,
        usuarioId: user.id,
        fuente: 'servicio_mensajes',
        fuenteId: String(guardado.id),
      });
      return guardado;
    });
```

- En `unirme`, reemplazá el bloque `const guardado = existente ? … : …;` por:

```ts
    const guardado = await this.dataSource.transaction(async (m) => {
      const r = m.getRepository(ServicioParticipante);
      const g = existente
        ? await r.save({ ...existente, estado: 'EN_CAMINO', desde: ahora, hasta: null, llegadaEn: null, version: existente.version + 1 })
        : await r.save(r.create({ servicioId, usuarioId: user.id, usuarioNombre: user.username, rol: null, estado: 'EN_CAMINO', solicitudId: null, desde: ahora, llegadaEn: null, hasta: null, version: 0 }));
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'PERSONAL_SUMADO', titulo: `${user.username} se suma al incidente`, ocurridoEn: ahora,
        usuarioId: user.id, fuente: 'servicio_participantes', fuenteId: g.id,
      });
      return g;
    });
```

En `backend/src/modules/despacho/despacho.service.ts`:

- Import: `import { CronologiaService } from '../incidente-nucleo/cronologia.service';`
- Constructor: agregá `private readonly cronologia: CronologiaService,` como **último** parámetro.
- En `sincronizarParticipante`, en las **dos** ramas que hacen `repo.save(repo.create({ … }))` (la de
  `EN_CAMINO` sin `previo` y la de llegada sin `previo`), agregá inmediatamente después de cada `save`:

```ts
      await this.cronologia.registrar(manager, {
        servicioId, tipo: 'PERSONAL_SUMADO', titulo: `${ctx.username} se suma al incidente`, ocurridoEn: ahora,
        usuarioId: ctx.usuarioId, fuente: 'solicitudes_despacho', fuenteId: solicitudId,
      });
```

  (si la rama es una expresión de una línea con `if (!previo) await repo.save(...)`, convertila en bloque `{ … }`).

En `backend/src/modules/despacho/despacho.module.ts`: `imports: [SeguridadModule, PantallasModule, IncidenteNucleoModule]`.

- [ ] **Paso 6: Correr la suite completa**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx tsc --noEmit -p tsconfig.json 2>&1 | head -10 && npm test 2>&1 | tail -8
```

Resultado esperado: `tsc` sin errores y todas las suites en verde (las del estado inicial más las nuevas).

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/campo backend/src/modules/despacho
git commit -m "Incidentes: víctimas, fotos (con GPS y categoría), chat y personal sumado escriben la bitácora

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 7: Módulo `incidentes` (recepción, expediente, cronología y tablero)

**Archivos:**

- Crear: `backend/src/modules/servicios/numeracion-servicio.ts`
- Modificar: `backend/src/modules/servicios/servicios.service.ts` (`siguienteNumero` delega)
- Crear: `backend/src/modules/incidentes/contexto.ts`, `etiquetas.ts`, `dto/incidentes.dto.ts`, `recepcion.service.ts`, `expediente.service.ts`, `incidentes.controller.ts`, `incidentes.module.ts`
- Modificar: `backend/src/app.module.ts`
- Prueba: `backend/src/modules/incidentes/recepcion.spec.ts`, `expediente.spec.ts`

**Interfaces:**

- Consume: las tareas 1 a 6. Del módulo `campo` usa `totalesPorCategoria`; de `incidente.logica` usa `condicionesActivas`, `emergenciaActiva`, `FASES_ACTIVAS`, `DESPACHO_ACTIVO`, `etiquetaMovil` y `nombreBombero`.
- Produce:
  - `siguienteNumeroServicio(m)`, `esViolacionUnica(e)` y la clase `NumeracionServicio` con `siguiente(m)`.
  - `ContextoIncidente { usuarioId; username; permisos; ip?; userAgent?; dispositivo?; origen }` y `contextoDe(user, req)`.
  - En `etiquetas.ts`: `NOMBRE_PRIORIDAD`, `TITULO_FASE`, `NOMBRE_ESTADO_RECURSO` y `porId`.
  - `RecepcionService.recibir(dto, ctx)`, que devuelve `{ servicioId, numeroServicio, llamadoId, repetido }`.
  - `RecepcionService.vincularLlamado(servicioId, dto, ctx)`, que devuelve `{ llamadoId }`.
  - `ExpedienteService.catalogos()`, que devuelve `{ bomberos: [{ id, nombre }], tiposServicio, condiciones, tiposRecurso, funciones, prioridades }`; `activos()`; y `tablero(ahora?)`.
  - `ExpedienteService.obtener(servicioId, usuarioId | null)`, que devuelve el **expediente** con la forma del código.
  - `ExpedienteService.cronologia(servicioId, desde?)`.
  - `siguientePaso(despacho)` y `presentarEvento(e)`.
  - Tipos `PasoMovil = 'salida' | 'llegada' | 'retorno' | 'disponible'` y `AlertaTablero`.
  - `GET /incidentes/tablero`, `/catalogos`, `/activos`, `/:id` y `/:id/cronologia`; `POST /incidentes` y `/:id/llamados`.

- [ ] **Paso 1: Numeración compartida**

Crear `backend/src/modules/servicios/numeracion-servicio.ts`:

```ts
import { ConflictException, Injectable } from '@nestjs/common';
import type { EntityManager } from 'typeorm';

/**
 * Siguiente numero CS-AAAA-NNNNN. UPDLOCK + HOLDLOCK sostiene el rango hasta el fin de la
 * transaccion del llamador; aun asi, quien llama reintenta ante una violacion de unicidad.
 */
export async function siguienteNumeroServicio(manager: EntityManager): Promise<string> {
  const prefijo = `CS-${new Date().getFullYear()}-`;
  const filas = (await manager.query(
    `SELECT ISNULL(MAX(TRY_CONVERT(INT, SUBSTRING(numero_servicio, LEN(@0) + 1, 20))), 0) + 1 AS siguiente
     FROM servicios.servicios WITH (UPDLOCK, HOLDLOCK)
     WHERE numero_servicio LIKE @1`,
    [prefijo, `${prefijo}%`],
  )) as Array<{ siguiente: number | string }>;
  const siguiente = Number(filas[0]?.siguiente);
  if (!Number.isSafeInteger(siguiente) || siguiente < 1) throw new ConflictException('No se pudo calcular el número de servicio');
  return `${prefijo}${String(siguiente).padStart(5, '0')}`;
}

export function esViolacionUnica(error: unknown): boolean {
  const e = error as { number?: number; message?: unknown; driverError?: { number?: number } } | null;
  const n = e?.number ?? e?.driverError?.number;
  return n === 2601 || n === 2627 || /duplicate|unique/i.test(String(e?.message ?? ''));
}

/** Inyectable para poder reemplazarlo en las pruebas (la base falsa no ejecuta SQL). */
@Injectable()
export class NumeracionServicio {
  siguiente(m: EntityManager): Promise<string> {
    return siguienteNumeroServicio(m);
  }
}
```

En `backend/src/modules/servicios/servicios.service.ts`, reemplazá el **cuerpo** de
`private async siguienteNumero(manager: EntityManager) { … }` por `return siguienteNumeroServicio(manager);`
y agregá `import { siguienteNumeroServicio } from './numeracion-servicio';`. Así queda una sola
implementación de la numeración.

- [ ] **Paso 2: Escribir las pruebas**

Crear `backend/src/modules/incidentes/recepcion.spec.ts`:

```ts
import { BadRequestException, ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Llamado, Servicio, TipoServicio } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import { RecepcionService } from './recepcion.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('RecepcionService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let servicio: RecepcionService;
  const ctx = { usuarioId: 'u1', username: 'central', permisos: ['servicios:crear'], origen: 'WEB' as const };

  beforeEach(async () => {
    base = new BaseFalsa();
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    let n = 0;
    const numeracion = { siguiente: jest.fn(async () => `CS-2026-${String(++n).padStart(5, '0')}`) };
    servicio = new RecepcionService(base as unknown as DataSource, audit as never, new CronologiaService(), numeracion as never);
    await sembrar(base, TipoServicio, { id: 't1', codigo: 'INC_EST', nombre: 'Incendio estructural', activo: true, prioridad: 0 });
    await sembrar(base, TipoServicio, { id: 't2', codigo: 'VIEJO', nombre: 'Tipo retirado', activo: false, prioridad: 0 });
  });

  it('crea el incidente con tipo y dirección, y deja el llamado y el evento', async () => {
    const r = await servicio.recibir({ tipoServicioId: 't1', direccion: '  Av. España 1234 ' }, ctx);
    expect(r).toMatchObject({ numeroServicio: 'CS-2026-00001', repetido: false });
    expect(base.tabla('Servicio')[0]).toMatchObject({
      id: r.servicioId, direccion: 'Av. España 1234', faseOperativa: 'RECIBIDO', estado: 'REGISTRADO', gravedad: 'MODERADA', creadoPor: 'u1',
    });
    expect(base.tabla('Llamado')[0]).toMatchObject({ servicioId: r.servicioId, estado: 'EN_ATENCION', medio: 'Teléfono', recibidoPor: 'u1' });
    expect(base.tabla('IncidenteEvento')[0]).toMatchObject({ servicioId: r.servicioId, tipo: 'SERVICIO_RECIBIDO', titulo: 'Servicio recibido: Incendio estructural' });
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'RECIBIR_INCIDENTE', recursoId: r.servicioId }));
  });

  it('el reintento con la misma clave devuelve el mismo incidente sin crear otro', async () => {
    const dto = { tipoServicioId: 't1', direccion: 'Calle 1', claveIdempotencia: 'recepcion-0001' };
    const a = await servicio.recibir(dto, ctx);
    const b = await servicio.recibir(dto, ctx);
    expect(b).toMatchObject({ servicioId: a.servicioId, repetido: true });
    expect(base.tabla('Servicio')).toHaveLength(1);
  });

  it('rechaza un tipo inexistente o inactivo', async () => {
    await expect(servicio.recibir({ tipoServicioId: 'nada', direccion: 'Calle 1' }, ctx)).rejects.toThrow(BadRequestException);
    await expect(servicio.recibir({ tipoServicioId: 't2', direccion: 'Calle 1' }, ctx)).rejects.toThrow(BadRequestException);
  });

  it('otra llamada por el mismo incidente se vincula y queda en la bitácora', async () => {
    const r = await servicio.recibir({ tipoServicioId: 't1', direccion: 'Calle 1' }, ctx);
    await servicio.vincularLlamado(r.servicioId, { solicitante: 'Vecina', telefono: '0981 000 000' }, ctx);
    expect(base.tabla('Llamado').filter((l) => l.servicioId === r.servicioId)).toHaveLength(2);
    expect(base.tabla('IncidenteEvento').map((e) => e.tipo)).toEqual(['SERVICIO_RECIBIDO', 'LLAMADO_VINCULADO']);
  });

  it('no se vincula una llamada a un incidente cerrado', async () => {
    const r = await servicio.recibir({ tipoServicioId: 't1', direccion: 'Calle 1' }, ctx);
    (base.tabla('Servicio')[0] as Record<string, unknown>).faseOperativa = 'CERRADO';
    await expect(servicio.vincularLlamado(r.servicioId, {}, ctx)).rejects.toThrow(ConflictException);
  });

  it('las entidades existen', () => {
    expect(new Servicio()).toBeInstanceOf(Servicio);
    expect(new Llamado()).toBeInstanceOf(Llamado);
  });
});
```

Crear `backend/src/modules/incidentes/expediente.spec.ts`:

```ts
import { NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Bombero, CondicionSituacion, Despacho, DisponibilidadPersonal, IncidenteEvento, IncidenteSolicitud,
  PersonalServicio, Servicio, TipoRecurso, TipoServicio, Usuario, Vehiculo,
} from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { ExpedienteService, siguientePaso } from './expediente.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);
const ev = (id: string, servicioId: string, tipo: string, datos: Record<string, unknown> | null = null) =>
  ({ id, servicioId, tipo, titulo: tipo, ocurridoEn: new Date(), registradoEn: new Date(), usuarioNombre: null, datos: datos ? JSON.stringify(datos) : null, critico: false, origen: 'WEB' });

describe('ExpedienteService', () => {
  let base: BaseFalsa;
  let servicio: ExpedienteService;

  beforeEach(async () => {
    base = new BaseFalsa();
    servicio = new ExpedienteService(base as unknown as DataSource);
    await sembrar(base, TipoServicio, { id: 't1', codigo: 'INC', nombre: 'Incendio estructural', activo: true, prioridad: 0 });
    await sembrar(base, CondicionSituacion, { id: 'c1', codigo: 'VICTIMA_ATRAPADA', nombre: 'Víctima atrapada', grupo: 'SITUACION', critica: true, grupoExcluyente: null, orden: 60, activo: true });
    await sembrar(base, CondicionSituacion, { id: 'c2', codigo: 'EVACUACION', nombre: 'Evacuación', grupo: 'SITUACION', critica: false, grupoExcluyente: null, orden: 80, activo: true });
    await sembrar(base, Servicio, { id: 's1', tipoServicioId: 't1', numeroServicio: 'CS-2026-00001', faseOperativa: 'OPERANDO', estado: 'EN_CURSO', gravedad: 'GRAVE', direccion: 'Calle 1', fechaHoraAviso: new Date('2026-10-07T14:31:00Z'), coordenadasLat: '-25.30000000', coordenadasLon: '-57.60000000', jefeServicioId: null });
    await sembrar(base, Servicio, { id: 's2', tipoServicioId: 't1', numeroServicio: 'CS-2026-00002', faseOperativa: 'RECIBIDO', estado: 'REGISTRADO', gravedad: 'MODERADA', direccion: 'Calle 2', fechaHoraAviso: new Date('2026-10-07T15:00:00Z') });
    await sembrar(base, Servicio, { id: 's3', tipoServicioId: 't1', numeroServicio: 'CS-2025-00009', faseOperativa: 'CERRADO', estado: 'FINALIZADO', direccion: 'Calle 3', fechaHoraAviso: new Date('2025-01-01T00:00:00Z'), faseDesde: new Date('2025-01-01T03:00:00Z') });
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '1', alias: null, estado: 'OPERATIVO', estadoOperativo: 'EN_SERVICIO' });
    await sembrar(base, Vehiculo, { id: 'V4', numeroInterno: '4', alias: null, estado: 'FUERA_SERVICIO', estadoOperativo: 'EN_CUARTEL' });
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', vehiculoId: 'V1', estado: 'EN_SERVICIO', horaDespacho: new Date('2026-10-07T14:33:00Z'), horaSalida: new Date('2026-10-07T14:34:00Z'), horaLlegada: new Date('2026-10-07T14:41:00Z') });
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gómez', numeroBombero: 'BC-01', estado: 'ACTIVO' });
    await sembrar(base, PersonalServicio, { id: 'p1', servicioId: 's1', bomberoId: 'B1', rol: 'Conductor', despachoId: 'd1', vehiculoId: 'V1' });
    await sembrar(base, Usuario, { id: 'u1', username: 'ana', bomberoId: 'B1' });
    await sembrar(base, DisponibilidadPersonal, { id: 'dp1', usuarioId: 'u1', estado: 'EN_SERVICIO' });
    await sembrar(base, TipoRecurso, { id: 'r1', codigo: 'AMBULANCIA', nombre: 'Ambulancia', categoria: 'EXTERNO', orden: 40, activo: true });
    await sembrar(base, IncidenteSolicitud, { id: 'sol1', servicioId: 's1', tipoRecursoId: 'r1', cantidad: 1, prioridad: 'URGENTE', estado: 'SOLICITADO', solicitadoEn: new Date(), version: 0 });
    for (const e of [
      ev('1', 's1', 'SERVICIO_RECIBIDO'),
      ev('2', 's1', 'SITUACION_MARCADA', { codigo: 'VICTIMA_ATRAPADA' }),
      ev('3', 's1', 'SITUACION_MARCADA', { codigo: 'EVACUACION' }),
      ev('4', 's1', 'EMERGENCIA'),
      ev('5', 's2', 'SERVICIO_RECIBIDO'),
    ]) await sembrar(base, IncidenteEvento, e);
  });

  it('el siguiente paso de un móvil depende de su estado y de si salió', () => {
    expect(siguientePaso({ estado: 'DESPACHADO', horaSalida: null })).toBe('salida');
    expect(siguientePaso({ estado: 'DESPACHADO', horaSalida: new Date() })).toBe('llegada');
    expect(siguientePaso({ estado: 'EN_SERVICIO', horaSalida: new Date() })).toBe('retorno');
    expect(siguientePaso({ estado: 'REGRESANDO', horaSalida: new Date() })).toBe('disponible');
    expect(siguientePaso({ estado: 'CERRADO', horaSalida: new Date() })).toBeNull();
  });

  it('el tablero cuenta, ordena las alertas y marca lo crítico', async () => {
    const t = await servicio.tablero(new Date('2026-10-07T16:00:00Z'));
    expect(t.incidentes.map((i) => i.numeroServicio)).toEqual(['CS-2026-00002', 'CS-2026-00001']);
    expect(t.porFase).toMatchObject({ OPERANDO: 1, RECIBIDO: 1 });
    expect(t.moviles).toMatchObject({ disponibles: 0, enServicio: 1, fueraDeServicio: 1 });
    expect(t.bomberos).toMatchObject({ enServicio: 1 });
    const s1 = t.incidentes.find((i) => i.id === 's1')!;
    expect(s1).toMatchObject({ emergencia: true, condicionesCriticas: ['Víctima atrapada'], pedidosPendientes: 1, moviles: 1 });
    expect(t.alertas[0]).toMatchObject({ nivel: 'CRITICA', tipo: 'EMERGENCIA', servicioId: 's1' });
    expect(t.alertas.map((a) => a.tipo)).toEqual(expect.arrayContaining(['CONDICION', 'PEDIDO_URGENTE', 'SIN_MOVILES', 'SIMULTANEOS', 'MOVIL_FUERA']));
  });

  it('el expediente reúne móviles con tripulación, condiciones activas y deduce el móvil del usuario', async () => {
    const e = await servicio.obtener('s1', 'u1');
    expect(e.incidente).toMatchObject({ numeroServicio: 'CS-2026-00001', fase: 'OPERANDO', prioridadNombre: 'Alta', latitud: -25.3, longitud: -57.6 });
    expect(e.despachos[0]).toMatchObject({ id: 'd1', movil: 'Móvil 1', siguientePaso: 'retorno', activo: true, tripulacion: [{ bomberoId: 'B1', nombre: 'Ana Gómez (BC-01)', rol: 'Conductor' }] });
    expect(e.condiciones.map((c) => c.codigo)).toEqual(['VICTIMA_ATRAPADA', 'EVACUACION']);
    expect(e.solicitudes[0]).toMatchObject({ tipoRecurso: 'Ambulancia', prioridad: 'URGENTE', estado: 'SOLICITADO' });
    expect(e.emergenciaActiva).toBe(true);
    expect(e.miDespachoId).toBe('d1');
    expect(e.ultimoEventoId).toBe('4');
  });

  it('la cronología sale en orden y la consulta incremental trae solo lo nuevo', async () => {
    expect((await servicio.cronologia('s1')).map((e) => e.id)).toEqual(['1', '2', '3', '4']);
    expect((await servicio.cronologia('s1', '2')).map((e) => e.id)).toEqual(['3', '4']);
    expect((await servicio.cronologia('s1'))[1].datos).toEqual({ codigo: 'VICTIMA_ATRAPADA' });
  });

  it('un incidente inexistente es 404', async () => {
    await expect(servicio.obtener('nada', null)).rejects.toThrow(NotFoundException);
    await expect(servicio.cronologia('nada')).rejects.toThrow(NotFoundException);
  });

  it('activos lista solo lo no cerrado', async () => {
    expect((await servicio.activos()).map((a) => a.id)).toEqual(['s2', 's1']);
  });
});
```

- [ ] **Paso 3: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -5
```

Resultado esperado: FAIL con `Cannot find module './recepcion.service'`.

- [ ] **Paso 4: Contexto, etiquetas y DTO**

Crear `backend/src/modules/incidentes/contexto.ts`:

```ts
import type { Request } from 'express';
import type { OrigenEvento } from '../../shared/entities';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { dispositivoDe, origenDe } from '../incidente-nucleo/contexto';

/** Quien hace la accion y desde donde. Compatible con ContextoFlota y ContextoCampo. */
export interface ContextoIncidente {
  usuarioId: string;
  username: string;
  permisos: string[];
  ip?: string | null;
  userAgent?: string | null;
  dispositivo?: string | null;
  origen: OrigenEvento;
}

export function contextoDe(user: AuthenticatedUser, req: Request): ContextoIncidente {
  const ua = req.headers['user-agent'];
  return {
    usuarioId: user.id,
    username: user.username,
    permisos: user.permisos,
    ip: req.ip ?? null,
    userAgent: typeof ua === 'string' ? ua : null,
    dispositivo: dispositivoDe(req),
    origen: origenDe(req),
  };
}
```

Crear `backend/src/modules/incidentes/etiquetas.ts`:

```ts
import type { EstadoSolicitudRecurso, GravedadServicio } from '../../shared/entities';
import type { AccionFase } from '../incidente-nucleo/incidente.logica';

/** La columna se llama gravedad; en pantalla es la prioridad del incidente. */
export const NOMBRE_PRIORIDAD: Record<GravedadServicio, string> = { LEVE: 'Baja', MODERADA: 'Media', GRAVE: 'Alta', CRITICA: 'Crítica' };

export const TITULO_FASE: Record<AccionFase, string> = {
  EVALUACION: 'Servicio en evaluación',
  OPERANDO: 'Operación iniciada',
  CONTROLADO: 'Incidente controlado',
  REACTIVADO: 'El incidente se reactivó',
};

export const NOMBRE_ESTADO_RECURSO: Record<EstadoSolicitudRecurso, string> = {
  SOLICITADO: 'solicitado', APROBADO: 'aprobado', DESPACHADO: 'despachado', EN_CAMINO: 'en camino',
  EN_USO: 'en uso', LIBERADO: 'liberado', RECHAZADO: 'rechazado', CANCELADO: 'cancelado',
};

/** Orden de la bitacora: por id numerico (bigint). Con ids no numericos conserva el orden recibido. */
export const porId = (a: { id: string }, b: { id: string }) => Number(a.id) - Number(b.id) || 0;

export const num = (v: unknown): number | null => (v === null || v === undefined ? null : Number(v));
```

Crear `backend/src/modules/incidentes/dto/incidentes.dto.ts`:

```ts
import { Type } from 'class-transformer';
import {
  ArrayMaxSize, ArrayMinSize, IsArray, IsBoolean, IsDateString, IsIn, IsInt, IsLatitude, IsLongitude,
  IsNumber, IsOptional, IsString, IsUUID, Max, MaxLength, Min, MinLength, ValidateNested,
} from 'class-validator';
import type {
  CategoriaVictima, EstadoSolicitudRecurso, GravedadServicio, PrioridadSolicitud, ResultadoIncidente,
} from '../../../shared/entities';
import { CICLO_RECURSO, RESULTADOS, type AccionFase } from '../../incidente-nucleo/incidente.logica';

const PRIORIDADES = ['LEVE', 'MODERADA', 'GRAVE', 'CRITICA'] as const;

export class GpsDto {
  @IsLatitude() latitud!: number;
  @IsLongitude() longitud!: number;
  @IsOptional() @IsNumber() @Min(0) precisionM?: number;
}

/** Lo que toda accion de campo puede traer: hora del hecho, GPS y clave para reintentos. */
export class AccionCampoDto {
  @IsOptional() @IsDateString() ocurridoEn?: string;
  @IsOptional() @ValidateNested() @Type(() => GpsDto) gps?: GpsDto;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) claveIdempotencia?: string;
}

/** Recepcion rapida: solo tipo y direccion son obligatorios. */
export class RecibirServicioDto {
  @IsUUID() tipoServicioId!: string;
  @IsString() @MinLength(3) @MaxLength(300) direccion!: string;
  @IsOptional() @IsString() @MaxLength(100) ciudad?: string;
  @IsOptional() @IsLatitude() latitud?: number;
  @IsOptional() @IsLongitude() longitud?: number;
  @IsOptional() @IsString() @MaxLength(150) solicitante?: string;
  @IsOptional() @IsString() @MaxLength(40) telefono?: string;
  @IsOptional() @IsString() @MaxLength(1000) descripcion?: string;
  @IsOptional() @IsIn([...PRIORIDADES]) prioridad?: GravedadServicio;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(40) medio?: string;
  @IsOptional() @IsDateString() ocurridoEn?: string;
  @IsOptional() @IsString() @MinLength(8) @MaxLength(64) claveIdempotencia?: string;
}

export class VincularLlamadoDto {
  @IsOptional() @IsString() @MaxLength(150) solicitante?: string;
  @IsOptional() @IsString() @MaxLength(40) telefono?: string;
  @IsOptional() @IsString() @MaxLength(1000) descripcion?: string;
  @IsOptional() @IsString() @MinLength(2) @MaxLength(40) medio?: string;
  @IsOptional() @IsDateString() ocurridoEn?: string;
}

export class IntegranteDto {
  @IsUUID() bomberoId!: string;
  @IsString() @MinLength(2) @MaxLength(40) funcion!: string;
}

export class MovilADespacharDto {
  @IsUUID() vehiculoId!: string;
  @IsBoolean() salir!: boolean;
  @IsOptional() @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => IntegranteDto) tripulacion?: IntegranteDto[];
}

export class DespacharMovilesDto {
  @IsArray() @ArrayMinSize(1) @ArrayMaxSize(15) @ValidateNested({ each: true }) @Type(() => MovilADespacharDto) moviles!: MovilADespacharDto[];
}

export class TripulacionDespachoDto {
  @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => IntegranteDto) integrantes!: IntegranteDto[];
}

export class FaseDto {
  @IsIn(['EVALUACION', 'OPERANDO', 'CONTROLADO', 'REACTIVADO']) accion!: AccionFase;
}

export class ResultadoDto {
  @IsIn([...RESULTADOS]) resultado!: ResultadoIncidente;
}

export class PrioridadDto {
  @IsIn([...PRIORIDADES]) prioridad!: GravedadServicio;
}

export class SituacionDto extends AccionCampoDto {
  @IsString() @MaxLength(40) condicion!: string;
  @IsBoolean() activa!: boolean;
}

export class SolicitarRecursoDto extends AccionCampoDto {
  @IsUUID() tipoRecursoId!: string;
  @IsOptional() @IsInt() @Min(1) @Max(99) cantidad?: number;
  @IsIn(['NORMAL', 'URGENTE']) prioridad!: PrioridadSolicitud;
  @IsOptional() @IsString() @MaxLength(300) observacion?: string;
}

export class EstadoSolicitudDto {
  @IsIn([...CICLO_RECURSO, 'RECHAZADO', 'CANCELADO']) estado!: EstadoSolicitudRecurso;
  @IsInt() @Min(0) version!: number;
}

export class VictimasIncidenteDto extends AccionCampoDto {
  @IsIn(['RESCATADA', 'HERIDA', 'FALLECIDA', 'EVACUADA']) categoria!: CategoriaVictima;
  @IsInt() @Min(1) @Max(500) cantidad!: number;
  @IsOptional() @IsString() @MaxLength(500) observacion?: string;
}

export class EmergenciaDto extends AccionCampoDto {
  @IsOptional() @IsString() @MaxLength(300) detalle?: string;
}

export class ComunicacionDto extends AccionCampoDto {
  @IsString() @MinLength(2) @MaxLength(500) texto!: string;
}

export class AjusteTripulacionDto {
  @IsUUID() despachoId!: string;
  @IsArray() @ArrayMaxSize(20) @ValidateNested({ each: true }) @Type(() => IntegranteDto) integrantes!: IntegranteDto[];
}

export class CierreDto {
  @IsIn([...RESULTADOS]) resultado!: ResultadoIncidente;
  @IsBoolean() huboVictimas!: boolean;
  @IsBoolean() huboDanos!: boolean;
  @IsOptional() @IsString() @MaxLength(4000) observaciones?: string;
  @IsOptional() @IsArray() @ArrayMaxSize(15) @ValidateNested({ each: true }) @Type(() => AjusteTripulacionDto) tripulacion?: AjusteTripulacionDto[];
}
```

- [ ] **Paso 5: Recepción**

Crear `backend/src/modules/incidentes/recepcion.service.ts`:

```ts
import { BadRequestException, ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Llamado, Servicio, TipoServicio } from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { esViolacionUnica, NumeracionServicio } from '../servicios/numeracion-servicio';
import type { ContextoIncidente } from './contexto';
import { RecibirServicioDto, VincularLlamadoDto } from './dto/incidentes.dto';

/** Medio por defecto: el primero de la lista de la pantalla de llamados (frontend/src/lib/llamados.ts). */
const MEDIO_POR_DEFECTO = 'Teléfono';

/**
 * Recepcion del servicio: la central crea el incidente en segundos. Se crea el llamado (el hecho:
 * quien llamo y cuando) y el servicio en RECIBIDO. Despachar sigue siendo una decision aparte.
 */
@Injectable()
export class RecepcionService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly cronologia: CronologiaService,
    private readonly numeracion: NumeracionServicio,
  ) {}

  async recibir(dto: RecibirServicioDto, ctx: ContextoIncidente) {
    if (dto.claveIdempotencia) {
      const previo = await this.dataSource.getRepository(Llamado).findOne({ where: { claveIdempotencia: dto.claveIdempotencia } });
      if (previo?.servicioId) {
        const s = await this.dataSource.getRepository(Servicio).findOne({ where: { id: previo.servicioId } });
        return { servicioId: previo.servicioId, numeroServicio: s?.numeroServicio ?? null, llamadoId: previo.id, repetido: true };
      }
    }
    const tipo = await this.dataSource.getRepository(TipoServicio).findOne({ where: { id: dto.tipoServicioId } });
    if (!tipo || !tipo.activo) throw new BadRequestException('El tipo de servicio no existe o está inactivo.');

    for (let intento = 0; intento < 3; intento += 1) {
      try {
        const r = await this.dataSource.transaction(async (m) => {
          const recibidoEn = instanteDelHecho(dto.ocurridoEn);
          const repoS = m.getRepository(Servicio);
          const servicio = await repoS.save(
            repoS.create({
              tipoServicioId: tipo.id,
              numeroServicio: await this.numeracion.siguiente(m),
              fechaHoraAviso: recibidoEn,
              direccion: dto.direccion.trim(),
              ciudad: dto.ciudad?.trim() || null,
              coordenadasLat: dto.latitud ?? null,
              coordenadasLon: dto.longitud ?? null,
              descripcion: dto.descripcion?.trim() || null,
              gravedad: dto.prioridad ?? 'MODERADA',
              estado: 'REGISTRADO',
              faseOperativa: 'RECIBIDO',
              faseDesde: recibidoEn,
              resultado: null,
              creadoPor: ctx.usuarioId,
            }),
          );
          const repoL = m.getRepository(Llamado);
          const llamado = await repoL.save(
            repoL.create({
              recibidoEn,
              claveIdempotencia: dto.claveIdempotencia ?? null,
              medio: dto.medio?.trim() || MEDIO_POR_DEFECTO,
              llamanteNombre: dto.solicitante?.trim() || null,
              llamanteTelefono: dto.telefono?.trim() || null,
              direccion: servicio.direccion,
              referencia: null,
              descripcion: servicio.descripcion,
              tipoServicioId: tipo.id,
              estado: 'EN_ATENCION',
              servicioId: servicio.id,
              recibidoPor: ctx.usuarioId,
            }),
          );
          await this.cronologia.registrar(m, {
            servicioId: servicio.id,
            tipo: 'SERVICIO_RECIBIDO',
            titulo: `Servicio recibido: ${tipo.nombre}`,
            ocurridoEn: recibidoEn,
            usuarioId: ctx.usuarioId,
            fuente: 'llamados',
            fuenteId: llamado.id,
            datos: { medio: llamado.medio, prioridad: servicio.gravedad },
            origen: ctx.origen,
            dispositivo: ctx.dispositivo,
          });
          return { servicio, llamado };
        });
        await this.auditoria.registrar({
          usuarioId: ctx.usuarioId,
          accion: 'RECIBIR_INCIDENTE',
          recurso: 'servicios.incidente',
          recursoId: r.servicio.id,
          datosDespues: { numeroServicio: r.servicio.numeroServicio, tipo: tipo.codigo, prioridad: r.servicio.gravedad, llamadoId: r.llamado.id },
          ip: ctx.ip ?? null,
          userAgent: ctx.userAgent ?? null,
        });
        return { servicioId: r.servicio.id, numeroServicio: r.servicio.numeroServicio, llamadoId: r.llamado.id, repetido: false };
      } catch (error) {
        if (intento < 2 && esViolacionUnica(error)) continue;
        throw error;
      }
    }
    throw new ConflictException('No se pudo asignar un número único al incidente.');
  }

  /** Otra llamada por un incidente que ya se esta atendiendo: no crea un incidente nuevo. */
  async vincularLlamado(servicioId: string, dto: VincularLlamadoDto, ctx: ContextoIncidente) {
    const r = await this.dataSource.transaction(async (m) => {
      const s = await m.getRepository(Servicio).findOne({ where: { id: servicioId } });
      if (!s) throw new NotFoundException('Incidente no encontrado.');
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado: registrá la llamada como un servicio nuevo.');
      const recibidoEn = instanteDelHecho(dto.ocurridoEn);
      const repoL = m.getRepository(Llamado);
      const llamado = await repoL.save(
        repoL.create({
          recibidoEn,
          claveIdempotencia: null,
          medio: dto.medio?.trim() || MEDIO_POR_DEFECTO,
          llamanteNombre: dto.solicitante?.trim() || null,
          llamanteTelefono: dto.telefono?.trim() || null,
          direccion: s.direccion,
          referencia: null,
          descripcion: dto.descripcion?.trim() || null,
          tipoServicioId: s.tipoServicioId,
          estado: 'EN_ATENCION',
          servicioId: s.id,
          recibidoPor: ctx.usuarioId,
        }),
      );
      await this.cronologia.registrar(m, {
        servicioId: s.id,
        tipo: 'LLAMADO_VINCULADO',
        titulo: `Otra llamada por el mismo incidente${llamado.llamanteNombre ? ` (${llamado.llamanteNombre})` : ''}`,
        ocurridoEn: recibidoEn,
        usuarioId: ctx.usuarioId,
        fuente: 'llamados',
        fuenteId: llamado.id,
        origen: ctx.origen,
        dispositivo: ctx.dispositivo,
      });
      return llamado;
    });
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId, accion: 'VINCULAR_LLAMADO', recurso: 'servicios.incidente', recursoId: servicioId,
      datosDespues: { llamadoId: r.id }, ip: ctx.ip ?? null, userAgent: ctx.userAgent ?? null,
    });
    return { llamadoId: r.id };
  }
}
```

- [ ] **Paso 6: Expediente, cronología y tablero**

Crear `backend/src/modules/incidentes/expediente.service.ts`:

```ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager, In, MoreThanOrEqual } from 'typeorm';
import {
  Adjunto, Bombero, CondicionSituacion, Despacho, DisponibilidadPersonal, IncidenteEvento, IncidenteSolicitud,
  Llamado, Parametro, PersonalServicio, Servicio, ServicioParticipante, TipoRecurso, TipoServicio,
  TripulacionMovil, Usuario, Vehiculo, VictimaServicio,
} from '../../shared/entities';
import { totalesPorCategoria } from '../campo/victimas.service';
import {
  condicionesActivas, DESPACHO_ACTIVO, emergenciaActiva, etiquetaMovil, FASES_ACTIVAS, nombreBombero,
} from '../incidente-nucleo/incidente.logica';
import { NOMBRE_PRIORIDAD, num, porId } from './etiquetas';

export type PasoMovil = 'salida' | 'llegada' | 'retorno' | 'disponible';
export const PASOS_MOVIL: readonly PasoMovil[] = ['salida', 'llegada', 'retorno', 'disponible'];

export type NivelAlerta = 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFO';
export interface AlertaTablero {
  nivel: NivelAlerta;
  tipo: 'EMERGENCIA' | 'CONDICION' | 'PEDIDO_URGENTE' | 'SIN_MOVILES' | 'SIN_TRIPULACION' | 'SIMULTANEOS' | 'MOVIL_FUERA';
  servicioId: string | null;
  texto: string;
}
const RANGO: Record<NivelAlerta, number> = { CRITICA: 0, ALTA: 1, MEDIA: 2, INFO: 3 };
/** Tope defensivo de incidentes activos por consulta (parametros de SQL Server). */
const MAX_ACTIVOS = 300;

/** Que tiene que tocar la dotacion de ese movil a continuacion. */
export function siguientePaso(d: Pick<Despacho, 'estado' | 'horaSalida'>): PasoMovil | null {
  if (d.estado === 'DESPACHADO') return d.horaSalida ? 'llegada' : 'salida';
  if (d.estado === 'EN_SERVICIO') return 'retorno';
  if (d.estado === 'REGRESANDO') return 'disponible';
  return null;
}

function leerDatos(datos: string | null): Record<string, unknown> | null {
  if (!datos) return null;
  try {
    return JSON.parse(datos) as Record<string, unknown>;
  } catch {
    return null;
  }
}

export function presentarEvento(e: IncidenteEvento) {
  return {
    id: e.id, tipo: e.tipo, titulo: e.titulo, ocurridoEn: e.ocurridoEn, registradoEn: e.registradoEn,
    usuario: e.usuarioNombre, vehiculoId: e.vehiculoId, despachoId: e.despachoId,
    latitud: num(e.latitud), longitud: num(e.longitud), faseAnterior: e.faseAnterior, faseNueva: e.faseNueva,
    critico: e.critico, origen: e.origen, datos: leerDatos(e.datos),
  };
}

/** Lectura del incidente: catalogos, tablero de la central, expediente y cronologia. */
@Injectable()
export class ExpedienteService {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async catalogos() {
    const m = this.dataSource.manager;
    const [tipos, condiciones, recursos, funciones, bomberos] = await Promise.all([
      m.getRepository(TipoServicio).find({ where: { activo: true } }),
      m.getRepository(CondicionSituacion).find({ where: { activo: true } }),
      m.getRepository(TipoRecurso).find({ where: { activo: true } }),
      m.getRepository(Parametro).find({ where: { tipo: 'FUNCION_INCIDENTE', estado: 'ACTIVO' } }),
      m.getRepository(Bombero).find({ where: { estado: 'ACTIVO' } }),
    ]);
    const porOrden = (a: { orden: number }, b: { orden: number }) => a.orden - b.orden;
    return {
      /** Para ajustar la tripulacion desde el Modo Incidente sin pedir vehiculos:ver. */
      bomberos: bomberos.map((b) => ({ id: b.id, nombre: nombreBombero(b) })).sort((a, b) => a.nombre.localeCompare(b.nombre, 'es')),
      tiposServicio: [...tipos]
        .sort((a, b) => b.prioridad - a.prioridad || a.nombre.localeCompare(b.nombre, 'es'))
        .map((t) => ({ id: t.id, codigo: t.codigo, nombre: t.nombre })),
      condiciones: [...condiciones].sort(porOrden).map((c) => ({ codigo: c.codigo, nombre: c.nombre, grupo: c.grupo, critica: c.critica, grupoExcluyente: c.grupoExcluyente })),
      tiposRecurso: [...recursos].sort(porOrden).map((r) => ({ id: r.id, codigo: r.codigo, nombre: r.nombre, categoria: r.categoria })),
      funciones: [...funciones].filter((p) => !!p.codigo).sort(porOrden).map((p) => ({ codigo: p.codigo as string, nombre: p.nombre })),
      prioridades: Object.entries(NOMBRE_PRIORIDAD).map(([codigo, nombre]) => ({ codigo, nombre })),
    };
  }

  async activos() {
    const m = this.dataSource.manager;
    const servicios = await this.serviciosActivos(m);
    const tipos = await this.porIds(m, TipoServicio, servicios.map((s) => s.tipoServicioId));
    return servicios.map((s) => ({
      id: s.id, numeroServicio: s.numeroServicio, tipo: tipos.get(s.tipoServicioId)?.nombre ?? 'Servicio',
      fase: s.faseOperativa, prioridad: s.gravedad, direccion: s.direccion, recibidoEn: s.fechaHoraAviso,
    }));
  }

  async tablero(ahora = new Date()) {
    const m = this.dataSource.manager;
    const inicioDia = new Date(ahora);
    inicioDia.setHours(0, 0, 0, 0);
    const [activos, cerradosHoy, vehiculos, disponibilidad] = await Promise.all([
      this.serviciosActivos(m),
      m.getRepository(Servicio).find({ where: { faseOperativa: 'CERRADO', faseDesde: MoreThanOrEqual(inicioDia) } }),
      m.getRepository(Vehiculo).find({ where: { estado: In(['OPERATIVO', 'EN_MANTENIMIENTO', 'FUERA_SERVICIO']) } }),
      m.getRepository(DisponibilidadPersonal).find(),
    ]);
    const ids = activos.map((s) => s.id);
    const vacio = ids.length === 0;
    const [eventos, pendientes, despachos, tipos, catalogo] = await Promise.all([
      vacio ? [] : m.getRepository(IncidenteEvento).find({ where: { servicioId: In(ids), tipo: In(['SITUACION_MARCADA', 'SITUACION_RESUELTA', 'EMERGENCIA', 'EMERGENCIA_ATENDIDA']) } }),
      vacio ? [] : m.getRepository(IncidenteSolicitud).find({ where: { servicioId: In(ids), estado: 'SOLICITADO' } }),
      vacio ? [] : m.getRepository(Despacho).find({ where: { servicioId: In(ids), estado: In([...DESPACHO_ACTIVO]) } }),
      this.porIds(m, TipoServicio, activos.map((s) => s.tipoServicioId)),
      m.getRepository(CondicionSituacion).find(),
    ]);
    const personal = despachos.length
      ? await m.getRepository(PersonalServicio).find({ where: { despachoId: In(despachos.map((d) => d.id)) } })
      : [];
    const porServicio = new Map<string, IncidenteEvento[]>();
    for (const e of [...eventos].sort(porId)) {
      const lista = porServicio.get(e.servicioId) ?? [];
      lista.push(e);
      porServicio.set(e.servicioId, lista);
    }
    const condicion = new Map(catalogo.map((c) => [c.codigo, c]));
    const vehiculo = new Map(vehiculos.map((v) => [v.id, v]));

    const incidentes = activos.map((s) => {
      const evs = porServicio.get(s.id) ?? [];
      const criticas = [...condicionesActivas(evs)].map((c) => condicion.get(c)).filter((c): c is CondicionSituacion => !!c?.critica);
      return {
        id: s.id,
        numeroServicio: s.numeroServicio,
        tipo: tipos.get(s.tipoServicioId)?.nombre ?? 'Servicio',
        fase: s.faseOperativa,
        faseDesde: s.faseDesde,
        prioridad: s.gravedad,
        direccion: s.direccion,
        latitud: num(s.coordenadasLat),
        longitud: num(s.coordenadasLon),
        recibidoEn: s.fechaHoraAviso,
        moviles: despachos.filter((d) => d.servicioId === s.id).length,
        condicionesCriticas: criticas.map((c) => c.nombre),
        emergencia: emergenciaActiva(evs),
        pedidosPendientes: pendientes.filter((p) => p.servicioId === s.id).length,
      };
    });

    const porFase = Object.fromEntries(FASES_ACTIVAS.map((f) => [f, activos.filter((s) => s.faseOperativa === f).length]));
    const moviles = {
      disponibles: vehiculos.filter((v) => v.estado === 'OPERATIVO' && v.estadoOperativo === 'EN_CUARTEL').length,
      despachados: vehiculos.filter((v) => v.estadoOperativo === 'DESPACHADO').length,
      enServicio: vehiculos.filter((v) => v.estadoOperativo === 'EN_SERVICIO').length,
      regresando: vehiculos.filter((v) => v.estadoOperativo === 'REGRESANDO').length,
      fueraDeServicio: vehiculos.filter((v) => v.estado !== 'OPERATIVO').length,
    };
    const bomberos = {
      disponibles: disponibilidad.filter((d) => d.estado === 'AL_LLAMADO' || d.estado === 'EN_BASE').length,
      enCamino: disponibilidad.filter((d) => d.estado === 'EN_CAMINO').length,
      enServicio: disponibilidad.filter((d) => d.estado === 'EN_SERVICIO').length,
      noDisponibles: disponibilidad.filter((d) => d.estado === 'NO_DISPONIBLE').length,
    };

    const numero = new Map(activos.map((s) => [s.id, s.numeroServicio]));
    const alertas: AlertaTablero[] = [];
    for (const i of incidentes) {
      if (i.emergencia) alertas.push({ nivel: 'CRITICA', tipo: 'EMERGENCIA', servicioId: i.id, texto: `EMERGENCIA en ${i.numeroServicio}` });
      for (const c of i.condicionesCriticas) alertas.push({ nivel: 'CRITICA', tipo: 'CONDICION', servicioId: i.id, texto: `${c} — ${i.numeroServicio}` });
    }
    for (const p of pendientes.filter((x) => x.prioridad === 'URGENTE')) {
      alertas.push({ nivel: 'ALTA', tipo: 'PEDIDO_URGENTE', servicioId: p.servicioId, texto: `Pedido urgente sin atender — ${numero.get(p.servicioId)}` });
    }
    const esperando = incidentes.filter((i) => i.fase === 'RECIBIDO' || i.fase === 'EVALUACION').length;
    if (esperando > 0 && moviles.disponibles === 0) {
      alertas.push({ nivel: 'ALTA', tipo: 'SIN_MOVILES', servicioId: null, texto: `Sin móviles disponibles y ${esperando} incidente(s) esperando despacho` });
    }
    for (const d of despachos) {
      if (!personal.some((p) => p.despachoId === d.id)) {
        const v = vehiculo.get(d.vehiculoId);
        alertas.push({ nivel: 'MEDIA', tipo: 'SIN_TRIPULACION', servicioId: d.servicioId, texto: `${v ? etiquetaMovil(v) : 'Un móvil'} despachado sin tripulación registrada — ${numero.get(d.servicioId)}` });
      }
    }
    if (incidentes.length > 1) alertas.push({ nivel: 'MEDIA', tipo: 'SIMULTANEOS', servicioId: null, texto: `${incidentes.length} incidentes activos a la vez` });
    for (const v of vehiculos.filter((x) => x.estado !== 'OPERATIVO')) {
      alertas.push({ nivel: 'INFO', tipo: 'MOVIL_FUERA', servicioId: null, texto: `${etiquetaMovil(v)} fuera de servicio (${v.estado.toLowerCase().replace('_', ' ')})` });
    }
    alertas.sort((a, b) => RANGO[a.nivel] - RANGO[b.nivel]);

    return {
      generadoEn: ahora,
      incidentes,
      porFase,
      cerradosHoy: {
        total: cerradosHoy.length,
        falsasAlarmas: cerradosHoy.filter((s) => s.resultado === 'FALSA_ALARMA').length,
        cancelados: cerradosHoy.filter((s) => s.resultado === 'CANCELADO').length,
      },
      moviles,
      bomberos,
      alertas,
    };
  }

  async obtener(servicioId: string, usuarioId: string | null) {
    const m = this.dataSource.manager;
    const s = await m.getRepository(Servicio).findOne({ where: { id: servicioId } });
    if (!s) throw new NotFoundException('Incidente no encontrado.');
    const [tipo, llamados, despachos, personal, eventos, solicitudes, catalogo, victimas, adjuntos, participantes] = await Promise.all([
      m.getRepository(TipoServicio).findOne({ where: { id: s.tipoServicioId } }),
      m.getRepository(Llamado).find({ where: { servicioId } }),
      m.getRepository(Despacho).find({ where: { servicioId } }),
      m.getRepository(PersonalServicio).find({ where: { servicioId } }),
      m.getRepository(IncidenteEvento).find({ where: { servicioId } }),
      m.getRepository(IncidenteSolicitud).find({ where: { servicioId } }),
      m.getRepository(CondicionSituacion).find(),
      m.getRepository(VictimaServicio).find({ where: { servicioId } }),
      m.getRepository(Adjunto).find({ where: { entidad: 'SERVICIO', entidadId: servicioId } }),
      m.getRepository(ServicioParticipante).find({ where: { servicioId } }),
    ]);
    const [vehiculos, bomberos, recursos] = await Promise.all([
      this.porIds(m, Vehiculo, despachos.map((d) => d.vehiculoId)),
      this.porIds(m, Bombero, [...personal.map((p) => p.bomberoId), s.jefeServicioId]),
      this.porIds(m, TipoRecurso, solicitudes.map((x) => x.tipoRecursoId)),
    ]);
    const evs = [...eventos].sort(porId);
    const activas = condicionesActivas(evs);
    const nombre = (id: string) => nombreBombero(bomberos.get(id));
    const fecha = (v: Date | string | null) => (v ? new Date(v).getTime() : 0);
    return {
      incidente: {
        id: s.id,
        numeroServicio: s.numeroServicio,
        tipo: tipo ? { id: tipo.id, codigo: tipo.codigo, nombre: tipo.nombre } : null,
        fase: s.faseOperativa,
        faseDesde: s.faseDesde,
        resultado: s.resultado,
        estado: s.estado,
        prioridad: s.gravedad,
        prioridadNombre: s.gravedad ? NOMBRE_PRIORIDAD[s.gravedad] : null,
        direccion: s.direccion,
        ciudad: s.ciudad,
        latitud: num(s.coordenadasLat),
        longitud: num(s.coordenadasLon),
        descripcion: s.descripcion,
        recibidoEn: s.fechaHoraAviso,
        finalizadoEn: s.fechaHoraFin,
        observaciones: s.informe,
        comandante: s.jefeServicioId ? { bomberoId: s.jefeServicioId, nombre: nombre(s.jefeServicioId) } : null,
      },
      llamados: [...llamados].sort((a, b) => fecha(a.recibidoEn) - fecha(b.recibidoEn)).map((l) => ({
        id: l.id, recibidoEn: l.recibidoEn, medio: l.medio, solicitante: l.llamanteNombre, telefono: l.llamanteTelefono, estado: l.estado,
      })),
      despachos: [...despachos].sort((a, b) => fecha(a.horaDespacho) - fecha(b.horaDespacho)).map((d) => {
        const v = vehiculos.get(d.vehiculoId);
        return {
          id: d.id,
          vehiculoId: d.vehiculoId,
          movil: v ? etiquetaMovil(v) : 'Móvil',
          alias: v?.alias ?? null,
          estado: d.estado,
          activo: DESPACHO_ACTIVO.includes(d.estado),
          siguientePaso: siguientePaso(d),
          horaDespacho: d.horaDespacho,
          horaSalida: d.horaSalida,
          horaLlegada: d.horaLlegada,
          horaFin: d.horaFin,
          horaRegreso: d.horaRegreso,
          tripulacion: personal.filter((p) => p.despachoId === d.id).map((p) => ({ bomberoId: p.bomberoId, nombre: nombre(p.bomberoId), rol: p.rol })),
        };
      }),
      participantes: participantes.map((p) => ({ usuarioId: p.usuarioId, nombre: p.usuarioNombre, estado: p.estado })),
      condiciones: catalogo
        .filter((c) => activas.has(c.codigo))
        .sort((a, b) => a.orden - b.orden)
        .map((c) => ({ codigo: c.codigo, nombre: c.nombre, grupo: c.grupo, critica: c.critica })),
      solicitudes: [...solicitudes].sort((a, b) => fecha(a.solicitadoEn) - fecha(b.solicitadoEn)).map((x) => ({
        id: x.id,
        tipoRecurso: recursos.get(x.tipoRecursoId)?.nombre ?? 'Recurso',
        categoria: recursos.get(x.tipoRecursoId)?.categoria ?? 'OTRO',
        cantidad: x.cantidad,
        prioridad: x.prioridad,
        estado: x.estado,
        observacion: x.observacion,
        solicitadoEn: x.solicitadoEn,
        version: x.version,
      })),
      victimas: totalesPorCategoria(victimas),
      fotos: adjuntos
        .filter((a) => a.tipo === 'FOTO')
        .sort((a, b) => fecha(a.tomadoEn) - fecha(b.tomadoEn))
        .map((a) => ({ id: a.id, categoria: a.categoria, tomadoEn: a.tomadoEn, descripcion: a.descripcion, latitud: num(a.latitud), longitud: num(a.longitud) })),
      emergenciaActiva: emergenciaActiva(evs),
      miDespachoId: usuarioId ? await this.miDespacho(m, usuarioId, despachos, personal) : null,
      ultimoEventoId: evs.length ? evs[evs.length - 1].id : null,
    };
  }

  async cronologia(servicioId: string, desde?: string) {
    const m = this.dataSource.manager;
    const s = await m.getRepository(Servicio).findOne({ where: { id: servicioId } });
    if (!s) throw new NotFoundException('Incidente no encontrado.');
    const eventos = (await m.getRepository(IncidenteEvento).find({ where: { servicioId } })).sort(porId);
    const corte = desde !== undefined && desde !== '' ? Number(desde) : null;
    return (corte === null || Number.isNaN(corte) ? eventos : eventos.filter((e) => Number(e.id) > corte)).map(presentarEvento);
  }

  /** El movil de quien consulta: su fila del personal en un despacho activo, o su tripulacion vigente. */
  private async miDespacho(m: EntityManager, usuarioId: string, despachos: Despacho[], personal: PersonalServicio[]): Promise<string | null> {
    const usuario = await m.getRepository(Usuario).findOne({ where: { id: usuarioId } });
    if (!usuario?.bomberoId) return null;
    const activos = despachos.filter((d) => DESPACHO_ACTIVO.includes(d.estado));
    const propio = personal.find((p) => p.bomberoId === usuario.bomberoId && p.despachoId && activos.some((d) => d.id === p.despachoId));
    if (propio?.despachoId) return propio.despachoId;
    const trip = await m.getRepository(TripulacionMovil).findOne({ where: { bomberoId: usuario.bomberoId } });
    return trip ? (activos.find((d) => d.vehiculoId === trip.vehiculoId)?.id ?? null) : null;
  }

  private serviciosActivos(m: EntityManager) {
    return m.getRepository(Servicio).find({
      where: { faseOperativa: In([...FASES_ACTIVAS]) },
      order: { fechaHoraAviso: 'DESC' },
      take: MAX_ACTIVOS,
    });
  }

  private async porIds<T extends { id: string }>(m: EntityManager, clase: new () => T, ids: Array<string | null | undefined>): Promise<Map<string, T>> {
    const unicos = [...new Set(ids.filter((x): x is string => !!x))];
    if (!unicos.length) return new Map();
    const filas = await m.getRepository(clase).find({ where: { id: In(unicos) } as never });
    return new Map(filas.map((f) => [f.id, f]));
  }
}
```

- [ ] **Paso 7: Controlador, módulo y registro**

Crear `backend/src/modules/incidentes/incidentes.controller.ts`:

```ts
import { Body, Controller, Get, Param, ParseUUIDPipe, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request } from 'express';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { AuthenticatedUser } from '../auth/types/authenticated-user';
import { RequirePermission } from '../seguridad/decorators/require-permission.decorator';
import { PermissionsGuard } from '../seguridad/guards/permissions.guard';
import { contextoDe } from './contexto';
import { RecibirServicioDto, VincularLlamadoDto } from './dto/incidentes.dto';
import { ExpedienteService } from './expediente.service';
import { RecepcionService } from './recepcion.service';

/**
 * Centro de Operaciones e Incidentes. El incidente es el servicio (servicios.servicios) y cada
 * accion deja un evento en la bitacora inmutable (servicios.incidente_eventos).
 * Permisos: servicios:ver/crear/despachar/finalizar (existentes), servicios:operar (acciones de
 * campo del Modo Incidente) y servicios:comandar (decisiones del comando).
 */
@ApiTags('incidentes')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, PermissionsGuard)
@Controller('incidentes')
export class IncidentesController {
  constructor(
    private readonly recepcion: RecepcionService,
    private readonly expediente: ExpedienteService,
  ) {}

  @Get('tablero')
  @RequirePermission('servicios:ver')
  tablero() {
    return this.expediente.tablero();
  }

  @Get('catalogos')
  @RequirePermission('servicios:ver', 'servicios:operar')
  catalogos() {
    return this.expediente.catalogos();
  }

  @Get('activos')
  @RequirePermission('servicios:ver', 'servicios:operar')
  activos() {
    return this.expediente.activos();
  }

  @Post()
  @RequirePermission('servicios:crear')
  recibir(@Body() dto: RecibirServicioDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.recepcion.recibir(dto, contextoDe(user, req));
  }

  @Get(':id')
  @RequirePermission('servicios:ver', 'servicios:operar')
  obtener(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser) {
    return this.expediente.obtener(id, user.id);
  }

  @Get(':id/cronologia')
  @RequirePermission('servicios:ver', 'servicios:operar')
  cronologia(@Param('id', new ParseUUIDPipe()) id: string, @Query('desde') desde?: string) {
    return this.expediente.cronologia(id, desde);
  }

  @Post(':id/llamados')
  @RequirePermission('servicios:crear')
  vincularLlamado(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: VincularLlamadoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.recepcion.vincularLlamado(id, dto, contextoDe(user, req));
  }
}
```

Crear `backend/src/modules/incidentes/incidentes.module.ts`:

```ts
import { Module } from '@nestjs/common';
import { CampoModule } from '../campo/campo.module';
import { FlotaModule } from '../flota/flota.module';
import { IncidenteNucleoModule } from '../incidente-nucleo/incidente-nucleo.module';
import { SeguridadModule } from '../seguridad/seguridad.module';
import { NumeracionServicio } from '../servicios/numeracion-servicio';
import { ExpedienteService } from './expediente.service';
import { IncidentesController } from './incidentes.controller';
import { RecepcionService } from './recepcion.service';

@Module({
  imports: [SeguridadModule, IncidenteNucleoModule, FlotaModule, CampoModule],
  controllers: [IncidentesController],
  providers: [RecepcionService, ExpedienteService, NumeracionServicio],
})
export class IncidentesModule {}
```

En `backend/src/app.module.ts` agregá `import { IncidentesModule } from './modules/incidentes/incidentes.module';`
y `IncidentesModule,` al final del array `imports` (después del último módulo que haya).

- [ ] **Paso 8: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -6 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -10
```

Resultado esperado: PASS (`recepcion.spec` y `expediente.spec`) y `tsc` sin errores.

- [ ] **Paso 9: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/incidentes backend/src/modules/servicios/numeracion-servicio.ts backend/src/modules/servicios/servicios.service.ts backend/src/app.module.ts
git commit -m "Incidentes: recepción rápida, expediente, cronología incremental y tablero con alertas

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 8: Acciones del incidente (despacho rápido, pasos, comando, situación, pedidos, emergencia)

**Archivos:**

- Crear: `backend/src/modules/incidentes/acciones.service.ts`, `backend/src/modules/incidentes/cierre-comun.ts`
- Modificar: `backend/src/modules/incidentes/incidentes.controller.ts`, `incidentes.module.ts`
- Prueba: `backend/src/modules/incidentes/acciones.spec.ts`

**Interfaces:**

- Consume: `FlotaService.despachar/salida/avanzar` (tarea 5), `TripulacionService.copiarAlDespacho`, `conductorDe` (tarea 4), `VictimasService.registrar` (tarea 6), el núcleo (tarea 3), la lógica (tarea 2), `ContextoIncidente`, los DTO, `PASOS_MOVIL`/`PasoMovil` y `etiquetas.ts` (tarea 7).
- Produce:
  - `cerrarLlamadosDelIncidente(m, servicioId, usuarioId, motivo)` y `marcarFin(m, servicio, ahora)` en `cierre-comun.ts`.
  - Métodos de `AccionesService`:
    - `despachar(servicioId, dto, ctx)`, que devuelve `{ resultados: [{ vehiculoId, ok, despachoId, error }] }`.
    - `pasoMovil(servicioId, despachoId, paso, dto, ctx)`, `ajustarTripulacion(servicioId, despachoId, integrantes, ctx)`, `asumirComando(servicioId, ctx)`, `cambiarFase(servicioId, accion, ctx)` y `declararResultado(servicioId, resultado, ctx)`.
    - `cambiarPrioridad(servicioId, prioridad, ctx)`, `situacion(servicioId, dto, ctx)`, `solicitarRecurso(servicioId, dto, ctx)`, `actualizarSolicitud(servicioId, solicitudId, dto, ctx)`, `victimas(servicioId, dto, ctx)`, `emergencia(servicioId, dto, ctx)`, `emergenciaAtendida(servicioId, ctx)` y `comunicacion(servicioId, dto, ctx)`.
  - Las rutas de la tabla 5.3 de la spec, más `POST :id/comunicacion` (ajuste D1).
- **Auditoría:** las decisiones (despacho, fase, resultado, prioridad, comando, tripulación, estado de
  un pedido, emergencia) van también a `AuditoriaService`. Los registros de campo (situación,
  comunicación) quedan en la bitácora inmutable, que ya es la traza.

- [ ] **Paso 1: Escribir las pruebas**

Crear `backend/src/modules/incidentes/acciones.spec.ts`:

```ts
import { ConflictException, ForbiddenException, NotFoundException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Bombero, CondicionSituacion, Despacho, IncidenteEvento, Llamado, Parametro, Servicio, TipoRecurso, Usuario, Vehiculo,
} from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { VictimasService } from '../campo/victimas.service';
import { TripulacionService } from '../flota/tripulacion.service';
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import { MotorFases } from '../incidente-nucleo/motor-fases.service';
import { AccionesService } from './acciones.service';
import type { ContextoIncidente } from './contexto';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('AccionesService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let flota: { despachar: jest.Mock; salida: jest.Mock; avanzar: jest.Mock };
  let acciones: AccionesService;
  const comando: ContextoIncidente = { usuarioId: 'u1', username: 'ana', permisos: ['servicios:operar', 'servicios:comandar', 'servicios:despachar'], origen: 'WEB' };
  const bombero: ContextoIncidente = { ...comando, usuarioId: 'u2', username: 'luis', permisos: ['servicios:operar'] };
  const servicio = () => base.tabla('Servicio')[0] as unknown as Servicio;
  const tipos = () => base.tabla('IncidenteEvento').map((e) => e.tipo);

  beforeEach(async () => {
    base = new BaseFalsa();
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    flota = { despachar: jest.fn(), salida: jest.fn(), avanzar: jest.fn() };
    const cronologia = new CronologiaService();
    const motor = new MotorFases();
    acciones = new AccionesService(
      base as unknown as DataSource, audit as never, cronologia, motor, flota as never,
      new TripulacionService(base as unknown as DataSource, audit as never),
      new VictimasService(base as unknown as DataSource, audit as never, cronologia, motor),
    );
    await sembrar(base, Servicio, { id: 's1', tipoServicioId: 't1', numeroServicio: 'CS-2026-00001', estado: 'EN_CURSO', faseOperativa: 'OPERANDO', resultado: null, direccion: 'Calle 1', fechaHoraAviso: new Date(), jefeServicioId: null, gravedad: 'MODERADA' });
    await sembrar(base, Usuario, { id: 'u1', username: 'ana', bomberoId: 'B1' });
    await sembrar(base, Usuario, { id: 'u2', username: 'luis', bomberoId: null });
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gómez', numeroBombero: 'BC-01', estado: 'ACTIVO' });
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '1', estado: 'OPERATIVO', estadoOperativo: 'EN_SERVICIO' });
    await sembrar(base, CondicionSituacion, { id: 'c1', codigo: 'INCENDIO_ACTIVO', nombre: 'Incendio activo', grupo: 'SITUACION', critica: false, grupoExcluyente: 'INCENDIO', orden: 10, activo: true });
    await sembrar(base, CondicionSituacion, { id: 'c2', codigo: 'INCENDIO_CONTROLADO', nombre: 'Incendio controlado', grupo: 'SITUACION', critica: false, grupoExcluyente: 'INCENDIO', orden: 30, activo: true });
    await sembrar(base, CondicionSituacion, { id: 'c3', codigo: 'MATERIAL_PELIGROSO', nombre: 'Material peligroso', grupo: 'RIESGO', critica: true, grupoExcluyente: null, orden: 230, activo: true });
    await sembrar(base, TipoRecurso, { id: 'r1', codigo: 'AMBULANCIA', nombre: 'Ambulancia', categoria: 'EXTERNO', orden: 40, activo: true });
    await sembrar(base, Parametro, { id: 'p1', tipo: 'FUNCION_INCIDENTE', codigo: 'CONDUCTOR', nombre: 'Conductor', orden: 30, estado: 'ACTIVO' });
  });

  it('despacha varios móviles e informa por móvil sin abortar los demás', async () => {
    flota.despachar
      .mockResolvedValueOnce({ id: 'd1' })
      .mockRejectedValueOnce(new ConflictException('El movil ya esta DESPACHADO; debe estar EN_CUARTEL para despacharse.'))
      .mockResolvedValueOnce({ id: 'd3' });
    const r = await acciones.despachar('s1', { moviles: [
      { vehiculoId: 'V1', salir: true }, { vehiculoId: 'V2', salir: false }, { vehiculoId: 'V3', salir: true },
    ] }, comando);
    expect(r.resultados).toEqual([
      { vehiculoId: 'V1', ok: true, despachoId: 'd1', error: null },
      { vehiculoId: 'V2', ok: false, despachoId: null, error: 'El movil ya esta DESPACHADO; debe estar EN_CUARTEL para despacharse.' },
      { vehiculoId: 'V3', ok: true, despachoId: 'd3', error: null },
    ]);
    expect(flota.despachar).toHaveBeenNthCalledWith(2, expect.objectContaining({ servicioId: 's1', vehiculoId: 'V2', salir: false }), comando);
  });

  it('un paso de móvil delega en flota y un reintento con la misma clave no lo repite', async () => {
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', vehiculoId: 'V1', estado: 'DESPACHADO', horaDespacho: new Date(), horaSalida: new Date() });
    flota.avanzar.mockResolvedValue({ id: 'd1', estado: 'EN_SERVICIO' });
    await acciones.pasoMovil('s1', 'd1', 'llegada', { claveIdempotencia: 'llegada-0001', gps: { latitud: -25.3, longitud: -57.6 } }, bombero);
    expect(flota.avanzar).toHaveBeenCalledWith('d1', 'llegada', bombero, expect.objectContaining({ claveIdempotencia: 'llegada-0001', gps: { latitud: -25.3, longitud: -57.6 } }));
    await sembrar(base, IncidenteEvento, { id: '9', servicioId: 's1', tipo: 'MOVIL_LLEGO', titulo: 'x', claveIdempotencia: 'llegada-0001' });
    const otra = await acciones.pasoMovil('s1', 'd1', 'llegada', { claveIdempotencia: 'llegada-0001' }, bombero);
    expect(flota.avanzar).toHaveBeenCalledTimes(1);
    expect(otra).toMatchObject({ id: 'd1', repetido: true });
  });

  it('un despacho de otro incidente es 404', async () => {
    await sembrar(base, Despacho, { id: 'dX', servicioId: 'otro', vehiculoId: 'V1', estado: 'DESPACHADO', horaDespacho: new Date() });
    await expect(acciones.pasoMovil('s1', 'dX', 'salida', {}, bombero)).rejects.toThrow(NotFoundException);
  });

  it('CONTROLADO deja un evento con las fases; sin servicios:comandar es 403', async () => {
    await expect(acciones.cambiarFase('s1', 'CONTROLADO', bombero)).rejects.toThrow(ForbiddenException);
    await acciones.cambiarFase('s1', 'CONTROLADO', comando);
    expect(servicio().faseOperativa).toBe('CONTROLADO');
    expect(base.tabla('IncidenteEvento')[0]).toMatchObject({ tipo: 'FASE_CAMBIADA', titulo: 'Incidente controlado', faseAnterior: 'OPERANDO', faseNueva: 'CONTROLADO' });
  });

  it('falsa alarma con un móvil afuera pasa a RETORNO', async () => {
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', vehiculoId: 'V1', estado: 'EN_SERVICIO', horaDespacho: new Date() });
    await acciones.declararResultado('s1', 'FALSA_ALARMA', comando);
    expect(servicio()).toMatchObject({ faseOperativa: 'RETORNO', resultado: 'FALSA_ALARMA', estado: 'EN_CURSO' });
  });

  it('cancelar antes de despachar cierra en el acto y cierra los llamados', async () => {
    Object.assign(servicio(), { faseOperativa: 'RECIBIDO', estado: 'REGISTRADO' });
    await sembrar(base, Llamado, { id: 'l1', servicioId: 's1', estado: 'EN_ATENCION' });
    await acciones.declararResultado('s1', 'CANCELADO', { ...comando, permisos: ['servicios:despachar'] });
    expect(servicio()).toMatchObject({ faseOperativa: 'CERRADO', estado: 'CANCELADO', resultado: 'CANCELADO' });
    expect(base.tabla('Llamado')[0]).toMatchObject({ estado: 'CERRADO', cerradoPor: 'u1' });
  });

  it('las condiciones excluyentes se resuelven en un solo evento; repetir no agrega nada', async () => {
    await acciones.situacion('s1', { condicion: 'INCENDIO_ACTIVO', activa: true }, bombero);
    const r = await acciones.situacion('s1', { condicion: 'INCENDIO_CONTROLADO', activa: true }, bombero);
    expect(r.activas).toEqual(['INCENDIO_CONTROLADO']);
    expect(tipos()).toEqual(['SITUACION_MARCADA', 'SITUACION_MARCADA']);
    const otra = await acciones.situacion('s1', { condicion: 'INCENDIO_CONTROLADO', activa: true }, bombero);
    expect(otra.repetido).toBe(true);
    expect(tipos()).toHaveLength(2);
  });

  it('una condición crítica marca el evento como crítico', async () => {
    await acciones.situacion('s1', { condicion: 'MATERIAL_PELIGROSO', activa: true }, bombero);
    expect(base.tabla('IncidenteEvento')[0]).toMatchObject({ tipo: 'SITUACION_MARCADA', critico: true, titulo: 'Material peligroso' });
  });

  it('un pedido urgente queda SOLICITADO, en la bitácora como crítico y es idempotente', async () => {
    const dto = { tipoRecursoId: 'r1', prioridad: 'URGENTE' as const, claveIdempotencia: 'pedido-00001' };
    const a = await acciones.solicitarRecurso('s1', dto, bombero);
    const b = await acciones.solicitarRecurso('s1', dto, bombero);
    expect(b.id).toBe(a.id);
    expect(a).toMatchObject({ estado: 'SOLICITADO', cantidad: 1, prioridad: 'URGENTE' });
    expect(base.tabla('IncidenteEvento')).toEqual([expect.objectContaining({ tipo: 'RECURSO_SOLICITADO', critico: true, titulo: 'Pedido URGENTE: 1 × Ambulancia' })]);
  });

  it('el estado de un pedido exige la versión vigente y no retrocede', async () => {
    const sol = await acciones.solicitarRecurso('s1', { tipoRecursoId: 'r1', prioridad: 'NORMAL' }, bombero);
    await acciones.actualizarSolicitud('s1', sol.id, { estado: 'APROBADO', version: 0 }, comando);
    await expect(acciones.actualizarSolicitud('s1', sol.id, { estado: 'DESPACHADO', version: 0 }, comando)).rejects.toThrow(/otro equipo/);
    await expect(acciones.actualizarSolicitud('s1', sol.id, { estado: 'SOLICITADO', version: 1 }, comando)).rejects.toThrow(ConflictException);
  });

  it('EMERGENCIA se registra como crítica y solo se atiende si está activa', async () => {
    await expect(acciones.emergenciaAtendida('s1', comando)).rejects.toThrow(ConflictException);
    await acciones.emergencia('s1', { detalle: 'Bombero atrapado en planta alta' }, bombero);
    await acciones.emergenciaAtendida('s1', comando);
    expect(base.tabla('IncidenteEvento').map((e) => [e.tipo, e.critico])).toEqual([['EMERGENCIA', true], ['EMERGENCIA_ATENDIDA', false]]);
  });

  it('asumir comando exige un bombero vinculado y lo registra', async () => {
    await expect(acciones.asumirComando('s1', bombero)).rejects.toThrow(/vinculado a un bombero/);
    await acciones.asumirComando('s1', comando);
    expect(servicio().jefeServicioId).toBe('B1');
    expect(base.tabla('IncidenteEvento')[0]).toMatchObject({ tipo: 'COMANDO_ASUMIDO', titulo: 'Ana Gómez (BC-01) asume el comando' });
  });

  it('una comunicación queda en la bitácora con su texto', async () => {
    await acciones.comunicacion('s1', { texto: 'Móvil 1 informa incendio confirmado en planta baja' }, bombero);
    expect(base.tabla('IncidenteEvento')[0]).toMatchObject({ tipo: 'COMUNICACION', titulo: 'Móvil 1 informa incendio confirmado en planta baja' });
  });

  it('el ajuste de tripulación reemplaza la gente del móvil y fija el conductor', async () => {
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', vehiculoId: 'V1', estado: 'DESPACHADO', horaDespacho: new Date(), conductorId: null });
    await acciones.ajustarTripulacion('s1', 'd1', [{ bomberoId: 'B1', funcion: 'CONDUCTOR' }], comando);
    expect(base.tabla('PersonalServicio')).toEqual([expect.objectContaining({ bomberoId: 'B1', despachoId: 'd1', origen: 'AJUSTE' })]);
    expect((base.tabla('Despacho')[0] as Record<string, unknown>).conductorId).toBe('B1');
    expect(tipos()).toEqual(['TRIPULACION_AJUSTADA']);
  });
});
```

- [ ] **Paso 2: Correr la prueba para ver que falla**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes/acciones.spec.ts 2>&1 | tail -5
```

Resultado esperado: FAIL con `Cannot find module './acciones.service'`.

- [ ] **Paso 3: Ayudantes de cierre compartidos**

Crear `backend/src/modules/incidentes/cierre-comun.ts`:

```ts
import type { EntityManager } from 'typeorm';
import { Llamado, Servicio } from '../../shared/entities';

/** Al cerrar el incidente se cierran sus llamados (siguen siendo el registro de quien llamo). */
export async function cerrarLlamadosDelIncidente(m: EntityManager, servicioId: string, usuarioId: string, motivo: string) {
  const repo = m.getRepository(Llamado);
  const abiertos = (await repo.find({ where: { servicioId } })).filter((l) => l.estado !== 'CERRADO');
  const ahora = new Date();
  for (const l of abiertos) {
    await repo.update({ id: l.id }, { estado: 'CERRADO', cerradoPor: usuarioId, cerradoEn: ahora, motivoCierre: motivo.slice(0, 500) });
  }
}

/** Hora de fin y duracion total del servicio, si todavia no estaban. */
export async function marcarFin(m: EntityManager, s: Servicio, ahora: Date) {
  if (s.fechaHoraFin) return;
  const minutos = Math.max(0, Math.round((ahora.getTime() - new Date(s.fechaHoraAviso).getTime()) / 60_000));
  await m.getRepository(Servicio).update({ id: s.id }, { fechaHoraFin: ahora, tiempoTotalMinutos: minutos });
}
```

- [ ] **Paso 4: Servicio de acciones**

Crear `backend/src/modules/incidentes/acciones.service.ts`:

```ts
import {
  BadRequestException, ConflictException, HttpException, Injectable, Logger, NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import {
  CondicionSituacion, Despacho, GravedadServicio, IncidenteEvento, IncidenteSolicitud, ResultadoIncidente,
  Servicio, TipoRecurso, Usuario, Vehiculo,
} from '../../shared/entities';
import { instanteDelHecho } from '../../shared/utils/instante';
import { VictimasService } from '../campo/victimas.service';
import { FlotaService } from '../flota/flota.service';
import { conductorDe, IntegranteTripulacion, TripulacionService } from '../flota/tripulacion.service';
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import {
  AccionFase, condicionesActivas, DESPACHO_ACTIVO, emergenciaActiva, etiquetaMovil, excluyentesDe,
  exigirPermisoResultado, faseTrasResultado, NOMBRE_RESULTADO, transicionManual, validarEstadoRecurso,
} from '../incidente-nucleo/incidente.logica';
import { CambioFase, MotorFases } from '../incidente-nucleo/motor-fases.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { cerrarLlamadosDelIncidente, marcarFin } from './cierre-comun';
import type { ContextoIncidente } from './contexto';
import {
  AccionCampoDto, ComunicacionDto, DespacharMovilesDto, EmergenciaDto, EstadoSolicitudDto,
  SituacionDto, SolicitarRecursoDto, VictimasIncidenteDto,
} from './dto/incidentes.dto';
import { NOMBRE_ESTADO_RECURSO, NOMBRE_PRIORIDAD, porId, TITULO_FASE } from './etiquetas';
import { PASOS_MOVIL, PasoMovil } from './expediente.service';

function mensajeDe(e: unknown): string {
  if (e instanceof HttpException) {
    const r = e.getResponse();
    if (typeof r === 'string') return r;
    const m = (r as { message?: string | string[] }).message;
    return Array.isArray(m) ? m.join(' ') : (m ?? e.message);
  }
  return 'Error inesperado al despachar este móvil.';
}

/** Las acciones del incidente: cada una en su transaccion, con su evento en la bitacora. */
@Injectable()
export class AccionesService {
  private readonly log = new Logger(AccionesService.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly cronologia: CronologiaService,
    private readonly motor: MotorFases,
    private readonly flota: FlotaService,
    private readonly tripulacion: TripulacionService,
    private readonly victimasServicio: VictimasService,
  ) {}

  /** Despacho rapido de varios moviles: cada uno en su transaccion; uno que falla no revierte a los demas. */
  async despachar(servicioId: string, dto: DespacharMovilesDto, ctx: ContextoIncidente) {
    const resultados: Array<{ vehiculoId: string; ok: boolean; despachoId: string | null; error: string | null }> = [];
    for (const movil of dto.moviles) {
      try {
        const d = await this.flota.despachar({ servicioId, vehiculoId: movil.vehiculoId, salir: movil.salir, tripulacion: movil.tripulacion }, ctx);
        resultados.push({ vehiculoId: movil.vehiculoId, ok: true, despachoId: d.id, error: null });
      } catch (e) {
        if (!(e instanceof HttpException)) this.log.error(`Despacho de ${movil.vehiculoId} en ${servicioId}`, e as Error);
        resultados.push({ vehiculoId: movil.vehiculoId, ok: false, despachoId: null, error: mensajeDe(e) });
      }
    }
    return { resultados };
  }

  /** SALIMOS / LLEGAMOS / RETORNANDO / DISPONIBLE. Un reintento con la misma clave no repite el paso. */
  async pasoMovil(servicioId: string, despachoId: string, paso: PasoMovil, dto: AccionCampoDto, ctx: ContextoIncidente) {
    if (!PASOS_MOVIL.includes(paso)) throw new BadRequestException(`Paso desconocido: ${paso}.`);
    const d = await this.dataSource.getRepository(Despacho).findOne({ where: { id: despachoId } });
    if (!d || d.servicioId !== servicioId) throw new NotFoundException('Ese móvil no está despachado a este incidente.');
    if (dto.claveIdempotencia && (await this.cronologia.buscarPorClave(this.dataSource.manager, servicioId, dto.claveIdempotencia))) {
      return { ...d, repetido: true };
    }
    const extra = { ocurridoEn: dto.ocurridoEn, gps: dto.gps ?? null, claveIdempotencia: dto.claveIdempotencia ?? null };
    if (paso === 'salida') return this.flota.salida(despachoId, ctx, extra);
    if (paso === 'llegada') return this.flota.avanzar(despachoId, 'llegada', ctx, extra);
    if (paso === 'retorno') return this.flota.avanzar(despachoId, 'fin', ctx, extra);
    return this.flota.avanzar(despachoId, 'regreso', ctx, extra);
  }

  async ajustarTripulacion(servicioId: string, despachoId: string, integrantes: IntegranteTripulacion[], ctx: ContextoIncidente) {
    await this.dataSource.transaction(async (m) => {
      const d = await m.getRepository(Despacho).findOne({ where: { id: despachoId } });
      if (!d || d.servicioId !== servicioId) throw new NotFoundException('Ese móvil no está despachado a este incidente.');
      if (!DESPACHO_ACTIVO.includes(d.estado)) throw new ConflictException('Ese móvil ya volvió: su tripulación se corrige en el cierre.');
      await this.tripulacion.copiarAlDespacho(m, { servicioId, despachoId, vehiculoId: d.vehiculoId, integrantes, origen: 'AJUSTE', reemplazar: true });
      await m.getRepository(Despacho).update({ id: despachoId }, { conductorId: conductorDe(integrantes) });
      const v = await m.getRepository(Vehiculo).findOne({ where: { id: d.vehiculoId } });
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'TRIPULACION_AJUSTADA',
        titulo: `Tripulación del ${v ? etiquetaMovil(v) : 'móvil'}: ${integrantes.length} persona(s)`,
        usuarioId: ctx.usuarioId, vehiculoId: d.vehiculoId, despachoId, datos: { integrantes },
        origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
    });
    await this.auditar(ctx, 'AJUSTAR_TRIPULACION', servicioId, null, { despachoId, integrantes });
    return { despachoId, integrantes };
  }

  async asumirComando(servicioId: string, ctx: ContextoIncidente) {
    const usuario = await this.dataSource.getRepository(Usuario).findOne({ where: { id: ctx.usuarioId } });
    if (!usuario?.bomberoId) throw new ConflictException('Tu usuario no está vinculado a un bombero: no puede figurar como comandante.');
    const bomberoId = usuario.bomberoId;
    const anterior = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      const previo = s.jefeServicioId;
      await m.getRepository(Servicio).update({ id: s.id }, { jefeServicioId: bomberoId });
      const fase = await this.motor.alHecho(m, s.id, 'ACCION_OPERATIVA');
      const nombre = (await this.cronologia.nombreDe(m, ctx.usuarioId)) ?? ctx.username;
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'COMANDO_ASUMIDO', titulo: `${nombre} asume el comando`, usuarioId: ctx.usuarioId,
        fase, datos: { anterior: previo, nuevo: bomberoId }, origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
      return previo;
    });
    await this.auditar(ctx, 'ASUMIR_COMANDO', servicioId, { jefeServicioId: anterior }, { jefeServicioId: bomberoId });
    return { comandanteBomberoId: bomberoId };
  }

  async cambiarFase(servicioId: string, accion: AccionFase, ctx: ContextoIncidente) {
    const fase = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      const destino = transicionManual(s.faseOperativa, accion, ctx.permisos);
      const cambio = await this.motor.fijar(m, s, destino);
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'FASE_CAMBIADA', titulo: TITULO_FASE[accion], usuarioId: ctx.usuarioId,
        fase: cambio, datos: { accion }, origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
      return cambio;
    });
    await this.auditar(ctx, 'CAMBIAR_FASE', servicioId, { fase: fase.antes }, { fase: fase.despues, accion });
    return fase;
  }

  async declararResultado(servicioId: string, resultado: ResultadoIncidente, ctx: ContextoIncidente) {
    const r = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      exigirPermisoResultado(s.faseOperativa, ctx.permisos);
      const activos = await this.motor.despachosActivos(m, servicioId);
      const destino = faseTrasResultado(s.faseOperativa, activos.length);
      const ahora = new Date();
      let cambio: CambioFase | null = null;
      if (destino) cambio = await this.motor.fijar(m, s, destino, ahora, resultado);
      else await m.getRepository(Servicio).update({ id: s.id }, { resultado });
      if (destino === 'CERRADO') {
        await marcarFin(m, s, ahora);
        await cerrarLlamadosDelIncidente(m, servicioId, ctx.usuarioId, `Incidente cerrado: ${NOMBRE_RESULTADO[resultado]}`);
      }
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'RESULTADO_DECLARADO', titulo: `Resultado: ${NOMBRE_RESULTADO[resultado]}`, ocurridoEn: ahora,
        usuarioId: ctx.usuarioId, fase: cambio, datos: { resultado }, origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
      return { fase: cambio?.despues ?? s.faseOperativa, resultado, faseAntes: cambio?.antes ?? s.faseOperativa };
    });
    await this.auditar(ctx, 'DECLARAR_RESULTADO', servicioId, { fase: r.faseAntes }, { fase: r.fase, resultado });
    return { fase: r.fase, resultado };
  }

  async cambiarPrioridad(servicioId: string, prioridad: GravedadServicio, ctx: ContextoIncidente) {
    const antes = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      await m.getRepository(Servicio).update({ id: s.id }, { gravedad: prioridad });
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'PRIORIDAD_CAMBIADA', titulo: `Prioridad: ${NOMBRE_PRIORIDAD[prioridad]}`, usuarioId: ctx.usuarioId,
        datos: { antes: s.gravedad, despues: prioridad }, origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
      return s.gravedad;
    });
    await this.auditar(ctx, 'CAMBIAR_PRIORIDAD', servicioId, { prioridad: antes }, { prioridad });
    return { prioridad };
  }

  /** Marcar o resolver una condicion de SITUACION. Marcar una excluyente resuelve las de su grupo en el mismo evento. */
  async situacion(servicioId: string, dto: SituacionDto, ctx: ContextoIncidente) {
    const condicion = await this.dataSource.getRepository(CondicionSituacion).findOne({ where: { codigo: dto.condicion, activo: true } });
    if (!condicion) throw new BadRequestException('Condición desconocida.');
    return this.dataSource.transaction(async (m) => {
      if (dto.claveIdempotencia && (await this.cronologia.buscarPorClave(m, servicioId, dto.claveIdempotencia))) {
        return { repetido: true, activas: null as string[] | null };
      }
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      const eventos = (await m.getRepository(IncidenteEvento).find({ where: { servicioId } })).sort(porId);
      const activas = condicionesActivas(eventos);
      if (dto.activa === activas.has(condicion.codigo)) return { repetido: true, activas: [...activas] };
      const ocurridoEn = instanteDelHecho(dto.ocurridoEn);
      let resueltas: string[] = [];
      let fase: CambioFase | null = null;
      if (dto.activa) {
        const catalogo = await m.getRepository(CondicionSituacion).find({ where: { activo: true } });
        resueltas = excluyentesDe(condicion.codigo, catalogo, activas);
        fase = await this.motor.alHecho(m, servicioId, 'ACCION_OPERATIVA', ocurridoEn);
      }
      const datos = dto.activa ? { codigo: condicion.codigo, resueltas } : { codigo: condicion.codigo };
      const tipo = dto.activa ? 'SITUACION_MARCADA' : 'SITUACION_RESUELTA';
      await this.cronologia.registrar(m, {
        servicioId, tipo, titulo: dto.activa ? condicion.nombre : `${condicion.nombre}: resuelto`, ocurridoEn,
        usuarioId: ctx.usuarioId, gps: dto.gps ?? null, fase, datos, critico: dto.activa && condicion.critica,
        origen: ctx.origen, dispositivo: ctx.dispositivo, claveIdempotencia: dto.claveIdempotencia,
      });
      return { repetido: false, activas: [...condicionesActivas([...eventos, { tipo, datos: JSON.stringify(datos) }])] };
    });
  }

  async solicitarRecurso(servicioId: string, dto: SolicitarRecursoDto, ctx: ContextoIncidente) {
    const tipo = await this.dataSource.getRepository(TipoRecurso).findOne({ where: { id: dto.tipoRecursoId, activo: true } });
    if (!tipo) throw new BadRequestException('Tipo de recurso desconocido.');
    return this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(IncidenteSolicitud);
      if (dto.claveIdempotencia) {
        const previa = await repo.findOne({ where: { servicioId, claveIdempotencia: dto.claveIdempotencia } });
        if (previa) return previa;
      }
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      const ahora = instanteDelHecho(dto.ocurridoEn);
      const sol = await repo.save(
        repo.create({
          servicioId, tipoRecursoId: tipo.id, cantidad: dto.cantidad ?? 1, prioridad: dto.prioridad, estado: 'SOLICITADO',
          observacion: dto.observacion?.trim() || null, solicitadoPor: ctx.usuarioId, solicitadoEn: ahora,
          actualizadoPor: null, actualizadoEn: ahora, version: 0, claveIdempotencia: dto.claveIdempotencia ?? null,
        }),
      );
      const fase = await this.motor.alHecho(m, servicioId, 'ACCION_OPERATIVA', ahora);
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'RECURSO_SOLICITADO',
        titulo: `Pedido${dto.prioridad === 'URGENTE' ? ' URGENTE' : ''}: ${sol.cantidad} × ${tipo.nombre}`,
        ocurridoEn: ahora, usuarioId: ctx.usuarioId, gps: dto.gps ?? null, fase,
        fuente: 'incidente_solicitudes', fuenteId: sol.id,
        datos: { tipoRecurso: tipo.codigo, cantidad: sol.cantidad, prioridad: sol.prioridad },
        critico: dto.prioridad === 'URGENTE', origen: ctx.origen, dispositivo: ctx.dispositivo,
        claveIdempotencia: dto.claveIdempotencia,
      });
      return sol;
    });
  }

  async actualizarSolicitud(servicioId: string, solicitudId: string, dto: EstadoSolicitudDto, ctx: ContextoIncidente) {
    const r = await this.dataSource.transaction(async (m) => {
      const repo = m.getRepository(IncidenteSolicitud);
      const sol = await repo.findOne({ where: { id: solicitudId } });
      if (!sol || sol.servicioId !== servicioId) throw new NotFoundException('Pedido no encontrado.');
      validarEstadoRecurso(sol.estado, dto.estado);
      const ahora = new Date();
      const hecho = await repo.update(
        { id: sol.id, version: dto.version },
        { estado: dto.estado, actualizadoPor: ctx.usuarioId, actualizadoEn: ahora, version: dto.version + 1 },
      );
      if (!hecho.affected) throw new ConflictException('El pedido cambió desde otro equipo. Actualizá e intentá de nuevo.');
      const tipo = await m.getRepository(TipoRecurso).findOne({ where: { id: sol.tipoRecursoId } });
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'RECURSO_ACTUALIZADO', titulo: `${tipo?.nombre ?? 'Recurso'}: ${NOMBRE_ESTADO_RECURSO[dto.estado]}`,
        ocurridoEn: ahora, usuarioId: ctx.usuarioId, fuente: 'incidente_solicitudes', fuenteId: sol.id,
        datos: { antes: sol.estado, despues: dto.estado }, origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
      return { antes: sol.estado };
    });
    await this.auditar(ctx, 'ACTUALIZAR_PEDIDO', servicioId, { solicitudId, estado: r.antes }, { solicitudId, estado: dto.estado });
    return { id: solicitudId, estado: dto.estado, version: dto.version + 1 };
  }

  victimas(servicioId: string, dto: VictimasIncidenteDto, ctx: ContextoIncidente) {
    return this.victimasServicio.registrar(
      { servicioId, categoria: dto.categoria, cantidad: dto.cantidad, observacion: dto.observacion },
      ctx,
      { gps: dto.gps ?? null, claveIdempotencia: dto.claveIdempotencia ?? null, origen: ctx.origen, ocurridoEn: dto.ocurridoEn },
    );
  }

  async emergencia(servicioId: string, dto: EmergenciaDto, ctx: ContextoIncidente) {
    const evento = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      const nombre = (await this.cronologia.nombreDe(m, ctx.usuarioId)) ?? ctx.username;
      return this.cronologia.registrar(m, {
        servicioId, tipo: 'EMERGENCIA', titulo: `EMERGENCIA${dto.detalle ? `: ${dto.detalle}` : ''} — ${nombre}`,
        ocurridoEn: instanteDelHecho(dto.ocurridoEn), usuarioId: ctx.usuarioId, gps: dto.gps ?? null, critico: true,
        datos: { detalle: dto.detalle ?? null }, origen: ctx.origen, dispositivo: ctx.dispositivo,
        claveIdempotencia: dto.claveIdempotencia,
      });
    });
    await this.auditar(ctx, 'EMERGENCIA', servicioId, null, { eventoId: evento.id, detalle: dto.detalle ?? null });
    return { eventoId: evento.id };
  }

  async emergenciaAtendida(servicioId: string, ctx: ContextoIncidente) {
    const evento = await this.dataSource.transaction(async (m) => {
      await this.motor.bloquear(m, servicioId);
      const eventos = (await m.getRepository(IncidenteEvento).find({ where: { servicioId } })).sort(porId);
      if (!emergenciaActiva(eventos)) throw new ConflictException('No hay una emergencia activa en este incidente.');
      const nombre = (await this.cronologia.nombreDe(m, ctx.usuarioId)) ?? ctx.username;
      return this.cronologia.registrar(m, {
        servicioId, tipo: 'EMERGENCIA_ATENDIDA', titulo: `Emergencia atendida (${nombre})`, usuarioId: ctx.usuarioId,
        origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
    });
    await this.auditar(ctx, 'EMERGENCIA_ATENDIDA', servicioId, null, { eventoId: evento.id });
    return { eventoId: evento.id };
  }

  /** Bitacora de comunicaciones (punto 28): "Movil 1 informa llegada", "Solicita refuerzo"... */
  async comunicacion(servicioId: string, dto: ComunicacionDto, ctx: ContextoIncidente) {
    const texto = dto.texto.trim();
    const evento = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      return this.cronologia.registrar(m, {
        servicioId, tipo: 'COMUNICACION', titulo: texto, ocurridoEn: instanteDelHecho(dto.ocurridoEn),
        usuarioId: ctx.usuarioId, gps: dto.gps ?? null, datos: { texto }, origen: ctx.origen, dispositivo: ctx.dispositivo,
        claveIdempotencia: dto.claveIdempotencia,
      });
    });
    return { eventoId: evento.id };
  }

  private auditar(ctx: ContextoIncidente, accion: string, servicioId: string, antes: Record<string, unknown> | null, despues: Record<string, unknown>) {
    return this.auditoria.registrar({
      usuarioId: ctx.usuarioId, accion, recurso: 'servicios.incidente', recursoId: servicioId,
      datosAntes: antes ?? undefined, datosDespues: despues, ip: ctx.ip ?? null, userAgent: ctx.userAgent ?? null,
      metadata: { origen: ctx.origen, dispositivo: ctx.dispositivo ?? null },
    });
  }
}
```

**Nota:** si la interfaz `RegistrarAuditoriaInput` no tiene `metadata`, quitá esa línea. El servicio la
acepta (`auditoria.service.ts` la serializa), pero confirmá el tipo.

- [ ] **Paso 5: Rutas y módulo**

En `backend/src/modules/incidentes/incidentes.controller.ts`:

- Sumá `Put` al import de `@nestjs/common`, los DTO
  `ComunicacionDto, DespacharMovilesDto, EmergenciaDto, EstadoSolicitudDto, FaseDto, PrioridadDto, ResultadoDto, SituacionDto, SolicitarRecursoDto, TripulacionDespachoDto, VictimasIncidenteDto, AccionCampoDto`,
  `import { AccionesService } from './acciones.service';` y `import type { PasoMovil } from './expediente.service';`.
- Constructor: agregá `private readonly acciones: AccionesService,`.
- Al final de la clase agregá:

```ts
  @Post(':id/despachos')
  @RequirePermission('servicios:despachar')
  despachar(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: DespacharMovilesDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.despachar(id, dto, contextoDe(user, req));
  }

  @Put(':id/despachos/:despachoId/tripulacion')
  @RequirePermission('servicios:despachar', 'servicios:operar')
  ajustarTripulacion(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('despachoId', new ParseUUIDPipe()) despachoId: string,
    @Body() dto: TripulacionDespachoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.acciones.ajustarTripulacion(id, despachoId, dto.integrantes, contextoDe(user, req));
  }

  @Post(':id/despachos/:despachoId/:paso')
  @RequirePermission('servicios:operar', 'servicios:despachar')
  pasoMovil(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('despachoId', new ParseUUIDPipe()) despachoId: string,
    @Param('paso') paso: PasoMovil,
    @Body() dto: AccionCampoDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.acciones.pasoMovil(id, despachoId, paso, dto, contextoDe(user, req));
  }

  @Post(':id/comando')
  @RequirePermission('servicios:comandar')
  asumirComando(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.asumirComando(id, contextoDe(user, req));
  }

  @Post(':id/fase')
  @RequirePermission('servicios:despachar', 'servicios:comandar')
  cambiarFase(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: FaseDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.cambiarFase(id, dto.accion, contextoDe(user, req));
  }

  @Post(':id/resultado')
  @RequirePermission('servicios:despachar', 'servicios:comandar')
  declararResultado(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ResultadoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.declararResultado(id, dto.resultado, contextoDe(user, req));
  }

  @Post(':id/prioridad')
  @RequirePermission('servicios:despachar', 'servicios:comandar')
  cambiarPrioridad(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: PrioridadDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.cambiarPrioridad(id, dto.prioridad, contextoDe(user, req));
  }

  @Post(':id/situacion')
  @RequirePermission('servicios:operar')
  situacion(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: SituacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.situacion(id, dto, contextoDe(user, req));
  }

  @Post(':id/solicitudes')
  @RequirePermission('servicios:operar')
  solicitarRecurso(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: SolicitarRecursoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.solicitarRecurso(id, dto, contextoDe(user, req));
  }

  @Post(':id/solicitudes/:solicitudId/estado')
  @RequirePermission('servicios:despachar')
  actualizarSolicitud(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('solicitudId', new ParseUUIDPipe()) solicitudId: string,
    @Body() dto: EstadoSolicitudDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.acciones.actualizarSolicitud(id, solicitudId, dto, contextoDe(user, req));
  }

  @Post(':id/victimas')
  @RequirePermission('servicios:operar')
  victimas(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: VictimasIncidenteDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.victimas(id, dto, contextoDe(user, req));
  }

  @Post(':id/emergencia')
  @RequirePermission('servicios:operar')
  emergencia(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: EmergenciaDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.emergencia(id, dto, contextoDe(user, req));
  }

  @Post(':id/emergencia/atendida')
  @RequirePermission('servicios:comandar', 'servicios:despachar')
  emergenciaAtendida(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.emergenciaAtendida(id, contextoDe(user, req));
  }

  @Post(':id/comunicacion')
  @RequirePermission('servicios:operar')
  comunicacion(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: ComunicacionDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.comunicacion(id, dto, contextoDe(user, req));
  }
```

En `incidentes.module.ts` agregá `AccionesService` a `providers` (con su import).

- [ ] **Paso 6: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -6 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -10
```

Resultado esperado: PASS (tres suites de incidentes) y `tsc` sin errores. Si Nest no resuelve
`VictimasService` o `FlotaService` al arrancar, verificá que `CampoModule` y `FlotaModule` los exporten
(tareas 5 y 6).

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/incidentes
git commit -m "Incidentes: despacho rápido, pasos del móvil, comando, fases, resultado, situación, pedidos, víctimas, emergencia y comunicaciones

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 9: Informe automático y cierre mínimo

**Archivos:**

- Crear: `backend/src/modules/incidentes/cierre.service.ts`
- Modificar: `backend/src/modules/incidentes/incidentes.controller.ts`, `incidentes.module.ts`
- Prueba: `backend/src/modules/incidentes/cierre.spec.ts`

**Interfaces:**

- Consume: `ExpedienteService.obtener/cronologia`, `MotorFases`, `CronologiaService`, `TripulacionService.copiarAlDespacho`, `validarCierre`, `cerrarLlamadosDelIncidente`, `marcarFin`, `distanciaMetros` (`backend/src/modules/cartografia/geo.util.ts`), `Cuartel` y `CierreDto`.
- Produce:
  - `CierreService.informe(servicioId)`, que devuelve el expediente más estos campos: `condicionesRegistradas: string[]`, `tiempos: { recepcion, primerDespacho, primeraSalida, primeraLlegada, controlado, disponible, cierre }`, `duraciones: { despachoMin, salidaMin, viajeMin, respuestaMin, controlMin, totalMin }` (cada una `number | null`), `distanciaCuartelM: number | null`, `cronologia`, y `cierre: { huboVictimas, huboDanos } | null`.
  - `CierreService.cerrar(servicioId, dto, ctx)`, que devuelve `{ servicioId, fase: 'CERRADO', resultado }`.
  - `GET /incidentes/:id/informe` (`servicios:ver`) y `POST /incidentes/:id/cierre` (`servicios:finalizar`).

- [ ] **Paso 1: Escribir las pruebas**

Crear `backend/src/modules/incidentes/cierre.spec.ts`:

```ts
import { ConflictException } from '@nestjs/common';
import { DataSource } from 'typeorm';
import {
  Bombero, CondicionSituacion, Cuartel, Despacho, IncidenteEvento, Llamado, Parametro, PersonalServicio, Servicio, TipoServicio, Vehiculo,
} from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { TripulacionService } from '../flota/tripulacion.service';
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import { MotorFases } from '../incidente-nucleo/motor-fases.service';
import { CierreService } from './cierre.service';
import type { ContextoIncidente } from './contexto';
import { ExpedienteService } from './expediente.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);
const h = (hhmm: string) => new Date(`2026-10-07T${hhmm}:00Z`);

describe('CierreService', () => {
  let base: BaseFalsa;
  let audit: { registrar: jest.Mock };
  let cierre: CierreService;
  const ctx: ContextoIncidente = { usuarioId: 'u1', username: 'jefe', permisos: ['servicios:finalizar'], origen: 'WEB' };
  const servicio = () => base.tabla('Servicio')[0] as unknown as Servicio;

  beforeEach(async () => {
    base = new BaseFalsa();
    audit = { registrar: jest.fn().mockResolvedValue(undefined) };
    cierre = new CierreService(
      base as unknown as DataSource, audit as never, new CronologiaService(), new MotorFases(),
      new TripulacionService(base as unknown as DataSource, audit as never), new ExpedienteService(base as unknown as DataSource),
    );
    await sembrar(base, TipoServicio, { id: 't1', codigo: 'INC', nombre: 'Incendio estructural', activo: true, prioridad: 0 });
    await sembrar(base, Servicio, {
      id: 's1', tipoServicioId: 't1', numeroServicio: 'CS-2026-00157', estado: 'EN_CURSO', faseOperativa: 'DISPONIBLE',
      resultado: null, direccion: 'Calle 1', fechaHoraAviso: h('14:31'), fechaHoraFin: null, informe: null,
      coordenadasLat: '-25.30000000', coordenadasLon: '-57.60000000', gravedad: 'GRAVE',
    });
    await sembrar(base, Cuartel, { id: 'q1', nombre: 'Central', estado: 'ACTIVO', latitud: '-25.31000000', longitud: '-57.60000000' });
    await sembrar(base, Vehiculo, { id: 'V1', numeroInterno: '1', estado: 'OPERATIVO', estadoOperativo: 'EN_CUARTEL' });
    await sembrar(base, Despacho, { id: 'd1', servicioId: 's1', vehiculoId: 'V1', estado: 'CERRADO', horaDespacho: h('14:33'), horaSalida: h('14:34'), horaLlegada: h('14:41'), horaFin: h('15:48'), horaRegreso: h('16:34') });
    await sembrar(base, Bombero, { id: 'B1', nombre: 'Ana', apellido: 'Gómez', numeroBombero: 'BC-01', estado: 'ACTIVO' });
    await sembrar(base, Bombero, { id: 'B2', nombre: 'Luis', apellido: 'Ríos', numeroBombero: 'BC-12', estado: 'ACTIVO' });
    await sembrar(base, PersonalServicio, { id: 'p1', servicioId: 's1', bomberoId: 'B1', rol: 'Conductor', despachoId: 'd1', vehiculoId: 'V1', horasServicio: 0 });
    await sembrar(base, Parametro, { id: 'f1', tipo: 'FUNCION_INCIDENTE', codigo: 'CONDUCTOR', nombre: 'Conductor', orden: 30, estado: 'ACTIVO' });
    await sembrar(base, Parametro, { id: 'f2', tipo: 'FUNCION_INCIDENTE', codigo: 'BOMBERO', nombre: 'Bombero', orden: 40, estado: 'ACTIVO' });
    await sembrar(base, Llamado, { id: 'l1', servicioId: 's1', estado: 'EN_ATENCION', recibidoEn: h('14:31'), medio: 'Teléfono', llamanteNombre: 'Vecina', llamanteTelefono: '0981' });
    await sembrar(base, CondicionSituacion, { id: 'c1', codigo: 'VICTIMA_ATRAPADA', nombre: 'Víctima atrapada', grupo: 'SITUACION', critica: true, grupoExcluyente: null, orden: 60, activo: true });
    for (const e of [
      { id: '1', tipo: 'SERVICIO_RECIBIDO', titulo: 'Servicio recibido', ocurridoEn: h('14:31') },
      { id: '2', tipo: 'SITUACION_MARCADA', titulo: 'Víctima atrapada', ocurridoEn: h('14:47'), datos: JSON.stringify({ codigo: 'VICTIMA_ATRAPADA' }) },
      { id: '3', tipo: 'FASE_CAMBIADA', titulo: 'Incidente controlado', ocurridoEn: h('15:18'), faseNueva: 'CONTROLADO' },
      { id: '4', tipo: 'MOVIL_DISPONIBLE', titulo: 'Móvil 1 disponible', ocurridoEn: h('16:34'), faseNueva: 'DISPONIBLE' },
    ]) await sembrar(base, IncidenteEvento, { servicioId: 's1', origen: 'WEB', critico: false, datos: null, faseNueva: null, ...e });
  });

  it('no se cierra con un móvil todavía afuera', async () => {
    (base.tabla('Despacho')[0] as Record<string, unknown>).estado = 'REGRESANDO';
    await expect(cierre.cerrar('s1', { resultado: 'CONTROLADO', huboVictimas: true, huboDanos: true }, ctx)).rejects.toThrow(/móvil/);
    await expect(cierre.cerrar('s1', { resultado: 'CONTROLADO', huboVictimas: true, huboDanos: true }, ctx)).rejects.toThrow(ConflictException);
  });

  it('cierra: fase, resultado, observaciones, llamados, horas por persona y evento', async () => {
    await cierre.cerrar('s1', { resultado: 'CONTROLADO', huboVictimas: true, huboDanos: false, observaciones: 'Ataque ofensivo y búsqueda primaria.' }, ctx);
    expect(servicio()).toMatchObject({ faseOperativa: 'CERRADO', estado: 'FINALIZADO', resultado: 'CONTROLADO', informe: 'Ataque ofensivo y búsqueda primaria.' });
    expect(servicio().fechaHoraFin).toBeInstanceOf(Date);
    expect(base.tabla('Llamado')[0]).toMatchObject({ estado: 'CERRADO' });
    expect((base.tabla('PersonalServicio')[0] as Record<string, unknown>).horasServicio).toBe(2); // 14:34 → 16:34
    expect((base.tabla('PersonalServicio')[0] as Record<string, unknown>).minutosServicio).toBe(120);
    const ev = base.tabla('IncidenteEvento').at(-1)!;
    expect(ev).toMatchObject({ tipo: 'INCIDENTE_CERRADO', titulo: 'Incidente cerrado: Controlado', faseNueva: 'CERRADO' });
    expect(JSON.parse(ev.datos as string)).toEqual({ resultado: 'CONTROLADO', huboVictimas: true, huboDanos: false });
    await expect(cierre.cerrar('s1', { resultado: 'CONTROLADO', huboVictimas: true, huboDanos: false }, ctx)).rejects.toThrow(/cerrado/);
  });

  it('la tripulación se puede corregir en el cierre', async () => {
    await cierre.cerrar('s1', { resultado: 'RESUELTO', huboVictimas: false, huboDanos: false, tripulacion: [
      { despachoId: 'd1', integrantes: [{ bomberoId: 'B2', funcion: 'BOMBERO' }] },
    ] }, ctx);
    expect(base.tabla('PersonalServicio').map((p) => [p.bomberoId, p.rol, p.origen])).toEqual([['B2', 'Bombero', 'AJUSTE']]);
  });

  it('cerrar como cancelado deja el estado heredado CANCELADO', async () => {
    await cierre.cerrar('s1', { resultado: 'CANCELADO', huboVictimas: false, huboDanos: false }, ctx);
    expect(servicio()).toMatchObject({ estado: 'CANCELADO', resultado: 'CANCELADO' });
  });

  it('el informe se arma solo con tiempos, distancia, condiciones y cronología', async () => {
    const i = await cierre.informe('s1');
    expect(i.incidente.numeroServicio).toBe('CS-2026-00157');
    expect(i.tiempos).toMatchObject({ recepcion: h('14:31'), primerDespacho: h('14:33'), primeraSalida: h('14:34'), primeraLlegada: h('14:41'), controlado: h('15:18'), disponible: h('16:34'), cierre: null });
    expect(i.duraciones).toMatchObject({ despachoMin: 2, salidaMin: 1, viajeMin: 7, respuestaMin: 10, controlMin: 37, totalMin: 123 });
    expect(i.distanciaCuartelM).toBeGreaterThan(1000);
    expect(i.distanciaCuartelM).toBeLessThan(1200);
    expect(i.condicionesRegistradas).toEqual(['Víctima atrapada']);
    expect(i.cronologia.map((e) => e.id)).toEqual(['1', '2', '3', '4']);
    expect(i.llamados[0]).toMatchObject({ solicitante: 'Vecina' });
    expect(i.cierre).toBeNull();
  });
});
```


- [ ] **Paso 2: Correr la prueba para ver que falla**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes/cierre.spec.ts 2>&1 | tail -5
```

Resultado esperado: FAIL con `Cannot find module './cierre.service'`.

- [ ] **Paso 3: Implementar**

Crear `backend/src/modules/incidentes/cierre.service.ts`:

```ts
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { CondicionSituacion, Cuartel, Despacho, PersonalServicio, Servicio } from '../../shared/entities';
import { distanciaMetros } from '../cartografia/geo.util';
import { TripulacionService } from '../flota/tripulacion.service';
import { CronologiaService } from '../incidente-nucleo/cronologia.service';
import { horasDeServicio, NOMBRE_RESULTADO, validarCierre } from '../incidente-nucleo/incidente.logica';
import { MotorFases } from '../incidente-nucleo/motor-fases.service';
import { AuditoriaService } from '../seguridad/auditoria.service';
import { cerrarLlamadosDelIncidente, marcarFin } from './cierre-comun';
import type { ContextoIncidente } from './contexto';
import { CierreDto } from './dto/incidentes.dto';
import { ExpedienteService } from './expediente.service';

type Fecha = Date | string | null | undefined;
const ms = (v: Fecha) => (v ? new Date(v).getTime() : null);
const minutos = (a: Fecha, b: Fecha) => {
  const x = ms(a);
  const y = ms(b);
  return x !== null && y !== null ? Math.round((y - x) / 60_000) : null;
};
const primera = (fechas: Fecha[]): Date | null => {
  const validas = fechas.map(ms).filter((x): x is number => x !== null);
  return validas.length ? new Date(Math.min(...validas)) : null;
};

/**
 * Informe automatico (se arma con lo registrado: nunca se vuelve a pedir un dato que ya existe)
 * y cierre minimo: como termino, victimas si/no, danos si/no, observaciones y revision de tripulacion.
 */
@Injectable()
export class CierreService {
  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly auditoria: AuditoriaService,
    private readonly cronologia: CronologiaService,
    private readonly motor: MotorFases,
    private readonly tripulacion: TripulacionService,
    private readonly expediente: ExpedienteService,
  ) {}

  async informe(servicioId: string) {
    const m = this.dataSource.manager;
    const exp = await this.expediente.obtener(servicioId, null);
    const eventos = await this.expediente.cronologia(servicioId);
    const catalogo = await m.getRepository(CondicionSituacion).find();
    const cuarteles = await m.getRepository(Cuartel).find({ where: { estado: 'ACTIVO' } });
    const cuartel = cuarteles.find((c) => c.latitud !== null && c.longitud !== null) ?? null;
    const { latitud, longitud } = exp.incidente;
    const distanciaCuartelM =
      cuartel && latitud !== null && longitud !== null
        ? Math.round(distanciaMetros(Number(cuartel.latitud), Number(cuartel.longitud), latitud, longitud))
        : null;

    const cierreEvento = eventos.find((e) => e.tipo === 'INCIDENTE_CERRADO') ?? null;
    const tiempos = {
      recepcion: exp.incidente.recibidoEn ? new Date(exp.incidente.recibidoEn) : null,
      primerDespacho: primera(exp.despachos.map((d) => d.horaDespacho)),
      primeraSalida: primera(exp.despachos.map((d) => d.horaSalida)),
      primeraLlegada: primera(exp.despachos.map((d) => d.horaLlegada)),
      controlado: primera(eventos.filter((e) => e.faseNueva === 'CONTROLADO').map((e) => e.ocurridoEn)),
      disponible: primera(eventos.filter((e) => e.faseNueva === 'DISPONIBLE').map((e) => e.ocurridoEn)),
      cierre: cierreEvento ? new Date(cierreEvento.ocurridoEn) : null,
    };
    const codigos = [...new Set(eventos.filter((e) => e.tipo === 'SITUACION_MARCADA').map((e) => String(e.datos?.codigo ?? '')))];
    const nombre = new Map(catalogo.map((c) => [c.codigo, c.nombre]));
    return {
      ...exp,
      condicionesRegistradas: codigos.filter(Boolean).map((c) => nombre.get(c) ?? c),
      tiempos,
      duraciones: {
        despachoMin: minutos(tiempos.recepcion, tiempos.primerDespacho),
        salidaMin: minutos(tiempos.primerDespacho, tiempos.primeraSalida),
        viajeMin: minutos(tiempos.primeraSalida, tiempos.primeraLlegada),
        respuestaMin: minutos(tiempos.recepcion, tiempos.primeraLlegada),
        controlMin: minutos(tiempos.primeraLlegada, tiempos.controlado),
        totalMin: minutos(tiempos.recepcion, tiempos.cierre ?? tiempos.disponible),
      },
      distanciaCuartelM,
      cronologia: eventos,
      cierre: cierreEvento?.datos
        ? { huboVictimas: Boolean(cierreEvento.datos.huboVictimas), huboDanos: Boolean(cierreEvento.datos.huboDanos) }
        : null,
    };
  }

  async cerrar(servicioId: string, dto: CierreDto, ctx: ContextoIncidente) {
    const antes = await this.dataSource.transaction(async (m) => {
      const s = await this.motor.bloquear(m, servicioId);
      const activos = await this.motor.despachosActivos(m, servicioId);
      validarCierre(s.faseOperativa, activos.length);

      for (const ajuste of dto.tripulacion ?? []) {
        const d = await m.getRepository(Despacho).findOne({ where: { id: ajuste.despachoId } });
        if (!d || d.servicioId !== servicioId) throw new BadRequestException('Uno de los móviles no pertenece a este incidente.');
        await this.tripulacion.copiarAlDespacho(m, {
          servicioId, despachoId: d.id, vehiculoId: d.vehiculoId, integrantes: ajuste.integrantes, origen: 'AJUSTE', reemplazar: true,
        });
      }

      const ahora = new Date();
      // Horas de cada persona: desde la salida (o la asignacion) de su movil hasta su regreso.
      const despachos = await m.getRepository(Despacho).find({ where: { servicioId } });
      const personal = await m.getRepository(PersonalServicio).find({ where: { servicioId } });
      for (const p of personal) {
        const d = despachos.find((x) => x.id === p.despachoId);
        if (!d) continue;
        const desde = ms(d.horaSalida ?? d.horaDespacho);
        const hasta = ms(d.horaRegreso ?? d.horaFin) ?? ahora.getTime();
        if (desde === null) continue;
        const minutosServicio = Math.max(0, Math.round((hasta - desde) / 60_000));
        await m.getRepository(PersonalServicio).update({ id: p.id }, { minutosServicio, horasServicio: horasDeServicio(minutosServicio) });
      }

      const observaciones = dto.observaciones?.trim();
      if (observaciones) await m.getRepository(Servicio).update({ id: s.id }, { informe: observaciones });
      await marcarFin(m, s, ahora);
      const fase = await this.motor.fijar(m, s, 'CERRADO', ahora, dto.resultado);
      await cerrarLlamadosDelIncidente(m, servicioId, ctx.usuarioId, `Incidente cerrado: ${NOMBRE_RESULTADO[dto.resultado]}`);
      await this.cronologia.registrar(m, {
        servicioId, tipo: 'INCIDENTE_CERRADO', titulo: `Incidente cerrado: ${NOMBRE_RESULTADO[dto.resultado]}`, ocurridoEn: ahora,
        usuarioId: ctx.usuarioId, fase, datos: { resultado: dto.resultado, huboVictimas: dto.huboVictimas, huboDanos: dto.huboDanos },
        origen: ctx.origen, dispositivo: ctx.dispositivo,
      });
      return { fase: fase.antes };
    });
    await this.auditoria.registrar({
      usuarioId: ctx.usuarioId, accion: 'CERRAR_INCIDENTE', recurso: 'servicios.incidente', recursoId: servicioId,
      datosAntes: antes, datosDespues: { fase: 'CERRADO', resultado: dto.resultado, huboVictimas: dto.huboVictimas, huboDanos: dto.huboDanos },
      ip: ctx.ip ?? null, userAgent: ctx.userAgent ?? null,
    });
    return { servicioId, fase: 'CERRADO' as const, resultado: dto.resultado };
  }
}
```

En el controlador: importá `CierreDto` y `CierreService`, agregá `private readonly cierre: CierreService,`
al constructor y al final de la clase:

```ts
  @Get(':id/informe')
  @RequirePermission('servicios:ver')
  informe(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.cierre.informe(id);
  }

  @Post(':id/cierre')
  @RequirePermission('servicios:finalizar')
  cerrar(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: CierreDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.cierre.cerrar(id, dto, contextoDe(user, req));
  }
```

En `incidentes.module.ts` agregá `CierreService` a `providers`.

**Ojo con `marcarFin`:** recibe `s` (leído al bloquear). Como `fechaHoraFin` de `s` sigue en `null`, la
escribe una sola vez. No reordenes `marcarFin` después de `motor.fijar`.

- [ ] **Paso 4: Correr las pruebas y la suite completa**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -6 && npm test 2>&1 | tail -6 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -5
```

Resultado esperado: todo en verde y `tsc` limpio. La distancia esperada en la prueba (0,01° de latitud)
es de unos 1.110 m.

- [ ] **Paso 5: Probar el backend vivo**

Levantá el backend (`cd backend && npm run start:dev`) y verificá con `curl` o Swagger
(`http://localhost:3001/api/docs`), con sesión de `admin`:
`GET /api/v1/incidentes/catalogos` debe devolver 22 condiciones, 12 tipos de recurso y 10 funciones.
Si el arranque falla por la inyección de dependencias, el mensaje de Nest dice qué proveedor falta:
agregalo al `exports` del módulo dueño.

- [ ] **Paso 6: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/incidentes
git commit -m "Incidentes: informe automático con tiempos y distancia, y cierre mínimo con revisión de tripulación

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 17: Avisos inmediatos por el canal en tiempo real (backend)

Por qué: con la consulta cada 5 s, una EMERGENCIA puede tardar hasta 5 s en verse y solo suena con la
pantalla abierta. El backend ya tiene un bus SSE (`DespachoTiempoReal`, `GET /despacho/stream`), así que
los avisos críticos viajan por ahí. La consulta periódica queda de respaldo.

**Archivos:**

- Modificar: `backend/src/modules/despacho/despacho-tiempo-real.service.ts`, `backend/src/modules/despacho/despacho.controller.ts`
- Crear: `backend/src/modules/incidentes/avisos.service.ts`
- Modificar: `backend/src/modules/incidentes/acciones.service.ts`, `recepcion.service.ts`, `incidentes.module.ts`
- Prueba: crear `backend/src/modules/incidentes/avisos.spec.ts`; modificar `acciones.spec.ts` y `recepcion.spec.ts`

**Interfaces:**

- Consume: `DespachoTiempoReal` (exportado por `DespachoModule`), `AccionesService` (tarea 8) y `RecepcionService` (tarea 7).
- Produce:
  - `EventoDespacho` con `tipo: … | 'incidente'` y el campo opcional `permiso?: string`.
  - `flujoPara(usuarioId, puedeVerSeguimiento, permisos = [], soloIncidentes = false)`.
  - `GET /despacho/stream?solo=incidentes`: solo avisos de incidentes y **sin contar como presencia** para el despacho.
  - `AvisosIncidente.avisar(servicioId, alerta: TipoAviso, detalle?)` y `destinatarios(servicioId)`.
  - `TipoAviso = 'NUEVO' | 'EMERGENCIA' | 'EMERGENCIA_ATENDIDA' | 'CONDICION_CRITICA' | 'PEDIDO_URGENTE' | 'PERSONAL_FALTANTE'`.
  - El dato que recibe la pantalla: `{ tipo: 'incidente', servicioId, datos: { alerta, numeroServicio, texto } }`.

- [ ] **Paso 1: Escribir las pruebas**

Crear `backend/src/modules/incidentes/avisos.spec.ts`:

```ts
import { firstValueFrom } from 'rxjs';
import { DataSource } from 'typeorm';
import { PersonalServicio, Servicio, ServicioParticipante, Usuario } from '../../shared/entities';
import { BaseFalsa } from '../../shared/testing/base-falsa';
import { DespachoTiempoReal } from '../despacho/despacho-tiempo-real.service';
import { AvisosIncidente } from './avisos.service';

const sembrar = (base: BaseFalsa, clase: new () => object, datos: Record<string, unknown>) =>
  base.getRepository(clase as never).save(Object.assign(new clase(), datos) as never);

describe('AvisosIncidente', () => {
  let base: BaseFalsa;
  let tiempoReal: DespachoTiempoReal;
  let avisos: AvisosIncidente;

  beforeEach(async () => {
    base = new BaseFalsa();
    tiempoReal = new DespachoTiempoReal();
    avisos = new AvisosIncidente(base as unknown as DataSource, tiempoReal);
    await sembrar(base, Servicio, { id: 's1', numeroServicio: 'CS-2026-00157' });
    await sembrar(base, PersonalServicio, { id: 'p1', servicioId: 's1', bomberoId: 'B1' });
    await sembrar(base, Usuario, { id: 'u1', username: 'ana', bomberoId: 'B1' });
    await sembrar(base, ServicioParticipante, { id: 'sp1', servicioId: 's1', usuarioId: 'u7' });
  });

  it('los destinatarios son la tripulación (por su usuario) y los participantes', async () => {
    expect((await avisos.destinatarios('s1')).sort()).toEqual(['u1', 'u7']);
  });

  it('la central lo recibe por permiso, la tripulación por estar en el incidente, y nadie más', async () => {
    const central = firstValueFrom(tiempoReal.flujoPara('uc', false, ['servicios:despachar'], true));
    const tripulante = firstValueFrom(tiempoReal.flujoPara('u1', false, [], true));
    let ajeno = false;
    const sub = tiempoReal.flujoPara('ux', false, ['servicios:operar'], true).subscribe(() => { ajeno = true; });
    await avisos.avisar('s1', 'EMERGENCIA');
    expect((await central).datos).toMatchObject({ alerta: 'EMERGENCIA', numeroServicio: 'CS-2026-00157', texto: 'EMERGENCIA — CS-2026-00157' });
    expect((await tripulante).servicioId).toBe('s1');
    expect(ajeno).toBe(false);
    sub.unsubscribe();
  });

  it('con soloIncidentes no pasan los demás eventos del despacho', async () => {
    let recibidos = 0;
    const sub = tiempoReal.flujoPara('u1', true, [], true).subscribe(() => { recibidos += 1; });
    tiempoReal.emitir({ tipo: 'solicitud_nueva', para: ['u1'], seguimiento: true });
    await avisos.avisar('s1', 'PEDIDO_URGENTE', '1 × Ambulancia');
    expect(recibidos).toBe(1);
    sub.unsubscribe();
  });

  it('un aviso que falla no lanza error (la acción ya quedó guardada)', async () => {
    jest.spyOn(tiempoReal, 'emitir').mockImplementation(() => { throw new Error('bus caído'); });
    await expect(avisos.avisar('s1', 'EMERGENCIA')).resolves.toBeUndefined();
  });
});
```

En `backend/src/modules/incidentes/acciones.spec.ts`:

- Agregá `let avisos: { avisar: jest.Mock };` junto a las demás variables del `describe`.
- Al principio del `beforeEach`, agregá `avisos = { avisar: jest.fn().mockResolvedValue(undefined) };`.
- Pasá `avisos as never` como **último** argumento de `new AccionesService(…)`.
- Agregá este caso:

```ts
  it('EMERGENCIA, condición crítica y pedido urgente avisan al instante; repetir no vuelve a avisar', async () => {
    await acciones.emergencia('s1', {}, bombero);
    expect(avisos.avisar).toHaveBeenLastCalledWith('s1', 'EMERGENCIA');
    await acciones.situacion('s1', { condicion: 'MATERIAL_PELIGROSO', activa: true }, bombero);
    await acciones.situacion('s1', { condicion: 'MATERIAL_PELIGROSO', activa: true }, bombero);
    expect(avisos.avisar.mock.calls.filter((c) => c[1] === 'CONDICION_CRITICA')).toEqual([['s1', 'CONDICION_CRITICA', 'Material peligroso']]);
    const dto = { tipoRecursoId: 'r1', prioridad: 'URGENTE' as const, claveIdempotencia: 'pedido-avisos-1' };
    await acciones.solicitarRecurso('s1', dto, bombero);
    await acciones.solicitarRecurso('s1', dto, bombero);
    expect(avisos.avisar.mock.calls.filter((c) => c[1] === 'PEDIDO_URGENTE')).toEqual([['s1', 'PEDIDO_URGENTE', '1 × Ambulancia']]);
    await acciones.emergenciaAtendida('s1', comando);
    expect(avisos.avisar).toHaveBeenLastCalledWith('s1', 'EMERGENCIA_ATENDIDA');
  });
```

En `backend/src/modules/incidentes/recepcion.spec.ts`:

- Declará `let avisos: { avisar: jest.Mock };`, inicializalo en el `beforeEach` igual que arriba y pasá `avisos as never` como último argumento de `new RecepcionService(…)`.
- En el caso "crea el incidente con tipo y dirección…", agregá al final:
  `expect(avisos.avisar).toHaveBeenCalledWith(r.servicioId, 'NUEVO', 'Incendio estructural');`

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -8
```

Resultado esperado: FAIL con `Cannot find module './avisos.service'`.

- [ ] **Paso 3: El bus y el stream**

En `backend/src/modules/despacho/despacho-tiempo-real.service.ts`:

1. En el tipo `tipo` de `EventoDespacho`, agregá `| 'incidente'` al final de la unión.
2. Dentro de `EventoDespacho`, después de `seguimiento?: boolean;`, agregá:

```ts
  /** Ademas, quien tenga este permiso (avisos del Centro de Operaciones a la central y al comando). */
  permiso?: string;
```

3. Reemplazá el método `flujoPara` por:

```ts
  /** Flujo de eventos que le corresponden a una persona. Con `soloIncidentes`, solo los avisos de incidentes. */
  flujoPara(usuarioId: string, puedeVerSeguimiento: boolean, permisos: readonly string[] = [], soloIncidentes = false): Observable<EventoDespacho> {
    return this.bus$.pipe(
      filter(
        (e) =>
          (!soloIncidentes || e.tipo === 'incidente') &&
          (e.para.includes(usuarioId) || (!!e.seguimiento && puedeVerSeguimiento) || (!!e.permiso && permisos.includes(e.permiso))),
      ),
    );
  }
```

En `backend/src/modules/despacho/despacho.controller.ts`, reemplazá el método `stream` completo (desde
el comentario `/** Mantener este stream abierto…` hasta su llave de cierre) por:

```ts
  /**
   * Mantener este stream abierto es lo que cuenta como "en linea" para recibir llamados.
   * Con ?solo=incidentes (pantallas web del Centro de Operaciones y del Modo Incidente) solo llegan
   * los avisos de incidentes y NO cuenta como presencia: abrir esa pantalla no hace que el despacho
   * crea que la persona recibio una solicitud.
   */
  @Sse('stream')
  @RequirePermission('despacho:responder')
  stream(@CurrentUser() user: AuthenticatedUser, @Query('solo') solo?: string): Observable<{ data: unknown }> {
    const soloIncidentes = solo === 'incidentes';
    return new Observable((suscriptor) => {
      if (!soloIncidentes) this.tiempoReal.conectar(user.id);
      const sub = this.tiempoReal
        .flujoPara(user.id, user.permisos.includes('despacho:seguimiento'), user.permisos, soloIncidentes)
        // A la pantalla no le hace falta la lista de destinatarios de un aviso de incidente.
        .subscribe((e) => suscriptor.next({ data: e.tipo === 'incidente' ? { tipo: e.tipo, servicioId: e.servicioId, datos: e.datos } : e }));
      const reloj = setInterval(() => {
        if (!soloIncidentes) this.tiempoReal.latido(user.id);
        suscriptor.next({ data: { tipo: 'latido', hora: new Date().toISOString() } });
      }, LATIDO_SSE_MS);
      return () => {
        clearInterval(reloj);
        sub.unsubscribe();
        if (!soloIncidentes) this.tiempoReal.desconectar(user.id);
      };
    });
  }
```

(`Query` ya está importado en ese controlador; si no, sumalo al import de `@nestjs/common`.)

- [ ] **Paso 4: Servicio de avisos**

Crear `backend/src/modules/incidentes/avisos.service.ts`:

```ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, In } from 'typeorm';
import { PersonalServicio, Servicio, ServicioParticipante, Usuario } from '../../shared/entities';
import { DespachoTiempoReal } from '../despacho/despacho-tiempo-real.service';

export type TipoAviso = 'NUEVO' | 'EMERGENCIA' | 'EMERGENCIA_ATENDIDA' | 'CONDICION_CRITICA' | 'PEDIDO_URGENTE' | 'PERSONAL_FALTANTE';

const ETIQUETA: Record<TipoAviso, string> = {
  NUEVO: 'Nuevo servicio',
  EMERGENCIA: 'EMERGENCIA',
  EMERGENCIA_ATENDIDA: 'Emergencia atendida',
  CONDICION_CRITICA: 'Condición crítica',
  PEDIDO_URGENTE: 'Pedido urgente',
  PERSONAL_FALTANTE: 'Recuento con personal sin confirmar',
};

/** Quien coordina recibe todos los avisos: la central y el comando. */
export const PERMISO_AVISOS = 'servicios:despachar';

/**
 * Avisos inmediatos de un incidente por el canal en tiempo real del despacho. Llegan a la central
 * (permiso servicios:despachar) y a quien trabaja en el incidente (su tripulacion y participantes).
 * Se emiten DESPUES del commit y un aviso que falla nunca deshace la accion: la consulta periodica de
 * las pantallas lo muestra igual, como mucho 5 s despues. Nada confidencial viaja por el stream.
 */
@Injectable()
export class AvisosIncidente {
  private readonly log = new Logger(AvisosIncidente.name);

  constructor(
    @InjectDataSource() private readonly dataSource: DataSource,
    private readonly tiempoReal: DespachoTiempoReal,
  ) {}

  async destinatarios(servicioId: string): Promise<string[]> {
    const m = this.dataSource.manager;
    const [personal, participantes] = await Promise.all([
      m.getRepository(PersonalServicio).find({ where: { servicioId } }),
      m.getRepository(ServicioParticipante).find({ where: { servicioId } }),
    ]);
    const bomberos = [...new Set(personal.map((p) => p.bomberoId))];
    const usuarios = bomberos.length ? await m.getRepository(Usuario).find({ where: { bomberoId: In(bomberos) } }) : [];
    return [...new Set([...usuarios.map((u) => u.id), ...participantes.map((p) => p.usuarioId)])];
  }

  async avisar(servicioId: string, alerta: TipoAviso, detalle?: string): Promise<void> {
    try {
      const s = await this.dataSource.getRepository(Servicio).findOne({ where: { id: servicioId } });
      const numero = s?.numeroServicio ?? '';
      this.tiempoReal.emitir({
        tipo: 'incidente',
        servicioId,
        para: await this.destinatarios(servicioId),
        permiso: PERMISO_AVISOS,
        datos: { alerta, numeroServicio: numero, texto: `${ETIQUETA[alerta]}${detalle ? `: ${detalle}` : ''} — ${numero}` },
      });
    } catch (error) {
      this.log.warn(`No se pudo emitir el aviso ${alerta} de ${servicioId}: ${(error as Error).message}`);
    }
  }
}
```

- [ ] **Paso 5: Emitir desde las acciones y la recepción**

En `backend/src/modules/incidentes/acciones.service.ts`:

- Import: `import { AvisosIncidente } from './avisos.service';`.
- Constructor: agregá `private readonly avisos: AvisosIncidente,` como **último** parámetro.
- En `emergencia`, después del `await this.auditar(ctx, 'EMERGENCIA', …);`, agregá `await this.avisos.avisar(servicioId, 'EMERGENCIA');`.
- En `emergenciaAtendida`, después de su `await this.auditar(…);`, agregá `await this.avisos.avisar(servicioId, 'EMERGENCIA_ATENDIDA');`.
- En `situacion`, reemplazá `return this.dataSource.transaction(async (m) => {` por `const r = await this.dataSource.transaction(async (m) => {`, y el final del método:

```ts
      return { repetido: false, activas: [...condicionesActivas([...eventos, { tipo, datos: JSON.stringify(datos) }])] };
    });
  }
```

  por:

```ts
      return { repetido: false, activas: [...condicionesActivas([...eventos, { tipo, datos: JSON.stringify(datos) }])] };
    });
    if (!r.repetido && dto.activa && condicion.critica) await this.avisos.avisar(servicioId, 'CONDICION_CRITICA', condicion.nombre);
    return r;
  }
```

- En `solicitarRecurso`, reemplazá `return this.dataSource.transaction(async (m) => {` por `const r = await this.dataSource.transaction(async (m) => {` y `if (previa) return previa;` por `if (previa) return { sol: previa, nuevo: false };`. El final del método:

```ts
        claveIdempotencia: dto.claveIdempotencia,
      });
      return sol;
    });
  }
```

  se reemplaza por:

```ts
        claveIdempotencia: dto.claveIdempotencia,
      });
      return { sol, nuevo: true };
    });
    if (r.nuevo && dto.prioridad === 'URGENTE') await this.avisos.avisar(servicioId, 'PEDIDO_URGENTE', `${r.sol.cantidad} × ${tipo.nombre}`);
    return r.sol;
  }
```

En `backend/src/modules/incidentes/recepcion.service.ts`:

- Agregá `private readonly avisos: AvisosIncidente,` como último parámetro del constructor, con su import.
- En `recibir`, justo antes de `return { servicioId: r.servicio.id, numeroServicio: …, repetido: false };`, agregá
  `await this.avisos.avisar(r.servicio.id, 'NUEVO', tipo.nombre);`.

En `backend/src/modules/incidentes/incidentes.module.ts`:

- Agregá `DespachoModule` a `imports` (con `import { DespachoModule } from '../despacho/despacho.module';`).
- Agregá `AvisosIncidente` a `providers`.
- `DespachoModule` ya exporta `DespachoTiempoReal` y no importa `incidentes`, así que no se forma un ciclo.

- [ ] **Paso 6: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes src/modules/despacho 2>&1 | tail -8 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -5
```

Resultado esperado: todo en verde. Las pruebas existentes de despacho siguen pasando: `flujoPara` con dos
argumentos mantiene su comportamiento.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/despacho backend/src/modules/incidentes
git commit -m "Incidentes: avisos inmediatos por SSE (emergencia, condición crítica, pedido urgente) sin contar como presencia

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 18: Control de personal en zona (backend)

Por qué: lo primero que pregunta un comandante ante un derrumbe es quién está adentro. Cada persona del
incidente registra si **entra o sale de la zona**, y el comando hace un **recuento** (PAR) confirmándolas una
por una. Una persona en zona **nunca se libera sola**: si los móviles retornan con alguien adentro, la central
recibe una alerta, y el incidente no se cierra hasta registrar su salida.

**Archivos:**

- Modificar: `backend/src/modules/incidentes/dto/incidentes.dto.ts`, `acciones.service.ts`, `incidentes.controller.ts`, `expediente.service.ts`, `cierre.service.ts`
- Prueba: modificar `acciones.spec.ts`, `expediente.spec.ts`, `cierre.spec.ts`

**Interfaces:**

- Consume: las columnas `personal_servicio.en_zona` y `zona_desde` y los tipos `PERSONAL_ENTRA_ZONA`, `PERSONAL_SALE_ZONA` y `RECUENTO_PERSONAL` (tarea 1); `AvisosIncidente` (tarea 17).
- Produce:
  - Los DTO `ZonaDto { dentro }` y `RecuentoDto { presentes: string[]; faltantes: string[] }`, que extienden `AccionCampoDto`.
  - `AccionesService.zona(servicioId, bomberoId, dto, ctx)` y `recuento(servicioId, dto, ctx)`.
  - `POST /incidentes/:id/personal/:bomberoId/zona` (`servicios:operar`) y `POST /incidentes/:id/recuento` (`servicios:comandar`).
  - En el expediente, cada tripulante suma `funcion`, `enZona` y `zonaDesde`, y el expediente suma `personalEnZona[]` y `ultimoRecuento`.
  - En el tablero, `personalEnZona` por incidente y las alertas `PERSONAL_FALTANTE` (crítica) y `PERSONAL_EN_ZONA` (alta).
  - El cierre se rechaza con alguien en zona.

- [ ] **Paso 1: Escribir las pruebas**

En `backend/src/modules/incidentes/acciones.spec.ts`, sumá `PersonalServicio` al import de entidades y agregá:

```ts
  it('control de personal: entra, sale, y un recuento con faltantes es crítico y avisa', async () => {
    await sembrar(base, Bombero, { id: 'B2', nombre: 'Luis', apellido: 'Ríos', numeroBombero: 'BC-12', estado: 'ACTIVO' });
    await sembrar(base, PersonalServicio, { id: 'ps1', servicioId: 's1', bomberoId: 'B1', rol: 'Bombero', enZona: false });
    await sembrar(base, PersonalServicio, { id: 'ps2', servicioId: 's1', bomberoId: 'B2', rol: 'Bombero', enZona: false });
    await acciones.zona('s1', 'B1', { dentro: true }, bombero);
    await acciones.zona('s1', 'B2', { dentro: true }, bombero);
    expect((await acciones.zona('s1', 'B1', { dentro: true }, bombero)).repetido).toBe(true);
    await expect(acciones.recuento('s1', { presentes: ['B1'], faltantes: [] }, comando)).rejects.toThrow(/todas las personas/);
    await acciones.recuento('s1', { presentes: ['B1'], faltantes: ['B2'] }, comando);
    expect(base.tabla('IncidenteEvento').at(-1)).toMatchObject({ tipo: 'RECUENTO_PERSONAL', critico: true, titulo: 'Recuento: 1 sin confirmar (Luis Ríos (BC-12))' });
    expect(avisos.avisar).toHaveBeenLastCalledWith('s1', 'PERSONAL_FALTANTE', '1 persona(s)');
    await acciones.zona('s1', 'B2', { dentro: false }, bombero);
    expect(base.tabla('PersonalServicio').find((p) => p.bomberoId === 'B2')).toMatchObject({ enZona: false, zonaDesde: null });
    expect(base.tabla('IncidenteEvento').map((e) => e.tipo)).toEqual([
      'PERSONAL_ENTRA_ZONA', 'PERSONAL_ENTRA_ZONA', 'RECUENTO_PERSONAL', 'PERSONAL_SALE_ZONA',
    ]);
  });

  it('una persona que no figura en el incidente no se registra en zona', async () => {
    await expect(acciones.zona('s1', 'B9', { dentro: true }, bombero)).rejects.toThrow(NotFoundException);
  });

  it('quien se sumó por una solicitud entra al personal al registrarse en zona', async () => {
    await sembrar(base, Usuario, { id: 'u5', username: 'beto', bomberoId: 'B5' });
    await sembrar(base, Bombero, { id: 'B5', nombre: 'Beto', apellido: 'Paz', numeroBombero: 'BC-30', estado: 'ACTIVO' });
    await sembrar(base, ServicioParticipante, { id: 'sp5', servicioId: 's1', usuarioId: 'u5' });
    await acciones.zona('s1', 'B5', { dentro: true }, bombero);
    expect(base.tabla('PersonalServicio')).toEqual([expect.objectContaining({ bomberoId: 'B5', origen: 'SOLICITUD', enZona: true })]);
  });
```

(Sumá también `ServicioParticipante` al import de entidades de ese archivo.)

En `backend/src/modules/incidentes/expediente.spec.ts`, agregá al final del `describe`:

```ts
  it('alerta el recuento con faltantes y el personal en zona con el incidente en retorno', async () => {
    Object.assign(base.tabla('Servicio').find((s) => s.id === 's1')!, { faseOperativa: 'RETORNO' });
    Object.assign(base.tabla('PersonalServicio')[0], { enZona: true, zonaDesde: new Date('2026-10-07T14:50:00Z'), funcion: 'CONDUCTOR' });
    await sembrar(base, IncidenteEvento, ev('6', 's1', 'RECUENTO_PERSONAL', { presentes: [], faltantes: ['B1'] }));
    const t = await servicio.tablero(new Date('2026-10-07T16:00:00Z'));
    expect(t.incidentes.find((i) => i.id === 's1')!.personalEnZona).toBe(1);
    expect(t.alertas.map((a) => a.tipo)).toEqual(expect.arrayContaining(['PERSONAL_FALTANTE', 'PERSONAL_EN_ZONA']));
    const e = await servicio.obtener('s1', 'u1');
    expect(e.despachos[0].tripulacion[0]).toMatchObject({ funcion: 'CONDUCTOR', enZona: true });
    expect(e.personalEnZona).toEqual([expect.objectContaining({ bomberoId: 'B1', nombre: 'Ana Gómez (BC-01)' })]);
    expect(e.ultimoRecuento).toMatchObject({ presentes: 0, faltantes: ['Ana Gómez (BC-01)'] });
  });
```

En `backend/src/modules/incidentes/cierre.spec.ts`, agregá:

```ts
  it('no se cierra con personas registradas dentro de la zona', async () => {
    Object.assign(base.tabla('PersonalServicio')[0], { enZona: true });
    await expect(cierre.cerrar('s1', { resultado: 'CONTROLADO', huboVictimas: false, huboDanos: false }, ctx)).rejects.toThrow(/dentro de la zona \(Ana Gómez \(BC-01\)\)/);
  });
```

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -8
```

Resultado esperado: FAIL (`acciones.zona is not a function`, faltan campos del expediente y el cierre no rechaza).

- [ ] **Paso 3: DTO y acciones**

Al final de `backend/src/modules/incidentes/dto/incidentes.dto.ts` agregá:

```ts
export class ZonaDto extends AccionCampoDto {
  @IsBoolean() dentro!: boolean;
}

/** Recuento de personal (PAR): todas las personas en zona, cada una como presente o sin confirmar. */
export class RecuentoDto extends AccionCampoDto {
  @IsArray() @ArrayMaxSize(100) @IsUUID('all', { each: true }) presentes!: string[];
  @IsArray() @ArrayMaxSize(100) @IsUUID('all', { each: true }) faltantes!: string[];
}
```

En `backend/src/modules/incidentes/acciones.service.ts`:

- Imports:
  - Sumá `Bombero`, `PersonalServicio` y `ServicioParticipante` al import de entidades.
  - Cambiá `import { DataSource } from 'typeorm';` por `import { DataSource, In } from 'typeorm';`.
  - Sumá `nombreBombero` al import de `incidente.logica`, y `RecuentoDto` y `ZonaDto` al de los DTO.
- Agregá estos dos métodos antes de `private auditar(`:

```ts
  /** Control de personal: alguien entra o sale de la zona de trabajo. Nunca se libera solo. */
  async zona(servicioId: string, bomberoId: string, dto: ZonaDto, ctx: ContextoIncidente) {
    return this.dataSource.transaction(async (m) => {
      if (dto.claveIdempotencia && (await this.cronologia.buscarPorClave(m, servicioId, dto.claveIdempotencia))) return { repetido: true };
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      const repo = m.getRepository(PersonalServicio);
      let p = await repo.findOne({ where: { servicioId, bomberoId } });
      if (!p) {
        // Quien se sumo por una solicitud de despacho figura como participante: entra al personal ahora.
        const usuario = await m.getRepository(Usuario).findOne({ where: { bomberoId } });
        const participa = usuario ? await m.getRepository(ServicioParticipante).findOne({ where: { servicioId, usuarioId: usuario.id } }) : null;
        if (!participa) throw new NotFoundException('Esa persona no figura en el personal del incidente.');
        p = await repo.save(repo.create({
          servicioId, bomberoId, rol: 'Sumado por solicitud', horasServicio: 0, observaciones: null,
          vehiculoId: null, despachoId: null, origen: 'SOLICITUD', funcion: null, enZona: false, zonaDesde: null,
        }));
      }
      if (!!p.enZona === dto.dentro) return { repetido: true };
      const ocurridoEn = instanteDelHecho(dto.ocurridoEn);
      await repo.update({ id: p.id }, { enZona: dto.dentro, zonaDesde: dto.dentro ? ocurridoEn : null });
      const b = await m.getRepository(Bombero).findOne({ where: { id: bomberoId } });
      const fase = dto.dentro ? await this.motor.alHecho(m, servicioId, 'ACCION_OPERATIVA', ocurridoEn) : null;
      await this.cronologia.registrar(m, {
        servicioId,
        tipo: dto.dentro ? 'PERSONAL_ENTRA_ZONA' : 'PERSONAL_SALE_ZONA',
        titulo: `${nombreBombero(b)} ${dto.dentro ? 'entra a' : 'sale de'} la zona`,
        ocurridoEn, usuarioId: ctx.usuarioId, gps: dto.gps ?? null, fase,
        fuente: 'personal_servicio', fuenteId: p.id, datos: { bomberoId },
        origen: ctx.origen, dispositivo: ctx.dispositivo, claveIdempotencia: dto.claveIdempotencia,
      });
      return { repetido: false };
    });
  }

  /** Recuento de personal (PAR): el comando confirma, una por una, a todas las personas en zona. */
  async recuento(servicioId: string, dto: RecuentoDto, ctx: ContextoIncidente) {
    const r = await this.dataSource.transaction(async (m) => {
      if (dto.claveIdempotencia && (await this.cronologia.buscarPorClave(m, servicioId, dto.claveIdempotencia))) return { repetido: true, faltantes: 0 };
      const s = await this.motor.bloquear(m, servicioId);
      if (s.faseOperativa === 'CERRADO') throw new ConflictException('El incidente ya está cerrado.');
      const enZona = (await m.getRepository(PersonalServicio).find({ where: { servicioId } })).filter((p) => p.enZona).map((p) => p.bomberoId);
      if (enZona.length === 0) throw new ConflictException('No hay nadie registrado dentro de la zona.');
      if (dto.presentes.some((x) => dto.faltantes.includes(x))) throw new BadRequestException('Una persona no puede estar presente y sin confirmar a la vez.');
      const declarados = new Set([...dto.presentes, ...dto.faltantes]);
      if (enZona.some((x) => !declarados.has(x))) throw new BadRequestException('El recuento tiene que incluir a todas las personas que están en zona.');
      const bomberos = await m.getRepository(Bombero).find({ where: { id: In([...declarados]) } });
      const nombre = new Map(bomberos.map((b) => [b.id, nombreBombero(b)]));
      await this.cronologia.registrar(m, {
        servicioId,
        tipo: 'RECUENTO_PERSONAL',
        titulo: dto.faltantes.length
          ? `Recuento: ${dto.faltantes.length} sin confirmar (${dto.faltantes.map((x) => nombre.get(x) ?? 'persona').join(', ')})`
          : `Recuento: ${dto.presentes.length} presentes, todos confirmados`,
        ocurridoEn: instanteDelHecho(dto.ocurridoEn), usuarioId: ctx.usuarioId, gps: dto.gps ?? null,
        critico: dto.faltantes.length > 0, datos: { presentes: dto.presentes, faltantes: dto.faltantes },
        origen: ctx.origen, dispositivo: ctx.dispositivo, claveIdempotencia: dto.claveIdempotencia,
      });
      return { repetido: false, faltantes: dto.faltantes.length };
    });
    if (!r.repetido) {
      await this.auditar(ctx, 'RECUENTO_PERSONAL', servicioId, null, { presentes: dto.presentes.length, faltantes: dto.faltantes });
      if (r.faltantes > 0) await this.avisos.avisar(servicioId, 'PERSONAL_FALTANTE', `${r.faltantes} persona(s)`);
    }
    return r;
  }
```

En `backend/src/modules/incidentes/incidentes.controller.ts`, sumá `RecuentoDto` y `ZonaDto` al import de los
DTO y agregá al final de la clase:

```ts
  @Post(':id/personal/:bomberoId/zona')
  @RequirePermission('servicios:operar')
  zona(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Param('bomberoId', new ParseUUIDPipe()) bomberoId: string,
    @Body() dto: ZonaDto,
    @CurrentUser() user: AuthenticatedUser,
    @Req() req: Request,
  ) {
    return this.acciones.zona(id, bomberoId, dto, contextoDe(user, req));
  }

  @Post(':id/recuento')
  @RequirePermission('servicios:comandar')
  recuento(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: RecuentoDto, @CurrentUser() user: AuthenticatedUser, @Req() req: Request) {
    return this.acciones.recuento(id, dto, contextoDe(user, req));
  }
```

- [ ] **Paso 4: Expediente y tablero**

En `backend/src/modules/incidentes/expediente.service.ts`:

1. En el tipo `AlertaTablero['tipo']` agregá `| 'PERSONAL_FALTANTE' | 'PERSONAL_EN_ZONA'`.
2. Debajo de la función `presentarEvento`, agregá:

```ts
/** El ultimo RECUENTO_PERSONAL: cuando, cuantos presentes y quienes quedaron sin confirmar. */
function ultimoRecuento(eventos: IncidenteEvento[], nombre: (id: string) => string) {
  const e = [...eventos].reverse().find((x) => x.tipo === 'RECUENTO_PERSONAL');
  if (!e) return null;
  const d = leerDatos(e.datos) as { presentes?: string[]; faltantes?: string[] } | null;
  return { ocurridoEn: e.ocurridoEn, presentes: d?.presentes?.length ?? 0, faltantes: (d?.faltantes ?? []).map(nombre) };
}
```

3. En `tablero`, en la consulta de eventos, cambiá
   `tipo: In(['SITUACION_MARCADA', 'SITUACION_RESUELTA', 'EMERGENCIA', 'EMERGENCIA_ATENDIDA'])` por
   `tipo: In(['SITUACION_MARCADA', 'SITUACION_RESUELTA', 'EMERGENCIA', 'EMERGENCIA_ATENDIDA', 'RECUENTO_PERSONAL'])`.
4. En `tablero`, inmediatamente después del bloque `const personal = despachos.length ? … : [];`, agregá:

```ts
    const enZona = vacio ? [] : await m.getRepository(PersonalServicio).find({ where: { servicioId: In(ids), enZona: true } });
```

5. En el objeto de cada incidente del tablero, después de `pedidosPendientes: …,`, agregá
   `personalEnZona: enZona.filter((p) => p.servicioId === s.id).length,`.
6. En el bucle de alertas `for (const i of incidentes) { … }`, después de la línea de condiciones críticas, agregá:

```ts
      const recuento = [...(porServicio.get(i.id) ?? [])].reverse().find((e) => e.tipo === 'RECUENTO_PERSONAL');
      const faltan = (leerDatos(recuento?.datos ?? null) as { faltantes?: string[] } | null)?.faltantes?.length ?? 0;
      if (faltan > 0) alertas.push({ nivel: 'CRITICA', tipo: 'PERSONAL_FALTANTE', servicioId: i.id, texto: `Recuento con ${faltan} persona(s) sin confirmar — ${i.numeroServicio}` });
      if ((i.fase === 'RETORNO' || i.fase === 'DISPONIBLE') && i.personalEnZona > 0) {
        alertas.push({ nivel: 'ALTA', tipo: 'PERSONAL_EN_ZONA', servicioId: i.id, texto: `${i.personalEnZona} persona(s) siguen registradas en zona con los móviles de vuelta — ${i.numeroServicio}` });
      }
```

7. En `obtener`, reemplazá el `map` de la tripulación de cada despacho por
   `tripulacion: personal.filter((p) => p.despachoId === d.id).map((p) => ({ bomberoId: p.bomberoId, nombre: nombre(p.bomberoId), rol: p.rol, funcion: p.funcion ?? null, enZona: !!p.enZona, zonaDesde: p.zonaDesde ?? null })),`
8. En el objeto que devuelve `obtener`, después de `emergenciaActiva: emergenciaActiva(evs),`, agregá:

```ts
      personalEnZona: personal.filter((p) => p.enZona).map((p) => ({ bomberoId: p.bomberoId, nombre: nombre(p.bomberoId), desde: p.zonaDesde })),
      ultimoRecuento: ultimoRecuento(evs, nombre),
```

- [ ] **Paso 5: El cierre no deja a nadie adentro**

En `backend/src/modules/incidentes/cierre.service.ts`:

- Sumá `Bombero` al import de entidades y `ConflictException` al de `@nestjs/common`.
- Cambiá el import de `typeorm` a `import { DataSource, In } from 'typeorm';` y sumá `nombreBombero` al import de `incidente.logica`.
- En `cerrar`, inmediatamente después de `validarCierre(s.faseOperativa, activos.length);`, agregá:

```ts
      const adentro = (await m.getRepository(PersonalServicio).find({ where: { servicioId } })).filter((p) => p.enZona);
      if (adentro.length > 0) {
        const bomberos = await m.getRepository(Bombero).find({ where: { id: In(adentro.map((p) => p.bomberoId)) } });
        throw new ConflictException(
          `No se puede cerrar: ${adentro.length} persona(s) siguen registradas dentro de la zona (${bomberos.map((b) => nombreBombero(b)).join(', ')}). Registrá su salida primero.`,
        );
      }
```

- [ ] **Paso 6: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/incidentes 2>&1 | tail -8 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -5
```

Resultado esperado: todo en verde.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/incidentes
git commit -m "Incidentes: control de personal en zona y recuento; alertas y cierre bloqueado con alguien adentro

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 19: Fotos de víctimas confidenciales y marca de quien no figura en el incidente (backend)

**Archivos:**

- Modificar: `backend/src/modules/campo/adjuntos.service.ts`, `campo.controller.ts`, `campo.spec.ts`
- Modificar: `backend/src/modules/incidentes/expediente.service.ts`, `cierre.service.ts`, `incidentes.controller.ts`, `acciones.service.ts`, `expediente.spec.ts`, `acciones.spec.ts`

**Interfaces:**

- Consume: el permiso existente `despacho:confidencial` (migración 090) y la decisión **DEC-2** de la tarea 0.
- Produce:
  - `AdjuntosService.listar(entidad, entidadId, verConfidencial = false)` y `archivo(id, verConfidencial = false, ctx?)`: las fotos con categoría `VICTIMA` solo se ven con ese permiso, y cada acceso queda auditado como `ACCESO_CONFIDENCIAL`.
  - `ExpedienteService.obtener(servicioId, usuarioId, verConfidencial = false)`, que suma `fotosOcultas: number`, y `CierreService.informe(servicioId, verConfidencial = false)`.
  - `AccionesService.registrarCampo(m, ctx, evento)`: marca `datos.fueraDeAsignacion = true` cuando quien actúa no figura en el incidente o, según DEC-2, lo rechaza (salvo EMERGENCIA).
- Nota: se usa el permiso directamente y no la matriz de pantallas (que en despacho decide la columna
  "Confidencial"). Es una simplificación de este corte; queda anotada en `.context/INCIDENTES.md` §7.

- [ ] **Paso 1: Escribir las pruebas**

En `backend/src/modules/campo/campo.spec.ts`, dentro del `describe` de `AdjuntosService`, agregá
(`audit` es el mock de auditoría que ya usa ese `describe`):

```ts
  it('una foto de víctima solo se lista y se descarga con despacho:confidencial, y el acceso se audita', async () => {
    await sembrar(base, Servicio, { id: 'S8', estado: 'EN_CURSO' });
    const foto = await servicio.subir(archivo(PNG), { entidad: 'SERVICIO', entidadId: 'S8', tipo: 'FOTO', categoria: 'VICTIMA' }, ctx);
    expect(await servicio.listar('SERVICIO', 'S8')).toEqual([]);
    expect(await servicio.listar('SERVICIO', 'S8', true)).toHaveLength(1);
    await expect(servicio.archivo(foto.id)).rejects.toThrow(ForbiddenException);
    await servicio.archivo(foto.id, true, ctx).catch(() => undefined);
    expect(audit.registrar).toHaveBeenCalledWith(expect.objectContaining({ accion: 'ACCESO_CONFIDENCIAL', recursoId: foto.id }));
  });
```

(Sumá `ForbiddenException` al import de `@nestjs/common` si no estaba.)

En `backend/src/modules/incidentes/expediente.spec.ts` sumá `Adjunto` al import de entidades y agregá:

```ts
  it('las fotos de víctimas no salen en el expediente sin permiso confidencial', async () => {
    await sembrar(base, Adjunto, { id: 'f1', entidad: 'SERVICIO', entidadId: 's1', tipo: 'FOTO', categoria: 'VICTIMA', tomadoEn: new Date() });
    await sembrar(base, Adjunto, { id: 'f2', entidad: 'SERVICIO', entidadId: 's1', tipo: 'FOTO', categoria: 'DANO', tomadoEn: new Date() });
    const sin = await servicio.obtener('s1', 'u1');
    expect(sin.fotos.map((f) => f.id)).toEqual(['f2']);
    expect(sin.fotosOcultas).toBe(1);
    const con = await servicio.obtener('s1', 'u1', true);
    expect(con.fotos).toHaveLength(2);
    expect(con.fotosOcultas).toBe(0);
  });
```

En `backend/src/modules/incidentes/acciones.spec.ts`:

- Sumá `ServicioParticipante` al import si no estaba.
- En el `beforeEach`, después de sembrar los usuarios, agregá
  `await sembrar(base, ServicioParticipante, { id: 'sp-u2', servicioId: 's1', usuarioId: 'u2' });`. Así
  `bombero` figura en el incidente y las pruebas anteriores no cambian de sentido.
- Agregá estas pruebas (`ajeno` no figura en el incidente):

```ts
  const ajeno: ContextoIncidente = { usuarioId: 'u3', username: 'otro', permisos: ['servicios:operar'], origen: 'WEB' };

  it('quien no figura en el incidente queda marcado (la central y el comando no)', async () => {
    await sembrar(base, Usuario, { id: 'u3', username: 'otro', bomberoId: null });
    await acciones.comunicacion('s1', { texto: 'Desde otro incidente' }, ajeno);
    await acciones.comunicacion('s1', { texto: 'Desde el comando' }, comando);
    const [a, b] = base.tabla('IncidenteEvento');
    expect(JSON.parse(a.datos as string)).toMatchObject({ fueraDeAsignacion: true });
    expect(JSON.parse(b.datos as string).fueraDeAsignacion).toBeUndefined();
  });

  it('la EMERGENCIA nunca se bloquea, venga de quien venga', async () => {
    await sembrar(base, Usuario, { id: 'u3', username: 'otro', bomberoId: null });
    await expect(acciones.emergencia('s1', {}, ajeno)).resolves.toBeDefined();
  });
```

  **Si DEC-2 fue "solo quien figura en el incidente"**, reemplazá la primera de las dos por:

```ts
  it('quien no figura en el incidente no puede registrar (la central y el comando sí)', async () => {
    await sembrar(base, Usuario, { id: 'u3', username: 'otro', bomberoId: null });
    await expect(acciones.comunicacion('s1', { texto: 'Desde otro incidente' }, ajeno)).rejects.toThrow(ForbiddenException);
    await expect(acciones.comunicacion('s1', { texto: 'Desde el comando' }, comando)).resolves.toBeDefined();
  });
```

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/campo src/modules/incidentes 2>&1 | tail -8
```

Resultado esperado: FAIL en las cuatro pruebas nuevas.

- [ ] **Paso 3: Adjuntos**

En `backend/src/modules/campo/adjuntos.service.ts`, sumá `ForbiddenException` al import de `@nestjs/common` y reemplazá:

```ts
  async listar(entidad: EntidadAdjunto, entidadId: string) {
    const filas = await this.dataSource.getRepository(Adjunto).find({ where: { entidad, entidadId }, order: { creadoEn: 'DESC' } });
    return filas.map(metadatos);
  }
```

por:

```ts
  /** Las fotos clasificadas como VICTIMA son confidenciales (punto 24 del pedido): solo con despacho:confidencial. */
  async listar(entidad: EntidadAdjunto, entidadId: string, verConfidencial = false) {
    const filas = await this.dataSource.getRepository(Adjunto).find({ where: { entidad, entidadId }, order: { creadoEn: 'DESC' } });
    return filas.filter((a) => verConfidencial || a.categoria !== 'VICTIMA').map(metadatos);
  }
```

y el comienzo de `archivo`:

```ts
  async archivo(id: string): Promise<{ buffer: Buffer; mime: string }> {
    const a = await this.dataSource.getRepository(Adjunto).findOne({ where: { id } });
    if (!a) throw new NotFoundException('Adjunto no encontrado');
```

por:

```ts
  async archivo(id: string, verConfidencial = false, ctx?: ContextoCampo): Promise<{ buffer: Buffer; mime: string }> {
    const a = await this.dataSource.getRepository(Adjunto).findOne({ where: { id } });
    if (!a) throw new NotFoundException('Adjunto no encontrado');
    if (a.categoria === 'VICTIMA') {
      if (!verConfidencial) throw new ForbiddenException('Foto confidencial: hace falta el permiso despacho:confidencial.');
      if (ctx) {
        await this.auditoria.registrar({
          usuarioId: ctx.usuarioId, accion: 'ACCESO_CONFIDENCIAL', recurso: 'servicios.adjunto', recursoId: a.id,
          datosDespues: { categoria: a.categoria, entidadId: a.entidadId }, ip: ctx.ip ?? null, userAgent: ctx.userAgent ?? null,
        });
      }
    }
```

En `backend/src/modules/campo/campo.controller.ts`, reemplazá los dos endpoints de lectura de adjuntos por:

```ts
  @Get('adjuntos')
  @RequirePermission('adjuntos:ver')
  listarAdjuntos(@Query('entidad') entidad: string, @Query('entidadId', new ParseUUIDPipe()) entidadId: string, @CurrentUser() user: AuthenticatedUser) {
    if (!(ENTIDADES as readonly string[]).includes(entidad)) throw new BadRequestException('Entidad no valida.');
    return this.adjuntos.listar(entidad as (typeof ENTIDADES)[number], entidadId, user.permisos.includes('despacho:confidencial'));
  }

  @Get('adjuntos/:id/archivo')
  @RequirePermission('adjuntos:ver')
  async archivo(@Param('id', new ParseUUIDPipe()) id: string, @CurrentUser() user: AuthenticatedUser, @Req() req: Request, @Res() res: Response) {
    const { buffer, mime } = await this.adjuntos.archivo(id, user.permisos.includes('despacho:confidencial'), this.ctx(user, req));
    res.set({ 'Content-Type': mime, 'Content-Length': String(buffer.length), 'Cache-Control': 'private, max-age=300', 'X-Content-Type-Options': 'nosniff' });
    res.send(buffer);
  }
```

- [ ] **Paso 4: Expediente e informe**

En `backend/src/modules/incidentes/expediente.service.ts`:

- Firma: `async obtener(servicioId: string, usuarioId: string | null, verConfidencial = false) {`.
- En `fotos`, cambiá `.filter((a) => a.tipo === 'FOTO')` por `.filter((a) => a.tipo === 'FOTO' && (verConfidencial || a.categoria !== 'VICTIMA'))`.
- Después de la propiedad `fotos: …,` agregá
  `fotosOcultas: adjuntos.filter((a) => a.tipo === 'FOTO' && !verConfidencial && a.categoria === 'VICTIMA').length,`.

En `backend/src/modules/incidentes/cierre.service.ts`:

- Firma: `async informe(servicioId: string, verConfidencial = false) {`.
- `const exp = await this.expediente.obtener(servicioId, null, verConfidencial);`

En `backend/src/modules/incidentes/incidentes.controller.ts`:

- En `obtener`: `return this.expediente.obtener(id, user.id, user.permisos.includes('despacho:confidencial'));`
- En `informe`, agregá el parámetro `@CurrentUser() user: AuthenticatedUser` y devolvé
  `this.cierre.informe(id, user.permisos.includes('despacho:confidencial'))`.

- [ ] **Paso 5: Marca de quien no figura en el incidente**

En `backend/src/modules/incidentes/acciones.service.ts`:

- Sumá `ForbiddenException` al import de `@nestjs/common`, `EntityManager` al de `typeorm` y
  `NuevoEvento` al de `cronologia.service`.
- Agregá antes de `private auditar(`:

```ts
  /** La central y el comando estan asignados por su funcion; el resto, si figura en el personal o entre los participantes. */
  private async fueraDeAsignacion(m: EntityManager, servicioId: string, ctx: ContextoIncidente): Promise<boolean> {
    if (ctx.permisos.includes('servicios:despachar') || ctx.permisos.includes('servicios:comandar')) return false;
    const u = await m.getRepository(Usuario).findOne({ where: { id: ctx.usuarioId } });
    if (u?.bomberoId && (await m.getRepository(PersonalServicio).findOne({ where: { servicioId, bomberoId: u.bomberoId } }))) return false;
    return !(await m.getRepository(ServicioParticipante).findOne({ where: { servicioId, usuarioId: ctx.usuarioId } }));
  }

  /** Evento de una accion de campo: quien no figura en el incidente queda marcado (DEC-2). La EMERGENCIA nunca se bloquea. */
  private async registrarCampo(m: EntityManager, ctx: ContextoIncidente, e: NuevoEvento) {
    if (!(await this.fueraDeAsignacion(m, e.servicioId, ctx))) return this.cronologia.registrar(m, e);
    return this.cronologia.registrar(m, { ...e, datos: { ...(e.datos ?? {}), fueraDeAsignacion: true } });
  }
```

- **Si DEC-2 fue "solo quien figura en el incidente"**, la segunda línea de `registrarCampo` queda así:

```ts
    if (e.tipo !== 'EMERGENCIA') throw new ForbiddenException('No figurás en el personal de este incidente: pedí que te sumen.');
    return this.cronologia.registrar(m, { ...e, datos: { ...(e.datos ?? {}), fueraDeAsignacion: true } });
```

- En los métodos `situacion`, `solicitarRecurso`, `emergencia`, `comunicacion` y `zona`, reemplazá la llamada
  `this.cronologia.registrar(m, {` por `this.registrarCampo(m, ctx, {`. Son cinco reemplazos; los demás métodos
  (decisiones del comando y la central) siguen usando `this.cronologia.registrar`.

- [ ] **Paso 6: Correr las pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx jest src/modules/campo src/modules/incidentes 2>&1 | tail -8 && npx tsc --noEmit -p tsconfig.json 2>&1 | head -5
```

Resultado esperado: todo en verde.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add backend/src/modules/campo backend/src/modules/incidentes
git commit -m "Incidentes: fotos de víctimas solo con permiso confidencial y marca de quien no figura en el incidente

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 20: Punto de control A: backend completo contra la base real

Las bases falsas ignoran los bloqueos, así que la concurrencia real y el canal en tiempo real solo se
prueban acá. **No se pasa a la fase B (frontend) con algo en rojo.**

**Archivos:**

- Crear: `scripts/smoke-incidente.mjs`

**Interfaces:**

- Consume: todos los endpoints de la fase A.
- Produce: la prueba viva que la tarea 24 vuelve a correr al final.

- [ ] **Paso 1: Suite y tipos**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx tsc --noEmit -p tsconfig.json && npm test 2>&1 | tail -6
```

Resultado esperado: `tsc` limpio y todas las suites en verde. Son las del estado inicial más las 9 nuevas
(`incidente.logica`, `incidente-nucleo`, `tripulacion`, `recepcion`, `expediente`, `acciones`, `cierre`, `avisos`;
más los casos agregados a `flota.service`, `campo`, `despacho` y `servicio-activo`).

- [ ] **Paso 2: Prueba viva**

Crear `scripts/smoke-incidente.mjs`:

```js
#!/usr/bin/env node
/**
 * Prueba viva del Centro de Operaciones e Incidentes contra el backend y la base reales.
 * Recorre un incidente completo por la API, como lo harian la central y el comando, y dice el
 * resultado de cada paso. Prueba ademas lo que las pruebas unitarias no pueden: concurrencia real
 * (dos operadores, dos celulares) y los avisos por el canal en tiempo real. Se detiene en el primer fallo.
 *
 * ESCRIBE EN LA BASE: deja un incidente de PRUEBA cerrado con su bitacora (inmutable: no se puede
 * borrar), mueve dos moviles (vuelven al cuartel al final) y suma una persona al personal del
 * incidente. Por eso exige --confirmar.
 *
 * Correr con el backend levantado:
 *   node scripts/smoke-incidente.mjs --usuario admin --password <clave> --confirmar
 *   [--base http://localhost:3001/api/v1] [--origen http://localhost:3000]
 */
const arg = (nombre, porDefecto = null) => {
  const i = process.argv.indexOf(`--${nombre}`);
  return i !== -1 && process.argv[i + 1] && !process.argv[i + 1].startsWith('--') ? process.argv[i + 1] : porDefecto;
};

const BASE = arg('base', 'http://localhost:3001/api/v1');
const ORIGEN = arg('origen', 'http://localhost:3000');
const usuario = arg('usuario');
const password = arg('password');
if (!process.argv.includes('--confirmar') || !usuario || !password) {
  console.error('Uso: node scripts/smoke-incidente.mjs --usuario <u> --password <p> --confirmar');
  process.exit(2);
}

let cookies = '';
const pasos = [];
const marca = Date.now().toString(36);
const clave = (s) => `smoke-${marca}-${s}`;
const gps = { latitud: -25.2865, longitud: -57.647, precisionM: 12 };
const esperar = (ms) => new Promise((r) => setTimeout(r, ms));

async function api(metodo, ruta, cuerpo) {
  const cabeceras = { Accept: 'application/json', Cookie: cookies };
  if (metodo !== 'GET') Object.assign(cabeceras, { 'Content-Type': 'application/json', 'X-SIGBO-Request': '1', Origin: ORIGEN });
  const res = await fetch(BASE + ruta, { method: metodo, headers: cabeceras, body: cuerpo === undefined ? undefined : JSON.stringify(cuerpo) });
  return { estado: res.status, datos: await res.json().catch(() => null) };
}

function resumen() {
  const fallas = pasos.filter((p) => !p.ok).length;
  console.log(`\n${pasos.length - fallas}/${pasos.length} pasos bien.`);
}

function paso(nombre, ok, detalle = '') {
  pasos.push({ nombre, ok });
  console.log(`${ok ? 'OK   ' : 'FALLA'} ${nombre}${detalle ? ` — ${detalle}` : ''}`);
  if (!ok) {
    resumen();
    process.exit(1);
  }
}

/** Escucha GET /despacho/stream?solo=incidentes y junta los avisos que llegan. */
async function escucharAvisos() {
  const control = new AbortController();
  const recibidos = [];
  const res = await fetch(`${BASE}/despacho/stream?solo=incidentes`, { headers: { Cookie: cookies, Accept: 'text/event-stream' }, signal: control.signal });
  const lector = res.body.getReader();
  const decodificador = new TextDecoder();
  let resto = '';
  const lectura = (async () => {
    try {
      for (;;) {
        const { value, done } = await lector.read();
        if (done) break;
        resto += decodificador.decode(value, { stream: true });
        const bloques = resto.split('\n\n');
        resto = bloques.pop() ?? '';
        for (const b of bloques) {
          const linea = b.split('\n').find((l) => l.startsWith('data:'));
          if (linea) {
            try {
              recibidos.push(JSON.parse(linea.slice(5).trim()));
            } catch {
              /* otro formato */
            }
          }
        }
      }
    } catch {
      /* cerrado por nosotros */
    }
  })();
  return { estado: res.status, recibidos, cerrar: async () => { control.abort(); await lectura; } };
}

// 1. Sesion (cookie HttpOnly, como el navegador)
const login = await fetch(`${BASE}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'X-SIGBO-Request': '1', Origin: ORIGEN },
  body: JSON.stringify({ usernameOrEmail: usuario, password }),
});
cookies = (login.headers.getSetCookie?.() ?? []).map((c) => c.split(';')[0]).join('; ');
paso('Inicio de sesión', login.ok && cookies.length > 0, `HTTP ${login.status}`);

// 2. Catalogos y moviles libres
const cat = await api('GET', '/incidentes/catalogos');
paso('Catálogos', cat.estado === 200 && cat.datos.condiciones.length >= 22 && cat.datos.tiposRecurso.length >= 12 && cat.datos.bomberos.length > 0, `${cat.datos?.condiciones?.length} condiciones`);
const tipo = cat.datos.tiposServicio[0];
const ambulancia = cat.datos.tiposRecurso.find((r) => r.codigo === 'AMBULANCIA');
const persona = cat.datos.bomberos[0];
const flota = await api('GET', '/flota/tablero');
const libres = (flota.datos ?? []).filter((m) => m.estado === 'OPERATIVO' && m.estadoOperativo === 'EN_CUARTEL');
paso('Hay dos móviles libres en el cuartel', libres.length >= 2, `${libres.length} libres`);
const [m1, m2] = libres;

// 3. Recepcion, con el canal de avisos abierto
const oyente = await escucharAvisos();
paso('Canal de avisos (SSE ?solo=incidentes)', oyente.estado === 200, `HTTP ${oyente.estado}`);
const rec = await api('POST', '/incidentes', {
  tipoServicioId: tipo.id,
  direccion: 'PRUEBA TÉCNICA smoke-incidente (no es un servicio real)',
  descripcion: 'Registro generado por scripts/smoke-incidente.mjs',
  claveIdempotencia: clave('rec'),
});
paso('Recepción rápida con dos datos', rec.estado === 201, rec.datos?.numeroServicio);
const id = rec.datos.servicioId;

// 4. Concurrencia real: dos operadores despachan el mismo movil a la vez
const [c1, c2] = await Promise.all([
  api('POST', `/incidentes/${id}/despachos`, { moviles: [{ vehiculoId: m1.id, salir: true }] }),
  api('POST', `/incidentes/${id}/despachos`, { moviles: [{ vehiculoId: m1.id, salir: true }] }),
]);
const intentos = [...(c1.datos?.resultados ?? []), ...(c2.datos?.resultados ?? [])];
paso('Despacho simultáneo del mismo móvil: gana uno solo', intentos.filter((r) => r.ok).length === 1, JSON.stringify(intentos.map((r) => (r.ok ? 'ok' : r.error))));
const asignado = await api('POST', `/incidentes/${id}/despachos`, { moviles: [{ vehiculoId: m2.id, salir: false }] });
paso('Solo asignar el segundo móvil', asignado.datos?.resultados?.[0]?.ok === true);
let exp = (await api('GET', `/incidentes/${id}`)).datos;
const d1 = exp.despachos.find((d) => d.vehiculoId === m1.id);
const d2 = exp.despachos.find((d) => d.vehiculoId === m2.id);
paso('Fase EN_CAMINO; el segundo móvil espera SALIMOS', exp.incidente.fase === 'EN_CAMINO' && d1.siguientePaso === 'llegada' && d2.siguientePaso === 'salida', `${exp.incidente.fase} / ${d1.siguientePaso} / ${d2.siguientePaso}`);

// 5. Campo
paso('SALIMOS del segundo móvil', (await api('POST', `/incidentes/${id}/despachos/${d2.id}/salida`, { claveIdempotencia: clave('sal2') })).estado === 201);
const [x1, x2] = await Promise.all([
  api('POST', `/incidentes/${id}/despachos/${d1.id}/llegada`, { claveIdempotencia: clave('lleg-a'), gps }),
  api('POST', `/incidentes/${id}/despachos/${d1.id}/llegada`, { claveIdempotencia: clave('lleg-b'), gps }),
]);
paso('LLEGAMOS desde dos celulares a la vez: uno registra, el otro recibe 409', [x1.estado, x2.estado].sort().join() === '201,409', `${x1.estado} ${x2.estado}`);
const ganadora = x1.estado === 201 ? clave('lleg-a') : clave('lleg-b');
const reintento = await api('POST', `/incidentes/${id}/despachos/${d1.id}/llegada`, { claveIdempotencia: ganadora, gps });
paso('El reintento con la misma clave no se repite', reintento.estado === 201 && reintento.datos?.repetido === true);
await api('POST', `/incidentes/${id}/despachos/${d2.id}/llegada`, { claveIdempotencia: clave('lleg2') });
exp = (await api('GET', `/incidentes/${id}`)).datos;
paso('Fase EN_LUGAR y coordenadas tomadas del GPS', exp.incidente.fase === 'EN_LUGAR' && exp.incidente.latitud !== null, `${exp.incidente.fase} ${exp.incidente.latitud}`);

await api('POST', `/incidentes/${id}/situacion`, { condicion: 'INCENDIO_ACTIVO', activa: true, claveIdempotencia: clave('sit1') });
const s2 = await api('POST', `/incidentes/${id}/situacion`, { condicion: 'INCENDIO_CONTROLADO', activa: true, claveIdempotencia: clave('sit2') });
paso('Condiciones excluyentes: queda solo la última', s2.estado === 201 && JSON.stringify(s2.datos.activas) === JSON.stringify(['INCENDIO_CONTROLADO']), JSON.stringify(s2.datos?.activas));
exp = (await api('GET', `/incidentes/${id}`)).datos;
paso('La primera acción operativa pasa a OPERANDO', exp.incidente.fase === 'OPERANDO', exp.incidente.fase);

const kPedido = clave('ped');
const p1 = await api('POST', `/incidentes/${id}/solicitudes`, { tipoRecursoId: ambulancia.id, prioridad: 'URGENTE', claveIdempotencia: kPedido });
const p2 = await api('POST', `/incidentes/${id}/solicitudes`, { tipoRecursoId: ambulancia.id, prioridad: 'URGENTE', claveIdempotencia: kPedido });
paso('Pedido urgente idempotente', p1.estado === 201 && p2.datos?.id === p1.datos?.id);
const tab = (await api('GET', '/incidentes/tablero')).datos;
paso('El tablero alerta el pedido urgente', tab.alertas.some((a) => a.tipo === 'PEDIDO_URGENTE' && a.servicioId === id));
paso('Pedido aprobado por la central', (await api('POST', `/incidentes/${id}/solicitudes/${p1.datos.id}/estado`, { estado: 'APROBADO', version: 0 })).estado === 201);

// 6. Emergencia: tiene que llegar por el canal en tiempo real, no solo por el tablero
await api('POST', `/incidentes/${id}/emergencia`, { detalle: 'Prueba técnica', claveIdempotencia: clave('emg') });
let llego = false;
for (let i = 0; i < 30 && !llego; i += 1) {
  llego = oyente.recibidos.some((e) => e.tipo === 'incidente' && e.servicioId === id && e.datos?.alerta === 'EMERGENCIA');
  if (!llego) await esperar(100);
}
paso('La EMERGENCIA llega por el canal en tiempo real en menos de 3 s', llego);
paso('El canal no expone la lista de destinatarios', oyente.recibidos.every((e) => e.tipo !== 'incidente' || e.para === undefined));
const tab2 = (await api('GET', '/incidentes/tablero')).datos;
paso('EMERGENCIA encabeza las alertas del tablero', tab2.alertas[0]?.tipo === 'EMERGENCIA', tab2.alertas[0]?.texto);
paso('Emergencia atendida', (await api('POST', `/incidentes/${id}/emergencia/atendida`, {})).estado === 201);
paso('Comunicación en la bitácora', (await api('POST', `/incidentes/${id}/comunicacion`, { texto: 'Prueba técnica: comunicación registrada', claveIdempotencia: clave('com') })).estado === 201);

// 7. Control de personal
const trip = await api('PUT', `/incidentes/${id}/despachos/${d1.id}/tripulacion`, { integrantes: [{ bomberoId: persona.id, funcion: 'BOMBERO' }] });
paso('Tripulación ajustada', trip.estado === 200, JSON.stringify(trip.datos?.message ?? ''));
paso('Entra a la zona', (await api('POST', `/incidentes/${id}/personal/${persona.id}/zona`, { dentro: true, claveIdempotencia: clave('zona1') })).estado === 201);
paso('Recuento con una persona sin confirmar', (await api('POST', `/incidentes/${id}/recuento`, { presentes: [], faltantes: [persona.id], claveIdempotencia: clave('par1') })).estado === 201);
const tab3 = (await api('GET', '/incidentes/tablero')).datos;
paso('El tablero alerta el recuento con faltantes', tab3.alertas.some((a) => a.tipo === 'PERSONAL_FALTANTE' && a.servicioId === id));
paso('Recuento completo', (await api('POST', `/incidentes/${id}/recuento`, { presentes: [persona.id], faltantes: [], claveIdempotencia: clave('par2') })).estado === 201);
const ctl = await api('POST', `/incidentes/${id}/fase`, { accion: 'CONTROLADO' });
paso('Incidente controlado', ctl.estado === 201 && ctl.datos?.despues === 'CONTROLADO');

// 8. Desmovilizacion y cierre
const temprano = await api('POST', `/incidentes/${id}/cierre`, { resultado: 'CONTROLADO', huboVictimas: false, huboDanos: false });
paso('El cierre se rechaza con móviles afuera', temprano.estado === 409, temprano.datos?.message);
for (const d of [d1, d2]) await api('POST', `/incidentes/${id}/despachos/${d.id}/retorno`, { claveIdempotencia: clave(`ret-${d.id.slice(0, 8)}`) });
exp = (await api('GET', `/incidentes/${id}`)).datos;
paso('Fase RETORNO', exp.incidente.fase === 'RETORNO', exp.incidente.fase);
for (const d of [d1, d2]) await api('POST', `/incidentes/${id}/despachos/${d.id}/disponible`, { claveIdempotencia: clave(`dis-${d.id.slice(0, 8)}`) });
exp = (await api('GET', `/incidentes/${id}`)).datos;
paso('Fase DISPONIBLE (móviles en el cuartel)', exp.incidente.fase === 'DISPONIBLE', exp.incidente.fase);
const tab4 = (await api('GET', '/incidentes/tablero')).datos;
paso('Alerta: alguien sigue en zona con los móviles de vuelta', tab4.alertas.some((a) => a.tipo === 'PERSONAL_EN_ZONA' && a.servicioId === id));
const conGente = await api('POST', `/incidentes/${id}/cierre`, { resultado: 'CONTROLADO', huboVictimas: false, huboDanos: false });
paso('El cierre se rechaza con una persona en zona', conGente.estado === 409 && /zona/.test(conGente.datos?.message ?? ''), conGente.datos?.message);
paso('Sale de la zona', (await api('POST', `/incidentes/${id}/personal/${persona.id}/zona`, { dentro: false, claveIdempotencia: clave('zona2') })).estado === 201);

const cierre = await api('POST', `/incidentes/${id}/cierre`, { resultado: 'CONTROLADO', huboVictimas: false, huboDanos: false, observaciones: 'Prueba técnica automatizada (scripts/smoke-incidente.mjs).' });
paso('Cierre', cierre.estado === 201);
const inf = (await api('GET', `/incidentes/${id}/informe`)).datos;
paso('Informe armado solo: tiempos y cronología', inf.incidente.fase === 'CERRADO' && !!inf.tiempos.primeraLlegada && inf.cronologia.length >= 20, `${inf.cronologia.length} eventos`);
paso('El aviso NUEVO llegó por el canal', oyente.recibidos.some((e) => e.tipo === 'incidente' && e.servicioId === id && e.datos?.alerta === 'NUEVO'));
await oyente.cerrar();

resumen();
console.log(`\nIncidente de prueba: ${rec.datos.numeroServicio} (${id}). Su bitácora es inmutable: anotalo en .context/INCIDENTES.md §6.`);
```

Correlo con el backend levantado. Antes verificá que el proceso sea nuevo con
`Get-Process node | Select-Object Id, StartTime`: `start-sigbo.ps1` no reinicia lo que ya escucha.

```bash
cd /c/Proyectos/Personal/SIGBO && node scripts/smoke-incidente.mjs --usuario admin --password "$SIGBO_DEMO_PASSWORD" --confirmar
```

Resultado esperado: todos los pasos `OK`. La clave es `SIGBO_DEMO_PASSWORD` de `backend/.env`: exportala en la
terminal y **no la escribas en ningún archivo**. Si el inicio de sesión falla por el `Origin` del CSRF, pasá
el que corresponda con `--origen`. Anotá el número del incidente de prueba.

- [ ] **Paso 3: Informe al usuario y commit**

Mostrale al usuario la salida del script y la cuenta de pruebas. Si algún paso falló, corregí **antes** de
seguir; el arreglo va en su propio commit con un mensaje que diga qué falló.

```bash
cd /c/Proyectos/Personal/SIGBO
git add scripts/smoke-incidente.mjs
git commit -m "Incidentes: prueba viva del backend con concurrencia real, avisos en tiempo real y control de personal

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Si la ejecución se reparte en dos sesiones, este es el punto de corte: la fase B solo necesita el backend en
verde y este documento.

---

## Tarea 10: Frontend: etiquetas, cola sin conexión y cliente de la API

**Archivos:**

- Crear: `frontend/src/lib/fases-incidente.ts` y `frontend/src/lib/cola-incidente.ts` (puros, **sin imports**: los prueba `node --test` directamente)
- Crear: `frontend/src/lib/incidentes.ts`, `frontend/src/lib/use-cronologia.ts`
- Crear: `frontend/scripts/pruebas/cola-incidente.test.mjs`, `frontend/scripts/pruebas/fases-incidente.test.mjs`
- Modificar: `frontend/package.json` (script `test`)

**Interfaces:**

- Consume: los endpoints de las tareas 4 y 7 a 9; `apiFetch` (`src/lib/api.ts`).
- Produce:
  - `fases-incidente.ts`: los tipos `Fase` y `Paso`; `FASES`, `NOMBRE_FASE`, `FONDO_FASE`, `NOMBRE_RESULTADO`, `RESULTADOS`, `NOMBRE_PRIORIDAD`, `FONDO_PRIORIDAD`, `BOTON_PASO`, `NOMBRE_ESTADO_PEDIDO`, `NOMBRE_CATEGORIA_FOTO`, `NOMBRE_VICTIMA`, `siguientesEstadosPedido`, `transcurrido`, `horaCorta` y `minutosTexto`.
  - `cola-incidente.ts`:
    - Tipos `AccionPendiente`, `Almacen` y `Clasificacion`.
    - Funciones `nuevaClave`, `clasificar`, `leerCola`, `encolar` y `vaciarCola`.
  - `incidentes.ts`:
    - Tipos `Catalogos`, `Tablero`, `AlertaTablero`, `IncidenteTablero`, `IncidenteActivo`, `Expediente`, `DespachoIncidente`, `PedidoRecurso`, `EventoIncidente`, `Informe`, `Tripulaciones`, `Integrante`, `ResultadoDespacho`, `Prioridad`, `Resultado`, `EstadoPedido`, `CategoriaVictima`, `AccionFase` y `Gps`.
    - Funciones de lectura: `obtenerTablero`, `obtenerCatalogos`, `listarActivos`, `obtenerExpediente`, `obtenerCronologia`, `obtenerInforme`, `obtenerTripulaciones` y `obtenerGuardiaActual` (tipo `GuardiaActual`).
    - Los tipos ya incluyen lo que agregan las tareas 17 a 19 (fase A, que se ejecuta antes): `tripulacion[].funcion/enZona/zonaDesde`, `personalEnZona`, `ultimoRecuento`, `fotosOcultas` y, en el tablero, `personalEnZona`.
    - Funciones de escritura: `recibirServicio`, `vincularLlamado`, `despacharMoviles`, `ajustarTripulacion`, `pasoMovilCentral`, `cambiarFase`, `declararResultado`, `cambiarPrioridad`, `asumirComando`, `actualizarPedido`, `atenderEmergencia`, `cerrarIncidente`, `guardarTripulacion` y `subirFoto`.
    - Ayudantes: `mensajeError`, `obtenerGps`, `accionCampo`, `pendientes` y `sincronizarPendientes`.
  - `use-cronologia.ts`: `useCronologia(servicioId, intervaloMs?)`, que devuelve `EventoIncidente[]` y agrega lo nuevo de forma incremental.

- [ ] **Paso 1: Escribir las pruebas**

Crear `frontend/scripts/pruebas/cola-incidente.test.mjs`:

```js
/**
 * Cola de acciones del Modo Incidente sin conexion. Runner nativo de Node.
 * Correr: npm test (desde frontend/)
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { clasificar, encolar, leerCola, nuevaClave, vaciarCola } from '../../src/lib/cola-incidente.ts';

const memoria = () => {
  let valor = null;
  return { leer: () => valor, escribir: (v) => { valor = v; } };
};
const accion = (clave) => ({
  clave, metodo: 'POST', ruta: '/incidentes/x/comunicacion', cuerpo: { texto: clave }, descripcion: clave, creadaEn: '2026-10-07T14:00:00Z',
});

test('sin red, 5xx, 408 y 429 se reintentan; 2xx sale; el resto de 4xx se descarta', () => {
  assert.equal(clasificar(null), 'REPETIR');
  assert.equal(clasificar(503), 'REPETIR');
  assert.equal(clasificar(408), 'REPETIR');
  assert.equal(clasificar(429), 'REPETIR');
  assert.equal(clasificar(201), 'OK');
  assert.equal(clasificar(409), 'DESCARTAR');
  assert.equal(clasificar(400), 'DESCARTAR');
});

test('encolar no duplica la misma clave', () => {
  const a = memoria();
  encolar(a, accion('k1'));
  encolar(a, accion('k1'));
  assert.equal(leerCola(a).length, 1);
});

test('vaciar envía en orden y se detiene en la primera sin red, conservando el orden', async () => {
  const a = memoria();
  for (const k of ['a', 'b', 'c']) encolar(a, accion(k));
  const respuestas = [201, null];
  const enviadas = [];
  const r = await vaciarCola(a, async (acc) => { enviadas.push(acc.clave); return respuestas.shift() ?? 201; });
  assert.deepEqual(enviadas, ['a', 'b']);
  assert.deepEqual(r, { enviadas: 1, descartadas: [], pendientes: 2 });
  const quedan = leerCola(a);
  assert.deepEqual(quedan.map((x) => x.clave), ['b', 'c']);
  assert.equal(quedan[0].intentos, 1);
});

test('vaciar descarta lo rechazado y sigue con lo demás', async () => {
  const a = memoria();
  for (const k of ['a', 'b']) encolar(a, accion(k));
  const r = await vaciarCola(a, async (acc) => (acc.clave === 'a' ? 409 : 201));
  assert.equal(r.enviadas, 1);
  assert.deepEqual(r.descartadas.map((x) => x.clave), ['a']);
  assert.equal(leerCola(a).length, 0);
});

test('una cola dañada en el almacenamiento se lee como vacía', () => {
  assert.deepEqual(leerCola({ leer: () => '{no es json', escribir: () => {} }), []);
  assert.deepEqual(leerCola({ leer: () => '[{"x":1}]', escribir: () => {} }), []);
});

test('nuevaClave genera claves distintas de 8 caracteres o más', () => {
  const a = nuevaClave();
  const b = nuevaClave();
  assert.notEqual(a, b);
  assert.ok(a.length >= 8);
});
```

Crear `frontend/scripts/pruebas/fases-incidente.test.mjs`:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { FASES, NOMBRE_FASE, FONDO_FASE, minutosTexto, siguientesEstadosPedido, transcurrido } from '../../src/lib/fases-incidente.ts';

test('cada fase tiene nombre y un fondo de chip con token', () => {
  for (const f of FASES) {
    assert.ok(NOMBRE_FASE[f]);
    assert.match(FONDO_FASE[f], /^var\(--[a-z-]+\)$/);
  }
});

test('transcurrido en minutos y en horas', () => {
  const ahora = new Date('2026-10-07T15:00:00Z');
  assert.equal(transcurrido('2026-10-07T14:53:00Z', ahora), '7 min');
  assert.equal(transcurrido('2026-10-07T13:55:00Z', ahora), '1 h 05 min');
  assert.equal(transcurrido(null, ahora), '—');
  assert.equal(transcurrido('2026-10-07T15:05:00Z', ahora), '0 min');
});

test('minutosTexto', () => {
  assert.equal(minutosTexto(null), '—');
  assert.equal(minutosTexto(12), '12 min');
  assert.equal(minutosTexto(123), '2 h 03 min');
});

test('un pedido avanza (saltando pasos), se rechaza o se cancela; los finales no siguen', () => {
  assert.deepEqual(siguientesEstadosPedido('EN_CAMINO'), ['EN_USO', 'LIBERADO', 'RECHAZADO', 'CANCELADO']);
  assert.deepEqual(siguientesEstadosPedido('LIBERADO'), []);
  assert.deepEqual(siguientesEstadosPedido('RECHAZADO'), []);
});
```

En `frontend/package.json` reemplazá el script `test` por:

```json
"test": "node --test scripts/pruebas/seccion-url.test.mjs scripts/pruebas/cola-incidente.test.mjs scripts/pruebas/fases-incidente.test.mjs"
```

- [ ] **Paso 2: Correr las pruebas para ver que fallan**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npm test 2>&1 | tail -8
```

Resultado esperado: FAIL con `Cannot find module '…/cola-incidente.ts'`.

- [ ] **Paso 3: Módulos puros**

Crear `frontend/src/lib/fases-incidente.ts`:

```ts
/**
 * Etiquetas y medidas del incidente. Sin imports: lo usan las pantallas y lo prueba `node --test`
 * directamente (scripts/pruebas/fases-incidente.test.mjs). Mismo vocabulario que el backend
 * (backend/src/modules/incidente-nucleo/incidente.logica.ts).
 */
export type Fase =
  | 'RECIBIDO' | 'EVALUACION' | 'DESPACHADO' | 'EN_CAMINO' | 'EN_LUGAR'
  | 'OPERANDO' | 'CONTROLADO' | 'RETORNO' | 'DISPONIBLE' | 'CERRADO';
export type Paso = 'salida' | 'llegada' | 'retorno' | 'disponible';

export const FASES: readonly Fase[] = [
  'RECIBIDO', 'EVALUACION', 'DESPACHADO', 'EN_CAMINO', 'EN_LUGAR', 'OPERANDO', 'CONTROLADO', 'RETORNO', 'DISPONIBLE', 'CERRADO',
];

export const NOMBRE_FASE: Record<Fase, string> = {
  RECIBIDO: 'Recibido', EVALUACION: 'En evaluación', DESPACHADO: 'Despachado', EN_CAMINO: 'En camino',
  EN_LUGAR: 'En el lugar', OPERANDO: 'Operando', CONTROLADO: 'Controlado', RETORNO: 'En retorno',
  DISPONIBLE: 'Unidades disponibles', CERRADO: 'Cerrado',
};

/** Fondo del chip (.badge fija el texto en --ink, asi que va un tinte claro). */
export const FONDO_FASE: Record<Fase, string> = {
  RECIBIDO: 'var(--warn-fill)', EVALUACION: 'var(--warn-fill)', DESPACHADO: 'var(--info-fill)', EN_CAMINO: 'var(--info-fill)',
  EN_LUGAR: 'var(--bad-fill)', OPERANDO: 'var(--bad-fill)', CONTROLADO: 'var(--ok-fill)', RETORNO: 'var(--neutral-fill)',
  DISPONIBLE: 'var(--ok-fill)', CERRADO: 'var(--neutral-fill)',
};

export const RESULTADOS = [
  'CONTROLADO', 'RESUELTO', 'FALSA_ALARMA', 'CANCELADO', 'DERIVADO', 'NO_ATENDIDO', 'SIN_ACCESO', 'SIN_INTERVENCION',
] as const;

export const NOMBRE_RESULTADO: Record<string, string> = {
  CONTROLADO: 'Controlado', RESUELTO: 'Resuelto', FALSA_ALARMA: 'Falsa alarma', CANCELADO: 'Cancelado',
  DERIVADO: 'Derivado', NO_ATENDIDO: 'No atendido', SIN_ACCESO: 'Sin acceso', SIN_INTERVENCION: 'Sin intervención',
};

export const NOMBRE_PRIORIDAD: Record<string, string> = { LEVE: 'Baja', MODERADA: 'Media', GRAVE: 'Alta', CRITICA: 'Crítica' };
export const FONDO_PRIORIDAD: Record<string, string> = {
  LEVE: 'var(--neutral-fill)', MODERADA: 'var(--info-fill)', GRAVE: 'var(--warn-fill)', CRITICA: 'var(--bad-fill)',
};

export const BOTON_PASO: Record<Paso, string> = { salida: 'SALIMOS', llegada: 'LLEGAMOS', retorno: 'RETORNANDO', disponible: 'DISPONIBLE' };

export const NOMBRE_ESTADO_PEDIDO: Record<string, string> = {
  SOLICITADO: 'Solicitado', APROBADO: 'Aprobado', DESPACHADO: 'Despachado', EN_CAMINO: 'En camino',
  EN_USO: 'En uso', LIBERADO: 'Liberado', RECHAZADO: 'Rechazado', CANCELADO: 'Cancelado',
};

export const NOMBRE_CATEGORIA_FOTO: Record<string, string> = {
  DANO: 'Daño', VICTIMA: 'Víctima', RIESGO: 'Riesgo', VEHICULO: 'Vehículo',
  ESTRUCTURA: 'Estructura', EQUIPAMIENTO: 'Equipamiento', EVIDENCIA: 'Evidencia', OTRO: 'Otro',
};

export const NOMBRE_VICTIMA: Record<string, string> = { RESCATADA: 'Rescatadas', HERIDA: 'Heridas', FALLECIDA: 'Fallecidas', EVACUADA: 'Evacuadas' };

const CICLO_PEDIDO = ['SOLICITADO', 'APROBADO', 'DESPACHADO', 'EN_CAMINO', 'EN_USO', 'LIBERADO'];
const FINALES_PEDIDO = ['LIBERADO', 'RECHAZADO', 'CANCELADO'];

/** Estados a los que puede pasar un pedido (mismo criterio que validarEstadoRecurso del backend). */
export function siguientesEstadosPedido(actual: string): string[] {
  if (FINALES_PEDIDO.includes(actual)) return [];
  const i = CICLO_PEDIDO.indexOf(actual);
  return [...CICLO_PEDIDO.slice(i + 1), 'RECHAZADO', 'CANCELADO'];
}

export function minutosTexto(min: number | null): string {
  if (min === null) return '—';
  if (min < 60) return `${min} min`;
  return `${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')} min`;
}

export function transcurrido(desde: string | Date | null, ahora: Date = new Date()): string {
  if (!desde) return '—';
  return minutosTexto(Math.max(0, Math.floor((ahora.getTime() - new Date(desde).getTime()) / 60_000)));
}

export function horaCorta(valor: string | Date | null): string {
  return valor ? new Date(valor).toLocaleTimeString('es-PY', { hour: '2-digit', minute: '2-digit' }) : '—';
}
```

Crear `frontend/src/lib/cola-incidente.ts`:

```ts
/**
 * Cola de acciones del Modo Incidente cuando no hay red. Sin imports: lo prueba `node --test`.
 * Cada accion lleva su clave de idempotencia y la hora del hecho tomadas AL TOCAR; el servidor
 * acota esa hora y no repite una accion con la misma clave. Se envia en orden, de a una, y se
 * detiene en la primera que no pudo salir para no alterar la secuencia.
 */
export interface AccionPendiente {
  clave: string;
  metodo: 'POST' | 'PUT';
  ruta: string;
  cuerpo: Record<string, unknown>;
  descripcion: string;
  creadaEn: string;
  intentos: number;
}

export interface Almacen {
  leer(): string | null;
  escribir(valor: string): void;
}

export type Clasificacion = 'OK' | 'REPETIR' | 'DESCARTAR';

export function nuevaClave(): string {
  const c = globalThis.crypto;
  if (c && typeof c.randomUUID === 'function') return c.randomUUID();
  return `k-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

/** null = no hubo respuesta (sin red). */
export function clasificar(status: number | null): Clasificacion {
  if (status === null || status === 408 || status === 429 || status >= 500) return 'REPETIR';
  if (status >= 200 && status < 300) return 'OK';
  return 'DESCARTAR';
}

function esAccion(x: unknown): x is AccionPendiente {
  if (!x || typeof x !== 'object') return false;
  const a = x as Record<string, unknown>;
  return typeof a.clave === 'string' && typeof a.ruta === 'string' && (a.metodo === 'POST' || a.metodo === 'PUT')
    && !!a.cuerpo && typeof a.cuerpo === 'object' && typeof a.descripcion === 'string' && typeof a.intentos === 'number';
}

export function leerCola(almacen: Almacen): AccionPendiente[] {
  try {
    const valor = almacen.leer();
    const lista = valor ? (JSON.parse(valor) as unknown) : [];
    return Array.isArray(lista) ? lista.filter(esAccion) : [];
  } catch {
    return [];
  }
}

export function encolar(almacen: Almacen, accion: Omit<AccionPendiente, 'intentos'>): AccionPendiente[] {
  const lista = leerCola(almacen).filter((x) => x.clave !== accion.clave);
  lista.push({ ...accion, intentos: 0 });
  almacen.escribir(JSON.stringify(lista));
  return lista;
}

export async function vaciarCola(
  almacen: Almacen,
  enviar: (accion: AccionPendiente) => Promise<number | null>,
): Promise<{ enviadas: number; descartadas: AccionPendiente[]; pendientes: number }> {
  const lista = leerCola(almacen);
  const descartadas: AccionPendiente[] = [];
  let enviadas = 0;
  let i = 0;
  for (; i < lista.length; i += 1) {
    const r = clasificar(await enviar(lista[i]));
    if (r === 'REPETIR') {
      lista[i] = { ...lista[i], intentos: lista[i].intentos + 1 };
      break;
    }
    if (r === 'OK') enviadas += 1;
    else descartadas.push(lista[i]);
  }
  const quedan = lista.slice(i);
  almacen.escribir(JSON.stringify(quedan));
  return { enviadas, descartadas, pendientes: quedan.length };
}
```

- [ ] **Paso 4: Correr las pruebas para ver que pasan**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npm test 2>&1 | tail -8
```

Resultado esperado: `# pass` con todos los casos (los 9 previos de `seccion-url` más los nuevos) y `# fail 0`.

- [ ] **Paso 5: Cliente de la API y gancho de la cronología**

Crear `frontend/src/lib/incidentes.ts`:

```ts
import { apiFetch } from './api';
import { clasificar, encolar, leerCola, nuevaClave, vaciarCola, type AccionPendiente, type Almacen } from './cola-incidente';
import type { Fase, Paso } from './fases-incidente';

export type Prioridad = 'LEVE' | 'MODERADA' | 'GRAVE' | 'CRITICA';
export type Resultado = 'CONTROLADO' | 'RESUELTO' | 'FALSA_ALARMA' | 'CANCELADO' | 'DERIVADO' | 'NO_ATENDIDO' | 'SIN_ACCESO' | 'SIN_INTERVENCION';
export type EstadoPedido = 'SOLICITADO' | 'APROBADO' | 'DESPACHADO' | 'EN_CAMINO' | 'EN_USO' | 'LIBERADO' | 'RECHAZADO' | 'CANCELADO';
export type CategoriaVictima = 'RESCATADA' | 'HERIDA' | 'FALLECIDA' | 'EVACUADA';
export type AccionFase = 'EVALUACION' | 'OPERANDO' | 'CONTROLADO' | 'REACTIVADO';

export interface Gps { latitud: number; longitud: number; precisionM?: number | null }
export interface Integrante { bomberoId: string; funcion: string }

export interface Catalogos {
  bomberos: Array<{ id: string; nombre: string }>;
  tiposServicio: Array<{ id: string; codigo: string; nombre: string }>;
  condiciones: Array<{ codigo: string; nombre: string; grupo: 'SITUACION' | 'RIESGO'; critica: boolean; grupoExcluyente: string | null }>;
  tiposRecurso: Array<{ id: string; codigo: string; nombre: string; categoria: string }>;
  funciones: Array<{ codigo: string; nombre: string }>;
  prioridades: Array<{ codigo: Prioridad; nombre: string }>;
}

export interface AlertaTablero { nivel: 'CRITICA' | 'ALTA' | 'MEDIA' | 'INFO'; tipo: string; servicioId: string | null; texto: string }

export interface IncidenteTablero {
  id: string; numeroServicio: string; tipo: string; fase: Fase; faseDesde: string | null; prioridad: Prioridad | null;
  direccion: string; latitud: number | null; longitud: number | null; recibidoEn: string; moviles: number;
  condicionesCriticas: string[]; emergencia: boolean; pedidosPendientes: number; personalEnZona: number;
}

export interface Tablero {
  generadoEn: string;
  incidentes: IncidenteTablero[];
  porFase: Partial<Record<Fase, number>>;
  cerradosHoy: { total: number; falsasAlarmas: number; cancelados: number };
  moviles: { disponibles: number; despachados: number; enServicio: number; regresando: number; fueraDeServicio: number };
  bomberos: { disponibles: number; enCamino: number; enServicio: number; noDisponibles: number };
  alertas: AlertaTablero[];
}

export interface IncidenteActivo { id: string; numeroServicio: string; tipo: string; fase: Fase; prioridad: Prioridad | null; direccion: string; recibidoEn: string }

export interface DespachoIncidente {
  id: string; vehiculoId: string; movil: string; alias: string | null; estado: string; activo: boolean; siguientePaso: Paso | null;
  horaDespacho: string; horaSalida: string | null; horaLlegada: string | null; horaFin: string | null; horaRegreso: string | null;
  tripulacion: Array<{ bomberoId: string; nombre: string; rol: string; funcion: string | null; enZona: boolean; zonaDesde: string | null }>;
}

export interface PedidoRecurso {
  id: string; tipoRecurso: string; categoria: string; cantidad: number; prioridad: 'NORMAL' | 'URGENTE';
  estado: EstadoPedido; observacion: string | null; solicitadoEn: string; version: number;
}

export interface Expediente {
  incidente: {
    id: string; numeroServicio: string; tipo: { id: string; codigo: string; nombre: string } | null; fase: Fase;
    faseDesde: string | null; resultado: Resultado | null; estado: string; prioridad: Prioridad | null; prioridadNombre: string | null;
    direccion: string; ciudad: string | null; latitud: number | null; longitud: number | null; descripcion: string | null;
    recibidoEn: string; finalizadoEn: string | null; observaciones: string | null;
    comandante: { bomberoId: string; nombre: string } | null;
  };
  llamados: Array<{ id: string; recibidoEn: string; medio: string; solicitante: string | null; telefono: string | null; estado: string }>;
  despachos: DespachoIncidente[];
  participantes: Array<{ usuarioId: string; nombre: string; estado: string }>;
  condiciones: Array<{ codigo: string; nombre: string; grupo: string; critica: boolean }>;
  solicitudes: PedidoRecurso[];
  victimas: Record<CategoriaVictima, number>;
  fotos: Array<{ id: string; categoria: string | null; tomadoEn: string; descripcion: string | null; latitud: number | null; longitud: number | null }>;
  emergenciaActiva: boolean;
  personalEnZona: Array<{ bomberoId: string; nombre: string; desde: string | null }>;
  ultimoRecuento: { ocurridoEn: string; presentes: number; faltantes: string[] } | null;
  fotosOcultas: number;
  miDespachoId: string | null;
  ultimoEventoId: string | null;
}

export interface EventoIncidente {
  id: string; tipo: string; titulo: string; ocurridoEn: string; registradoEn: string; usuario: string | null;
  vehiculoId: string | null; despachoId: string | null; latitud: number | null; longitud: number | null;
  faseAnterior: Fase | null; faseNueva: Fase | null; critico: boolean; origen: string; datos: Record<string, unknown> | null;
}

export interface Informe extends Expediente {
  condicionesRegistradas: string[];
  tiempos: Record<'recepcion' | 'primerDespacho' | 'primeraSalida' | 'primeraLlegada' | 'controlado' | 'disponible' | 'cierre', string | null>;
  duraciones: Record<'despachoMin' | 'salidaMin' | 'viajeMin' | 'respuestaMin' | 'controlMin' | 'totalMin', number | null>;
  distanciaCuartelM: number | null;
  cronologia: EventoIncidente[];
  cierre: { huboVictimas: boolean; huboDanos: boolean } | null;
}

export interface Tripulaciones {
  moviles: Array<{
    vehiculoId: string; numeroInterno: string; alias: string | null; estado: string; estadoOperativo: string;
    tripulacion: Array<{ bomberoId: string; nombre: string; funcion: string; funcionNombre: string }>;
  }>;
  funciones: Array<{ codigo: string; nombre: string }>;
  bomberos: Array<{ id: string; nombre: string }>;
}

export interface ResultadoDespacho { vehiculoId: string; ok: boolean; despachoId: string | null; error: string | null }

export async function mensajeError(res: Response): Promise<string> {
  const cuerpo = (await res.json().catch(() => null)) as { message?: string | string[] } | null;
  const m = cuerpo?.message;
  return Array.isArray(m) ? m.join(' ') : (m ?? `Error ${res.status}`);
}

async function leer<T>(ruta: string): Promise<T> {
  const res = await apiFetch(ruta);
  if (!res.ok) throw new Error(await mensajeError(res));
  return (await res.json()) as T;
}

async function enviar<T>(metodo: 'POST' | 'PUT', ruta: string, cuerpo: unknown = {}): Promise<T> {
  const res = await apiFetch(ruta, { method: metodo, body: JSON.stringify(cuerpo) });
  if (!res.ok) throw new Error(await mensajeError(res));
  return (await res.json().catch(() => null)) as T;
}

// ---- lectura ----
export const obtenerTablero = () => leer<Tablero>('/incidentes/tablero');
export const obtenerCatalogos = () => leer<Catalogos>('/incidentes/catalogos');
export const listarActivos = () => leer<IncidenteActivo[]>('/incidentes/activos');
export const obtenerExpediente = (id: string) => leer<Expediente>(`/incidentes/${id}`);
export const obtenerCronologia = (id: string, desde?: string | null) =>
  leer<EventoIncidente[]>(`/incidentes/${id}/cronologia${desde ? `?desde=${encodeURIComponent(desde)}` : ''}`);
export const obtenerInforme = (id: string) => leer<Informe>(`/incidentes/${id}/informe`);
export const obtenerTripulaciones = () => leer<Tripulaciones>('/flota/tripulacion');
export interface GuardiaActual {
  guardias: Array<{ id: string; fecha: string; turno: string; horaInicio: string; horaFin: string }>;
  personal: Array<{ bomberoId: string; nombre: string; rol: string | null }>;
}
export const obtenerGuardiaActual = () => leer<GuardiaActual>('/flota/tripulacion/guardia-actual');

// ---- central y comando (necesitan red) ----
export interface DatosRecepcion {
  tipoServicioId: string; direccion: string; ciudad?: string; latitud?: number; longitud?: number;
  solicitante?: string; telefono?: string; descripcion?: string; prioridad?: string; medio?: string;
}
export const recibirServicio = (d: DatosRecepcion) =>
  enviar<{ servicioId: string; numeroServicio: string; llamadoId: string; repetido: boolean }>('POST', '/incidentes', { ...d, claveIdempotencia: nuevaClave() });
export const vincularLlamado = (id: string, d: { solicitante?: string; telefono?: string; descripcion?: string; medio?: string }) =>
  enviar<{ llamadoId: string }>('POST', `/incidentes/${id}/llamados`, d);
export const despacharMoviles = (id: string, moviles: Array<{ vehiculoId: string; salir: boolean; tripulacion?: Integrante[] }>) =>
  enviar<{ resultados: ResultadoDespacho[] }>('POST', `/incidentes/${id}/despachos`, { moviles });
export const ajustarTripulacion = (id: string, despachoId: string, integrantes: Integrante[]) =>
  enviar('PUT', `/incidentes/${id}/despachos/${despachoId}/tripulacion`, { integrantes });
/** Paso de un movil registrado por la central (por ejemplo, cuando el movil lo informa por radio). */
export const pasoMovilCentral = (id: string, despachoId: string, paso: Paso) =>
  enviar('POST', `/incidentes/${id}/despachos/${despachoId}/${paso}`, { claveIdempotencia: nuevaClave() });
export const cambiarFase = (id: string, accion: AccionFase) => enviar('POST', `/incidentes/${id}/fase`, { accion });
export const declararResultado = (id: string, resultado: Resultado) => enviar('POST', `/incidentes/${id}/resultado`, { resultado });
export const cambiarPrioridad = (id: string, prioridad: Prioridad) => enviar('POST', `/incidentes/${id}/prioridad`, { prioridad });
export const asumirComando = (id: string) => enviar('POST', `/incidentes/${id}/comando`);
export const actualizarPedido = (id: string, solicitudId: string, estado: EstadoPedido, version: number) =>
  enviar('POST', `/incidentes/${id}/solicitudes/${solicitudId}/estado`, { estado, version });
export const atenderEmergencia = (id: string) => enviar('POST', `/incidentes/${id}/emergencia/atendida`);
export interface DatosCierre {
  resultado: Resultado; huboVictimas: boolean; huboDanos: boolean; observaciones?: string;
  tripulacion?: Array<{ despachoId: string; integrantes: Integrante[] }>;
}
export const cerrarIncidente = (id: string, d: DatosCierre) => enviar('POST', `/incidentes/${id}/cierre`, d);
export const guardarTripulacion = (vehiculoId: string, integrantes: Integrante[]) =>
  enviar('PUT', `/flota/moviles/${vehiculoId}/tripulacion`, { integrantes });

// ---- campo: GPS, cola sin conexion ----
const CLAVE_COLA = 'sigbo-incidente-cola-v1';
const almacenLocal: Almacen = {
  leer: () => {
    try {
      return localStorage.getItem(CLAVE_COLA);
    } catch {
      return null;
    }
  },
  escribir: (valor) => {
    try {
      localStorage.setItem(CLAVE_COLA, valor);
    } catch {
      /* sin almacenamiento: la accion se pierde solo si ademas no hay red */
    }
  },
};

/** Posicion del celular. Nunca bloquea: si no hay fix en `espera` ms, devuelve null. */
export function obtenerGps(espera = 4000): Promise<Gps | null> {
  if (typeof navigator === 'undefined' || !navigator.geolocation) return Promise.resolve(null);
  return new Promise((resolve) => {
    let listo = false;
    const fin = (g: Gps | null) => {
      if (listo) return;
      listo = true;
      resolve(g);
    };
    const reloj = setTimeout(() => fin(null), espera);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        clearTimeout(reloj);
        fin({ latitud: p.coords.latitude, longitud: p.coords.longitude, precisionM: Math.round(p.coords.accuracy) });
      },
      () => {
        clearTimeout(reloj);
        fin(null);
      },
      { enableHighAccuracy: true, timeout: espera, maximumAge: 30_000 },
    );
  });
}

export type ResultadoAccion = { estado: 'ENVIADA'; datos: unknown } | { estado: 'ENCOLADA' };

/**
 * Accion de campo del Modo Incidente: toma hora, GPS y clave AL TOCAR, la envia y, si no hay red
 * (o el servidor no responde), la guarda para reintentar. Un rechazo del servidor (4xx) se informa.
 * Solo para endpoints cuyo DTO acepta ocurridoEn/gps/claveIdempotencia (AccionCampoDto).
 */
export async function accionCampo(ruta: string, cuerpo: Record<string, unknown>, descripcion: string, conGps = true): Promise<ResultadoAccion> {
  const gps = conGps ? await obtenerGps() : null;
  const clave = nuevaClave();
  const accion: Omit<AccionPendiente, 'intentos'> = {
    clave,
    metodo: 'POST',
    ruta,
    cuerpo: { ...cuerpo, ocurridoEn: new Date().toISOString(), claveIdempotencia: clave, ...(gps ? { gps } : {}) },
    descripcion,
    creadaEn: new Date().toISOString(),
  };
  let res: Response;
  try {
    res = await apiFetch(ruta, { method: 'POST', body: JSON.stringify(accion.cuerpo) });
  } catch {
    encolar(almacenLocal, accion);
    return { estado: 'ENCOLADA' };
  }
  if (res.ok) return { estado: 'ENVIADA', datos: await res.json().catch(() => null) };
  if (clasificar(res.status) === 'REPETIR') {
    encolar(almacenLocal, accion);
    return { estado: 'ENCOLADA' };
  }
  throw new Error(await mensajeError(res));
}

export const pendientes = () => leerCola(almacenLocal);

export function sincronizarPendientes() {
  return vaciarCola(almacenLocal, async (acc) => {
    try {
      const res = await apiFetch(acc.ruta, { method: acc.metodo, body: JSON.stringify(acc.cuerpo) });
      return res.status;
    } catch {
      return null;
    }
  });
}

/** FOTO del incidente: va al almacen de adjuntos con hora, GPS y categoria. Necesita red. */
export async function subirFoto(servicioId: string, archivo: File, categoria: string | null): Promise<void> {
  const gps = await obtenerGps();
  const datos = new FormData();
  datos.append('archivo', archivo);
  datos.append('entidad', 'SERVICIO');
  datos.append('entidadId', servicioId);
  datos.append('tipo', 'FOTO');
  datos.append('tomadoEn', new Date().toISOString());
  datos.append('claveIdempotencia', nuevaClave());
  if (categoria) datos.append('categoria', categoria);
  if (gps) {
    datos.append('latitud', String(gps.latitud));
    datos.append('longitud', String(gps.longitud));
  }
  const res = await apiFetch('/adjuntos', { method: 'POST', body: datos });
  if (!res.ok) throw new Error(await mensajeError(res));
}
```

Crear `frontend/src/lib/use-cronologia.ts`:

```ts
'use client';

import { useEffect, useRef, useState } from 'react';
import { obtenerCronologia, type EventoIncidente } from './incidentes';

/** Cronologia en vivo: trae solo lo nuevo (?desde=<ultimo id>) cada `intervaloMs`. */
export function useCronologia(servicioId: string | null, intervaloMs = 4000): EventoIncidente[] {
  const [eventos, setEventos] = useState<EventoIncidente[]>([]);
  const ultimo = useRef<string | null>(null);

  useEffect(() => {
    if (!servicioId) return;
    let vivo = true;
    ultimo.current = null;
    setEventos([]);
    const traer = async () => {
      try {
        const nuevos = await obtenerCronologia(servicioId, ultimo.current);
        if (!vivo || nuevos.length === 0) return;
        ultimo.current = nuevos[nuevos.length - 1].id;
        setEventos((previos) => [...previos, ...nuevos]);
      } catch {
        /* la proxima vuelta reintenta */
      }
    };
    void traer();
    const reloj = setInterval(() => void traer(), intervaloMs);
    return () => {
      vivo = false;
      clearInterval(reloj);
    };
  }, [servicioId, intervaloMs]);

  return eventos;
}
```

- [ ] **Paso 6: Verificar tipos y pruebas**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npx tsc --noEmit 2>&1 | head -10 && npm test 2>&1 | tail -4
```

Resultado esperado: `tsc` sin errores y las pruebas en verde.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/lib/fases-incidente.ts frontend/src/lib/cola-incidente.ts frontend/src/lib/incidentes.ts frontend/src/lib/use-cronologia.ts frontend/scripts/pruebas frontend/package.json
git commit -m "Frontend de incidentes: etiquetas, cola sin conexión probada y cliente de la API

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 11: Mapa operativo y Centro de Operaciones

**Archivos:**

- Crear: `frontend/src/components/MapaOperativo.tsx`
- Crear: `frontend/src/app/dashboard/servicios/operaciones/page.tsx`
- Modificar: `frontend/src/app/dashboard/servicios/layout.tsx` (TABS), `frontend/src/app/globals.css` (bloque "Centro de operaciones")
- Regenerar: `frontend/src/lib/pantallas.generado.ts` (`npm run generar:pantallas`)

**Interfaces:**

- Consume: `obtenerTablero`, `obtenerCatalogos`, `recibirServicio`, `vincularLlamado` y sus tipos (tarea 10); `cargarPosiciones` (`lib/flota`); `cargarHidrantes` y `cargarPuntosRiesgo` (`lib/cartografia`); `MEDIOS_LLAMADO` (`lib/llamados`).
- Produce: `MapaOperativo`, exportado por defecto, con las props `{ incidentes: PuntoIncidente[]; moviles?: PuntoMovil[]; fijos?: PuntoFijo[]; elegido?: { latitud; longitud } | null; alSeleccionarIncidente?: (id) => void; alElegirPunto?: (lat, lon) => void; alto?: number; etiqueta?: string }`, y los tipos `PuntoIncidente`, `PuntoMovil` y `PuntoFijo`.
- Clases CSS nuevas: `.operaciones-columnas`, `.op-resumen`, `.op-datos`, `.op-dato`, `.op-dato-valor`, `.op-dato-titulo`, `.op-subtitulo`, `.op-tarjeta`, `.op-opcion` y `.op-campos`.

El frontend no tiene pruebas de componentes. La verificación de esta tarea es `tsc`, las dos auditorías y la
revisión manual del paso 6.

- [ ] **Paso 1: Componente del mapa**

Crear `frontend/src/components/MapaOperativo.tsx`:

```tsx
'use client';

import { useEffect, useRef } from 'react';
import type { LayerGroup, Map as LeafletMap } from 'leaflet';

export interface PuntoIncidente { id: string; latitud: number | null; longitud: number | null; critico: boolean; texto: string }
export interface PuntoMovil { id: string; latitud: number; longitud: number; texto: string; enIncidente: boolean }
export interface PuntoFijo { latitud: number; longitud: number; texto: string; tipo: 'HIDRANTE' | 'RIESGO' }

/** Relleno de marcadores: es cartografia, no texto (la regla de tokens aplica al texto). */
const RELLENO = {
  critico: '#b91c1c', incidente: '#d9822b', movil: '#2f6fdb', movilLibre: '#1f8a5b',
  hidrante: '#31a8b8', riesgo: '#7c3aed', elegido: '#10263f',
};

/** Mapa del Centro de Operaciones: Leaflet + OpenStreetMap (libre, sin clave). Solo dibuja. */
export default function MapaOperativo({
  incidentes, moviles = [], fijos = [], elegido = null, alSeleccionarIncidente, alElegirPunto, alto = 420, etiqueta = 'Mapa operativo',
}: {
  incidentes: PuntoIncidente[];
  moviles?: PuntoMovil[];
  fijos?: PuntoFijo[];
  elegido?: { latitud: number; longitud: number } | null;
  alSeleccionarIncidente?: (id: string) => void;
  alElegirPunto?: (latitud: number, longitud: number) => void;
  alto?: number;
  etiqueta?: string;
}) {
  const contenedor = useRef<HTMLDivElement>(null);
  const mapaRef = useRef<LeafletMap | null>(null);
  const capaRef = useRef<LayerGroup | null>(null);
  const encuadrado = useRef(false);
  const seleccionar = useRef(alSeleccionarIncidente);
  const elegir = useRef(alElegirPunto);
  seleccionar.current = alSeleccionarIncidente;
  elegir.current = alElegirPunto;

  useEffect(() => {
    let cancelado = false;
    import('leaflet').then((L) => {
      if (cancelado || !contenedor.current || mapaRef.current) return;
      const mapa = L.map(contenedor.current).setView([-25.3, -57.6], 12);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(mapa);
      mapa.on('click', (e) => elegir.current?.(e.latlng.lat, e.latlng.lng));
      capaRef.current = L.layerGroup().addTo(mapa);
      mapaRef.current = mapa;
      mapa.fire('moveend');
    });
    return () => {
      cancelado = true;
      mapaRef.current?.remove();
      mapaRef.current = null;
      capaRef.current = null;
      encuadrado.current = false;
    };
  }, []);

  useEffect(() => {
    let cancelado = false;
    const dibujar = () => {
      import('leaflet').then((L) => {
        const mapa = mapaRef.current;
        const capa = capaRef.current;
        if (cancelado || !mapa || !capa) return;
        capa.clearLayers();
        const puntos: Array<[number, number]> = [];
        for (const f of fijos) {
          L.circleMarker([f.latitud, f.longitud], { radius: 5, color: '#ffffff', weight: 1, fillColor: f.tipo === 'HIDRANTE' ? RELLENO.hidrante : RELLENO.riesgo, fillOpacity: 0.85 })
            .bindTooltip(f.texto)
            .addTo(capa);
        }
        for (const m of moviles) {
          L.circleMarker([m.latitud, m.longitud], { radius: 8, color: '#ffffff', weight: 2, fillColor: m.enIncidente ? RELLENO.movil : RELLENO.movilLibre, fillOpacity: 0.95 })
            .bindTooltip(m.texto)
            .addTo(capa);
          puntos.push([m.latitud, m.longitud]);
        }
        for (const i of incidentes) {
          if (i.latitud === null || i.longitud === null) continue;
          const marca = L.circleMarker([i.latitud, i.longitud], { radius: 13, color: '#ffffff', weight: 3, fillColor: i.critico ? RELLENO.critico : RELLENO.incidente, fillOpacity: 0.95 })
            .bindTooltip(i.texto)
            .addTo(capa);
          marca.on('click', () => seleccionar.current?.(i.id));
          puntos.push([i.latitud, i.longitud]);
        }
        if (elegido) {
          L.circleMarker([elegido.latitud, elegido.longitud], { radius: 10, color: '#ffffff', weight: 3, fillColor: RELLENO.elegido, fillOpacity: 1 })
            .bindTooltip('Ubicación del nuevo servicio')
            .addTo(capa);
        }
        if (!encuadrado.current && puntos.length > 0) {
          mapa.fitBounds(L.latLngBounds(puntos), { padding: [40, 40], maxZoom: 15 });
          encuadrado.current = true;
        }
      });
    };
    dibujar();
    const espera = setTimeout(dibujar, 600);
    return () => {
      cancelado = true;
      clearTimeout(espera);
    };
  }, [incidentes, moviles, fijos, elegido]);

  return <div ref={contenedor} role="region" aria-label={etiqueta} style={{ height: alto, borderRadius: 10, border: '1px solid var(--line)' }} />;
}
```

- [ ] **Paso 2: Estilos**

Al final de `frontend/src/app/globals.css` agregá:

```css
/* ---- Centro de operaciones (incidentes) ---- */
.operaciones-columnas { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: start; }
@media (max-width: 900px) { .operaciones-columnas { grid-template-columns: minmax(0, 1fr); } }
.op-resumen { display: grid; grid-template-columns: repeat(auto-fit, minmax(260px, 1fr)); gap: 12px; }
.op-subtitulo { font-size: 13px; text-transform: uppercase; letter-spacing: .04em; color: var(--muted); margin: 0 0 10px; }
.op-datos { display: flex; flex-wrap: wrap; gap: 10px; }
.op-dato { display: grid; min-width: 84px; padding: 8px 10px; background: var(--surface-soft); border: 1px solid var(--line-soft); border-radius: 10px; }
.op-dato-valor { font-size: 24px; font-weight: 800; color: var(--ink); line-height: 1.1; }
.op-dato-titulo { font-size: 12px; color: var(--muted); }
.op-tarjeta { display: grid; gap: 6px; padding: 12px 14px; color: var(--ink); text-decoration: none; background: var(--surface); border: 2px solid var(--line); border-radius: 12px; }
.op-tarjeta:hover { border-color: var(--cyan); }
.op-opcion { min-height: 44px; padding: 8px 14px; font-weight: 700; color: var(--ink); background: var(--surface); border: 2px solid var(--line); border-radius: 10px; cursor: pointer; }
.op-opcion[aria-pressed="true"] { color: #fff; background: var(--ink); border-color: var(--ink); }
.op-campos { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 12px; }
.op-campos label { display: block; margin-bottom: 4px; font-size: 12px; font-weight: 700; color: var(--ink); }
```

- [ ] **Paso 3: Pantalla del Centro de Operaciones**

Crear `frontend/src/app/dashboard/servicios/operaciones/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useId, useMemo, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { cargarHidrantes, cargarPuntosRiesgo } from '@/lib/cartografia';
import { cargarPosiciones, type PosicionMovil } from '@/lib/flota';
import { MEDIOS_LLAMADO } from '@/lib/llamados';
import { FONDO_FASE, FONDO_PRIORIDAD, NOMBRE_FASE, NOMBRE_PRIORIDAD, transcurrido, type Fase } from '@/lib/fases-incidente';
import {
  obtenerCatalogos, obtenerTablero, recibirServicio, vincularLlamado,
  type AlertaTablero, type Catalogos, type IncidenteTablero, type Tablero,
} from '@/lib/incidentes';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';
import type { PuntoFijo } from '@/components/MapaOperativo';

const MapaOperativo = dynamic(() => import('@/components/MapaOperativo'), { ssr: false });

const REFRESCO_MS = 5000;
const FONDO_ALERTA: Record<AlertaTablero['nivel'], string> = {
  CRITICA: 'var(--bad-fill)', ALTA: 'var(--warn-fill)', MEDIA: 'var(--info-fill)', INFO: 'var(--neutral-fill)',
};

/** Pitido corto (Web Audio, sin archivos) cuando aparece una alerta critica nueva. */
function pitido() {
  try {
    const Contexto = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Contexto) return;
    const ctx = new Contexto();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.frequency.value = 880;
    vol.gain.value = 0.15;
    osc.connect(vol);
    vol.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
    osc.onended = () => void ctx.close();
  } catch {
    /* sin audio */
  }
}

export default function CentroOperacionesPage() {
  const router = useRouter();
  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeVer = permisos.includes('servicios:ver');
  const puedeCrear = permisos.includes('servicios:crear');
  const verMapaFlota = permisos.includes('vehiculos:ver_mapa');
  const [tablero, setTablero] = useState<Tablero | null>(null);
  const [catalogos, setCatalogos] = useState<Catalogos | null>(null);
  const [posiciones, setPosiciones] = useState<PosicionMovil[]>([]);
  const [fijos, setFijos] = useState<PuntoFijo[]>([]);
  const [error, setError] = useState('');
  const [recibiendo, setRecibiendo] = useState(false);
  const [punto, setPunto] = useState<{ latitud: number; longitud: number } | null>(null);
  const criticasVistas = useRef<Set<string> | null>(null);

  const cargar = useCallback(async () => {
    try {
      const t = await obtenerTablero();
      setTablero(t);
      setError('');
      const criticas = t.alertas.filter((a) => a.nivel === 'CRITICA').map((a) => `${a.tipo}|${a.servicioId}|${a.texto}`);
      if (criticasVistas.current && criticas.some((c) => !criticasVistas.current!.has(c))) pitido();
      criticasVistas.current = new Set(criticas);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo consultar el tablero.');
    }
    if (verMapaFlota) cargarPosiciones().then(setPosiciones).catch(() => undefined);
  }, [verMapaFlota]);

  useEffect(() => {
    if (!puedeVer) return;
    obtenerCatalogos().then(setCatalogos).catch(() => undefined);
    Promise.all([cargarHidrantes().catch(() => []), cargarPuntosRiesgo().catch(() => [])]).then(([h, r]) => {
      setFijos([
        ...h.map((x) => ({ latitud: Number(x.latitud), longitud: Number(x.longitud), texto: `Hidrante ${x.codigo}`, tipo: 'HIDRANTE' as const })),
        ...r.map((x) => ({ latitud: Number(x.latitud), longitud: Number(x.longitud), texto: `Riesgo: ${x.nombre}`, tipo: 'RIESGO' as const })),
      ]);
    });
    void cargar();
    const reloj = setInterval(() => void cargar(), REFRESCO_MS);
    return () => clearInterval(reloj);
  }, [puedeVer, cargar]);

  const enIncidente = useMemo(() => new Set(posiciones.filter((p) => p.estadoOperativo !== 'EN_CUARTEL').map((p) => p.id)), [posiciones]);

  if (!puedeVer) return <Aviso tipo="error" texto="No tenés permiso para ver el Centro de Operaciones (servicios:ver)." />;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 style={{ fontSize: 22, margin: 0 }}>Centro de operaciones</h1>
          <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>
            Se actualiza cada 5 segundos{tablero ? ` · ${new Date(tablero.generadoEn).toLocaleTimeString('es-PY')}` : ''}
          </p>
        </div>
        {puedeCrear && (
          <button type="button" className="btn-primary" style={{ minHeight: 48, fontSize: 16 }} aria-expanded={recibiendo} onClick={() => setRecibiendo((v) => !v)}>
            {recibiendo ? 'Cerrar recepción' : '+ Nuevo servicio'}
          </button>
        )}
      </header>

      {error && <Aviso tipo="error" texto={error} />}

      {recibiendo && (catalogos ? (
        <PanelRecepcion
          catalogos={catalogos}
          activos={tablero?.incidentes ?? []}
          punto={punto}
          quitarPunto={() => setPunto(null)}
          alCrear={(id) => router.push(`/dashboard/servicios/operaciones/${id}`)}
          alVincular={() => { setRecibiendo(false); void cargar(); }}
        />
      ) : <Cargando texto="Cargando catálogos…" filas={2} />)}

      {!tablero ? <Cargando texto="Cargando el tablero…" /> : (
        <>
          <FranjaAlertas alertas={tablero.alertas} />
          <Contadores tablero={tablero} />
          <div className="operaciones-columnas">
            <section className="card" aria-labelledby="titulo-activos">
              <h2 id="titulo-activos" style={{ fontSize: 17, marginTop: 0 }}>Incidentes activos ({tablero.incidentes.length})</h2>
              {tablero.incidentes.length === 0 ? (
                <p style={{ color: 'var(--muted)' }}>No hay incidentes activos.</p>
              ) : (
                <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 10 }}>
                  {tablero.incidentes.map((i) => <li key={i.id}><TarjetaIncidente incidente={i} /></li>)}
                </ul>
              )}
            </section>
            <section className="card" aria-labelledby="titulo-mapa">
              <h2 id="titulo-mapa" style={{ fontSize: 17, marginTop: 0 }}>Mapa operativo</h2>
              {recibiendo && <p style={{ fontSize: 13, color: 'var(--muted)' }}>Tocá el mapa para marcar la ubicación del nuevo servicio.</p>}
              <MapaOperativo
                incidentes={tablero.incidentes.map((i) => ({
                  id: i.id, latitud: i.latitud, longitud: i.longitud, critico: i.emergencia || i.condicionesCriticas.length > 0,
                  texto: `${i.numeroServicio} · ${i.tipo} · ${NOMBRE_FASE[i.fase]}`,
                }))}
                moviles={posiciones.map((p) => ({
                  id: p.id, latitud: p.latitud, longitud: p.longitud, enIncidente: enIncidente.has(p.id),
                  texto: `Móvil ${p.numeroInterno}${p.alias ? ` · ${p.alias}` : ''} — ${p.estadoOperativo.replace('_', ' ').toLowerCase()}`,
                }))}
                fijos={fijos}
                elegido={recibiendo ? punto : null}
                alSeleccionarIncidente={(id) => router.push(`/dashboard/servicios/operaciones/${id}`)}
                alElegirPunto={recibiendo ? (latitud, longitud) => setPunto({ latitud, longitud }) : undefined}
              />
            </section>
          </div>
        </>
      )}
    </div>
  );
}

function FranjaAlertas({ alertas }: { alertas: AlertaTablero[] }) {
  if (alertas.length === 0) return <p className="card" style={{ margin: 0, color: 'var(--success)', fontWeight: 700 }}>Sin alertas.</p>;
  return (
    <section aria-label="Alertas" style={{ display: 'grid', gap: 6 }}>
      {alertas.map((a, n) => (
        <div
          key={`${a.tipo}-${a.servicioId ?? 'general'}-${n}`}
          role={a.nivel === 'CRITICA' ? 'alert' : undefined}
          style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '10px 14px',
            background: FONDO_ALERTA[a.nivel], border: '1px solid var(--line)', borderRadius: 10, color: 'var(--ink)',
            fontWeight: a.nivel === 'CRITICA' ? 800 : 600, fontSize: a.nivel === 'CRITICA' ? 15 : 13,
          }}
        >
          <span>{a.nivel === 'CRITICA' ? '⚠ ' : ''}{a.texto}</span>
          {a.servicioId && <Link href={`/dashboard/servicios/operaciones/${a.servicioId}`} style={{ color: 'var(--ink)', fontWeight: 800 }}>Abrir</Link>}
        </div>
      ))}
    </section>
  );
}

function Contadores({ tablero }: { tablero: Tablero }) {
  const fases = Object.entries(tablero.porFase).filter(([, n]) => (n ?? 0) > 0) as Array<[Fase, number]>;
  const dato = (titulo: string, valor: number, alerta = false) => (
    <div className="op-dato" key={titulo}>
      <span className="op-dato-valor" style={alerta ? { color: 'var(--danger)' } : undefined}>{valor}</span>
      <span className="op-dato-titulo">{titulo}</span>
    </div>
  );
  const { moviles: m, bomberos: b, cerradosHoy: c } = tablero;
  return (
    <section aria-label="Resumen" className="op-resumen">
      <div className="card">
        <h2 className="op-subtitulo">Incidentes</h2>
        <div className="op-datos">
          {dato('Activos', tablero.incidentes.length)}
          {fases.map(([f, n]) => dato(NOMBRE_FASE[f], n))}
          {dato('Cerrados hoy', c.total)}
          {dato('Falsas alarmas hoy', c.falsasAlarmas)}
          {dato('Cancelados hoy', c.cancelados)}
        </div>
      </div>
      <div className="card">
        <h2 className="op-subtitulo">Móviles</h2>
        <div className="op-datos">
          {dato('Disponibles', m.disponibles, m.disponibles === 0)}
          {dato('Despachados', m.despachados)}
          {dato('En incidente', m.enServicio)}
          {dato('Regresando', m.regresando)}
          {dato('Fuera de servicio', m.fueraDeServicio)}
        </div>
      </div>
      <div className="card">
        <h2 className="op-subtitulo">Bomberos</h2>
        <div className="op-datos">
          {dato('Disponibles', b.disponibles, b.disponibles === 0)}
          {dato('En camino', b.enCamino)}
          {dato('En incidente', b.enServicio)}
          {dato('No disponibles', b.noDisponibles)}
        </div>
      </div>
    </section>
  );
}

function TarjetaIncidente({ incidente: i }: { incidente: IncidenteTablero }) {
  const critico = i.emergencia || i.condicionesCriticas.length > 0;
  return (
    <Link href={`/dashboard/servicios/operaciones/${i.id}`} className="op-tarjeta" style={{ borderColor: critico ? 'var(--danger)' : undefined }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
        <strong>{i.numeroServicio} · {i.tipo}</strong>
        <span className="badge" style={{ background: FONDO_FASE[i.fase] }}>{NOMBRE_FASE[i.fase]}</span>
      </div>
      <span style={{ color: 'var(--muted)', fontSize: 13 }}>{i.direccion}</span>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {i.prioridad && <span className="badge" style={{ background: FONDO_PRIORIDAD[i.prioridad] }}>Prioridad {NOMBRE_PRIORIDAD[i.prioridad]}</span>}
        <span className="badge">{i.moviles} móvil(es)</span>
        <span className="badge">hace {transcurrido(i.recibidoEn)}</span>
        {i.pedidosPendientes > 0 && <span className="badge" style={{ background: 'var(--warn-fill)' }}>{i.pedidosPendientes} pedido(s)</span>}
        {i.emergencia && <span className="badge" style={{ background: 'var(--bad-fill)' }}>EMERGENCIA</span>}
        {i.condicionesCriticas.map((c) => <span key={c} className="badge" style={{ background: 'var(--bad-fill)' }}>{c}</span>)}
      </div>
    </Link>
  );
}

function PanelRecepcion({ catalogos, activos, punto, quitarPunto, alCrear, alVincular }: {
  catalogos: Catalogos;
  activos: IncidenteTablero[];
  punto: { latitud: number; longitud: number } | null;
  quitarPunto: () => void;
  alCrear: (id: string) => void;
  alVincular: () => void;
}) {
  const id = useId();
  const [tipo, setTipo] = useState('');
  const [direccion, setDireccion] = useState('');
  const [solicitante, setSolicitante] = useState('');
  const [telefono, setTelefono] = useState('');
  const [medio, setMedio] = useState(MEDIOS_LLAMADO.includes('Teléfono') ? 'Teléfono' : MEDIOS_LLAMADO[0]);
  const [descripcion, setDescripcion] = useState('');
  const [prioridad, setPrioridad] = useState('MODERADA');
  const [mismo, setMismo] = useState('');
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const enviar = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOcupado(true);
    try {
      if (mismo) {
        await vincularLlamado(mismo, { solicitante: solicitante.trim() || undefined, telefono: telefono.trim() || undefined, descripcion: descripcion.trim() || undefined, medio });
        alVincular();
        return;
      }
      if (!tipo) throw new Error('Elegí el tipo de emergencia.');
      if (direccion.trim().length < 3) throw new Error('Escribí la dirección.');
      const r = await recibirServicio({
        tipoServicioId: tipo, direccion: direccion.trim(), medio, prioridad,
        solicitante: solicitante.trim() || undefined, telefono: telefono.trim() || undefined, descripcion: descripcion.trim() || undefined,
        ...(punto ? { latitud: punto.latitud, longitud: punto.longitud } : {}),
      });
      alCrear(r.servicioId);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo registrar el servicio.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <form onSubmit={enviar} className="card" aria-labelledby={`${id}-titulo`} style={{ display: 'grid', gap: 14 }}>
      <h2 id={`${id}-titulo`} style={{ margin: 0, fontSize: 18 }}>Recepción del servicio</h2>
      {activos.length > 0 && (
        <div>
          <label htmlFor={`${id}-mismo`} style={{ display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 }}>¿Es otra llamada por un incidente activo?</label>
          <select id={`${id}-mismo`} className="input-field" value={mismo} onChange={(e) => setMismo(e.target.value)}>
            <option value="">No, es un servicio nuevo</option>
            {activos.map((a) => <option key={a.id} value={a.id}>{a.numeroServicio} · {a.tipo} · {a.direccion}</option>)}
          </select>
        </div>
      )}
      {!mismo && (
        <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
          <legend style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Tipo de emergencia *</legend>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {catalogos.tiposServicio.map((t) => (
              <button key={t.id} type="button" className="op-opcion" aria-pressed={tipo === t.id} onClick={() => setTipo(t.id)}>{t.nombre}</button>
            ))}
          </div>
        </fieldset>
      )}
      <div className="op-campos">
        {!mismo && (
          <div>
            <label htmlFor={`${id}-dir`}>Dirección *</label>
            <input id={`${id}-dir`} className="input-field" value={direccion} onChange={(e) => setDireccion(e.target.value)} maxLength={300} autoComplete="off" />
          </div>
        )}
        <div>
          <label htmlFor={`${id}-sol`}>Solicitante</label>
          <input id={`${id}-sol`} className="input-field" value={solicitante} onChange={(e) => setSolicitante(e.target.value)} maxLength={150} autoComplete="off" />
        </div>
        <div>
          <label htmlFor={`${id}-tel`}>Teléfono</label>
          <input id={`${id}-tel`} className="input-field" type="tel" value={telefono} onChange={(e) => setTelefono(e.target.value)} maxLength={40} autoComplete="off" />
        </div>
        <div>
          <label htmlFor={`${id}-medio`}>Medio</label>
          <input id={`${id}-medio`} className="input-field" list={`${id}-medios`} value={medio} onChange={(e) => setMedio(e.target.value)} maxLength={40} />
          <datalist id={`${id}-medios`}>{MEDIOS_LLAMADO.map((m) => <option key={m} value={m} />)}</datalist>
        </div>
      </div>
      <div className="op-campos">
        <div style={{ gridColumn: '1 / -1' }}>
          <label htmlFor={`${id}-desc`}>Descripción inicial</label>
          <textarea id={`${id}-desc`} className="input-field" rows={2} value={descripcion} onChange={(e) => setDescripcion(e.target.value)} maxLength={1000} />
        </div>
      </div>
      {!mismo && (
        <>
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontSize: 12, fontWeight: 700, marginBottom: 6 }}>Prioridad</legend>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {catalogos.prioridades.map((p) => (
                <button key={p.codigo} type="button" className="op-opcion" aria-pressed={prioridad === p.codigo} onClick={() => setPrioridad(p.codigo)}>{p.nombre}</button>
              ))}
            </div>
          </fieldset>
          <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {punto ? `Ubicación marcada: ${punto.latitud.toFixed(5)}, ${punto.longitud.toFixed(5)} ` : 'Ubicación en el mapa: opcional (la toma el primer móvil que llega). '}
            {punto && <button type="button" className="service-secondary" onClick={quitarPunto}>Quitar</button>}
          </p>
        </>
      )}
      {error && <Aviso tipo="error" texto={error} />}
      <button type="submit" className="btn-primary" disabled={ocupado} style={{ minHeight: 52, fontSize: 17 }}>
        {mismo ? 'Vincular la llamada' : 'Crear incidente'}
      </button>
    </form>
  );
}
```

- [ ] **Paso 4: Pestaña y catálogo de pantallas**

En `frontend/src/app/dashboard/servicios/layout.tsx`, agregá como **primer** elemento de `TABS`:

```ts
  { href: '/dashboard/servicios/operaciones', label: 'Centro de operaciones' },
```

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npm run generar:pantallas 2>&1 | tail -3 && grep -n "servicios/operaciones" src/lib/pantallas.generado.ts | head -3
```

Resultado esperado: aparece `/dashboard/servicios/operaciones` con nombre "Centro de operaciones".

- [ ] **Paso 5: Comprobaciones estáticas**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npx tsc --noEmit 2>&1 | head -10 && npm run audit:contraste 2>&1 | tail -3 && npm run audit:a11y 2>&1 | tail -3
cd .. && node scripts/verificar-endpoints.mjs 2>&1 | tail -5
```

Resultado esperado: sin errores de tipos, ambas auditorías en la línea base (no suben) y ninguna llamada
del frontend sin ruta en el backend. Si `cargarHidrantes` o `cargarPuntosRiesgo` tienen otros nombres
de campo (`codigo`, `nombre`, `latitud`, `longitud`), ajustá el mapeo a los de `src/lib/cartografia.ts`.

- [ ] **Paso 6: Revisión manual**

Con backend y frontend levantados, entrá con `admin`, abrí **Servicios → Centro de operaciones** y verificá:

- Cargan los contadores.
- **+ Nuevo servicio** crea un incidente con solo tipo y dirección, y lleva a su página (todavía vacía hasta la tarea 13).
- Al tocar el mapa con el panel abierto, queda marcado el punto.

Anotá el número del incidente de prueba para la tarea 24.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/components/MapaOperativo.tsx frontend/src/app/dashboard/servicios/operaciones/page.tsx frontend/src/app/dashboard/servicios/layout.tsx frontend/src/app/globals.css frontend/src/lib/pantallas.generado.ts
git commit -m "Centro de operaciones: tablero, alertas con aviso sonoro, recepción rápida y mapa operativo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 12: Editor de tripulación y pantalla de carga

**Archivos:**

- Crear: `frontend/src/components/EditorTripulacion.tsx`
- Crear: `frontend/src/app/dashboard/vehiculos/tripulacion/page.tsx`
- Modificar: `frontend/src/app/dashboard/vehiculos/layout.tsx` (TABS) y `frontend/src/lib/pantallas.generado.ts` (regenerado)

**Interfaces:**

- Consume: `obtenerTripulaciones`, `guardarTripulacion` y los tipos `Integrante` y `Tripulaciones` (tarea 10); `ComboBuscable` (`@/components/ComboBuscable`, exportación con nombre).
- Produce: el componente `EditorTripulacion`, con las props `{ integrantes: Integrante[]; bomberos: Array<{ id; nombre }>; funciones: Array<{ codigo; nombre }>; onChange: (lista) => void; deshabilitado?: boolean; grande?: boolean }`. Lo usan las tareas 13, 14 y 15.

- [ ] **Paso 1: Componente compartido**

Crear `frontend/src/components/EditorTripulacion.tsx`:

```tsx
'use client';

import { useId, useState } from 'react';
import { ComboBuscable } from '@/components/ComboBuscable';
import type { Integrante } from '@/lib/incidentes';

/**
 * Quien va en un movil y con que funcion. Una sola pieza para la carga al tomar la guardia,
 * el despacho, el Modo Incidente y el cierre: el dato es el mismo en los cuatro lugares.
 */
export function EditorTripulacion({ integrantes, bomberos, funciones, onChange, deshabilitado = false, grande = false }: {
  integrantes: Integrante[];
  bomberos: Array<{ id: string; nombre: string }>;
  funciones: Array<{ codigo: string; nombre: string }>;
  onChange: (lista: Integrante[]) => void;
  deshabilitado?: boolean;
  grande?: boolean;
}) {
  const id = useId();
  const [nuevo, setNuevo] = useState('');
  const [funcion, setFuncion] = useState(funciones[0]?.codigo ?? '');
  const nombre = new Map(bomberos.map((b) => [b.id, b.nombre]));
  const disponibles = bomberos.filter((b) => !integrantes.some((i) => i.bomberoId === b.id));
  const alto = grande ? 52 : 38;

  return (
    <div style={{ display: 'grid', gap: 8 }}>
      {integrantes.length === 0 ? (
        <p style={{ color: 'var(--muted)', margin: 0 }}>Sin tripulación cargada.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
          {integrantes.map((i, n) => (
            <li key={i.bomberoId} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ flex: '1 1 200px', fontWeight: 600, fontSize: grande ? 18 : 14 }}>{nombre.get(i.bomberoId) ?? 'Persona'}</span>
              <label htmlFor={`${id}-f-${n}`} className="sr-only">Función de {nombre.get(i.bomberoId) ?? 'la persona'}</label>
              <select
                id={`${id}-f-${n}`}
                className="input-field"
                style={{ width: 'auto', minHeight: alto }}
                value={i.funcion}
                disabled={deshabilitado}
                onChange={(e) => onChange(integrantes.map((x) => (x.bomberoId === i.bomberoId ? { ...x, funcion: e.target.value } : x)))}
              >
                {funciones.map((f) => <option key={f.codigo} value={f.codigo}>{f.nombre}</option>)}
              </select>
              {!deshabilitado && (
                <button type="button" className="service-secondary" style={{ minHeight: alto }} aria-label={`Quitar a ${nombre.get(i.bomberoId) ?? 'la persona'}`}
                  onClick={() => onChange(integrantes.filter((x) => x.bomberoId !== i.bomberoId))}>
                  Quitar
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
      {!deshabilitado && (
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <ComboBuscable
            ariaLabel="Persona para agregar a la tripulación"
            opciones={disponibles.map((b) => ({ value: b.id, label: b.nombre }))}
            value={nuevo}
            onChange={setNuevo}
            placeholderBusqueda="Buscar bombero…"
            ningunaLabel="Elegí una persona"
            maxWidth={320}
          />
          <label htmlFor={`${id}-nueva`} className="sr-only">Función de la persona a agregar</label>
          <select id={`${id}-nueva`} className="input-field" style={{ width: 'auto', minHeight: alto }} value={funcion} onChange={(e) => setFuncion(e.target.value)}>
            {funciones.map((f) => <option key={f.codigo} value={f.codigo}>{f.nombre}</option>)}
          </select>
          <button type="button" className="service-secondary" style={{ minHeight: alto }} disabled={!nuevo || !funcion}
            onClick={() => { onChange([...integrantes, { bomberoId: nuevo, funcion }]); setNuevo(''); }}>
            Agregar
          </button>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Paso 2: Pantalla de carga**

Crear `frontend/src/app/dashboard/vehiculos/tripulacion/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { obtenerSesion } from '@/lib/api';
import { guardarTripulacion, obtenerTripulaciones, type Integrante, type Tripulaciones } from '@/lib/incidentes';
import { EditorTripulacion } from '@/components/EditorTripulacion';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const NOMBRE_ESTADO: Record<string, string> = { OPERATIVO: 'Operativo', EN_MANTENIMIENTO: 'En mantenimiento', FUERA_SERVICIO: 'Fuera de servicio' };

export default function TripulacionPage() {
  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeEditar = permisos.includes('vehiculos:tripulacion');
  const [datos, setDatos] = useState<Tripulaciones | null>(null);
  const [borradores, setBorradores] = useState<Record<string, Integrante[]>>({});
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [guardando, setGuardando] = useState<string | null>(null);

  const cargar = useCallback(async () => {
    try {
      const d = await obtenerTripulaciones();
      setDatos(d);
      setBorradores(Object.fromEntries(d.moviles.map((m) => [m.vehiculoId, m.tripulacion.map((t) => ({ bomberoId: t.bomberoId, funcion: t.funcion }))])));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la tripulación.');
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  /** Donde esta guardada hoy cada persona (para avisar antes de que el servidor lo rechace). */
  const movilDe = useMemo(() => {
    const m = new Map<string, string>();
    datos?.moviles.forEach((x) => x.tripulacion.forEach((t) => m.set(t.bomberoId, x.vehiculoId)));
    return m;
  }, [datos]);

  const guardar = async (vehiculoId: string, numero: string) => {
    setGuardando(vehiculoId);
    setError('');
    setExito('');
    try {
      await guardarTripulacion(vehiculoId, borradores[vehiculoId] ?? []);
      setExito(`Tripulación del Móvil ${numero} guardada.`);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo guardar la tripulación.');
    } finally {
      setGuardando(null);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <header>
        <h1 style={{ fontSize: 22, margin: 0 }}>Tripulación por móvil</h1>
        <p style={{ color: 'var(--muted)', fontSize: 13, margin: '4px 0 0' }}>
          Se carga al tomar la guardia. Cada despacho la hereda; se corrige en la salida o al cerrar el incidente.
        </p>
      </header>
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}
      {!datos ? <Cargando texto="Cargando tripulaciones…" /> : datos.moviles.map((m) => {
        const borrador = borradores[m.vehiculoId] ?? [];
        const nombre = new Map(datos.bomberos.map((b) => [b.id, b.nombre]));
        const enOtro = borrador.filter((i) => movilDe.has(i.bomberoId) && movilDe.get(i.bomberoId) !== m.vehiculoId);
        return (
          <section key={m.vehiculoId} className="card" aria-labelledby={`movil-${m.vehiculoId}`} style={{ display: 'grid', gap: 10 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <h2 id={`movil-${m.vehiculoId}`} style={{ fontSize: 17, margin: 0 }}>Móvil {m.numeroInterno}{m.alias ? ` · ${m.alias}` : ''}</h2>
              <span className="badge" style={{ background: m.estado === 'OPERATIVO' ? 'var(--ok-fill)' : 'var(--bad-fill)' }}>{NOMBRE_ESTADO[m.estado] ?? m.estado}</span>
            </div>
            <EditorTripulacion
              integrantes={borrador}
              bomberos={datos.bomberos}
              funciones={datos.funciones}
              deshabilitado={!puedeEditar}
              onChange={(lista) => setBorradores((b) => ({ ...b, [m.vehiculoId]: lista }))}
            />
            {enOtro.length > 0 && (
              <Aviso tipo="error" texto={`Ya están en otro móvil: ${enOtro.map((i) => nombre.get(i.bomberoId) ?? 'una persona').join(', ')}. Quitalos de ese móvil y guardalo primero.`} />
            )}
            {puedeEditar && (
              <div>
                <button type="button" className="btn-primary" disabled={guardando === m.vehiculoId} onClick={() => void guardar(m.vehiculoId, m.numeroInterno)}>
                  {guardando === m.vehiculoId ? 'Guardando…' : 'Guardar tripulación'}
                </button>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}
```

- [ ] **Paso 3: Pestaña y comprobaciones**

En `frontend/src/app/dashboard/vehiculos/layout.tsx`, agregá a `TABS`, después de "Dotación y bitácora":

```ts
  { href: '/dashboard/vehiculos/tripulacion', label: 'Tripulación' },
```

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npm run generar:pantallas 2>&1 | tail -2 && npx tsc --noEmit 2>&1 | head -10 && npm run audit:a11y 2>&1 | tail -3 && npm run audit:contraste 2>&1 | tail -3
```

Resultado esperado: sin errores y auditorías en la línea base.

Revisión manual: en **Vehículos → Tripulación**, cargá la tripulación de dos móviles y guardala.
Probá a poner a la misma persona en dos móviles: debe salir el aviso y el servidor debe rechazarlo con el
nombre del otro móvil.

- [ ] **Paso 4: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/components/EditorTripulacion.tsx frontend/src/app/dashboard/vehiculos/tripulacion frontend/src/app/dashboard/vehiculos/layout.tsx frontend/src/lib/pantallas.generado.ts
git commit -m "Tripulación por móvil: editor compartido y pantalla de carga al tomar la guardia

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 13: Pantalla del incidente (central y comando)

**Archivos:**

- Crear: `frontend/src/components/incidente/CronologiaIncidente.tsx`, `DespachoRapido.tsx`, `PedidosRecurso.tsx`
- Crear: `frontend/src/app/dashboard/servicios/operaciones/[id]/page.tsx`

**Interfaces:**

- Consume: de la tarea 10, las funciones de `lib/incidentes.ts`, `useCronologia` y las etiquetas de `lib/fases-incidente.ts`; `EditorTripulacion` (tarea 12); `cargarTablero`, `MovilTablero` y `cancelarDespacho` (`lib/flota.ts`); `useConfirmacion` (`ConfirmProvider`) y `useEntradaConfirmada` (`InputProvider`, montado en el layout raíz).
- Produce:
  - `CronologiaIncidente({ eventos, recientesPrimero?, limite?, grande? })`, que reutilizan las tareas 14 y 15.
  - `DespachoRapido({ servicioId, alDespachar })` y `PedidosRecurso({ servicioId, pedidos, puedeGestionar, alCambiar })`.

- [ ] **Paso 1: Componentes**

Crear `frontend/src/components/incidente/CronologiaIncidente.tsx`:

```tsx
'use client';

import { horaCorta, NOMBRE_FASE } from '@/lib/fases-incidente';
import type { EventoIncidente } from '@/lib/incidentes';

/** Linea de tiempo del incidente. Lo critico va sobre tinte rojo; cada fila dice quien y si trajo GPS. */
export function CronologiaIncidente({ eventos, recientesPrimero = true, limite, grande = false }: {
  eventos: EventoIncidente[];
  recientesPrimero?: boolean;
  limite?: number;
  grande?: boolean;
}) {
  const ordenados = recientesPrimero ? [...eventos].reverse() : eventos;
  const visibles = limite ? ordenados.slice(0, limite) : ordenados;
  if (visibles.length === 0) return <p style={{ color: 'var(--muted)', margin: 0 }}>Todavía no hay eventos.</p>;
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 6 }}>
      {visibles.map((e) => (
        <li key={e.id} style={{
          display: 'grid', gridTemplateColumns: 'auto 1fr', gap: 10, padding: '8px 10px', borderRadius: 8,
          background: e.critico ? 'var(--bad-fill)' : 'var(--surface-soft)', border: '1px solid var(--line-soft)', fontSize: grande ? 17 : 13,
        }}>
          <time dateTime={e.ocurridoEn} style={{ fontWeight: 800, color: 'var(--ink)', fontVariantNumeric: 'tabular-nums' }}>{horaCorta(e.ocurridoEn)}</time>
          <span style={{ color: 'var(--ink)' }}>
            {e.titulo}
            {e.faseNueva && <span className="badge" style={{ marginLeft: 6 }}>{NOMBRE_FASE[e.faseNueva]}</span>}
            {(e.usuario || e.latitud !== null) && (
              <span style={{ display: 'block', color: 'var(--muted)', fontSize: grande ? 14 : 12 }}>
                {e.usuario ?? 'Sistema'}{e.latitud !== null ? ' · con GPS' : ''}{e.origen === 'APP' ? ' · desde la app' : ''}
              </span>
            )}
          </span>
        </li>
      ))}
    </ol>
  );
}
```

Crear `frontend/src/components/incidente/DespachoRapido.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useState } from 'react';
import { cargarTablero, type MovilTablero } from '@/lib/flota';
import { despacharMoviles, obtenerTripulaciones, type Integrante, type ResultadoDespacho, type Tripulaciones } from '@/lib/incidentes';
import { EditorTripulacion } from '@/components/EditorTripulacion';
import { Aviso } from '@/app/components/Aviso';

/** Despacho de uno o varios moviles disponibles, con la tripulacion heredada a la vista y editable. */
export function DespachoRapido({ servicioId, alDespachar }: { servicioId: string; alDespachar: () => void }) {
  const [moviles, setMoviles] = useState<MovilTablero[] | null>(null);
  const [trip, setTrip] = useState<Tripulaciones | null>(null);
  const [elegidos, setElegidos] = useState<string[]>([]);
  const [editados, setEditados] = useState<Record<string, Integrante[]>>({});
  const [editando, setEditando] = useState<string | null>(null);
  const [resultados, setResultados] = useState<ResultadoDespacho[]>([]);
  const [error, setError] = useState('');
  const [ocupado, setOcupado] = useState(false);

  const cargar = useCallback(async () => {
    try {
      const [t, tr] = await Promise.all([cargarTablero(), obtenerTripulaciones()]);
      setMoviles(t);
      setTrip(tr);
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar la flota.');
    }
  }, []);

  useEffect(() => { void cargar(); }, [cargar]);

  const disponibles = (moviles ?? []).filter((m) => m.estado === 'OPERATIVO' && m.estadoOperativo === 'EN_CUARTEL');
  const nombre = new Map((trip?.bomberos ?? []).map((b) => [b.id, b.nombre]));
  const funcionNombre = new Map((trip?.funciones ?? []).map((f) => [f.codigo, f.nombre]));
  const tripulacionDe = (vehiculoId: string): Integrante[] =>
    editados[vehiculoId] ?? trip?.moviles.find((m) => m.vehiculoId === vehiculoId)?.tripulacion.map((t) => ({ bomberoId: t.bomberoId, funcion: t.funcion })) ?? [];
  const numero = (vehiculoId: string) => moviles?.find((m) => m.id === vehiculoId)?.numeroInterno ?? '?';

  const despachar = async (salir: boolean) => {
    if (elegidos.length === 0) return;
    setOcupado(true);
    setError('');
    setResultados([]);
    try {
      const r = await despacharMoviles(servicioId, elegidos.map((vehiculoId) => ({
        vehiculoId, salir, ...(editados[vehiculoId] ? { tripulacion: editados[vehiculoId] } : {}),
      })));
      setResultados(r.resultados);
      setElegidos(r.resultados.filter((x) => !x.ok).map((x) => x.vehiculoId));
      setEditados({});
      setEditando(null);
      await cargar();
      alDespachar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo despachar.');
    } finally {
      setOcupado(false);
    }
  };

  return (
    <section className="card" aria-labelledby="titulo-despacho" style={{ display: 'grid', gap: 12 }}>
      <h2 id="titulo-despacho" style={{ fontSize: 17, margin: 0 }}>Despacho rápido</h2>
      {error && <Aviso tipo="error" texto={error} />}
      {moviles === null ? (
        <p style={{ color: 'var(--muted)', margin: 0 }}>Cargando móviles…</p>
      ) : disponibles.length === 0 ? (
        <p style={{ color: 'var(--danger)', fontWeight: 700, margin: 0 }}>No hay móviles disponibles en el cuartel.</p>
      ) : (
        <ul style={{ listStyle: 'none', margin: 0, padding: 0, display: 'grid', gap: 8 }}>
          {disponibles.map((m) => {
            const marcado = elegidos.includes(m.id);
            const gente = tripulacionDe(m.id);
            return (
              <li key={m.id} style={{ display: 'grid', gap: 8, padding: 10, borderRadius: 10, border: `2px solid ${marcado ? 'var(--ink)' : 'var(--line)'}` }}>
                <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
                  <button type="button" className="op-opcion" aria-pressed={marcado}
                    onClick={() => setElegidos((l) => (marcado ? l.filter((x) => x !== m.id) : [...l, m.id]))}>
                    Móvil {m.numeroInterno}{m.alias ? ` · ${m.alias}` : ''}
                  </button>
                  <span style={{ fontSize: 13, color: gente.length ? 'var(--ink)' : 'var(--danger)', flex: '1 1 200px' }}>
                    {gente.length ? gente.map((g) => `${nombre.get(g.bomberoId) ?? 'Persona'} (${funcionNombre.get(g.funcion) ?? g.funcion})`).join(' · ') : 'Sin tripulación cargada'}
                  </span>
                  {trip && (
                    <button type="button" className="service-secondary" aria-expanded={editando === m.id} onClick={() => setEditando(editando === m.id ? null : m.id)}>
                      {editando === m.id ? 'Listo' : 'Editar tripulación'}
                    </button>
                  )}
                </div>
                {editando === m.id && trip && (
                  <EditorTripulacion integrantes={gente} bomberos={trip.bomberos} funciones={trip.funciones}
                    onChange={(lista) => setEditados((e) => ({ ...e, [m.id]: lista }))} />
                )}
              </li>
            );
          })}
        </ul>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <button type="button" className="btn-primary" style={{ minHeight: 48 }} disabled={ocupado || elegidos.length === 0} onClick={() => void despachar(true)}>
          Asignar y salir ({elegidos.length})
        </button>
        <button type="button" className="service-secondary" style={{ minHeight: 48 }} disabled={ocupado || elegidos.length === 0} onClick={() => void despachar(false)}>
          Solo asignar ({elegidos.length})
        </button>
      </div>
      {resultados.length > 0 && (
        <ul style={{ margin: 0, paddingLeft: 18 }} aria-live="polite">
          {resultados.map((r) => (
            <li key={r.vehiculoId} style={{ color: r.ok ? 'var(--success)' : 'var(--danger)', fontWeight: 700 }}>
              Móvil {numero(r.vehiculoId)}: {r.ok ? 'despachado' : r.error}
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
```

Crear `frontend/src/components/incidente/PedidosRecurso.tsx`:

```tsx
'use client';

import { useId, useState } from 'react';
import { horaCorta, NOMBRE_ESTADO_PEDIDO, siguientesEstadosPedido } from '@/lib/fases-incidente';
import { actualizarPedido, type EstadoPedido, type PedidoRecurso } from '@/lib/incidentes';
import { Aviso } from '@/app/components/Aviso';

/** Pedidos de recurso del incidente con su ciclo: solicitado → aprobado → … → liberado. */
export function PedidosRecurso({ servicioId, pedidos, puedeGestionar, alCambiar }: {
  servicioId: string;
  pedidos: PedidoRecurso[];
  puedeGestionar: boolean;
  alCambiar: () => void;
}) {
  const id = useId();
  const [eleccion, setEleccion] = useState<Record<string, string>>({});
  const [error, setError] = useState('');

  const aplicar = async (p: PedidoRecurso) => {
    const estado = eleccion[p.id];
    if (!estado) return;
    setError('');
    try {
      await actualizarPedido(servicioId, p.id, estado as EstadoPedido, p.version);
      setEleccion((e) => ({ ...e, [p.id]: '' }));
      alCambiar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo actualizar el pedido.');
    }
  };

  return (
    <section className="card" aria-labelledby={`${id}-t`} style={{ display: 'grid', gap: 10 }}>
      <h2 id={`${id}-t`} style={{ fontSize: 17, margin: 0 }}>Pedidos de recursos</h2>
      {error && <Aviso tipo="error" texto={error} />}
      {pedidos.length === 0 ? (
        <p style={{ color: 'var(--muted)', margin: 0 }}>Sin pedidos.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr>
              <th scope="col" style={{ textAlign: 'left' }}>Recurso</th>
              <th scope="col" style={{ textAlign: 'left' }}>Prioridad</th>
              <th scope="col" style={{ textAlign: 'left' }}>Estado</th>
              <th scope="col" style={{ textAlign: 'left' }}>Pedido</th>
              {puedeGestionar && <th scope="col" style={{ textAlign: 'left' }}>Cambiar a</th>}
            </tr>
          </thead>
          <tbody>
            {pedidos.map((p, n) => {
              const siguientes = siguientesEstadosPedido(p.estado);
              return (
                <tr key={p.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                  <td>{p.cantidad} × {p.tipoRecurso}{p.observacion && <div style={{ fontSize: 12, color: 'var(--muted)' }}>{p.observacion}</div>}</td>
                  <td><span className="badge" style={{ background: p.prioridad === 'URGENTE' ? 'var(--bad-fill)' : 'var(--neutral-fill)' }}>{p.prioridad === 'URGENTE' ? 'Urgente' : 'Normal'}</span></td>
                  <td>{NOMBRE_ESTADO_PEDIDO[p.estado] ?? p.estado}</td>
                  <td>{horaCorta(p.solicitadoEn)}</td>
                  {puedeGestionar && (
                    <td>
                      {siguientes.length === 0 ? '—' : (
                        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                          <label htmlFor={`${id}-e-${n}`} className="sr-only">Nuevo estado de {p.tipoRecurso}</label>
                          <select id={`${id}-e-${n}`} className="input-field" style={{ width: 'auto' }} value={eleccion[p.id] ?? ''}
                            onChange={(e) => setEleccion((x) => ({ ...x, [p.id]: e.target.value }))}>
                            <option value="">Elegí…</option>
                            {siguientes.map((s) => <option key={s} value={s}>{NOMBRE_ESTADO_PEDIDO[s]}</option>)}
                          </select>
                          <button type="button" className="service-secondary" disabled={!eleccion[p.id]} onClick={() => void aplicar(p)}>Aplicar</button>
                        </div>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
    </section>
  );
}
```

- [ ] **Paso 2: La pantalla**

Crear `frontend/src/app/dashboard/servicios/operaciones/[id]/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { cancelarDespacho } from '@/lib/flota';
import {
  BOTON_PASO, FONDO_FASE, FONDO_PRIORIDAD, horaCorta, NOMBRE_FASE, NOMBRE_PRIORIDAD, NOMBRE_RESULTADO, NOMBRE_VICTIMA, RESULTADOS, transcurrido,
} from '@/lib/fases-incidente';
import {
  asumirComando, atenderEmergencia, cambiarFase, cambiarPrioridad, declararResultado, obtenerExpediente, pasoMovilCentral,
  type AccionFase, type Expediente, type Prioridad, type Resultado,
} from '@/lib/incidentes';
import { useCronologia } from '@/lib/use-cronologia';
import { CronologiaIncidente } from '@/components/incidente/CronologiaIncidente';
import { DespachoRapido } from '@/components/incidente/DespachoRapido';
import { PedidosRecurso } from '@/components/incidente/PedidosRecurso';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { useEntradaConfirmada } from '@/app/components/InputProvider';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const REFRESCO_MS = 5000;
const etiqueta = { display: 'block', fontSize: 12, fontWeight: 700, marginBottom: 4 } as const;

export default function IncidentePage() {
  const { id } = useParams<{ id: string }>();
  const idForm = useId();
  const confirmar = useConfirmacion();
  const pedirTexto = useEntradaConfirmada();
  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeDespachar = permisos.includes('servicios:despachar');
  const puedeComandar = permisos.includes('servicios:comandar');
  const puedeOperar = permisos.includes('servicios:operar');
  const [exp, setExp] = useState<Expediente | null>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [prioridad, setPrioridad] = useState<Prioridad | ''>('');
  const [resultado, setResultado] = useState<Resultado | ''>('');
  const eventos = useCronologia(id);

  const cargar = useCallback(async () => {
    try {
      setExp(await obtenerExpediente(id));
      setError('');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cargar el incidente.');
    }
  }, [id]);

  useEffect(() => {
    void cargar();
    const reloj = setInterval(() => void cargar(), REFRESCO_MS);
    return () => clearInterval(reloj);
  }, [cargar]);

  const hacer = async (fn: () => Promise<unknown>, exito: string) => {
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await fn();
      setAviso(exito);
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo completar la acción.');
    } finally {
      setOcupado(false);
    }
  };

  if (!exp) return error ? <Aviso tipo="error" texto={error} /> : <Cargando texto="Cargando el incidente…" />;

  const i = exp.incidente;
  const cerrado = i.fase === 'CERRADO';
  const antesDeDespachar = i.fase === 'RECIBIDO' || i.fase === 'EVALUACION';
  const puedeResultado = antesDeDespachar ? puedeDespachar : puedeComandar;
  const acciones: Array<{ accion: AccionFase; texto: string; visible: boolean }> = [
    { accion: 'EVALUACION', texto: 'Pasar a evaluación', visible: puedeDespachar && i.fase === 'RECIBIDO' },
    { accion: 'OPERANDO', texto: 'Iniciar operación', visible: puedeComandar && i.fase === 'EN_LUGAR' },
    { accion: 'CONTROLADO', texto: 'Incidente controlado', visible: puedeComandar && (i.fase === 'EN_LUGAR' || i.fase === 'OPERANDO') },
    { accion: 'REACTIVADO', texto: 'Se reactivó', visible: puedeComandar && i.fase === 'CONTROLADO' },
  ];

  const retirar = async (despachoId: string, movil: string) => {
    const motivo = await pedirTexto({ titulo: `Retirar ${movil}`, mensaje: 'El móvil vuelve a quedar disponible en el cuartel.', etiqueta: 'Motivo', confirmar: 'Retirar', peligro: true, requerida: true });
    if (motivo) await hacer(() => cancelarDespacho(despachoId, motivo), `${movil} retirado del incidente.`);
  };

  const declarar = async () => {
    if (!resultado) return;
    const afuera = exp.despachos.some((d) => d.activo);
    const mensaje = afuera
      ? `${NOMBRE_RESULTADO[resultado]}: los móviles pasan a retorno y el incidente se cierra cuando vuelvan.`
      : antesDeDespachar
        ? `${NOMBRE_RESULTADO[resultado]}: el incidente se cierra ahora.`
        : `${NOMBRE_RESULTADO[resultado]}: queda registrado; falta el cierre.`;
    if (await confirmar({ titulo: 'Declarar cómo terminó', mensaje, confirmar: 'Declarar' })) {
      await hacer(() => declararResultado(i.id, resultado), 'Resultado declarado.');
      setResultado('');
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Link href="/dashboard/servicios/operaciones" style={{ fontSize: 13 }}>← Centro de operaciones</Link>

      <section className="card" aria-labelledby="titulo-incidente" style={{ display: 'grid', gap: 10 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
          <h1 id="titulo-incidente" style={{ fontSize: 22, margin: 0 }}>{i.numeroServicio} · {i.tipo?.nombre ?? 'Servicio'}</h1>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <Link className="btn-primary" href={`/incidente/${i.id}`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>Modo incidente</Link>
            <Link className="service-secondary" href={`/dashboard/servicios/operaciones/${i.id}/informe`} style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
              {cerrado ? 'Informe' : 'Informe y cierre'}
            </Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          <span className="badge" style={{ background: FONDO_FASE[i.fase] }}>{NOMBRE_FASE[i.fase]}</span>
          {i.prioridad && <span className="badge" style={{ background: FONDO_PRIORIDAD[i.prioridad] }}>Prioridad {NOMBRE_PRIORIDAD[i.prioridad]}</span>}
          {i.resultado && <span className="badge">Resultado: {NOMBRE_RESULTADO[i.resultado]}</span>}
        </div>
        <p style={{ margin: 0 }}><strong>{i.direccion}</strong>{i.ciudad ? `, ${i.ciudad}` : ''}</p>
        {i.descripcion && <p style={{ margin: 0, color: 'var(--muted)' }}>{i.descripcion}</p>}
        <p style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
          Recibido {horaCorta(i.recibidoEn)} (hace {transcurrido(i.recibidoEn)}) · Comando: {i.comandante?.nombre ?? 'sin asumir'}
        </p>
      </section>

      {exp.emergenciaActiva && (
        <div role="alert" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, flexWrap: 'wrap', padding: 14, background: 'var(--bad-fill)', border: '2px solid var(--danger)', borderRadius: 12 }}>
          <strong style={{ color: 'var(--ink)', fontSize: 18 }}>⚠ EMERGENCIA activa en este incidente</strong>
          {(puedeComandar || puedeDespachar) && (
            <button type="button" className="btn-primary" disabled={ocupado} onClick={() => void hacer(() => atenderEmergencia(i.id), 'Emergencia marcada como atendida.')}>
              Marcar atendida
            </button>
          )}
        </div>
      )}
      {error && <Aviso tipo="error" texto={error} />}
      {aviso && <Aviso tipo="exito" texto={aviso} />}

      <div className="operaciones-columnas">
        <div style={{ display: 'grid', gap: 16 }}>
          {!cerrado && (puedeComandar || puedeDespachar) && (
            <section className="card" aria-labelledby="titulo-comando" style={{ display: 'grid', gap: 12 }}>
              <h2 id="titulo-comando" style={{ fontSize: 17, margin: 0 }}>Comando</h2>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {acciones.filter((a) => a.visible).map((a) => (
                  <button key={a.accion} type="button" className="btn-primary" disabled={ocupado} onClick={() => void hacer(() => cambiarFase(i.id, a.accion), a.texto)}>
                    {a.texto}
                  </button>
                ))}
                {puedeComandar && (
                  <button type="button" className="service-secondary" disabled={ocupado} onClick={() => void hacer(() => asumirComando(i.id), 'Asumiste el comando.')}>
                    Asumir comando
                  </button>
                )}
              </div>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
                <div>
                  <label htmlFor={`${idForm}-prio`} style={etiqueta}>Prioridad</label>
                  <select id={`${idForm}-prio`} className="input-field" style={{ width: 'auto' }} value={prioridad || i.prioridad || 'MODERADA'} onChange={(e) => setPrioridad(e.target.value as Prioridad)}>
                    {Object.entries(NOMBRE_PRIORIDAD).map(([c, n]) => <option key={c} value={c}>{n}</option>)}
                  </select>
                </div>
                <button type="button" className="service-secondary" disabled={ocupado || !prioridad || prioridad === i.prioridad}
                  onClick={() => void hacer(() => cambiarPrioridad(i.id, prioridad as Prioridad), 'Prioridad actualizada.').then(() => setPrioridad(''))}>
                  Cambiar prioridad
                </button>
              </div>
              {puedeResultado && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'end' }}>
                  <div>
                    <label htmlFor={`${idForm}-res`} style={etiqueta}>Cómo terminó</label>
                    <select id={`${idForm}-res`} className="input-field" style={{ width: 'auto' }} value={resultado} onChange={(e) => setResultado(e.target.value as Resultado)}>
                      <option value="">Elegí…</option>
                      {RESULTADOS.map((r) => <option key={r} value={r}>{NOMBRE_RESULTADO[r]}</option>)}
                    </select>
                  </div>
                  <button type="button" className="service-secondary" disabled={ocupado || !resultado} onClick={() => void declarar()}>Declarar resultado</button>
                </div>
              )}
            </section>
          )}

          {!cerrado && puedeDespachar && <DespachoRapido servicioId={i.id} alDespachar={() => void cargar()} />}

          <section className="card" aria-labelledby="titulo-moviles" style={{ display: 'grid', gap: 10 }}>
            <h2 id="titulo-moviles" style={{ fontSize: 17, margin: 0 }}>Móviles del incidente</h2>
            {exp.despachos.length === 0 ? (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Todavía no se despachó ningún móvil.</p>
            ) : (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr>
                    <th scope="col" style={{ textAlign: 'left' }}>Móvil</th>
                    <th scope="col" style={{ textAlign: 'left' }}>Asignado</th>
                    <th scope="col" style={{ textAlign: 'left' }}>Salida</th>
                    <th scope="col" style={{ textAlign: 'left' }}>Llegada</th>
                    <th scope="col" style={{ textAlign: 'left' }}>Tripulación</th>
                    <th scope="col" style={{ textAlign: 'left' }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {exp.despachos.map((d) => (
                    <tr key={d.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                      <td>
                        <strong>{d.movil}</strong>
                        <div style={{ fontSize: 12, color: 'var(--muted)' }}>
                          {d.activo ? (d.siguientePaso ? `Falta: ${BOTON_PASO[d.siguientePaso]}` : '') : d.estado === 'CANCELADO' ? 'Retirado' : 'Volvió al cuartel'}
                        </div>
                      </td>
                      <td>{horaCorta(d.horaDespacho)}</td>
                      <td>{horaCorta(d.horaSalida)}</td>
                      <td>{horaCorta(d.horaLlegada)}</td>
                      <td>{d.tripulacion.length ? d.tripulacion.map((t) => `${t.nombre} (${t.rol})`).join(', ') : <span style={{ color: 'var(--danger)' }}>Sin tripulación</span>}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {d.activo && d.siguientePaso && (puedeDespachar || puedeOperar) && (
                          <button type="button" className="service-secondary" disabled={ocupado}
                            onClick={() => void hacer(() => pasoMovilCentral(i.id, d.id, d.siguientePaso!), `${d.movil}: ${BOTON_PASO[d.siguientePaso!]}`)}>
                            {BOTON_PASO[d.siguientePaso]}
                          </button>
                        )}
                        {d.activo && puedeDespachar && (
                          <button type="button" className="service-secondary" style={{ marginLeft: 6 }} disabled={ocupado} onClick={() => void retirar(d.id, d.movil)}>Retirar</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </section>

          <PedidosRecurso servicioId={i.id} pedidos={exp.solicitudes} puedeGestionar={puedeDespachar && !cerrado} alCambiar={() => void cargar()} />
        </div>

        <div style={{ display: 'grid', gap: 16 }}>
          <section className="card" aria-labelledby="titulo-situacion" style={{ display: 'grid', gap: 8 }}>
            <h2 id="titulo-situacion" style={{ fontSize: 17, margin: 0 }}>Situación</h2>
            {exp.condiciones.length === 0 ? (
              <p style={{ color: 'var(--muted)', margin: 0 }}>Sin condiciones marcadas.</p>
            ) : (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {exp.condiciones.map((c) => <span key={c.codigo} className="badge" style={{ background: c.critica ? 'var(--bad-fill)' : 'var(--warn-fill)', fontSize: 12 }}>{c.nombre}</span>)}
              </div>
            )}
            <p style={{ margin: 0, fontSize: 13 }}>
              Víctimas: {Object.entries(exp.victimas).map(([c, n]) => `${NOMBRE_VICTIMA[c] ?? c} ${n}`).join(' · ')}
            </p>
          </section>

          <section className="card" aria-labelledby="titulo-llamados" style={{ display: 'grid', gap: 6 }}>
            <h2 id="titulo-llamados" style={{ fontSize: 17, margin: 0 }}>Llamadas ({exp.llamados.length})</h2>
            {exp.llamados.map((l) => (
              <p key={l.id} style={{ margin: 0, fontSize: 13 }}>
                {horaCorta(l.recibidoEn)} · {l.medio}{l.solicitante ? ` · ${l.solicitante}` : ''}{l.telefono ? ` · ${l.telefono}` : ''}
              </p>
            ))}
          </section>

          {exp.participantes.length > 0 && (
            <section className="card" aria-labelledby="titulo-participantes" style={{ display: 'grid', gap: 6 }}>
              <h2 id="titulo-participantes" style={{ fontSize: 17, margin: 0 }}>Personal sumado por solicitud</h2>
              {exp.participantes.map((p) => (
                <p key={p.usuarioId} style={{ margin: 0, fontSize: 13 }}>
                  {p.nombre} · {p.estado === 'EN_SITIO' ? 'en el lugar' : p.estado === 'EN_CAMINO' ? 'en camino' : 'se retiró'}
                </p>
              ))}
            </section>
          )}

          <section className="card" aria-labelledby="titulo-cronologia" style={{ display: 'grid', gap: 8 }}>
            <h2 id="titulo-cronologia" style={{ fontSize: 17, margin: 0 }}>Cronología</h2>
            <CronologiaIncidente eventos={eventos} />
          </section>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Paso 3: Comprobaciones**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npm run generar:pantallas 2>&1 | tail -2 && npx tsc --noEmit 2>&1 | head -10 && npm run audit:a11y 2>&1 | tail -3 && npm run audit:contraste 2>&1 | tail -3
cd .. && node scripts/verificar-endpoints.mjs 2>&1 | tail -5
```

Resultado esperado: sin errores; auditorías en la línea base; ningún endpoint sin ruta.

Revisión manual con `admin` sobre el incidente de prueba de la tarea 11:

- Despachar dos móviles, uno con **Asignar y salir** y otro con **Solo asignar**.
- En la tabla de móviles, el primero dice "Falta: LLEGAMOS" y el segundo "Falta: SALIMOS".
- La cronología muestra los dos eventos.
- La fase pasa a **En camino**.

- [ ] **Paso 4: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/components/incidente frontend/src/app/dashboard/servicios/operaciones frontend/src/lib/pantallas.generado.ts
git commit -m "Incidente (central y comando): despacho rápido, móviles, fases, resultado, pedidos y cronología en vivo

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 14: Modo Incidente

**Archivos:**

- Crear: `frontend/src/app/incidente/page.tsx` y `frontend/src/app/incidente/[id]/page.tsx`
- Crear: `frontend/src/components/AccesoModoIncidente.tsx`
- Modificar: `frontend/src/app/login/page.tsx` (lista blanca de retorno), `frontend/src/app/dashboard/page.tsx` (acceso), `frontend/src/app/globals.css` (bloque "Modo Incidente")

**Interfaces:**

- Consume:
  - De `lib/incidentes`: `accionCampo`, `pendientes`, `sincronizarPendientes`, `subirFoto`, `ajustarTripulacion`, `asumirComando`, `cambiarFase`, `obtenerCatalogos`, `obtenerExpediente` y `listarActivos`.
  - `useCronologia`, `CronologiaIncidente` y `EditorTripulacion`.
- Produce: las rutas `/incidente` y `/incidente/[id]`, **fuera** del dashboard (sin menú lateral), y el componente `AccesoModoIncidente`.
- Clases CSS nuevas: `.mi-pagina`, `.mi-cabecera`, `.mi-titulo`, `.mi-fase`, `.mi-alerta`, `.mi-grid`, `.mi-boton`, `.mi-boton-primario`, `.mi-boton-peligro`, `.mi-boton-armado`, `.mi-panel`, `.mi-opcion`, `.mi-opcion-critica` y `.mi-texto`.

Usuario de esta pantalla: un bombero o comandante en el lugar, con guantes, lluvia, una mano y
segundos. Cada decisión de diseño sale de ahí:

- Solo aparece el paso siguiente del móvil.
- EMERGENCIA está siempre visible y pide dos toques.
- Ninguna acción espera al GPS más de 4 s.
- Sin red, la acción queda en la cola local.
- El incidente y los catálogos se guardan en el celular para consultarlos sin conexión.

- [ ] **Paso 1: Estilos**

Al final de `frontend/src/app/globals.css` agregá:

```css
/* ---- Modo Incidente: botones grandes, una mano, guantes, poca luz (tema claro de alto contraste) ---- */
.mi-pagina { min-height: 100vh; max-width: 760px; margin: 0 auto; padding: 12px; display: grid; gap: 12px; align-content: start; color: var(--ink); background: var(--paper); }
.mi-cabecera { position: sticky; top: 0; z-index: 10; display: grid; gap: 4px; padding: 12px 14px; background: var(--surface); border: 3px solid var(--ink); border-radius: 14px; }
.mi-titulo { margin: 0; font-size: 22px; font-weight: 800; }
.mi-fase { font-size: 19px; font-weight: 800; }
.mi-alerta { padding: 12px 14px; font-size: 18px; font-weight: 800; color: var(--ink); background: var(--bad-fill); border: 3px solid var(--danger); border-radius: 12px; }
.mi-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
@media (max-width: 420px) { .mi-grid { grid-template-columns: 1fr; } }
.mi-boton { min-height: 76px; padding: 12px; font-size: 20px; font-weight: 800; letter-spacing: .02em; color: var(--ink); background: var(--surface); border: 3px solid var(--ink); border-radius: 14px; cursor: pointer; touch-action: manipulation; text-align: center; }
.mi-boton:disabled { opacity: .5; cursor: not-allowed; }
.mi-boton[aria-expanded="true"] { color: #fff; background: var(--ink); }
.mi-boton-primario { grid-column: 1 / -1; min-height: 92px; font-size: 28px; color: #fff; background: var(--ink); }
.mi-boton-peligro { grid-column: 1 / -1; min-height: 92px; font-size: 28px; color: #fff; background: #7f1d1d; border-color: #7f1d1d; }
.mi-boton-armado { outline: 6px solid var(--danger); outline-offset: 2px; }
.mi-panel { display: grid; gap: 10px; padding: 14px; background: var(--surface); border: 2px solid var(--line); border-radius: 14px; }
.mi-opcion { min-height: 64px; padding: 10px; font-size: 18px; font-weight: 700; color: var(--ink); background: var(--surface-soft); border: 2px solid var(--line); border-radius: 12px; cursor: pointer; touch-action: manipulation; }
.mi-opcion[aria-pressed="true"] { color: #fff; background: var(--ink); border-color: var(--ink); }
.mi-opcion-critica[aria-pressed="true"] { background: #7f1d1d; border-color: #7f1d1d; }
.mi-texto { margin: 0; font-size: 18px; }
```

- [ ] **Paso 2: Lista blanca del login**

En `frontend/src/app/login/page.tsx` reemplazá:

```ts
        if (sessionStorage.getItem('sigbo_volver') === '/fichar') destino = '/fichar';
```

por:

```ts
        const volver = sessionStorage.getItem('sigbo_volver');
        // Lista blanca: el fichaje por QR y el Modo Incidente (que se abre desde un enlace en el lugar).
        if (volver === '/fichar' || (volver !== null && /^\/incidente(\/[0-9a-fA-F-]{36})?$/.test(volver))) destino = volver;
```

- [ ] **Paso 3: Elegir incidente**

Crear `frontend/src/app/incidente/page.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { NOMBRE_FASE } from '@/lib/fases-incidente';
import { listarActivos, type IncidenteActivo } from '@/lib/incidentes';

/** Modo Incidente: elegir en cual de los incidentes activos se esta trabajando. */
export default function ElegirIncidentePage() {
  const router = useRouter();
  const [lista, setLista] = useState<IncidenteActivo[] | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!obtenerSesion()) {
      try {
        sessionStorage.setItem('sigbo_volver', '/incidente');
      } catch {
        /* sin almacenamiento de sesion */
      }
      router.replace('/login');
      return;
    }
    listarActivos().then(setLista).catch((e: Error) => setError(e.message));
  }, [router]);

  return (
    <main className="mi-pagina" aria-labelledby="mi-titulo">
      <header className="mi-cabecera">
        <h1 id="mi-titulo" className="mi-titulo">Modo incidente</h1>
        <p className="mi-texto">Elegí el incidente.</p>
      </header>
      {error && <p role="alert" className="mi-alerta">{error}</p>}
      {lista === null && !error && <p className="mi-texto">Cargando…</p>}
      {lista && lista.length === 0 && <p className="mi-panel mi-texto">No hay incidentes activos.</p>}
      {lista && lista.length > 0 && (
        <div className="mi-grid">
          {lista.map((a) => (
            <Link key={a.id} href={`/incidente/${a.id}`} className="mi-boton" style={{ gridColumn: '1 / -1', textDecoration: 'none', display: 'grid', gap: 4, placeItems: 'center' }}>
              {a.numeroServicio} · {a.tipo}
              <span style={{ fontSize: 15, fontWeight: 600 }}>{a.direccion} · {NOMBRE_FASE[a.fase]}</span>
            </Link>
          ))}
        </div>
      )}
      <p className="mi-texto"><Link href="/dashboard">Volver al sistema</Link></p>
    </main>
  );
}
```

- [ ] **Paso 4: La pantalla de operación**

Crear `frontend/src/app/incidente/[id]/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import { BOTON_PASO, NOMBRE_CATEGORIA_FOTO, NOMBRE_FASE, NOMBRE_VICTIMA } from '@/lib/fases-incidente';
import {
  accionCampo, ajustarTripulacion, asumirComando, cambiarFase, obtenerCatalogos, obtenerExpediente, pendientes,
  sincronizarPendientes, subirFoto, type Catalogos, type Expediente, type Integrante,
} from '@/lib/incidentes';
import { useCronologia } from '@/lib/use-cronologia';
import { CronologiaIncidente } from '@/components/incidente/CronologiaIncidente';
import { EditorTripulacion } from '@/components/EditorTripulacion';

type Panel = 'situacion' | 'recurso' | 'personal' | 'victima' | 'comunicacion' | 'foto' | null;

const REFRESCO_MS = 5000;
const FRASES = ['Llegamos al lugar', 'Incendio confirmado', 'Solicitamos refuerzo', 'Víctima localizada', 'Situación bajo control', 'Iniciamos el retorno'];
const claveMovil = (id: string) => `sigbo-incidente-movil-${id}`;
const claveExpediente = (id: string) => `sigbo-incidente-exp-${id}`;
const CLAVE_CATALOGOS = 'sigbo-incidente-catalogos';

function leerLocal<T>(clave: string): T | null {
  try {
    const v = localStorage.getItem(clave);
    return v ? (JSON.parse(v) as T) : null;
  } catch {
    return null;
  }
}
function guardarLocal(clave: string, valor: unknown) {
  try {
    localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    /* sin almacenamiento */
  }
}

export default function ModoIncidentePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const permisos = obtenerSesion()?.usuario.permisos ?? [];
  const puedeComandar = permisos.includes('servicios:comandar');
  const [exp, setExp] = useState<Expediente | null>(null);
  const [cat, setCat] = useState<Catalogos | null>(null);
  const [panel, setPanel] = useState<Panel>(null);
  const [error, setError] = useState('');
  const [aviso, setAviso] = useState('');
  const [enLinea, setEnLinea] = useState(true);
  const [porEnviar, setPorEnviar] = useState(0);
  const [ocupado, setOcupado] = useState(false);
  const [movilElegido, setMovilElegido] = useState<string | null>(null);
  const [armado, setArmado] = useState(false);
  const eventos = useCronologia(id, REFRESCO_MS);

  // Sin sesion: login y vuelta a este mismo incidente.
  useEffect(() => {
    if (!obtenerSesion()) {
      try {
        sessionStorage.setItem('sigbo_volver', `/incidente/${id}`);
      } catch {
        /* sin almacenamiento de sesion */
      }
      router.replace('/login');
      return;
    }
    try {
      sessionStorage.removeItem('sigbo_volver');
    } catch {
      /* nada */
    }
    setExp(leerLocal<Expediente>(claveExpediente(id)));
    setCat(leerLocal<Catalogos>(CLAVE_CATALOGOS));
    setMovilElegido(leerLocal<string>(claveMovil(id)));
  }, [id, router]);

  const cargar = useCallback(async () => {
    try {
      const e = await obtenerExpediente(id);
      setExp(e);
      guardarLocal(claveExpediente(id), e);
      setEnLinea(true);
      setError('');
    } catch (e) {
      if (e instanceof TypeError) setEnLinea(false);
      else setError(e instanceof Error ? e.message : 'No se pudo cargar el incidente.');
    }
    if (pendientes().length > 0) {
      const r = await sincronizarPendientes();
      if (r.descartadas.length > 0) setAviso(`Ya estaba registrado o el servidor lo rechazó: ${r.descartadas.map((d) => d.descripcion).join(', ')}.`);
    }
    setPorEnviar(pendientes().length);
  }, [id]);

  useEffect(() => {
    obtenerCatalogos().then((c) => { setCat(c); guardarLocal(CLAVE_CATALOGOS, c); }).catch(() => undefined);
    void cargar();
    const reloj = setInterval(() => void cargar(), REFRESCO_MS);
    const volvio = () => { setEnLinea(true); void cargar(); };
    const seFue = () => setEnLinea(false);
    window.addEventListener('online', volvio);
    window.addEventListener('offline', seFue);
    return () => {
      clearInterval(reloj);
      window.removeEventListener('online', volvio);
      window.removeEventListener('offline', seFue);
    };
  }, [cargar]);

  /** Accion de campo: hora y GPS al tocar; sin red queda en la cola y se envia sola. */
  const campo = async (ruta: string, cuerpo: Record<string, unknown>, descripcion: string, exito: string) => {
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      const r = await accionCampo(`/incidentes/${id}${ruta}`, cuerpo, descripcion);
      if (r.estado === 'ENCOLADA') {
        setEnLinea(false);
        setAviso(`Sin conexión: "${descripcion}" quedó guardado y se enviará solo.`);
      } else {
        setAviso(exito);
        await cargar();
      }
      setPanel(null);
      setPorEnviar(pendientes().length);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo registrar.');
    } finally {
      setOcupado(false);
    }
  };

  /** Decision que necesita red (comando, fase, tripulacion). */
  const decision = async (fn: () => Promise<unknown>, exito: string) => {
    setOcupado(true);
    setError('');
    setAviso('');
    try {
      await fn();
      setAviso(exito);
      setPanel(null);
      await cargar();
    } catch (e) {
      setError(e instanceof TypeError ? 'Sin conexión: esta acción necesita red.' : e instanceof Error ? e.message : 'No se pudo completar la acción.');
    } finally {
      setOcupado(false);
    }
  };

  const emergencia = () => {
    if (!armado) {
      setArmado(true);
      setTimeout(() => setArmado(false), 4000);
      return;
    }
    setArmado(false);
    void campo('/emergencia', {}, 'EMERGENCIA', 'EMERGENCIA enviada a la central y al comando.');
  };

  const elegirMovil = (valor: string) => {
    setMovilElegido(valor);
    guardarLocal(claveMovil(id), valor);
  };

  if (!exp) {
    return (
      <main className="mi-pagina">
        <p className="mi-texto">{error || (enLinea ? 'Cargando el incidente…' : 'Sin conexión y sin datos guardados de este incidente.')}</p>
      </main>
    );
  }

  const i = exp.incidente;
  const cerrado = i.fase === 'CERRADO';
  const activos = exp.despachos.filter((d) => d.activo);
  const miDespacho = activos.find((d) => d.id === exp.miDespachoId)
    ?? (movilElegido && movilElegido !== 'NINGUNO' ? activos.find((d) => d.id === movilElegido) : undefined)
    ?? null;
  const activas = new Set(exp.condiciones.map((c) => c.codigo));
  const alternar = (p: Exclude<Panel, null>) => setPanel(panel === p ? null : p);

  return (
    <main className="mi-pagina" aria-labelledby="mi-titulo">
      <header className="mi-cabecera">
        <h1 id="mi-titulo" className="mi-titulo">{i.numeroServicio} · {i.tipo?.nombre ?? 'Servicio'}</h1>
        <div className="mi-fase">● {NOMBRE_FASE[i.fase]}{miDespacho ? ` · ${miDespacho.movil}` : ''}</div>
        <div style={{ fontSize: 16 }}>{i.direccion}</div>
      </header>

      {(!enLinea || porEnviar > 0) && (
        <div className="mi-alerta" role="status">{enLinea ? '' : 'SIN CONEXIÓN — '}{porEnviar} acción(es) pendiente(s) de sincronización</div>
      )}
      {exp.emergenciaActiva && <div className="mi-alerta" role="alert">⚠ EMERGENCIA ACTIVA EN ESTE INCIDENTE</div>}
      {error && <p role="alert" className="mi-alerta">{error}</p>}
      {aviso && <p role="status" className="mi-panel mi-texto" style={{ background: 'var(--ok-fill)' }}>{aviso}</p>}

      {cerrado ? (
        <p className="mi-panel mi-texto">El incidente está cerrado. <Link href="/incidente">Ver otros incidentes</Link></p>
      ) : (
        <>
          {!miDespacho && activos.length > 0 && movilElegido !== 'NINGUNO' && (
            <section className="mi-panel" aria-labelledby="mi-movil">
              <h2 id="mi-movil" className="mi-texto">¿En qué móvil estás?</h2>
              <div className="mi-grid">
                {activos.map((d) => <button key={d.id} type="button" className="mi-opcion" onClick={() => elegirMovil(d.id)}>{d.movil}</button>)}
                <button type="button" className="mi-opcion" onClick={() => elegirMovil('NINGUNO')}>Sin móvil</button>
              </div>
            </section>
          )}

          {panel === 'situacion' && cat && (
            <PanelSituacion cat={cat} activas={activas} ocupado={ocupado}
              alMarcar={(codigo, activa, nombre) => void campo('/situacion', { condicion: codigo, activa }, `Situación: ${nombre}`, activa ? `${nombre}: marcado.` : `${nombre}: resuelto.`)} />
          )}
          {panel === 'recurso' && cat && (
            <PanelRecurso cat={cat} ocupado={ocupado}
              alPedir={(tipoRecursoId, nombre, cantidad, prioridad) => void campo('/solicitudes', { tipoRecursoId, cantidad, prioridad }, `Pedido: ${cantidad} × ${nombre}`, `Pedido enviado: ${cantidad} × ${nombre}.`)} />
          )}
          {panel === 'victima' && (
            <PanelVictima ocupado={ocupado}
              alRegistrar={(categoria, cantidad) => void campo('/victimas', { categoria, cantidad }, `Víctimas: ${cantidad} ${NOMBRE_VICTIMA[categoria]}`, 'Víctimas registradas.')} />
          )}
          {panel === 'comunicacion' && (
            <PanelComunicacion ocupado={ocupado} alEnviar={(texto) => void campo('/comunicacion', { texto }, `Comunicación: ${texto}`, 'Comunicación registrada.')} />
          )}
          {panel === 'foto' && <PanelFoto servicioId={id} enLinea={enLinea} alSubir={(t) => { setAviso(t); setPanel(null); void cargar(); }} alFallar={setError} />}
          {panel === 'personal' && (
            <PanelPersonal exp={exp} cat={cat} miDespachoId={miDespacho?.id ?? null} ocupado={ocupado}
              alGuardar={(despachoId, lista) => void decision(() => ajustarTripulacion(id, despachoId, lista), 'Tripulación actualizada.')} />
          )}

          <div className="mi-grid">
            {miDespacho?.siguientePaso && (
              <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado}
                onClick={() => void campo(`/despachos/${miDespacho.id}/${miDespacho.siguientePaso}`, {}, `${miDespacho.movil}: ${BOTON_PASO[miDespacho.siguientePaso!]}`, `${BOTON_PASO[miDespacho.siguientePaso!]}: registrado.`)}>
                {BOTON_PASO[miDespacho.siguientePaso]}
              </button>
            )}
            <button type="button" className="mi-boton" aria-expanded={panel === 'situacion'} onClick={() => alternar('situacion')}>SITUACIÓN</button>
            <button type="button" className="mi-boton" aria-expanded={panel === 'recurso'} onClick={() => alternar('recurso')}>SOLICITAR RECURSO</button>
            <button type="button" className="mi-boton" aria-expanded={panel === 'personal'} onClick={() => alternar('personal')}>PERSONAL</button>
            <button type="button" className="mi-boton" aria-expanded={panel === 'foto'} onClick={() => alternar('foto')}>FOTO</button>
            <button type="button" className="mi-boton" aria-expanded={panel === 'comunicacion'} onClick={() => alternar('comunicacion')}>COMUNICACIÓN</button>
            <button type="button" className="mi-boton" aria-expanded={panel === 'victima'} onClick={() => alternar('victima')}>VÍCTIMAS</button>
            {puedeComandar && (i.fase === 'EN_LUGAR' || i.fase === 'OPERANDO') && (
              <button type="button" className="mi-boton" disabled={ocupado} onClick={() => void decision(() => cambiarFase(id, 'CONTROLADO'), 'Incidente controlado.')}>CONTROLADO</button>
            )}
            {puedeComandar && i.fase === 'CONTROLADO' && (
              <button type="button" className="mi-boton" disabled={ocupado} onClick={() => void decision(() => cambiarFase(id, 'REACTIVADO'), 'Se registró la reactivación.')}>SE REACTIVÓ</button>
            )}
            {puedeComandar && (
              <button type="button" className="mi-boton" disabled={ocupado} onClick={() => void decision(() => asumirComando(id), 'Asumiste el comando.')}>ASUMIR COMANDO</button>
            )}
            <button type="button" className={`mi-boton mi-boton-peligro${armado ? ' mi-boton-armado' : ''}`} disabled={ocupado} onClick={emergencia} aria-describedby="mi-ayuda-emergencia">
              {armado ? 'TOCÁ DE NUEVO PARA CONFIRMAR' : 'EMERGENCIA'}
            </button>
            <p id="mi-ayuda-emergencia" className="sr-only">Pide ayuda urgente a la central y al comando. Hay que tocar dos veces.</p>
          </div>
        </>
      )}

      <section className="mi-panel" aria-labelledby="mi-cronologia">
        <h2 id="mi-cronologia" className="mi-texto">Últimos eventos</h2>
        <CronologiaIncidente eventos={eventos} limite={8} grande />
      </section>
      <p className="mi-texto"><Link href={`/dashboard/servicios/operaciones/${id}`}>Ver el incidente completo</Link></p>
    </main>
  );
}

function PanelSituacion({ cat, activas, ocupado, alMarcar }: {
  cat: Catalogos; activas: Set<string>; ocupado: boolean; alMarcar: (codigo: string, activa: boolean, nombre: string) => void;
}) {
  return (
    <section className="mi-panel" aria-labelledby="mi-p-situacion">
      <h2 id="mi-p-situacion" className="mi-texto">Situación: tocá para marcar o resolver</h2>
      {(['SITUACION', 'RIESGO'] as const).map((g) => (
        <div key={g} style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 16 }}>{g === 'SITUACION' ? 'Situación' : 'Riesgos'}</h3>
          <div className="mi-grid">
            {cat.condiciones.filter((c) => c.grupo === g).map((c) => {
              const activa = activas.has(c.codigo);
              return (
                <button key={c.codigo} type="button" className={`mi-opcion${c.critica ? ' mi-opcion-critica' : ''}`} aria-pressed={activa} disabled={ocupado}
                  onClick={() => alMarcar(c.codigo, !activa, c.nombre)}>
                  {c.nombre}
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </section>
  );
}

function Contador({ valor, alCambiar, etiqueta }: { valor: number; alCambiar: (n: number) => void; etiqueta: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }} role="group" aria-label={etiqueta}>
      <button type="button" className="mi-opcion" style={{ minWidth: 72 }} aria-label="Uno menos" onClick={() => alCambiar(Math.max(1, valor - 1))}>−</button>
      <span className="mi-fase" aria-live="polite">{valor}</span>
      <button type="button" className="mi-opcion" style={{ minWidth: 72 }} aria-label="Uno más" onClick={() => alCambiar(Math.min(99, valor + 1))}>+</button>
    </div>
  );
}

function PanelRecurso({ cat, ocupado, alPedir }: {
  cat: Catalogos; ocupado: boolean; alPedir: (tipoRecursoId: string, nombre: string, cantidad: number, prioridad: 'NORMAL' | 'URGENTE') => void;
}) {
  const [tipo, setTipo] = useState<{ id: string; nombre: string } | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [prioridad, setPrioridad] = useState<'NORMAL' | 'URGENTE'>('URGENTE');
  if (!tipo) {
    return (
      <section className="mi-panel" aria-labelledby="mi-p-recurso">
        <h2 id="mi-p-recurso" className="mi-texto">¿Qué recurso?</h2>
        <div className="mi-grid">
          {cat.tiposRecurso.map((r) => <button key={r.id} type="button" className="mi-opcion" onClick={() => setTipo({ id: r.id, nombre: r.nombre })}>{r.nombre}</button>)}
        </div>
      </section>
    );
  }
  return (
    <section className="mi-panel" aria-labelledby="mi-p-recurso2">
      <h2 id="mi-p-recurso2" className="mi-texto">{tipo.nombre}: prioridad y cantidad</h2>
      <div className="mi-grid">
        <button type="button" className="mi-opcion" aria-pressed={prioridad === 'URGENTE'} onClick={() => setPrioridad('URGENTE')}>URGENTE</button>
        <button type="button" className="mi-opcion" aria-pressed={prioridad === 'NORMAL'} onClick={() => setPrioridad('NORMAL')}>Normal</button>
      </div>
      <Contador valor={cantidad} alCambiar={setCantidad} etiqueta="Cantidad" />
      <div className="mi-grid">
        <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado} onClick={() => alPedir(tipo.id, tipo.nombre, cantidad, prioridad)}>CONFIRMAR</button>
        <button type="button" className="mi-opcion" style={{ gridColumn: '1 / -1' }} onClick={() => setTipo(null)}>Cambiar recurso</button>
      </div>
    </section>
  );
}

function PanelVictima({ ocupado, alRegistrar }: { ocupado: boolean; alRegistrar: (categoria: string, cantidad: number) => void }) {
  const [categoria, setCategoria] = useState('');
  const [cantidad, setCantidad] = useState(1);
  return (
    <section className="mi-panel" aria-labelledby="mi-p-victima">
      <h2 id="mi-p-victima" className="mi-texto">Víctimas</h2>
      <div className="mi-grid">
        {Object.entries(NOMBRE_VICTIMA).map(([c, n]) => <button key={c} type="button" className="mi-opcion" aria-pressed={categoria === c} onClick={() => setCategoria(c)}>{n}</button>)}
      </div>
      <Contador valor={cantidad} alCambiar={setCantidad} etiqueta="Cantidad de personas" />
      <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado || !categoria} onClick={() => alRegistrar(categoria, cantidad)}>CONFIRMAR</button>
    </section>
  );
}

function PanelComunicacion({ ocupado, alEnviar }: { ocupado: boolean; alEnviar: (texto: string) => void }) {
  const id = useId();
  const [texto, setTexto] = useState('');
  return (
    <section className="mi-panel" aria-labelledby="mi-p-com">
      <h2 id="mi-p-com" className="mi-texto">Comunicación</h2>
      <div className="mi-grid">
        {FRASES.map((f) => <button key={f} type="button" className="mi-opcion" disabled={ocupado} onClick={() => alEnviar(f)}>{f}</button>)}
      </div>
      <label htmlFor={`${id}-texto`} className="mi-texto">Otro mensaje</label>
      <textarea id={`${id}-texto`} className="input-field" rows={2} maxLength={500} value={texto} onChange={(e) => setTexto(e.target.value)} style={{ fontSize: 18 }} />
      <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado || texto.trim().length < 2} onClick={() => alEnviar(texto.trim())}>ENVIAR</button>
    </section>
  );
}

function PanelFoto({ servicioId, enLinea, alSubir, alFallar }: { servicioId: string; enLinea: boolean; alSubir: (texto: string) => void; alFallar: (texto: string) => void }) {
  const id = useId();
  const [archivo, setArchivo] = useState<File | null>(null);
  const [enviando, setEnviando] = useState(false);
  const enviar = async (categoria: string | null) => {
    if (!archivo) return;
    setEnviando(true);
    try {
      await subirFoto(servicioId, archivo, categoria);
      alSubir(categoria ? `Foto enviada (${NOMBRE_CATEGORIA_FOTO[categoria]}).` : 'Foto enviada.');
    } catch (e) {
      alFallar(e instanceof TypeError ? 'Sin conexión: la foto no se pudo enviar. Volvé a intentar con señal.' : e instanceof Error ? e.message : 'No se pudo enviar la foto.');
    } finally {
      setEnviando(false);
    }
  };
  return (
    <section className="mi-panel" aria-labelledby="mi-p-foto">
      <h2 id="mi-p-foto" className="mi-texto">Foto</h2>
      {!enLinea && <p className="mi-texto" style={{ color: 'var(--danger)' }}>Sin conexión: la foto necesita red para enviarse.</p>}
      <label htmlFor={`${id}-archivo`} className="mi-boton mi-boton-primario" style={{ display: 'grid', placeItems: 'center' }}>
        {archivo ? 'TOMAR OTRA' : 'TOMAR FOTO'}
      </label>
      <input id={`${id}-archivo`} className="sr-only" type="file" accept="image/*" capture="environment" onChange={(e) => setArchivo(e.target.files?.[0] ?? null)} />
      {archivo && (
        <>
          <p className="mi-texto">¿Qué muestra? (opcional)</p>
          <div className="mi-grid">
            {Object.entries(NOMBRE_CATEGORIA_FOTO).map(([c, n]) => <button key={c} type="button" className="mi-opcion" disabled={enviando} onClick={() => void enviar(c)}>{n}</button>)}
            <button type="button" className="mi-opcion" style={{ gridColumn: '1 / -1' }} disabled={enviando} onClick={() => void enviar(null)}>Enviar sin clasificar</button>
          </div>
        </>
      )}
    </section>
  );
}

function PanelPersonal({ exp, cat, miDespachoId, ocupado, alGuardar }: {
  exp: Expediente; cat: Catalogos | null; miDespachoId: string | null; ocupado: boolean; alGuardar: (despachoId: string, lista: Integrante[]) => void;
}) {
  const mio = exp.despachos.find((d) => d.id === miDespachoId) ?? null;
  const codigo = new Map((cat?.funciones ?? []).map((f) => [f.nombre, f.codigo]));
  const [lista, setLista] = useState<Integrante[]>(
    () => mio?.tripulacion.map((t) => ({ bomberoId: t.bomberoId, funcion: t.funcion ?? codigo.get(t.rol) ?? cat?.funciones[0]?.codigo ?? '' })) ?? [],
  );
  return (
    <section className="mi-panel" aria-labelledby="mi-p-personal">
      <h2 id="mi-p-personal" className="mi-texto">Personal</h2>
      {exp.despachos.filter((d) => d.activo).map((d) => (
        <p key={d.id} className="mi-texto"><strong>{d.movil}:</strong> {d.tripulacion.length ? d.tripulacion.map((t) => `${t.nombre} (${t.rol})`).join(', ') : 'sin tripulación'}</p>
      ))}
      {mio && cat && (
        <>
          <h3 style={{ margin: 0, fontSize: 16 }}>Corregir la tripulación de {mio.movil}</h3>
          <EditorTripulacion integrantes={lista} bomberos={cat.bomberos} funciones={cat.funciones} onChange={setLista} grande />
          <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado} onClick={() => alGuardar(mio.id, lista)}>GUARDAR TRIPULACIÓN</button>
        </>
      )}
    </section>
  );
}
```

- [ ] **Paso 5: Acceso desde el inicio**

Crear `frontend/src/components/AccesoModoIncidente.tsx`:

```tsx
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { obtenerSesion } from '@/lib/api';
import { listarActivos, type IncidenteActivo } from '@/lib/incidentes';

/** En el inicio: si hay incidentes activos, un acceso directo al Modo Incidente. */
export function AccesoModoIncidente() {
  const puede = (obtenerSesion()?.usuario.permisos ?? []).includes('servicios:operar');
  const [lista, setLista] = useState<IncidenteActivo[]>([]);

  useEffect(() => {
    if (!puede) return;
    listarActivos().then(setLista).catch(() => undefined);
  }, [puede]);

  if (!puede || lista.length === 0) return null;
  return (
    <section className="card" aria-labelledby="titulo-acceso-incidente" style={{ marginTop: 18, borderLeft: '4px solid var(--danger)' }}>
      <h2 id="titulo-acceso-incidente" style={{ fontSize: 17, marginTop: 0 }}>Incidentes activos</h2>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {lista.map((a) => (
          <Link key={a.id} href={`/incidente/${a.id}`} className="btn-primary" style={{ textDecoration: 'none', minHeight: 48, display: 'inline-flex', alignItems: 'center' }}>
            Modo incidente · {a.numeroServicio} · {a.tipo}
          </Link>
        ))}
      </div>
    </section>
  );
}
```

En `frontend/src/app/dashboard/page.tsx`, importá `import { AccesoModoIncidente } from '@/components/AccesoModoIncidente';` y renderizá
`<AccesoModoIncidente />` inmediatamente **antes** de la primera aparición de
`<section className="card" style={{ marginTop: 18 }}>` (después del bloque `dashboard-hero`).

- [ ] **Paso 6: Comprobaciones**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npx tsc --noEmit 2>&1 | head -10 && npm run audit:a11y 2>&1 | tail -3 && npm run audit:contraste 2>&1 | tail -3
cd .. && node scripts/verificar-endpoints.mjs 2>&1 | tail -5
```

Resultado esperado: sin errores; auditorías en la línea base. `generar:pantallas` recorre solo
`src/app/dashboard`, así que `/incidente` no entra en el buscador. Es a propósito: no es una pantalla
administrativa.

**Revisión manual en un celular o con el emulador de dispositivos del navegador (360 × 740)**, con un
usuario que tenga `servicios:operar` y esté en la tripulación del móvil "Solo asignar" del incidente de
prueba:

1. El botón grande dice **SALIMOS**. Tocalo y pasa a **LLEGAMOS** (el navegador pide permiso de ubicación).
2. LLEGAMOS: la fase del incidente pasa a **En el lugar** y la cronología lo muestra "con GPS".
3. SITUACIÓN → "Incendio activo" y después "Incendio controlado": queda marcado solo el segundo.
4. SOLICITAR RECURSO → Ambulancia → URGENTE → CONFIRMAR: el Centro de Operaciones muestra la alerta "Pedido urgente".
5. FOTO: tomá una foto y clasificala como "Daño"; aparece en la cronología.
6. Con las herramientas del navegador en **Offline**: tocá COMUNICACIÓN → "Situación bajo control". Aparece "SIN CONEXIÓN — 1 acción pendiente". Volvé a **Online** y en unos segundos se envía sola y aparece en la cronología **con la hora en que se tocó**.
7. EMERGENCIA: un toque arma el botón (borde rojo), el segundo lo envía. El Centro de Operaciones suena y muestra la alerta roja. "Marcar atendida" la saca.

- [ ] **Paso 7: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/app/incidente frontend/src/components/AccesoModoIncidente.tsx frontend/src/app/login/page.tsx frontend/src/app/dashboard/page.tsx frontend/src/app/globals.css
git commit -m "Modo Incidente: botones grandes, paso del móvil, situación, pedidos, foto, víctimas, comunicación, emergencia y cola sin conexión

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 15: Informe y cierre

**Archivos:**

- Crear: `frontend/src/app/dashboard/servicios/operaciones/[id]/informe/page.tsx`
- Modificar: `frontend/src/app/globals.css` (bloque de impresión)

**Interfaces:**

- Consume: `obtenerInforme`, `obtenerCatalogos`, `cerrarIncidente` y los tipos `Informe`, `Integrante` y `Resultado` (tarea 10); `CronologiaIncidente` (tarea 13); `EditorTripulacion` (tarea 12); `Adjuntos` (`@/components/Adjuntos`, props `{ entidad, entidadId, titulo }`); `useConfirmacion`.
- Produce: la pantalla del informe (se imprime o se guarda como PDF desde el navegador) con el **cierre mínimo**.

- [ ] **Paso 1: Estilos de impresión**

Al final de `frontend/src/app/globals.css` agregá:

```css
/* ---- Informe del incidente: al imprimir solo sale el informe ---- */
.informe-seccion { display: grid; gap: 8px; }
.informe-datos { display: grid; grid-template-columns: max-content 1fr; gap: 4px 14px; margin: 0; }
.informe-datos dt { font-weight: 700; color: var(--muted); }
.informe-datos dd { margin: 0; color: var(--ink); }
@media print {
  body * { visibility: hidden; }
  .informe-imprimible, .informe-imprimible * { visibility: visible; }
  .informe-imprimible { position: absolute; top: 0; left: 0; width: 100%; }
  .no-imprimir { display: none !important; }
}
```

- [ ] **Paso 2: La pantalla**

Crear `frontend/src/app/dashboard/servicios/operaciones/[id]/informe/page.tsx`:

```tsx
'use client';

import { useCallback, useEffect, useId, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { obtenerSesion } from '@/lib/api';
import {
  horaCorta, minutosTexto, NOMBRE_ESTADO_PEDIDO, NOMBRE_FASE, NOMBRE_PRIORIDAD, NOMBRE_RESULTADO, NOMBRE_VICTIMA, RESULTADOS,
} from '@/lib/fases-incidente';
import { cerrarIncidente, obtenerCatalogos, obtenerInforme, type Catalogos, type Informe, type Integrante, type Resultado } from '@/lib/incidentes';
import { CronologiaIncidente } from '@/components/incidente/CronologiaIncidente';
import { EditorTripulacion } from '@/components/EditorTripulacion';
import { Adjuntos } from '@/components/Adjuntos';
import { useConfirmacion } from '@/app/components/ConfirmProvider';
import { Aviso } from '@/app/components/Aviso';
import { Cargando } from '@/app/components/Cargando';

const fechaHora = (v: string | null) => (v ? new Date(v).toLocaleString('es-PY') : '—');

export default function InformeIncidentePage() {
  const { id } = useParams<{ id: string }>();
  const idForm = useId();
  const confirmar = useConfirmacion();
  const puedeCerrar = (obtenerSesion()?.usuario.permisos ?? []).includes('servicios:finalizar');
  const [inf, setInf] = useState<Informe | null>(null);
  const [cat, setCat] = useState<Catalogos | null>(null);
  const [error, setError] = useState('');
  const [exito, setExito] = useState('');
  const [ocupado, setOcupado] = useState(false);
  const [resultado, setResultado] = useState<Resultado | ''>('');
  const [huboVictimas, setHuboVictimas] = useState<boolean | null>(null);
  const [huboDanos, setHuboDanos] = useState<boolean | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [tripulaciones, setTripulaciones] = useState<Record<string, Integrante[]>>({});

  const cargar = useCallback(async () => {
    try {
      const i = await obtenerInforme(id);
      setInf(i);
      setError('');
      // Precarga del cierre con lo que ya se sabe: nunca se vuelve a pedir un dato que existe.
      setResultado((r) => r || i.incidente.resultado || '');
      setHuboVictimas((v) => (v === null ? Object.values(i.victimas).some((n) => n > 0) : v));
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo armar el informe.');
    }
  }, [id]);

  useEffect(() => {
    void cargar();
    obtenerCatalogos().then(setCat).catch(() => undefined);
  }, [cargar]);

  if (!inf) return error ? <Aviso tipo="error" texto={error} /> : <Cargando texto="Armando el informe…" />;

  const i = inf.incidente;
  const cerrado = i.fase === 'CERRADO';
  const afuera = inf.despachos.filter((d) => d.activo);
  const codigoFuncion = new Map((cat?.funciones ?? []).map((f) => [f.nombre, f.codigo]));
  const tripulacionInicial = (despachoId: string): Integrante[] =>
    inf.despachos.find((d) => d.id === despachoId)?.tripulacion.map((t) => ({ bomberoId: t.bomberoId, funcion: t.funcion ?? codigoFuncion.get(t.rol) ?? cat?.funciones[0]?.codigo ?? '' })) ?? [];

  const cerrar = async () => {
    if (!resultado || huboVictimas === null || huboDanos === null) {
      setError('Respondé cómo terminó, si hubo víctimas y si hubo daños.');
      return;
    }
    if (!(await confirmar({ titulo: 'Cerrar el incidente', mensaje: `${i.numeroServicio}: ${NOMBRE_RESULTADO[resultado]}. Después del cierre la bitácora no admite eventos nuevos.`, confirmar: 'Cerrar incidente' }))) return;
    setOcupado(true);
    setError('');
    try {
      await cerrarIncidente(i.id, {
        resultado, huboVictimas, huboDanos,
        observaciones: observaciones.trim() || undefined,
        tripulacion: Object.entries(tripulaciones).map(([despachoId, integrantes]) => ({ despachoId, integrantes })),
      });
      setExito('Incidente cerrado. El informe quedó completo.');
      setTripulaciones({});
      await cargar();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'No se pudo cerrar el incidente.');
    } finally {
      setOcupado(false);
    }
  };

  const siNo = (valor: boolean | null, cambiar: (v: boolean) => void, nombre: string) => (
    <div style={{ display: 'flex', gap: 8 }} role="group" aria-label={nombre}>
      <button type="button" className="op-opcion" aria-pressed={valor === true} onClick={() => cambiar(true)}>Sí</button>
      <button type="button" className="op-opcion" aria-pressed={valor === false} onClick={() => cambiar(false)}>No</button>
    </div>
  );

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div className="no-imprimir" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
        <Link href={`/dashboard/servicios/operaciones/${i.id}`} style={{ fontSize: 13 }}>← Volver al incidente</Link>
        <button type="button" className="service-secondary" onClick={() => window.print()}>Imprimir o guardar PDF</button>
      </div>
      {error && <Aviso tipo="error" texto={error} />}
      {exito && <Aviso tipo="exito" texto={exito} />}

      {!cerrado && puedeCerrar && (
        <section className="card no-imprimir" aria-labelledby="titulo-cierre" style={{ display: 'grid', gap: 14 }}>
          <h2 id="titulo-cierre" style={{ fontSize: 18, margin: 0 }}>Cierre</h2>
          {afuera.length > 0 && (
            <Aviso tipo="error" texto={`Todavía hay móviles afuera (${afuera.map((d) => d.movil).join(', ')}). Registrá su regreso antes de cerrar.`} />
          )}
          <fieldset style={{ border: 0, padding: 0, margin: 0 }}>
            <legend style={{ fontWeight: 700, marginBottom: 6 }}>1. ¿Cómo terminó?</legend>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {RESULTADOS.map((r) => <button key={r} type="button" className="op-opcion" aria-pressed={resultado === r} onClick={() => setResultado(r)}>{NOMBRE_RESULTADO[r]}</button>)}
            </div>
          </fieldset>
          <div><p style={{ fontWeight: 700, margin: '0 0 6px' }}>2. ¿Hubo víctimas?</p>{siNo(huboVictimas, setHuboVictimas, '¿Hubo víctimas?')}</div>
          <div><p style={{ fontWeight: 700, margin: '0 0 6px' }}>3. ¿Hubo daños?</p>{siNo(huboDanos, setHuboDanos, '¿Hubo daños?')}</div>
          <div>
            <label htmlFor={`${idForm}-obs`} style={{ display: 'block', fontWeight: 700, marginBottom: 6 }}>4. Observaciones (opcional)</label>
            <textarea id={`${idForm}-obs`} className="input-field" rows={4} maxLength={4000} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} />
          </div>
          {cat && inf.despachos.length > 0 && (
            <div style={{ display: 'grid', gap: 10 }}>
              <p style={{ fontWeight: 700, margin: 0 }}>5. Revisión de la tripulación</p>
              {inf.despachos.map((d) => (
                <div key={d.id} style={{ display: 'grid', gap: 6 }}>
                  <strong>{d.movil}</strong>
                  <EditorTripulacion
                    integrantes={tripulaciones[d.id] ?? tripulacionInicial(d.id)}
                    bomberos={cat.bomberos}
                    funciones={cat.funciones}
                    onChange={(lista) => setTripulaciones((t) => ({ ...t, [d.id]: lista }))}
                  />
                </div>
              ))}
            </div>
          )}
          <button type="button" className="btn-primary" style={{ minHeight: 52, fontSize: 17 }} disabled={ocupado || afuera.length > 0} onClick={() => void cerrar()}>
            Cerrar incidente
          </button>
        </section>
      )}

      <article className="card informe-imprimible" aria-labelledby="titulo-informe" style={{ display: 'grid', gap: 18 }}>
        <h1 id="titulo-informe" style={{ fontSize: 22, margin: 0 }}>Informe del incidente {i.numeroServicio}</h1>

        <section className="informe-seccion" aria-labelledby="inf-id">
          <h2 id="inf-id" style={{ fontSize: 16, margin: 0 }}>Identificación</h2>
          <dl className="informe-datos">
            <dt>Tipo</dt><dd>{i.tipo?.nombre ?? '—'}</dd>
            <dt>Fecha</dt><dd>{fechaHora(i.recibidoEn)}</dd>
            <dt>Ubicación</dt><dd>{i.direccion}{i.ciudad ? `, ${i.ciudad}` : ''}{i.latitud !== null ? ` (${i.latitud.toFixed(5)}, ${i.longitud?.toFixed(5)})` : ''}</dd>
            <dt>Prioridad</dt><dd>{i.prioridad ? NOMBRE_PRIORIDAD[i.prioridad] : '—'}</dd>
            <dt>Estado</dt><dd>{NOMBRE_FASE[i.fase]}{i.resultado ? ` · ${NOMBRE_RESULTADO[i.resultado]}` : ''}</dd>
            <dt>Comandante</dt><dd>{i.comandante?.nombre ?? '—'}</dd>
            <dt>Solicitante</dt><dd>{inf.llamados.map((l) => [l.solicitante, l.telefono, l.medio].filter(Boolean).join(' · ')).join(' / ') || '—'}</dd>
            {inf.distanciaCuartelM !== null && (<><dt>Distancia al cuartel</dt><dd>{(inf.distanciaCuartelM / 1000).toFixed(1)} km en línea recta</dd></>)}
          </dl>
        </section>

        <section className="informe-seccion" aria-labelledby="inf-tiempos">
          <h2 id="inf-tiempos" style={{ fontSize: 16, margin: 0 }}>Tiempos</h2>
          <dl className="informe-datos">
            <dt>Recepción</dt><dd>{horaCorta(inf.tiempos.recepcion)}</dd>
            <dt>Primer despacho</dt><dd>{horaCorta(inf.tiempos.primerDespacho)} ({minutosTexto(inf.duraciones.despachoMin)})</dd>
            <dt>Primera salida</dt><dd>{horaCorta(inf.tiempos.primeraSalida)} ({minutosTexto(inf.duraciones.salidaMin)} después del despacho)</dd>
            <dt>Primera llegada</dt><dd>{horaCorta(inf.tiempos.primeraLlegada)} (viaje {minutosTexto(inf.duraciones.viajeMin)}; respuesta {minutosTexto(inf.duraciones.respuestaMin)})</dd>
            <dt>Controlado</dt><dd>{horaCorta(inf.tiempos.controlado)} ({minutosTexto(inf.duraciones.controlMin)} desde la llegada)</dd>
            <dt>Unidades disponibles</dt><dd>{horaCorta(inf.tiempos.disponible)}</dd>
            <dt>Cierre</dt><dd>{horaCorta(inf.tiempos.cierre)}</dd>
            <dt>Duración total</dt><dd>{minutosTexto(inf.duraciones.totalMin)}</dd>
          </dl>
        </section>

        <section className="informe-seccion" aria-labelledby="inf-moviles">
          <h2 id="inf-moviles" style={{ fontSize: 16, margin: 0 }}>Móviles y personal</h2>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr>
                <th scope="col" style={{ textAlign: 'left' }}>Móvil</th>
                <th scope="col" style={{ textAlign: 'left' }}>Salida</th>
                <th scope="col" style={{ textAlign: 'left' }}>Llegada</th>
                <th scope="col" style={{ textAlign: 'left' }}>Regreso</th>
                <th scope="col" style={{ textAlign: 'left' }}>Tripulación</th>
              </tr>
            </thead>
            <tbody>
              {inf.despachos.map((d) => (
                <tr key={d.id} style={{ borderTop: '1px solid var(--line-soft)' }}>
                  <td>{d.movil}</td>
                  <td>{horaCorta(d.horaSalida)}</td>
                  <td>{horaCorta(d.horaLlegada)}</td>
                  <td>{horaCorta(d.horaRegreso)}</td>
                  <td>{d.tripulacion.map((t) => `${t.nombre} (${t.rol})`).join(', ') || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section className="informe-seccion" aria-labelledby="inf-situacion">
          <h2 id="inf-situacion" style={{ fontSize: 16, margin: 0 }}>Situación, víctimas y daños</h2>
          <p style={{ margin: 0 }}>Condiciones registradas: {inf.condicionesRegistradas.join(', ') || 'ninguna'}.</p>
          <p style={{ margin: 0 }}>Víctimas: {Object.entries(inf.victimas).map(([c, n]) => `${NOMBRE_VICTIMA[c] ?? c} ${n}`).join(' · ')}.</p>
          {inf.cierre && <p style={{ margin: 0 }}>En el cierre: víctimas {inf.cierre.huboVictimas ? 'sí' : 'no'}; daños {inf.cierre.huboDanos ? 'sí' : 'no'}.</p>}
        </section>

        <section className="informe-seccion" aria-labelledby="inf-recursos">
          <h2 id="inf-recursos" style={{ fontSize: 16, margin: 0 }}>Recursos pedidos</h2>
          {inf.solicitudes.length === 0 ? <p style={{ margin: 0 }}>Ninguno.</p> : (
            <ul style={{ margin: 0 }}>
              {inf.solicitudes.map((s) => <li key={s.id}>{horaCorta(s.solicitadoEn)} · {s.cantidad} × {s.tipoRecurso} ({s.prioridad === 'URGENTE' ? 'urgente' : 'normal'}) · {NOMBRE_ESTADO_PEDIDO[s.estado]}</li>)}
            </ul>
          )}
        </section>

        {i.observaciones && (
          <section className="informe-seccion" aria-labelledby="inf-obs">
            <h2 id="inf-obs" style={{ fontSize: 16, margin: 0 }}>Observaciones</h2>
            <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{i.observaciones}</p>
          </section>
        )}

        <section className="informe-seccion" aria-labelledby="inf-crono">
          <h2 id="inf-crono" style={{ fontSize: 16, margin: 0 }}>Cronología</h2>
          <CronologiaIncidente eventos={inf.cronologia} recientesPrimero={false} />
        </section>

        <section className="informe-seccion no-imprimir" aria-label="Fotos">
          <Adjuntos entidad="SERVICIO" entidadId={i.id} titulo="Fotos del incidente" />
        </section>
      </article>
    </div>
  );
}
```

- [ ] **Paso 3: Comprobaciones y revisión manual**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npm run generar:pantallas 2>&1 | tail -2 && npx tsc --noEmit 2>&1 | head -10 && npm run audit:a11y 2>&1 | tail -3 && npm run audit:contraste 2>&1 | tail -3 && npm test 2>&1 | tail -3
```

Resultado esperado: todo en verde y en la línea base.

Manual: con el incidente de prueba y todos los móviles de vuelta (DISPONIBLE), abrí **Informe y cierre**:

- El resultado viene precargado si se declaró y "¿Hubo víctimas?" sale de lo registrado.
- Cerrá. La fase pasa a **Cerrado**, el informe muestra tiempos, distancia, personal y cronología.
- **Imprimir** deja solo el informe.
- Probá a cerrar con un móvil afuera: el botón queda deshabilitado con el aviso, y por API responde 409.

- [ ] **Paso 4: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/app/dashboard/servicios/operaciones frontend/src/app/globals.css frontend/src/lib/pantallas.generado.ts
git commit -m "Informe automático del incidente y cierre mínimo en cinco pasos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```



---

## Tarea 21: Frontend: avisos inmediatos, marca de no asignado y modo noche

**Archivos:**

- Crear: `frontend/src/lib/use-avisos-incidente.ts`
- Modificar: `frontend/src/app/dashboard/servicios/operaciones/page.tsx`, `operaciones/[id]/page.tsx`, `frontend/src/app/incidente/[id]/page.tsx`, `frontend/src/app/incidente/page.tsx`
- Modificar: `frontend/src/components/incidente/CronologiaIncidente.tsx`, `frontend/src/app/globals.css`

**Interfaces:**

- Consume: `GET /despacho/stream?solo=incidentes` (tarea 17), `API_URL` (`lib/api.ts`), `datos.fueraDeAsignacion` (tarea 19) y la decisión **DEC-3**.
- Produce: `useAvisosIncidente(alRecibir: (a: AvisoIncidente) => void, activo = true)` y el tipo `AvisoIncidente { servicioId; alerta; texto; numeroServicio }`.

- [ ] **Paso 1: El gancho de avisos**

Crear `frontend/src/lib/use-avisos-incidente.ts`:

```ts
'use client';

import { useEffect, useRef } from 'react';
import { API_URL } from './api';

export interface AvisoIncidente {
  servicioId: string;
  alerta: string;
  texto: string;
  numeroServicio: string | null;
}

/**
 * Avisos inmediatos de incidentes (EMERGENCIA, condicion critica, pedido urgente, recuento, nuevo
 * servicio) por el canal SSE del backend. Con ?solo=incidentes NO cuenta como "en linea" para el
 * despacho. EventSource reconecta solo; si la sesion vencio, la consulta periodica de la pantalla sigue
 * funcionando como respaldo.
 */
export function useAvisosIncidente(alRecibir: (a: AvisoIncidente) => void, activo = true) {
  const manejador = useRef(alRecibir);
  manejador.current = alRecibir;

  useEffect(() => {
    if (!activo || typeof EventSource === 'undefined') return;
    const fuente = new EventSource(`${API_URL}/despacho/stream?solo=incidentes`, { withCredentials: true });
    fuente.onmessage = (ev: MessageEvent<string>) => {
      try {
        const e = JSON.parse(ev.data) as { tipo?: string; servicioId?: string; datos?: { alerta?: string; texto?: string; numeroServicio?: string | null } };
        if (e.tipo === 'incidente' && e.servicioId && e.datos?.alerta) {
          manejador.current({ servicioId: e.servicioId, alerta: e.datos.alerta, texto: e.datos.texto ?? '', numeroServicio: e.datos.numeroServicio ?? null });
        }
      } catch {
        /* latido u otro formato */
      }
    };
    return () => fuente.close();
  }, [activo]);
}
```

- [ ] **Paso 2: Usarlo en las tres pantallas**

En `frontend/src/app/dashboard/servicios/operaciones/page.tsx`:

- Agregá `import { useAvisosIncidente } from '@/lib/use-avisos-incidente';`.
- Inmediatamente antes de `const enIncidente = useMemo(`, agregá:

```tsx
  // Un aviso critico refresca el tablero al instante; cargar() hace sonar el pitido si hay una alerta critica nueva.
  useAvisosIncidente(() => void cargar(), puedeVer);
```

En `frontend/src/app/dashboard/servicios/operaciones/[id]/page.tsx`:

- Agregá el mismo import.
- Inmediatamente después del `useEffect` que arma el `setInterval` de `cargar`, agregá:

```tsx
  useAvisosIncidente((a) => {
    if (a.servicioId === id) void cargar();
  });
```

En `frontend/src/app/incidente/[id]/page.tsx`:

- Agregá el mismo import.
- Inmediatamente después del segundo `useEffect` (el que registra `online`/`offline`), agregá:

```tsx
  // EMERGENCIA o un recuento con faltantes: vibra y lo muestra, sin esperar la consulta periodica.
  useAvisosIncidente((a) => {
    if (a.servicioId !== id) return;
    void cargar();
    if (a.alerta === 'EMERGENCIA' || a.alerta === 'PERSONAL_FALTANTE') {
      navigator.vibrate?.([400, 150, 400]);
      setAviso(a.texto);
    }
  });
```

- [ ] **Paso 3: Marca de no asignado en la cronología**

En `frontend/src/components/incidente/CronologiaIncidente.tsx`, reemplazá:

```tsx
                {e.usuario ?? 'Sistema'}{e.latitud !== null ? ' · con GPS' : ''}{e.origen === 'APP' ? ' · desde la app' : ''}
```

por:

```tsx
                {e.usuario ?? 'Sistema'}{e.latitud !== null ? ' · con GPS' : ''}{e.origen === 'APP' ? ' · desde la app' : ''}
                {e.datos?.fueraDeAsignacion ? ' · no figura en el incidente' : ''}
```

- [ ] **Paso 4: Modo noche (solo si DEC-3 fue "Sí")**

Si DEC-3 fue "No", saltá este paso y anotalo en el commit.

Al final de `frontend/src/app/globals.css` agregá:

```css
/* Modo noche del Modo Incidente (DEC-3): excepcion aprobada a la regla del tema claro, solo en /incidente.
   Redefine los tokens dentro de .mi-noche: todo lo que ya usa var(--…) cambia solo. */
.mi-noche {
  --paper: #000; --surface: #0b0b0b; --surface-soft: #161616; --ink: #fff; --muted: #d4d4d4;
  --line: #5c5c5c; --line-soft: #2a2a2a; --danger: #ff6b66; --success: #6ee7b7;
  --ok-fill: #0f3d2a; --bad-fill: #4d0f0f; --warn-fill: #4a3200; --info-fill: #10264d; --neutral-fill: #222;
}
.mi-noche .mi-boton-primario, .mi-noche .mi-opcion[aria-pressed="true"], .mi-noche .mi-boton[aria-expanded="true"] { color: #000; background: #fff; border-color: #fff; }
.mi-noche .mi-boton-peligro, .mi-noche .mi-opcion-critica[aria-pressed="true"] { color: #fff; background: #b91c1c; border-color: #ff6b66; }
.mi-noche .input-field { color: #fff; background: #111; border-color: #5c5c5c; }
.mi-noche a { color: #9cc3ff; }
```

En `frontend/src/app/incidente/[id]/page.tsx`:

- Agregá a los estados: `const [noche, setNoche] = useState(false);`
- En el primer `useEffect` (el de la sesión), después de `setMovilElegido(…)`, agregá `setNoche(leerLocal<boolean>('sigbo-modo-noche') ?? false);`
- Agregá la función:

```tsx
  const alternarNoche = () => {
    setNoche((n) => {
      guardarLocal('sigbo-modo-noche', !n);
      return !n;
    });
  };
```

- En **los dos** `<main className="mi-pagina"…>` de ese archivo, cambiá `className="mi-pagina"` por
  ``className={`mi-pagina${noche ? ' mi-noche' : ''}`}``.
- Dentro de `<header className="mi-cabecera">`, después de la línea de la dirección, agregá:

```tsx
        <button type="button" className="mi-opcion" aria-pressed={noche} onClick={alternarNoche}>{noche ? 'Modo día' : 'Modo noche'}</button>
```

En `frontend/src/app/incidente/page.tsx`, para que la lista respete la misma preferencia:

- Agregá `const [noche, setNoche] = useState(false);`.
- Dentro del `useEffect`, antes de `if (!obtenerSesion())`, agregá:

```ts
    try {
      setNoche(localStorage.getItem('sigbo-modo-noche') === 'true');
    } catch {
      /* sin almacenamiento */
    }
```

- Cambiá `className="mi-pagina"` por ``className={`mi-pagina${noche ? ' mi-noche' : ''}`}``.

- [ ] **Paso 5: Comprobaciones y commit**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npx tsc --noEmit 2>&1 | head -10 && npm run audit:contraste 2>&1 | tail -3 && npm run audit:a11y 2>&1 | tail -3
```

Resultado esperado: sin errores y auditorías en la línea base. La auditoría de contraste revisa los `.tsx`;
los colores del modo noche están en `globals.css`.

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/lib/use-avisos-incidente.ts frontend/src/app frontend/src/components/incidente
git commit -m "Incidentes (web): avisos inmediatos por SSE, marca de quien no figura en el incidente y modo noche

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 22: Frontend: control de personal en zona y tripulación desde la guardia

**Archivos:**

- Modificar: `frontend/src/app/incidente/[id]/page.tsx` (`PanelPersonal`), `frontend/src/app/dashboard/servicios/operaciones/[id]/page.tsx`, `operaciones/[id]/informe/page.tsx`
- Modificar: `frontend/src/app/dashboard/vehiculos/tripulacion/page.tsx`

**Interfaces:**

- Consume:
  - `POST /incidentes/:id/personal/:bomberoId/zona` y `POST /incidentes/:id/recuento` (tarea 18), siempre por `accionCampo`, así funcionan también sin red.
  - Del expediente: `personalEnZona`, `ultimoRecuento`, `tripulacion[].enZona`, `tripulacion[].zonaDesde` y `tripulacion[].funcion`.
  - `fotosOcultas` (tarea 19) y `obtenerGuardiaActual` (tarea 10).
- Produce: el panel PERSONAL con ENTRA/SALE por persona y RECUENTO para quien tiene `servicios:comandar`; la tarjeta "Control de personal" en el incidente; la tarjeta "Guardia actual" en tripulación.

- [ ] **Paso 1: Panel PERSONAL del Modo Incidente**

En `frontend/src/app/incidente/[id]/page.tsx`:

- Sumá `horaCorta` al import de `@/lib/fases-incidente`.
- Reemplazá **toda** la función `PanelPersonal` por:

```tsx
function PanelPersonal({ exp, cat, miDespachoId, puedeComandar, ocupado, alZona, alRecuento, alGuardar }: {
  exp: Expediente;
  cat: Catalogos | null;
  miDespachoId: string | null;
  puedeComandar: boolean;
  ocupado: boolean;
  alZona: (bomberoId: string, nombre: string, dentro: boolean) => void;
  alRecuento: (presentes: string[], faltantes: string[]) => void;
  alGuardar: (despachoId: string, lista: Integrante[]) => void;
}) {
  const mio = exp.despachos.find((d) => d.id === miDespachoId) ?? null;
  const codigo = new Map((cat?.funciones ?? []).map((f) => [f.nombre, f.codigo]));
  const [lista, setLista] = useState<Integrante[]>(
    () => mio?.tripulacion.map((t) => ({ bomberoId: t.bomberoId, funcion: t.funcion ?? codigo.get(t.rol) ?? cat?.funciones[0]?.codigo ?? '' })) ?? [],
  );
  const [recuento, setRecuento] = useState<Record<string, 'PRESENTE' | 'FALTA'> | null>(null);
  const personas = exp.despachos.filter((d) => d.activo).flatMap((d) => d.tripulacion.map((t) => ({ ...t, movil: d.movil })));
  const enZona = exp.personalEnZona; // todos los que estan adentro, sumados por solicitud incluidos
  const completo = recuento !== null && enZona.every((p) => recuento[p.bomberoId]);

  return (
    <section className="mi-panel" aria-labelledby="mi-p-personal">
      <h2 id="mi-p-personal" className="mi-texto">Personal: {enZona.length} en zona</h2>
      {personas.length === 0 && <p className="mi-texto">Sin tripulación registrada en los móviles del incidente.</p>}
      {personas.map((p) => (
        <div key={p.bomberoId} style={{ display: 'grid', gap: 6 }}>
          <p className="mi-texto" style={{ fontWeight: 700 }}>
            {p.nombre} · {p.rol} · {p.movil}{p.enZona && p.zonaDesde ? ` · en zona desde ${horaCorta(p.zonaDesde)}` : ''}
          </p>
          <div className="mi-grid">
            <button type="button" className="mi-opcion" aria-pressed={p.enZona} disabled={ocupado || p.enZona} onClick={() => alZona(p.bomberoId, p.nombre, true)}>ENTRA</button>
            <button type="button" className="mi-opcion" aria-pressed={!p.enZona} disabled={ocupado || !p.enZona} onClick={() => alZona(p.bomberoId, p.nombre, false)}>SALE</button>
          </div>
        </div>
      ))}

      {puedeComandar && enZona.length > 0 && (recuento === null ? (
        <button type="button" className="mi-boton mi-boton-primario" onClick={() => setRecuento({})}>RECUENTO DE PERSONAL</button>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          <h3 style={{ margin: 0, fontSize: 18 }}>Recuento: confirmá a cada persona</h3>
          {enZona.map((p) => (
            <div key={p.bomberoId} className="mi-grid">
              <span className="mi-texto" style={{ gridColumn: '1 / -1', fontWeight: 700 }}>{p.nombre}</span>
              <button type="button" className="mi-opcion" aria-pressed={recuento[p.bomberoId] === 'PRESENTE'}
                onClick={() => setRecuento((r) => ({ ...r, [p.bomberoId]: 'PRESENTE' }))}>PRESENTE</button>
              <button type="button" className="mi-opcion mi-opcion-critica" aria-pressed={recuento[p.bomberoId] === 'FALTA'}
                onClick={() => setRecuento((r) => ({ ...r, [p.bomberoId]: 'FALTA' }))}>NO RESPONDE</button>
            </div>
          ))}
          <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado || !completo}
            onClick={() => {
              if (!recuento) return;
              alRecuento(
                enZona.filter((p) => recuento[p.bomberoId] === 'PRESENTE').map((p) => p.bomberoId),
                enZona.filter((p) => recuento[p.bomberoId] === 'FALTA').map((p) => p.bomberoId),
              );
              setRecuento(null);
            }}>
            CONFIRMAR RECUENTO
          </button>
          <button type="button" className="mi-opcion" onClick={() => setRecuento(null)}>Cancelar recuento</button>
        </div>
      ))}

      {mio && cat && (
        <>
          <h3 style={{ margin: 0, fontSize: 16 }}>Corregir la tripulación de {mio.movil}</h3>
          <EditorTripulacion integrantes={lista} bomberos={cat.bomberos} funciones={cat.funciones} onChange={setLista} grande />
          <button type="button" className="mi-boton mi-boton-primario" disabled={ocupado} onClick={() => alGuardar(mio.id, lista)}>GUARDAR TRIPULACIÓN</button>
        </>
      )}
    </section>
  );
}
```

- Reemplazá el uso del panel:

```tsx
            <PanelPersonal exp={exp} cat={cat} miDespachoId={miDespacho?.id ?? null} ocupado={ocupado}
              alGuardar={(despachoId, lista) => void decision(() => ajustarTripulacion(id, despachoId, lista), 'Tripulación actualizada.')} />
```

  por:

```tsx
            <PanelPersonal exp={exp} cat={cat} miDespachoId={miDespacho?.id ?? null} puedeComandar={puedeComandar} ocupado={ocupado}
              alZona={(bomberoId, nombre, dentro) => void campo(`/personal/${bomberoId}/zona`, { dentro }, `${nombre}: ${dentro ? 'entra a' : 'sale de'} la zona`, `${nombre}: ${dentro ? 'en zona' : 'fuera de la zona'}.`)}
              alRecuento={(presentes, faltantes) => void campo('/recuento', { presentes, faltantes }, 'Recuento de personal', faltantes.length ? `Recuento enviado: ${faltantes.length} sin confirmar.` : 'Recuento: todos presentes.')}
              alGuardar={(despachoId, lista) => void decision(() => ajustarTripulacion(id, despachoId, lista), 'Tripulación actualizada.')} />
```

- En la cabecera, después de `<div className="mi-fase">…</div>`, agregá:

```tsx
        {exp.personalEnZona.length > 0 && <div style={{ fontSize: 16, fontWeight: 700 }}>{exp.personalEnZona.length} persona(s) en zona</div>}
```

- [ ] **Paso 2: Tarjeta "Control de personal" del incidente**

En `frontend/src/app/dashboard/servicios/operaciones/[id]/page.tsx`:

- En la celda de tripulación de la tabla de móviles, reemplazá
  ``d.tripulacion.map((t) => `${t.nombre} (${t.rol})`).join(', ')`` por
  ``d.tripulacion.map((t) => `${t.nombre} (${t.rol})${t.enZona ? ' · EN ZONA' : ''}`).join(', ')``.
- Inmediatamente antes de `<section className="card" aria-labelledby="titulo-situacion"`, agregá:

```tsx
          <section className="card" aria-labelledby="titulo-control" style={{ display: 'grid', gap: 6 }}>
            <h2 id="titulo-control" style={{ fontSize: 17, margin: 0 }}>Control de personal</h2>
            <p style={{ margin: 0, fontWeight: 700, color: exp.personalEnZona.length ? 'var(--ink)' : 'var(--muted)' }}>
              {exp.personalEnZona.length} persona(s) en zona
            </p>
            {exp.personalEnZona.map((p) => <p key={p.bomberoId} style={{ margin: 0, fontSize: 13 }}>{p.nombre} · desde {horaCorta(p.desde)}</p>)}
            {exp.ultimoRecuento && (
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: exp.ultimoRecuento.faltantes.length ? 'var(--danger)' : 'var(--success)' }}>
                Último recuento {horaCorta(exp.ultimoRecuento.ocurridoEn)}:{' '}
                {exp.ultimoRecuento.faltantes.length ? `sin confirmar ${exp.ultimoRecuento.faltantes.join(', ')}` : `${exp.ultimoRecuento.presentes} presentes`}
              </p>
            )}
          </section>
```

- [ ] **Paso 3: Informe: fotos ocultas**

En `frontend/src/app/dashboard/servicios/operaciones/[id]/informe/page.tsx`, inmediatamente antes de
`<section className="informe-seccion no-imprimir" aria-label="Fotos">`, agregá:

```tsx
        {inf.fotosOcultas > 0 && (
          <p className="no-imprimir" style={{ margin: 0, fontSize: 13, color: 'var(--muted)' }}>
            {inf.fotosOcultas} foto(s) de víctimas no se muestran: hacen falta permisos confidenciales.
          </p>
        )}
```

- [ ] **Paso 4: Tripulación desde la guardia**

En `frontend/src/app/dashboard/vehiculos/tripulacion/page.tsx`:

- Cambiá el import de `@/lib/incidentes` por
  `import { guardarTripulacion, obtenerGuardiaActual, obtenerTripulaciones, type GuardiaActual, type Integrante, type Tripulaciones } from '@/lib/incidentes';`
- Agregá `const [guardia, setGuardia] = useState<GuardiaActual | null>(null);` junto a los demás estados.
- En `cargar`, reemplazá `const d = await obtenerTripulaciones();` por:

```ts
      const [d, g] = await Promise.all([obtenerTripulaciones(), obtenerGuardiaActual().catch(() => null)]);
      setGuardia(g);
```

- Después del `useMemo` de `movilDe`, agregá:

```tsx
  // La guardia en curso primero en la lista, marcada: armar la tripulacion es repartir esa gente.
  const deGuardia = useMemo(() => new Set(guardia?.personal.map((p) => p.bomberoId) ?? []), [guardia]);
  const bomberosOrdenados = useMemo(() => (datos ? [
    ...datos.bomberos.filter((b) => deGuardia.has(b.id)).map((b) => ({ ...b, nombre: `${b.nombre} · de guardia` })),
    ...datos.bomberos.filter((b) => !deGuardia.has(b.id)),
  ] : []), [datos, deGuardia]);
  const sinMovil = guardia?.personal.filter((p) => !movilDe.has(p.bomberoId)) ?? [];
```

- En el `<EditorTripulacion …>`, cambiá `bomberos={datos.bomberos}` por `bomberos={bomberosOrdenados}`.
- Inmediatamente después de `{exito && <Aviso tipo="exito" texto={exito} />}`, agregá:

```tsx
      {guardia && (
        <section className="card" aria-labelledby="titulo-guardia" style={{ display: 'grid', gap: 6 }}>
          <h2 id="titulo-guardia" style={{ fontSize: 17, margin: 0 }}>Guardia actual</h2>
          {guardia.guardias.length === 0 ? (
            <p style={{ margin: 0, color: 'var(--muted)' }}>No hay una guardia en curso ni planificada para hoy.</p>
          ) : (
            <>
              <p style={{ margin: 0, fontSize: 13 }}>
                {guardia.guardias.map((g) => `${g.fecha} · ${g.turno.toLowerCase()} (${g.horaInicio.slice(0, 5)}–${g.horaFin.slice(0, 5)})`).join(' / ')} · {guardia.personal.length} persona(s)
              </p>
              <p style={{ margin: 0, fontSize: 13, fontWeight: 700, color: sinMovil.length ? 'var(--warning)' : 'var(--success)' }}>
                {sinMovil.length ? `Sin móvil asignado: ${sinMovil.map((p) => p.nombre).join(', ')}` : 'Toda la guardia tiene móvil asignado.'}
              </p>
            </>
          )}
        </section>
      )}
```

- [ ] **Paso 5: Comprobaciones y commit**

```bash
cd /c/Proyectos/Personal/SIGBO/frontend && npx tsc --noEmit 2>&1 | head -10 && npm run audit:a11y 2>&1 | tail -3 && npm run audit:contraste 2>&1 | tail -3 && npm test 2>&1 | tail -3
cd .. && node scripts/verificar-endpoints.mjs 2>&1 | tail -3
```

Resultado esperado: todo en verde y en la línea base; ningún endpoint del frontend sin ruta.

```bash
cd /c/Proyectos/Personal/SIGBO
git add frontend/src/app
git commit -m "Incidentes (web): control de personal en zona con recuento, fotos ocultas y tripulación desde la guardia

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

## Tarea 23: Punto de control B: recorrido automatizado en el navegador

Sustituye a la revisión manual dispersa en las tareas 11 a 15 y 21 a 22: un mismo recorrido, hecho con las
herramientas de navegador de la sesión y con capturas como evidencia. **No agrega dependencias.**

**Archivos:** ninguno de código. Las capturas van al directorio temporal de la sesión, no al repo.

**Interfaces:**

- Consume: backend y frontend levantados, `admin` y un usuario con solo `servicios:operar` (por ejemplo `bombero`).

- [ ] **Paso 1: Herramientas**

Cargá las herramientas de navegador disponibles con `ToolSearch`, en una sola llamada. Por ejemplo, las de
Playwright (`mcp__plugin_playwright_playwright__browser_navigate`, `browser_click`, `browser_type`,
`browser_snapshot`, `browser_take_screenshot`, `browser_resize`, `browser_evaluate`) o las de Chrome DevTools
(`navigate_page`, `click`, `fill`, `take_snapshot`, `take_screenshot`, `emulate`, `resize_page`). Si no hay ninguna
disponible, avisale al usuario y hacé el recorrido a mano siguiendo los mismos pasos.

- [ ] **Paso 2: Recorrido (en pantalla de escritorio, con `admin`)**

1. Login → **Servicios → Centro de operaciones**: cargan contadores, alertas y mapa. Captura.
2. **+ Nuevo servicio**: tipo y dirección. Crea y lleva al incidente. Anotá el número.
3. **Despacho rápido**: un móvil con "Asignar y salir" y otro con "Solo asignar". La tabla muestra "Falta: LLEGAMOS" y "Falta: SALIMOS". Captura.
4. **Vehículos → Tripulación**: se ve la tarjeta "Guardia actual"; cargá la tripulación de un móvil y guardala.

- [ ] **Paso 3: Recorrido en celular (360 × 740, usuario con `servicios:operar` en la tripulación del móvil "Solo asignar")**

Redimensioná la ventana a 360 × 740 y abrí `/incidente/<id>`:

1. **SALIMOS** → **LLEGAMOS**. Si el navegador pide la ubicación, aceptala; en ese caso la cronología muestra "con GPS". Captura.
2. **SITUACIÓN** → "Incendio activo" y después "Incendio controlado": queda marcado solo el segundo.
3. **PERSONAL** → **ENTRA** para una persona. La cabecera dice "1 persona(s) en zona".
4. **SOLICITAR RECURSO** → Ambulancia → URGENTE → CONFIRMAR.
5. **Sin conexión**: activá el modo sin red de la herramienta (en Chrome DevTools, `emulate` con `networkConditions: "Offline"`). Tocá **COMUNICACIÓN** → "Situación bajo control". Aparece "SIN CONEXIÓN — 1 acción pendiente". Volvé a conectar: en menos de 10 s se envía sola y aparece en la cronología con la hora del toque. Si la herramienta no puede simular la red, hacé este punto a mano y anotalo.
6. **EMERGENCIA**: el primer toque arma el botón y el segundo lo envía. Captura.
7. Si DEC-3 fue "Sí": **Modo noche** cambia los colores y se mantiene al recargar.

- [ ] **Paso 4: De vuelta en la central (`admin`, escritorio)**

1. El Centro de Operaciones muestra la EMERGENCIA arriba **sin esperar 5 s**: llega por el canal en tiempo real. **Marcar atendida.**
2. En el incidente, la tarjeta **Control de personal** muestra la persona en zona. Desde el Modo Incidente con `admin` (tiene `servicios:comandar`): **RECUENTO** → marcala "NO RESPONDE" → CONFIRMAR. La central recibe la alerta crítica "Recuento con personal sin confirmar".
3. Hacé un recuento con todos presentes, después **SALE**, **CONTROLADO**, **RETORNANDO** y **DISPONIBLE** para cada móvil.
4. **Informe y cierre**: cerralo. El informe tiene tiempos, distancia, personal, recursos y cronología, sin haber cargado datos a mano. Captura del informe.

- [ ] **Paso 5: Criterio de aceptación y E2E permanente**

Escribí en `.context/INCIDENTES.md` §6 el número del incidente de este recorrido, y en §7 todo lo que haya
hecho falta tipear durante la operación de campo, porque la meta es que no haga falta nada.

Preguntale al usuario (`AskUserQuestion`) si quiere convertir este recorrido en una **prueba automática
permanente** con `@playwright/test`. Es software libre, pero sería una dependencia nueva del frontend, y este
plan no permite agregarlas sin aprobación. Si dice que sí, no la agregues en este corte: anotala en
`.context/INCIDENTES.md` §7 como próxima tarea.

No hay commit en esta tarea, salvo las anotaciones en `.context/INCIDENTES.md` que la tarea 24 ya incluye.

---

## Tarea 24: Documentación, grafo y verificación final

**Archivos:**

- Modificar: `.context/INCIDENTES.md` (lo creó la tarea 0 con las decisiones)
- Crear: `.context/graph/curated/decision/decision--incidente-es-el-servicio.md`, `decision--bitacora-unica-del-incidente.md`
- Crear: `.context/graph/curated/rule/rule--bitacora-del-incidente-inmutable.md`, `rule--personal-en-zona-no-se-libera-solo.md`
- Crear: `.context/graph/curated/workflow/workflow--ciclo-del-incidente.md`
- Modificar: `.context/contexto.md` (Documentos por tarea), y los derivados del grafo (`node .context/graph/build-graph.mjs`)

**Interfaces:**

- Consume: todo lo anterior, con el backend levantado y la base local.
- Produce: evidencia de que el corte cumple el criterio de aceptación (salida del script y revisión
  manual) y la documentación que leen las sesiones siguientes.

- [ ] **Paso 1: Reejecutar la prueba viva**

Con el frontend ya terminado, corré otra vez la prueba de la tarea 20 (backend levantado y proceso nuevo):

```bash
cd /c/Proyectos/Personal/SIGBO && node scripts/smoke-incidente.mjs --usuario admin --password "$SIGBO_DEMO_PASSWORD" --confirmar
```

Resultado esperado: todos los pasos `OK`. Anotá el número del incidente que deja.

- [ ] **Paso 2: Documentación de la sesión**

Completá `.context/INCIDENTES.md`, que la tarea 0 creó con las decisiones del cuartel: agregá **debajo** de
la sección "0. Decisiones del cuartel" este contenido:

```markdown
Corte 1 (núcleo + web operativa). Spec: `docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md`.
Plan: `docs/superpowers/plans/2026-10-07-centro-operaciones-incidentes.md`. El código manda:
`backend/src/modules/incidente-nucleo/`, `backend/src/modules/incidentes/`, `frontend/src/app/dashboard/servicios/operaciones/`,
`frontend/src/app/incidente/`.

## 1. Qué es

El incidente **es** el servicio (`servicios.servicios`), con una fase operativa de 10 estados y un resultado.
El `estado` heredado se deriva de la fase (`estadoDesdeFase`), así flota, servicio activo, comunicaciones y la
app siguen leyendo lo mismo. Toda acción deja un evento en `servicios.incidente_eventos` **en la misma
transacción**; la tabla rechaza UPDATE y DELETE (disparador, error 51093).

## 2. Fases

RECIBIDO → EVALUACIÓN → DESPACHADO → EN CAMINO → EN LUGAR → OPERANDO → CONTROLADO → RETORNO → DISPONIBLE → CERRADO.
Las automáticas (solo avanzan) son: primer despacho, primera salida, primera llegada, primera acción operativa
en el lugar, todos retornando y todos de vuelta. Las manuales son: evaluación, operando, controlado, se
reactivó, resultado y cierre.

Los alternativos (falsa alarma, cancelado, derivado, no atendido, sin acceso, sin intervención) son
**resultados**. Con móviles afuera, la fase pasa a RETORNO; sin haber despachado, el incidente se cierra en el acto.

## 3. Permisos

- `servicios:ver/crear/despachar/finalizar`: existentes.
- `servicios:operar`: Modo Incidente. Se dio a todo rol con `despacho:responder`, y con él `adjuntos:subir`.
- `servicios:comandar`: a los roles con `servicios:finalizar`.
- `vehiculos:tripulacion`: a los roles con `servicios:despachar`.
- `despacho:confidencial`: existente; ahora también protege las fotos de víctimas.

## 4. Tiempo real y seguridad del personal

- **Avisos inmediatos.** EMERGENCIA, condición crítica, pedido urgente, recuento con faltantes y nuevo servicio
  llegan por `GET /despacho/stream?solo=incidentes`, que no cuenta como presencia del despacho. El resto se
  actualiza por consulta cada 5 s.
- **Control de personal.** ENTRA/SALE por persona y RECUENTO (PAR) del comando. Nadie se libera solo: si los
  móviles vuelven con alguien en zona, la central recibe una alerta, y el cierre se rechaza.
- **Fotos de víctimas.** Solo con `despacho:confidencial`; cada acceso se audita como `ACCESO_CONFIDENCIAL`.
- **Quien no figura en el incidente** queda marcado o es rechazado, según DEC-2. La EMERGENCIA nunca se bloquea.

## 5. Pantallas

- Centro de operaciones: `/dashboard/servicios/operaciones`.
- Incidente: `…/[id]`.
- Informe y cierre: `…/[id]/informe`.
- Modo Incidente: `/incidente/[id]`, fuera del dashboard, con modo noche si DEC-3 lo aprobó.
- Tripulación: `/dashboard/vehiculos/tripulacion`, con la guardia actual.

## 6. Pruebas y registros de prueba

Backend:

- Suites nuevas: `incidente.logica.spec`, `incidente-nucleo.spec`, `tripulacion.spec`, `recepcion/expediente/acciones/cierre/avisos.spec`.
- Casos nuevos en suites existentes: `flota.service.spec`, `campo.spec`, `despacho.spec` y `servicio-activo.spec`.

Frontend: `cola-incidente.test.mjs` y `fases-incidente.test.mjs`. Prueba viva:
`node scripts/smoke-incidente.mjs … --confirmar`. Recorrido en el navegador: tarea 23 del plan.

Registros de prueba en la base local (no se pueden borrar):

- Evento de prueba de inmutabilidad (migración 093) sobre `PRUEBA-TECNICA-001`.
- <número> — incidente de `smoke-incidente.mjs` (tarea 20) del <fecha>.
- <número> — incidente del recorrido en el navegador (tarea 23) del <fecha>.
- <número> — incidente de `smoke-incidente.mjs` (tarea 24) del <fecha>.

## 7. Límites conocidos y pendientes

- Sin red, la web no abre el Modo Incidente desde cero; lo resuelve la app (corte siguiente).
- Las fotos no se encolan sin conexión en la web.
- Los servicios creados con el formulario largo nacen RECIBIDO (ajuste D6) hasta que la comunicación se genere desde el incidente.
- Las fotos confidenciales usan el permiso, no la matriz de pantallas.
- Quien se suma por solicitud entra al personal recién cuando se registra en zona.
- Lo que hubo que tipear en el recorrido de la tarea 23: <lista, o "nada">.
- Prueba E2E permanente con `@playwright/test`: <decisión del usuario en la tarea 23>.
```

Reemplazá los `<número>` y `<fecha>` con los datos reales de las tareas 20, 23 y del paso 1 antes del commit.

En `.context/contexto.md`, en "Documentos por tarea", agregá después de la línea de `DESPACHO.md`:

```markdown
- [INCIDENTES.md](<INCIDENTES.md>) — Centro de Operaciones e Incidentes: fases, bitácora, permisos y pruebas
```

- [ ] **Paso 3: Nodos curados del grafo**

Crear `.context/graph/curated/decision/decision--incidente-es-el-servicio.md`:

```markdown
---
id: decision--incidente-es-el-servicio
tipo: DECISION
nombre: El incidente es el servicio; la fase operativa es nueva y el estado heredado se deriva de ella
nivel: L1
resumen: No hay tabla de incidentes paralela. servicios.servicios suma fase_operativa (10 fases) y resultado; estado (5 valores) se calcula siempre con estadoDesdeFase para no romper flota, servicio activo ni la app.
estado: VIGENTE
dominio: servicios
fuente: docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md
archivos: [backend/src/modules/incidente-nucleo/incidente.logica.ts, backend/src/modules/incidente-nucleo/motor-fases.service.ts, database/migrations/093_centro_operaciones_incidentes.sql]
terminos: [incidente, fase, fase operativa, resultado, estado, sci, centro de operaciones]
edges:
  - [constrains, entity--despacho]
---

## Decisión

El pedido del Centro de Operaciones exigía no duplicar servicios ni móviles. El servicio ya tenía número,
tipo, prioridad (`gravedad`), comandante (`jefe_servicio_id`), llamados, despachos, víctimas y fotos.
Se agregó lo que faltaba (fase fina y resultado) y el estado viejo pasó a ser **derivado**.

## Costo aceptado

- Todo código que escriba `servicio.estado` tiene que pasar por `MotorFases`, o la fase y el estado se separan.
- Los servicios creados por la comunicación (formulario largo) nacen RECIBIDO hasta que el corte 4 genere la
  comunicación desde el incidente.
```

Crear `.context/graph/curated/decision/decision--bitacora-unica-del-incidente.md`:

```markdown
---
id: decision--bitacora-unica-del-incidente
tipo: DECISION
nombre: Una bitácora única por incidente, escrita en la misma transacción por cada flujo
nivel: L1
resumen: servicios.incidente_eventos recibe un evento por acción (recepción, despachos, pasos del móvil, situación, pedidos, víctimas, fotos, chat, comunicación, emergencia, cierre) dentro de la transacción de esa acción; informe y tablero leen una sola tabla.
estado: VIGENTE
dominio: servicios
fuente: docs/superpowers/specs/2026-10-06-centro-operaciones-incidentes-design.md
archivos: [backend/src/modules/incidente-nucleo/cronologia.service.ts, backend/src/modules/flota/flota.service.ts, backend/src/modules/incidentes/acciones.service.ts]
terminos: [bitacora, cronologia, eventos, incidente, idempotencia, una accion un evento]
edges:
  - [constrains, entity--despacho]
---

## Decisión

Se descartó armar la cronología al leer desde siete tablas (una de ellas editable) y ampliar `historial_servicios`
(mezcla GPS con hechos y admite edición). Cada evento lleva hora del hecho acotada, usuario, móvil, GPS, fase
anterior y nueva, fuente y clave de idempotencia.

## Costo aceptado

Flota, campo y despacho tocan `CronologiaService` en su transacción; los servicios anteriores a la migración 093
no tienen cronología.
```

Crear `.context/graph/curated/rule/rule--bitacora-del-incidente-inmutable.md`:

```markdown
---
id: rule--bitacora-del-incidente-inmutable
tipo: RULE
nombre: La bitácora del incidente solo se agrega: la base rechaza UPDATE y DELETE
nivel: L1
resumen: servicios.incidente_eventos tiene el disparador TR_incidente_eventos_inmutable (error 51093); un evento mal registrado se corrige con otro evento, nunca editando.
severidad: CRITICA
dominio: servicios
fuente: database/migrations/093_centro_operaciones_incidentes.sql
archivos: [database/migrations/093_centro_operaciones_incidentes.sql, backend/src/modules/incidente-nucleo/cronologia.service.ts]
terminos: [bitacora, inmutable, trigger, incidente, eventos, auditoria]
edges:
  - [affects, entity--despacho]
---

## Invariante

Mismo criterio que [[rule--linea-de-tiempo-inmutable]]: una garantía de trazabilidad no depende de que el
código se porte bien. Los registros de prueba quedan para siempre: documentarlos en `.context/INCIDENTES.md` §6.
```

Crear `.context/graph/curated/workflow/workflow--ciclo-del-incidente.md`:

```markdown
---
id: workflow--ciclo-del-incidente
tipo: WORKFLOW
nombre: Ciclo del incidente: de la recepción al informe
nivel: L1
resumen: La central recibe y despacha; la dotación toca SALIMOS/LLEGAMOS/RETORNANDO/DISPONIBLE; el comando marca situación, pide recursos y controla; el cierre mínimo deja el informe armado con la bitácora.
dominio: servicios
fuente: backend/src/modules/incidentes/acciones.service.ts
archivos: [backend/src/modules/incidentes, backend/src/modules/incidente-nucleo, frontend/src/app/incidente, .context/INCIDENTES.md]
terminos: [incidente, recepcion, despacho, salimos, llegamos, situacion, pedido, emergencia, controlado, cierre, informe]
edges:
  - [contains, rule--bitacora-del-incidente-inmutable]
  - [contains, rule--hora-del-hecho-acotada]
---

1. **Recibir** (`servicios:crear`): tipo y dirección; crea llamado + servicio RECIBIDO.
2. **Despachar** (`servicios:despachar`): uno o varios móviles, "asignar y salir" o "solo asignar"; hereda la tripulación.
3. **Campo** (`servicios:operar`): pasos del móvil con GPS, situación, pedidos, víctimas, fotos, comunicación, EMERGENCIA; sin red se encolan.
4. **Comando** (`servicios:comandar`): asumir comando, controlado, se reactivó, resultado.
5. **Retorno y disponibilidad**: las fases avanzan solas con los móviles.
6. **Cierre** (`servicios:finalizar`): cómo terminó, víctimas, daños, observaciones, tripulación; rechaza con móviles afuera.
```

Crear `.context/graph/curated/rule/rule--personal-en-zona-no-se-libera-solo.md`:

```markdown
---
id: rule--personal-en-zona-no-se-libera-solo
tipo: RULE
nombre: Una persona registrada en zona solo sale cuando alguien registra su salida
nivel: L1
resumen: personal_servicio.en_zona nunca se apaga solo (ni al retornar el móvil ni al cerrar); con alguien adentro y los móviles de vuelta la central recibe una alerta y el cierre se rechaza.
severidad: CRITICA
dominio: servicios
fuente: backend/src/modules/incidentes/acciones.service.ts
archivos: [backend/src/modules/incidentes/acciones.service.ts, backend/src/modules/incidentes/cierre.service.ts, backend/src/modules/incidentes/expediente.service.ts]
terminos: [control de personal, zona, recuento, par, seguridad, bombero atrapado]
edges:
  - [affects, entity--despacho]
---

## Invariante

Liberar a alguien automáticamente cuando su móvil retorna esconde justo el caso que importa: la persona que
quedó adentro. Por eso la salida se registra siempre a mano (ENTRA/SALE en el Modo Incidente) y el recuento
del comando (PAR) confirma a cada persona. Ver [[workflow--ciclo-del-incidente]].
```

- [ ] **Paso 4: Regenerar y validar el grafo**

```bash
cd /c/Proyectos/Personal/SIGBO && node .context/graph/build-graph.mjs 2>&1 | tail -3 && node .context/graph/validar.mjs 2>&1 | head -15; echo "salida: $?"
```

Resultado esperado: el encabezado de `validar.mjs` sin ERRORES (los AVISOS se leen y se anotan) y salida 0.
Si marca una arista hacia un nodo inexistente, cambiá el destino por uno que exista (por ejemplo
`component--modulo-despacho`) o quitá la arista.

- [ ] **Paso 5: Verificación completa**

```bash
cd /c/Proyectos/Personal/SIGBO/backend && npx tsc --noEmit -p tsconfig.json && npm test 2>&1 | tail -6
cd ../frontend && npx tsc --noEmit && npm test 2>&1 | tail -4 && npm run audit:contraste 2>&1 | tail -2 && npm run audit:a11y 2>&1 | tail -2
cd .. && node scripts/verificar-endpoints.mjs 2>&1 | tail -3
```

Resultado esperado:

- Backend: `tsc` limpio y todas las suites en verde. La cuenta es la inicial más las 9 nuevas.
- Frontend: `tsc` limpio, pruebas en verde y auditorías en su línea base.
- Ningún endpoint del frontend sin ruta en el backend.

**Criterio de aceptación de la spec (§1).** Con el usuario `comandante` en un celular (o el emulador
360 × 740), gestioná el incidente de la revisión manual durante varios minutos **sin escribir ningún
formulario**, solo con botones: SALIMOS, LLEGAMOS, SITUACIÓN, SOLICITAR RECURSO, FOTO, COMUNICACIÓN,
CONTROLADO, RETORNANDO y DISPONIBLE. Después, desde la web, cerralo con el cierre mínimo. El informe
tiene que mostrar la cronología completa con horas, GPS y autores, los tiempos y el personal sin haber
cargado ningún dato a mano. Si algo hay que tipear, anotalo como hallazgo en `.context/INCIDENTES.md` §7.

- [ ] **Paso 6: Commit**

```bash
cd /c/Proyectos/Personal/SIGBO
git add .context
git commit -m "Incidentes: documentación, nodos del grafo y verificación final

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
git log --oneline -17
```

Al terminar, preguntá al usuario si sube los commits a GitHub (`git push origin main`). No lo hagas sin
que lo pida.

---

## Después de este corte (recomendación para confirmar con el comando del cuartel)

Al terminar, mostrale al usuario este orden propuesto para los cortes siguientes. **No lo ejecutes**: cada uno
lleva su propia especificación y su propio plan.

1. **App Flutter con el Modo Incidente sin conexión.** Hoy la web solo trabaja sin red si la página ya estaba
   abierta; en un sótano no se puede abrir desde cero. La app ya tiene cola local.
2. **Comunicación oficial generada desde el incidente.** Elimina la doble carga del formulario largo, que va
   contra "nunca preguntar dos veces", y resuelve el ajuste D6.
3. **SCI completo:** oficiales de comando, objetivos, sectores, instituciones externas, desmovilización por
   recurso, checklists por tipo y detalle de víctimas con permiso.
4. **Voz a datos estructurados** (Whisper y Ollama locales), siempre con Confirmar o Editar.
5. **Estadísticas** de servicios, personal, móviles, recursos y tiempos (los minutos de servicio ya quedan guardados).
6. **Administración de catálogos** en pantalla y, si se aprueba la dependencia, la prueba E2E permanente con `@playwright/test`.
