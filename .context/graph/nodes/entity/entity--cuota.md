---
id: entity--cuota
tipo: ENTITY
nombre: Cuota
nivel: L1
dominio: finanzas
resumen: Cuota institucional de un bombero para un periodo (seccion 7 del pedido). No todos los bomberos necesariamente pagan cuota -- la existencia de esta fila es siempre explicita, nunca implicita.
tabla: finanzas.cuotas
archivos:
  - backend/src/shared/entities/cuota.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-cuotas]
terminos: [cuota, cuotas, finanzas, estado, pendiente, pagada, parcial, anulada, exonerada]
---

# Cuota

Cuota institucional de un bombero para un periodo (seccion 7 del pedido). No todos los bomberos necesariamente pagan cuota -- la existencia de esta fila es siempre explicita, nunca implicita.

- **Tabla:** [[table--finanzas-cuotas|finanzas.cuotas]]
- **Columnas mapeadas:** 10

## Estados y enumeraciones

- `EstadoCuota`: `PENDIENTE` · `PAGADA` · `PARCIAL` · `ANULADA` · `EXONERADA`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** CuotasController
- **Servicios:** CuotasService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/cuota.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-cuotas|finanzas.cuotas]]

## Referenciado por

- [[service--finanzas-cuotas|CuotasService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
