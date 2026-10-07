# Centro de Operaciones e Incidentes — corte 1 (núcleo + web operativa)

Fecha: 2026-10-06 · Estado: **aprobado; plan de implementación escrito (2026-10-07), con los ajustes de la §12**

Pedido original: "SIGBO — Centro de Operaciones, Incidentes y SCI" (48 puntos). Este documento
cubre el **primer corte vertical**; el resto queda descompuesto en la sección 11.

## 1. Objetivo del corte

Que un comandante pueda gestionar un incidente real durante varios minutos **sin escribir
formularios**, mientras SIGBO arma solo la cronología, y que al cerrar salga el informe de lo
registrado. Web primero (verificable en este equipo); la app Flutter reutiliza los mismos
endpoints en el corte siguiente.

Principios que gobiernan cada decisión (del pedido): si SIGBO puede saber un dato no lo pide;
una acción = un evento; velocidad sobre carga administrativa; prioridad
SEGURIDAD → VELOCIDAD → OPERATIVIDAD → TRAZABILIDAD → INFORMACIÓN → ADMINISTRACIÓN.

## 2. Respuestas del usuario que fijan el diseño

| Pregunta | Respuesta |
|---|---|
| Primer corte | Vertical, web primero |
| ¿Asignar y salir es un acto o dos? | **Ambos se dan**: "asignar y salir" en un toque, o asignar y la dotación confirma SALIMOS después |
| ¿Cómo se sabe quién va en cada móvil? | Se asigna **al tomar la guardia**, editable **en la salida** y **en el informe final antes de guardarlo** |
| Cronología | **Bitácora única** inmutable, escrita en la misma transacción por cada flujo |

## 3. Qué se reutiliza (regla de no duplicación)

| Necesidad | Pieza existente | Cómo se usa |
|---|---|---|
| Incidente | `servicios.servicios` | **El incidente es el servicio.** Sin tabla `incidentes` paralela |
| Número único | `CS-AAAA-NNNNN` (`siguienteNumero`, con UPDLOCK) | Se conserva tal cual |
| Tipo de emergencia | `servicios.tipos_servicio` | Botones de la recepción rápida |
| Prioridad | `servicios.gravedad` (LEVE/MODERADA/GRAVE/CRITICA) | Se muestra como Baja/Media/Alta/Crítica |
| Comandante | `servicios.jefe_servicio_id` → `personal.bomberos` | "Asumir comando" lo llena |
| Solicitante, teléfono, medio | `servicios.llamados` (llamante) | La recepción crea llamado + servicio; otra llamada se vincula |
| Despacho de móviles | `servicios.despachos`, `FlotaService.despachar/avanzar/cancelar` | Se extiende con el paso `salida` |
| Estado del móvil | `vehiculos.estado_operativo` + `movil_estado_historial` | **Sin estados nuevos**: "en camino" = DESPACHADO con hora de salida |
| Fuera de servicio | `vehiculos.estado` ≠ OPERATIVO | Tal cual |
| Posición del móvil | `vehiculos.posicion_actual` (`reportarPosicion`) | LLEGAMOS actualiza la posición |
| Personal del incidente | `servicios.personal_servicio` | Se amplía con móvil/despacho/origen; alimenta perfil y consultas cruzadas |
| Personal que se suma por llamado | `servicio_participantes`, `solicitudes_despacho` | Escriben en la bitácora; se muestran junto a la tripulación |
| Disponibilidad de personas | `servicios.disponibilidad_personal` | Contadores del tablero |
| Fotos | `servicios.adjuntos` (`POST /adjuntos`) | Se amplía con GPS y categoría |
| Víctimas | `servicios.victimas_servicio` (`VictimasService`) | Conteo rápido desde Modo Incidente |
| Mensajes | `servicios.servicio_mensajes` (chat inmutable) | MENSAJE usa el chat; el chat escribe en la bitácora |
| Mapa | Leaflet + OSM (`MapaFlota`, `MapaCartografia`), hidrantes, puntos de riesgo | Mapa operativo |
| Auditoría | `AuditoriaService` → `seguridad.logs_auditoria` | Cada acción se audita además de ir a la bitácora |
| Hora del dispositivo | `instanteDelHecho` | Acota `ocurridoEn` de toda acción de campo |
| Funciones configurables | `organizacion.parametros` | Nuevo tipo `FUNCION_INCIDENTE` |

## 4. Modelo de datos (migración `093_centro_operaciones_incidentes.sql`)

Verificar al implementar que `093` siga libre; registrarla en `run-migrations.ps1` y
`migrations.sha256`. Entidad y migración van en el mismo cambio (`synchronize: false`).

### 4.1 Columnas nuevas en `servicios.servicios`

