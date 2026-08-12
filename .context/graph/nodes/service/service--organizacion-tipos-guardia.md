---
id: service--organizacion-tipos-guardia
tipo: SERVICE
nombre: TiposGuardiaService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de tipos guardia (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/tipos-guardia.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--tipo-guardia]
  - [reads, table--organizacion-tipos-guardia]
terminos: [tipos, guardia, organizacion, tipo]
---

# TiposGuardiaService

Logica de negocio de tipos guardia (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/tipos-guardia.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--tipo-guardia|TipoGuardia]]
- `reads` → [[table--organizacion-tipos-guardia|organizacion.tipos_guardia]]

## Referenciado por

- [[api--organizacion-tipos-guardia|TiposGuardiaController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
