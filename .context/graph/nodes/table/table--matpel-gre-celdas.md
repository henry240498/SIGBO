---
id: table--matpel-gre-celdas
tipo: TABLE
nombre: matpel.gre_celdas
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_celdas (12 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_celdas
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-filas]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, celdas, version, fila, columna, codigo, orden, texto, original, valor, decimal, unidad, modificador, estado, dato, condiciones, json, referencia]
---

# matpel.gre_celdas

Tabla matpel.gre_celdas (12 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 12
- **UNIQUE:** `id, version_id`, `version_id, fila_id, columna_codigo`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `fila_id, version_id` → [[table--matpel-gre-filas|matpel.gre_filas]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| fila_id | UNIQUEIDENTIFIER |
| columna_codigo | NVARCHAR(80) |
| orden | INT |
| texto_original | NVARCHAR(MAX) |
| valor_decimal | NVARCHAR(120) |
| unidad_original | NVARCHAR(80) |
| modificador | NVARCHAR(40) |
| estado_dato | NVARCHAR(20) |
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
- `references` → [[table--matpel-gre-filas|matpel.gre_filas]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-celda|GreCelda]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
