---
id: table--personal-fojas-servicio
tipo: TABLE
nombre: personal.fojas_servicio
nivel: L2
dominio: personal
resumen: Tabla personal.fojas_servicio (8 columnas). Creada en 016_personal_expansion.sql.
tabla: fojas_servicio
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, fojas, servicio, bombero, anio, generado, contenido, json, archivo, pdf, url, docx]
---

# personal.fojas_servicio

Tabla personal.fojas_servicio (8 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 8

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| anio | INT |
| generado_en | DATETIMEOFFSET(3) |
| generado_por | UNIQUEIDENTIFIER |
| contenido_json | NVARCHAR(MAX) |
| archivo_pdf_url | NVARCHAR(MAX) |
| archivo_docx_url | NVARCHAR(MAX) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** FojaServicioController
- **Servicios:** FojaServicioService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--foja-servicio|FojaServicio]] `persisted_in` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
