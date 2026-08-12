---
id: service--organizacion-designaciones
tipo: SERVICE
nombre: DesignacionesService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de designaciones (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/designaciones.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--designacion]
  - [reads, table--organizacion-designaciones]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--cargo]
  - [reads, table--organizacion-cargos]
  - [uses, entity--compania]
  - [reads, table--organizacion-companias]
  - [uses, entity--cuartel]
  - [reads, table--organizacion-cuarteles]
terminos: [designaciones, organizacion, designacion, bombero, cargo, compania, cuartel]
---

# DesignacionesService

Logica de negocio de designaciones (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `finalizar()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/designaciones.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--designacion|Designacion]]
- `reads` → [[table--organizacion-designaciones|organizacion.designaciones]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--cargo|Cargo]]
- `reads` → [[table--organizacion-cargos|organizacion.cargos]]
- `uses` → [[entity--compania|Compania]]
- `reads` → [[table--organizacion-companias|organizacion.companias]]
- `uses` → [[entity--cuartel|Cuartel]]
- `reads` → [[table--organizacion-cuarteles|organizacion.cuarteles]]

## Referenciado por

- [[api--organizacion-designaciones|DesignacionesController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
