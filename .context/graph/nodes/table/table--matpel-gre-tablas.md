---
id: table--matpel-gre-tablas
tipo: TABLE
nombre: matpel.gre_tablas
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_tablas (7 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_tablas
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-secciones]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, tablas, version, seccion, codigo, titulo, original, estructura, json, referencia]
---

# matpel.gre_tablas

Tabla matpel.gre_tablas (7 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 7
- **UNIQUE:** `id, version_id`, `version_id, codigo`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `seccion_id, version_id` → [[table--matpel-gre-secciones|matpel.gre_secciones]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| seccion_id | UNIQUEIDENTIFIER |
| codigo | NVARCHAR(80) |
| titulo_original | NVARCHAR(500) |
| estructura_json | NVARCHAR(MAX) |
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
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-filas|matpel.gre_filas]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-tabla|GreTabla]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
