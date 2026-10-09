---
id: entity--gre-tabla
tipo: ENTITY
nombre: GreTabla
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_tablas
archivos:
  - backend/src/shared/entities/gre-tabla.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-tablas]
terminos: [gre, tabla, tablas, matpel]
---

# GreTabla

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-tablas|matpel.gre_tablas]]
- **Columnas mapeadas:** 6

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-tabla.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-tablas|matpel.gre_tablas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
