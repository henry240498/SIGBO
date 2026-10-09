---
id: table--matpel-gre-versiones
tipo: TABLE
nombre: matpel.gre_versiones
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_versiones (13 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_versiones
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-documentos]
  - [references, table--seguridad-usuarios]
terminos: [matpel, gre, versiones, documento, version, parser, normalizador, esquema, revision, correcciones, derivada, sha256, contenido, estado, reporte, json, creado, validada]
---

# matpel.gre_versiones

Tabla matpel.gre_versiones (13 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 13
- **UNIQUE:** `documento_id, version_parser, version_normalizador, version_esquema, revision_correcciones`, `id, documento_id`

## Restricciones CHECK (reglas que la BD impone)

- `(revision_correcciones = 0 AND derivada_de_id IS NULL) OR (revision_correcciones > 0 AND derivada_de_id IS NOT NULL AND derivada_de_id <> id)`

## Llaves foraneas

- `derivada_de_id, documento_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `documento_id` → [[table--matpel-gre-documentos|matpel.gre_documentos]]
- `validada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| documento_id | UNIQUEIDENTIFIER |
| version_parser | NVARCHAR(80) |
| version_normalizador | NVARCHAR(80) |
| version_esquema | NVARCHAR(30) |
| revision_correcciones | INT |
| derivada_de_id | UNIQUEIDENTIFIER |
| sha256_contenido | CHAR(64) |
| estado | NVARCHAR(24) |
| reporte_json | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| validada_en | DATETIMEOFFSET(3) |
| validada_por | UNIQUEIDENTIFIER |

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
- `references` → [[table--matpel-gre-documentos|matpel.gre_documentos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--matpel-gre-paginas|matpel.gre_paginas]] `references` →
- [[table--matpel-gre-secciones|matpel.gre_secciones]] `references` →
- [[table--matpel-gre-referencias|matpel.gre_referencias]] `references` →
- [[table--matpel-gre-guias|matpel.gre_guias]] `references` →
- [[table--matpel-gre-entradas|matpel.gre_entradas]] `references` →
- [[table--matpel-gre-aliases|matpel.gre_aliases]] `references` →
- [[table--matpel-gre-bloques|matpel.gre_bloques]] `references` →
- [[table--matpel-gre-tablas|matpel.gre_tablas]] `references` →
- [[table--matpel-gre-filas|matpel.gre_filas]] `references` →
- [[table--matpel-gre-celdas|matpel.gre_celdas]] `references` →
- [[table--matpel-gre-reglas|matpel.gre_reglas]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[table--matpel-gre-revisiones|matpel.gre_revisiones]] `references` →
- [[table--matpel-gre-importaciones|matpel.gre_importaciones]] `references` →
- [[table--matpel-gre-activaciones|matpel.gre_activaciones]] `references` →
- [[table--matpel-gre-activaciones-historial|matpel.gre_activaciones_historial]] `references` →
- [[table--matpel-gre-activaciones-historial|matpel.gre_activaciones_historial]] `references` →
- [[entity--gre-version|GreVersion]] `persisted_in` →
- [[service--gre-gre-catalogo|GreCatalogoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
