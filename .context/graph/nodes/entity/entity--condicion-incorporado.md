---
id: entity--condicion-incorporado
tipo: ENTITY
nombre: CondicionIncorporado
nivel: L1
dominio: personal
resumen: Entidad CondicionIncorporado, persistida en personal.condicion_incorporado.
tabla: personal.condicion_incorporado
archivos:
  - backend/src/shared/entities/condicion-incorporado.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-condicion-incorporado]
terminos: [condicion, incorporado, personal]
---

# CondicionIncorporado

Entidad CondicionIncorporado, persistida en personal.condicion_incorporado.

- **Tabla:** [[table--personal-condicion-incorporado|personal.condicion_incorporado]]
- **Columnas mapeadas:** 7

## Archivos

- `backend/src/shared/entities/condicion-incorporado.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-condicion-incorporado|personal.condicion_incorporado]]

## Referenciado por

- [[service--personal-condicion|CondicionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
