---
id: workflow--guardia-y-pernocte
tipo: WORKFLOW
nombre: Operacion de una guardia: grupos, asignaciones, presencia, novedades y pernoctes
nivel: L1
resumen: Una guardia se arma desde grupos con roles TITULAR/CHOFER, se asigna personal validando elegibilidad, se registran horarios y presencia, y quedan novedades, inspecciones y pernoctes como parte del turno.
dominio: guardias
archivos: [backend/src/modules/guardias/guardias.service.ts, backend/src/modules/guardias/guardias.controller.ts]
terminos: [guardia, grupo, asignacion, presencia, horario, novedad, inspeccion, pernocte, cumplimiento, turno]
edges:
  - [contains, rule--elegibilidad-de-rol-guardia]
  - [contains, rule--guardias-vive-en-operaciones]
  - [affects, entity--guardia]
  - [affects, entity--grupo-guardia]
  - [affects, entity--asignacion-guardia]
  - [affects, entity--pernocte]
  - [affects, api--guardias-guardias]
---

## Las piezas

```
GrupoGuardia (ACTIVO/INACTIVO)
  └── GrupoGuardiaMiembro  rol: TITULAR | CHOFER
          │
          ▼  (al asignar se valida elegibilidad)
Guardia  estado: PROGRAMADA → EN_CURSO → FINALIZADA | CANCELADA | REEMPLAZADA
  turno: DIURNO | NOCTURNO | COMPLETO
  tipo:  ORDINARIA | ESPECIAL | EXTRAORDINARIA
  ├── AsignacionGuardia   ASIGNADO → CONFIRMADO | REEMPLAZADO | AUSENTE
  │     ├── horario       (registrar-horario)
  │     └── presencia     (actualizar-presencia)
  ├── NovedadGuardia      novedades del turno
  ├── InspeccionEstacion  OK | NO_OK
  └── Pernocte            entrada y salida
```

## Endpoints y permisos

| Accion | Endpoint | Permiso |
|---|---|---|
| Listar / ver guardia | `GET /guardias`, `GET /guardias/:id` | `guardias:ver` |
| Crear guardia | `POST /guardias` | `guardias:crear` |
| Ver asignaciones | `GET /guardias/:id/asignaciones` | `guardias:ver` |
| **Asignar personal** | `POST /guardias/:id/asignaciones` | **`guardias:asignar`** |
| Quitar asignacion | `DELETE /guardias/:id/asignaciones/:asignacionId` | `guardias:editar` |
| Registrar horario | `POST .../asignaciones/:asignacionId/horario` | `guardias:editar` |
| Registrar presencia | `POST .../asignaciones/:asignacionId/presencia` | `guardias:editar` |
| Consultar cumplimiento | `GET /guardias/:id/cumplimiento/:bomberoId` | `guardias:ver` |
| Grupos | `/guardias/grupos` | `ver` / `crear` / `editar` |
| Requisitos de rol | `/guardias/requisitos-rol` | `guardias:requisitos` |
| Novedades | `/guardias/:guardiaId/novedades` | `ver` / `editar` |
| Inspecciones | `/guardias/:guardiaId/inspecciones-estacion` | `ver` / `editar` |
| Pernoctes | `GET /guardias/pernoctes`, `POST`, `PATCH :id/salida` | `ver` / `editar` |

**`guardias:asignar` es el unico permiso propio de una accion operativa**: separar
quien puede armar la dotacion de quien solo corrige datos del turno. Y
`guardias:requisitos` aisla la configuracion de elegibilidad, que cambia las reglas
para todos.

## El paso critico: asignar personal

Asignar **no es solo insertar una fila**. Pasa por
`ElegibilidadService.validar(rol, bomberoId)`, que puede rechazar la asignacion:

- por no cumplir los requisitos configurados del rol, o
- por ser `CHOFER` sin registro en `personal.vehiculos_autorizados`.

Ver [[rule--elegibilidad-de-rol-guardia]]. El error vuelve como 400 con el nombre de
la persona y el motivo.

## Pernoctes: entrada y salida en dos pasos

`POST /guardias/pernoctes` registra la entrada; `PATCH /guardias/pernoctes/:id/salida`
cierra. Un pernocte abierto es un pernocte sin salida registrada — no hay estado
enumerado, el estado **es** la presencia o ausencia de la fecha de salida.

Al consultar pernoctes abiertos, filtrar por salida nula, no por un campo `estado`
que no existe.

## Donde viven los datos

**Todas** estas tablas estan en el esquema `operaciones`, no en uno llamado
`guardias`. Es la trampa de nombres del proyecto:
[[rule--guardias-vive-en-operaciones]].

## Relacion con Asistencia

`AsignacionGuardia` y `CambioGuardia` (`PENDIENTE`/`APROBADO`/`RECHAZADO`/`CANCELADO`)
vienen de la etapa en que guardias vivia dentro de asistencia. La asistencia a una
guardia tambien puede llegar por marcaciones con `FuenteAsistencia = 'GUARDIA'` — ver
[[workflow--asistencia-a-evento]].
