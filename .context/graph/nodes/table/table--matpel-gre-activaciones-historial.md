---
id: table--matpel-gre-activaciones-historial
tipo: TABLE
nombre: matpel.gre_activaciones_historial
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_activaciones_historial (9 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_activaciones_historial
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--matpel-gre-versiones]
  - [references, table--seguridad-usuarios]
terminos: [matpel, gre, activaciones, historial, idioma, version, anterior, revision, clave, idempotencia, activada, fundamento, creado]
---

# matpel.gre_activaciones_historial

Tabla matpel.gre_activaciones_historial (9 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 9
- **UNIQUE:** `id, version_id`, `idioma, revision`, `clave_idempotencia`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `version_anterior_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `activada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| idioma | NVARCHAR(10) |
| version_id | UNIQUEIDENTIFIER |
| version_anterior_id | UNIQUEIDENTIFIER |
| revision | INT |
| clave_idempotencia | UNIQUEIDENTIFIER |
| activada_por | UNIQUEIDENTIFIER |
| fundamento | NVARCHAR(MAX) |
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
- `references` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--gre-activacion-historial|GreActivacionHistorial]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
