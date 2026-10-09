---
id: entity--gre-guia
tipo: ENTITY
nombre: GreGuia
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_guias
archivos:
  - backend/src/shared/entities/gre-guia.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-guias]
terminos: [gre, guia, guias, matpel]
---

# GreGuia

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-guias|matpel.gre_guias]]
- **Columnas mapeadas:** 5

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-guia.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-guias|matpel.gre_guias]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
