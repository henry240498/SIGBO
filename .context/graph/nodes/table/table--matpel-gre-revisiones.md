---
id: table--matpel-gre-revisiones
tipo: TABLE
nombre: matpel.gre_revisiones
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_revisiones (9 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_revisiones
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-campos-fuente]
  - [references, table--seguridad-usuarios]
terminos: [matpel, gre, revisiones, version, campo, fuente, resultado, valor, anterior, json, propuesto, fundamento, revisada, creado]
---

# matpel.gre_revisiones

Tabla matpel.gre_revisiones (9 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 9
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `campo_fuente_id, version_id` → [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]]
- `revisada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| campo_fuente_id | UNIQUEIDENTIFIER |
| resultado | NVARCHAR(20) |
| valor_anterior_json | NVARCHAR(MAX) |
| valor_propuesto_json | NVARCHAR(MAX) |
| fundamento | NVARCHAR(MAX) |
| revisada_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--matpel-gre-campos-fuente|matpel.gre_campos_fuente]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--gre-revision|GreRevision]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
