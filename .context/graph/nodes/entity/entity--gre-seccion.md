---
id: entity--gre-seccion
tipo: ENTITY
nombre: GreSeccion
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_secciones
archivos:
  - backend/src/shared/entities/gre-seccion.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-secciones]
terminos: [gre, seccion, secciones, matpel]
---

# GreSeccion

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-secciones|matpel.gre_secciones]]
- **Columnas mapeadas:** 6

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-seccion.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-secciones|matpel.gre_secciones]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
