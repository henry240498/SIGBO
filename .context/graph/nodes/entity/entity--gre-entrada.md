---
id: entity--gre-entrada
tipo: ENTITY
nombre: GreEntrada
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_entradas
archivos:
  - backend/src/shared/entities/gre-entrada.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-entradas]
terminos: [gre, entrada, entradas, matpel]
---

# GreEntrada

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-entradas|matpel.gre_entradas]]
- **Columnas mapeadas:** 9

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-entrada.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-entradas|matpel.gre_entradas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