| Columna | Tipo | Regla |
|---|---|---|
| `fase_operativa` | NVARCHAR(20) NOT NULL DEFAULT 'RECIBIDO' | CHECK con las 10 fases |
| `fase_desde` | DATETIMEOFFSET(3) NULL | Hora de entrada a la fase |
| `resultado` | NVARCHAR(20) NULL | CHECK: CONTROLADO, RESUELTO, FALSA_ALARMA, CANCELADO, DERIVADO, NO_ATENDIDO, SIN_ACCESO, SIN_INTERVENCION |

Relleno de filas existentes desde `estado`: REGISTRADO→RECIBIDO, DESPACHADO→DESPACHADO,
EN_CURSO→OPERANDO, FINALIZADO→CERRADO, CANCELADO→CERRADO con resultado CANCELADO.

### 4.2 Fases y estado derivado

Fases: `RECIBIDO → EVALUACION → DESPACHADO → EN_CAMINO → EN_LUGAR → OPERANDO → CONTROLADO →
RETORNO → DISPONIBLE → CERRADO`.

El `estado` heredado (5 valores, leído por flota, servicio activo, comunicaciones y la app)
**se deriva siempre de la fase**, en un único lugar (`estadoDesdeFase`):

| Fase | `estado` |
|---|---|
| RECIBIDO, EVALUACION | REGISTRADO |
| DESPACHADO, EN_CAMINO | DESPACHADO |
| EN_LUGAR … DISPONIBLE | EN_CURSO |
| CERRADO | FINALIZADO, salvo resultado CANCELADO → CANCELADO |

Todo código que hoy escribe `servicio.estado` (al menos `FlotaService.despachar/avanzar`)
pasa a hacerlo a través del motor de fases. `ServiciosService.crear` (comunicación) sigue
creando en REGISTRADO, que coincide con la fase por defecto RECIBIDO.

### 4.3 Transiciones

**Automáticas** (solo avanzan; nunca retroceden solas; si la fase ya es posterior, no hacen nada):

| Hecho | Fase destino |
|---|---|
| Primer despacho creado | DESPACHADO |
| Primera salida (despachar y salir, o SALIMOS) | EN_CAMINO |
| Primera llegada | EN_LUGAR |
| Primera acción operativa estando EN_LUGAR (situación, comando, víctima, pedido de recurso) | OPERANDO |
| Ningún despacho queda DESPACHADO/EN_SERVICIO y al menos uno está REGRESANDO, estando la fase en EN_LUGAR o posterior | RETORNO |
| Ningún despacho activo y la fase en EN_LUGAR o posterior | DISPONIBLE |

**Manuales**:

| Transición | Permiso |
|---|---|
| RECIBIDO → EVALUACION | `servicios:despachar` |
| EN_LUGAR → OPERANDO | `servicios:comandar` |
| EN_LUGAR/OPERANDO → CONTROLADO | `servicios:comandar` |
| CONTROLADO → OPERANDO ("se reactivó") | `servicios:comandar` |
| Declarar resultado alternativo | `servicios:despachar` antes de despachar; `servicios:comandar` después |
| → CERRADO (cierre) | `servicios:finalizar`; exige **ningún despacho activo** |

**Resultados alternativos** (FALSA_ALARMA, SIN_ACCESO, CANCELADO, DERIVADO, NO_ATENDIDO,
SIN_INTERVENCION): se registran en `resultado`. Si hay despachos activos, la fase pasa a
RETORNO y el incidente sigue hasta que vuelvan los móviles; si no hay, pasa a CERRADO en el acto.
Así nunca quedan móviles "colgados" de un incidente cerrado.

### 4.4 Cambios en `servicios.despachos`

- `hora_despacho` DATETIMEOFFSET(3) NOT NULL (relleno: `hora_salida`).
- `hora_salida` pasa a **NULL** (asignado pero todavía no salió).
- Paso nuevo `salida` (DESPACHADO sin hora de salida → misma fase con hora de salida).
- `POST /flota/despachos` sin el campo nuevo `salir` conserva el comportamiento actual
  (despachar y salir): la app y la pantalla de flota no cambian.
- `llegada` sin salida previa se acepta (la salida queda desconocida, no se inventa).
- `conTiempos` agrega `tiempoSalidaSegundos` (despacho → salida).
- Consumidores de `horaSalida` a corregir para el nulo: `frontend/src/lib/flota.ts` (tipo),
  `frontend/src/app/dashboard/vehiculos/dotacion/page.tsx` (`new Date(null)`),
  `FlotaService`, `InformeService`, `DotacionService`. La app Flutter no lo lee.

### 4.5 Tablas nuevas

**`servicios.incidente_eventos`** — la bitácora. Solo agrega: disparador
`INSTEAD OF UPDATE, DELETE` que lanza error (mismo patrón que `solicitud_eventos`).

