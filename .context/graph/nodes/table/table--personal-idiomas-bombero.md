---
id: table--personal-idiomas-bombero
tipo: TABLE
nombre: personal.idiomas_bombero
nivel: L2
dominio: personal
resumen: Tabla personal.idiomas_bombero (7 columnas). Creada en 016_personal_expansion.sql, modificada por 018_parametros_y_normalizacion_personal.sql.
tabla: idiomas_bombero
archivos:
  - database/migrations/016_personal_expansion.sql
  - database/migrations/018_parametros_y_normalizacion_personal.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, idiomas, bombero, nivel, certificacion, creado, idioma]
---

# personal.idiomas_bombero

Tabla personal.idiomas_bombero (7 columnas). Creada en 016_personal_expansion.sql, modificada por 018_parametros_y_normalizacion_personal.sql.

- **Esquema:** personal · **Columnas:** 7

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| nivel | NVARCHAR(30) |
| certificacion | NVARCHAR(150) |
| creado_en | DATETIMEOFFSET(3) |
| idioma_id | UNIQUEIDENTIFIER |
| nivel_idioma_id | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** FojaServicioController, IdiomasController
- **Servicios:** FojaServicioService, IdiomasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/016_personal_expansion.sql`
- `database/migrations/018_parametros_y_normalizacion_personal.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--idioma-bombero|IdiomaBombero]] `persisted_in` →
- [[service--personal-foja-servicio|FojaServicioService]] `reads` →
- [[service--personal-idiomas|IdiomasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
