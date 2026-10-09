---
id: table--matpel-gre-filas
tipo: TABLE
nombre: matpel.gre_filas
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_filas (8 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_filas
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-tablas]
  - [references, table--matpel-gre-entradas]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, filas, version, tabla, orden, entrada, etiqueta, original, condiciones, json, referencia]
---

# matpel.gre_filas

Tabla matpel.gre_filas (8 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 8
- **UNIQUE:** `id, version_id`, `version_id, tabla_id, orden`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `tabla_id, version_id` → [[table--matpel-gre-tablas|matpel.gre_tablas]]
- `entrada_id, version_id` → [[table--matpel-gre-entradas|matpel.gre_entradas]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| tabla_id | UNIQUEIDENTIFIER |
| orden | INT |
| entrada_id | UNIQUEIDENTIFIER |
| etiqueta_original | NVARCHAR(1000) |
| condiciones_json | NVARCHAR(MAX) |
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
- `references` → [[table--matpel-gre-tablas|matpel.gre_tablas]]
- `references` → [[table--matpel-gre-entradas|matpel.gre_entradas]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-celdas|matpel.gre_celdas]] `references` →
- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-fila|GreFila]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
