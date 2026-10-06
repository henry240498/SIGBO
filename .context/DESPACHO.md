# Despacho y coordinación operativa

Módulo para que, ante un servicio, el personal responda rápido y el sistema deje **trazabilidad
completa** de quién recibió el llamado, quién respondió, quién está en camino y qué pasó.
Fecha: **2026-10-06**. **Estado: fases A–D parcialmente integradas; faltan capacidades de
campo y validación en dispositivos** (ver secciones 6–8). El código manda:
`backend/src/modules/despacho/` y `.movile/lib/`.

## 0. Reparto del trabajo entre sesiones (2026-10-06, actualizar al terminar cada punto)

Hay más de una sesión de Claude trabajando en este repositorio a la vez. Para no pisarnos:

| Parte | Quién | Estado |
|---|---|---|
| Backend: despacho (088), servicio activo, formularios, matriz de pantallas, auditoría de navegación, sesión (090) | sesión A (esta documentación) | hecho y probado; ver sección 6 |
| App: pantalla de despacho (`despacho_movil.dart`), servicio activo (`servicio_activo.dart`), auditoría de navegación (`navegacion.dart`); web: despacho, Navegación, Permisos por pantalla; migración 091 | otra sesión | en curso al escribir esto |
| **"Mantener sesión iniciada"**: política en el backend y casilla en el login de la app (la web conserva la sesión de siempre) | **sesión A** | hecho y probado |
| Verificación integral contra el servidor real (55 comprobaciones), pruebas, documentación, verificador de textos de la app | sesión A | hecho. En el celular se probó la pantalla de despacho y se corrigieron dos defectos de la app; **falta instalar la 1.5.6** (Xiaomi exige aceptar en pantalla) y repasar chat y formularios a mano |

Regla: antes de editar un archivo que no sea tuyo, mirá su fecha de modificación; si cambió hace minutos, no lo toques y anotá acá lo que necesitás.

## 1. Qué extiende (no duplica)

| Ya existía | Cómo se relaciona |
|---|---|
| `servicios.alertas_emergencia` (SOLICITUD_CHOFER / APOYO, mig. 076) | Sigue funcionando. El flujo nuevo lo reemplazará en la app, pero hoy conviven. |
| `servicios.llamados` y `convocatorias` (079) | Una solicitud puede enlazar `llamado_id` y `servicio_id`. La convocatoria (VOY/NO_PUEDO) no se tocó. |
| `servicios.despachos` (077, móvil ↔ servicio) | Sin cambios. Una solicitud de chofer apunta a móviles (`solicitud_moviles`). |
| `seguridad.logs_auditoria` / `AuditoriaService` | Toda acción de despacho audita ahí **y** deja un evento inmutable en la línea de tiempo. |
| Permisos `recurso:accion`, `PermissionsGuard` | Tres permisos nuevos (abajo). |
| SSE de alertas (en memoria) | Mismo patrón, con un bus propio (`DespachoTiempoReal`). |

## 2. Modelo de datos (migración 088)

`servicios.disponibilidad_personal` (una fila por usuario, con `version` para concurrencia) ·
`disponibilidad_horarios` · `disponibilidad_excepciones` · `solicitudes_despacho` ·
`solicitud_moviles` · `solicitud_destinatarios` · `solicitud_eventos`.

Estado declarado de la persona: `NO_DISPONIBLE` (por defecto), `AL_LLAMADO`, `EN_BASE`,
`EN_CAMINO`, `EN_SERVICIO`. Los dos últimos y `EN_CAMINO` los fija el sistema, no la persona.

## 3. Reglas centrales

**Dos ejes que no se mezclan** ([[rule--entrega-y-respuesta-son-ejes-distintos]]):

- *entrega* (qué pasó al enviar): `ENVIADA`, `SIN_CONEXION`, `NO_DISPONIBLE`, `FUERA_DE_HORARIO`, `EN_SERVICIO`.
- *estado* (qué hizo la persona): `PENDIENTE`, `ACEPTO`, `NO_PUEDE`, `CANCELO`, `EN_CAMINO`, `LLEGO`.

