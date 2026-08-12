---
id: entity--seguro-bombero
tipo: ENTITY
nombre: SeguroBombero
nivel: L1
dominio: personal
resumen: Una poliza de seguro de un bombero. Relacion 1:N (un voluntario puede tener varios seguros vigentes o historicos a la vez).
tabla: personal.seguros_bombero
archivos:
  - backend/src/shared/entities/seguro-bombero.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-seguros-bombero]
terminos: [seguro, bombero, seguros, personal]
---

# SeguroBombero

Una poliza de seguro de un bombero. Relacion 1:N (un voluntario puede tener varios seguros vigentes o historicos a la vez).

- **Tabla:** [[table--personal-seguros-bombero|personal.seguros_bombero]]
- **Columnas mapeadas:** 11

## Archivos

- `backend/src/shared/entities/seguro-bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-seguros-bombero|personal.seguros_bombero]]

## Referenciado por

- [[service--personal-seguros-bombero|SegurosBomberoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