| Columna | Tipo | Nota |
|---|---|---|
| `id` | BIGINT IDENTITY | Orden estable y cursor de la consulta incremental |
| `servicio_id` | UNIQUEIDENTIFIER NOT NULL | FK servicios |
| `tipo` | NVARCHAR(40) NOT NULL | CHECK con la lista de 4.6 |
| `titulo` | NVARCHAR(200) NOT NULL | Texto legible: "M-01 llegó al lugar" |
| `ocurrido_en` | DATETIMEOFFSET(3) NOT NULL | Hora del hecho (acotada) |
| `registrado_en` | DATETIMEOFFSET(3) NOT NULL DEFAULT ahora | Hora de llegada al servidor |
| `usuario_id` | UNIQUEIDENTIFIER NULL | NULL = sistema |
| `usuario_nombre` | NVARCHAR(120) NULL | Instantánea: nombre del bombero o usuario |
| `vehiculo_id`, `despacho_id` | UNIQUEIDENTIFIER NULL | |
| `latitud`, `longitud` | DECIMAL(10,8)/(11,8) NULL | |
| `precision_m` | DECIMAL(7,1) NULL | |
| `fase_anterior`, `fase_nueva` | NVARCHAR(20) NULL | Llenas cuando la acción cambió la fase |
| `fuente`, `fuente_id` | NVARCHAR(30)/(64) NULL | Fila de origen (despacho, adjunto, mensaje…) |
| `datos` | NVARCHAR(MAX) NULL, CHECK ISJSON | Detalle estructurado |
| `critico` | BIT NOT NULL DEFAULT 0 | |
| `origen` | NVARCHAR(10) NOT NULL | WEB, APP, SISTEMA |
| `dispositivo` | NVARCHAR(200) NULL | User-Agent o identificador de la app |
| `clave_idempotencia` | NVARCHAR(64) NULL | Índice único filtrado (servicio_id, clave) |

Índice `(servicio_id, id)`.

**`servicios.condiciones_situacion`** — catálogo configurable (una fila por condición).
Columnas: `codigo` (único), `nombre`, `grupo` (SITUACION | RIESGO), `critica` BIT,
`grupo_excluyente` NVARCHAR(30) NULL (las que comparten valor se excluyen: marcar una resuelve
las otras), `orden`, `activo`. Semilla con la lista del pedido, **sin duplicar** las que se
repiten entre los puntos 13 y 29:

- SITUACION: Incendio activo, Incendio fuera de control, Incendio controlado (estas tres con
  `grupo_excluyente = 'INCENDIO'`), Propagación, Víctima, Víctima atrapada, Persona
  desaparecida, Evacuación, Inundación, Derrumbe, Accidente vehicular, Otra situación.
- RIESGO: Riesgo estructural, Riesgo eléctrico, Material peligroso, Riesgo de explosión,
  Riesgo químico, Riesgo biológico, Tráfico, Condiciones climáticas, EPP obligatorio, Otro riesgo.
- `critica = 1` por defecto (a revisar por la institución): Incendio fuera de control, Víctima,
  Víctima atrapada, Persona desaparecida, Derrumbe, Riesgo estructural, Material peligroso,
  Riesgo de explosión, Riesgo químico, Riesgo biológico.

Qué condición está activa **se deriva de los eventos** SITUACION_MARCADA/RESUELTA (sin tabla
de estado duplicada).

**`servicios.tipos_recurso`** — catálogo de la SOLICITUD RÁPIDA. Columnas: `codigo`, `nombre`,
`categoria` (MOVIL | PERSONAL | INSUMO | EXTERNO | OTRO), `orden`, `activo`. Semilla: Autobomba,
Rescate, Cisterna (MOVIL); Personal (PERSONAL); Herramientas, Espuma, Agua (INSUMO); Ambulancia,
Policía, Hospital, Otra compañía (EXTERNO); Otro recurso (OTRO).

**`servicios.incidente_solicitudes`** — pedido de recurso con ciclo de vida SCI.

| Columna | Nota |
|---|---|
| `id`, `servicio_id`, `tipo_recurso_id` | |
| `cantidad` INT NOT NULL DEFAULT 1, CHECK > 0 | |
| `prioridad` NVARCHAR(10) | NORMAL, URGENTE |
| `estado` NVARCHAR(12) | SOLICITADO → APROBADO → DESPACHADO → EN_CAMINO → EN_USO → LIBERADO; RECHAZADO y CANCELADO como salidas |
| `observacion` NVARCHAR(300) NULL | Opcional, nunca obligatoria |
| `solicitado_por`, `solicitado_en`, `actualizado_por`, `actualizado_en` | |
| `version` INT | Concurrencia optimista |
| `clave_idempotencia` | Índice único filtrado |

Transiciones permitidas: lineales hacia adelante (se puede saltar pasos intermedios, p. ej.
APROBADO → EN_USO), RECHAZADO/CANCELADO desde cualquier estado no final. El corte SCI la amplía.

