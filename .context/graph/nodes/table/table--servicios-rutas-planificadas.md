---
id: table--servicios-rutas-planificadas
tipo: TABLE
nombre: servicios.rutas_planificadas
nivel: L2
dominio: servicios
resumen: Tabla servicios.rutas_planificadas (7 columnas). Creada en 071_servicios_seguimiento_geografico.sql.
tabla: rutas_planificadas
archivos:
  - database/migrations/071_servicios_seguimiento_geografico.sql
edges:
  - [defined_in, file--071-servicios-seguimiento-geografico]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [servicios, rutas, planificadas, servicio, puntos, creado, actualizado]
---

# servicios.rutas_planificadas

Tabla servicios.rutas_planificadas (7 columnas). Creada en 071_servicios_seguimiento_geografico.sql.

- **Esquema:** servicios · **Columnas:** 7
- **UNIQUE:** `servicio_id`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `actualizado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| puntos | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_en | DATETIMEOFFSET(3) |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** SeguimientoGeograficoController
- **Servicios:** SeguimientoGeograficoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/071_servicios_seguimiento_geografico.sql`

## Relaciones

- `defined_in` → [[file--071-servicios-seguimiento-geografico|071_servicios_seguimiento_geografico.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--ruta-planificada-servicio|RutaPlanificadaServicio]] `persisted_in` →
- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
