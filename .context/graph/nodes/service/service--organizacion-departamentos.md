---
id: service--organizacion-departamentos
tipo: SERVICE
nombre: DepartamentosService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de departamentos (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/departamentos.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--departamento]
  - [reads, table--organizacion-departamentos]
terminos: [departamentos, organizacion, departamento]
---

# DepartamentosService

Logica de negocio de departamentos (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/departamentos.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--departamento|Departamento]]
- `reads` → [[table--organizacion-departamentos|organizacion.departamentos]]

## Referenciado por

- [[api--organizacion-departamentos|DepartamentosController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
