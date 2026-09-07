---
id: table--deposito-bajas
tipo: TABLE
nombre: deposito.bajas
nivel: L2
dominio: deposito
resumen: Tabla deposito.bajas (15 columnas). Creada en 043_deposito_bajas.sql.
tabla: bajas
archivos:
  - database/migrations/043_deposito_bajas.sql
edges:
  - [defined_in, file--043-deposito-bajas]
  - [belongs_to, domain--deposito]
  - [references, table--deposito-articulos]
  - [references, table--equipos-equipos]
  - [references, table--organizacion-parametros]
  - [references, table--personal-bomberos]
  - [references, table--personal-bomberos]
  - [references, table--deposito-movimientos]
terminos: [deposito, bajas, tipo, elemento, articulo, equipo, cantidad, motivo, baja, fecha, responsable, autorizado, documento, url, observacion, movimiento, institucion, creado]
---

# deposito.bajas

Tabla deposito.bajas (15 columnas). Creada en 043_deposito_bajas.sql.

- **Esquema:** deposito · **Columnas:** 15

## Llaves foraneas

- `articulo_id` → [[table--deposito-articulos|deposito.articulos]]
- `equipo_id` → [[table--equipos-equipos|equipos.equipos]]
- `motivo_baja_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `responsable_id` → [[table--personal-bomberos|personal.bomberos]]
- `autorizado_por` → [[table--personal-bomberos|personal.bomberos]]
- `movimiento_id` → [[table--deposito-movimientos|deposito.movimientos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_elemento | NVARCHAR(10) |
| articulo_id | UNIQUEIDENTIFIER |
| equipo_id | UNIQUEIDENTIFIER |
| cantidad | DECIMAL(15,2) |
| motivo_baja_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| responsable_id | UNIQUEIDENTIFIER |
| autorizado_por | UNIQUEIDENTIFIER |
| documento_url | NVARCHAR(MAX) |
| observacion | NVARCHAR(MAX) |
| movimiento_id | UNIQUEIDENTIFIER |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** BajasController
- **Servicios:** BajasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/043_deposito_bajas.sql`

## Relaciones

- `defined_in` → [[file--043-deposito-bajas|043_deposito_bajas.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--deposito-articulos|deposito.articulos]]
- `references` → [[table--equipos-equipos|equipos.equipos]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--deposito-movimientos|deposito.movimientos]]

## Referenciado por

- [[entity--baja-deposito|BajaDeposito]] `persisted_in` →
- [[service--deposito-bajas|BajasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
