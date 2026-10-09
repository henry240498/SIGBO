---
id: entity--gre-importacion
tipo: ENTITY
nombre: GreImportacion
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_importaciones
archivos:
  - backend/src/shared/entities/gre-importacion.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-importaciones]
terminos: [gre, importacion, importaciones, matpel]
---

# GreImportacion

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-importaciones|matpel.gre_importaciones]]
- **Columnas mapeadas:** 12

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-importacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-importaciones|matpel.gre_importaciones]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
