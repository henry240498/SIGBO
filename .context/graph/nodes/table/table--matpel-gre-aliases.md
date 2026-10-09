---
id: table--matpel-gre-aliases
tipo: TABLE
nombre: matpel.gre_aliases
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_aliases (6 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_aliases
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-entradas]
  - [references, table--matpel-gre-referencias]
terminos: [matpel, gre, aliases, version, entrada, nombre, original, normalizado, referencia]
---

# matpel.gre_aliases

Tabla matpel.gre_aliases (6 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 6
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `entrada_id, version_id` → [[table--matpel-gre-entradas|matpel.gre_entradas]]
- `referencia_id, version_id` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| entrada_id | UNIQUEIDENTIFIER |
| nombre_original | NVARCHAR(1000) |
| nombre_normalizado | NVARCHAR(400) |
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
- `references` → [[table--matpel-gre-entradas|matpel.gre_entradas]]
- `references` → [[table--matpel-gre-referencias|matpel.gre_referencias]]

## Referenciado por

- [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]] `references` →
- [[entity--gre-alias|GreAlias]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
