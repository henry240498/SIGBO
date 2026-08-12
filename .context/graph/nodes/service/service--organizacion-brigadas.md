---
id: service--organizacion-brigadas
tipo: SERVICE
nombre: BrigadasService
nivel: L2
dominio: organizacion
resumen: Logica de negocio de brigadas (modulo organizacion).
capa: backend
archivos:
  - backend/src/modules/organizacion/brigadas.service.ts
edges:
  - [belongs_to, domain--organizacion]
  - [uses, component--modulo-organizacion]
  - [uses, entity--brigada]
  - [reads, table--organizacion-brigadas]
terminos: [brigadas, organizacion, brigada]
---

# BrigadasService

Logica de negocio de brigadas (modulo organizacion).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `darBaja()` · `reactivar()` · `filasExportables()`

## Archivos

- `backend/src/modules/organizacion/brigadas.service.ts`

## Relaciones

- `belongs_to` → [[domain--organizacion|Organización Institucional]]
- `uses` → [[component--modulo-organizacion|organizacion (modulo NestJS)]]
- `uses` → [[entity--brigada|Brigada]]
- `reads` → [[table--organizacion-brigadas|organizacion.brigadas]]

## Referenciado por

- [[api--organizacion-brigadas|BrigadasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