**`vehiculos.tripulacion_movil`** — quién va en cada móvil, cargado al tomar la guardia.
Columnas: `id`, `vehiculo_id`, `bombero_id`, `funcion` (nombre del parámetro
`FUNCION_INCIDENTE`), `asignado_por`, `asignado_en`. Únicos: `(vehiculo_id, bombero_id)` y
`bombero_id` (una persona, un móvil). Reemplazar la tripulación de un móvil es borrar y volver
a insertar sus filas en una transacción; el rastro queda en auditoría.

### 4.6 Tipos de evento (CHECK de `incidente_eventos.tipo`)

SERVICIO_RECIBIDO, LLAMADO_VINCULADO, FASE_CAMBIADA, PRIORIDAD_CAMBIADA, MOVIL_DESPACHADO,
MOVIL_SALIO, MOVIL_LLEGO, MOVIL_RETORNA, MOVIL_DISPONIBLE, DESPACHO_CANCELADO,
TRIPULACION_AJUSTADA, PERSONAL_SUMADO, COMANDO_ASUMIDO, SITUACION_MARCADA, SITUACION_RESUELTA,
RECURSO_SOLICITADO, RECURSO_ACTUALIZADO, VICTIMA_REGISTRADA, FOTO_TOMADA, MENSAJE, EMERGENCIA,
EMERGENCIA_ATENDIDA, RESULTADO_DECLARADO, INCIDENTE_CERRADO, y `COMUNICACION` (ajuste D1, §12).

Una acción = **un** evento. Si la acción además cambia la fase, el mismo evento lleva
`fase_anterior`/`fase_nueva` (no se agrega un FASE_CAMBIADA aparte). FASE_CAMBIADA es solo
para transiciones manuales. Los cortes siguientes amplían el CHECK con su propia migración.

### 4.7 Ampliaciones de tablas existentes

- `servicios.personal_servicio`: `vehiculo_id` NULL, `despacho_id` NULL, `origen`
  NVARCHAR(12) NULL (TRIPULACION, AJUSTE, SOLICITUD). Al despachar, la tripulación vigente
  del móvil se copia aquí (`rol` = función). El único `(servicio_id, bombero_id)` se respeta:
  si la persona cambia de móvil se actualiza su fila. Al cerrar se calcula `horas_servicio`
  con las horas de salida y regreso de su despacho.
- `servicios.adjuntos`: `latitud`, `longitud` NULL y `categoria` NULL (DANO, VICTIMA, RIESGO,
  VEHICULO, ESTRUCTURA, EQUIPAMIENTO, EVIDENCIA, OTRO).
- `organizacion.parametros`: el CHECK `CK_param_tipo` se recrea agregando `FUNCION_INCIDENTE`
  (semilla: Comandante, Jefe de dotación, Conductor, Bombero, Rescatista, Paramédico, Operador,
  Seguridad, Comunicaciones, Logística). El tipo TS `TipoParametro` se amplía igual.

## 5. Backend

### 5.1 Módulos

- **`incidente-nucleo`** (`backend/src/modules/incidente-nucleo/`): sin dependencias de otros
  módulos de dominio. Exporta:
  - `CronologiaService.registrar(m: EntityManager, evento)`: inserta en la bitácora dentro de
    la transacción del llamador; resuelve `usuario_nombre`; respeta la idempotencia.
  - `MotorFases.alHecho(m, servicioId, hecho)` y `MotorFases.cambiarManual(m, servicioId, destino, ctx)`:
    bloquean la fila del servicio (`pessimistic_write`), aplican las reglas de 4.3, escriben
    `fase_operativa`, `fase_desde`, `estado` derivado, y devuelven `{ antes, despues }` para que
    el evento lleve la fase.
  - `incidente.logica.ts`: funciones puras (tabla de transiciones, `estadoDesdeFase`,
    `faseAutomatica`, exclusión de condiciones, transiciones de pedidos). Se prueba sin base.
- **`incidentes`** (`backend/src/modules/incidentes/`): controlador `/api/v1/incidentes` y
  servicios de aplicación. Importa `incidente-nucleo`, `flota`, `campo`.
- **`flota`, `campo`, `despacho`** importan `incidente-nucleo` y escriben su evento dentro de
  su transacción actual: despachar (MOVIL_DESPACHADO o MOVIL_SALIO), salida, llegada, fin
  (MOVIL_RETORNA), regreso (MOVIL_DISPONIBLE), cancelar (DESPACHO_CANCELADO), víctimas,
  adjunto con entidad SERVICIO (FOTO_TOMADA), mensaje del chat (MENSAJE), participante que se
  suma por solicitud (PERSONAL_SUMADO).

### 5.2 Permisos

