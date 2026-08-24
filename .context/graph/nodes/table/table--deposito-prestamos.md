---
id: table--deposito-prestamos
tipo: TABLE
nombre: deposito.prestamos
nivel: L2
dominio: deposito
resumen: Tabla deposito.prestamos (14 columnas). Creada en 044_deposito_prestamos.sql.
tabla: prestamos
archivos:
  - database/migrations/044_deposito_prestamos.sql
edges:
  - [defined_in, file--044-deposito-prestamos]
  - [belongs_to, domain--deposito]
  - [references, table--organizacion-parametros]
  - [references, table--personal-bomberos]
  - [references, table--servicios-servicios]
  - [references, table--personal-bomberos]
terminos: [deposito, prestamos, tipo, prestamo, solicitante, bombero, externo, servicio, destino, autorizado, fecha, entrega, devolucion, comprometida, real, estado, observaciones, institucion, creado]
---

# deposito.prestamos

Tabla deposito.prestamos (14 columnas). Creada en 044_deposito_prestamos.sql.

- **Esquema:** deposito · **Columnas:** 14

## Llaves foraneas

- `tipo_prestamo_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `solicitante_bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `servicio_destino_id` → [[table--servicios-servicios|servicios.servicios]]
- `autorizado_por` → [[table--personal-bomberos|personal.bomberos]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_prestamo_id | UNIQUEIDENTIFIER |
| solicitante_bombero_id | UNIQUEIDENTIFIER |
| solicitante_externo | NVARCHAR(300) |
| servicio_destino_id | UNIQUEIDENTIFIER |
| autorizado_por | UNIQUEIDENTIFIER |
| fecha_entrega | DATETIMEOFFSET(3) |
| fecha_devolucion_comprometida | DATETIMEOFFSET(3) |
| fecha_devolucion_real | DATETIMEOFFSET(3) |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/personal/[id]`
- **Endpoints:** ConsultasDepositoController, PrestamosController
- **Servicios:** ConsultasDepositoService, PrestamosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/044_deposito_prestamos.sql`

## Relaciones

- `defined_in` → [[file--044-deposito-prestamos|044_deposito_prestamos.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--servicios-servicios|servicios.servicios]]
- `references` → [[table--personal-bomberos|personal.bomberos]]

## Referenciado por

- [[table--deposito-prestamo-items|deposito.prestamo_items]] `references` →
- [[entity--prestamo-deposito|PrestamoDeposito]] `persisted_in` →
- [[service--deposito-consultas-deposito|ConsultasDepositoService]] `reads` →
- [[service--deposito-prestamos|PrestamosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
