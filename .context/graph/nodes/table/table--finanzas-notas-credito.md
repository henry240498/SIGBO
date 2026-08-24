---
id: table--finanzas-notas-credito
tipo: TABLE
nombre: finanzas.notas_credito
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.notas_credito (12 columnas). Creada en 065_finanzas_facturacion.sql.
tabla: notas_credito
archivos:
  - database/migrations/065_finanzas_facturacion.sql
edges:
  - [defined_in, file--065-finanzas-facturacion]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-facturas]
  - [references, table--organizacion-parametros]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, notas, credito, factura, numero, fecha, motivo, concepto, importe, archivo, url, estado, institucion, creado]
---

# finanzas.notas_credito

Tabla finanzas.notas_credito (12 columnas). Creada en 065_finanzas_facturacion.sql.

- **Esquema:** finanzas · **Columnas:** 12

## Llaves foraneas

- `factura_id` → [[table--finanzas-facturas|finanzas.facturas]]
- `motivo_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| factura_id | UNIQUEIDENTIFIER |
| numero | NVARCHAR(50) |
| fecha | DATE |
| motivo_id | UNIQUEIDENTIFIER |
| concepto | NVARCHAR(300) |
| importe | DECIMAL(15,2) |
| archivo_url | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** DashboardFinanzasController, NotasCreditoController
- **Servicios:** DashboardFinanzasService, NotasCreditoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/065_finanzas_facturacion.sql`

## Relaciones

- `defined_in` → [[file--065-finanzas-facturacion|065_finanzas_facturacion.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-facturas|finanzas.facturas]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[entity--nota-credito|NotaCredito]] `persisted_in` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
