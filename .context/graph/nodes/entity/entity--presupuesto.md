---
id: entity--presupuesto
tipo: ENTITY
nombre: Presupuesto
nivel: L1
dominio: finanzas
resumen: "Presupuesto de una categoria de egreso para un ejercicio (seccion 14 del pedido). El \"ejecutado\" y el \"disponible\" NUNCA se guardan aca -- se calculan en tiempo real sumando finanzas.movimientos_financieros (ver PresupuestosService), para que nunca queden desincronizados."
tabla: finanzas.presupuestos
archivos:
  - backend/src/shared/entities/presupuesto.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-presupuestos]
terminos: [presupuesto, presupuestos, finanzas]
---

# Presupuesto

Presupuesto de una categoria de egreso para un ejercicio (seccion 14 del pedido). El "ejecutado" y el "disponible" NUNCA se guardan aca -- se calculan en tiempo real sumando finanzas.movimientos_financieros (ver PresupuestosService), para que nunca queden desincronizados.

- **Tabla:** [[table--finanzas-presupuestos|finanzas.presupuestos]]
- **Columnas mapeadas:** 6

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** PresupuestosController, ReportesFinanzasController
- **Servicios:** PresupuestosService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/presupuesto.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-presupuestos|finanzas.presupuestos]]

## Referenciado por

- [[service--finanzas-presupuestos|PresupuestosService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
