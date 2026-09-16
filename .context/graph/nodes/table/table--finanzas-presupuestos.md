---
id: table--finanzas-presupuestos
tipo: TABLE
nombre: finanzas.presupuestos
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.presupuestos (9 columnas). Creada en 050_finanzas_bancos_presupuesto.sql.
tabla: presupuestos
archivos:
  - database/migrations/050_finanzas_bancos_presupuesto.sql
edges:
  - [defined_in, file--050-finanzas-bancos-presupuesto]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-ejercicios-fiscales]
  - [references, table--organizacion-parametros]
terminos: [finanzas, presupuestos, ejercicio, categoria, egreso, monto, presupuestado, observacion, creado, actualizado]
---

# finanzas.presupuestos

Tabla finanzas.presupuestos (9 columnas). Creada en 050_finanzas_bancos_presupuesto.sql.

- **Esquema:** finanzas · **Columnas:** 9
- **UNIQUE:** `ejercicio_id, categoria_egreso_id`

## Llaves foraneas

- `ejercicio_id` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `categoria_egreso_id` → [[table--organizacion-parametros|organizacion.parametros]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| ejercicio_id | UNIQUEIDENTIFIER |
| categoria_egreso_id | UNIQUEIDENTIFIER |
| monto_presupuestado | DECIMAL(15,2) |
| observacion | NVARCHAR(MAX) |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** PresupuestosController, ReportesFinanzasController
- **Servicios:** PresupuestosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/050_finanzas_bancos_presupuesto.sql`

## Relaciones

- `defined_in` → [[file--050-finanzas-bancos-presupuesto|050_finanzas_bancos_presupuesto.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]

## Referenciado por

- [[entity--presupuesto|Presupuesto]] `persisted_in` →
- [[service--finanzas-presupuestos|PresupuestosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
