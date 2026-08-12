---
id: service--operaciones-tolerancias
tipo: SERVICE
nombre: ToleranciasService
nivel: L2
dominio: asistencia
resumen: Logica de negocio de tolerancias (modulo operaciones).
capa: backend
archivos:
  - backend/src/modules/operaciones/tolerancias.service.ts
edges:
  - [belongs_to, domain--asistencia]
  - [uses, component--modulo-operaciones]
  - [uses, entity--tolerancia-asistencia]
  - [reads, table--operaciones-tolerancias-asistencia]
terminos: [tolerancias, operaciones, tolerancia, asistencia]
---

# ToleranciasService

Logica de negocio de tolerancias (modulo operaciones).


## Metodos

`findAll()` · `findOne()` · `create()` · `update()` · `resolverPara()`

## Archivos

- `backend/src/modules/operaciones/tolerancias.service.ts`

## Relaciones

- `belongs_to` → [[domain--asistencia|Asistencia]]
- `uses` → [[component--modulo-operaciones|operaciones (modulo NestJS)]]
- `uses` → [[entity--tolerancia-asistencia|ToleranciaAsistencia]]
- `reads` → [[table--operaciones-tolerancias-asistencia|operaciones.tolerancias_asistencia]]

## Referenciado por

- [[api--operaciones-tolerancias|ToleranciasController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
