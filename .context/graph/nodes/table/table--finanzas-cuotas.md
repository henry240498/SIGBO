---
id: table--finanzas-cuotas
tipo: TABLE
nombre: finanzas.cuotas
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.cuotas (12 columnas). Creada en 049_finanzas_movimientos.sql.
tabla: cuotas
archivos:
  - database/migrations/049_finanzas_movimientos.sql
edges:
  - [defined_in, file--049-finanzas-movimientos]
  - [belongs_to, domain--finanzas]
  - [references, table--personal-bomberos]
  - [references, table--finanzas-movimientos-financieros]
terminos: [finanzas, cuotas, bombero, periodo, importe, pagado, estado, fecha, vencimiento, movimiento, observacion, institucion, creado]
---

# finanzas.cuotas

Tabla finanzas.cuotas (12 columnas). Creada en 049_finanzas_movimientos.sql.

- **Esquema:** finanzas · **Columnas:** 12
- **UNIQUE:** `bombero_id, periodo`

## Llaves foraneas

- `bombero_id` → [[table--personal-bomberos|personal.bomberos]]
- `movimiento_id` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| bombero_id | UNIQUEIDENTIFIER |
| periodo | CHAR(7) |
| importe | DECIMAL(15,2) |
| importe_pagado | DECIMAL(15,2) |
| estado | NVARCHAR(20) |
| fecha_vencimiento | DATE |
| movimiento_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** CuotasController
- **Servicios:** CuotasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/049_finanzas_movimientos.sql`

## Relaciones

- `defined_in` → [[file--049-finanzas-movimientos|049_finanzas_movimientos.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--personal-bomberos|personal.bomberos]]
- `references` → [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]]

## Referenciado por

- [[entity--cuota|Cuota]] `persisted_in` →
- [[service--finanzas-cuotas|CuotasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
