---
id: screen--dashboard-finanzas-ordenes-pago
tipo: SCREEN
nombre: /dashboard/finanzas/ordenes-pago
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/ordenes-pago.
ruta: /dashboard/finanzas/ordenes-pago
capa: frontend
permisos: [finanzas:crear, finanzas:autorizar, finanzas:anular]
archivos:
  - frontend/src/app/dashboard/finanzas/ordenes-pago/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-parametros]
  - [uses, component--front-deposito]
  - [uses, component--front-finanzas]
terminos: [finanzas, ordenes, pago, crear, autorizar, anular]
---

# /dashboard/finanzas/ordenes-pago

Pantalla /dashboard/finanzas/ordenes-pago.

- **Ruta:** `/dashboard/finanzas/ordenes-pago`
- **Permisos referenciados:** `finanzas:crear`, `finanzas:autorizar`, `finanzas:anular`

## Archivos

- `frontend/src/app/dashboard/finanzas/ordenes-pago/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-parametros|parametros]]
- `uses` → [[component--front-deposito|deposito]]
- `uses` → [[component--front-finanzas|finanzas]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
