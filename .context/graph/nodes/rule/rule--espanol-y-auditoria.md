---
id: rule--espanol-y-auditoria
tipo: RULE
nombre: Todo en espanol, y las acciones sensibles quedan auditadas
nivel: L2
resumen: Identificadores, tablas, interfaz y mensajes de error en espanol, sin internacionalizacion. Las acciones de seguridad se registran en seguridad.logs_auditoria.
severidad: MEDIA
edges:
  - [affects, entity--log-auditoria]
  - [affects, table--seguridad-logs-auditoria]
terminos: [espanol, idioma, i18n, auditoria, log, trazabilidad, historial, mensaje, todo, acciones, sensibles, quedan, auditadas, identificadores, tablas, interfaz, mensajes, error, internacionalizacion, seguridad, registran, logs]
---

# Todo en espanol, y las acciones sensibles quedan auditadas

Identificadores, tablas, interfaz y mensajes de error en espanol, sin internacionalizacion. Las acciones de seguridad se registran en seguridad.logs_auditoria.

## Idioma

Español en **todo**: nombres de tablas y columnas, clases, metodos, variables, rutas
de API, texto de interfaz y mensajes de error. Sin i18n, sin claves de traduccion.
`region.language` en el registro de configuracion admite un unico valor: `es-PY`.

<<<<<<< Updated upstream
Los identificadores de codigo van **sin tildes** (`ActualizarPresenciaDto`,
=======
Los identificadores de codigo van **sin tildes** (`ActualizarPerfilDto`,
>>>>>>> Stashed changes
`comunicacion-servicio.entity.ts`, `numero_bombero`); el texto visible al usuario **si
las lleva** ("Organización Institucional", "Vehículos").

Los mensajes de error son para un bombero de guardia, no para un desarrollador:
<<<<<<< Updated upstream

> "Juan Perez no tiene autorizacion de chofer registrada (personal.vehiculos_autorizados)"

Dice quien, que falta y donde se arregla. Ese es el estandar.
=======
"Cuenta bloqueada temporalmente por intentos fallidos. Reintente despues de 14:32",
no "AuthenticationException: account locked".
>>>>>>> Stashed changes

## Auditoria

`seguridad.logs_auditoria` (entidad `LogAuditoria`) registra las acciones sensibles, y
<<<<<<< Updated upstream
se consulta desde `seguridad/auditoria` con `seguridad:ver_logs`. Hay pantallas de
auditoria propias en asistencia (`/dashboard/asistencia/auditoria`) y en guardias
(`/dashboard/guardias/auditoria`).

Hay tablas de historial especificas que **no** son el log de auditoria y cumplen otra
funcion —son parte del expediente, no del rastro tecnico:
=======
se consulta desde `seguridad/auditoria` con `seguridad:ver_logs`. Existe ademas una
pantalla de auditoria propia de asistencia
(`/dashboard/asistencia/auditoria`).

Hay tablas de historial especificas que **no** son el log de auditoria y cumplen otra
funcion —son parte del expediente de la persona, no del rastro tecnico:
>>>>>>> Stashed changes

- `personal.historial_institucional` — movimientos institucionales
- `personal.historial_codigo` — codigos anteriores de un bombero
- `personal.fojas_servicio` — foja de servicio con snapshot
- `seguridad.historial_contrasenas` — para impedir reutilizacion
- `servicios.historial_servicios`
- `seguridad.configuracion_versiones` — versiones de configuracion
<<<<<<< Updated upstream
- `operaciones.novedades_guardia` — novedades del turno, que son parte del parte de
  guardia y no un log tecnico

Al agregar una accion sensible, decidir cual de los dos mecanismos corresponde: log
tecnico (auditoria) o registro del expediente/parte (historial).
=======

Al agregar una accion sensible, decidir cual de los dos mecanismos corresponde: log
tecnico (auditoria) o registro del expediente (historial).
>>>>>>> Stashed changes


## Relaciones

- `affects` → [[entity--log-auditoria|LogAuditoria]]
- `affects` → [[table--seguridad-logs-auditoria|seguridad.logs_auditoria]]

---
<sub>Nodo **curado** (editable a mano).</sub>
