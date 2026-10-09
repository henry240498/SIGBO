---
id: entity--gre-documento
tipo: ENTITY
nombre: GreDocumento
nivel: L1
dominio: matpel
resumen: "Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado."
tabla: matpel.gre_documentos
archivos:
  - backend/src/shared/entities/gre-documento.entity.ts
edges:
  - [belongs_to, domain--matpel]
  - [persisted_in, table--matpel-gre-documentos]
terminos: [gre, documento, documentos, matpel]
---

# GreDocumento

Base GRE fase 3A. SQL preparado en 094; no implica catálogo importado o activado.

- **Tabla:** [[table--matpel-gre-documentos|matpel.gre_documentos]]
- **Columnas mapeadas:** 10

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** —
- **Servicios:** GreCatalogoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/gre-documento.entity.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `persisted_in` → [[table--matpel-gre-documentos|matpel.gre_documentos]]

## Referenciado por

- [[service--gre-gre-catalogo|GreCatalogoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
