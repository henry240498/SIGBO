---
id: entity--gre-celda
tipo: ENTITY
nombre: GreCelda
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_celdas
archivos:
  - backend/src/shared/entities/gre-celda.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-celdas]
terminos: [gre, celda, celdas, matpel]
---

# GreCelda

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-celdas|matpel.gre_celdas]]
- **Columnas mapeadas:** 11

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-celda.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-celdas|matpel.gre_celdas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
