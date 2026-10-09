---
id: entity--gre-bloque
tipo: ENTITY
nombre: GreBloque
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_bloques
archivos:
  - backend/src/shared/entities/gre-bloque.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-bloques]
terminos: [gre, bloque, bloques, matpel]
---

# GreBloque

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-bloques|matpel.gre_bloques]]
- **Columnas mapeadas:** 8

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-bloque.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-bloques|matpel.gre_bloques]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
