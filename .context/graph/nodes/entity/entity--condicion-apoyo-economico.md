---
id: entity--condicion-apoyo-economico
tipo: ENTITY
nombre: CondicionApoyoEconomico
nivel: L1
dominio: personal
resumen: Entidad CondicionApoyoEconomico, persistida en personal.condicion_apoyo_economico.
tabla: personal.condicion_apoyo_economico
archivos:
  - backend/src/shared/entities/condicion-apoyo-economico.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-condicion-apoyo-economico]
terminos: [condicion, apoyo, economico, personal]
---

# CondicionApoyoEconomico

Entidad CondicionApoyoEconomico, persistida en personal.condicion_apoyo_economico.

- **Tabla:** [[table--personal-condicion-apoyo-economico|personal.condicion_apoyo_economico]]
- **Columnas mapeadas:** 7

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** CondicionController
- **Servicios:** CondicionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/condicion-apoyo-economico.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-condicion-apoyo-economico|personal.condicion_apoyo_economico]]

## Referenciado por

- [[service--personal-condicion|CondicionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