Existentes: `servicios:ver`, `servicios:crear`, `servicios:despachar`, `servicios:finalizar`.
Nuevos (usarlos **y** sembrarlos, en la misma migración):

| Permiso | Uso | Se asigna a (copiando de un permiso existente, robusto a nombres de rol) |
|---|---|---|
| `servicios:operar` | Acciones de campo del Modo Incidente | todo rol con `despacho:responder` |
| `servicios:comandar` | Comando, OPERANDO, CONTROLADO, reactivado, resultado, atender EMERGENCIA | todo rol con `servicios:finalizar` |
| `vehiculos:tripulacion` | Cargar la tripulación | todo rol con `servicios:despachar` |

Más el Administrador General para los tres. `@RequirePermission` acepta varios permisos con
semántica "alcanza con uno" (`PermissionsGuard` usa `some`).

### 5.3 Endpoints `/api/v1/incidentes`

| Método y ruta | Permiso | Qué hace |
|---|---|---|
| `GET tablero` | ver | Contadores por fase, recursos, alertas, incidentes activos |
| `GET catalogos` | ver, operar | Tipos de servicio, condiciones, tipos de recurso, funciones |
| `POST /` | crear | Recepción rápida: `tipoServicioId`, `direccion` obligatorios; `latitud`, `longitud`, `solicitante`, `telefono`, `descripcion`, `prioridad`, `medio`, `claveIdempotencia` opcionales. Crea llamado + servicio + SERVICIO_RECIBIDO en una transacción |
| `POST :id/llamados` | crear | Otra llamada por el mismo incidente (LLAMADO_VINCULADO) |
| `GET :id` | ver, operar | Expediente: incidente, fase, despachos con tripulación y tiempos, condiciones activas, pedidos, personal, víctimas, fotos, tiempos |
| `GET :id/cronologia?desde=` | ver, operar | Eventos con `id > desde` (consulta incremental) |
| `POST :id/prioridad` | despachar, comandar | PRIORIDAD_CAMBIADA |
| `POST :id/fase` | según tabla 4.3 (validado en el servicio además del guard) | Transición manual |
| `POST :id/resultado` | despachar, comandar | RESULTADO_DECLARADO (+ RETORNO o CERRADO) |
| `POST :id/despachos` | despachar | Varios móviles: `[{ vehiculoId, salir, tripulacion? }]`; resultado por móvil |
| `PUT :id/despachos/:d/tripulacion` | despachar, operar | Ajuste en la salida (TRIPULACION_AJUSTADA) |
| `POST :id/despachos/:d/{salida,llegada,retorno,disponible}` | operar, despachar | Delegan en `FlotaService` (salida, llegada, fin, regreso); guardan GPS; LLEGADA actualiza `posicion_actual` y, si el incidente no tiene coordenadas, las toma |
| `POST :id/comando` | comandar | `jefe_servicio_id` = bombero del usuario (COMANDO_ASUMIDO) |
| `POST :id/situacion` | operar | `{ condicion, activa }` |
| `POST :id/solicitudes` | operar | `{ tipoRecursoId, cantidad?, prioridad }` |
| `POST :id/solicitudes/:s/estado` | despachar | Avance del ciclo, con `version` |
| `POST :id/victimas` | operar | Delega en `VictimasService` |
| `POST :id/emergencia` | operar | EMERGENCIA, crítica |
| `POST :id/emergencia/atendida` | comandar, despachar | EMERGENCIA_ATENDIDA |
| `GET :id/informe` | ver | Datos del informe armado (sección 6.5) |
| `POST :id/cierre` | finalizar | `{ resultado, huboVictimas, huboDanos, observaciones?, tripulacion? }` → CERRADO |

En `flota`: `GET tripulacion` (`vehiculos:ver`), `PUT moviles/:id/tripulacion`
(`vehiculos:tripulacion`).

Reutilizados sin endpoint nuevo: MENSAJE → `POST /despacho/servicios/:id/mensajes`
(`despacho:servicio`, que tienen todos los roles); FOTO → `POST /adjuntos` (`adjuntos:subir`)
ampliado con `latitud`, `longitud`, `categoria`.

### 5.4 Reglas transversales

- **Idempotencia**: toda acción de campo acepta `claveIdempotencia`; el reintento devuelve el
  resultado ya registrado sin repetir efectos (índice único filtrado como red final).
- **Hora del hecho**: `ocurridoEn` opcional, acotado con `instanteDelHecho` y, en pasos de
  despacho, no anterior al hito previo.
- **Concurrencia**: el servicio y el despacho se bloquean en la transacción; pedidos con
  `version`. Conflictos → 409 con mensaje en castellano.
- **Auditoría**: cada acción llama a `AuditoriaService.registrar` después del commit con
  usuario, acción, recurso, valores antes/después, IP y User-Agent.
