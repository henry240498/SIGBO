---
id: entity--gre-alias
tipo: ENTITY
nombre: GreAlias
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_aliases
archivos:
  - backend/src/shared/entities/gre-alias.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-aliases]
terminos: [gre, alias, aliases, matpel]
---

# GreAlias

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-aliases|matpel.gre_aliases]]
- **Columnas mapeadas:** 5

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-alias.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-aliases|matpel.gre_aliases]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
