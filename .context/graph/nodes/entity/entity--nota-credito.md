---
id: entity--nota-credito
tipo: ENTITY
nombre: NotaCredito
nivel: L1
dominio: finanzas
resumen: "Correccion NO destructiva de una Factura (seccion 17 del pedido): nunca se elimina ni modifica la factura original, se emite esta fila adicional enlazada por facturaId -- la trazabilidad completa queda en ambas tablas."
tabla: finanzas.notas_credito
archivos:
  - backend/src/shared/entities/nota-credito.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-notas-credito]
terminos: [nota, credito, notas, finanzas, estado, emitida, anulada]
---

# NotaCredito

Correccion NO destructiva de una Factura (seccion 17 del pedido): nunca se elimina ni modifica la factura original, se emite esta fila adicional enlazada por facturaId -- la trazabilidad completa queda en ambas tablas.

- **Tabla:** [[table--finanzas-notas-credito|finanzas.notas_credito]]
- **Columnas mapeadas:** 10

## Estados y enumeraciones

- `EstadoNotaCredito`: `EMITIDA` · `ANULADA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** DashboardFinanzasController, NotasCreditoController
- **Servicios:** DashboardFinanzasService, NotasCreditoService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/nota-credito.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-notas-credito|finanzas.notas_credito]]

## Referenciado por

- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-notas-credito|NotasCreditoService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
