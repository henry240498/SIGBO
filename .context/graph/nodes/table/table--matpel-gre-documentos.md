---
id: table--matpel-gre-documentos
tipo: TABLE
nombre: matpel.gre_documentos
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_documentos (11 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_documentos
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--seguridad-usuarios]
terminos: [matpel, gre, documentos, sha256, referencia, privada, tamano, bytes, paginas, titulo, edicion, idioma, identificacion, json, incorporada, creado]
---

# matpel.gre_documentos

Tabla matpel.gre_documentos (11 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 11
- **UNIQUE:** `sha256`

## Llaves foraneas

- `incorporada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| sha256 | CHAR(64) |
| referencia_privada | NVARCHAR(100) |
| tamano_bytes | INT |
| paginas | INT |
| titulo | NVARCHAR(400) |
| edicion | NVARCHAR(20) |
| idioma | NVARCHAR(10) |
| identificacion_json | NVARCHAR(MAX) |
| incorporada_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

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
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--matpel-gre-versiones|matpel.gre_versiones]] `references` →
- [[entity--gre-documento|GreDocumento]] `persisted_in` →
- [[service--gre-gre-catalogo|GreCatalogoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
