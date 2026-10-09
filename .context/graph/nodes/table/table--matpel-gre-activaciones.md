---
id: table--matpel-gre-activaciones
tipo: TABLE
nombre: matpel.gre_activaciones
nivel: L2
dominio: matpel
resumen: Tabla matpel.gre_activaciones (6 columnas). Creada en 094_gre_base_documental.sql.
tabla: gre_activaciones
archivos:
  - database/migrations/094_gre_base_documental.sql
edges:
  - [defined_in, file--094-gre-base-documental]
  - [belongs_to, domain--matpel]
  - [references, table--matpel-gre-versiones]
  - [references, table--seguridad-usuarios]
terminos: [matpel, gre, activaciones, idioma, version, revision, activada, creado]
---

# matpel.gre_activaciones

Tabla matpel.gre_activaciones (6 columnas). Creada en 094_gre_base_documental.sql.

- **Esquema:** matpel · **Columnas:** 6
- **UNIQUE:** `id, version_id`, `idioma`

## Llaves foraneas

- `version_id` → [[table--matpel-gre-versiones|matpel.gre_versiones]]
- `activada_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| idioma | NVARCHAR(10) |
| version_id | UNIQUEIDENTIFIER |
| revision | INT |
| activada_por | UNIQUEIDENTIFIER |
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
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--gre-activacion|GreActivacion]] `persisted_in` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