- **Confidencialidad**: dirección y coordenadas se muestran a quien tenga `servicios:ver` o
  `servicios:operar` (la central y quien va al lugar las necesitan). Las víctimas solo se
  cuentan en este corte; el detalle sensible llega con su permiso en el corte SCI.
- **Ningún número de negocio literal**: lo que decide la institución (condiciones críticas,
  funciones, tipos de recurso) es una fila.

### 5.5 Tablero: qué calcula

- Incidentes activos (fase ≠ CERRADO) por fase; cerrados hoy; falsas alarmas y cancelados hoy.
- Bomberos por `disponibilidad_personal` (disponibles = AL_LLAMADO + EN_BASE; en camino; en
  servicio; no disponibles).
- Móviles: disponibles (OPERATIVO y EN_CUARTEL), despachados, en servicio, regresando, fuera de
  servicio (EN_MANTENIMIENTO, FUERA_SERVICIO).
- Alertas, en orden de gravedad: EMERGENCIA sin atender; condición crítica activa; pedido
  URGENTE en SOLICITADO; ningún móvil disponible con incidentes en RECIBIDO/EVALUACION; móvil
  despachado sin tripulación registrada; más de un incidente activo a la vez; móvil fuera de
  servicio (informativa).

## 6. Pantallas (web)

Todas: `'use client'`, `useState`/`useEffect`, `cargar()` tras cada mutación, `apiFetch` con
rutas relativas, `<Aviso>`, `<Cargando>`, `<ComboBuscable>`, tokens `var(--…)` (sin hex de
texto), `label htmlFor` + `id`, `th scope="col"`. Pantalla nueva ⇒ `TABS` del layout +
`npm run generar:pantallas`.

### 6.1 Centro de Operaciones — `/dashboard/servicios/operaciones`

Primera pestaña de Servicios ("Centro de operaciones"). Usuario: la central, con tiempo pero
bajo presión.

- Franja de alertas arriba (crítica en `--bad-fill`, con sonido corto Web Audio la primera vez
  que aparece una alerta crítica nueva).
- Contadores de incidentes por fase y de recursos.
- Botón grande **Nuevo servicio** → panel de recepción: botones por tipo de servicio,
  dirección (obligatoria), clic en el mapa para coordenadas (opcional), solicitante, teléfono,
  descripción, prioridad (por defecto la del tipo si existe, si no Media). Opción "Ya reportado"
  para vincular la llamada a un incidente activo.
- Tarjetas de incidentes activos: número, tipo, prioridad, fase, móviles, tiempo transcurrido,
  condiciones críticas.
- Mapa: incidentes con coordenadas, posición de móviles, hidrantes y puntos de riesgo.
- Actualización: consulta cada 5 s.

### 6.2 Incidente — `/dashboard/servicios/operaciones/[id]`

Para la central y el comando.
- Encabezado: número, tipo, prioridad, fase, dirección, tiempos.
- **Despacho rápido**: grilla de móviles disponibles con su tripulación vigente a la vista;
  selección múltiple; botones **Asignar** y **Asignar y salir**; editar tripulación antes de
  confirmar.
- Móviles del incidente con su paso siguiente y tiempos; retirar (cancelar despacho).
- Fases manuales, resultado, prioridad, comando.
- Pedidos de recursos con su ciclo; condiciones activas; personal (tripulación + participantes).
- Cronología en vivo (consulta incremental cada 4 s).
- Enlaces a **Modo incidente** e **Informe**.

### 6.3 Modo Incidente — `/incidente/[id]` (y `/incidente` para elegir)

**Fuera del dashboard**: sin menú lateral ni administrativo. Usuario: bombero o comandante en
el lugar, con guantes, lluvia, una mano, poco tiempo.

- Tema claro de alto contraste, botones ≥ 72 px de alto, texto ≥ 20 px, una columna en
  pantalla angosta, dos en ancha.
- Encabezado fijo: número, tipo, fase (chip), móvil del usuario, estado de conexión.
- **Móvil del usuario deducido**: su fila de `personal_servicio` en un despacho activo del
  incidente; si no, su `tripulacion_movil` con despacho activo; si no, se elige una vez entre
  los móviles del incidente (o "Sin móvil"), recordado en `localStorage` por incidente.
- Botones: solo el **paso siguiente** de su móvil (SALIMOS / LLEGAMOS / RETORNANDO / DISPONIBLE);
  SITUACIÓN (grilla de condiciones, marcadas resaltadas; toque = marcar/resolver);
  SOLICITAR RECURSO (recurso → prioridad → confirmar); PERSONAL (ver y ajustar tripulación);
  FOTO (`<input capture="environment">` + categoría opcional); MENSAJE (texto corto al chat);
  VÍCTIMA (categoría + cantidad con botones +/-); CONTROLADO / SE REACTIVÓ (con
  `servicios:comandar`); ASUMIR COMANDO; **EMERGENCIA** (siempre visible, rojo, confirmación
  de dos toques — mantener presionado o tocar dos veces — para evitar disparos accidentales).
