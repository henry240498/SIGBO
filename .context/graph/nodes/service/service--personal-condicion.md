---
id: service--personal-condicion
tipo: SERVICE
nombre: CondicionService
nivel: L2
dominio: personal
resumen: Logica de negocio de condicion (modulo personal).
capa: backend
archivos:
  - backend/src/modules/personal/condicion.service.ts
edges:
  - [belongs_to, domain--personal]
  - [uses, component--modulo-personal]
  - [uses, entity--bombero]
  - [reads, table--personal-bomberos]
  - [uses, entity--condicion-incorporado]
  - [reads, table--personal-condicion-incorporado]
  - [uses, entity--condicion-combatiente]
  - [reads, table--personal-condicion-combatiente]
  - [uses, entity--condicion-apoyo-economico]
  - [reads, table--personal-condicion-apoyo-economico]
  - [uses, entity--condicion-honorario]
  - [reads, table--personal-condicion-honorario]
  - [uses, entity--historial-institucional]
  - [reads, table--personal-historial-institucional]
terminos: [condicion, personal, bombero, incorporado, combatiente, apoyo, economico, honorario, historial, institucional]
---

# CondicionService

Logica de negocio de condicion (modulo personal).


## Metodos

`obtener()` · `actualizar()`

## Archivos

- `backend/src/modules/personal/condicion.service.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `uses` → [[component--modulo-personal|personal (modulo NestJS)]]
- `uses` → [[entity--bombero|Bombero]]
- `reads` → [[table--personal-bomberos|personal.bomberos]]
- `uses` → [[entity--condicion-incorporado|CondicionIncorporado]]
- `reads` → [[table--personal-condicion-incorporado|personal.condicion_incorporado]]
- `uses` → [[entity--condicion-combatiente|CondicionCombatiente]]
- `reads` → [[table--personal-condicion-combatiente|personal.condicion_combatiente]]
- `uses` → [[entity--condicion-apoyo-economico|CondicionApoyoEconomico]]
- `reads` → [[table--personal-condicion-apoyo-economico|personal.condicion_apoyo_economico]]
- `uses` → [[entity--condicion-honorario|CondicionHonorario]]
- `reads` → [[table--personal-condicion-honorario|personal.condicion_honorario]]
- `uses` → [[entity--historial-institucional|HistorialInstitucional]]
- `reads` → [[table--personal-historial-institucional|personal.historial_institucional]]

## Referenciado por

- [[api--personal-condicion|CondicionController]] `exposes` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
