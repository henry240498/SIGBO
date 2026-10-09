---
id: entity--gre-regla
tipo: ENTITY
nombre: GreRegla
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_reglas
archivos:
  - backend/src/shared/entities/gre-regla.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-reglas]
terminos: [gre, regla, reglas, matpel]
---

# GreRegla

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-reglas|matpel.gre_reglas]]
- **Columnas mapeadas:** 9

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-regla.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-reglas|matpel.gre_reglas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
