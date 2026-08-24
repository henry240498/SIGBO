---
id: table--finanzas-acuerdos-aporte
tipo: TABLE
nombre: finanzas.acuerdos_aporte
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.acuerdos_aporte (15 columnas). Creada en 063_finanzas_acuerdos_aportes.sql.
tabla: acuerdos_aporte
archivos:
  - database/migrations/063_finanzas_acuerdos_aportes.sql
edges:
  - [defined_in, file--063-finanzas-acuerdos-aportes]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-socios-protectores]
  - [references, table--organizacion-parametros]
  - [references, table--organizacion-parametros]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, acuerdos, aporte, socio, protector, monto, acordado, moneda, periodicidad, fecha, inicio, fin, estado, medio, pago, preferido, observaciones, institucion, creado, actualizado]
---

# finanzas.acuerdos_aporte

Tabla finanzas.acuerdos_aporte (15 columnas). Creada en 063_finanzas_acuerdos_aportes.sql.

- **Esquema:** finanzas · **Columnas:** 15

## Llaves foraneas

- `socio_protector_id` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `periodicidad_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `medio_pago_preferido_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| socio_protector_id | UNIQUEIDENTIFIER |
| monto_acordado | DECIMAL(15,2) |
| moneda | NVARCHAR(3) |
| periodicidad_id | UNIQUEIDENTIFIER |
| fecha_inicio | DATE |
| fecha_fin | DATE |
| estado | NVARCHAR(20) |
| medio_pago_preferido_id | UNIQUEIDENTIFIER |
| observaciones | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** AcuerdosAporteController, AportesController, DashboardFinanzasController, SociosProtectoresController
- **Servicios:** AcuerdosAporteService, AportesService, DashboardFinanzasService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/063_finanzas_acuerdos_aportes.sql`

## Relaciones

- `defined_in` → [[file--063-finanzas-acuerdos-aportes|063_finanzas_acuerdos_aportes.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-socios-protectores|finanzas.socios_protectores]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-aportes|finanzas.aportes]] `references` →
- [[entity--acuerdo-aporte|AcuerdoAporte]] `persisted_in` →
- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `reads` →
- [[service--finanzas-aportes|AportesService]] `reads` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `reads` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
