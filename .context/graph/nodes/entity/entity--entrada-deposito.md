---
id: entity--entrada-deposito
tipo: ENTITY
nombre: EntradaDeposito
nivel: L1
dominio: deposito
resumen: "Encabezado de una entrada de deposito (seccion 10-12 del pedido): compra, donacion, transferencia, devolucion, recuperacion u otro. `tipoEntradaId` reutiliza organizacion.parametros (tipo TIPO_MOVIMIENTO_DEPOSITO) -- no crea un catalogo paralelo. Registrar una entrada crea automaticamente los movimientos correspondientes (uno por item), nunca se factura aparte a mano."
tabla: deposito.entradas
archivos:
  - backend/src/shared/entities/entrada-deposito.entity.ts
edges:
  - [belongs_to, domain--deposito]
  - [persisted_in, table--deposito-entradas]
terminos: [entrada, deposito, entradas]
---

# EntradaDeposito

Encabezado de una entrada de deposito (seccion 10-12 del pedido): compra, donacion, transferencia, devolucion, recuperacion u otro. `tipoEntradaId` reutiliza organizacion.parametros (tipo TIPO_MOVIMIENTO_DEPOSITO) -- no crea un catalogo paralelo. Registrar una entrada crea automaticamente los movimientos correspondientes (uno por item), nunca se factura aparte a mano.

- **Tabla:** [[table--deposito-entradas|deposito.entradas]]
- **Columnas mapeadas:** 11

## Donde se usa

- **Pantallas:** `/dashboard/deposito`, `/dashboard/deposito/articulos`, `/dashboard/deposito/articulos/[id]`, `/dashboard/deposito/bajas`, `/dashboard/deposito/categorias`, `/dashboard/deposito/entradas`, `/dashboard/deposito/incidencias`, `/dashboard/deposito/inventarios-fisicos`, `/dashboard/deposito/inventarios-fisicos/[id]`, `/dashboard/deposito/mantenimientos`, `/dashboard/deposito/movimientos`, `/dashboard/deposito/prestamos`, `/dashboard/deposito/proveedores`, `/dashboard/deposito/ubicaciones`, `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`, `/dashboard/personal/[id]`
- **Endpoints:** EntradasController, IntegracionFinanzasController
- **Servicios:** EntradasService, IntegracionFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/entrada-deposito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--deposito|Depósito]]
- `persisted_in` → [[table--deposito-entradas|deposito.entradas]]

## Referenciado por

- [[service--deposito-entradas|EntradasService]] `uses` →
- [[service--finanzas-integracion-finanzas|IntegracionFinanzasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
