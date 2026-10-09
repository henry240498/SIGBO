---
id: entity--gre-fila
tipo: ENTITY
nombre: GreFila
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_filas
archivos:
  - backend/src/shared/entities/gre-fila.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-filas]
terminos: [gre, fila, filas, matpel]
---

# GreFila

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-filas|matpel.gre_filas]]
- **Columnas mapeadas:** 7

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-fila.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-filas|matpel.gre_filas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
