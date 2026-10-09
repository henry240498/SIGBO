---
id: entity--gre-revision
tipo: ENTITY
nombre: GreRevision
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_revisiones
archivos:
  - backend/src/shared/entities/gre-revision.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-revisiones]
terminos: [gre, revision, revisiones, matpel]
---

# GreRevision

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-revisiones|matpel.gre_revisiones]]
- **Columnas mapeadas:** 8

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-revision.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-revisiones|matpel.gre_revisiones]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
