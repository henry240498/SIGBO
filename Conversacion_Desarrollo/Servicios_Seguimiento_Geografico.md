# Servicios — Seguimiento Geográfico y Operativo

**Fecha:** 2026-08-28
**Estado final:** Completado y probado. Web funcionando de punta a punta; arquitectura preparada para que una futura APP alimente GPS sin rediseño.

## Contexto

Pedido del usuario: "SIGBO — EXTENSIÓN DEL MÓDULO SERVICIOS — SEGUIMIENTO GEOGRÁFICO, RUTAS Y PRUEBAS DE COMUNICACIÓN" (30 secciones). Extiende el módulo Servicios (ya operativo — ver `docs/MODULO_SERVICIOS_ANALISIS.docx`, generado en la sesión inmediatamente anterior a esta) con una capa nueva de seguimiento geográfico, sin tocar el flujo existente de la Comunicación de Servicio.

## Objetivo

Agregar, dentro de la ficha de cada servicio, una sección "🗺️ Seguimiento Geográfico y Operativo" con: mapa interactivo, ruta planificada por el RO (Responsable de Operaciones), eventos del recorrido, y pruebas de comunicación/radio con escala 1–5, calculando distancia al cuartel automáticamente. Explícitamente **no** se pidió desarrollar la app móvil ni el GPS automático — solo dejar la base preparada.

## Estado inicial (lo que ya existía, verificado antes de tocar código)

- **Módulo Servicios** funcionalmente completo para su flujo principal (crear/editar/finalizar/exportar PDF una Comunicación de Servicio). Documentado en detalle en el análisis previo.
- **`servicios.servicios`** ya tenía `coordenadas_lat`/`coordenadas_lon` (ubicación del incidente) y un `estado` con 5 valores posibles en el CHECK (`REGISTRADO/DESPACHADO/EN_CURSO/FINALIZADO/CANCELADO`), pero el código solo usaba 3.
- **`servicios.historial_servicios`**: tabla creada en la migración original (`007_servicios.sql`), **sin entidad TypeORM y sin ninguna fila real** — exactamente el candidato que el pedido pedía revisar y reutilizar antes de crear algo nuevo.
- **Permisos `servicios:despachar` y `servicios:ver_gps`**: sembrados y asignados a roles (Comandante, Jefe de Guardia) desde hace semanas, pero **ningún endpoint los usaba** — huérfanos.
- **`organizacion.cuarteles`**: sin columnas de coordenadas. No había forma de saber "dónde está el cuartel".
- **Sin integración de mapas embebida**: el único vínculo con Google Maps eran enlaces externos ("Navegar con Google Maps/Waze"), sin clave de API, sin mapa interactivo en ninguna pantalla.
- **Frontend con exactamente 3 dependencias** (`next`, `react`, `react-dom`) — ninguna librería de mapas.
- No existía ningún catálogo de "centro de salud" ni un rol/permiso explícito llamado "RO"; sí existía `servicio.oficialRoId` (FK a `personal.bomberos`, sin usar) y las posiciones de nómina `RO1`/`RO2` (registro de guardia, concepto distinto).

## Análisis y decisiones técnicas