- Cada acción toma GPS con `navigator.geolocation` (timeout 4 s, `maximumAge` 30 s); nunca
  bloquea: sin posición se envía igual.
- **Sin conexión**: la acción se guarda en una cola en `localStorage` con su
  `claveIdempotencia` y `ocurridoEn`; banner "SIN CONEXIÓN — N acciones pendientes"; reintento
  al volver la red y cada 10 s; un 4xx (salvo 408/429) descarta y avisa. Las fotos **no** se
  encolan en la web (requieren red; la app lo resolverá).
- Cronología breve (últimos eventos) al pie.
- **No** se muestra VOZ en este corte: ningún botón que no funcione.

### 6.4 Tripulación — `/dashboard/vehiculos/tripulacion`

Pestaña "Tripulación" de Vehículos. Por móvil operativo: lista de personas con función
(`ComboBuscable` de bomberos + función de `FUNCION_INCIDENTE`), guardar reemplaza la tripulación
del móvil. Avisa si la persona ya está en otro móvil.

### 6.5 Informe y cierre — `/dashboard/servicios/operaciones/[id]/informe`

Se arma solo, desde la bitácora y las tablas relacionadas:
identificación (número, tipo, prioridad, resultado), fecha, ubicación, solicitante y medio
(llamados), cronología completa, tiempos (recepción → despacho → salida → llegada → controlado
→ disponible → cierre; respuesta por móvil), distancia en línea recta cuartel → incidente
cuando ambos tienen coordenadas, personal por móvil y función, pedidos de recursos, víctimas,
fotos (miniaturas), condiciones registradas, comandante, observaciones.
Impresión con `window.print()` y hoja de estilos de impresión (PDF desde el navegador).

**Cierre mínimo** (si el incidente no está cerrado y el usuario tiene `servicios:finalizar`):
1. ¿Cómo terminó? (resultado, precargado si ya se declaró)
2. ¿Hubo víctimas? Sí/No (precargado desde los registros)
3. ¿Hubo daños? Sí/No
4. Observaciones (texto, opcional) → `servicios.informe`
5. Revisión de tripulación (ajustable antes de guardar)
→ CERRADO + INCIDENTE_CERRADO (con `huboVictimas`, `huboDanos` en `datos`) + horas por persona.

## 7. Manejo de errores

- 400: dato inválido (mensaje que nombra el campo). 403: sin permiso. 404: incidente o
  despacho inexistente. 409: transición inválida, despacho ya avanzado, versión vieja, móvil
  no disponible. Siempre en castellano y accionable.
- El despacho de varios móviles informa éxito o motivo por móvil; uno que falla no revierte
  los demás.
- La web muestra el error con `<Aviso tipo="error">`; en Modo Incidente un 409 por reintento
  de algo ya hecho se muestra como "Ya estaba registrado", no como error.

## 8. Pruebas y verificación

- `incidente.logica.spec.ts`: tabla de transiciones, `estadoDesdeFase`, automáticas (no
  retroceden), resultados con y sin despachos activos, exclusión de condiciones, ciclo de pedidos.
- Specs de servicio con la base falsa de las pruebas de despacho: recepción, despacho múltiple
  con tripulación heredada, salida/llegada/retorno/disponible y fases, idempotencia, cierre con
  despachos activos (rechazo), eventos escritos por flota/víctimas/adjuntos/chat.
- Suite completa del backend en verde; `npx tsc --noEmit`, `npm run audit:contraste`,
  `npm run audit:a11y`, `npm test` del frontend; `node scripts/verificar-endpoints.mjs`.
- Migración aplicada a la base local; prueba de que la bitácora rechaza UPDATE/DELETE.
- Recorrido de punta a punta en el navegador contra backend y base reales: recibir →
  despachar dos móviles (uno "asignar", otro "asignar y salir") → SALIMOS → LLEGAMOS →
  situación crítica → pedido → foto → EMERGENCIA y atención → CONTROLADO → RETORNANDO →
  DISPONIBLE → cierre → informe. Registros de prueba identificados y documentados (no se
  borran: la bitácora es inmutable).

## 9. Documentación y grafo

- `.context/INCIDENTES.md` (estado por fases, igual que `DESPACHO.md`) y enlace desde
  `.context/contexto.md`.
- Nodos curados: DECISION "el incidente es el servicio", DECISION "bitácora única del
  incidente", RULE "la bitácora del incidente es inmutable", WORKFLOW "ciclo del incidente".
- `node .context/graph/build-graph.mjs` y `validar.mjs` al terminar.

## 10. Fuera de este corte

