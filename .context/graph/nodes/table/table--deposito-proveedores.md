---
id: table--deposito-proveedores
tipo: TABLE
nombre: deposito.proveedores
nivel: L2
dominio: deposito
resumen: Tabla deposito.proveedores (15 columnas). Creada en 042_deposito_entradas.sql.
tabla: proveedores
archivos:
  - database/migrations/042_deposito_entradas.sql
edges:
  - [defined_in, file--042-deposito-entradas]
  - [belongs_to, domain--deposito]
terminos: [deposito, proveedores, razon, social, nombre, comercial, ruc, direccion, telefono, email, contacto, estado, observaciones, institucion, creado, actualizado]
---

# deposito.proveedores

Tabla deposito.proveedores (15 columnas). Creada en 042_deposito_entradas.sql.

- **Esquema:** deposito · **Columnas:** 15

## Columnas

| Columna | Tipo |
|---|---|
| id | UNIQUEIDENTIFIER |
| razon_social | NVARCHAR(200) |
| nombre_comercial | NVARCHAR(200) |
| ruc | NVARCHAR(30) |
| direccion | NVARCHAR(300) |
| telefono | NVARCHAR(50) |
| email | NVARCHAR(255) |
| contacto | NVARCHAR(150) |
| estado | NVARCHAR(20) |
| observaciones | NVARCHAR(MAX) |
| institucion_id | UNIQUEIDENTIFIER |
| creado_en | DATETIMEOFFSET(3) |
| actualizado_en | DATETIMEOFFSET(3) |
| creado_por | UNIQUEIDENTIFIER |
| actualizado_por | UNIQUEIDENTIFIER |

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** EntradasController, ProveedoresController, ReportesFinanzasController
- **Servicios:** EntradasService, ProveedoresService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `database/migrations/042_deposito_entradas.sql`

## Relaciones

- `defined_in` → [[file--042-deposito-entradas|042_deposito_entradas.sql]]
- `belongs_to` → [[domain--deposito|Depósito]]

## Referenciado por

- [[table--deposito-entradas|deposito.entradas]] `references` →
- [[table--finanzas-movimientos-financieros|finanzas.movimientos_financieros]] `references` →
- [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]] `references` →
- [[table--finanzas-ordenes-pago|finanzas.ordenes_pago]] `references` →
- [[entity--proveedor-deposito|ProveedorDeposito]] `persisted_in` →
- [[service--deposito-entradas|EntradasService]] `reads` →
- [[service--deposito-proveedores|ProveedoresService]] `reads` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `reads` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
