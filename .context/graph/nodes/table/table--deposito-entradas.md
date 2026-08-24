---
id: table--deposito-entradas
tipo: TABLE
nombre: deposito.entradas
nivel: L2
dominio: deposito
resumen: Tabla deposito.entradas (13 columnas). Creada en 042_deposito_entradas.sql.
tabla: entradas
archivos:
  - database/migrations/042_deposito_entradas.sql
edges:
  - [defined_in, file--042-deposito-entradas]
  - [belongs_to, domain--deposito]
  - [references, table--organizacion-parametros]
  - [references, table--deposito-proveedores]
  - [references, table--deposito-ubicaciones]
  - [references, table--seguridad-usuarios]
terminos: [deposito, entradas, tipo, entrada, fecha, proveedor, donante, nombre, documento, numero, valor, total, ubicacion, destino, observacion, institucion, creado]
---

# deposito.entradas

Tabla deposito.entradas (13 columnas). Creada en 042_deposito_entradas.sql.

- **Esquema:** deposito · **Columnas:** 13

## Llaves foraneas

- `tipo_entrada_id` → [[table--organizacion-parametros|organizacion.parametros]]
- `proveedor_id` → [[table--deposito-proveedores|deposito.proveedores]]
- `ubicacion_destino_id` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `creado_por` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| tipo_entrada_id | UNIQUEIDENTIFIER |
| fecha | DATE |
| proveedor_id | UNIQUEIDENTIFIER |
| donante_nombre | NVARCHAR(200) |
| donante_documento | NVARCHAR(30) |
| numero_documento | NVARCHAR(100) |
| valor_total | DECIMAL(15,2) |
| ubicacion_destino_id | UNIQUEIDENTIFIER |
| observacion | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/personal/[id]`
- **Endpoints:** EntradasController, IntegracionFinanzasController
- **Servicios:** EntradasService, IntegracionFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/042_deposito_entradas.sql`

## Relaciones

- `defined_in` → [[file--042-deposito-entradas|042_deposito_entradas.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]
- `references` → [[table--organizacion-parametros|organizacion.parametros]]
- `references` → [[table--deposito-proveedores|deposito.proveedores]]
- `references` → [[table--deposito-ubicaciones|deposito.ubicaciones]]
- `references` → [[table--seguridad-usuarios|seguridad.usuarios]]

## Referenciado por

- [[table--deposito-entrada-items|deposito.entrada_items]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[entity--entrada-deposito|EntradaDeposito]] `persisted_in` →
- [[service--deposito-entradas|EntradasService]] `reads` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