Solo recibe la alerta quien está `AL_LLAMADO`/`EN_BASE`, dentro de su horario y **en línea**.
"En línea" = tiene el stream abierto o mostró actividad en los últimos 90 s. Si estaba sin
conexión, la alerta **no se inventa**: al reconectar queda como `VISTA_TARDIA`, nunca como
`RECIBIDA`. `NO_DISPONIBLE` gana sobre `SIN_CONEXION` (fue decisión de la persona).

**Máquina de estados** (`despacho.logica.ts`, lo que no figura está prohibido):

```
PENDIENTE --aceptar--> ACEPTO --en camino--> EN_CAMINO --llegué--> LLEGO
PENDIENTE --no puedo (motivo obligatorio)--> NO_PUEDE --aceptar--> ACEPTO
ACEPTO | EN_CAMINO --cancelar--> CANCELO --aceptar--> ACEPTO
```

Aceptar **no es definitivo**; la hora de la primera aceptación se conserva aunque cancele y vuelva a aceptar.
`EN_CAMINO` → la persona pasa a `EN_CAMINO`; `LLEGUE` → `EN_SERVICIO`. No se puede estar en camino a
dos solicitudes a la vez ni cambiar la disponibilidad a mano mientras se está en camino o en servicio.

**Concurrencia:** cada fila lleva `version`; toda actualización es condicional (`WHERE id AND version`).
Si dos dispositivos responden a la vez, uno gana y el otro recibe 409.

La respuesta y la disponibilidad se actualizan en una transaccion con bloqueo de la solicitud,
el destinatario y la disponibilidad; la participacion, el evento inmutable y la auditoria se
guardan en el mismo commit. Los eventos en tiempo real se emiten despues del commit. Si una
transicion concurrente pierde el control optimista, toda la operacion se revierte sin dejar
estados parciales.
El cierre o la cancelacion tambien bloquean la solicitud: si se cancela, liberan en una sola
transaccion la disponibilidad y la participacion de quienes estaban en camino, y agregan un
evento por persona. La respuesta historica `EN_CAMINO` se conserva como hecho ocurrido.

**Línea de tiempo inmutable** ([[rule--linea-de-tiempo-inmutable]]): un disparador en SQL Server
(`TR_solicitud_eventos_inmutable`) rechaza `UPDATE` y `DELETE`, incluso por SQL ad hoc. Verificado.

**Buscar personal adicional:** avisa a quienes están `NO_DISPONIBLE`/fuera de horario **y en línea**; quien acepta pasa
a `AL_LLAMADO` **temporal** (4 h, `DESPACHO_TEMPORAL_HORAS`) y vuelve solo a `NO_DISPONIBLE` sin tocar su configuración.

El envio de la invitacion de personal adicional y su aceptacion son transaccionales. Solo
quien tenga un evento `AMPLIACION_ENVIADA` para esa solicitud puede aceptarla; el cambio
temporal, la respuesta y la auditoria se guardan juntos. No se puede pisar `EN_CAMINO` ni
`EN_SERVICIO`.

## 4. Permisos (todos validados en el backend)

| Permiso | Quién | Para qué |
|---|---|---|
| `despacho:responder` | todos los roles existentes | recibir, responder, declarar disponibilidad, abrir el stream |
| `despacho:solicitar` | quien ya podía convocar/despachar + Administrador General | crear, ampliar y cerrar solicitudes |
| `despacho:seguimiento` | ídem | ver quién respondió y la línea de tiempo |

Un rol nuevo debe recibir `despacho:responder` desde Seguridad.

## 5. API (`/api/v1/despacho`)

`GET stream` (SSE) · `POST presencia` · `GET/PUT disponibilidad/mia` · `PUT disponibilidad/horarios` ·
`POST/DELETE disponibilidad/excepciones` · `GET solicitudes/mias` · `POST solicitudes/:id/recibida|responder|unirme` ·
`POST/GET solicitudes` · `GET solicitudes/:id` · `GET solicitudes/:id/linea` · `POST solicitudes/:id/ampliar|cerrar`.

## 6. Estado frente al pedido original

