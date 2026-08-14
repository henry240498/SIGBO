---
id: table--personal-seguros-bombero
tipo: TABLE
nombre: personal.seguros_bombero
nivel: L2
dominio: personal
resumen: Tabla personal.seguros_bombero (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql.
tabla: seguros_bombero
archivos:
  - database/migrations/018_parametros_y_normalizacion_personal.sql
edges:
  - [defined_in, file--018-parametros-y-normalizacion-personal]
  - [belongs_to, domain--personal]
  - [references, table--personal-bomberos]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
terminos: [personal, seguros, bombero, aseguradora, tipo, seguro, descripcion, numero, poliza, fecha, inicio, vencimiento, estado, observaciones, documentacion, url, creado, actualizado]
---

# personal.seguros_bombero

Tabla personal.seguros_bombero (14 columnas). Creada en 018_parametros_y_normalizacion_personal.sql.

- **Esquema:** personal · **Columnas:** 14

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `aseguradora_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `tipo_seguro_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| aseguradora_id | UNIQUEIDENTIFIER |
| tipo_seguro_id | UNIQUEIDENTIFIER |
| descripcion | NVARCHAR(MAX) |
| numero_poliza | NVARCHAR(100) |
| fecha_inicio | DATE |
| fecha_vencimiento | DATE |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| documentacion_url | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** SegurosBomberoController
- **Servicios:** SegurosBomberoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/018_parametros_y_normalizacion_personal.sql`

## Relaciones

- `defined_in` → [[file--018-parametros-y-normalizacion-personal|018_parametros_y_normalizacion_personal.sql]]
- `belongs_to` → [[domain--personal|Personal]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[entity--seguro-bombero|SeguroBombero]] `persisted_in` →
- [[service--personal-seguros-bombero|SegurosBomberoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
