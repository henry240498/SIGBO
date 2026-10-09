---
id: table--matpel-gre-bloques
tipo: TABLE
nombre: matpel.gre_bloques
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_bloques (9 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_bloques
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-secciones]
  - [references, table--matpel-gre-guias]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, bloques, version, seccion, guia, padre, orden, encabezado, original, texto, referencia]
---

# matpel.gre_bloques

Tabla matpel.gre_bloques (9 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 9
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `seccion_id, version_id` → [[table--matpel-gre-secciones|matpel.gre_secciones]]
- `guia_id, version_id` → [[table--matpel-gre-guias|matpel.gre_guias]]
- `padre_id, version_id` → [[table--matpel-gre-bloques|matpel.gre_bloques]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| seccion_id | UNIQUEIDENTIFIER |
| guia_id | UNIQUEIDENTIFIER |
| padre_id | UNIQUEIDENTIFIER |
| orden | INT |
| encabezado_original | NVARCHAR(500) |
| texto_original | NVARCHAR(MAX) |
| referencia_id | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--matpel-gre-secciones|matpel.gre_secciones]]
- `references` → [[table--matpel-gre-guias|matpel.gre_guias]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-bloque|GreBloque]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