| # | Parte del pedido | Estado |
|---|---|---|
| 1 | Solicitar chofer (uno o varios móviles, texto "Móvil 1 + Móvil 3") | **Integrado** en app/backend/web; solo se avisa a cuentas vinculadas a un bombero con autorización registrada para alguno de los móviles pedidos; incompatibles quedan auditados aparte. Falta decidir y validar vigencia/licencia con autoridad. |
| 2 | Solicitud rápida (sin móvil ni personal) | **Integrada** en app y backend; requiere conectividad para el envío. |
| 3 | Respuestas (sí / no con motivo / sin respuesta distinguida) | **Integrado** con motivos e historial; falta validación en campo. |
| 4 | Estados de las personas | **Integrados** con disponibilidad, horario y estados de solicitud en app. |
| 5 | No enviar a desconectados ni a No disponible; distinguir las causas | **Implementado** en backend; confirmar operación con red del cuartel. |
| 6 | Buscar personal adicional | **Integrado** en app y backend. |
| 7 | Programación de disponibilidad (franjas y excepciones) | **Integrada** en app y backend; el editor actual usa una franja común para días seleccionados. |
| 8 | Solicitar personal | **Integrado** en app, backend y web. |
| 9 | Seguimiento por grupos | **Integrado** en app/web con línea temporal. |
| 10 | Estado "en camino" | **Integrado** y enlazado con participante de servicio. |
| 11 | Línea de tiempo inmutable | **Protegida** por trigger SQL en la tabla de eventos; la app y web muestran el historial. |
| 12-16 | Modo servicio, formularios, chat, servicios activos, mapa | **Parcial:** participantes, chat y formularios versionados tienen backend; la app muestra servicio, chat y formularios. El mapa operativo ya está integrado en app y web; las ubicaciones exactas y las posiciones de móviles requieren `despacho:confidencial`. Las teselas viales solo se cargan desde un proveedor institucional configurado en backend (`SIGBO_MAP_TILES_URL`). |
| 17 | Información confidencial por permiso | **Hecho en el backend:** dirección, descripción, coordenadas, ubicación del mapa y campos confidenciales de formularios se ocultan sin permiso; **lo decide la matriz de pantallas** (la columna "Confidencial"), que cae al permiso `despacho:confidencial` si no hay reglas, y cada acceso queda auditado como `ACCESO_CONFIDENCIAL`. |
| 18-19 | Seguridad por rango/cargo/rol/usuario y códigos hexadecimales de pantalla | **Parcial:** matriz de permisos en backend y pantalla web; navegación móvil usa códigos de pantalla. Falta auditar permisos pantalla por pantalla y comprobar en despliegue. |
| 20-21 | Auditoría de navegación y su vista web | **Integrada** en app/web con cola offline; falta validación de sincronización en equipos reales. |
| 22-23 | "Mantener sesión", auditoría de refresh/expiración | **Hecho** (backend y casilla en la app): mantener = 30 días que se renuevan con el uso, con tope de 90; no mantener = 12 horas; sin elegir (web) = 7 días como siempre. Se auditan `LOGIN` (con el modo y el equipo), `SESION_RENOVADA` y `SESION_EXPIRADA`; el intento fallido ya se auditaba. |
| 24-25 | ONLINE / OFFLINE / NO DISPONIBLE separados; máquina de estados | **Separados** en backend y señalados por separado en el flujo móvil. |
| 28 | Tiempo real | **Parcial:** SSE con la app activa; con el servicio de monitoreo Android habilitado, el proceso en primer plano consulta presencia y solicitudes al intervalo elegido y emite notificaciones locales. Una entrega `SIN_CONEXION` se muestra como tardía sin notificación ni recepción retroactiva. No hay proveedor push remoto ni garantía tras forzar la detención/restricción del sistema (ver 7). |
| 31 | Administración web | **Parcial:** despacho, seguimiento, permisos por pantalla y auditoría de navegación; faltan herramientas de revisión/configuración restantes. |

## 7. Decisiones y límites a tener presentes

