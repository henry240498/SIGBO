---
id: table--servicios-historial-servicios
tipo: TABLE
nombre: servicios.historial_servicios
nivel: L2
dominio: servicios
resumen: Tabla servicios.historial_servicios (12 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql, 071_servicios_seguimiento_geografico.sql.
tabla: historial_servicios
archivos:
  - database/migrations/007_servicios.sql
  - database/migrations/009_foreign_keys.sql
  - database/migrations/071_servicios_seguimiento_geografico.sql
edges:
  - [defined_in, file--007-servicios]
  - [belongs_to, domain--servicios]
terminos: [servicios, historial, servicio, timestamp, evento, tipo, latitud, longitud, velocidad, kmh, direccion, datos, creado, movil, observacion]
---

# servicios.historial_servicios

Tabla servicios.historial_servicios (12 columnas). Creada en 007_servicios.sql, modificada por 009_foreign_keys.sql, 071_servicios_seguimiento_geografico.sql.

- **Esquema:** servicios · **Columnas:** 12

## Restricciones CHECK (reglas que la BD impone)

- `tipo_evento IN ( N'SALIDA_CUARTEL', N'LLEGADA_SERVICIO', N'SALIDA_SERVICIO', N'LLEGADA_CENTRO_SALUD', N'SALIDA_CENTRO_SALUD', N'REGRESO_CUARTEL', N'FIN_SERVICIO', N'PUNTO_CONTROL', N'GPS', N'INCIDENTE', N'OBSERVACION', N'OTRO' )`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| timestamp_evento | DATETIMEOFFSET(3) |
| tipo_evento | NVARCHAR(30) |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| velocidad_kmh | DECIMAL(5,2) |
| direccion | NVARCHAR(MAX) |
| datos | NVARCHAR(MAX) |
| creado_por | UNIQUEIDENTIFIER |
| movil_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** SeguimientoGeograficoController
- **Servicios:** SeguimientoGeograficoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/007_servicios.sql`
- `database/migrations/009_foreign_keys.sql`
- `database/migrations/071_servicios_seguimiento_geografico.sql`

## Relaciones

- `defined_in` → [[file--007-servicios|007_servicios.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[entity--historial-servicio|HistorialServicio]] `persisted_in` →
- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
