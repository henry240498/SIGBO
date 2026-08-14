---
id: workflow--asistencia-a-evento
tipo: WORKFLOW
nombre: Evento de asistencia, participantes y marcaciones
nivel: L2
dominio: asistencia
resumen: Un evento pasa de PROGRAMADO a EN_CURSO a FINALIZADO. Los participantes pueden ser bomberos o externos, y su participacion se califica contra la tolerancia vigente.
archivos:
  - backend/src/modules/operaciones/eventos-asistencia.service.ts
  - backend/src/modules/operaciones/marcaciones.service.ts
edges:
  - [contains, rule--tolerancia-null-es-la-general]
  - [affects, entity--evento-asistencia]
  - [affects, entity--participante-evento]
  - [affects, entity--participante-externo]
  - [affects, entity--marcacion-asistencia]
  - [belongs_to, domain--asistencia]
terminos: [evento, asistencia, participante, externo, marcacion, entrada, salida, tolerancia, porcentaje, participantes, marcaciones, pasa, programado, curso, finalizado, pueden, ser, bomberos, externos, participacion, califica, contra, vigente]
---

# Evento de asistencia, participantes y marcaciones

Un evento pasa de PROGRAMADO a EN_CURSO a FINALIZADO. Los participantes pueden ser bomberos o externos, y su participacion se califica contra la tolerancia vigente.

## Estados del evento

`EstadoEventoAsistencia` = `PROGRAMADO` → `EN_CURSO` → `FINALIZADO`, con `CANCELADO`
como salida.

## Participantes: dos poblaciones distintas

- **Bomberos** de la institucion → `operaciones.participantes_evento`, ligados a
  `personal.bomberos`.
- **Externos** (invitados, otras instituciones) → `operaciones.participantes_externos`,
<<<<<<< Updated upstream
  con sus propios datos porque no tienen legajo. Endpoints bajo `/operaciones/externos`
  con permisos `asistencia:externos_*`.
=======
  con sus propios datos porque no tienen legajo. Endpoints bajo
  `/operaciones/externos` con permisos `asistencia:externos_*`.
>>>>>>> Stashed changes

Separarlos evita crear bomberos falsos para poder registrar a un visitante, que
contaminaria el padron de personal.

## Calificacion de la participacion

`EstadoParticipacion` = `COMPLETA` | `PARCIAL` | `NO_REGISTRADA` |
`AUSENTE_CONFIRMADO`.

`AUSENTE_CONFIRMADO` no es lo mismo que `NO_REGISTRADA`: el primero es una ausencia
verificada, el segundo es falta de dato. Distinguirlos importa porque el porcentaje de
asistencia afecta decisiones sobre las personas.

## Marcaciones

`operaciones.marcaciones_asistencia` guarda `TipoMarcacion` (`ENTRADA`/`SALIDA`),
`MetodoMarcacion` (`HUELLA`, `QR`, `PIN`, `RFID`, `MANUAL`, `APP`) y `FuenteAsistencia`.

La puntualidad se evalua **contra la tolerancia vigente**, resuelta como indica
[[rule--tolerancia-null-es-la-general]] — nunca contra minutos fijos en el codigo.

## Pantallas y agregacion

`/dashboard/asistencia` (resumen), `/eventos`, `/eventos/[id]`, `/guardias`,
`/guardias/[id]`, `/registro`, `/externos`, `/tolerancias`, `/auditoria`.
`operaciones/dashboard` (`DashboardAsistenciaService`) calcula los agregados.

<<<<<<< Updated upstream
## Guardias: ahora es un modulo aparte

Las guardias **ya no viven aca**: tienen su propio modulo NestJS, su prefijo de
permisos `guardias:` y sus pantallas bajo `/dashboard/guardias/`. Ver
[[workflow--guardia-y-pernocte]].

Lo que quedo de la etapa anterior:

- `AsignacionGuardia` (`ASIGNADO`/`CONFIRMADO`/`REEMPLAZADO`/`AUSENTE`) y
  `CambioGuardia` (`PENDIENTE`/`APROBADO`/`RECHAZADO`/`CANCELADO`) siguen del lado de
  asistencia.
- Las pantallas `/dashboard/asistencia/guardias` y `/dashboard/asistencia/guardias/[id]`
  siguen existiendo, en paralelo a las de `/dashboard/guardias`.
- Y **todas** las tablas de guardias comparten el esquema `operaciones` con las de
  asistencia — ver [[rule--guardias-vive-en-operaciones]].

Al tocar asistencia o guardias, verificar en cual de los dos lados esta lo que vas a
cambiar: hay superposicion real.
=======
## Guardias, en paralelo

Las guardias tienen su propio ciclo: `EstadoGuardia`
(`PROGRAMADA`/`EN_CURSO`/`FINALIZADA`/`CANCELADA`/`REEMPLAZADA`),
`EstadoAsignacionGuardia` (`ASIGNADO`/`CONFIRMADO`/`REEMPLAZADO`/`AUSENTE`) y
`EstadoCambioGuardia` (`PENDIENTE`/`APROBADO`/`RECHAZADO`/`CANCELADO`) para el flujo de
solicitud y aprobacion de cambios. Viven en el modulo `operaciones` con permisos
`asistencia:guardias_*`, no en un modulo `guardias` propio — ver
[[rule--modulo-visible-por-prefijo]].
>>>>>>> Stashed changes


## Archivos

- `backend/src/modules/operaciones/eventos-asistencia.service.ts`
- `backend/src/modules/operaciones/marcaciones.service.ts`

## Relaciones

- `contains` → [[rule--tolerancia-null-es-la-general|La tolerancia con tipoEventoId NULL es la regla general por defecto]]
- `affects` → [[entity--evento-asistencia|EventoAsistencia]]
- `affects` → [[entity--participante-evento|ParticipanteEvento]]
- `affects` → [[entity--participante-externo|ParticipanteExterno]]
- `affects` → [[entity--marcacion-asistencia|MarcacionAsistencia]]
- `belongs_to` → [[domain--asistencia|Asistencia]]

---
<sub>Nodo **curado** (editable a mano).</sub>