- **Avisos con la app en segundo plano/cerrada:** no hay proveedor push remoto. En Android, cuando la preferencia
  **Monitoreo continuo** está activa (por defecto al iniciar sesión; se puede desactivar en Ajustes), el servicio
  en primer plano mantiene presencia y consulta el nuevo
  despacho cada 10–300 s; solo avisa solicitudes con entrega `ENVIADA` y confirma la recepción después de publicar
  la notificación local. WorkManager consulta cada 15 min como respaldo de alertas antiguas, no de despacho.
  Android, el fabricante o una detención forzada pueden suspender el servicio; no equivale a push garantizado.
- **Una sola instancia del backend:** el bus y la presencia viven en memoria. Con dos instancias hay que
  reemplazar `DespachoTiempoReal` por un broker.
- **Chofer:** la entrega filtra por registro `personal.vehiculos_autorizados` para alguno de los móviles
  solicitados; falta definir con la autoridad cómo verificar la vigencia de la licencia/capacitación.
  La tabla de elegibilidad no sustituye la autorización de salida ni la asignación del conductor al móvil.
- **Nombres:** el timeline muestra el `username`, no el nombre del bombero.
- **Horarios:** se evalúan con la hora local del servidor.

## 8. Plan por fases

- **B — App:** interfaz de despacho, estados, disponibilidad, servicios activos, chat/formularios y
  cola local de navegación integrados; el monitoreo Android consulta solicitudes actuales si se habilita.
  Falta validar notificaciones/recepción en campo, reconexión real y restricciones de batería del fabricante.
- **C — Servicio:** backend y app cubren participantes, chat rápido, formularios versionados y mapa
  operativo; la web de seguimiento incluye ubicaciones autorizadas. Sin teselas institucionales
  configuradas, el mapa conserva posiciones relativas y no consulta proveedores externos.
- **D — Seguridad y auditoría:** backend aplica permisos por pantalla y la web permite configurar reglas;
  la app registra visitas offline y web consulta la línea cronológica. Falta recorrido de permisos con
  perfiles reales y comprobar la recepción del registro en el servidor.
- **E — Sesión:** hecha. Antes de esto la sesión **no se renovaba**: vencía 7 días después del inicio aunque se usara a diario. La casilla también está en el login de la web, y la cookie de renovación dura lo mismo que la sesión.

## 9. Registros de prueba que quedaron en la base

Del 2026-10-06 (prueba real de servicio activo): un tipo de servicio `PRUEBA TECNICA (borrar)` y un servicio
`PRUEBA-TECNICA-001` (CANCELADO), con sus participantes, mensajes de chat y formularios; los mensajes y el historial de
formularios **no se pueden borrar** (disparadores). Reglas de pantalla de prueba ya quitadas. Sesiones y
registros de auditoría de los usuarios de prueba.


Del 2026-10-06: una solicitud de chofer **CANCELADA** ("prueba técnica del módulo", móviles 1 y 2) con
**15 eventos** en su línea de tiempo, que **no se pueden borrar** (es la regla). Filas de disponibilidad de
`bombero`, `comandante`, `instructor` y `deposito`, devueltas a `NO_DISPONIBLE`.

## 10. Pruebas

Backend (2026-10-06, suite completa): **36 suites, 365 casos, todos en verde** (`despacho` 66, `pantallas` 21, `auth` 40 con 7 nuevos de política de sesión). Flutter: 48 casos; `flutter analyze` limpio. Prueba viva contra el servidor y la
base reales, `servicio-vivo.mjs`: **55 comprobaciones** (permisos por pantalla, confidencialidad, chat, formularios, mapa,
matriz, navegación y sesión), incluidos los rechazos de la base ante `UPDATE`/`DELETE` en las tablas de evidencia.
Verificador de textos de la app: `python scripts/verificar-textos-dart.py` (ver [[error--editor-guarda-tildes-como-interrogacion]]).


`backend/src/modules/despacho/despacho.spec.ts`: **42 casos** (máquina de estados, horarios y excepciones,
entrega, seguimiento, servicio completo con concurrencia). Prueba viva contra el servidor y la base reales:
28 comprobaciones, incluida la inmutabilidad en SQL.
