---
id: service--personal-historial-institucional
tipo: SERVICE
nombre: HistorialInstitucionalService
nivel: L2
dominio: personal
resumen: Logica de negocio de historial institucional (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/historial-institucional.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--historial-institucional]
  - [reads, table--personal-historial-institucional]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
terminos: [historial, institucional, personal, bombero]
---

# HistorialInstitucionalService

Logica de negocio de historial institucional (modulo personal).


## Metodos

`listar()` · `registrarManual()`

## Archivos

- `backend/src/modules/personal/historial-institucional.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--historial-institucional|HistorialInstitucional]]
- `reads` → [[table--personal-historial-institucional|personal.historial_institucional]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[api--personal-historial-institucional|HistorialInstitucionalController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
