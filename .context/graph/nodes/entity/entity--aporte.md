---
id: entity--aporte
tipo: ENTITY
nombre: Aporte
nivel: L1
dominio: finanzas
resumen: Lo que un Socio Protector EFECTIVAMENTE pago -- nunca se ajusta automaticamente el AcuerdoAporte a partir de esto. Cada aporte impacta finanzas.movimientos_financieros como cualquier otro ingreso (movimientoFinancieroId), nunca un ledger paralelo.
tabla: finanzas.aportes
archivos:
  - backend/src/shared/entities/aporte.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-aportes]
terminos: [aporte, aportes, finanzas, estado, registrado, anulado]
---

# Aporte

Lo que un Socio Protector EFECTIVAMENTE pago -- nunca se ajusta automaticamente el AcuerdoAporte a partir de esto. Cada aporte impacta finanzas.movimientos_financieros como cualquier otro ingreso (movimientoFinancieroId), nunca un ledger paralelo.

- **Tabla:** [[table--finanzas-aportes|finanzas.aportes]]
- **Columnas mapeadas:** 23

## Estados y enumeraciones

- `EstadoAporte`: `REGISTRADO` · `ANULADO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** AportesController, DashboardFinanzasController, FacturasController, SociosProtectoresController
- **Servicios:** AportesService, DashboardFinanzasService, FacturasService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/aporte.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-aportes|finanzas.aportes]]

## Referenciado por

- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-facturas|FacturasService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
