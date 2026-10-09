---
id: entity--gre-activacion
tipo: ENTITY
nombre: GreActivacion
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_activaciones
archivos:
  - backend/src/shared/entities/gre-activacion.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-activaciones]
terminos: [gre, activacion, activaciones, matpel]
---

# GreActivacion

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-activaciones|matpel.gre_activaciones]]
- **Columnas mapeadas:** 5

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-activacion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-activaciones|matpel.gre_activaciones]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
