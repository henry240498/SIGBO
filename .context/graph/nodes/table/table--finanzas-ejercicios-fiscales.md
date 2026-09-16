---
id: table--finanzas-ejercicios-fiscales
tipo: TABLE
nombre: finanzas.ejercicios_fiscales
nivel: L2
dominio: finanzas
resumen: Tabla finanzas.ejercicios_fiscales (8 columnas). Creada en 048_finanzas_estructura.sql.
tabla: ejercicios_fiscales
archivos:
  - database/migrations/048_finanzas_estructura.sql
edges:
  - [defined_in, file--048-finanzas-estructura]
  - [belongs_to, domain--finanzas]
  - [references, table--seguridad-usuarios]
terminos: [finanzas, ejercicios, fiscales, anio, fecha, inicio, fin, estado, institucion, creado]
---

# finanzas.ejercicios_fiscales

Tabla finanzas.ejercicios_fiscales (8 columnas). Creada en 048_finanzas_estructura.sql.

- **Esquema:** finanzas · **Columnas:** 8
- **UNIQUE:** `anio`

## Llaves foraneas

- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| anio | INT |
| fecha_inicio | DATE |
| fecha_fin | DATE |
| estado | NVARCHAR(20) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** EjerciciosFiscalesController
- **Servicios:** EjerciciosFiscalesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/048_finanzas_estructura.sql`

## Relaciones

- `defined_in` → [[file--048-finanzas-estructura|048_finanzas_estructura.sql]]
- `belongs_to` → [[domain--finanzas|Finanzas]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-presupuestos|finanzas.presupuestos]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[entity--ejercicio-fiscal|EjercicioFiscal]] `persisted_in` →
- [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
