---
id: table--servicios-pruebas-comunicacion
tipo: TABLE
nombre: servicios.pruebas_comunicacion
nivel: L2
dominio: servicios
resumen: Tabla servicios.pruebas_comunicacion (10 columnas). Creada en 071_servicios_seguimiento_geografico.sql.
tabla: pruebas_comunicacion
archivos:
  - database/migrations/071_servicios_seguimiento_geografico.sql
edges:
  - [defined_in, file--071-servicios-seguimiento-geografico]
  - [belongs_to, domain--servicios]
  - [references, table--servicios-servicios]
  - [references, table--vehiculos-vehiculos]
  - [references, table--seguridad-usuarios]
terminos: [servicios, pruebas, comunicacion, servicio, movil, latitud, longitud, distancia, metros, nivel, observacion, creado]
---

# servicios.pruebas_comunicacion

Tabla servicios.pruebas_comunicacion (10 columnas). Creada en 071_servicios_seguimiento_geografico.sql.

- **Esquema:** servicios · **Columnas:** 10

## Restricciones CHECK (reglas que la BD impone)

- `nivel BETWEEN 1 AND 5`

## Llaves foraneas

- `servicio_id` → [[table--servicios-servicios|servicios.servicios]]
- `movil_id` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| servicio_id | UNIQUEIDENTIFIER |
| movil_id | UNIQUEIDENTIFIER |
| latitud | DECIMAL(10,8) |
| longitud | DECIMAL(11,8) |
| distancia_metros | DECIMAL(10,2) |
| nivel | TINYINT |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

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
- `references` → [[table--vehiculos-vehiculos|vehiculos.vehiculos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--prueba-comunicacion-servicio|PruebaComunicacionServicio]] `persisted_in` →
- [[service--servicios-seguimiento-geografico|SeguimientoGeograficoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
