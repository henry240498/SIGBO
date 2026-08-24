---
id: table--finanzas-turnos-caja
tipo: TABLE
nombre: finanzas.turnos_caja
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.turnos_caja (13 columnas). Creada en 048_finanzas_estructura.sql.
tabla: turnos_caja
archivos:
  - database/migrations/048_finanzas_estructura.sql
edges:
  - [defined_in, file--048-finanzas-estructura]
  - [belongs_to, domain--finanzas]
  - [references, table--finanzas-cajas]
  - [references, table--seguridad-usuarios]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, turnos, caja, fecha, apertura, usuario, saldo, inicial, cierre, teorico, fisico, diferencia, observacion, estado, creado]
---

# finanzas.turnos_caja

Tabla finanzas.turnos_caja (13 columnas). Creada en 048_finanzas_estructura.sql.

- **Esquema:** finanzas · **Columnas:** 13

## Llaves foraneas

- `caja_id` → [[table--finanzas-cajas|finanzas.cajas]]
- `usuario_apertura` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `usuario_cierre` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| caja_id | UNIQUEIDENTIFIER |
| fecha_apertura | DATETIMEOFFSET(3) |
| usuario_apertura | UNIQUEIDENTIFIER |
| saldo_inicial | DECIMAL(15,2) |
| fecha_cierre | DATETIMEOFFSET(3) |
| usuario_cierre | UNIQUEIDENTIFIER |
| saldo_teorico | DECIMAL(15,2) |
| saldo_fisico | DECIMAL(15,2) |
| diferencia | DECIMAL(15,2) |
| observacion_cierre | NVARCHAR(MAX) |
| estado | NVARCHAR(20) |
| creado_en | DATETIMEOFFSET(3) |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** CajasController, MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** CajasService, MovimientosFinancierosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/048_finanzas_estructura.sql`

## Relaciones

- `defined_in` → [[file--048-finanzas-estructura|048_finanzas_estructura.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--finanzas-cajas|finanzas.cajas]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[entity--turno-caja|TurnoCaja]] `persisted_in` →
- [[service--finanzas-cajas|CajasService]] `reads` →
- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
