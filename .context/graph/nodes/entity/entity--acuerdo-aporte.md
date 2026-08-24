---
id: entity--acuerdo-aporte
tipo: ENTITY
nombre: AcuerdoAporte
nivel: L1
dominio: finanzas
resumen: Lo que un Socio Protector SE COMPROMETIO a aportar -- distinto de lo que efectivamente pago (finanzas.Aporte). Se separa porque las condiciones cambian con el tiempo sin que eso deba reescribir el historial de pagos ya realizados.
tabla: finanzas.acuerdos_aporte
archivos:
  - backend/src/shared/entities/acuerdo-aporte.entity.ts
edges:
  - [belongs_to, domain--finanzas]
  - [persisted_in, table--finanzas-acuerdos-aporte]
terminos: [acuerdo, aporte, acuerdos, finanzas, estado, activo, finalizado, suspendido, cancelado]
---

# AcuerdoAporte

Lo que un Socio Protector SE COMPROMETIO a aportar -- distinto de lo que efectivamente pago (finanzas.Aporte). Se separa porque las condiciones cambian con el tiempo sin que eso deba reescribir el historial de pagos ya realizados.

- **Tabla:** [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]
- **Columnas mapeadas:** 12

## Estados y enumeraciones

- `EstadoAcuerdoAporte`: `ACTIVO` · `FINALIZADO` · `SUSPENDIDO` · `CANCELADO`

## Donde se usa

- **Pantallas:** `/dashboard/finanzas`, `/dashboard/finanzas/beneficios`, `/dashboard/finanzas/cajas`, `/dashboard/finanzas/cuentas-bancarias`, `/dashboard/finanzas/cuotas`, `/dashboard/finanzas/ejercicios-fiscales`, `/dashboard/finanzas/facturacion`, `/dashboard/finanzas/movimientos`, `/dashboard/finanzas/movimientos-bancarios`, `/dashboard/finanzas/ordenes-pago`, `/dashboard/finanzas/presupuesto`, `/dashboard/finanzas/socios-protectores`, `/dashboard/finanzas/socios-protectores/[id]`
- **Endpoints:** AcuerdosAporteController, AportesController, DashboardFinanzasController, SociosProtectoresController
- **Servicios:** AcuerdosAporteService, AportesService, DashboardFinanzasService, SociosProtectoresService

<sub>Camino derivado: TABLE ← reads ← SERVICE ← exposes ← API ← calls ← SCREEN.
Una llamada con la ruta armada en una variable no se detecta — ver rule--el-grafo-no-es-la-verdad.</sub>

## Archivos

- `backend/src/shared/entities/acuerdo-aporte.entity.ts`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `persisted_in` → [[table--finanzas-acuerdos-aporte|finanzas.acuerdos_aporte]]

## Referenciado por

- [[service--finanzas-acuerdos-aporte|AcuerdosAporteService]] `uses` →
- [[service--finanzas-aportes|AportesService]] `uses` →
- [[service--finanzas-dashboard-finanzas|DashboardFinanzasService]] `uses` →
- [[service--finanzas-socios-protectores|SociosProtectoresService]] `uses` →

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
