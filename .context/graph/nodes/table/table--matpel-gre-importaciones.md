---
id: table--matpel-gre-importaciones
tipo: TABLE
nombre: matpel.gre_importaciones
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_importaciones (13 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_importaciones
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--seguridad-usuarios]
terminos: [matpel, gre, importaciones, version, estado, etapa, paginas, procesadas, intento, lease, token, hasta, heartbeat, errores, json, solicitada, creado, finalizada]
---

# matpel.gre_importaciones

Tabla matpel.gre_importaciones (13 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 13
- **UNIQUE:** `id, version_id`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `solicitada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| version_id | UNIQUEIDENTIFIER |
| estado | NVARCHAR(20) |
| etapa | NVARCHAR(80) |
| paginas_procesadas | INT |
| intento | INT |
| lease_token | UNIQUEIDENTIFIER |
| lease_hasta | DATETIMEOFFSET(3) |
| heartbeat_en | DATETIMEOFFSET(3) |
| errores_json | NVARCHAR(MAX) |
| solicitada_por | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| finalizada_en | DATETIMEOFFSET(3) |

## Donde se usa

Ningun servicio del backend la referencia hoy. Puede ser estructura
preparada para una fase siguiente, o codigo muerto: verificar antes de asumir.

## Archivos

- `database/migrations/094_gre_base_documental.sql`

## Relaciones

- `defined_in` → [[file--094-gre-base-documental|094_gre_base_documental.sql]]
- `belongs_to` → [[domain--matpel|matpel]]
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--gre-importacion|GreImportacion]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
