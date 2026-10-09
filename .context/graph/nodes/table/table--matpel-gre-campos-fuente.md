---
id: table--matpel-gre-campos-fuente
tipo: TABLE
nombre: matpel.gre_campos_fuente
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_campos_fuente (13 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_campos_fuente
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-referencias]
  - [references, table--matpel-gre-secciones]
  - [references, table--matpel-gre-entradas]
  - [references, table--matpel-gre-aliases]
  - [references, table--matpel-gre-guias]
  - [references, table--matpel-gre-bloques]
  - [references, table--matpel-gre-tablas]
  - [references, table--matpel-gre-filas]
  - [references, table--matpel-gre-celdas]
  - [references, table--matpel-gre-reglas]
terminos: [matpel, gre, campos, fuente, version, campo, referencia, seccion, entrada, alias, guia, bloque, tabla, fila, celda, regla]
---

# matpel.gre_campos_fuente

Tabla matpel.gre_campos_fuente (13 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 13
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]
- `seccion_id, version_id` → [[table--matpel-gre-secciones|matpel.gre_secciones]]
- `entrada_id, version_id` → [[table--matpel-gre-entradas|matpel.gre_entradas]]
- `alias_id, version_id` → [[table--matpel-gre-aliases|matpel.gre_aliases]]
- `guia_id, version_id` → [[table--matpel-gre-guias|matpel.gre_guias]]
- `bloque_id, version_id` → [[table--matpel-gre-bloques|matpel.gre_bloques]]
- `tabla_id, version_id` → [[table--matpel-gre-tablas|matpel.gre_tablas]]
- `fila_id, version_id` → [[table--matpel-gre-filas|matpel.gre_filas]]
- `celda_id, version_id` → [[table--matpel-gre-celdas|matpel.gre_celdas]]
- `regla_id, version_id` → [[table--matpel-gre-reglas|matpel.gre_reglas]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| campo | NVARCHAR(80) |
| referencia_id | UNIQUEIDENTIFIER |
| seccion_id | UNIQUEIDENTIFIER |
| entrada_id | UNIQUEIDENTIFIER |
| alias_id | UNIQUEIDENTIFIER |
| guia_id | UNIQUEIDENTIFIER |
| bloque_id | UNIQUEIDENTIFIER |
| tabla_id | UNIQUEIDENTIFIER |
| fila_id | UNIQUEIDENTIFIER |
| celda_id | UNIQUEIDENTIFIER |
| regla_id | UNIQUEIDENTIFIER |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]
- `references` → [[table--matpel-gre-secciones|matpel.gre_secciones]]
- `references` → [[table--matpel-gre-entradas|matpel.gre_entradas]]
- `references` → [[table--matpel-gre-aliases|matpel.gre_aliases]]
- `references` → [[table--matpel-gre-guias|matpel.gre_guias]]
- `references` → [[table--matpel-gre-bloques|matpel.gre_bloques]]
- `references` → [[table--matpel-gre-tablas|matpel.gre_tablas]]
- `references` → [[table--matpel-gre-filas|matpel.gre_filas]]
- `references` → [[table--matpel-gre-celdas|matpel.gre_celdas]]
- `references` → [[table--matpel-gre-reglas|matpel.gre_reglas]]

## Referenciado por

- [[table--matpel-gre-revisiones|matpel.gre_revisiones]] `references` →
- [[entity--gre-campo-fuente|GreCampoFuente]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