1. **Librería de mapa**: el pedido asumía que ya existía integración con Google Maps para reutilizar. Verificado que no existe (sin clave de API, sin librería instalada). Se consultó al usuario explícitamente; eligió **Leaflet + OpenStreetMap** (sin clave de API, sin costo recurrente) en vez de Google Maps JavaScript API (hubiera bloqueado el desarrollo hasta conseguir una clave con facturación). Es la primera dependencia nueva del frontend en la historia del proyecto.
2. **`historial_servicios` se reutiliza, no se duplica**, tal como pedía la sección 1: se le agregaron columnas (`movil_id`, `observacion`) y se reemplazó el `CHECK` de `tipo_evento` por el vocabulario de la sección 13 del pedido. Como la tabla nunca tuvo filas reales, no hubo datos que migrar.
3. **"Ruta planificada" vive en una tabla nueva** (`servicios.rutas_planificadas`), separada de `historial_servicios`, porque son conceptualmente distintas: la ruta planificada se autoría una sola vez, completa, por el RO (un `UPDATE` que reemplaza todo el arreglo de puntos); la ruta realizada es un flujo de eventos que crece con el tiempo (uno por posición GPS). Forzarlas a la misma tabla habría mezclado dos patrones de escritura muy distintos. Los puntos se guardan como JSON (mismo criterio ya usado en `comunicaciones_servicio.datos` — `decision--comunicacion-como-json`): es una lista que siempre se lee completa, nunca se consulta punto por punto con SQL.
4. **"Ruta realizada" = las filas de `historial_servicios` con `tipo_evento = 'GPS'`, ordenadas por fecha/hora**, no una tabla aparte. Esto es clave para la sección 17-19 del pedido: cuando exista la app, cada posición GPS que envíe es una fila más en esta misma tabla — no hace falta ningún cambio de estructura.
5. **"Pruebas de comunicación" tienen tabla propia** (`servicios.pruebas_comunicacion`), no son un evento más de `historial_servicios`, porque la sección 25 del pedido pide estadísticas futuras (promedio de nivel, distancia de degradación) que exigen columnas `nivel`/`distancia_metros` consultables por SQL — no un valor más adentro de un JSON.
6. **Permisos: se reutilizaron los dos que ya existían**, sin crear ninguno nuevo. `servicios:ver_gps` gatea la sección completa (mismo patrón ya probado en el sistema para `denuncias:ver_datos_tecnicos`); `servicios:despachar` gatea cualquier escritura (crear/editar/eliminar ruta, eventos, pruebas). No se hizo la separación en 5 permisos distintos que enumeraba la sección 21 del pedido ("ver servicio/ver ubicación/ver ruta/registrar eventos/modificar ruta") — se consideró sobre-ingeniería para una primera iteración; los dos permisos existentes ya cubren la distinción esencial (ver vs. escribir). Documentado como decisión abierta a revisar si se necesita más granularidad.
7. **No se implementaron transiciones nuevas de estado del Servicio** (`DESPACHADO`/`EN_CURSO`). La sección 16 del pedido describe esa máquina de estados como "la idea futura", y la sección 2 pide explícitamente no modificar innecesariamente los estados actuales. En su lugar, la disponibilidad del seguimiento geográfico depende de que la Comunicación no esté en estado terminal (`FINALIZADA`/`ANULADO`) — la señal que el sistema ya maneja de forma confiable. Se documenta como pendiente explícito (ver más abajo).
8. **Distancia calculada en el servidor** (fórmula de Haversine), nunca confiando en que el usuario la escriba, tal como pedía la sección 12. Se guarda un snapshot en cada prueba (no una referencia al cuartel), para que el historial no cambie si algún día se corrigen las coordenadas del cuartel.
9. **Resolución del cuartel de referencia**: si hay más de un cuartel activo con coordenadas cargadas, el sistema no elige ninguno (evita adivinar mal) — hoy la institución tiene un solo cuartel activo, así que funciona sin ambigüedad. Documentado como límite conocido.
10. **`organizacion.cuarteles` no tenía coordenadas y no había forma de cargarlas.** Se agregaron `latitud`/`longitud` a la entidad, el DTO y la pantalla de Cuarteles existente (dos campos nuevos, mismo patrón que los campos ya existentes) — sin esto, la sección de seguimiento no tenía forma de mostrar el cuartel ni calcular distancias en un sistema real, no solo en la prueba.

## Cambios realizados

### Base de datos — migración `071_servicios_seguimiento_geografico.sql`

- `organizacion.cuarteles`: + `latitud DECIMAL(10,8)`, `longitud DECIMAL(11,8)` (nullable).
- `servicios.historial_servicios`: + `movil_id UNIQUEIDENTIFIER` (FK a `vehiculos.vehiculos`), `observacion NVARCHAR(MAX)`; se agregaron las FK que le faltaban (`servicio_id` con `ON DELETE CASCADE`, `movil_id`, `creado_por`); se reemplazó `CK_hser_tipo` por el vocabulario nuevo (`SALIDA_CUARTEL`, `LLEGADA_SERVICIO`, `SALIDA_SERVICIO`, `LLEGADA_CENTRO_SALUD`, `SALIDA_CENTRO_SALUD`, `REGRESO_CUARTEL`, `FIN_SERVICIO`, `PUNTO_CONTROL`, `GPS`, `INCIDENTE`, `OBSERVACION`, `OTRO`).
- **Tabla nueva** `servicios.rutas_planificadas` (id, servicio_id único, puntos JSON, auditoría creado/actualizado).
- **Tabla nueva** `servicios.pruebas_comunicacion` (id, servicio_id, movil_id, latitud, longitud, distancia_metros, nivel 1–5 con CHECK, observación, auditoría de creación).
- No se agregaron permisos nuevos (se reutilizaron los existentes).

