---
id: entity--documento-respaldo
tipo: ENTITY
nombre: DocumentoRespaldo
nivel: L1
dominio: finanzas
resumen: "Documento respaldatorio de un movimiento u orden de pago (seccion 10 del pedido): factura/recibo/comprobante con relacion documental real, nunca solo el nombre del archivo suelto."
tabla: finanzas.documentos_respaldo
archivos:
  - backend/src/shared/entities/documento-respaldo.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-documentos-respaldo]
terminos: [documento, respaldo, documentos, finanzas]
---

# DocumentoRespaldo

Documento respaldatorio de un movimiento u orden de pago (seccion 10 del pedido): factura/recibo/comprobante con relacion documental real, nunca solo el nombre del archivo suelto.

- **Tabla:** [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]]
- **Columnas mapeadas:** 11

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** MovimientosFinancierosController, ReportesFinanzasController
- **Servicios:** MovimientosFinancierosService, ReportesFinanzasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/documento-respaldo.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-documentos-respaldo|finanzas.documentos_respaldo]]

## Referenciado por

- [[service--finanzas-movimientos-financieros|MovimientosFinancierosService]] `uses` →
- [[service--finanzas-reportes-finanzas|ReportesFinanzasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
