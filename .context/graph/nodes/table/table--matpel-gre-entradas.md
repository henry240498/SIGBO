---
id: table--matpel-gre-entradas
tipo: TABLE
nombre: matpel.gre_entradas
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_entradas (10 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_entradas
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-guias]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, entradas, version, nombre, original, normalizado, identificador, tipo, guia, polimerizable, resaltado, verde, referencia]
---

# matpel.gre_entradas

Tabla matpel.gre_entradas (10 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 10
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `guia_id, version_id` → [[table--matpel-gre-guias|matpel.gre_guias]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| nombre_original | NVARCHAR(1000) |
| nombre_normalizado | NVARCHAR(400) |
| identificador | CHAR(4) |
| tipo_identificador | NVARCHAR(20) |
| guia_id | UNIQUEIDENTIFIER |
| polimerizable | BIT |
| resaltado_verde | BIT |
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
- `references` → [[table--matpel-gre-guias|matpel.gre_guias]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-aliases|matpel.gre_aliases]] `references` →
- [[table--matpel-gre-filas|matpel.gre_filas]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-entrada|GreEntrada]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
