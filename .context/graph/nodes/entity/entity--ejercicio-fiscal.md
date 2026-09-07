---
id: entity--ejercicio-fiscal
tipo: ENTITY
nombre: EjercicioFiscal
nivel: L1
dominio: finanzas
resumen: "Periodo anual de Finanzas (seccion 15 del pedido): todo movimiento financiero pertenece a un ejercicio, nunca se mezclan entre anios."
tabla: finanzas.ejercicios_fiscales
archivos:
  - backend/src/shared/entities/ejercicio-fiscal.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-ejercicios-fiscales]
terminos: [ejercicio, fiscal, ejercicios, fiscales, finanzas, estado, abierto, cerrado]
---

# EjercicioFiscal

Periodo anual de Finanzas (seccion 15 del pedido): todo movimiento financiero pertenece a un ejercicio, nunca se mezclan entre anios.

- **Tabla:** [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]
- **Columnas mapeadas:** 6

## Estados y enumeraciones

- `EstadoEjercicioFiscal`: `ABIERTO` · `CERRADO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** EjerciciosFiscalesController
- **Servicios:** EjerciciosFiscalesService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/ejercicio-fiscal.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-ejercicios-fiscales|finanzas.ejercicios_fiscales]]

## Referenciado por

- [[service--finanzas-ejercicios-fiscales|EjerciciosFiscalesService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
