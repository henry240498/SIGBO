---
id: entity--gre-campo-fuente
tipo: ENTITY
nombre: GreCampoFuente
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_campos_fuente
archivos:
  - backend/src/shared/entities/gre-campo-fuente.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-campos-fuente]
terminos: [gre, campo, fuente, campos, matpel]
---

# GreCampoFuente

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]]
- **Columnas mapeadas:** 12

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `backend/src/shared/entities/gre-campo-fuente.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]]

## Referenciado por

- [[decision--matpel-catalogo-contexto-versionados|GRE versionada y MATPEL sobre el mismo Servicio y cronología]] `constrains` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
