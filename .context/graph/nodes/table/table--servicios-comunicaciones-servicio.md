---
id: table--servicios-comunicaciones-servicio
tipo: TABLE
nombre: servicios.comunicaciones_servicio
nivel: L2
dominio: servicios
resumen: Tabla servicios.comunicaciones_servicio (12 columnas). Creada en 017_comunicaciones_servicio.sql.
tabla: comunicaciones_servicio
archivos:
  - database/migrations/017_comunicaciones_servicio.sql
edges:
  - [defined_in, file--017-comunicaciones-servicio]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
terminos: [servicios, comunicaciones, servicio, tipo, estado, datos, version, actualizado, finalizado, motivo, creado]
---

# servicios.comunicaciones_servicio

Tabla servicios.comunicaciones_servicio (12 columnas). Creada en 017_comunicaciones_servicio.sql.

- **Esquema:** servicios · **Columnas:** 12
- **UNIQUE:** `servicio_id`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(30) |
| estado | NVARCHAR(30) |
| datos | NVARCHAR(MAX) |
| version | INT |
| actualizado_por | UNIQUEIDENTIFIER |
| finalizado_por | UNIQUEIDENTIFIER |
| finalizado_en | DATETIMEOFFSET(3) |
| motivo_estado | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/denuncias`, `/dashboard/denuncias/[id]`, `/dashboard/servicios`, `/dashboard/servicios/nuevo`
- **Endpoints:** DenunciasController, DenunciasPublicasController, ServiciosController
- **Servicios:** DenunciasService, ServiciosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/017_comunicaciones_servicio.sql`

## Relaciones

- `defined_in` → [[file--017-comunicaciones-servicio|017_comunicaciones_servicio.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]

## Referenciado por

- [[entity--comunicacion-servicio|ComunicacionServicio]] `persisted_in` →
- [[service--denuncias-denuncias|DenunciasService]] `reads` →
- [[service--servicios-servicios|ServiciosService]] `reads` →
- [[decision--comunicacion-como-json|La comunicacion de servicio se guarda como documento JSON validado]] `constrains` →
- [[rule--una-comunicacion-por-servicio|Un servicio tiene como maximo una comunicacion, y borrar el servicio la borra]] `affects` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