Voz (hablar y dictar), estructura SCI completa (objetivos, sectores, roles de comando,
instituciones externas, desmovilización por recurso, checklists por tipo), detalle de víctimas
con permiso, comunicación oficial precargada desde el incidente, AAR, estadísticas, Modo
Incidente en la app Flutter con fotos sin conexión, administración de catálogos en pantalla,
canal SSE para el tablero, hospitales/policía en el mapa.

## 11. Cortes siguientes (en orden)

2. Modo Incidente en la app Flutter (outbox existente, fotos sin conexión).
3. SCI: comando y oficiales, objetivos, sectores, instituciones externas, desmovilización,
   checklists configurables por tipo (sobre `formulario_definiciones` si encaja).
4. Cierre asistido completo + comunicación oficial precargada + informe PDF de servidor + AAR.
5. Voz → datos estructurados (Whisper + Ollama locales), siempre con Confirmar/Editar.
6. Estadísticas de servicios, personal, móviles, recursos y tiempos.
7. Administración de catálogos y SSE del tablero.

## 12. Ajustes hechos al escribir el plan (2026-10-07)

Surgieron al leer el código en detalle. El plan
(`docs/superpowers/plans/2026-10-07-centro-operaciones-incidentes.md`) los implementa y prevalecen
sobre lo escrito arriba.

- **D1. MENSAJE → COMUNICACIÓN.** El chat existente exige ser participante del servicio y permiso de la
  matriz de pantallas. Un bombero que llega por la tripulación del móvil no es participante. El botón
  del Modo Incidente registra una **comunicación** (punto 28 del pedido) con `POST /incidentes/:id/comunicacion`
  y el tipo de evento nuevo `COMUNICACION`, que se suma al CHECK de 4.6. El chat sigue escribiendo eventos `MENSAJE`.
- **D2.** `GET /incidentes/activos` (`servicios:ver` o `servicios:operar`) para entrar al Modo Incidente
  desde el inicio.
- **D3.** Prioridad por defecto MODERADA (Media): `tipos_servicio.prioridad` es un entero de orden, no una gravedad.
- **D4.** El login vuelve también a `/incidente/<id>` (lista blanca, como `/fichar`).
- **D5.** Quien tiene `servicios:operar` recibe además `adjuntos:subir`; si no, la FOTO daría 403 al bombero.
- **D6.** En el relleno, un servicio `REGISTRADO` **con comunicación** queda `CERRADO` (es documentación de
  algo pasado); sin comunicación queda `RECIBIDO`. Los que se creen desde ahora con el formulario largo nacen
  `RECIBIDO` y se cierran con un toque si eran solo papeleo, hasta que el corte 4 genere la comunicación desde el incidente.
- **D7.** `GET /incidentes/catalogos` también devuelve los bomberos activos (el Modo Incidente los necesita
  para ajustar la tripulación y el bombero no tiene `vehiculos:ver`).

### Mejoras incorporadas después de la revisión del plan (2026-10-07)

- **D8. Avisos inmediatos** por el SSE existente (`GET /despacho/stream?solo=incidentes`, que no cuenta como
  presencia): EMERGENCIA, condición crítica, pedido urgente, recuento con faltantes y nuevo servicio. La consulta
  cada 5 s queda de respaldo. Reemplaza "SSE para más adelante" de §5.4 y §10.
- **D9. Control de personal en zona** (adelantado del corte SCI). ENTRA/SALE por persona y recuento (PAR) del
  comando. Nadie se libera solo: hay alerta si los móviles vuelven con alguien adentro y el cierre se rechaza.
- **D10. Fotos de víctimas** solo con `despacho:confidencial`, con cada acceso auditado (punto 24 del pedido).
- **D11.** `personal_servicio` guarda la **función como código** y los **minutos exactos** de servicio. Las horas
  salen de una única función con la política que elija el cuartel.
- **D12. Tripulación desde la guardia en curso**, para no cargarla aparte.
- **D13.** Quien registra en un incidente donde no figura **queda marcado**, o se le rechaza según lo que decida
  el cuartel. La EMERGENCIA nunca se bloquea.
- **D14. Modo noche** del Modo Incidente, si el cuartel aprueba la excepción a la regla del tema claro.
- **D15.** Antes de implementar, el plan consulta la base y pregunta al cuartel las decisiones que le
  corresponden: condiciones críticas, alcance de `servicios:operar`, modo noche, horas de servicio y servicios viejos.
  La ejecución tiene dos puntos de control: el backend contra la base real (con concurrencia) y el recorrido
  automatizado en el navegador.

**Orden recomendado para los cortes siguientes** (reemplaza a §11, a confirmar con el comando):

1. App Flutter con el Modo Incidente sin conexión.
2. Comunicación oficial generada desde el incidente: elimina la doble carga y resuelve D6.
3. SCI completo.
4. Voz.
5. Estadísticas.
6. Administración de catálogos y prueba E2E permanente.