### Backend

- **Entidades nuevas**: `historial-servicio.entity.ts`, `ruta-planificada-servicio.entity.ts`, `prueba-comunicacion-servicio.entity.ts`.
- **Entidad extendida**: `cuartel.entity.ts` (+ `latitud`/`longitud`).
- **Módulo nuevo, separado de `ServiciosService`/`ServiciosController`** (que quedaron sin tocar): `backend/src/modules/servicios/seguimiento/`
  - `seguimiento-geografico.service.ts` — resumen, ruta planificada (guardar/eliminar), eventos (crear/editar/eliminar), pruebas de comunicación (crear/editar/eliminar), cálculo de distancia (Haversine), resolución del cuartel de referencia, auditoría de cada escritura.
  - `seguimiento-geografico.controller.ts` — endpoints bajo `/api/v1/servicios/:servicioId/seguimiento`.
  - `dto/seguimiento-geografico.dto.ts`.
- **`servicios.module.ts`**: se agregaron las entidades y el nuevo controller/service al registro existente (única modificación al archivo — no se tocó `ServiciosController`/`ServiciosService`).
- **Cuarteles** (`cuarteles.service.ts`, `dto/create-cuartele.dto.ts`): + `latitud`/`longitud` opcionales.

### Frontend

- **Dependencia nueva**: `leaflet` + `@types/leaflet`.
- `frontend/src/app/layout.tsx`: + import de `leaflet/dist/leaflet.css` (obligatorio para que Leaflet renderice).
- **Componentes nuevos**:
  - `components/MapaSeguimiento.tsx` — el mapa Leaflet en sí (capa de presentación pura: dibuja marcadores/rutas y reporta clics; no tiene estado de negocio). Cargado siempre con `next/dynamic(..., { ssr: false })` porque Leaflet exige `window`.
  - `components/SeguimientoGeografico.tsx` — la sección completa: botones (Definir ruta / Agregar evento / Prueba de comunicación), leyenda, panel de captura de datos pendientes, listas de eventos y pruebas con eliminar, gateo por permiso.
- `lib/seguimiento-geografico.ts` — tipos y llamadas a la API nueva.
- `app/dashboard/servicios/nuevo/page.tsx`: se agregó `servicioId` al estado (se completa al cargar o guardar una comunicación existente) y se renderiza `<SeguimientoGeografico servicioId={...}>` después del paso 4, fuera del wizard — visible solo cuando ya existe un servicio guardado. Es el único cambio a este archivo; el resto del formulario (847 líneas) quedó intacto.
- `app/dashboard/organizacion/cuarteles/page.tsx`: + campos Latitud/Longitud en el formulario existente.

## Endpoints nuevos

Base `/api/v1/servicios/:servicioId/seguimiento`, todos con `JwtAuthGuard` + `PermissionsGuard`:

| Método y ruta | Permiso | Qué hace |
|---|---|---|
| `GET /` | `servicios:ver_gps` | Resumen completo: servicio, incidente, cuartel, ruta planificada, ruta realizada, eventos, pruebas |
| `POST /ruta-planificada` | `servicios:despachar` | Crea o reemplaza la ruta planificada (upsert por servicio) |
| `DELETE /ruta-planificada` | `servicios:despachar` | Elimina la ruta planificada |
| `POST /eventos` | `servicios:despachar` | Registra un evento geográfico |
| `PATCH /eventos/:eventoId` | `servicios:despachar` | Edita destino/observación de un evento |
| `DELETE /eventos/:eventoId` | `servicios:despachar` | Elimina un evento |
| `POST /pruebas-comunicacion` | `servicios:despachar` | Registra una prueba (calcula distancia en el servidor) |
| `PATCH /pruebas-comunicacion/:pruebaId` | `servicios:despachar` | Edita la observación de una prueba |
| `DELETE /pruebas-comunicacion/:pruebaId` | `servicios:despachar` | Elimina una prueba |

