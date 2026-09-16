---
id: table--servicios-alertas-emergencia
tipo: TABLE
nombre: servicios.alertas_emergencia
nivel: L2
dominio: servicios
resumen: Tabla servicios.alertas_emergencia (15 columnas). Creada en 076_alertas_emergencia.sql.
tabla: alertas_emergencia
archivos:
  - database/migrations/076_alertas_emergencia.sql
edges:
  - [defined_in, file--076-alertas-emergencia]
  - [belongs_to, domain--servicios]
terminos: [servicios, alertas, emergencia, tipo, estado, solicitante, nombre, detalle, latitud, longitud, clave, idempotencia, atendida, motivo, creado, actualizado]
---

# servicios.alertas_emergencia

Tabla servicios.alertas_emergencia (15 columnas). Creada en 076_alertas_emergencia.sql.

- **Esquema:** servicios · **Columnas:** 15

## Restricciones CHECK (reglas que la BD impone)

- `tipo IN ('SOLICITUD_APOYO', 'SOLICITUD_CHOFER')`
- `estado IN ('PENDIENTE', 'ATENDIDA', 'CANCELADA')`

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo | NVARCHAR(20) |
| estado | NVARCHAR(20) |
| solicitanteId | UNIQUEIDENTIFIER |
| solicitanteNombre | NVARCHAR(200) |
| detalle | NVARCHAR(500) |
| latitud | FLOAT |
| longitud | FLOAT |
| claveIdempotencia | NVARCHAR(64) |
| atendidaPor | UNIQUEIDENTIFIER |
| atendidaPorNombre | NVARCHAR(200) |
| atendidaEn | DATETIMEOFFSET(3) |
| motivoEstado | NVARCHAR(500) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** — (sin pantalla que llegue hasta aca)
- **Endpoints:** AlertasController
- **Servicios:** AlertasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/076_alertas_emergencia.sql`

## Relaciones

- `defined_in` → [[file--076-alertas-emergencia|076_alertas_emergencia.sql]]
- `belongs_to` → [[domain--servicios|Servicios]]

## Referenciado por

- [[entity--alerta-emergencia|AlertaEmergencia]] `persisted_in` →
- [[service--alertas-alertas|AlertasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
