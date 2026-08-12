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

## Archivos

- `backend/src/shared/entities/condicion-apoyo-economico.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-condicion-apoyo-economico|personal.condicion_apoyo_economico]]

## Referenciado por

- [[service--personal-condicion|CondicionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
