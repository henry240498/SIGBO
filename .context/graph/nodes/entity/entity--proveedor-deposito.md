---
id: entity--proveedor-deposito
tipo: ENTITY
nombre: ProveedorDeposito
nivel: L1
dominio: deposito
resumen: "Catalogo de proveedores, compartido entre Deposito y (a futuro) Finanzas -- se registra aca primero porque Deposito lo necesita antes; Finanzas debe reutilizarlo, nunca duplicarlo."
tabla: deposito.proveedores
archivos:
  - backend/src/shared/entities/proveedor-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-proveedores]
terminos: [proveedor, deposito, proveedores, estado, activo, inactivo]
---

# ProveedorDeposito

Catalogo de proveedores, compartido entre Deposito y (a futuro) Finanzas -- se registra aca primero porque Deposito lo necesita antes; Finanzas debe reutilizarlo, nunca duplicarlo.

- **Tabla:** [[table--deposito-proveedores|deposito.proveedores]]
- **Columnas mapeadas:** 12

## Estados y enumeraciones

- `EstadoProveedorDeposito`: `ACTIVO` · `INACTIVO`

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/personal/[id]`
- **Endpoints:** EntradasController, ProveedoresController, ReportesFinanzasController
- **Servicios:** EntradasService, ProveedoresService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/proveedor-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-proveedores|deposito.proveedores]]

## Referenciado por

- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--deposito-proveedores|ProveedoresService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
