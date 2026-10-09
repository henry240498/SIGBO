---
id: entity--gre-activacion-historial
tipo: ENTITY
nombre: GreActivacionHistorial
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_activaciones_historial
archivos:
  - backend/src/shared/entities/gre-activacion-historial.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-activaciones-historial]
terminos: [gre, activacion, historial, activaciones, matpel]
---

# GreActivacionHistorial

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-activaciones-historial|matpel.gre_activaciones_historial]]
- **Columnas mapeadas:** 8

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-activacion-historial.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-activaciones-historial|matpel.gre_activaciones_historial]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
