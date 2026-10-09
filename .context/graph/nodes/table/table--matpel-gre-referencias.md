---
id: table--matpel-gre-referencias
tipo: TABLE
nombre: matpel.gre_referencias
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_referencias (11 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_referencias
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-paginas]
  - [references, table--matpel-gre-secciones]
terminos: [matpel, gre, referencias, version, pagina, pdf, seccion, texto, original, metodo, caja, json, sistema, coordenadas, orientacion, confianza, estado, revision]
---

# matpel.gre_referencias

Tabla matpel.gre_referencias (11 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 11
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `version_id, pagina_pdf` → [[table--matpel-gre-paginas|matpel.gre_paginas]]
- `seccion_id, version_id` → [[table--matpel-gre-secciones|matpel.gre_secciones]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| pagina_pdf | INT |
| seccion_id | UNIQUEIDENTIFIER |
| texto_original | NVARCHAR(MAX) |
| metodo | NVARCHAR(30) |
| caja_pt_json | NVARCHAR(MAX) |
| sistema_coordenadas | NVARCHAR(30) |
| orientacion | INT |
| confianza | FLOAT |
| estado_revision | NVARCHAR(15) |

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
- `references` → [[table--matpel-gre-paginas|matpel.gre_paginas]]
- `references` → [[table--matpel-gre-secciones|matpel.gre_secciones]]

## Referenciado por

- [[table--matpel-gre-guias|matpel.gre_guias]] `references` →
- [[table--matpel-gre-entradas|matpel.gre_entradas]] `references` →
- [[table--matpel-gre-aliases|matpel.gre_aliases]] `references` →
- [[table--matpel-gre-bloques|matpel.gre_bloques]] `references` →
- [[table--matpel-gre-tablas|matpel.gre_tablas]] `references` →
- [[table--matpel-gre-filas|matpel.gre_filas]] `references` →
- [[table--matpel-gre-celdas|matpel.gre_celdas]] `references` →
- [[table--matpel-gre-reglas|matpel.gre_reglas]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-referencia|GreReferencia]] `persisted_in` →
- [[service--gre-gre-catalogo|GreCatalogoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
