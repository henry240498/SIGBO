---
id: service--gre-gre-catalogo
tipo: SERVICE
nombre: GreCatalogoService
nivel: L2
dominio: matpel
resumen: Lectura interna por versión explícita. No activa candidatos ni cambia ediciones. La autorización HTTP se incorpora con los controladores de las fases 3D/4.
capa: backend
archivos:
  - backend/src/modules/gre/gre-catalogo.service.ts
edges:
  - [belongs_to, domain--matpel]
  - [uses, component--modulo-gre]
  - [uses, entity--gre-version]
  - [reads, table--matpel-gre-versiones]
  - [uses, entity--gre-documento]
  - [reads, table--matpel-gre-documentos]
  - [uses, entity--gre-referencia]
  - [reads, table--matpel-gre-referencias]
  - [uses, entity--gre-pagina]
  - [reads, table--matpel-gre-paginas]
  - [uses, service--gre-gre-fuentes]
terminos: [gre, catalogo, version, documento, referencia, pagina]
---

# GreCatalogoService

Lectura interna por versión explícita. No activa candidatos ni cambia ediciones. La autorización HTTP se incorpora con los controladores de las fases 3D/4.


## Metodos

`documentoDeVersionValidada()` · `fuenteDeVersionValidada()`

## Archivos

- `backend/src/modules/gre/gre-catalogo.service.ts`

## Relaciones

- `belongs_to` → [[domain--matpel|matpel]]
- `uses` → [[component--modulo-gre|gre (modulo NestJS)]]
- `uses` → [[entity--gre-version|GreVersion]]
- `reads` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `uses` → [[entity--gre-documento|GreDocumento]]
- `reads` → [[table--matpel-gre-documentos|matpel.gre_documentos]]
- `uses` → [[entity--gre-referencia|GreReferencia]]
- `reads` → [[table--matpel-gre-referencias|matpel.gre_referencias]]
- `uses` → [[entity--gre-pagina|GrePagina]]
- `reads` → [[table--matpel-gre-paginas|matpel.gre_paginas]]
- `uses` → [[service--gre-gre-fuentes|GreFuentesService]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