Además, `PATCH /organizacion/cuarteles/:id` ahora acepta `latitud`/`longitud`.

## Permisos

Sin permisos nuevos. Se activaron por primera vez los dos que ya existían sembrados:

- `servicios:ver_gps` — ver la sección completa de seguimiento geográfico.
- `servicios:despachar` — crear, editar y eliminar ruta planificada, eventos y pruebas de comunicación.

Ambos ya estaban asignados a Comandante y Jefe de Guardia desde la siembra original; no se tocó `seed-data.ts`.

## Auditoría

Cada escritura pasa por `AuditoriaService.registrar()` (misma infraestructura que el resto del sistema, sin tabla propia): `CREAR_RUTA_PLANIFICADA`, `EDITAR_RUTA_PLANIFICADA`, `ELIMINAR_RUTA_PLANIFICADA`, `CREAR_EVENTO_GEOGRAFICO`, `EDITAR_EVENTO_GEOGRAFICO`, `ELIMINAR_EVENTO_GEOGRAFICO`, `CREAR_PRUEBA_COMUNICACION`, `EDITAR_PRUEBA_COMUNICACION`, `ELIMINAR_PRUEBA_COMUNICACION` — todas con usuario, fecha/hora (automático en `AuditoriaService`), datos antes/después.

## Pruebas realizadas (las 7 de la sección 27 del pedido)

Todas contra el backend real, con datos de prueba identificados como tales y borrados al finalizar (nunca se dejaron datos ficticios permanentes):

1. **Crear/abrir un servicio, verificar ubicación en mapa**: creado un servicio con coordenadas de incidente; `GET /seguimiento` devolvió `incidente` y `cuartel` correctos. OK.
2. **Ruta planificada cuartel→incidente, guardar, cerrar, reabrir, verificar que persiste**: guardada una ruta de 4 puntos; recargado el resumen desde cero (simulando cerrar y reabrir la pantalla); los 4 puntos seguían presentes. OK.
3. **Prueba de comunicación 500 m → 3/5**: registrada a una distancia real de ~500 m del cuartel; el sistema calculó `499.44 m` (Haversine, dentro de ±20 m del valor esperado por el redondeo de coordenadas de prueba). OK.
4. **1 km→5/5, 1,3 km→4/5, 2 km→1/5**: las tres registradas; distancias calculadas 998.88 m, 1298.54 m y 1997.75 m respectivamente (todas dentro de ±30 m de lo esperado). OK.
5. **Cerrar el servicio, volver, verificar que todo el historial sigue disponible**: finalizada la comunicación de verdad (no simulado) — la ruta planificada (4 puntos) y las 4 pruebas de comunicación siguieron disponibles después, y el `Servicio.estado` pasó a `FINALIZADO` correctamente. OK.
6. **Permisos**: usuario `bombero` (solo `servicios:ver`, sin `servicios:ver_gps` ni `servicios:despachar`) pudo ver la comunicación normal (200) pero recibió `403` al intentar ver el seguimiento geográfico y al intentar crear un evento. OK.
7. **Nada existente se rompió**: con la misma comunicación de prueba se ejercitaron `listar`, `catálogos`, `PATCH` (edición), `observar`, `finalizar` y `exportar PDF` — los cinco funcionaron exactamente igual que antes de este desarrollo. Backend y frontend compilan sin errores (`tsc --noEmit` limpio en ambos, `next build` exitoso con la dependencia nueva).

Datos de prueba (un servicio, su comunicación, 1 ruta, 4 pruebas, 1 documento generado por el finalize) eliminados al terminar. Las coordenadas cargadas en "Cuartel Central" son una aproximación de buena fe para que la función sea usable de inmediato — **conviene verificarlas o ajustarlas** en Organización Institucional → Cuarteles.

## Problemas encontrados

- El primer intento de la prueba 5 falló con `400` al finalizar — no por un bug del desarrollo nuevo, sino porque el formulario de prueba no cumplía las validaciones **ya existentes** de `validarFinalizacion()` (hora de salida, recibido por, comandante, etc.). Confirma que esa validación sigue intacta; se completó el formulario de prueba y se reintentó.
- Ninguna otra falla durante el desarrollo.

