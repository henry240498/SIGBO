---
id: screen--dashboard-finanzas-facturacion
tipo: SCREEN
nombre: /dashboard/finanzas/facturacion
nivel: L1
dominio: finanzas
resumen: Pantalla /dashboard/finanzas/facturacion.
ruta: /dashboard/finanzas/facturacion
capa: frontend
permisos: [finanzas:facturacion_crear, finanzas:facturacion_anular, finanzas:notas_credito_crear]
archivos:
  - frontend/src/app/dashboard/finanzas/facturacion/page.tsx
edges:
  - [belongs_to, domain--finanzas]
  - [uses, component--front-api]
  - [uses, component--front-finanzas]
  - [uses, component--front-socios-protectores]
  - [uses, component--front-parametros]
terminos: [finanzas, facturacion, crear, anular, notas, credito]
---

# /dashboard/finanzas/facturacion

Pantalla /dashboard/finanzas/facturacion.

- **Ruta:** `/dashboard/finanzas/facturacion`
- **Permisos referenciados:** `finanzas:facturacion_crear`, `finanzas:facturacion_anular`, `finanzas:notas_credito_crear`

## Archivos

- `frontend/src/app/dashboard/finanzas/facturacion/page.tsx`

## Relaciones

- `belongs_to` → [[domain--finanzas|Finanzas]]
- `uses` → [[component--front-api|api]]
- `uses` → [[component--front-finanzas|finanzas]]
- `uses` → [[component--front-socios-protectores|socios-protectores]]
- `uses` → [[component--front-parametros|parametros]]

---
<sub>Nodo derivado — generado por `build-graph.mjs`, no editar a mano.</sub>
