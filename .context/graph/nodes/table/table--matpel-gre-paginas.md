---
id: table--matpel-gre-paginas
tipo: TABLE
nombre: matpel.gre_paginas
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_paginas (11 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_paginas
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
terminos: [matpel, gre, paginas, version, pagina, pdf, etiqueta, etiquetas, impresas, json, ancho, alto, rotacion, sha256, texto, nativo, caracteres, numeracion, ambigua]
---

# matpel.gre_paginas

Tabla matpel.gre_paginas (11 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 11
- **UNIQUE:** `id, version_id`, `version_id, pagina_pdf`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| pagina_pdf | INT |
| etiqueta_pdf | NVARCHAR(80) |
| etiquetas_impresas_json | NVARCHAR(MAX) |
| ancho_pt | FLOAT |
| alto_pt | FLOAT |
| rotacion | INT |
| sha256_texto_nativo | CHAR(64) |
| caracteres_texto | INT |
| numeracion_ambigua | BIT |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** —
- **Servicios:** GreCatalogoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]

## Referenciado por

- [[table--matpel-gre-secciones|matpel.gre_secciones]] `references` →
- [[table--matpel-gre-secciones|matpel.gre_secciones]] `references` →
- [[table--matpel-gre-referencias|matpel.gre_referencias]] `references` →
- [[entity--gre-pagina|GrePagina]] `persisted_in` →
- [[service--gre-gre-catalogo|GreCatalogoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