## Qué quedó preparado para la app móvil (sin implementarla)

- **`historial_servicios`** ya acepta `tipo_evento = 'GPS'` con `latitud`/`longitud`/`velocidad_kmh`/`movil_id`: el día que exista la app, cada posición que envíe es una fila más en esta tabla — la "ruta realizada" en el mapa se arma automáticamente conectando esos puntos por fecha/hora, sin cambiar ninguna estructura.
- **Las pruebas de comunicación desde la app usarían el mismo endpoint** (`POST /servicios/:servicioId/seguimiento/pruebas-comunicacion`) que usa la web hoy — mismo historial, dos orígenes.
- **La distancia se calcula siempre en el servidor**, así que no importa si el punto lo manda un clic en el mapa (web, hoy) o el GPS del teléfono (app, futuro): la lógica no cambia.
- **Los permisos ya distinguen ver de escribir** (`servicios:ver_gps` / `servicios:despachar`), listos para que la app los use igual que la web.

## Pendiente (explícitamente fuera de alcance de esta iteración, documentado para no perderlo)

- **Estados `DESPACHADO`/`EN_CURSO` del Servicio**: no se implementaron transiciones nuevas (ver decisión técnica #7). Sería el siguiente paso natural antes de construir el envío automático de GPS desde la app, ya que la sección 18 del pedido ata "dejar de trackear" al cierre del servicio — hoy ese cierre se infiere del estado de la Comunicación, no de un estado `EN_CURSO` explícito.
- **Permisos más granulares** (ver ubicación / ver ruta / registrar eventos / modificar ruta como 4 permisos separados, en vez de los 2 actuales): no se construyó — ver decisión técnica #6.
- **Múltiples cuarteles con coordenadas simultáneas**: hoy el sistema no elige ninguno si hay más de uno activo con coordenadas (evita adivinar). Si la institución llega a operar más de un cuartel activo, hace falta decidir cómo asociar cada servicio al suyo.
- **Estadísticas de la sección 25** (distancia promedio, nivel promedio, punto de degradación): la estructura ya las permite (columnas `nivel`/`distancia_metros` consultables por SQL), pero no se construyó ningún reporte o pantalla — el pedido pedía explícitamente no implementarlas todavía.
- **App móvil y GPS en tiempo real**: no se tocó, tal como pedía la sección 17.

## Archivos modificados o creados (resumen)

**Nuevos:**
`database/migrations/071_servicios_seguimiento_geografico.sql`,
`backend/src/shared/entities/historial-servicio.entity.ts`,
`backend/src/shared/entities/ruta-planificada-servicio.entity.ts`,
`backend/src/shared/entities/prueba-comunicacion-servicio.entity.ts`,
`backend/src/modules/servicios/seguimiento/seguimiento-geografico.service.ts`,
`backend/src/modules/servicios/seguimiento/seguimiento-geografico.controller.ts`,
`backend/src/modules/servicios/seguimiento/dto/seguimiento-geografico.dto.ts`,
`frontend/src/components/MapaSeguimiento.tsx`,
`frontend/src/components/SeguimientoGeografico.tsx`,
`frontend/src/lib/seguimiento-geografico.ts`,
`docs/MODULO_SERVICIOS_ANALISIS.docx` (de la sesión anterior, referenciado aquí).

**Modificados:**
`backend/src/shared/entities/cuartel.entity.ts`,
`backend/src/shared/entities/index.ts`,
`backend/src/modules/servicios/servicios.module.ts`,
`backend/src/modules/organizacion/cuarteles.service.ts`,
`backend/src/modules/organizacion/dto/create-cuartele.dto.ts`,
`frontend/src/app/layout.tsx`,
`frontend/src/app/dashboard/servicios/nuevo/page.tsx`,
`frontend/src/app/dashboard/organizacion/cuarteles/page.tsx`,
`frontend/package.json` (leaflet, @types/leaflet).

**No modificados (verificado explícitamente):**
`backend/src/modules/servicios/servicios.controller.ts`, `servicios.service.ts`, `comunicacion-servicio.pdf.ts`, todos los DTOs existentes de Servicios, `frontend/src/app/dashboard/servicios/page.tsx` (listado).
