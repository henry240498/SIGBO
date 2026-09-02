---
id: table--deposito-mantenimientos
tipo: TABLE
nombre: deposito.mantenimientos
nivel: L2
dominio: deposito
resumen: Tabla deposito.mantenimientos (20 columnas). Creada en 046_deposito_mantenimientos.sql.
tabla: mantenimientos
archivos:
  - database/migrations/046_deposito_mantenimientos.sql
edges:
  - [defined_in, file--046-deposito-mantenimientos]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-articulos]
  - [references, table--equipos-equipos]
  - [references, table--personal-bomberos]
  - [references, table--deposito-ubicaciones]
  - [references, table--deposito-movimientos]
  - [references, table--deposito-movimientos]
  - [references, table--seguridad-usuarios]
terminos: [deposito, mantenimientos, tipo, elemento, articulo, equipo, cantidad, motivo, responsable, taller, externo, fecha, ingreso, estimada, salida, real, costo, estado, observacion, ubicacion, origen, movimiento, institucion, creado]
---

# deposito.mantenimientos

Tabla deposito.mantenimientos (20 columnas). Creada en 046_deposito_mantenimientos.sql.

- **Esquema:** deposito · **Columnas:** 20

## Llaves foraneas

- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]
- `ubicacion_origen_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `movimiento_ingreso_id` → [[table--deposito-movimientos|deposito.movimientos]]
- `movimiento_salida_id` → [[table--deposito-movimientos|deposito.movimientos]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| articulo_id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| cantidad | DECIMAL(15,2) |
| motivo | NVARCHAR(300) |
| responsable_id | UNIQUEIDENTIFIER |
| taller_externo | NVARCHAR(200) |
| fecha_ingreso | DATE |
| fecha_estimada_salida | DATE |
| fecha_salida_real | DATE |
| costo | DECIMAL(15,2) |
| estado | NVARCHAR(20) |
| observacion | NVARCHAR(MAX) |
| ubicacion_origen_id | UNIQUEIDENTIFIER |
| movimiento_ingreso_id | UNIQUEIDENTIFIER |
| movimiento_salida_id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`
- **Endpoints:** MantenimientosController
- **Servicios:** MantenimientosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/046_deposito_mantenimientos.sql`

## Relaciones

- `defined_in` → [[file--046-deposito-mantenimientos|046_deposito_mantenimientos.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `references` → [[table--deposito-movimientos|deposito.movimientos]]
- `references` → [[table--deposito-movimientos|deposito.movimientos]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--mantenimiento-deposito|MantenimientoDeposito]] `persisted_in` →
- [[service--deposito-mantenimientos|MantenimientosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
