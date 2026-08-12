---
id: entity--condicion-honorario
tipo: ENTITY
nombre: CondicionHonorario
nivel: L1
dominio: personal
resumen: Entidad CondicionHonorario, persistida en personal.condicion_honorario.
tabla: personal.condicion_honorario
archivos:
  - backend/src/shared/entities/condicion-honorario.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-condicion-honorario]
terminos: [condicion, honorario, personal]
---

# CondicionHonorario

Entidad CondicionHonorario, persistida en personal.condicion_honorario.

- **Tabla:** [[table--personal-condicion-honorario|personal.condicion_honorario]]
- **Columnas mapeadas:** 6

## Archivos

- `backend/src/shared/entities/condicion-honorario.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-condicion-honorario|personal.condicion_honorario]]

## Referenciado por

- [[service--personal-condicion|CondicionService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
