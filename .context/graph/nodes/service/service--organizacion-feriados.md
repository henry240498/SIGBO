---
id: service--organizacion-feriados
tipo: SERVICE
nombre: FeriadosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de feriados (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/feriados.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--feriado]
  - [reads, table--organizacion-feriados]
  - [uses, entity--guardia]
  - [reads, table--operaciones-guardias]
  - [uses, service--seguridad-auditoria]
terminos: [feriados, organizacion, feriado, guardia]
---

# FeriadosService

Logica de negocio de feriados (modulo organizacion).


## Metodos

`if()` · `findAll()` · `findOne()` · `create()` · `update()` · `mover()` · `remove()`

## Archivos

- `backend/src/modules/organizacion/feriados.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--feriado|Feriado]]
- `reads` → [[table--organizacion-feriados|organizacion.feriados]]
- `uses` → [[entity--guardia|Guardia]]
- `reads` → [[table--operaciones-guardias|operaciones.guardias]]
- `uses` → [[service--seguridad-auditoria|AuditoriaService]]

## Referenciado por

- [[api--organizacion-feriados|FeriadosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
