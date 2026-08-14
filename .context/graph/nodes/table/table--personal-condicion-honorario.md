---
id: table--personal-condicion-honorario
tipo: TABLE
nombre: personal.condicion_honorario
nivel: L2
dominio: personal
resumen: Tabla personal.condicion_honorario (8 columnas). Creada en 016_personal_expansion.sql.
tabla: condicion_honorario
archivos:
  - database/migrations/016_personal_expansion.sql
edges:
  - [defined_in, file--016-personal-expansion]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
terminos: [personal, condicion, honorario, bombero, fecha, nombramiento, motivo, resolucion, documento, url, observaciones, actualizado]
---

# personal.condicion_honorario

Tabla personal.condicion_honorario (8 columnas). Creada en 016_personal_expansion.sql.

- **Esquema:** personal · **Columnas:** 8
- **UNIQUE:** `bombero_id`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| fecha_nombramiento | DATE |
| motivo | NVARCHAR(MAX) |
| resolucion | NVARCHAR(100) |
| documento_url | NVARCHAR(MAX) |
| observaciones | NVARCHAR(MAX) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** CondicionController
- **Servicios:** CondicionService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/016_personal_expansion.sql`

## Relaciones

- `defined_in` → [[file--016-personal-expansion|016_personal_expansion.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[entity--condicion-honorario|CondicionHonorario]] `persisted_in` →
- [[service--personal-condicion|CondicionService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
