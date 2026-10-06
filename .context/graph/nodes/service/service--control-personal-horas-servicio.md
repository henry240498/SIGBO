---
id: service--control-personal-horas-servicio
tipo: SERVICE
nombre: HorasServicioService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de horas servicio (modulo control-personal).
capa: backend
archivos:
  - backend/src/modules/control-personal/horas-servicio.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-control-personal]
  - [uses, service--seguridad-auditoria]
terminos: [horas, servicio, control, personal]
---

# HorasServicioService

Logica de negocio de horas servicio (modulo control-personal).


## Metodos

`limitesActivos()` · `fijarLimites()` · `resumen()`

## Archivos

- `backend/src/modules/control-personal/horas-servicio.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-control-personal|control-personal (modulo NestJS)]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--control-personal-control-personal|ControlPersonalController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
