---
id: entity--tipo-bombero
tipo: ENTITY
nombre: TipoBombero
nivel: L1
dominio: personal
resumen: Entidad TipoBombero, persistida en personal.tipos_bombero.
tabla: personal.tipos_bombero
archivos:
  - backend/src/shared/entities/tipo-bombero.entity.ts
edges:
  - [belongs_to, domain--personal]
  - [persisted_in, table--personal-tipos-bombero]
terminos: [tipo, bombero, tipos, personal]
---

# TipoBombero

Entidad TipoBombero, persistida en personal.tipos_bombero.

- **Tabla:** [[table--personal-tipos-bombero|personal.tipos_bombero]]
- **Columnas mapeadas:** 8

## Archivos

- `backend/src/shared/entities/tipo-bombero.entity.ts`

## Relaciones

- `belongs_to` → [[domain--personal|Personal]]
- `persisted_in` → [[table--personal-tipos-bombero|personal.tipos_bombero]]

## Referenciado por

- [[service--personal-tipos-bombero|TiposBomberoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
