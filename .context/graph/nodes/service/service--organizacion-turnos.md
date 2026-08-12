---
id: service--organizacion-turnos
tipo: SERVICE
nombre: TurnosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de turnos (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/turnos.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--turno]
  - [reads, table--organizacion-turnos]
terminos: [turnos, organizacion, turno]
---

# TurnosService

Logica de negocio de turnos (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/turnos.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--turno|Turno]]
- `reads` → [[table--organizacion-turnos|organizacion.turnos]]

## Referenciado por

- [[api--organizacion-turnos|TurnosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
