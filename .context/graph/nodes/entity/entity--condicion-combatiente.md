---
id: entity--condicion-combatiente
tipo: ENTITY
nombre: CondicionCombatiente
nivel: L1
dominio: personal
resumen: Entidad CondicionCombatiente, persistida en personal.condicion_combatiente.
tabla: personal.condicion_combatiente
archivos:
  - backend/src/shared/entities/condicion-combatiente.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-condicion-combatiente]
terminos: [condicion, combatiente, personal]
---

# CondicionCombatiente

Entidad CondicionCombatiente, persistida en personal.condicion_combatiente.

- **Tabla:** [[table--personal-condicion-combatiente|personal.condicion_combatiente]]
- **Columnas mapeadas:** 4

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** CondicionController
- **Servicios:** CondicionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/condicion-combatiente.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-condicion-combatiente|personal.condicion_combatiente]]

## Referenciado por

- [[service--personal-condicion|CondicionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
